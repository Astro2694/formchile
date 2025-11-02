import express, { Response } from 'express';
import Course from '../models/Course';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const courses = await Course.findAll();
    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { identifier, title, description, version, duration, sectionCount, scormData } = req.body;

    if (!identifier || !title || !version) {
      return res.status(400).json({ error: 'Identifier, title, and version are required' });
    }

    const course = await Course.create({
      identifier,
      title,
      description,
      version,
      duration: duration || 0,
      sectionCount: sectionCount || 0,
      scormData: scormData || '',
    });

    res.status(201).json({
      message: 'Course created successfully',
      course,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const { identifier, title, description, version, duration, sectionCount, scormData } = req.body;

    await course.update({
      identifier: identifier || course.identifier,
      title: title || course.title,
      description: description !== undefined ? description : course.description,
      version: version || course.version,
      duration: duration !== undefined ? duration : course.duration,
      sectionCount: sectionCount !== undefined ? sectionCount : course.sectionCount,
      scormData: scormData !== undefined ? scormData : course.scormData,
    });

    res.json({
      message: 'Course updated successfully',
      course,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    await course.destroy();

    res.json({ message: 'Course deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
