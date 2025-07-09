import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import TrainDetails from './components/TrainDetails';
import BookingConfirmation from './components/BookingConfirmation';
import UserProfile from './components/UserProfile';
// import LoadingSpinner from './components/ui/LoadingSpinner';
import './App.css';

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};

function App() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null
  });

  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: false,
          isLoading: false
        }));
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: {
            ...parsedUser,
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
        is_admin: Boolean(user.is_admin)
      } : null,
      error: null
    }));
  };

  if (authState.isLoading) {
    return (
      <div className="app-loading">
        {/* <LoadingSpinner size="large" /> */}
        <p>Initializing application...</p>
      </div>
    );
  }

  const isAdmin = authState.isAuthenticated && Boolean(authState.user?.is_admin);

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={
            authState.isAuthenticated ? (
              <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />
            ) : (
              <motion.div {...pageTransition}>
                <Login setAuthentication={setAuthentication} />
              </motion.div>
            )
          } />
          
          <Route path="/register" element={
            authState.isAuthenticated ? (
              <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />
            ) : (
              <motion.div {...pageTransition}>
                <Register setAuthentication={setAuthentication} />
              </motion.div>
            )
          } />
          
          <Route path="/dashboard" element={
            authState.isAuthenticated && !isAdmin ? (
              <motion.div {...pageTransition}>
                <Dashboard 
                  setAuthentication={setAuthentication} 
                  user={authState.user} 
                />
              </motion.div>
            ) : (
              <Navigate to={isAdmin ? '/admin' : '/login'} state={{ from: location }} replace />
            )
          } />
          
          <Route path="/admin" element={
            isAdmin ? (
              <motion.div {...pageTransition}>
                <AdminPanel 
                  setAuthentication={setAuthentication} 
                  user={authState.user} 
                />
              </motion.div>
            ) : (
              <Navigate to="/login" state={{ from: location }} replace />
            )
          } />
          
          <Route path="/trains/:id" element={
            authState.isAuthenticated ? (
              <motion.div {...pageTransition}>
                <TrainDetails user={authState.user} />
              </motion.div>
            ) : (
              <Navigate to="/login" state={{ from: location }} replace />
            )
          } />
          
          <Route path="/booking-confirmation/:pnr" element={
            authState.isAuthenticated ? (
              <motion.div {...pageTransition}>
                <BookingConfirmation user={authState.user} />
              </motion.div>
            ) : (
              <Navigate to="/login" state={{ from: location }} replace />
            )
          } />
          
          <Route path="/profile" element={
            authState.isAuthenticated ? (
              <motion.div {...pageTransition}>
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
          } />
          
          <Route path="/" element={
            <Navigate to={
              authState.isAuthenticated
                ? isAdmin
                  ? '/admin'
                  : '/dashboard'
                : '/login'
            } replace />
          } />
        </Routes>
      </AnimatePresence>
    </ErrorBoundary>
  );
}

export default App;