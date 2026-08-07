import mongoose from 'mongoose';

// In-Memory store for fast, standalone hackathon execution fallback
const memorySessions = new Map();

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  candidate: { type: Object, required: true },
  turnHistory: [{
    role: { type: String, enum: ['interviewer', 'candidate'] },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    topicDay: { type: Number }
  }],
  coveredDays: [{ type: Number }],
  questionCount: { type: Number, default: 0 },
  currentTopicDay: { type: Number },
  topicQuestionCount: { type: Number, default: 0 },
  targetDays: [{ type: Number }],
  evaluationTrail: [{
    turn: Number,
    day: Number,
    score: Number,
    notes: String
  }],
  isComplete: { type: Boolean, default: false },
  feedback: {
    summary: String,
    strengths: [String],
    gaps: [String],
    next: [String]
  }
}, { timestamps: true });

let SessionModel = null;
try {
  SessionModel = mongoose.model('Session', sessionSchema);
} catch (e) {
  SessionModel = mongoose.models.Session;
}

export class SessionStore {
  static async get(sessionId) {
    if (mongoose.connection.readyState === 1 && SessionModel) {
      try {
        const doc = await SessionModel.findOne({ sessionId });
        if (doc) return doc.toObject();
      } catch (err) {
        console.warn('MongoDB read failed, falling back to memory:', err.message);
      }
    }
    return memorySessions.get(sessionId) || null;
  }

  static async save(sessionData) {
    memorySessions.set(sessionData.sessionId, sessionData);

    if (mongoose.connection.readyState === 1 && SessionModel) {
      try {
        await SessionModel.findOneAndUpdate(
          { sessionId: sessionData.sessionId },
          sessionData,
          { upsert: true, new: true }
        );
      } catch (err) {
        console.warn('MongoDB save failed, stored in memory:', err.message);
      }
    }
    return sessionData;
  }

  static async listAll() {
    const list = Array.from(memorySessions.values());
    if (mongoose.connection.readyState === 1 && SessionModel) {
      try {
        const dbDocs = await SessionModel.find().lean();
        return dbDocs.length ? dbDocs : list;
      } catch (e) {
        return list;
      }
    }
    return list;
  }
}

export default SessionModel;
