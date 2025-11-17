import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // adjust path if needed

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState({});
  const [loading, setLoading] = useState(true);

  const { token } = useContext(AuthContext); // get token from AuthContext

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/courses');
        setCourses(res.data);

        if (token) {
          const enrollmentStatus = {};
          for (let course of res.data) {
            try {
              await axios.get(`http://localhost:5000/api/courses/${course.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              enrollmentStatus[course.id] = true;
            } catch (err) {
              enrollmentStatus[course.id] = false;
              console.log(err);
            }
          }
          setEnrollments(enrollmentStatus);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [token]);

  const handleEnroll = async (courseId) => {
    if (!token) {
      alert('Please log in to enroll');
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/courses/${courseId}/enroll`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Enrolled successfully!');
      setEnrollments((prev) => ({ ...prev, [courseId]: true }));
    } catch (err) {
      console.error('Error enrolling:', err);
      alert(err.response?.data?.error || 'Enrollment failed');
    }
  };

  if (loading)
    return (
      <div className="text-center mt-16 text-gray-600 text-lg font-medium">
        Loading courses...
      </div>
    );

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-start px-4 py-12">
      <h1 className="text-4xl font-extrabold mb-12 text-center text-blue-600">
        Explore Our Courses
      </h1>

      {courses.length === 0 ? (
        <p className="text-center text-gray-600 text-lg mt-10">
          No courses available yet. Please check back later!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-7xl">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-2 flex flex-col overflow-hidden"
            >
              <div
                className="h-40 flex items-center justify-center text-white text-xl font-bold uppercase"
                style={{
                  background: `linear-gradient(135deg, #${Math.floor(
                    Math.random() * 16777215
                  ).toString(16)}, #${Math.floor(Math.random() * 16777215).toString(16)})`,
                }}
              >
                {course.title}
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h2 className="text-xl font-semibold mb-2 text-gray-900">{course.title}</h2>
                <p className="text-gray-700 mb-4 line-clamp-3">{course.description}</p>
                <p className="text-sm text-gray-500 mb-4">
                  Instructor: <span className="font-medium">{course.instructor}</span>
                </p>

                {enrollments[course.id] ? (
                  <Link
                    to={`/courses/${course.id}`}
                    className="mt-auto bg-blue-500 hover:bg-blue-600 text-white hover:text-gray-100 px-4 py-2 rounded-lg font-medium text-center transition"
                  >
                    View Details
                  </Link>
                ) : (
                  <button
                    onClick={() => handleEnroll(course.id)}
                    className="mt-auto bg-green-500 hover:bg-green-600 text-white hover:text-gray-100 px-4 py-2 rounded-lg font-medium transition"
                  >
                    Enroll
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;