import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import sequelize from './config/database';
import User from './models/User';
import Course from './models/Course';
import Progress from './models/Progress';
import Activity from './models/Activity';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import courseRoutes from './routes/courses';
import progressRoutes from './routes/progress';
import reportRoutes from './routes/reports';
import { parseScormManifest, parseBreezeManifest } from './utils/scormParser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    await sequelize.sync({ force: false });
    console.log('Database synchronized.');

    const userCount = await User.count();
    if (userCount === 0) {
      console.log('Seeding initial data...');

      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
      });

      await User.create({
        username: 'learner',
        email: 'learner@example.com',
        password: 'learner123',
        role: 'learner',
      });

      console.log('Default users created.');

      try {
        const scormManifestPath = path.join(__dirname, '../../imsmanifest.xml');
        const breezeManifestPath = path.join(__dirname, '../../breeze-manifest.xml');

        const scormData = await parseScormManifest(scormManifestPath);
        const breezeData = await parseBreezeManifest(breezeManifestPath);

        await Course.create({
          identifier: scormData.identifier,
          title: scormData.title,
          description: scormData.description,
          version: scormData.version,
          duration: breezeData.duration,
          sectionCount: breezeData.sectionCount,
          scormData: JSON.stringify({ scormData, breezeData }),
        });

        console.log('SCORM course imported successfully.');
      } catch (error) {
        console.error('Error importing SCORM course:', error);
      }
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

export default app;
