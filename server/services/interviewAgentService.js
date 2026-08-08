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
 * Clean markdown formatting from JSON model outputs
 */
function cleanJsonString(text) {
  if (!text) return '';
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  cleaned = cleaned.trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

/**
 * Call Gemini AI with automatic model fallback and JSON parsing helper
 */
async function callGemini(prompt, isJson = false) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  if (!apiKey) {
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Try available Gemini models in order of performance and compatibility
  const modelsToTry = [
    'gemini-3-flash-preview',
    'gemini-3.1-flash-lite',
    'gemini-3.6-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-flash-latest'
  ];

  for (const modelName of modelsToTry) {
    try {
      const config = isJson ? { generationConfig: { responseMimeType: 'application/json' } } : {};
      const model = genAI.getGenerativeModel({ model: modelName, ...config });
      const result = await model.generateContent(prompt);
      const rawText = result.response.text();
      const text = cleanJsonString(rawText);
      if (text) return text;
    } catch (err) {
      console.warn(`[Gemini API] Notice for model ${modelName} (JSON config):`, err.message);
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(isJson ? `${prompt}\n\nIMPORTANT: Return ONLY a valid raw JSON object. Do not include markdown codeblocks or extra commentary.` : prompt);
        const rawText = result.response.text();
        const text = cleanJsonString(rawText);
        if (text) return text;
      } catch (err2) {
        console.warn(`[Gemini API] Notice for model ${modelName} (Standard fallback):`, err2.message);
      }
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

  static isGeminiAvailable() {
    return Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
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

    // 1. High attempt / struggled missions (prioritize areas needing validation)
    missions
      .filter(m => (m.attempts && m.attempts >= 3) || m.passed === false)
      .forEach(m => targetDays.add(m.day));

    // 2. Skipped missions
    missions
      .filter(m => m.skipped)
      .forEach(m => targetDays.add(m.day));

    // 3. Core milestones (RAG, Vector DB, Prompting, MCP, Multi-Agent, Observability)
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
    const isGeminiActive = this.isGeminiAvailable();

    // ───────────────────────────────────────────────────────────────────────────
    // Turn 1: Opening Greeting & Initial Technical Question
    // ───────────────────────────────────────────────────────────────────────────
    if (history.length === 0) {
      const firstDayNum = targetDays[0] || 7;
      coveredDays.add(firstDayNum);
      const firstDayInfo = this.getDayDetails(firstDayNum);

      let firstQuestion = `Welcome ${candidateName}! I'm IntervAI, your AI engineering lead interviewer today. ` +
        `Given your experience as a ${jobRole} and your work in the 31-Day AI Cohort, let me start with Day ${firstDayNum} (${firstDayInfo.title}). ` +
        `Could you walk me through how you implemented ${firstDayInfo.objectives[0] || 'the core system'} using ${firstDayInfo.tools?.join(', ') || 'your tech stack'}? What architectural choices and trade-offs did you make?`;

      const prompt = `You are IntervAI, an elite Senior AI Architect interviewing ${candidateName} (${jobRole}).
Candidate Profile:
- Experience: ${candidate.member?.yearsExperience || 5} years, ${candidate.member?.education || 'CS'}
- Cohort Progress: Completed ${candidate.signals?.missionsCompleted || 25} missions
- Recent Missions: ${JSON.stringify(candidate.missions?.slice(0, 5))}

Topic Focus: Day ${firstDayNum} - "${firstDayInfo.title}"
Tools: ${firstDayInfo.tools?.join(', ')}
Objectives: ${JSON.stringify(firstDayInfo.objectives)}

Task: Generate a warm, crisp, highly technical opening interview question. Acknowledge their role as a ${jobRole}, set an engaging professional tone, and ask specifically how they implemented Day ${firstDayNum} concepts in their cohort projects. Do not use generic placeholders. Keep it under 3 concise sentences.`;

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
        isGeminiActive,
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
    const evalPrompt = `You are evaluating a candidate's response during a technical AI engineering interview.
Candidate: ${candidateName} (${jobRole})
Curriculum Topic: Day ${currentTopicDay} (${currentDayInfo.title})
Tools involved: ${currentDayInfo.tools?.join(', ')}
Key Objectives: ${JSON.stringify(currentDayInfo.objectives)}

Candidate's Answer: "${userMessage}"

Evaluate their technical answer thoroughly and output JSON:
{
  "score": integer between 0 and 100 based on technical depth, accuracy, and trade-off understanding,
  "verdict": "STRONG" or "ADEQUATE" or "WEAK",
  "feedback": "1 sentence precise technical commentary on what was good or missing"
}`;

    let turnEval = { score: 78, verdict: 'ADEQUATE', feedback: 'Provided reasonable technical explanation.' };
    
    // Simple heuristic calculation when Gemini API key is absent
    if (!isGeminiActive) {
      const len = userMessage.trim().length;
      if (len > 180) {
        turnEval = { score: 88, verdict: 'STRONG', feedback: 'Detailed response explaining key architectural choices.' };
      } else if (len > 70) {
        turnEval = { score: 78, verdict: 'ADEQUATE', feedback: 'Good conceptual foundation, could detail edge cases further.' };
      } else {
        turnEval = { score: 62, verdict: 'WEAK', feedback: 'Brief response; missing operational details and trade-offs.' };
      }
    } else {
      const evalResultText = await callGemini(evalPrompt, true);
      if (evalResultText) {
        try {
          const parsedEval = JSON.parse(evalResultText);
          if (typeof parsedEval.score === 'number') {
            turnEval = {
              score: Math.min(100, Math.max(0, Math.round(parsedEval.score))),
              verdict: ['STRONG', 'ADEQUATE', 'WEAK'].includes(parsedEval.verdict) ? parsedEval.verdict : 'ADEQUATE',
              feedback: parsedEval.feedback || 'Evaluated answer against curriculum standard.'
            };
          }
        } catch (e) {
          console.warn('[Gemini API] Turn evaluation JSON parse notice, using score fallback');
        }
      }
    }

    evaluationTrail.push({
      turn: currentQuestionCount - 1,
      day: currentTopicDay,
      userAnswer: userMessage,
      ...turnEval
    });
    session.evaluationTrail = evaluationTrail;

    // Step 2: Determine if current topic finishes or progresses to next topic
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

    // Step 3: Check if interview complete (>= 8 questions answered AND >= 4 topics covered)
    const isInterviewComplete = currentQuestionCount >= 8 && coveredDaysArr.length >= 4;

    if (isInterviewComplete && (topicQuestionCount >= 2 || currentQuestionCount >= 9)) {
      const feedback = await this.generateFeedback(candidate, history, coveredDaysArr, evaluationTrail);

      const closingReply = `Thank you, ${candidateName}! That completes our technical interview session. You've demonstrated your engineering approach across ${coveredDaysArr.length} cohort topics. I have generated your comprehensive evaluation scorecard and performance feedback below.`;

      session.turnHistory.push({ role: 'interviewer', content: closingReply, timestamp: new Date().toISOString() });
      session.isComplete = true;
      session.feedback = feedback;
      session.coveredDays = coveredDaysArr;
      session.questionCount = currentQuestionCount;

      return {
        reply: closingReply,
        done: true,
        isGeminiActive,
        lastTurnScore: turnEval.score,
        lastTurnVerdict: turnEval.verdict,
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
- Stack & Tools: ${nextDayInfo.tools?.join(', ')}
- Objectives: ${JSON.stringify(nextDayInfo.objectives)}
- Covered Days: [${coveredDaysArr.join(', ')}]
- Candidate's Last Answer Score: ${turnEval.score}/100 (${turnEval.verdict}) - Feedback: "${turnEval.feedback}"

Instructions:
1. Provide a crisp 1-sentence transition acknowledging the candidate's last answer.
2. ${topicQuestionCount > 1 ? `Ask a targeted follow-up probing deeper into edge cases, latency constraints, failure modes, or security considerations for ${nextDayInfo.tools?.[0] || 'this architecture'}.` : `Transition to Day ${currentTopicDay} (${nextDayInfo.title}) and ask a practical engineering question about ${nextDayInfo.objectives[0] || 'their implementation'}.`}
3. Keep the prompt natural, direct, and technical. Do not use bullet points or meta-commentary.`;

    const aiNextQuestion = await callGemini(`${systemPrompt}\n\nRecent Dialogue:\n${historyPrompt}\n\nInterviewer Next Question:`);
    if (aiNextQuestion) {
      nextQuestion = aiNextQuestion;
    } else {
      if (topicQuestionCount > 1) {
        nextQuestion = `Good points on ${currentDayInfo.title}. When deploying ${nextDayInfo.tools?.[0] || 'this stack'}, how did you address latency budgets, fallback options, and edge cases under high load?`;
      } else {
        nextQuestion = `Moving on to Day ${currentTopicDay} (${nextDayInfo.title}), could you explain how you approached ${nextDayInfo.objectives[0] || 'the mission requirements'} and what technical trade-offs shaped your design?`;
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
      isGeminiActive,
      lastTurnScore: turnEval.score,
      lastTurnVerdict: turnEval.verdict,
      session
    };
  }

  /**
   * Generates comprehensive scoring and feedback based on candidate's actual responses
   */
  static async generateFeedback(candidate, turnHistory, coveredDays, evaluationTrail = []) {
    const candidateName = candidate.member?.name || 'Candidate';
    const candidateRole = candidate.member?.jobRole || 'AI Engineer';

    // Calculate baseline scores from turn evaluations
    let avgTurnScore = 82;
    if (evaluationTrail.length > 0) {
      const sum = evaluationTrail.reduce((acc, t) => acc + (t.score || 75), 0);
      avgTurnScore = Math.round(sum / evaluationTrail.length);
    }

    let tech = Math.min(100, Math.max(50, avgTurnScore + 3));
    let reas = Math.min(100, Math.max(50, avgTurnScore - 2));
    let comm = Math.min(100, Math.max(50, avgTurnScore + 4));
    let prob = Math.min(100, Math.max(50, avgTurnScore - 1));

    let overallScore = Math.round(tech * 0.40 + reas * 0.25 + comm * 0.15 + prob * 0.20);

    let feedback = {
      score: overallScore,
      technical: tech,
      reasoning: reas,
      communication: comm,
      problemSolving: prob,
      summary: `${candidateName} demonstrated strong conceptual and practical engineering clarity across ${coveredDays.length} key AI cohort modules. Showed effective design patterns for RAG, Vector Search, and Prompt Engineering, with minor growth areas in production telemetry and streaming optimization.`,
      strengths: [
        `Clear architectural reasoning for vector indexing and chunking strategies (Days 7 & 8).`,
        `Effective application of prompt engineering and structured schema output validation.`,
        `Strong articulation of component trade-offs between RAG context and model latency.`
      ],
      gaps: [
        `Could provide deeper operational details on latency budgets and streaming token metrics.`,
        `Observability and OpenTelemetry instrumentation (Day 29) require further quantitative metrics.`,
        `Multi-agent tool orchestration guardrails could be framed with formal evaluation suites.`
      ],
      next: [
        `Implement end-to-end tracing with OpenTelemetry for production vector retrieval pipelines.`,
        `Practice scenario-based architectural trade-off analysis under high-concurrency LLM traffic.`,
        `Build a dedicated evaluation benchmark suite for capstone agent guardrails.`
      ]
    };

    const transcriptText = turnHistory.map(t => `${t.role.toUpperCase()}: ${t.content}`).join('\n\n');
    const evalSummaryText = JSON.stringify(evaluationTrail);

    const prompt = `You are an executive AI Technical Interviewer evaluating candidate ${candidateName} (${candidateRole}).

Covered Modules / Days: [${coveredDays.join(', ')}]
Candidate Profile: ${JSON.stringify(candidate.member)}
Turn-by-Turn Evaluations: ${evalSummaryText}

Full Interview Transcript:
${transcriptText}

Task: Write a decision-grade candidate evaluation report in JSON.
Output JSON schema:
{
  "technical": integer 0-100 (architectural depth, code correctness, tool mastery),
  "reasoning": integer 0-100 (trade-off analysis, edge-case handling, logic),
  "communication": integer 0-100 (clarity, structure, conciseness),
  "problemSolving": integer 0-100 (debugging approach, practical constraints handling),
  "summary": "2-3 sentence executive assessment summarizing candidate technical strength and performance",
  "strengths": ["specific technical strength 1 referencing candidate's actual answers", "specific strength 2", "specific strength 3"],
  "gaps": ["specific technical gap 1 observed in their answers", "specific gap 2", "specific gap 3"],
  "next": ["actionable curriculum recommendation 1", "actionable curriculum recommendation 2", "actionable curriculum recommendation 3"]
}`;

    const jsonText = await callGemini(prompt, true);
    if (jsonText) {
      try {
        const parsed = JSON.parse(jsonText);
        if (parsed.summary && Array.isArray(parsed.strengths) && Array.isArray(parsed.gaps) && Array.isArray(parsed.next)) {
          const pTech = typeof parsed.technical === 'number' ? Math.min(100, Math.max(0, Math.round(parsed.technical))) : tech;
          const pReas = typeof parsed.reasoning === 'number' ? Math.min(100, Math.max(0, Math.round(parsed.reasoning))) : reas;
          const pComm = typeof parsed.communication === 'number' ? Math.min(100, Math.max(0, Math.round(parsed.communication))) : comm;
          const pProb = typeof parsed.problemSolving === 'number' ? Math.min(100, Math.max(0, Math.round(parsed.problemSolving))) : prob;

          const calculatedOverall = Math.round(pTech * 0.40 + pReas * 0.25 + pComm * 0.15 + pProb * 0.20);

          feedback = {
            score: calculatedOverall,
            technical: pTech,
            reasoning: pReas,
            communication: pComm,
            problemSolving: pProb,
            summary: parsed.summary,
            strengths: parsed.strengths.slice(0, 4),
            gaps: parsed.gaps.slice(0, 4),
            next: parsed.next.slice(0, 4)
          };
        }
      } catch (err) {
        console.warn('[Gemini API] Feedback JSON parsing notice, using baseline feedback score:', err.message);
      }
    }

    return feedback;
  }
}
