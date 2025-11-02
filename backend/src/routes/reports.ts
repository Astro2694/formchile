import express, { Response } from 'express';
import { Op } from 'sequelize';
import Progress from '../models/Progress';
import User from '../models/User';
import Course from '../models/Course';
import Activity from '../models/Activity';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/overview', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.count();
    const totalCourses = await Course.count();
    const totalProgress = await Progress.count();
    const completedCourses = await Progress.count({
      where: { status: 'completed' },
    });

    const avgCompletion = await Progress.findAll({
      attributes: [
        [Progress.sequelize!.fn('AVG', Progress.sequelize!.col('completion')), 'avgCompletion'],
      ],
    });

    const avgScore = await Progress.findAll({
      attributes: [
        [Progress.sequelize!.fn('AVG', Progress.sequelize!.col('score')), 'avgScore'],
      ],
    });

    res.json({
      totalUsers,
      totalCourses,
      totalProgress,
      completedCourses,
      avgCompletion: parseFloat((avgCompletion[0] as any).dataValues.avgCompletion || 0).toFixed(2),
      avgScore: parseFloat((avgScore[0] as any).dataValues.avgScore || 0).toFixed(2),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/course/:courseId', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const totalEnrollments = await Progress.count({
      where: { courseId },
    });

    const completedCount = await Progress.count({
      where: { courseId, status: 'completed' },
    });

    const inProgressCount = await Progress.count({
      where: { courseId, status: 'in_progress' },
    });

    const notStartedCount = await Progress.count({
      where: { courseId, status: 'not_started' },
    });

    const avgCompletion = await Progress.findAll({
      where: { courseId },
      attributes: [
        [Progress.sequelize!.fn('AVG', Progress.sequelize!.col('completion')), 'avgCompletion'],
      ],
    });

    const avgScore = await Progress.findAll({
      where: { courseId },
      attributes: [
        [Progress.sequelize!.fn('AVG', Progress.sequelize!.col('score')), 'avgScore'],
      ],
    });

    const avgTimeSpent = await Progress.findAll({
      where: { courseId },
      attributes: [
        [Progress.sequelize!.fn('AVG', Progress.sequelize!.col('timeSpent')), 'avgTimeSpent'],
      ],
    });

    res.json({
      course: {
        id: course.id,
        title: course.title,
        identifier: course.identifier,
      },
      totalEnrollments,
      completedCount,
      inProgressCount,
      notStartedCount,
      completionRate: totalEnrollments > 0 ? ((completedCount / totalEnrollments) * 100).toFixed(2) : 0,
      avgCompletion: parseFloat((avgCompletion[0] as any).dataValues.avgCompletion || 0).toFixed(2),
      avgScore: parseFloat((avgScore[0] as any).dataValues.avgScore || 0).toFixed(2),
      avgTimeSpent: parseFloat((avgTimeSpent[0] as any).dataValues.avgTimeSpent || 0).toFixed(2),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/user/:userId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    if (req.user?.role !== 'admin' && req.user?.id !== parseInt(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'email'],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const progress = await Progress.findAll({
      where: { userId },
      include: [{ model: Course, as: 'course', attributes: ['id', 'title', 'identifier'] }],
    });

    const totalCourses = progress.length;
    const completedCourses = progress.filter((p) => p.status === 'completed').length;
    const inProgressCourses = progress.filter((p) => p.status === 'in_progress').length;

    const totalTimeSpent = progress.reduce((sum, p) => sum + p.timeSpent, 0);
    const avgScore = totalCourses > 0 ? progress.reduce((sum, p) => sum + p.score, 0) / totalCourses : 0;

    res.json({
      user,
      totalCourses,
      completedCourses,
      inProgressCourses,
      totalTimeSpent,
      avgScore: avgScore.toFixed(2),
      progress,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/activities', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 50, userId, courseId } = req.query;

    const where: any = {};
    if (userId) where.userId = userId;
    if (courseId) where.courseId = courseId;

    const activities = await Activity.findAll({
      where,
      limit: parseInt(limit as string),
      order: [['timestamp', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
        { model: Course, as: 'course', attributes: ['id', 'title', 'identifier'] },
      ],
    });

    res.json(activities);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
