// src/components/EC2Controls.js
import React, { useState, useEffect } from 'react';
import {
  Button,
  Stack,
  CircularProgress,
  Alert,
  Snackbar,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  TextField
} from '@mui/material';
import {
  StartInstancesCommand,
  StopInstancesCommand
} from "@aws-sdk/client-ec2";
import ec2Client from '../utils/ec2-client';

const EC2Controls = ({ instanceId, instanceState, launchTime, onStateChange }) => {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [autoShutdownEnabled, setAutoShutdownEnabled] = useState(
    JSON.parse(localStorage.getItem(`autoShutdown_${instanceId}`) || 'false')
  );
  const [shutdownHours, setShutdownHours] = useState(
    parseInt(localStorage.getItem(`shutdownHours_${instanceId}`) || '8')
  );
  const [shutdownTime, setShutdownTime] = useState(null);

  const handleInstanceAction = async (action) => {
    setLoading(true);
    try {
      const command = action === 'start'
        ? new StartInstancesCommand({ InstanceIds: [instanceId] })
        : new StopInstancesCommand({ InstanceIds: [instanceId] });
      
      await ec2Client.send(command);
      setNotification({
        open: true,
        message: `インスタンスの${action === 'start' ? '起動' : '停止'}を開始しました`,
        severity: 'success'
      });
      if (onStateChange) onStateChange();
    } catch (error) {
      setNotification({
        open: true,
        message: `エラーが発生しました: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShutdownHoursChange = (event) => {
    const hours = parseInt(event.target.value) || 1;
    setShutdownHours(hours);
    localStorage.setItem(`shutdownHours_${instanceId}`, hours.toString());
  };

  useEffect(() => {
    localStorage.setItem(`autoShutdown_${instanceId}`, JSON.stringify(autoShutdownEnabled));

    if (instanceState === 'running' && launchTime && autoShutdownEnabled) {
      const launchDateTime = new Date(launchTime);
      const shutdownDateTime = new Date(launchTime);
      shutdownDateTime.setHours(launchDateTime.getHours() + shutdownHours);
      setShutdownTime(shutdownDateTime);

      const timeUntilShutdown = shutdownDateTime.getTime() - new Date().getTime();
      
      if (timeUntilShutdown > 0) {
        const timer = setTimeout(async () => {
          try {
            const command = new StopInstancesCommand({ InstanceIds: [instanceId] });
            await ec2Client.send(command);
            setNotification({
              open: true,
              message: '自動シャットダウンを実行しました',
              severity: 'info'
            });
            if (onStateChange) onStateChange();
          } catch (error) {
            setNotification({
              open: true,
              message: `自動シャットダウンに失敗しました: ${error.message}`,
              severity: 'error'
            });
          }
        }, timeUntilShutdown);

        return () => clearTimeout(timer);
      }
    }
  }, [instanceId, launchTime, autoShutdownEnabled, shutdownHours, instanceState, onStateChange]);

  return (
    <>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="success"
            disabled={loading || instanceState === 'running'}
            onClick={() => handleInstanceAction('start')}
          >
            {loading ? <CircularProgress size={24} /> : '起動'}
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={loading || instanceState === 'stopped'}
            onClick={() => handleInstanceAction('stop')}
          >
            {loading ? <CircularProgress size={24} /> : '停止'}
          </Button>
        </Stack>
        
        <Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControlLabel
              control={
                <Switch
                  checked={autoShutdownEnabled}
                  onChange={(e) => setAutoShutdownEnabled(e.target.checked)}
                  color="primary"
                />
              }
              label="自動停止"
            />
            <TextField
              type="number"
              label="停止までの時間（時間）"
              value={shutdownHours}
              onChange={handleShutdownHoursChange}
              disabled={!autoShutdownEnabled}
              inputProps={{ min: 1, max: 24 }}
              size="small"
              sx={{ width: 150 }}
            />
          </Stack>
          {autoShutdownEnabled && shutdownTime && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              停止予定時刻: {shutdownTime.toLocaleString()}
            </Typography>
          )}
        </Box>
      </Stack>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EC2Controls;