import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    isAdmin: false
  });

  useEffect(() => {
    // ユーザー一覧を取得する処理
    // 実際のAPIコールに置き換える
    const fetchUsers = async () => {
      // サンプルデータ
      const mockUsers = [
        { id: 1, username: 'admin', password: 'admin123', isAdmin: true },
        { id: 2, username: 'user1', password: 'user123', isAdmin: false },
      ];
      setUsers(mockUsers);
    };

    fetchUsers();
  }, []);

  const handleAddUser = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewUser({ username: '', password: '', isAdmin: false });
  };

  const handleCreateUser = async () => {
    // 新規ユーザー作成のAPI呼び出し
    console.log('Create user:', newUser);
    handleCloseDialog();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        ユーザー管理
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={handleAddUser}
        sx={{ mb: 3 }}
      >
        ユーザー追加
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ユーザーID</TableCell>
              <TableCell>ユーザー名</TableCell>
              <TableCell>パスワード</TableCell>
              <TableCell>権限</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.password}</TableCell>
                <TableCell>{user.isAdmin ? '管理者' : '一般ユーザー'}</TableCell>
                <TableCell>
                  <Button color="error">削除</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>新規ユーザー作成</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="ユーザー名"
            fullWidth
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          />
          <TextField
            margin="dense"
            label="パスワード"
            type="text"
            fullWidth
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>キャンセル</Button>
          <Button onClick={handleCreateUser} variant="contained">
            作成
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Admin;