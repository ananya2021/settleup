import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
              <div className="p-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">New Expense</h1>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <CreateExpenseForm />
                </div>
              </div>
            }
          />
          <Route
            path="/debts/new"
            element={
              <div className="p-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">New Debt</h1>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <CreateIndividualDebtForm />
                </div>
              </div>
            }
          />
          <Route path="/settle" element={<SettlePage />} />
          <Route
            path="/balances"
            element={
              <div className="p-4">
                <h1 className="text-xl font-bold mb-4">Balances</h1>
                <BalanceDashboard />
              </div>
            }
          />
          <Route
            path="/notifications"
            element={
              <div className="p-4">
                <h1 className="text-xl font-bold mb-4">Notifications</h1>
                <NotificationList />
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
