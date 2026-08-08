import mongoose from 'mongoose';

const memoryCurriculumProgress = new Map();

const curriculumProgressSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  curriculumDay: { type: Number, required: true },
  topic: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['COMPLETED', 'ATTEMPTED', 'SKIPPED', 'NOT_STARTED'], 
    default: 'NOT_STARTED' 
  },
  experienceLevel: { type: String, default: 'Familiar' },
  practicalExperience: { type: String, default: 'Built a project' },
  attempts: { type: Number, default: 1 },
  confidence: { type: Number, default: 3, min: 1, max: 5 },
}, { timestamps: true });

let CurriculumProgressModel = null;
try {
  CurriculumProgressModel = mongoose.model('CurriculumProgress', curriculumProgressSchema);
} catch (e) {
  CurriculumProgressModel = mongoose.models.CurriculumProgress;
}

export class CurriculumProgressStore {
  static async getByUser(userId) {
    if (mongoose.connection.readyState === 1 && CurriculumProgressModel) {
      try {
        const docs = await CurriculumProgressModel.find({ userId }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('MongoDB CurriculumProgress read failed:', err.message);
      }
    }
    const list = Array.from(memoryCurriculumProgress.values()).filter(p => p.userId === userId);
    return list;
  }

  static async saveUserProgress(userId, items) {
    const results = [];
    for (const item of items) {
      const id = `${userId}_day_${item.curriculumDay}`;
      const record = {
        id,
        userId,
        curriculumDay: item.curriculumDay,
        topic: item.topic || `Day ${item.curriculumDay}`,
        status: item.status || 'NOT_STARTED',
        experienceLevel: item.experienceLevel || 'Familiar',
        practicalExperience: item.practicalExperience || 'Built a project',
        attempts: item.attempts || 1,
        confidence: item.confidence || 3,
        updatedAt: new Date()
      };

      memoryCurriculumProgress.set(id, record);

      if (mongoose.connection.readyState === 1 && CurriculumProgressModel) {
        try {
          await CurriculumProgressModel.findOneAndUpdate(
            { id },
            record,
            { upsert: true, new: true }
          );
        } catch (err) {
          console.warn('MongoDB CurriculumProgress save failed:', err.message);
        }
      }
      results.push(record);
    }
    return results;
  }
}

export default CurriculumProgressModel;
