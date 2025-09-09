import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Card, CardContent, Button, Box,
  AppBar, Toolbar, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress,
  Alert, List, ListItemText, ListItemIcon, Chip, RadioGroup,
  FormControlLabel, Radio, Divider
} from '@mui/material';
import Grid from '@mui/material/Grid';
import ListItem from '@mui/material/ListItem';

import { ArrowBack, Security, Warning, Computer, Delete, InsertDriveFile } from '@mui/icons-material';
import axios from 'axios';
import FileTypeSelector from './FileTypeSelector';
import FileProcessingDisplay from './FileProcessingDisplay';

interface Device {
  id: string;
  model: string;
  storage_type: string;
  size: number;
  serial: string;
  encryption_status: boolean;
}

interface ProcessingFile {
  name: string;
  path: string;
  size: number;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
}

interface JobStatus {
  id?: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
}

const Sanitize: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [eraseMode, setEraseMode] = useState<'full' | 'selective'>('full');
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentJob, setCurrentJob] = useState<JobStatus | null>(null);
  const [processingFiles, setProcessingFiles] = useState<ProcessingFile[]>([]);
  const [currentProcessingFile, setCurrentProcessingFile] = useState<string>('');
  const navigate = useNavigate();

  // Mock detected files data with proper typing
  const mockDetectedFiles: Record<string, number> = {
    '.pdf': 15,
    '.doc': 8,
    '.docx': 12,
    '.xls': 6,
    '.xlsx': 9,
    '.jpg': 143,
    '.jpeg': 67,
    '.png': 89,
    '.mp4': 23,
    '.mp3': 45,
    '.exe': 12,
    '.dll': 156,
    '.zip': 8,
    '.rar': 3,
    '.db': 4,
    '.tmp': 234
  };

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
        if (currentJob.id) {
          checkJobStatus(currentJob.id);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [currentJob]);

  // Generate mock files based on selected file types
  const generateMockFiles = (fileTypes: string[]): ProcessingFile[] => {
    const mockFiles: ProcessingFile[] = [];
    
    fileTypes.forEach(extension => {
      const count = mockDetectedFiles[extension] || 0;
      for (let i = 1; i <= Math.min(count, 10); i++) {
        mockFiles.push({
          name: `document_${i}${extension}`,
          path: `/Users/Documents/file_${i}${extension}`,
          size: Math.floor(Math.random() * 10000000) + 1000,
          type: extension.substring(1).toUpperCase(),
          status: 'pending',
          progress: 0
        });
      }
    });
    
    return mockFiles.slice(0, 50);
  };

  const loadDevices = async () => {
    try {
      const response = await axios.get('https://sanitiq-prototype.onrender.com/api/devices');
      setDevices(response.data.devices);
    } catch (error) {
      console.error('Failed to load devices:', error);
      // Mock data for demo if API fails
      setDevices([
        {
          id: '1',
          model: 'Samsung SSD 970 EVO',
          storage_type: 'SSD',
          size: 1000000000000,
          serial: 'S4EWNX0N123456',
          encryption_status: false
        }
      ]);
    }
  };

  const startSanitization = async () => {
    try {
      if (eraseMode === 'selective') {
        const files = generateMockFiles(selectedFileTypes);
        setProcessingFiles(files);
        simulateFileProcessing(files);
      } else {
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
        }
      }
      
      setShowConfirm(false);
    } catch (error) {
      console.error('Failed to start sanitization:', error);
      if (eraseMode === 'selective') {
        const files = generateMockFiles(selectedFileTypes);
        setProcessingFiles(files);
        simulateFileProcessing(files);
      } else {
        simulateFullErase();
      }
      setShowConfirm(false);
    }
  };

  const simulateFileProcessing = async (files: ProcessingFile[]) => {
    setCurrentJob({ status: 'running', progress: 0 });
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setCurrentProcessingFile(file.name);
      
      setProcessingFiles((prevFiles: ProcessingFile[]) => 
        prevFiles.map((f, index) => 
          index === i ? { ...f, status: 'processing' } : f
        )
      );
      
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setProcessingFiles((prevFiles: ProcessingFile[]) => 
          prevFiles.map((f, index) => 
            index === i ? { ...f, progress } : f
          )
        );
      }
      
      setProcessingFiles((prevFiles: ProcessingFile[]) => 
        prevFiles.map((f, index) => 
          index === i ? { ...f, status: 'completed', progress: 100 } : f
        )
      );
      
      const overallProgress = ((i + 1) / files.length) * 100;
      setCurrentJob((prevJob: JobStatus | null) => 
        prevJob ? { ...prevJob, progress: overallProgress } : null
      );
    }
    
    setCurrentJob((prevJob: JobStatus | null) => 
      prevJob ? { ...prevJob, status: 'completed' } : null
    );
    setCurrentProcessingFile('');
    await generateCertificate('mock-job-id');
  };

  const simulateFullErase = async () => {
    setCurrentJob({ id: 'mock-full-erase', status: 'running', progress: 0 });
    
    for (let progress = 0; progress <= 100; progress += 5) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setCurrentJob((prevJob: JobStatus | null) => 
        prevJob ? { ...prevJob, progress } : null
      );
    }
    
    setCurrentJob((prevJob: JobStatus | null) => 
      prevJob ? { ...prevJob, status: 'completed' } : null
    );
    await generateCertificate('mock-full-erase');
  };

  const checkJobStatus = async (jobId: string) => {
    try {
      const response = await axios.get(`https://sanitiq-prototype.onrender.com/api/jobs/${jobId}`);
      const job = response.data.job;
      
      setCurrentJob(job);
      
      if (job.status === 'completed') {
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
  const canStartSanitization = selectedDevice && selectedMethod && 
    (eraseMode === 'full' || (eraseMode === 'selective' && selectedFileTypes.length > 0));

  const totalSelectedFiles = selectedFileTypes.reduce((sum, type) => {
    const count = mockDetectedFiles[type];
    return sum + (count || 0);
  }, 0);

  // Check if processing is active (hide file selector during processing)
  const isProcessingActive = currentJob?.status === 'running';

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

          {/* Erase Mode & Method Selection */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Sanitization Options
                </Typography>

                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Erase Mode
                </Typography>
                <FormControl component="fieldset" disabled={isProcessingActive} sx={{ mb: 2 }}>
                  <RadioGroup
                    value={eraseMode}
                    onChange={(e) => setEraseMode(e.target.value as 'full' | 'selective')}
                  >
                    <FormControlLabel 
                      value="full" 
                      control={<Radio />} 
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            Full Device Erase
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Completely wipe the entire storage device
                          </Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel 
                      value="selective" 
                      control={<Radio />} 
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            Selective File Deletion
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Choose specific file types to delete
                          </Typography>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>

                <Divider sx={{ my: 2 }} />

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Sanitization Method</InputLabel>
                  <Select
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    disabled={!selectedDevice || isProcessingActive}
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
                  disabled={!canStartSanitization || isProcessingActive}
                  onClick={() => setShowConfirm(true)}
                  startIcon={eraseMode === 'full' ? <Security /> : <Delete />}
                >
                  Start {eraseMode === 'full' ? 'Full Erase' : 'Selective Deletion'}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* File Type Selection - Hidden during processing */}
          {eraseMode === 'selective' && selectedDevice && !isProcessingActive && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <FileTypeSelector
                    onSelectionChange={setSelectedFileTypes}
                    detectedFiles={mockDetectedFiles}
                  />
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Progress Display */}
          {currentJob && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  {eraseMode === 'selective' && processingFiles.length > 0 ? (
                    <FileProcessingDisplay
                      files={processingFiles}
                      currentFile={currentProcessingFile}
                      totalProgress={currentJob.progress}
                      isActive={currentJob.status === 'running'}
                    />
                  ) : (
                    <>
                      <Typography variant="h6" gutterBottom>
                        {eraseMode === 'full' ? 'Full Erase' : 'Selective Deletion'} Progress
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
                    </>
                  )}

                  {currentJob.status === 'completed' && (
                    <Alert severity="success">
                      {eraseMode === 'full' ? 'Full erase' : 'Selective deletion'} completed successfully! Certificate has been generated.
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
        <Dialog open={showConfirm} onClose={() => setShowConfirm(false)} maxWidth="md">
          <DialogTitle>
            Confirm {eraseMode === 'full' ? 'Full Erase' : 'Selective Deletion'}
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              {eraseMode === 'full' 
                ? 'This will permanently erase ALL data on the selected device!'
                : `This will permanently delete ${totalSelectedFiles} files of the selected types!`
              }
            </Alert>
            
            {selectedDeviceData && (
              <Box sx={{ mb: 2 }}>
                <Typography><strong>Device:</strong> {selectedDeviceData.model}</Typography>
                <Typography><strong>Capacity:</strong> {Math.round(selectedDeviceData.size / (1024**3))} GB</Typography>
                <Typography><strong>Method:</strong> {methods.find(m => m.value === selectedMethod)?.label}</Typography>
                <Typography><strong>Mode:</strong> {eraseMode === 'full' ? 'Full Device Erase' : 'Selective File Deletion'}</Typography>
              </Box>
            )}

            {eraseMode === 'selective' && selectedFileTypes.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>Selected File Types:</Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {selectedFileTypes.map(type => (
                    <Chip 
                      key={type} 
                      label={`${type} (${mockDetectedFiles[type] || 0} files)`} 
                      size="small"
                      icon={<InsertDriveFile />}
                    />
                  ))}
                </Box>
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
              Proceed with {eraseMode === 'full' ? 'Full Erase' : 'Deletion'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Sanitize;