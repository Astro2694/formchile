import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Course from './Course';

interface ProgressAttributes {
  id: number;
  userId: number;
  courseId: number;
  completion: number;
  score: number;
  timeSpent: number;
  status: 'not_started' | 'in_progress' | 'completed';
  lastAccessed?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProgressCreationAttributes extends Optional<ProgressAttributes, 'id'> {}

class Progress extends Model<ProgressAttributes, ProgressCreationAttributes> implements ProgressAttributes {
  public id!: number;
  public userId!: number;
  public courseId!: number;
  public completion!: number;
  public score!: number;
  public timeSpent!: number;
  public status!: 'not_started' | 'in_progress' | 'completed';
  public lastAccessed!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Progress.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Course,
        key: 'id',
      },
    },
    completion: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    score: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    timeSpent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('not_started', 'in_progress', 'completed'),
      allowNull: false,
      defaultValue: 'not_started',
    },
    lastAccessed: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'progress',
  }
);

Progress.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Progress.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
User.hasMany(Progress, { foreignKey: 'userId', as: 'progress' });
Course.hasMany(Progress, { foreignKey: 'courseId', as: 'progress' });

export default Progress;
