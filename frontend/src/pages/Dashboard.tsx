import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { coursesAPI, progressAPI, Course, Progress } from '../services/api';
import Navbar from '../components/Navbar';

const Dashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesResponse = await coursesAPI.getAll();
        setCourses(coursesResponse.data);

        const progressResponse = await progressAPI.getAll(user?.id);
        setProgress(progressResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

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

  const getProgressForCourse = (courseId: number) => {
    return progress.find((p) => p.courseId === courseId);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          Welcome, {user?.username}!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Total Courses</h3>
            <p className="text-3xl font-bold text-blue-600">{courses.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">In Progress</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {progress.filter((p) => p.status === 'in_progress').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Completed</h3>
            <p className="text-3xl font-bold text-green-600">
              {progress.filter((p) => p.status === 'completed').length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Available Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const courseProgress = getProgressForCourse(course.id);
              return (
                <div key={course.id} className="border rounded-lg p-4 hover:shadow-lg transition">
                  <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{course.description || 'No description available'}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium">{course.duration.toFixed(1)} min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Sections:</span>
                      <span className="font-medium">{course.sectionCount}</span>
                    </div>
                    {courseProgress && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Progress:</span>
                          <span className="font-medium">{courseProgress.completion}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${courseProgress.completion}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Status:</span>
                          <span
                            className={`font-medium ${
                              courseProgress.status === 'completed'
                                ? 'text-green-600'
                                : courseProgress.status === 'in_progress'
                                ? 'text-yellow-600'
                                : 'text-gray-600'
                            }`}
                          >
                            {courseProgress.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
