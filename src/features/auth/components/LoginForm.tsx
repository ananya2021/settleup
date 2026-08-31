import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function LoginForm() {
  const { signIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const successMessage = (location.state as { message?: string })?.message;
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn({ email, password });
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      navigate(redirectTo, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6" style={{ background: 'var(--color-surface)' }}>
      <div className="w-full max-w-sm mx-auto">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
            style={{ background: 'var(--color-accent)' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
            Split Pay
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
            Split expenses with friends
          </p>
        </div>

        {/* Form Card */}
        <div className="card p-6">
          <h2 className="font-display text-xl font-semibold text-center mb-6" style={{ color: 'var(--color-text-primary)' }}>
            Welcome back
          </h2>

          {successMessage && (
            <div
              className="px-4 py-3 rounded-xl text-sm font-medium mb-4"
              style={{ background: 'var(--color-positive-light)', color: 'var(--color-positive)' }}
            >
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="you@email.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div
                className="px-4 py-3 rounded-xl text-sm font-medium"
                style={{ background: 'var(--color-negative-light)', color: 'var(--color-negative)' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm mt-6" style={{ color: 'var(--color-text-secondary)' }}>
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-semibold"
            style={{ color: 'var(--color-accent)' }}
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
