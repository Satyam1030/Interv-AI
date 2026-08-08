import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UserStore } from '../models/User.js';
import { CurriculumProgressStore } from '../models/CurriculumProgress.js';
import { authenticateToken, generateToken } from '../middleware/authMiddleware.js';

const router = express.Router();



/**
 * PUT /api/auth/profile
 */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, jobRole, yearsExperience, education } = req.body;
    const userId = req.user.id;
    const updateData = {};
    if (name) updateData.name = name;
    if (jobRole) updateData.jobRole = jobRole;
    if (yearsExperience !== undefined) updateData.yearsExperience = Number(yearsExperience);
    if (education) updateData.education = education;

    const updatedUser = await UserStore.update(userId, updateData);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { passwordHash: _, ...safeUser } = updatedUser;
    return res.json({ success: true, user: safeUser });
  } catch (err) {
    console.error('Error in /api/auth/profile:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, jobRole, yearsExperience, education } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await UserStore.findByEmail(cleanEmail);

    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `USR-${Date.now().toString(36)}-${uuidv4().substring(0, 4)}`;

    const newUser = await UserStore.create({
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      jobRole: jobRole || 'AI Engineer',
      yearsExperience: yearsExperience ? Number(yearsExperience) : 3,
      education: education || 'Computer Science',
      onboardingCompleted: false
    });

    const token = generateToken(newUser);

    const { passwordHash: _, ...safeUser } = newUser;
    return res.json({
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Error in /api/auth/register:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await UserStore.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const { passwordHash: _, ...safeUser } = user;

    const progress = await CurriculumProgressStore.getByUser(user.id);

    return res.json({
      token,
      user: safeUser,
      curriculumProgress: progress
    });
  } catch (err) {
    console.error('Error in /api/auth/login:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

/**
 * POST /api/auth/forgot-password
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const user = await UserStore.findByEmail(email);
    if (!user) {
      return res.json({ success: true, message: 'If that email exists in our records, password reset instructions have been sent.' });
    }

    return res.json({
      success: true,
      message: 'If that email exists in our records, password reset instructions have been sent.',
      resetToken: `reset_${user.id}_${Date.now()}`
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/auth/reset-password
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required.' });
    }

    const user = await UserStore.findByEmail(email);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await UserStore.update(user.id, { passwordHash });

    return res.json({ success: true, message: 'Password updated successfully. Please log in.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { passwordHash: _, ...safeUser } = req.user;
    const progress = await CurriculumProgressStore.getByUser(req.user.id);
    return res.json({ user: safeUser, curriculumProgress: progress });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/auth/profile
 * Updates user profile details
 */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, jobRole, yearsExperience, education } = req.body;
    
    const updatedUser = await UserStore.update(req.user.id, {
      name: name || req.user.name,
      jobRole: jobRole || req.user.jobRole,
      yearsExperience: yearsExperience ? Number(yearsExperience) : req.user.yearsExperience,
      education: education || req.user.education
    });

    const { passwordHash: _, ...safeUser } = updatedUser;
    return res.json({
      success: true,
      user: safeUser
    });
  } catch (err) {
    console.error('Error in /api/auth/profile:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/auth/onboarding
 * Receives array of curriculum day statuses & learning signals from onboarding wizard
 */
router.post('/onboarding', authenticateToken, async (req, res) => {
  try {
    const { items, name, jobRole, yearsExperience, education } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'items array is required' });
    }

    const updatedUser = await UserStore.update(req.user.id, {
      onboardingCompleted: true,
      name: name || req.user.name,
      jobRole: jobRole || req.user.jobRole,
      yearsExperience: yearsExperience ? Number(yearsExperience) : req.user.yearsExperience,
      education: education || req.user.education
    });

    const savedProgress = await CurriculumProgressStore.saveUserProgress(req.user.id, items);

    const { passwordHash: _, ...safeUser } = updatedUser;
    return res.json({
      success: true,
      user: safeUser,
      curriculumProgress: savedProgress
    });
  } catch (err) {
    console.error('Error in /api/auth/onboarding:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/auth/clerk-sync
 * Synchronizes user authentication details from Clerk into MongoDB database
 */
router.post('/clerk-sync', async (req, res) => {
  try {
    const { clerkId, email, name, imageUrl } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    const user = await UserStore.syncClerkUser({ clerkId, email, name, imageUrl });
    const token = generateToken(user);
    const progress = await CurriculumProgressStore.getByUser(user.id);

    const { passwordHash: _, ...safeUser } = user;
    return res.json({
      success: true,
      token,
      user: safeUser,
      curriculumProgress: progress
    });
  } catch (err) {
    console.error('Error in /api/auth/clerk-sync:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
