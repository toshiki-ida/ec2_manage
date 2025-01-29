// src/components/Sidebar.js
import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ComputerIcon from '@mui/icons-material/Computer';
import AddIcon from '@mui/icons-material/Add';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import InstanceSelector from './InstanceSelector';

const Sidebar = () => {
  const navigate = useNavigate();
  const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
  const [selectorOpen, setSelectorOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('isAdmin');
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', mt: 8 }}>
        <List>
          <ListItem button onClick={() => navigate('/instances')}>
            <ListItemIcon>
              <ComputerIcon />
            </ListItemIcon>
            <ListItemText primary="インスタンス管理" />
          </ListItem>
          {isAdmin && (
            <ListItem>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                fullWidth
                onClick={() => setSelectorOpen(true)}
              >
                インスタンス選択
              </Button>
            </ListItem>
          )}
          {isAdmin && (
            <ListItem button onClick={() => navigate('/admin')}>
              <ListItemIcon>
                <AdminPanelSettingsIcon />
              </ListItemIcon>
              <ListItemText primary="管理者設定" />
            </ListItem>
          )}
        </List>
        <Divider />
        <List>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="ログアウト" />
          </ListItem>
        </List>
      </Box>
      <InstanceSelector 
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
      />
    </Drawer>
  );
};

export default Sidebar;