import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/features/auth/hooks/useAuth';
import { useRealtimeSubscriptions } from '@/lib/realtime';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      retry: 1,
    },
  },
});

function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  useRealtimeSubscriptions(user?.id ?? '');
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RealtimeProvider>
          {children}
        </RealtimeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
