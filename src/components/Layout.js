import React from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = () => {
    return sessionStorage.getItem('isAuthenticated') === 'true';
  };

  // ログイン画面ではサイドバーを表示しない
  const showSidebar = isAuthenticated() && location.pathname !== '/login';

  return (
    <Box sx={{ display: 'flex' }}>
      {showSidebar && <Sidebar />}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;