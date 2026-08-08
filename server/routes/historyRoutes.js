import express from 'express';
import { InterviewStore } from '../models/Interview.js';
import { CurriculumProgressStore } from '../models/CurriculumProgress.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/history
 * List completed interviews for authenticated user
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const interviews = await InterviewStore.listByUser(req.user.id);
    return res.json({ interviews });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/history/:interviewId
 * Get detailed transcript and AI report for a specific interview
 * Enforces data isolation: user can only access their own interview
 */
router.get('/:interviewId', authenticateToken, async (req, res) => {
  try {
    const { interviewId } = req.params;
    const interview = await InterviewStore.findById(interviewId);

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found.' });
    }

    if (interview.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You can only view your own interview reports.' });
    }

    const messages = await InterviewStore.getMessagesForInterview(interviewId);

    return res.json({
      interview,
      messages
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/dashboard/stats
 * Real database performance statistics for authenticated user
 */
router.get('/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const interviews = await InterviewStore.listByUser(userId);
    const completedInterviews = interviews.filter(i => i.status === 'COMPLETED');
    const progress = await CurriculumProgressStore.getByUser(userId);

    const completedProgress = progress.filter(p => p.status === 'COMPLETED');
    const attemptedProgress = progress.filter(p => p.status === 'ATTEMPTED');

    const totalInterviews = completedInterviews.length;
    const totalScore = completedInterviews.reduce((sum, inv) => sum + (inv.overallScore || 0), 0);
    const avgScore = totalInterviews > 0 ? Math.round(totalScore / totalInterviews) : 0;
    const bestScore = totalInterviews > 0 ? Math.max(...completedInterviews.map(i => i.overallScore || 0)) : 0;
    const latestScore = completedInterviews[0]?.overallScore || 0;

    // Calculate readiness score
    const readinessScore = totalInterviews > 0 
      ? Math.min(100, Math.round((completedProgress.length * 2.0) + (avgScore * 0.4) + (totalInterviews * 1.5)))
      : Math.min(100, Math.round(completedProgress.length * 3.0) || 0);

    return res.json({
      userName: req.user.name,
      jobRole: req.user.jobRole,
      readinessScore,
      totalScore,
      totalInterviews,
      avgScore,
      bestScore,
      latestScore,
      completedDaysCount: completedProgress.length,
      attemptedDaysCount: attemptedProgress.length,
      recentInterviews: completedInterviews.slice(0, 5),
      curriculumProgress: progress
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
