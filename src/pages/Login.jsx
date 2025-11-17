import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white p-10 sm:p-12 md:p-16 rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 text-blue-700">Login</h1>

        {error && (
          <p className="text-red-500 text-center mb-4 font-medium">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-gray-200 placeholder-gray-200"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-gray-200 placeholder-gray-200"
          />
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold text-lg"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-700 font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
