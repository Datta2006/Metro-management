import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};

const pageTransition = {
  duration: 0.3
};

// Lazy load components
const Login = React.lazy(() => import('./components/Login'));
const Register = React.lazy(() => import('./components/Register'));
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const AdminPanel = React.lazy(() => import('./components/AdminPanel'));
const TrainDetails = React.lazy(() => import('./components/TrainDetails'));
const BookingConfirmation = React.lazy(() => import('./components/BookingConfirmation'));
const UserProfile = React.lazy(() => import('./components/UserProfile'));

function App() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null
  });

  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: null
        });
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: {
            ...parsedUser,
            // Normalize is_admin to boolean
            is_admin: Boolean(parsedUser.is_admin)
          },
          error: null
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: 'Error loading user data'
        });
      }
    };

    checkAuth();
  }, []);

  const setAuthentication = (isAuthenticated, user = null) => {
    setAuthState(prev => ({
      ...prev,
      isAuthenticated,
      user: user ? {
        ...user,
        // Normalize is_admin to boolean when setting user
        is_admin: Boolean(user.is_admin)
      } : null,
      error: null
    }));
  };

  if (authState.isLoading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading application...</p>
      </div>
    );
  }

  // Helper function to check admin status
  const isAdmin = () => {
    return authState.isAuthenticated && Boolean(authState.user?.is_admin);
  };

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        <React.Suspense fallback={<div className="page-loading">Loading...</div>}>
          <Routes location={location} key={location.pathname}>
            <Route path="/login" element={
              authState.isAuthenticated ? (
                <Navigate to={isAdmin() ? '/admin' : '/dashboard'} replace />
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Login setAuthentication={setAuthentication} />
                </motion.div>
              )
            } />
            <Route
              path="/register"
              element={
                authState.isAuthenticated ? (
                  <Navigate to={isAdmin() ? '/admin' : '/dashboard'} replace />
                ) : (
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Register setAuthentication={setAuthentication} />
                  </motion.div>
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                authState.isAuthenticated && !isAdmin() ? (
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Dashboard 
                      setAuthentication={setAuthentication} 
                      user={authState.user} 
                    />
                  </motion.div>
                ) : (
                  <Navigate to={isAdmin() ? '/admin' : '/login'} state={{ from: location }} replace />
                )
              }
            />
            <Route
              path="/admin"
              element={
                isAdmin() ? (
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <AdminPanel 
                      setAuthentication={setAuthentication} 
                      user={authState.user} 
                    />
                  </motion.div>
                ) : (
                  <Navigate to="/login" state={{ from: location }} replace />
                )
              }
            />
            <Route
              path="/trains/:id"
              element={
                authState.isAuthenticated ? (
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <TrainDetails user={authState.user} />
                  </motion.div>
                ) : (
                  <Navigate to="/login" state={{ from: location }} replace />
                )
              }
            />
            <Route
              path="/booking-confirmation/:pnr"
              element={
                authState.isAuthenticated ? (
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <BookingConfirmation user={authState.user} />
                  </motion.div>
                ) : (
                  <Navigate to="/login" state={{ from: location }} replace />
                )
              }
            />
            <Route
              path="/profile"
              element={
                authState.isAuthenticated ? (
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <UserProfile 
                      user={authState.user} 
                      setUser={(user) => setAuthState(prev => ({
                        ...prev,
                        user: {
                          ...user,
                          is_admin: Boolean(user.is_admin)
                        }
                      }))} 
                    />
                  </motion.div>
                ) : (
                  <Navigate to="/login" state={{ from: location }} replace />
                )
              }
            />
            <Route
              path="/"
              element={
                <Navigate
                  to={
                    authState.isAuthenticated
                      ? isAdmin()
                        ? '/admin'
                        : '/dashboard'
                      : '/login'
                  }
                  replace
                />
              }
            />
          </Routes>
        </React.Suspense>
      </AnimatePresence>
    </ErrorBoundary>
  );
}

export default App;