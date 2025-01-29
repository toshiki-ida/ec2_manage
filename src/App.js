import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import Login from './components/Login';
import EC2List from './components/EC2List';
import Admin from './components/Admin';
import Layout from './components/Layout';

const App = () => {
  const isAuthenticated = () => {
    return sessionStorage.getItem('isAuthenticated') === 'true';
  };

  const isAdmin = () => {
    return sessionStorage.getItem('isAdmin') === 'true';
  };

  const handleLogin = async (credentials) => {
    try {
      if (credentials.username && credentials.password) {
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('user', credentials.username);
        // 実際の実装では、APIレスポンスから管理者権限を設定
        sessionStorage.setItem('isAdmin', credentials.username === 'admin');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const PrivateRoute = ({ children, adminRequired = false }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" />;
    }
    if (adminRequired && !isAdmin()) {
      return <Navigate to="/instances" />;
    }
    return children;
  };

  return (
    <Router>
      <CssBaseline />
      <Layout>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route
            path="/instances"
            element={
              <PrivateRoute>
                <EC2List />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute adminRequired={true}>
                <Admin />
              </PrivateRoute>
            }
          />
          <Route
            path="/"
            element={
              <Navigate to="/instances" />
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;