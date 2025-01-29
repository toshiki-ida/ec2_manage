import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Box
} from '@mui/material';
import { DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import ec2Client from '../utils/ec2-client';

const List = () => {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          platform: instance.Platform || 'Linux/UNIX'
        }));
      
      setInstances(instanceList);
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
    // 定期的な更新（5分ごと）
    const interval = setInterval(fetchInstances, 300000);
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
        エラーが発生しました: {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ margin: 2 }}>
      <TableContainer component={Paper}>
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
            </TableRow>
          </TableHead>
          <TableBody>
            {instances.map((instance) => (
              <TableRow key={instance.id}>
                <TableCell>{instance.name}</TableCell>
                <TableCell>{instance.id}</TableCell>
                <TableCell>{instance.type}</TableCell>
                <TableCell>{instance.state}</TableCell>
                <TableCell>{instance.publicIp}</TableCell>
                <TableCell>{instance.privateIp}</TableCell>
                <TableCell>{new Date(instance.launchTime).toLocaleString()}</TableCell>
                <TableCell>{instance.platform}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Add;