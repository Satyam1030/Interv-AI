import express from 'express';
import { InterviewStore } from '../models/Interview.js';
import { PerformanceStore } from '../models/Performance.js';
import { CurriculumProgressStore } from '../models/CurriculumProgress.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/performance
 * Returns database-backed performance statistics for authenticated user
 * Single Source of Truth
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user's completed interviews
    const allInterviews = await InterviewStore.listByUser(userId);
    const completedInterviews = allInterviews.filter(i => i.status === 'COMPLETED');

    // Update & fetch user performance summary
    let userSummary = await PerformanceStore.getUserPerformanceSummary(userId);
    if (!userSummary && completedInterviews.length > 0) {
      userSummary = await PerformanceStore.updateUserPerformanceSummary(userId, completedInterviews);
    }

    // Fetch topic performance records
    const topicPerfList = await PerformanceStore.getTopicPerformanceByUser(userId);

    // Fetch curriculum progress for recommendations
    const progress = await CurriculumProgressStore.getByUser(userId);
    const completedDays = new Set(progress.filter(p => p.status === 'COMPLETED').map(p => p.curriculumDay));
    const uncompletedProgress = progress.filter(p => p.status !== 'COMPLETED');

    // Build Score History (chronological order)
    const sortedChronological = [...completedInterviews].sort((a, b) => {
      return new Date(a.completedAt || a.createdAt) - new Date(b.completedAt || b.createdAt);
    });

    const scoreHistory = sortedChronological.map((inv, idx) => ({
      id: inv.id,
      label: `Interview ${idx + 1}`,
      date: new Date(inv.completedAt || inv.startedAt || inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: inv.overallScore || inv.finalFeedback?.score || 0,
      technical: inv.technicalScore || inv.finalFeedback?.technical || inv.overallScore || 0,
      reasoning: inv.reasoningScore || inv.finalFeedback?.reasoning || inv.overallScore || 0,
      communication: inv.communicationScore || inv.finalFeedback?.communication || inv.overallScore || 0,
      problemSolving: inv.problemSolvingScore || inv.finalFeedback?.problemSolving || inv.overallScore || 0
    }));

    // Aggregate strengths, weaknesses, and recommendations from interview evaluations
    const strengthsSet = new Set();
    const weaknessesSet = new Set();
    const recommendationsSet = new Set();

    completedInterviews.forEach(inv => {
      const fb = inv.finalFeedback;
      if (fb) {
        (fb.strengths || inv.strengths || []).forEach(s => strengthsSet.add(s));
        (fb.gaps || inv.weaknesses || []).forEach(w => weaknessesSet.add(w));
        (fb.next || inv.recommendations || []).forEach(r => recommendationsSet.add(r));
      }
    });

    // Determine strongest & weakest topic
    let strongestTopic = 'Not enough data yet';
    let weakestTopic = 'Not enough data yet';

    if (topicPerfList.length >= 2) {
      const sortedTopics = [...topicPerfList].sort((a, b) => b.averageScore - a.averageScore);
      strongestTopic = `${sortedTopics[0].topic} (${sortedTopics[0].averageScore}%)`;
      weakestTopic = `${sortedTopics[sortedTopics.length - 1].topic} (${sortedTopics[sortedTopics.length - 1].averageScore}%)`;
    }

    // Calculate totalScore (Sum of final scores from all completed interviews)
    const totalScore = completedInterviews.reduce((sum, inv) => sum + (inv.overallScore || 0), 0);

    // Calculate score trends (vs previous interview)
    let latestScoreTrend = null; // null indicates "Not enough data yet"
    let avgScoreTrend = null;

    if (sortedChronological.length >= 2) {
      const latestScoreVal = sortedChronological[sortedChronological.length - 1].overallScore || 0;
      const prevScoreVal = sortedChronological[sortedChronological.length - 2].overallScore || 0;
      latestScoreTrend = latestScoreVal - prevScoreVal;

      const prevAvg = Math.round(
        sortedChronological.slice(0, -1).reduce((sum, inv) => sum + (inv.overallScore || 0), 0) / (sortedChronological.length - 1)
      );
      const currentAvg = Math.round(totalScore / sortedChronological.length);
      avgScoreTrend = currentAvg - prevAvg;
    }

    // Dimension Performance Array
    const techAvg = userSummary?.technicalAverage || (completedInterviews.length > 0 ? Math.round(completedInterviews.reduce((a, b) => a + (b.technicalScore || b.overallScore || 0), 0) / completedInterviews.length) : 0);
    const reasAvg = userSummary?.reasoningAverage || (completedInterviews.length > 0 ? Math.round(completedInterviews.reduce((a, b) => a + (b.reasoningScore || b.overallScore || 0), 0) / completedInterviews.length) : 0);
    const commAvg = userSummary?.communicationAverage || (completedInterviews.length > 0 ? Math.round(completedInterviews.reduce((a, b) => a + (b.communicationScore || b.overallScore || 0), 0) / completedInterviews.length) : 0);
    const probAvg = userSummary?.problemSolvingAverage || (completedInterviews.length > 0 ? Math.round(completedInterviews.reduce((a, b) => a + (b.problemSolvingScore || b.overallScore || 0), 0) / completedInterviews.length) : 0);

    const dimensionPerformance = [
      { dimension: "Technical Depth", score: techAvg, key: "technical" },
      { dimension: "Reasoning & Logic", score: reasAvg, key: "reasoning" },
      { dimension: "Communication", score: commAvg, key: "communication" },
      { dimension: "Problem Solving", score: probAvg, key: "problemSolving" }
    ];

    // Build Recent Activity Feed from stored database records
    const recentActivity = completedInterviews.slice(0, 5).map((inv, idx) => ({
      id: `act_${inv.id}_${idx}`,
      title: `Completed ${inv.jobRole || 'AI Engineering'} Technical Interview`,
      score: inv.overallScore || 80,
      timestamp: inv.completedAt || inv.createdAt,
      topics: inv.topicsCovered || []
    }));

    // Sort completed interviews descending by completion date
    const sortedDesc = [...completedInterviews].sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt));
    const latestInterview = sortedDesc[0];

    const calculatedAvgScore = completedInterviews.length > 0 ? Math.round(totalScore / completedInterviews.length) : 0;
    const calculatedBestScore = completedInterviews.length > 0 ? Math.max(...completedInterviews.map(i => i.overallScore || 0)) : 0;
    const calculatedLatestScore = latestInterview ? (latestInterview.overallScore || 0) : 0;

    // Update user performance summary in database
    userSummary = await PerformanceStore.updateUserPerformanceSummary(userId, completedInterviews);

    const summaryData = {
      totalScore,
      totalInterviews: completedInterviews.length,
      completedInterviews: completedInterviews.length,
      averageScore: calculatedAvgScore,
      bestScore: calculatedBestScore,
      latestScore: calculatedLatestScore,
      latestScoreTrend,
      avgScoreTrend,
      technicalAverage: techAvg,
      reasoningAverage: reasAvg,
      communicationAverage: commAvg,
      problemSolvingAverage: probAvg,
      strongestTopic,
      weakestTopic,
      totalQuestions: userSummary?.totalQuestions || completedInterviews.reduce((a, b) => a + (b.questionsCount || 0), 0)
    };

    return res.json({
      summary: summaryData,
      scoreHistory,
      topicPerformance: topicPerfList,
      dimensionPerformance,
      recentInterviews: sortedDesc.slice(0, 5),
      recentActivity,
      strengths: Array.from(strengthsSet).slice(0, 5),
      weaknesses: Array.from(weaknessesSet).slice(0, 5),
      recommendations: Array.from(recommendationsSet).slice(0, 5),
      recommendedRevisionDays: uncompletedProgress.slice(0, 4)
    });
  } catch (err) {
    console.error('Error in GET /api/performance:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
