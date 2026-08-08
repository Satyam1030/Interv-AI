import mongoose from 'mongoose';

const memoryInterviewQuestions = new Map();
const memoryTopicPerformance = new Map();
const memoryUserPerformance = new Map();

// ─── 1. Interview Question Schema ─────────────────────────────────────────────
const interviewQuestionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  interviewId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  sequenceNumber: { type: Number, required: true },
  curriculumDay: { type: Number, required: true },
  topic: { type: String, required: true },
  question: { type: String, required: true },
  candidateAnswer: { type: String, default: '' },
  difficulty: { type: String, default: 'Intermediate' },
  technicalScore: { type: Number, default: 80 },
  reasoningScore: { type: Number, default: 80 },
  communicationScore: { type: Number, default: 80 },
  overallScore: { type: Number, default: 80 },
  evaluation: { type: String, default: '' },
  strengths: { type: String, default: '' },
  weaknesses: { type: String, default: '' },
  isFollowUp: { type: Boolean, default: false }
}, { timestamps: true });

// ─── 2. Topic Performance Schema ─────────────────────────────────────────────
const topicPerformanceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // userId_day
  userId: { type: String, required: true, index: true },
  topic: { type: String, required: true },
  curriculumDay: { type: Number, required: true },
  attempts: { type: Number, default: 1 },
  questionsAnswered: { type: Number, default: 1 },
  averageScore: { type: Number, default: 75 },
  bestScore: { type: Number, default: 75 },
  latestScore: { type: Number, default: 75 },
  technicalAverage: { type: Number, default: 75 },
  reasoningAverage: { type: Number, default: 75 },
  communicationAverage: { type: Number, default: 75 },
  lastInterviewedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// ─── 3. User Performance Summary Schema ──────────────────────────────────────
const userPerformanceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // userId
  userId: { type: String, required: true, unique: true, index: true },
  totalInterviews: { type: Number, default: 0 },
  completedInterviews: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  bestScore: { type: Number, default: 0 },
  latestScore: { type: Number, default: 0 },
  technicalAverage: { type: Number, default: 0 },
  reasoningAverage: { type: Number, default: 0 },
  communicationAverage: { type: Number, default: 0 },
  problemSolvingAverage: { type: Number, default: 0 },
  strongestTopic: { type: String, default: 'Not enough data yet' },
  weakestTopic: { type: String, default: 'Not enough data yet' },
  totalQuestions: { type: Number, default: 0 },
  totalCorrect: { type: Number, default: 0 },
  totalPartial: { type: Number, default: 0 },
  totalIncorrect: { type: Number, default: 0 }
}, { timestamps: true });

let InterviewQuestionModel = null;
let TopicPerformanceModel = null;
let UserPerformanceModel = null;

try { InterviewQuestionModel = mongoose.model('InterviewQuestion', interviewQuestionSchema); } catch (e) { InterviewQuestionModel = mongoose.models.InterviewQuestion; }
try { TopicPerformanceModel = mongoose.model('TopicPerformance', topicPerformanceSchema); } catch (e) { TopicPerformanceModel = mongoose.models.TopicPerformance; }
try { UserPerformanceModel = mongoose.model('UserPerformance', userPerformanceSchema); } catch (e) { UserPerformanceModel = mongoose.models.UserPerformance; }

// ─── Stores ──────────────────────────────────────────────────────────────────
export class PerformanceStore {
  // ── Questions ──
  static async saveQuestion(questionData) {
    const record = {
      ...questionData,
      id: questionData.id || `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date()
    };
    memoryInterviewQuestions.set(record.id, record);

    if (mongoose.connection.readyState === 1 && InterviewQuestionModel) {
      try {
        await InterviewQuestionModel.findOneAndUpdate({ id: record.id }, record, { upsert: true, new: true });
      } catch (err) {
        console.warn('MongoDB InterviewQuestion save warning:', err.message);
      }
    }
    return record;
  }

  static async getQuestionsByInterview(interviewId) {
    if (mongoose.connection.readyState === 1 && InterviewQuestionModel) {
      try {
        const docs = await InterviewQuestionModel.find({ interviewId }).sort({ sequenceNumber: 1 }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (e) {
        console.warn('MongoDB InterviewQuestion find warning:', e.message);
      }
    }
    return Array.from(memoryInterviewQuestions.values())
      .filter(q => q.interviewId === interviewId)
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber);
  }

  // ── Topic Performance ──
  static async updateTopicPerformance(userId, curriculumDay, topicName, turnScore, dims = {}) {
    const key = `${userId}_${curriculumDay}`;
    let existing = null;

    if (mongoose.connection.readyState === 1 && TopicPerformanceModel) {
      try {
        existing = await TopicPerformanceModel.findOne({ id: key }).lean();
      } catch (e) { console.warn('MongoDB TopicPerformance find warning:', e.message); }
    }
    if (!existing) existing = memoryTopicPerformance.get(key) || null;

    const tech = dims.technical || turnScore;
    const reas = dims.reasoning || turnScore;
    const comm = dims.communication || turnScore;

    let updated;
    if (existing) {
      const newAttempts = (existing.attempts || 1) + 1;
      const newQuestions = (existing.questionsAnswered || 1) + 1;
      const newAvg = Math.round(((existing.averageScore * existing.attempts) + turnScore) / newAttempts);
      const newBest = Math.max(existing.bestScore || 0, turnScore);
      const newTechAvg = Math.round(((existing.technicalAverage || existing.averageScore) + tech) / 2);
      const newReasAvg = Math.round(((existing.reasoningAverage || existing.averageScore) + reas) / 2);
      const newCommAvg = Math.round(((existing.communicationAverage || existing.averageScore) + comm) / 2);

      updated = {
        ...existing,
        attempts: newAttempts,
        questionsAnswered: newQuestions,
        averageScore: newAvg,
        bestScore: newBest,
        latestScore: turnScore,
        technicalAverage: newTechAvg,
        reasoningAverage: newReasAvg,
        communicationAverage: newCommAvg,
        lastInterviewedAt: new Date(),
        updatedAt: new Date()
      };
    } else {
      updated = {
        id: key,
        userId,
        topic: topicName,
        curriculumDay,
        attempts: 1,
        questionsAnswered: 1,
        averageScore: turnScore,
        bestScore: turnScore,
        latestScore: turnScore,
        technicalAverage: tech,
        reasoningAverage: reas,
        communicationAverage: comm,
        lastInterviewedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    memoryTopicPerformance.set(key, updated);
    if (mongoose.connection.readyState === 1 && TopicPerformanceModel) {
      try {
        await TopicPerformanceModel.findOneAndUpdate({ id: key }, updated, { upsert: true, new: true });
      } catch (e) { console.warn('MongoDB TopicPerformance save warning:', e.message); }
    }
    return updated;
  }

  static async getTopicPerformanceByUser(userId) {
    if (mongoose.connection.readyState === 1 && TopicPerformanceModel) {
      try {
        const docs = await TopicPerformanceModel.find({ userId }).sort({ curriculumDay: 1 }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (e) { console.warn('MongoDB TopicPerformance list warning:', e.message); }
    }
    return Array.from(memoryTopicPerformance.values()).filter(t => t.userId === userId);
  }

  // ── User Performance Summary ──
  static async updateUserPerformanceSummary(userId, completedInterviews = []) {
    if (!completedInterviews || completedInterviews.length === 0) return null;

    const sortedDesc = [...completedInterviews].sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt));
    const count = sortedDesc.length;
    const scores = sortedDesc.map(i => i.overallScore || 0);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / count);
    const bestScore = Math.max(...scores);
    const latestScore = sortedDesc[0]?.overallScore || 0;

    const techAvg = Math.round(sortedDesc.reduce((a, i) => a + (i.technicalScore || i.overallScore || 0), 0) / count);
    const reasAvg = Math.round(sortedDesc.reduce((a, i) => a + (i.reasoningScore || i.overallScore || 0), 0) / count);
    const commAvg = Math.round(sortedDesc.reduce((a, i) => a + (i.communicationScore || i.overallScore || 0), 0) / count);
    const probAvg = Math.round(sortedDesc.reduce((a, i) => a + (i.problemSolvingScore || i.overallScore || 0), 0) / count);

    const totalQuestions = completedInterviews.reduce((a, i) => a + (i.questionsCount || 0), 0);
    const totalCorrect = completedInterviews.reduce((a, i) => a + (i.correctAnswers || 0), 0);
    const totalPartial = completedInterviews.reduce((a, i) => a + (i.partialAnswers || 0), 0);
    const totalIncorrect = completedInterviews.reduce((a, i) => a + (i.incorrectAnswers || 0), 0);

    const topics = await this.getTopicPerformanceByUser(userId);

    let strongestTopic = 'Not enough data yet';
    let weakestTopic = 'Not enough data yet';

    if (topics.length >= 2) {
      const sorted = [...topics].sort((a, b) => b.averageScore - a.averageScore);
      strongestTopic = `${sorted[0].topic} (${sorted[0].averageScore}%)`;
      weakestTopic = `${sorted[sorted.length - 1].topic} (${sorted[sorted.length - 1].averageScore}%)`;
    }

    const summary = {
      id: userId,
      userId,
      totalInterviews: count,
      completedInterviews: count,
      averageScore: avgScore,
      bestScore,
      latestScore,
      technicalAverage: techAvg,
      reasoningAverage: reasAvg,
      communicationAverage: commAvg,
      problemSolvingAverage: probAvg,
      strongestTopic,
      weakestTopic,
      totalQuestions,
      totalCorrect,
      totalPartial,
      totalIncorrect,
      updatedAt: new Date()
    };

    memoryUserPerformance.set(userId, summary);
    if (mongoose.connection.readyState === 1 && UserPerformanceModel) {
      try {
        await UserPerformanceModel.findOneAndUpdate({ userId }, summary, { upsert: true, new: true });
      } catch (e) { console.warn('MongoDB UserPerformance save warning:', e.message); }
    }
    return summary;
  }

  static async getUserPerformanceSummary(userId) {
    if (mongoose.connection.readyState === 1 && UserPerformanceModel) {
      try {
        const doc = await UserPerformanceModel.findOne({ userId }).lean();
        if (doc) return doc;
      } catch (e) { console.warn('MongoDB UserPerformance find warning:', e.message); }
    }
    return memoryUserPerformance.get(userId) || null;
  }
}
