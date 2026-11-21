'use client';

import { useState, useEffect } from 'react';

export default function AuthModal({
  isOpen,
  mode,
  onClose,
  onAuthSuccess,
  onShowToast,
}) {
  const [authMode, setAuthMode] = useState(mode || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAuthMode(mode || 'login');
  }, [mode]);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setRole('customer');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === 'login') {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Login failed. Please check credentials.');
        }

        const user = data.user;
        onAuthSuccess(user, user.role, 'login');
        onShowToast(`Welcome ${user.role}!`);
      } else {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Registration failed.');
        }

        const user = data.user;
        onAuthSuccess(user, user.role || role, 'signup');
        onShowToast(`Account created successfully as ${role}!`);
      }

      resetForm();
      onClose();
    } catch (err) {
      onShowToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full mx-4 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-200">
        <div className="bg-slate-50 dark:bg-slate-800/80 px-7 py-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-[#0A2540] dark:text-white">
            {authMode === 'login'
              ? '1tapfix Secure Login'
              : 'Create 1tapfix Account'}
          </h3>

          <button
            onClick={onClose}
            className="text-2xl text-slate-400 hover:text-[#0A2540] dark:hover:text-white"
          >
            &times;
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-7 space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="user@example.com"
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>

            <input
              type="password"
              required
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="••••••••"
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Register As
              </label>

              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value)
                }
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="customer">
                  Customer
                </option>

                <option value="technician">
                  Technician
                </option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0A2540] hover:bg-[#13395F] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm"
          >
            {loading
              ? 'Processing...'
              : authMode === 'login'
              ? 'Login'
              : 'Create Account'}
          </button>

          <div className="text-center pt-2">
            {authMode === 'login' ? (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() =>
                    setAuthMode('signup')
                  }
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() =>
                    setAuthMode('login')
                  }
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Login
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
