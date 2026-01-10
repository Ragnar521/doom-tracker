import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BottomNavigation from './components/BottomNavigation';
import OfflineIndicator from './components/OfflineIndicator';
import ProtectedRoute from './components/ProtectedRoute';
import WelcomeToast from './components/WelcomeToast';
import { AchievementProvider } from './contexts/AchievementContext';
import { BoostProvider } from './contexts/BoostContext';
import Login from './pages/Login';
import Tracker from './pages/Tracker';
import Dashboard from './pages/Dashboard';
import Achievements from './pages/Achievements';
import Squad from './pages/Squad';
import Settings from './pages/Settings';

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="scanlines min-h-screen flex flex-col items-center p-4 pb-24">
        <div className="max-w-xs w-full space-y-3">
          {/* Header */}
          <div className="doom-panel p-3">
            <div className="text-center">
              <h1 className="font-doom text-3xl text-doom-red tracking-wider">
                REP & TEAR
              </h1>
              <p className="text-gray-600 text-[8px] mt-0.5 tracking-widest">
                UNTIL IT IS DONE
              </p>
            </div>
          </div>

          {/* Page Content */}
          {children}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Welcome Toast */}
      <WelcomeToast />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AchievementProvider>
        <BoostProvider>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Tracker />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/achievements"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Achievements />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/squad"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Squad />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Settings />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BoostProvider>
      </AchievementProvider>
    </BrowserRouter>
  );
}

export default App;
