import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { SessionStore } from '../models/Session.js';
import { InterviewAgentService } from '../services/interviewAgentService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');

const router = express.Router();

/**
 * Required Endpoint: POST /api/interview
 * Conforms strictly to Technical Specification
 */
router.post('/interview', async (req, res) => {
  try {
    const { sessionId, candidate, message, apiKey } = req.body;

    // Dynamically update GEMINI_API_KEY if passed in headers or body
    const reqKey = apiKey || req.headers['x-gemini-api-key'];
    if (reqKey && typeof reqKey === 'string' && reqKey.trim()) {
      process.env.GEMINI_API_KEY = reqKey.trim();
    }

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required in request body' });
    }

    let session = await SessionStore.get(sessionId);

    // Case 1: Start Interview (First call with candidate object)
    if (!session) {
      if (!candidate) {
        return res.status(400).json({
          error: 'Session does not exist. Provide candidate object to start a new interview session.'
        });
      }

      const targetDays = InterviewAgentService.selectTargetDays(candidate);

      session = {
        sessionId,
        candidate,
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

      return res.json({
        reply: result.reply,
        done: result.done,
        isGeminiActive: result.isGeminiActive,
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
        isGeminiActive: InterviewAgentService.isGeminiAvailable(),
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

    if (result.done) {
      return res.json({
        reply: result.reply,
        done: true,
        isGeminiActive: result.isGeminiActive,
        coveredDays: session.coveredDays,
        currentTopicDay: session.currentTopicDay,
        questionCount: session.questionCount,
        lastTurnScore: result.lastTurnScore,
        lastTurnVerdict: result.lastTurnVerdict,
        feedback: result.feedback
      });
    }

    return res.json({
      reply: result.reply,
      done: false,
      isGeminiActive: result.isGeminiActive,
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
 * Get Gemini API Key configuration status
 */
router.get('/config', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  return res.json({
    hasGeminiKey: hasKey,
    model: 'gemini-2.0-flash'
  });
});

/**
 * Set or update Gemini API Key dynamically from UI
 */
router.post('/config/key', (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey || typeof apiKey !== 'string') {
      return res.status(400).json({ error: 'apiKey string is required' });
    }
    const cleanKey = apiKey.trim();
    process.env.GEMINI_API_KEY = cleanKey;

    try {
      const envContent = `PORT=${process.env.PORT || 5000}\nGEMINI_API_KEY=${cleanKey}\n`;
      fs.writeFileSync(envPath, envContent, 'utf8');
    } catch (e) {
      console.warn('Could not persist .env file:', e.message);
    }

    return res.json({ success: true, hasGeminiKey: true, message: 'Gemini API Key updated successfully.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
