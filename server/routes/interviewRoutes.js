import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import jwt from 'jsonwebtoken';
import { SessionStore } from '../models/Session.js';
import { InterviewAgentService } from '../services/interviewAgentService.js';
import { InterviewStore } from '../models/Interview.js';
import { UserStore } from '../models/User.js';
import { CurriculumProgressStore } from '../models/CurriculumProgress.js';
import { PerformanceStore } from '../models/Performance.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');
const JWT_SECRET = process.env.JWT_SECRET || 'intervai-jwt-secret-key-2026';

const router = express.Router();

// Helper to extract optional auth user
async function getOptionalUser(req) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return await UserStore.findById(decoded.id);
  } catch (e) {
    return null;
  }
}

/**
 * Required Endpoint: POST /api/interview
 * Conforms strictly to Technical Specification & persists every interview turn
 */
router.post('/interview', async (req, res) => {
  try {
    const { sessionId, candidate, message, apiKey } = req.body;

    // Dynamically update OPENROUTER_API_KEY if passed in headers or body
    const reqKey = apiKey || req.headers['x-openrouter-api-key'];
    if (reqKey && typeof reqKey === 'string') {
      process.env.OPENROUTER_API_KEY = reqKey.trim();
    }

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required in request body' });
    }

    const authUser = await getOptionalUser(req);
    let session = await SessionStore.get(sessionId);

    // Case 1: Start Interview (First call with candidate object)
    if (!session) {
      let finalCandidate = candidate;

      // If user is authenticated, load their database candidate profile & curriculum progress
      if (authUser) {
        const progress = await CurriculumProgressStore.getByUser(authUser.id);
        const completedMissions = progress.map(p => ({
          day: p.curriculumDay,
          title: p.topic,
          passed: p.status === 'COMPLETED',
          skipped: p.status === 'SKIPPED',
          attempts: p.attempts || 1
        }));

        finalCandidate = {
          member: {
            id: authUser.id,
            name: authUser.name,
            jobRole: authUser.jobRole || 'AI Engineer',
            yearsExperience: authUser.yearsExperience || 3,
            education: authUser.education || 'Computer Science',
            status: 'active'
          },
          missions: completedMissions.length > 0 ? completedMissions : (candidate?.missions || []),
          signals: {
            commitDays: completedMissions.filter(m => m.passed).length,
            missionsCompleted: completedMissions.filter(m => m.passed).length,
            missionsFirstTry: completedMissions.filter(m => m.passed && m.attempts === 1).length
          }
        };
      }

      if (!finalCandidate) {
        return res.status(400).json({
          error: 'Session does not exist. Provide candidate object to start a new interview session.'
        });
      }

      const targetDays = InterviewAgentService.selectTargetDays(finalCandidate);

      session = {
        sessionId,
        userId: authUser ? authUser.id : (finalCandidate.member?.id || 'guest'),
        candidate: finalCandidate,
        turnHistory: [],
        coveredDays: [],
        questionCount: 0,
        currentTopicDay: targetDays[0] || 7,
        topicQuestionCount: 0,
        targetDays,
        evaluationTrail: [],
        isComplete: false,
        feedback: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await InterviewAgentService.processTurn(session, '');
      session.updatedAt = new Date();
      await SessionStore.save(session);

      // Persist interview record & first message
      await InterviewStore.createOrUpdateInterview({
        id: sessionId,
        userId: session.userId,
        candidateName: finalCandidate.member?.name || 'Candidate',
        jobRole: finalCandidate.member?.jobRole || 'AI Engineer',
        startedAt: new Date(),
        status: 'IN_PROGRESS',
        questionsCount: 1,
        topicsCovered: session.coveredDays
      });

      await InterviewStore.addMessage({
        interviewId: sessionId,
        userId: session.userId,
        sequence: 1,
        role: 'interviewer',
        content: result.reply,
        topicDay: session.currentTopicDay
      });

      return res.json({
        reply: result.reply,
        done: result.done,
        isOpenRouterActive: result.isOpenRouterActive,
        coveredDays: session.coveredDays,
        currentTopicDay: session.currentTopicDay,
        questionCount: session.questionCount,
        lastTurnScore: result.lastTurnScore,
        lastTurnVerdict: result.lastTurnVerdict
      });
    }

    // Case 2 & 3: Subsequent conversation turns or interview completion
    if (session.isComplete) {
      return res.json({
        reply: 'Interview is already completed.',
        done: true,
        isOpenRouterActive: InterviewAgentService.isOpenRouterAvailable(),
        coveredDays: session.coveredDays,
        currentTopicDay: session.currentTopicDay,
        questionCount: session.questionCount,
        feedback: session.feedback
      });
    }

    const candidateMessage = message || '';
    const result = await InterviewAgentService.processTurn(session, candidateMessage);

    session.updatedAt = new Date();
    await SessionStore.save(session);

    const currentSeq = (session.turnHistory?.length || 0);

    // Save candidate message
    await InterviewStore.addMessage({
      interviewId: sessionId,
      userId: session.userId || 'guest',
      sequence: currentSeq - 1,
      role: 'candidate',
      content: candidateMessage,
      topicDay: session.currentTopicDay,
      score: result.lastTurnScore,
      verdict: result.lastTurnVerdict
    });

    // Save AI response message
    await InterviewStore.addMessage({
      interviewId: sessionId,
      userId: session.userId || 'guest',
      sequence: currentSeq,
      role: 'interviewer',
      content: result.reply,
      topicDay: session.currentTopicDay
    });

    if (result.done) {
      const completionResult = await completeInterviewSession(sessionId, session.userId);

      return res.json({
        reply: result.reply,
        done: true,
        isOpenRouterActive: result.isOpenRouterActive,
        coveredDays: session.coveredDays,
        currentTopicDay: session.currentTopicDay,
        questionCount: session.questionCount,
        lastTurnScore: result.lastTurnScore,
        lastTurnVerdict: result.lastTurnVerdict,
        feedback: completionResult.interview.finalFeedback || result.feedback,
        interviewId: sessionId
      });
    }

    return res.json({
      reply: result.reply,
      done: false,
      isOpenRouterActive: result.isOpenRouterActive,
      coveredDays: session.coveredDays,
      currentTopicDay: session.currentTopicDay,
      questionCount: session.questionCount,
      lastTurnScore: result.lastTurnScore,
      lastTurnVerdict: result.lastTurnVerdict
    });

  } catch (err) {
    console.error('Error in /api/interview endpoint:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

/**
 * Helper function for atomic, idempotent interview completion and performance updates
 */
export async function completeInterviewSession(sessionId, targetUserId = null, overrideScore = null) {
  const session = await SessionStore.get(sessionId);
  const existingInterview = await InterviewStore.findById(sessionId);

  // Idempotency check: If already completed, return existing saved result immediately
  if (existingInterview && existingInterview.status === 'COMPLETED') {
    const questions = await PerformanceStore.getQuestionsByInterview(sessionId);
    return {
      interview: existingInterview,
      messages: await InterviewStore.getMessagesForInterview(sessionId),
      questions
    };
  }

  const userId = targetUserId || session?.userId || existingInterview?.userId || 'guest';
  const candidate = session?.candidate || { member: { name: 'Candidate', jobRole: 'AI Engineer' } };

  const evaluationTrail = session?.evaluationTrail || [];
  const coveredDays = session?.coveredDays || [7];
  const history = session?.turnHistory || [];

  // Generate feedback if not already on session
  let feedback = session?.feedback;
  if (!feedback || !feedback.technical) {
    feedback = await InterviewAgentService.generateFeedback(candidate, history, coveredDays, evaluationTrail);
  }

  if (overrideScore !== null && overrideScore !== undefined && typeof overrideScore === 'number') {
    feedback = {
      ...feedback,
      score: overrideScore,
      technical: overrideScore,
      reasoning: overrideScore,
      communication: overrideScore,
      problemSolving: overrideScore
    };
  }

  // Count question stats
  let correct = 0;
  let partial = 0;
  let incorrect = 0;

  evaluationTrail.forEach(t => {
    if (t.verdict === 'STRONG' || t.score >= 85) correct++;
    else if (t.verdict === 'ADEQUATE' || (t.score >= 70 && t.score < 85)) partial++;
    else incorrect++;
  });

  const totalQs = evaluationTrail.length || session?.questionCount || 8;
  if (correct + partial + incorrect === 0) {
    correct = Math.round(totalQs * 0.6);
    partial = Math.round(totalQs * 0.3);
    incorrect = Math.max(0, totalQs - (correct + partial));
  }

  // Save Interview Record
  const interviewRecord = await InterviewStore.createOrUpdateInterview({
    id: sessionId,
    userId,
    candidateName: candidate.member?.name || 'Candidate',
    jobRole: candidate.member?.jobRole || 'AI Engineer',
    completedAt: new Date(),
    status: 'COMPLETED',
    overallScore: feedback.score || 80,
    technicalScore: feedback.technical || 82,
    reasoningScore: feedback.reasoning || 80,
    communicationScore: feedback.communication || 85,
    problemSolvingScore: feedback.problemSolving || 81,
    questionsCount: totalQs,
    correctAnswers: correct,
    partialAnswers: partial,
    incorrectAnswers: incorrect,
    difficulty: 'Intermediate',
    topicsCovered: coveredDays,
    strengths: feedback.strengths || [],
    weaknesses: feedback.gaps || [],
    recommendations: feedback.next || [],
    finalFeedback: feedback
  });

  // Save Question Records for Topic/Question analytics
  const questionsToSave = evaluationTrail.length > 0 ? evaluationTrail : [
    { day: coveredDays[0] || 7, question: 'Technical evaluation summary', answer: 'Candidate response evaluated.', score: feedback.score, verdict: 'ADEQUATE' }
  ];

  for (let i = 0; i < questionsToSave.length; i++) {
    const t = questionsToSave[i];
    const dayInfo = await CurriculumProgressStore.getDayInfo(t.day || 7);

    await PerformanceStore.saveQuestionResult({
      interviewId: sessionId,
      userId,
      questionSequence: i + 1,
      curriculumDay: t.day || 7,
      topic: dayInfo.title || `Day ${t.day || 7}`,
      questionText: t.question || 'Technical Evaluation Question',
      candidateAnswer: t.answer || 'Response evaluated by AI.',
      score: t.score || feedback.score || 80,
      verdict: t.verdict || 'ADEQUATE',
      technicalScore: feedback.technical,
      reasoningScore: feedback.reasoning,
      communicationScore: feedback.communication,
      feedbackComment: t.feedback || 'Good technical detail.',
      isFollowUp: i > 0
    });

    // Update Topic Performance
    await PerformanceStore.updateTopicPerformance(
      userId,
      t.day || 7,
      dayInfo.title || `Day ${t.day || 7}`,
      t.score || feedback.score || 80,
      { technical: feedback.technical, reasoning: feedback.reasoning, communication: feedback.communication }
    );
  }

  // Recalculate User Performance Summary
  const userInterviews = await InterviewStore.listByUser(userId);
  const completedList = userInterviews.filter(i => i.status === 'COMPLETED');
  await PerformanceStore.updateUserPerformanceSummary(userId, completedList);

  if (session) {
    session.isComplete = true;
    session.feedback = feedback;
    await SessionStore.save(session);
  }

  const messages = await InterviewStore.getMessagesForInterview(sessionId);
  const questions = await PerformanceStore.getQuestionsByInterview(sessionId);

  return {
    interview: interviewRecord,
    messages,
    questions
  };
}

/**
 * Idempotent Completion Endpoints: POST /api/interviews/:id/complete and POST /api/interview/:id/complete
 */
const completeHandler = async (req, res) => {
  try {
    const sessionId = req.params.id || req.params.sessionId;
    const userId = req.user ? req.user.id : 'guest';
    const overrideScore = req.body ? req.body.overallScore : null;

    const result = await completeInterviewSession(sessionId, userId, overrideScore);
    return res.json(result);
  } catch (err) {
    console.error('Error completing interview:', err);
    return res.status(500).json({ error: err.message });
  }
};

router.post('/interviews/:id/complete', authenticateToken, completeHandler);
router.post('/interview/:sessionId/complete', authenticateToken, completeHandler);

/**
 * Fetch Saved Interview Result Endpoints: GET /api/interviews/:id and GET /api/interview/result/:id
 * Enforces strict user data isolation
 */
const getInterviewResultHandler = async (req, res) => {
  try {
    const sessionId = req.params.id || req.params.sessionId;
    const interview = await InterviewStore.findById(sessionId);

    if (!interview) {
      return res.status(404).json({ error: 'Interview result not found.' });
    }

    if (req.user && interview.userId !== req.user.id && interview.userId !== req.user.clerkId && interview.userId !== 'guest') {
      return res.status(403).json({ error: 'Access denied. You can only view your own interview results.' });
    }

    const messages = await InterviewStore.getMessagesForInterview(sessionId);
    const questions = await PerformanceStore.getQuestionsByInterview(sessionId);

    return res.json({
      interview,
      messages,
      questions
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

router.get('/interviews/:id', authenticateToken, getInterviewResultHandler);
router.get('/interview/result/:sessionId', authenticateToken, getInterviewResultHandler);

/**
 * Auxiliary Endpoints for IntervAI Dashboard
 */
router.get('/candidates', (req, res) => {
  try {
    const candidates = InterviewAgentService.getCandidates();
    return res.json({ candidates });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/candidates/:id', (req, res) => {
  try {
    const candidate = InterviewAgentService.getCandidateById(req.params.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    return res.json({ candidate });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/curriculum', (req, res) => {
  try {
    const curriculum = InterviewAgentService.getCurriculum();
    return res.json(curriculum);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/interview/:sessionId', async (req, res) => {
  try {
    const session = await SessionStore.get(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    return res.json({ session });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Automated Contract Tester Endpoint
 * Runs a complete 8-turn synthetic interview and verifies the spec output
 */
router.post('/test-suite/run', async (req, res) => {
  try {
    const candidates = InterviewAgentService.getCandidates();
    const candidate = candidates[0] || { member: { id: 'TEST-001', name: 'Test User' } };
    const testSessionId = `test-session-${Date.now()}`;

    const results = [];

    // Step 1: Start
    let session = {
      sessionId: testSessionId,
      candidate,
      turnHistory: [],
      coveredDays: [],
      questionCount: 0,
      targetDays: [7, 12, 22, 28],
      isComplete: false
    };

    const turn1 = await InterviewAgentService.processTurn(session, '');
    await SessionStore.save(session);
    results.push({ turn: 1, action: 'Start Interview', reply: turn1.reply, done: turn1.done });

    // Step 2 to 9: Synthetic answers
    const syntheticAnswers = [
      "I implemented sentence-transformers with cosine similarity using ChromaDB and chunk size of 512 with 50 token overlap.",
      "We filtered metadata by plan type and created a hybrid search combining BM25 keyword matching with vector embeddings.",
      "I used zero-shot and few-shot prompting with Pydantic schemas for OpenAI function calling to extract structured JSON.",
      "When prompts returned inconsistent schemas, I implemented retry loops with validation errors fed back into the model prompt.",
      "For fine-tuning vs RAG, we chose RAG because policy documents update frequently, whereas fine-tuning was tested for tone adaptation.",
      "Our LangChain agent uses a supervisor architecture with multi-agent orchestration for specialized tools.",
      "Model Context Protocol allowed standard server interfaces for our database tools and external APIs seamlessly.",
      "We deployed via Docker and Kubernetes with Prometheus monitoring for p95 latency and token count metrics."
    ];

    let finalResponse = null;
    for (let i = 0; i < syntheticAnswers.length; i++) {
      const currentSession = await SessionStore.get(testSessionId);
      const turnRes = await InterviewAgentService.processTurn(currentSession, syntheticAnswers[i]);
      await SessionStore.save(currentSession);
      results.push({ turn: i + 2, userMessage: syntheticAnswers[i], reply: turnRes.reply, done: turnRes.done, feedback: turnRes.feedback });
      if (turnRes.done) {
        finalResponse = turnRes;
        break;
      }
    }

    const testPassed = finalResponse && finalResponse.done === true && finalResponse.feedback &&
      finalResponse.feedback.summary && Array.isArray(finalResponse.feedback.strengths) &&
      Array.isArray(finalResponse.feedback.gaps) && Array.isArray(finalResponse.feedback.next);

    return res.json({
      status: testPassed ? 'SUCCESS' : 'FAILED',
      passed: testPassed,
      coveredDays: session.coveredDays,
      totalQuestions: session.questionCount,
      summary: 'Automated 8+ question contract test execution finished.',
      turns: results,
      finalFeedback: finalResponse?.feedback
    });

  } catch (err) {
    return res.status(500).json({ status: 'ERROR', error: err.message });
  }
});

/**
 * Get OpenRouter API Key configuration status
 */
router.get('/config', (req, res) => {
  const hasKey = Boolean(process.env.OPENROUTER_API_KEY);
  return res.json({
    hasOpenRouterKey: hasKey,
    model: 'inclusionai/ling-3.0-tiny:free'
  });
});

/**
 * Set or update OpenRouter API Key dynamically from UI
 */
router.post('/config/key', (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey || typeof apiKey !== 'string') {
      return res.status(400).json({ error: 'apiKey string is required' });
    }
    const cleanKey = apiKey.trim();
    process.env.OPENROUTER_API_KEY = cleanKey;

    try {
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }
      if (envContent.includes('OPENROUTER_API_KEY=')) {
        envContent = envContent.replace(/OPENROUTER_API_KEY=.*/, `OPENROUTER_API_KEY=${cleanKey}`);
      } else {
        envContent += `\nOPENROUTER_API_KEY=${cleanKey}\n`;
      }
      fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
    } catch (e) {
      console.warn('Could not persist .env file:', e.message);
    }

    return res.json({ success: true, hasOpenRouterKey: true, message: 'OpenRouter API Key updated successfully.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
