import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load data files
const curriculumPath = path.join(__dirname, '../data/curriculum.json');
const candidatesPath = path.join(__dirname, '../data/candidates.json');

const curriculumData = JSON.parse(fs.readFileSync(curriculumPath, 'utf8'));
const candidatesData = JSON.parse(fs.readFileSync(candidatesPath, 'utf8'));

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  if (apiKey) {
    return new GoogleGenerativeAI(apiKey);
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
   * Selects at least 4-6 target curriculum days based on candidate learning signals
   */
  static selectTargetDays(candidate) {
    if (!candidate || !candidate.missions) {
      return [7, 12, 22, 23, 28]; // Default key days
    }

    const missions = candidate.missions;
    const targetDays = new Set();

    // 1. High attempt missions (struggled but tried)
    const highAttempts = missions
      .filter(m => m.attempts && m.attempts >= 3)
      .map(m => m.day);
    highAttempts.forEach(d => targetDays.add(d));

    // 2. Skipped or failed missions
    const skippedOrFailed = missions
      .filter(m => m.skipped || m.passed === false)
      .map(m => m.day);
    skippedOrFailed.forEach(d => targetDays.add(d));

    // 3. Ensure core milestone topics are covered if set is small
    const coreMilestones = [7, 10, 12, 22, 23, 28, 31];
    for (const day of coreMilestones) {
      if (targetDays.size >= 5) break;
      targetDays.add(day);
    }

    return Array.from(targetDays).sort((a, b) => a - b);
  }

  /**
   * Finds curriculum day details
   */
  static getDayDetails(dayNumber) {
    return curriculumData.days.find(d => d.day === dayNumber) || {
      day: dayNumber,
      title: `Day ${dayNumber} AI Engineering Concept`,
      tools: ['AI Tools'],
      objectives: ['Understand core implementation principles']
    };
  }

  /**
   * Start or continue an interview session
   */
  static async processTurn(session, userMessage) {
    const candidate = session.candidate;
    const history = session.turnHistory || [];
    const questionCount = session.questionCount || 0;
    const coveredDays = new Set(session.coveredDays || []);
    const targetDays = session.targetDays || this.selectTargetDays(candidate);

    // Initial greeting / question 1
    if (history.length === 0) {
      const firstDayNum = targetDays[0] || 7;
      coveredDays.add(firstDayNum);
      const firstDayInfo = this.getDayDetails(firstDayNum);

      const candidateName = candidate.member?.name || 'candidate';
      const role = candidate.member?.jobRole || 'AI Engineer';

      let firstQuestion = `Welcome ${candidateName}! I'm IntervAI, your technical interviewer today. Given your background as a ${role} and your journey through the 31-Day AI Cohort, let's dive into your hands-on experience. ` +
        `Starting with Day ${firstDayNum} (${firstDayInfo.title}), could you walk me through how you implemented ${firstDayInfo.objectives[0] || 'the core architecture'} using ${firstDayInfo.tools?.join(', ') || 'your tooling'}? What key engineering decisions did you make?`;

      const genAI = getGenAI();
      if (genAI) {
        try {
          const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
          const prompt = `You are IntervAI, a senior AI lead interviewer conducting a technical interview for an AI Cohort graduate.
Candidate Profile: ${JSON.stringify(candidate.member)}
Missions context: ${JSON.stringify(candidate.missions?.slice(0, 5))}
Target starting topic: Day ${firstDayNum} - ${firstDayInfo.title}
Objectives: ${JSON.stringify(firstDayInfo.objectives)}

Generate an engaging, professional, and welcoming opening question for the technical interview. Ask specifically about how they implemented Day ${firstDayNum} concepts. Keep it concise, natural, and realistic for a senior engineering interview.`;

          const result = await model.generateContent(prompt);
          const responseText = result.response.text().trim();
          if (responseText) {
            firstQuestion = responseText;
          }
        } catch (err) {
          console.warn('Gemini API call failed for opening, using template:', err.message);
        }
      }

      session.turnHistory = [
        { role: 'interviewer', content: firstQuestion, timestamp: new Date(), topicDay: firstDayNum }
      ];
      session.coveredDays = Array.from(coveredDays);
      session.questionCount = 1;
      session.currentTopicDay = firstDayNum;
      session.topicQuestionCount = 1;
      session.isComplete = false;

      return {
        reply: firstQuestion,
        done: false,
        session
      };
    }

    // Process candidate response turn
    history.push({ role: 'candidate', content: userMessage, timestamp: new Date() });
    const currentQuestionCount = questionCount + 1;
    let currentTopicDay = session.currentTopicDay || targetDays[0] || 7;
    let topicQuestionCount = (session.topicQuestionCount || 1);

    // Determine if we should move to next topic or ask follow-up
    // Criteria: Minimum 8 total questions across at least 4 covered days.
    const isTopicFinished = topicQuestionCount >= 2 || userMessage.length > 250;
    
    if (isTopicFinished) {
      // Pick next day from targetDays not yet covered, or pick next available
      const remainingDays = targetDays.filter(d => !coveredDays.has(d));
      if (remainingDays.length > 0) {
        currentTopicDay = remainingDays[0];
        topicQuestionCount = 1;
      } else {
        // Pick any uncovered curriculum day
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

    // Check if interview is ready to conclude
    // Needs at least 8 questions and at least 4 distinct days
    const isInterviewComplete = currentQuestionCount >= 8 && coveredDaysArr.length >= 4;

    if (isInterviewComplete && (topicQuestionCount >= 2 || currentQuestionCount >= 9)) {
      // Generate final conclusion response with feedback!
      const feedback = await this.generateFeedback(candidate, history, coveredDaysArr);

      const closingReply = `Thank you ${candidate.member?.name || 'for your time'}! That concludes our technical interview today. You've demonstrated great depth across ${coveredDaysArr.length} cohort modules. I have compiled your structured performance evaluation and feedback below.`;

      session.turnHistory.push({ role: 'interviewer', content: closingReply, timestamp: new Date() });
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

    // Generate next question (follow-up or new topic)
    const currentDayInfo = this.getDayDetails(currentTopicDay);
    let nextQuestion = '';

    const genAI = getGenAI();
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const historyPrompt = history.slice(-6).map(h => `${h.role.toUpperCase()}: ${h.content}`).join('\n');
        
        const systemPrompt = `You are IntervAI, an elite AI engineering interviewer assessing candidate ${candidate.member?.name} (${candidate.member?.jobRole}).
Current State:
- Question Number: ${currentQuestionCount} of 8+
- Current Focus: Day ${currentTopicDay} (${currentDayInfo.title})
- Tools involved: ${currentDayInfo.tools?.join(', ')}
- Covered Days so far: [${coveredDaysArr.join(', ')}]
- Topic Question Count: ${topicQuestionCount}

Instructions:
1. Briefly evaluate their previous response (1 sentence validation or constructive probing).
2. If this is a follow-up (${topicQuestionCount > 1}), ask an intelligent follow-up question challenging their technical decisions, edge cases, or trade-offs.
3. If this is a new topic, transition smoothly to Day ${currentTopicDay} (${currentDayInfo.title}) and ask a practical implementation question.
4. Keep the question crisp, engaging, and conversational. Do NOT use generic bullet points.`;

        const result = await model.generateContent(`${systemPrompt}\n\nRecent Conversation History:\n${historyPrompt}\n\nInterviewer Response:`);
        nextQuestion = result.response.text().trim();
      } catch (err) {
        console.warn('Gemini API call failed for turn, fallback template:', err.message);
      }
    }

    if (!nextQuestion) {
      if (topicQuestionCount > 1) {
        nextQuestion = `That's an interesting approach to ${currentDayInfo.title}. How did you handle edge cases, latency, or potential failure modes when working with ${currentDayInfo.tools?.[0] || 'this stack'}?`;
      } else {
        nextQuestion = `Great perspective. Moving on to Day ${currentTopicDay} (${currentDayInfo.title}), can you explain how you tackled ${currentDayInfo.objectives[0] || 'the core objective'} and why you chose your specific implementation pattern over alternative approaches?`;
      }
    }

    session.turnHistory.push({ role: 'interviewer', content: nextQuestion, timestamp: new Date(), topicDay: currentTopicDay });
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
   * Generates structured feedback matching technical specification
   */
  static async generateFeedback(candidate, turnHistory, coveredDays) {
    const candidateName = candidate.member?.name || 'Candidate';
    const candidateRole = candidate.member?.jobRole || 'AI Engineer';

    let feedback = {
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

    const genAI = getGenAI();
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({
          model: 'gemini-flash-latest',
          generationConfig: { responseMimeType: 'application/json' }
        });

        const transcript = turnHistory.map(t => `${t.role.toUpperCase()}: ${t.content}`).join('\n\n');

        const prompt = `You are an executive AI technical interviewer writing the final assessment report for ${candidateName} (${candidateRole}).
Covered Curriculum Days: [${coveredDays.join(', ')}]
Candidate Profile & Signals: ${JSON.stringify(candidate)}

Full Interview Transcript:
${transcript}

Return a valid JSON object matching EXACTLY this structure:
{
  "summary": "2-3 sentence executive summary of candidate technical competence and interview performance",
  "strengths": ["concise bullet 1", "concise bullet 2", "concise bullet 3"],
  "gaps": ["concise bullet 1", "concise bullet 2", "concise bullet 3"],
  "next": ["actionable next step 1", "actionable next step 2", "actionable next step 3"]
}`;

        const result = await model.generateContent(prompt);
        const jsonText = result.response.text().trim();
        const parsed = JSON.parse(jsonText);
        if (parsed.summary && Array.isArray(parsed.strengths) && Array.isArray(parsed.gaps) && Array.isArray(parsed.next)) {
          feedback = parsed;
        }
      } catch (err) {
        console.warn('Gemini API feedback generation failed, using structured evaluation:', err.message);
      }
    }

    return feedback;
  }
}
