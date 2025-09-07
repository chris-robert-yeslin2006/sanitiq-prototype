import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Card, CardContent, Button, Box,
  AppBar, Toolbar, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress,
  Alert, List,  ListItemText, ListItemIcon, Chip
} from '@mui/material';
import Grid from '@mui/material/Grid';
import ListItem from '@mui/material/ListItem';

import { ArrowBack, Security, Warning, Computer } from '@mui/icons-material';
import axios from 'axios';

interface Device {
  id: string;
  model: string;
  storage_type: string;
  size: number;
  serial: string;
  encryption_status: boolean;
}

const Sanitize: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentJob, setCurrentJob] = useState<any>(null);
  const navigate = useNavigate();

  const methods = [
    { value: 'single_pass', label: 'Single Pass (Quick)', duration: '5-10 min' },
    { value: 'dod_5220_22_m', label: 'DoD 5220.22-M (3 Pass)', duration: '15-30 min' },
    { value: 'secure_erase', label: 'ATA Secure Erase', duration: '2-5 min' }
  ];

  useEffect(() => {
    loadDevices();
  }, []);

  useEffect(() => {
    if (currentJob?.status === 'running') {
      const interval = setInterval(() => {
        checkJobStatus(currentJob.id);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [currentJob]);

  const loadDevices = async () => {
    try {
      const response = await axios.get('https://sanitiq-prototype.onrender.com/api/devices');
      setDevices(response.data.devices);
    } catch (error) {
      console.error('Failed to load devices:', error);
    }
  };

  const startSanitization = async () => {
    try {
      const response = await axios.post('https://sanitiq-prototype.onrender.com/api/sanitize', {
        device_id: selectedDevice,
        method: selectedMethod
      });
      
      if (response.data.success) {
        setCurrentJob({
          id: response.data.job_id,
          status: 'running',
          progress: 0
        });
        setShowConfirm(false);
      }
    } catch (error) {
      console.error('Failed to start sanitization:', error);
    }
  };

  const checkJobStatus = async (jobId: string) => {
    try {
      const response = await axios.get(`https://sanitiq-prototype.onrender.com/api/jobs/${jobId}`);
      const job = response.data.job;
      
      setCurrentJob(job);
      
      if (job.status === 'completed') {
        // Auto-generate certificate
        await generateCertificate(jobId);
      }
    } catch (error) {
      console.error('Failed to check job status:', error);
    }
  };

  const generateCertificate = async (jobId: string) => {
    try {
      await axios.post('https://sanitiq-prototype.onrender.com/api/certificates', { job_id: jobId });
    } catch (error) {
      console.error('Failed to generate certificate:', error);
    }
  };

  const selectedDeviceData = devices.find(d => d.id === selectedDevice);

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" onClick={() => navigate('/')} startIcon={<ArrowBack />}>
            Back
          </Button>
          <Typography variant="h6" sx={{ ml: 2 }}>
            Data Sanitization
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Secure Data Sanitization
        </Typography>

        <Grid container spacing={3}>
          {/* Device Selection */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Select Device
                </Typography>
                
                <List>
                  {devices.map((device) => (
                    <ListItem 
                      key={device.id}
                      button
                      selected={selectedDevice === device.id}
                      onClick={() => setSelectedDevice(device.id)}
                      sx={{ 
                        border: 1, 
                        borderColor: selectedDevice === device.id ? 'primary.main' : 'divider',
                        mb: 1,
                        borderRadius: 1
                      }}
                    >
                      <ListItemIcon>
                        <Computer />
                      </ListItemIcon>
                      <ListItemText
                        primary={device.model}
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              {Math.round(device.size / (1024**3))} GB - {device.storage_type}
                            </Typography>
                            <Chip 
                              label={device.storage_type} 
                              size="small" 
                              color="primary" 
                              variant="outlined" 
                              sx={{ mt: 1 }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Method Selection */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Sanitization Method
                </Typography>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Select Method</InputLabel>
                  <Select
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    disabled={!selectedDevice}
                  >
                    {methods.map((method) => (
                      <MenuItem key={method.value} value={method.value}>
                        {method.label} ({method.duration})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  fullWidth
                  disabled={!selectedDevice || !selectedMethod || currentJob?.status === 'running'}
                  onClick={() => setShowConfirm(true)}
                  startIcon={<Security />}
                >
                  Start Sanitization
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Progress Display */}
          {currentJob && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Sanitization Progress
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {selectedDeviceData?.model} - {methods.find(m => m.value === selectedMethod)?.label}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={currentJob.progress} 
                      sx={{ mt: 1, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {Math.round(currentJob.progress)}% Complete
                    </Typography>
                  </Box>

                  {currentJob.status === 'completed' && (
                    <Alert severity="success">
                      Sanitization completed successfully! Certificate has been generated.
                      <Button 
                        sx={{ ml: 2 }} 
                        variant="outlined" 
                        size="small"
                        onClick={() => navigate('/certificates')}
                      >
                        View Certificate
                      </Button>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirm} onClose={() => setShowConfirm(false)}>
          <DialogTitle>Confirm Sanitization</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This will permanently erase all data on the selected device!
            </Alert>
            
            {selectedDeviceData && (
              <Box>
                <Typography><strong>Device:</strong> {selectedDeviceData.model}</Typography>
                <Typography><strong>Capacity:</strong> {Math.round(selectedDeviceData.size / (1024**3))} GB</Typography>
                <Typography><strong>Method:</strong> {methods.find(m => m.value === selectedMethod)?.label}</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              color="error" 
              onClick={startSanitization}
              startIcon={<Warning />}
            >
              Proceed
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Sanitize;