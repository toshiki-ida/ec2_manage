// src/components/InstanceSelector.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  CircularProgress,
  Alert
} from '@mui/material';
import { DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import ec2Client from '../utils/ec2-client';

const InstanceSelector = ({ open, onClose }) => {
  const [instances, setInstances] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllInstances = async () => {
      try {
        setLoading(true);
        const command = new DescribeInstancesCommand({});
        const response = await ec2Client.send(command);
        
        const instanceList = response.Reservations
          .flatMap(reservation => reservation.Instances)
          .map(instance => ({
            id: instance.InstanceId,
            name: instance.Tags?.find(tag => tag.Key === 'Name')?.Value || 'No Name'
          }));
        
        setInstances(instanceList);
        const savedSelection = JSON.parse(localStorage.getItem('selectedInstances') || '[]');
        setSelectedIds(savedSelection);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching instances:', err);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchAllInstances();
    }
  }, [open]);

  const handleToggle = (instanceId) => {
    setSelectedIds(prev => 
      prev.includes(instanceId)
        ? prev.filter(id => id !== instanceId)
        : [...prev, instanceId]
    );
  };

  const handleSave = () => {
    localStorage.setItem('selectedInstances', JSON.stringify(selectedIds));
    onClose();
    window.location.reload();
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent>
          <Alert severity="error">
            インスタンス情報の取得に失敗しました: {error}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>閉じる</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>表示するインスタンスを選択</DialogTitle>
      <DialogContent>
        <List>
          {instances.map((instance) => (
            <ListItem key={instance.id} button onClick={() => handleToggle(instance.id)}>
              <Checkbox
                checked={selectedIds.includes(instance.id)}
                tabIndex={-1}
                disableRipple
              />
              <ListItemText primary={`${instance.name} (${instance.id})`} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InstanceSelector;