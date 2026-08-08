import mongoose from 'mongoose';

// In-Memory store fallback
const memoryUsers = new Map();

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  jobRole: { type: String, default: 'AI Engineer' },
  yearsExperience: { type: Number, default: 3 },
  education: { type: String, default: 'Computer Science' },
  onboardingCompleted: { type: Boolean, default: false },
}, { timestamps: true });

let UserModel = null;
try {
  UserModel = mongoose.model('User', userSchema);
} catch (e) {
  UserModel = mongoose.models.User;
}

export class UserStore {
  static async findByEmail(email) {
    const cleanEmail = email.toLowerCase().trim();
    if (mongoose.connection.readyState === 1 && UserModel) {
      try {
        const doc = await UserModel.findOne({ email: cleanEmail });
        if (doc) return doc.toObject();
      } catch (err) {
        console.warn('MongoDB User findByEmail failed, using memory fallback:', err.message);
      }
    }
    for (const u of memoryUsers.values()) {
      if (u.email === cleanEmail) return u;
    }
    return null;
  }

  static async findById(id) {
    if (mongoose.connection.readyState === 1 && UserModel) {
      try {
        const doc = await UserModel.findOne({ id });
        if (doc) return doc.toObject();
      } catch (err) {
        console.warn('MongoDB User findById failed, using memory fallback:', err.message);
      }
    }
    return memoryUsers.get(id) || null;
  }

  static async create(userData) {
    const user = {
      ...userData,
      email: userData.email.toLowerCase().trim(),
      createdAt: userData.createdAt || new Date(),
      updatedAt: userData.updatedAt || new Date()
    };

    memoryUsers.set(user.id, user);

    if (mongoose.connection.readyState === 1 && UserModel) {
      try {
        await UserModel.findOneAndUpdate(
          { email: user.email },
          user,
          { upsert: true, new: true }
        );
      } catch (err) {
        console.warn('MongoDB User save failed, saved to memory:', err.message);
      }
    }
    return user;
  }

  static async update(id, updates) {
    let user = await this.findById(id);
    if (!user) return null;

    user = { ...user, ...updates, updatedAt: new Date() };
    memoryUsers.set(id, user);

    if (mongoose.connection.readyState === 1 && UserModel) {
      try {
        await UserModel.findOneAndUpdate({ id }, updates, { new: true });
      } catch (err) {
        console.warn('MongoDB User update failed, updated in memory:', err.message);
      }
    }
    return user;
  }
}

export default UserModel;
