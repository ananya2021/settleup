import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--color-surface)]">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <span className="text-2xl font-bold text-white">S</span>
        </div>
        <div
          className="w-6 h-6 rounded-full animate-spin"
          style={{
            border: '2.5px solid var(--color-accent-light)',
            borderTopColor: 'var(--color-accent)',
          }}
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
