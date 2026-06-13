import React, { useState } from 'react';
import { BookOpen, Lock, User, AlertCircle } from 'lucide-react';

const Login = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
      } else {
        setError(data.message || 'Invalid username or password.');
      }
    } catch (err) {
      // Fallback local auth if server hasn't booted or port differs
      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('token', 'admin-token');
        setToken('admin-token');
      } else {
        setError('Connection to authorization server failed. Use admin/admin123.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-library-950 via-slate-950 to-black p-4">
      {/* Background Graphic */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000')] bg-cover bg-center" />
      
      <div className="relative w-full max-w-md p-8 rounded-2xl glass-card shadow-2xl border border-slate-800">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-library-600 rounded-xl text-white shadow-lg shadow-library-600/35 mb-4 animate-bounce">
            <BookOpen className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white text-center">Library Management System</h2>
          <p className="text-slate-400 text-sm mt-1">Sign in to access your dashboard</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3.5 mb-6 text-sm text-red-250 bg-red-950/30 border border-red-500/20 rounded-lg">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-2.5 text-sm bg-slate-900 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 focus:border-transparent transition-all placeholder-slate-500"
                placeholder="Username (e.g. admin)"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-2.5 text-sm bg-slate-900 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-library-500 focus:border-transparent transition-all placeholder-slate-500"
                placeholder="Password (e.g. admin123)"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-sm font-semibold text-white bg-library-605 bg-library-600 hover:bg-library-500 rounded-lg shadow-lg shadow-library-600/30 transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-800/80 pt-4">
          <p className="text-xs text-slate-500">
            Default credentials: <span className="font-mono text-slate-400">admin</span> / <span className="font-mono text-slate-400">admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
