import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Card, CardContent, Typography, Button, Box,
  AppBar, Toolbar, Paper, List, ListItem, ListItemText, ListItemIcon,
  Chip, CircularProgress
} from '@mui/material';
import { Grid } from '@mui/material';
import { Computer, Security, VerifiedUser, Logout } from '@mui/icons-material';
import axios from 'axios';

interface Device {
  id: string;
  model: string;
  storage_type: string;
  size: number;
  serial: string;
  encryption_status: boolean;
}

const Dashboard: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const response = await axios.get('https://sanitiq-prototype.onrender.com/api/devices');
      setDevices(response.data.devices);
    } catch (error) {
      console.error('Failed to load devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            SanitiQ Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<Logout />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to SanitiQ
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Secure data sanitization for enterprise environments
        </Typography>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Computer color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{devices.length}</Typography>
                    <Typography color="text.secondary">Devices Detected</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Security color="success" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">0</Typography>
                    <Typography color="text.secondary">Completed Wipes</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <VerifiedUser color="secondary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">0</Typography>
                    <Typography color="text.secondary">Certificates</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box display="flex" gap={2} mt={2}>
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/sanitize')}
                  startIcon={<Security />}
                >
                  Start Sanitization
                </Button>
                <Button 
                  variant="outlined"
                  onClick={() => navigate('/certificates')}
                  startIcon={<VerifiedUser />}
                >
                  View Certificates
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Connected Devices
              </Typography>
              {loading ? (
                <CircularProgress />
              ) : (
                <List>
                  {devices.map((device) => (
                    <ListItem key={device.id}>
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
                            {device.encryption_status && (
                              <Chip label="Encrypted" size="small" color="secondary" sx={{ mt: 1 }} />
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;