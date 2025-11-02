import React, { useEffect, useState } from 'react';
import { reportsAPI, coursesAPI, Course } from '../services/api';
import Navbar from '../components/Navbar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const Reports: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [courseReport, setCourseReport] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchCourseReport(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchData = async () => {
    try {
      const [overviewRes, coursesRes, activitiesRes] = await Promise.all([
        reportsAPI.getOverview(),
        coursesAPI.getAll(),
        reportsAPI.getActivities(20),
      ]);

      setOverview(overviewRes.data);
      setCourses(coursesRes.data);
      setActivities(activitiesRes.data);

      if (coursesRes.data.length > 0) {
        setSelectedCourse(coursesRes.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseReport = async (courseId: number) => {
    try {
      const response = await reportsAPI.getCourseReport(courseId);
      setCourseReport(response.data);
    } catch (error) {
      console.error('Error fetching course report:', error);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  const COLORS = ['#10B981', '#F59E0B', '#6B7280'];

  const statusData = courseReport
    ? [
        { name: 'Completed', value: courseReport.completedCount },
        { name: 'In Progress', value: courseReport.inProgressCount },
        { name: 'Not Started', value: courseReport.notStartedCount },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Reports & Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">{overview?.totalUsers || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Total Courses</h3>
            <p className="text-3xl font-bold text-purple-600">{overview?.totalCourses || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Avg Completion</h3>
            <p className="text-3xl font-bold text-green-600">{overview?.avgCompletion || 0}%</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Avg Score</h3>
            <p className="text-3xl font-bold text-yellow-600">{overview?.avgScore || 0}%</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Course Analytics</h2>
            <select
              value={selectedCourse || ''}
              onChange={(e) => setSelectedCourse(parseInt(e.target.value))}
              className="px-4 py-2 border rounded"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {courseReport && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Course Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Enrollments:</span>
                    <span className="font-semibold">{courseReport.totalEnrollments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completion Rate:</span>
                    <span className="font-semibold text-green-600">{courseReport.completionRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Score:</span>
                    <span className="font-semibold">{courseReport.avgScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Time Spent:</span>
                    <span className="font-semibold">{courseReport.avgTimeSpent} min</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Activities</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activities.map((activity) => (
                  <tr key={activity.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{activity.user?.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{activity.course?.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{activity.activityType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(activity.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
