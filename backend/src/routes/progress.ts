import express, { Response } from 'express';
import Progress from '../models/Progress';
import User from '../models/User';
import Course from '../models/Course';
import Activity from '../models/Activity';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { userId, courseId } = req.query;

    const where: any = {};

    if (req.user?.role !== 'admin') {
      where.userId = req.user?.id;
    } else {
      if (userId) where.userId = userId;
    }

    if (courseId) where.courseId = courseId;

    const progress = await Progress.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
        { model: Course, as: 'course', attributes: ['id', 'title', 'identifier'] },
      ],
    });

    res.json(progress);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const progress = await Progress.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
        { model: Course, as: 'course', attributes: ['id', 'title', 'identifier'] },
      ],
    });

    if (!progress) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    if (req.user?.role !== 'admin' && progress.userId !== req.user?.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(progress);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, completion, score, timeSpent, status } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    const userId = req.user?.id;

    let progress = await Progress.findOne({
      where: { userId, courseId },
    });

    if (progress) {
      await progress.update({
        completion: completion !== undefined ? completion : progress.completion,
        score: score !== undefined ? score : progress.score,
        timeSpent: timeSpent !== undefined ? timeSpent : progress.timeSpent,
        status: status || progress.status,
        lastAccessed: new Date(),
      });
    } else {
      progress = await Progress.create({
        userId: userId!,
        courseId,
        completion: completion || 0,
        score: score || 0,
        timeSpent: timeSpent || 0,
        status: status || 'in_progress',
        lastAccessed: new Date(),
      });
    }

    await Activity.create({
      userId: userId!,
      courseId,
      activityType: 'progress_update',
      details: JSON.stringify({ completion, score, timeSpent, status }),
      timestamp: new Date(),
    });

    res.json({
      message: 'Progress updated successfully',
      progress,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const progress = await Progress.findByPk(id);

    if (!progress) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    await progress.destroy();

    res.json({ message: 'Progress deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
