import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/ui/primitives/Button';
import { Card } from '@/ui/primitives/Card';

export function SignupForm() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await signUp({ name, email, password });
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      navigate('/login', {
        state: { message: 'Account created! You can now sign in.' },
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 sm:px-6 bg-[var(--color-surface)] py-12">
      <div className="w-full max-w-sm mx-auto space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-[22px] shadow-lg mb-2"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Create Account
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
            Join SplitPay to share expenses with your friends
          </p>
        </div>

        {/* Card Form */}
        <Card className="p-6 sm:p-8 space-y-5 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-sunken)] text-[var(--color-text-primary)] text-sm font-medium outline-none focus:border-[var(--color-accent)] transition-colors"
                placeholder="Riya Sharma"
                autoComplete="name"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-sunken)] text-[var(--color-text-primary)] text-sm font-medium outline-none focus:border-[var(--color-accent)] transition-colors"
                placeholder="riya@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-sunken)] text-[var(--color-text-primary)] text-sm font-medium outline-none focus:border-[var(--color-accent)] transition-colors"
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-sunken)] text-[var(--color-text-primary)] text-sm font-medium outline-none focus:border-[var(--color-accent)] transition-colors"
                placeholder="Repeat password"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl text-xs font-semibold bg-[var(--color-owe-light)] text-[var(--color-owe)]">
                {error}
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                disabled={loading}
                loading={loading}
              >
                Create Account
              </Button>
            </div>
          </form>
        </Card>

        {/* Link to Login */}
        <p className="text-center text-xs sm:text-sm text-[var(--color-text-secondary)]">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-[var(--color-accent)] hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
