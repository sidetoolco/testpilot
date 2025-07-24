import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Toast } from './components/ui/toast';
import { supabase } from './lib/supabase';
import { useAuthStore } from './features/auth/stores/authStore';
import { TestCreationProvider } from './features/tests/context/TestCreationContext';

// Import components
import MainLayout from './components/layout/MainLayout';
import MyTests from './pages/MyTests';
import AllProducts from './pages/AllProducts';
import LoginForm from './features/auth/components/LoginForm';
import SignupForm from './features/auth/components/SignupForm';
import ForgotPassword from './features/auth/components/ForgotPassword';
import ResetPassword from './features/auth/components/ResetPassword';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import CreateConsumerTest from './pages/CreateConsumerTest';
import TestUserPage from './pages/TestUser';
import TestDetail from './pages/TestDetail';
import ProductDetail from './pages/TestProductDetail';
import PreviewProductDetail from './components/test-setup/preview/PreviewProductDetail';
import TestQuestions from './pages/TestQuestions';
import QuestionDetail from './pages/QuestionDetail';
import ThankYou from './pages/ThankYou';
import Support from './pages/Support';
import { Adminpanel } from './pages/Adminpanel';
import SentryErrorTest from './pages/SentryErrorTest';
import TeamSettings from './pages/TeamSettings';
import TeamInviteForm from './pages/TeamInviteForm';
import Billing from './pages/Billing';
import Coupons from './pages/Coupons';

const queryClient = new QueryClient();

function App() {
  const { setUser, setSession } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setSession]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL || '/'}>
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Routes>
              {/* Unprotected Route */}

              <Route path="/test/:id" element={<TestUserPage />} />

              <Route path="/invite/:token" element={<TeamInviteForm />} />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Adminpanel />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/support"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Support />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/preview-product" element={<PreviewProductDetail />} />
              <Route path="/questions" element={<TestQuestions />} />
              <Route path="/questions/:id" element={<QuestionDetail />} />
              <Route path="/thanks" element={<ThankYou />} />
              <Route path="/sentry-error-test" element={<SentryErrorTest />} />
              {/* detalle testing */}
              <Route
                path="/tests/:id"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TestDetail />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* Auth Routes */}
              <Route path="/login" element={<LoginForm />} />
              <Route path="/signup" element={<SignupForm />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected Routes */}
              <Route path="/" element={<Navigate to="/my-tests" replace />} />

              <Route
                path="/my-tests"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <MyTests />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/all-products"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <AllProducts />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/create-test"
                element={
                  <ProtectedRoute>
                    <TestCreationProvider>
                      <MainLayout>
                        <CreateConsumerTest />
                      </MainLayout>
                    </TestCreationProvider>
                  </ProtectedRoute>
                }
              />

              {/* Settings routes */}
              <Route
                path="/settings/team"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TeamSettings />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings/billing"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Billing />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings/coupons"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Coupons />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/my-tests" replace />} />
            </Routes>
            <Toast />
          </motion.div>
        </AnimatePresence>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
