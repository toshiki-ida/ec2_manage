// src/components/EC2List.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Typography
} from '@mui/material';
import { DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import ec2Client from '../utils/ec2-client';
import EC2Controls from './EC2Controls';

const EC2List = () => {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const selectedInstances = JSON.parse(localStorage.getItem('selectedInstances') || '[]');

  const fetchInstances = async () => {
    try {
      const command = new DescribeInstancesCommand({});
      const response = await ec2Client.send(command);
      
      const instanceList = response.Reservations
        .flatMap(reservation => reservation.Instances)
        .map(instance => ({
          id: instance.InstanceId,
          type: instance.InstanceType,
          state: instance.State.Name,
          publicIp: instance.PublicIpAddress || 'N/A',
          privateIp: instance.PrivateIpAddress || 'N/A',
          name: instance.Tags?.find(tag => tag.Key === 'Name')?.Value || 'No Name',
          launchTime: instance.LaunchTime,
          platform: instance.Platform || 'Linux/UNIX',
          vpcId: instance.VpcId,
          subnetId: instance.SubnetId
        }));
      
      const filteredInstances = selectedInstances.length > 0
        ? instanceList.filter(instance => selectedInstances.includes(instance.id))
        : instanceList;

      setInstances(filteredInstances);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching instances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstances();
    const interval = setInterval(fetchInstances, 30000); // 30秒ごとに更新
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ margin: 2 }}>
        インスタンス情報の取得に失敗しました: {error}
      </Alert>
    );
  }

  if (instances.length === 0) {
    return (
      <Alert severity="info" sx={{ margin: 2 }}>
        表示可能なEC2インスタンスが見つかりませんでした
      </Alert>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ margin: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>インスタンス名</TableCell>
            <TableCell>インスタンスID</TableCell>
            <TableCell>タイプ</TableCell>
            <TableCell>状態</TableCell>
            <TableCell>パブリックIP</TableCell>
            <TableCell>プライベートIP</TableCell>
            <TableCell>起動時刻</TableCell>
            <TableCell>プラットフォーム</TableCell>
            <TableCell>操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {instances.map((instance) => (
            <TableRow key={instance.id}>
              <TableCell>{instance.name}</TableCell>
              <TableCell>{instance.id}</TableCell>
              <TableCell>{instance.type}</TableCell>
              <TableCell>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <span style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: instance.state === 'running' ? '#4caf50' : 
                                   instance.state === 'stopped' ? '#f44336' : '#ffa726',
                    display: 'inline-block'
                  }} />
                  {instance.state}
                </Box>
              </TableCell>
              <TableCell>{instance.publicIp}</TableCell>
              <TableCell>{instance.privateIp}</TableCell>
              <TableCell>{new Date(instance.launchTime).toLocaleString()}</TableCell>
              <TableCell>{instance.platform}</TableCell>
              <TableCell>
                <EC2Controls
                  instanceId={instance.id}
                  instanceState={instance.state}
                  launchTime={instance.launchTime}
                  onStateChange={fetchInstances}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default EC2List;