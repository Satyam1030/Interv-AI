import mongoose from 'mongoose';

const memoryInterviews = new Map();
const memoryMessages = new Map();

const interviewSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  candidateName: { type: String },
  jobRole: { type: String },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  status: { type: String, enum: ['IN_PROGRESS', 'COMPLETED'], default: 'IN_PROGRESS' },
  overallScore: { type: Number, default: 0 },
  technicalScore: { type: Number, default: 0 },
  reasoningScore: { type: Number, default: 0 },
  communicationScore: { type: Number, default: 0 },
  problemSolvingScore: { type: Number, default: 0 },
  questionsCount: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  partialAnswers: { type: Number, default: 0 },
  incorrectAnswers: { type: Number, default: 0 },
  difficulty: { type: String, default: 'Intermediate' },
  topicsCovered: [{ type: Number }],
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  recommendations: [{ type: String }],
  finalFeedback: {
    score: Number,
    technical: Number,
    reasoning: Number,
    communication: Number,
    problemSolving: Number,
    summary: String,
    strengths: [String],
    gaps: [String],
    next: [String]
  }
}, { timestamps: true });

const interviewMessageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  interviewId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  sequence: { type: Number, required: true },
  role: { type: String, enum: ['interviewer', 'candidate'], required: true },
  content: { type: String, required: true },
  topicDay: { type: Number },
  score: { type: Number },
  verdict: { type: String },
  evaluation: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

let InterviewModel = null;
let InterviewMessageModel = null;

try {
  InterviewModel = mongoose.model('Interview', interviewSchema);
} catch (e) {
  InterviewModel = mongoose.models.Interview;
}

try {
  InterviewMessageModel = mongoose.model('InterviewMessage', interviewMessageSchema);
} catch (e) {
  InterviewMessageModel = mongoose.models.InterviewMessage;
}

export class InterviewStore {
  static async createOrUpdateInterview(data) {
    const record = {
      ...data,
      updatedAt: new Date()
    };
    memoryInterviews.set(record.id, record);

    if (mongoose.connection.readyState === 1 && InterviewModel) {
      try {
        await InterviewModel.findOneAndUpdate(
          { id: record.id },
          record,
          { upsert: true, new: true }
        );
      } catch (err) {
        console.warn('MongoDB Interview save failed:', err.message);
      }
    }
    return record;
  }

  static async findById(id) {
    if (mongoose.connection.readyState === 1 && InterviewModel) {
      try {
        const doc = await InterviewModel.findOne({ id }).lean();
        if (doc) return doc;
      } catch (e) {
        console.warn('MongoDB Interview findById failed:', e.message);
      }
    }
    return memoryInterviews.get(id) || null;
  }

  static async listByUser(userId, clerkId = null) {
    const userIds = [userId, clerkId].filter(Boolean);
    if (mongoose.connection.readyState === 1 && InterviewModel) {
      try {
        const docs = await InterviewModel.find({ userId: { $in: userIds } }).sort({ createdAt: -1 }).lean();
        if (docs) return docs;
      } catch (e) {
        console.warn('MongoDB Interview listByUser failed:', e.message);
      }
    }
    return Array.from(memoryInterviews.values())
      .filter(i => userIds.includes(i.userId))
      .sort((a, b) => new Date(b.createdAt || b.startedAt) - new Date(a.createdAt || a.startedAt));
  }

  static async addMessage(messageData) {
    const record = {
      ...messageData,
      id: messageData.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: messageData.timestamp || new Date()
    };
    memoryMessages.set(record.id, record);

    if (mongoose.connection.readyState === 1 && InterviewMessageModel) {
      try {
        await InterviewMessageModel.findOneAndUpdate(
          { id: record.id },
          record,
          { upsert: true, new: true }
        );
      } catch (err) {
        console.warn('MongoDB InterviewMessage save failed:', err.message);
      }
    }
    return record;
  }

  static async getMessagesForInterview(interviewId) {
    if (mongoose.connection.readyState === 1 && InterviewMessageModel) {
      try {
        const docs = await InterviewMessageModel.find({ interviewId }).sort({ sequence: 1 }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (e) {
        console.warn('MongoDB InterviewMessage read failed:', e.message);
      }
    }
    return Array.from(memoryMessages.values())
      .filter(m => m.interviewId === interviewId)
      .sort((a, b) => a.sequence - b.sequence);
  }
}

export default InterviewModel;
