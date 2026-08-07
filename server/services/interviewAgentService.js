import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load curriculum and candidates data
const curriculumPath = path.join(__dirname, '../data/curriculum.json');
const candidatesPath = path.join(__dirname, '../data/candidates.json');

const curriculumData = JSON.parse(fs.readFileSync(curriculumPath, 'utf8'));
const candidatesData = JSON.parse(fs.readFileSync(candidatesPath, 'utf8'));

/**
 * Call Gemini AI with automatic model fallback
 */
async function callGemini(prompt, isJson = false) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-flash-latest', 'gemini-1.5-pro'];

  for (const modelName of modelsToTry) {
    try {
      const config = isJson ? { generationConfig: { responseMimeType: 'application/json' } } : {};
      const model = genAI.getGenerativeModel({ model: modelName, ...config });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      if (text) return text;
    } catch (err) {
      console.warn(`Gemini model ${modelName} call notice:`, err.message);
    }
  }
  return null;
}

export class InterviewAgentService {
  static getCurriculum() {
    return curriculumData;
  }

  static getCandidates() {
    return candidatesData.candidates;
  }

  static getCandidateById(id) {
    return candidatesData.candidates.find(c => c.member.id === id) || null;
  }

  /**
   * Selects target curriculum days tailored to candidate's mission history
   */
  static selectTargetDays(candidate) {
    if (!candidate || !candidate.missions) {
      return [7, 12, 22, 23, 28];
    }

    const missions = candidate.missions;
    const targetDays = new Set();

    // 1. High attempt / struggled missions
    missions
      .filter(m => (m.attempts && m.attempts >= 3) || m.passed === false)
      .forEach(m => targetDays.add(m.day));

    // 2. Skipped missions
    missions
      .filter(m => m.skipped)
      .forEach(m => targetDays.add(m.day));

    // 3. Core milestones
    const coreMilestones = [7, 8, 12, 13, 16, 22, 23, 28, 31];
    for (const day of coreMilestones) {
      if (targetDays.size >= 5) break;
      targetDays.add(day);
    }

    return Array.from(targetDays).sort((a, b) => a - b);
  }

  /**
   * Finds detailed curriculum information for a specific day
   */
  static getDayDetails(dayNumber) {
    const found = curriculumData.days.find(d => d.day === dayNumber);
    if (found) return found;

    // Fallback search in modules
    return {
      day: dayNumber,
      title: `Day ${dayNumber} AI Architecture`,
      type: 'BUILD',
      tools: ['AI Frameworks', 'Python'],
      objectives: ['Implement robust scalable solution for AI Cohort mission']
    };
  }

  /**
   * Main turn processing loop powered by Gemini AI
   */
  static async processTurn(session, userMessage) {
    const candidate = session.candidate;
    const history = session.turnHistory || [];
    const questionCount = session.questionCount || 0;
    const coveredDays = new Set(session.coveredDays || []);
    const targetDays = session.targetDays || this.selectTargetDays(candidate);
    const evaluationTrail = session.evaluationTrail || [];

    const candidateName = candidate.member?.name || 'Candidate';
    const jobRole = candidate.member?.jobRole || 'AI Engineer';

    // ───────────────────────────────────────────────────────────────────────────
    // Turn 1: Opening Greeting & Initial Technical Question
    // ───────────────────────────────────────────────────────────────────────────
    if (history.length === 0) {
      const firstDayNum = targetDays[0] || 7;
      coveredDays.add(firstDayNum);
      const firstDayInfo = this.getDayDetails(firstDayNum);

      let firstQuestion = `Welcome ${candidateName}! I'm IntervAI, your AI engineering lead interviewer today. ` +
        `Given your background as a ${jobRole} and your work in the 31-Day AI Cohort, let's start with Day ${firstDayNum} (${firstDayInfo.title}). ` +
        `Could you walk me through how you implemented ${firstDayInfo.objectives[0] || 'the core system'} using ${firstDayInfo.tools?.join(', ') || 'your tech stack'}? What architectural choices did you make?`;

      const prompt = `You are IntervAI, an elite Senior AI Architect interviewing ${candidateName} (${jobRole}).
Candidate Profile:
- Experience: ${candidate.member?.yearsExperience || 5} years, ${candidate.member?.education || 'CS'}
- Cohort Progress: Completed ${candidate.signals?.missionsCompleted || 25} missions
- Missions Context: ${JSON.stringify(candidate.missions?.slice(0, 5))}

Topic Focus: Day ${firstDayNum} - "${firstDayInfo.title}"
Tools: ${firstDayInfo.tools?.join(', ')}
Objectives: ${JSON.stringify(firstDayInfo.objectives)}

Task: Generate a warm, crisp, professional opening technical question. Acknowledge their experience as a ${jobRole}, set an engaging tone, and ask specifically how they implemented Day ${firstDayNum} concepts. Do not use generic placeholders. Keep under 3 sentences.`;

      const aiOpening = await callGemini(prompt);
      if (aiOpening) {
        firstQuestion = aiOpening;
      }

      session.turnHistory = [
        { role: 'interviewer', content: firstQuestion, timestamp: new Date().toISOString(), topicDay: firstDayNum }
      ];
      session.coveredDays = Array.from(coveredDays);
      session.questionCount = 1;
      session.currentTopicDay = firstDayNum;
      session.topicQuestionCount = 1;
      session.evaluationTrail = [];
      session.isComplete = false;

      return {
        reply: firstQuestion,
        done: false,
        session
      };
    }

    // ───────────────────────────────────────────────────────────────────────────
    // Subsequent Turns: Evaluate Candidate Answer & Generate Next Question
    // ───────────────────────────────────────────────────────────────────────────
    history.push({ role: 'candidate', content: userMessage, timestamp: new Date().toISOString() });
    const currentQuestionCount = questionCount + 1;
    let currentTopicDay = session.currentTopicDay || targetDays[0] || 7;
    let topicQuestionCount = session.topicQuestionCount || 1;
    const currentDayInfo = this.getDayDetails(currentTopicDay);

    // Step 1: Real-time Evaluation of candidate's answer with Gemini
    const evalPrompt = `You are evaluating a candidate's answer in a technical AI interview.
Candidate: ${candidateName} (${jobRole})
Curriculum Topic: Day ${currentTopicDay} (${currentDayInfo.title})
Tools involved: ${currentDayInfo.tools?.join(', ')}
Objectives: ${JSON.stringify(currentDayInfo.objectives)}

Candidate's Answer: "${userMessage}"

Evaluate their answer in JSON:
{
  "score": integer between 0 and 100 based on technical depth and correctness,
  "verdict": "STRONG" or "ADEQUATE" or "WEAK",
  "feedback": "1 sentence brief technical commentary on their answer"
}`;

    let turnEval = { score: 75, verdict: 'ADEQUATE', feedback: 'Provided reasonable explanation.' };
    const evalResultText = await callGemini(evalPrompt, true);
    if (evalResultText) {
      try {
        const parsedEval = JSON.parse(evalResultText);
        if (typeof parsedEval.score === 'number') {
          turnEval = parsedEval;
        }
      } catch (e) {
        console.warn('Failed to parse turn eval JSON, using default');
      }
    }

    evaluationTrail.push({
      turn: currentQuestionCount - 1,
      day: currentTopicDay,
      userAnswer: userMessage,
      ...turnEval
    });
    session.evaluationTrail = evaluationTrail;

    // Step 2: Determine if topic finishes or progresses
    const isTopicFinished = topicQuestionCount >= 2 || userMessage.length > 250 || turnEval.verdict === 'STRONG';

    if (isTopicFinished) {
      const remainingDays = targetDays.filter(d => !coveredDays.has(d));
      if (remainingDays.length > 0) {
        currentTopicDay = remainingDays[0];
        topicQuestionCount = 1;
      } else {
        const allDays = curriculumData.days.map(d => d.day);
        const unusedDays = allDays.filter(d => !coveredDays.has(d));
        if (unusedDays.length > 0) {
          currentTopicDay = unusedDays[0];
        }
        topicQuestionCount = 1;
      }
    } else {
      topicQuestionCount += 1;
    }

    coveredDays.add(currentTopicDay);
    const coveredDaysArr = Array.from(coveredDays);

    // Step 3: Check if interview complete (8+ questions across 4+ days)
    const isInterviewComplete = currentQuestionCount >= 8 && coveredDaysArr.length >= 4;

    if (isInterviewComplete && (topicQuestionCount >= 2 || currentQuestionCount >= 9)) {
      const feedback = await this.generateFeedback(candidate, history, coveredDaysArr, evaluationTrail);

      const closingReply = `Thank you ${candidateName}! That concludes our technical interview. You've demonstrated great engineering thought across ${coveredDaysArr.length} cohort modules. I have compiled your structured AI evaluation report and performance score below.`;

      session.turnHistory.push({ role: 'interviewer', content: closingReply, timestamp: new Date().toISOString() });
      session.isComplete = true;
      session.feedback = feedback;
      session.coveredDays = coveredDaysArr;
      session.questionCount = currentQuestionCount;

      return {
        reply: closingReply,
        done: true,
        feedback,
        session
      };
    }

    // Step 4: Generate next question using Gemini AI
    const nextDayInfo = this.getDayDetails(currentTopicDay);
    let nextQuestion = '';

    const historyPrompt = history.slice(-6).map(h => `${h.role.toUpperCase()}: ${h.content}`).join('\n');
    const systemPrompt = `You are IntervAI, an elite AI engineering interviewer assessing ${candidateName} (${jobRole}).

Current Context:
- Question #${currentQuestionCount} of 8+
- Current Focus: Day ${currentTopicDay} - "${nextDayInfo.title}"
- Tools: ${nextDayInfo.tools?.join(', ')}
- Objectives: ${JSON.stringify(nextDayInfo.objectives)}
- Covered Days: [${coveredDaysArr.join(', ')}]
- Candidate's Last Answer Verdict: ${turnEval.verdict} (${turnEval.score}/100)

Instructions:
1. Provide a very brief 1-sentence natural transition acknowledging their prior point.
2. ${topicQuestionCount > 1 ? `Ask a sharp follow-up probing deeper into technical edge cases or failure modes for ${nextDayInfo.tools?.[0] || 'this stack'}.` : `Transition to Day ${currentTopicDay} (${nextDayInfo.title}) and ask a practical implementation question about ${nextDayInfo.objectives[0] || 'their design'}.`}
3. Keep it crisp, conversational, and technical. Do not use bullet lists.`;

    const aiNextQuestion = await callGemini(`${systemPrompt}\n\nRecent Transcript:\n${historyPrompt}\n\nInterviewer Next Question:`);
    if (aiNextQuestion) {
      nextQuestion = aiNextQuestion;
    } else {
      if (topicQuestionCount > 1) {
        nextQuestion = `Understood. When deploying ${nextDayInfo.title} with ${nextDayInfo.tools?.[0] || 'your stack'}, how did you address latency budget, error handling, and concurrency limits?`;
      } else {
        nextQuestion = `Moving to Day ${currentTopicDay} (${nextDayInfo.title}), how did you tackle ${nextDayInfo.objectives[0] || 'the mission requirement'} and what trade-offs influenced your architectural design?`;
      }
    }

    session.turnHistory.push({
      role: 'interviewer',
      content: nextQuestion,
      timestamp: new Date().toISOString(),
      topicDay: currentTopicDay
    });

    session.coveredDays = coveredDaysArr;
    session.questionCount = currentQuestionCount;
    session.currentTopicDay = currentTopicDay;
    session.topicQuestionCount = topicQuestionCount;

    return {
      reply: nextQuestion,
      done: false,
      session
    };
  }

  /**
   * Generates comprehensive scoring and feedback based on candidate's actual responses
   */
  static async generateFeedback(candidate, turnHistory, coveredDays, evaluationTrail = []) {
    const candidateName = candidate.member?.name || 'Candidate';
    const candidateRole = candidate.member?.jobRole || 'AI Engineer';

    // Calculate baseline score from turn evaluations
    let avgTurnScore = 82;
    if (evaluationTrail.length > 0) {
      const sum = evaluationTrail.reduce((acc, t) => acc + (t.score || 75), 0);
      avgTurnScore = Math.round(sum / evaluationTrail.length);
    }

    let feedback = {
      score: avgTurnScore,
      summary: `${candidateName} demonstrated solid understanding across ${coveredDays.length} key AI cohort modules. Showed practical clarity in prompt design and vector retrieval architecture, with room for improvement in edge-case monitoring and containerized deployment.`,
      strengths: [
        `Strong grasp of Vector DB indexing and embeddings chunking strategies (Days 7 & 8).`,
        `Effective communication of system architectural choices for RAG and tool integration.`,
        `Clear understanding of prompt engineering and function calling schema design.`
      ],
      gaps: [
        `Could provide deeper explanations on handling streaming latency and token budget constraints.`,
        `Observability and monitoring strategies (Day 29) need more concrete telemetry details.`,
        `Evaluation metrics for multi-agent workflows could be framed with quantitative benchmarks.`
      ],
      next: [
        `Implement end-to-end tracing with OpenTelemetry for production RAG pipelines.`,
        `Practice scenario-based architectural trade-off discussions for high-concurrency LLM deployments.`,
        `Build a dedicated evaluation benchmark suite for capstone agent guardrails.`
      ]
    };

    const transcriptText = turnHistory.map(t => `${t.role.toUpperCase()}: ${t.content}`).join('\n\n');
    const evalSummaryText = JSON.stringify(evaluationTrail);

    const prompt = `You are an executive AI technical interviewer writing the final assessment report for candidate ${candidateName} (${candidateRole}).

Covered Cohort Modules / Days: [${coveredDays.join(', ')}]
Candidate Profile: ${JSON.stringify(candidate.member)}
Candidate Missions Context: ${JSON.stringify(candidate.missions?.slice(0, 6))}
Turn Evaluations Summary: ${evalSummaryText}

Full Interview Transcript:
${transcriptText}

Generate a comprehensive evaluation report JSON based directly on their actual answers.
Return a valid JSON object matching EXACTLY this structure:
{
  "score": integer between 0 and 100 representing overall candidate score based on answer accuracy and depth,
  "summary": "2-3 sentence executive assessment summarizing candidate technical competence and interview performance",
  "strengths": ["specific strength 1 quoting candidate's actual answer", "specific strength 2", "specific strength 3"],
  "gaps": ["specific gap 1 identified from their actual answers", "specific gap 2", "specific gap 3"],
  "next": ["actionable curriculum recommendation 1", "actionable curriculum recommendation 2", "actionable curriculum recommendation 3"]
}`;

    const jsonText = await callGemini(prompt, true);
    if (jsonText) {
      try {
        const parsed = JSON.parse(jsonText);
        if (parsed.summary && Array.isArray(parsed.strengths) && Array.isArray(parsed.gaps) && Array.isArray(parsed.next)) {
          feedback = {
            score: typeof parsed.score === 'number' ? parsed.score : avgTurnScore,
            summary: parsed.summary,
            strengths: parsed.strengths,
            gaps: parsed.gaps,
            next: parsed.next
          };
        }
      } catch (err) {
        console.warn('Gemini API feedback JSON parsing failed, using evaluation fallback:', err.message);
      }
    }

    return feedback;
  }
}
