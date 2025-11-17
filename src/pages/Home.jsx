import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import InstructorDashboard from './InstructorDashboard';

export default function Home() {
  const { user, logout } = useContext(AuthContext);

  // Check if logged in user is an instructor
  if (user?.role === "instructor") {
    return <InstructorDashboard user={user} logout={logout} />;
  }

  return (
    <div className="relative min-h-screen w-screen bg-gradient-to-br from-blue-50 to-purple-100 overflow-hidden">
      {/* Decorative floating circles */}
      <div className="absolute -top-16 -left-16 w-72 h-72 bg-blue-300 rounded-full opacity-30 animate-pulse mix-blend-multiply filter blur-3xl"></div>
      <div className="absolute -bottom-16 -right-16 w-96 h-96 bg-pink-300 rounded-full opacity-30 animate-pulse mix-blend-multiply filter blur-3xl"></div>

      {user ? (
        // Logged-in: full screen two-panel layout for normal user
        <div className="flex flex-col md:flex-row min-h-screen w-full">
          {/* Left Panel: User Info */}
          <div className="bg-blue-50/80 md:w-1/3 flex flex-col items-center justify-center gap-6 p-8">
            <div className="relative group">
              {/* User Icon */}
              <div className="w-28 h-28 bg-green-400 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg cursor-pointer">
                {user.name}
              </div>
              {/* Tooltip: shows email on hover */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-2 px-3 py-1 rounded-lg bg-gray-800 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {user.email}
              </div>
            </div>
                
            <p className="text-2xl font-semibold text-gray-800">Hello, {user.name}!</p>
            <button
              onClick={logout}
              className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-medium shadow hover:shadow-lg w-full sm:w-auto"
            >
              Logout
            </button>
          </div>

          {/* Right Panel: Welcome & Courses */}
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Welcome to FlexOptEd
            </h1>
            <p className="text-gray-700 text-xl md:text-2xl mb-8 max-w-2xl">
              Empowering you to learn at your own pace, anytime, anywhere. Explore hundreds of courses designed to boost your skills and career.
            </p>
            <Link
              to="/courses"
              className="px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 hover:text-gray-100 transition font-medium shadow hover:shadow-lg"
            >
              View Courses
            </Link>
          </div>
        </div>
      ) : (
        // Not logged-in: center card
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-2xl w-full max-w-lg text-center transform transition duration-500 hover:scale-105">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Welcome to FlexOptEd
            </h1>
            <p className="text-gray-700 text-lg sm:text-xl mb-8 max-w-md mx-auto">
              Empowering you to learn at your own pace, anytime, anywhere.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                to="/login"
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 hover:text-gray-100 transition font-medium shadow hover:shadow-lg w-full sm:w-auto"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 hover:text-gray-100 transition font-medium shadow hover:shadow-lg w-full sm:w-auto"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
