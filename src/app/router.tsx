import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/ui/layout/ProtectedRoute';
import { AppShell } from '@/ui/layout/AppShell';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { SignupForm } from '@/features/auth/components/SignupForm';
import { HomePage } from '@/features/home/components/HomePage';
import { GroupsPage } from '@/features/groups/components/GroupsPage';
import { GroupDetailPage } from '@/features/groups/components/GroupDetailPage';
import { InviteAcceptPage } from '@/features/groups/components/InviteAcceptPage';
import { BalanceDashboard } from '@/features/balances/components/BalanceDashboard';
import { NotificationList } from '@/features/notifications/components/NotificationList';
import { CreateExpenseForm } from '@/features/expenses/components/CreateExpenseForm';
import { CreateIndividualDebtForm } from '@/features/expenses/components/CreateIndividualDebtForm';
import { SettlePage } from '@/features/settlements/components/SettlePage';
import { ProfilePage } from '@/features/profile/components/ProfilePage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/invite/:token" element={<InviteAcceptPage />} />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/:groupId" element={<GroupDetailPage />} />
          <Route
            path="/expenses/new"
            element={
              <div className="py-4">
                <CreateExpenseForm />
              </div>
            }
          />
          <Route
            path="/debts/new"
            element={
              <div className="py-4">
                <CreateIndividualDebtForm />
              </div>
            }
          />
          <Route path="/settle" element={<SettlePage />} />
          <Route path="/balances" element={<BalanceDashboard />} />
          <Route path="/notifications" element={<NotificationList />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
