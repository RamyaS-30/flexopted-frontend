import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState(null);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    try {
      await axios.post('http://localhost:5000/api/auth/signup', { name, email, password, role });

      const loginRes = await axios.post('http://localhost:5000/api/auth/login', { email, password });

      login(loginRes.data.user, loginRes.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4">
      <div className="bg-white p-10 sm:p-12 md:p-16 rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 text-green-700">Create Account</h1>

        {error && (
          <p className="text-red-500 text-center mb-4 font-medium">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Full Name"
            required
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none text-gray-200 placeholder-gray-200"
          />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none text-gray-200 placeholder-gray-200"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none text-gray-200 placeholder-gray-200"
          />
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none text-gray-200"
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
          </select>
          <button
            type="submit"
            className="w-full bg-green-600 text-gray-200 py-3 rounded-lg hover:bg-green-700 transition font-semibold text-lg"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-green-700 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
