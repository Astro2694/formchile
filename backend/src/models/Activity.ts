import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Course from './Course';

interface ActivityAttributes {
  id: number;
  userId: number;
  courseId: number;
  activityType: string;
  details: string;
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ActivityCreationAttributes extends Optional<ActivityAttributes, 'id'> {}

class Activity extends Model<ActivityAttributes, ActivityCreationAttributes> implements ActivityAttributes {
  public id!: number;
  public userId!: number;
  public courseId!: number;
  public activityType!: string;
  public details!: string;
  public timestamp!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Activity.init(
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
    activityType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'activities',
  }
);

Activity.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Activity.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

export default Activity;
