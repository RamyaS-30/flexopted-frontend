import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email,
      });

      setMessage(res.data.message || 'Password reset link has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white p-10 sm:p-12 md:p-16 rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 text-blue-700">
          Forgot Password
        </h1>

        <p className="text-center text-gray-600 mb-6">
          Enter your email and we will send you a password reset link.
        </p>

        {message && <p className="text-green-600 text-center mb-4 font-medium">{message}</p>}
        {error && <p className="text-red-500 text-center mb-4 font-medium">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-gray-900 placeholder-gray-400"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-lg transition text-white ${
              loading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Remembered your password?{' '}
          <Link to="/login" className="text-blue-700 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}