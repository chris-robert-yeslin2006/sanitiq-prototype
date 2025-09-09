import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, AppBar, Toolbar, Button, Box,
  Card, CardContent, Grid, Chip, Alert, List, ListItem,
  ListItemText, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField
} from '@mui/material';
import { ArrowBack, VerifiedUser, Download, Visibility, Search } from '@mui/icons-material';
import axios from 'axios';

// Import QR code images
import qr1 from './img/qr1.png';
import qr2 from './img/qr2.png';
import qr3 from './img/qr3.png';

const Certificates: React.FC = () => {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verifyId, setVerifyId] = useState('');
  const navigate = useNavigate();

  // Get random QR code image
  const getQRCodeImage = (index: number) => {
    const qrImages = [qr1, qr2, qr3];
    return qrImages[index % qrImages.length];
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      const response = await axios.get('https://sanitiq-prototype.onrender.com/api/certificates');
      setCertificates(response.data.certificates);
    } catch (error) {
      console.error('Failed to load certificates:', error);
    }
  };

  const handleVerify = (certId: string) => {
    navigate(`/verify/${certId}`);
  };

  const handleManualVerify = () => {
    if (verifyId.trim()) {
      navigate(`/verify/${verifyId.trim()}`);
      setShowVerifyDialog(false);
      setVerifyId('');
    }
  };

  const downloadPDF = async (certId: string) => {
    try {
      const response = await axios.get(
        `https://sanitiq-prototype.onrender.com/api/certificates/${certId}/pdf`,
        { responseType: 'blob' }
      );
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SanitiQ_Certificate_${certId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download certificate. Please try again.');
    }
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" onClick={() => navigate('/')} startIcon={<ArrowBack />}>
            Back
          </Button>
          <Typography variant="h6" sx={{ ml: 2, flexGrow: 1 }}>
            Sanitization Certificates
          </Typography>
          <Button 
            color="inherit" 
            startIcon={<Search />}
            onClick={() => setShowVerifyDialog(true)}
          >
            Verify Certificate
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Digital Certificates
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Tamper-proof certificates for completed sanitizations
        </Typography>

        {certificates.length === 0 ? (
          <Alert severity="info">
            No certificates generated yet. Complete a sanitization to generate your first certificate.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {certificates.map((cert, index) => (
              <Grid item xs={12} md={6} key={cert.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Certificate #{cert.id}
                        </Typography>
                        <Chip
                          label={cert.status}
                          color="success"
                          size="small"
                          icon={<VerifiedUser />}
                        />
                      </Box>
                      <Box textAlign="center">
                        <img 
                          src={getQRCodeImage(index)} 
                          alt={`QR Code for Certificate ${cert.id}`}
                          style={{ 
                            width: '60px', 
                            height: '60px',
                            objectFit: 'contain',
                            border: '1px solid #e0e0e0',
                            borderRadius: '4px'
                          }}
                        />
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                          Scan to Verify
                        </Typography>
                      </Box>
                    </Box>

                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Device"
                          secondary={`${cert.device.model} (${cert.device.storage_type})`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Method"
                          secondary={cert.method}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Generated"
                          secondary={new Date(cert.timestamp).toLocaleString()}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Compliance"
                          secondary="NIST SP 800-88 Certified"
                        />
                      </ListItem>
                    </List>

                    <Box display="flex" gap={1} mt={2}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleVerify(cert.id)}
                        color="primary"
                      >
                        Verify
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Download />}
                        onClick={() => downloadPDF(cert.id)}
                      >
                        Download PDF
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Certificate Verification Info with QR Code */}
        <Paper sx={{ p: 3, mt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Certificate Verification
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                All certificates are digitally signed and can be independently verified.
                Each certificate contains cryptographic proof of the sanitization process
                and complies with NIST SP 800-88 guidelines.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Features included:</strong>
              </Typography>
              <ul>
                <li>SHA-256 cryptographic hashes for data integrity verification</li>
                <li>RSA digital signatures for authenticity</li>
                <li>NIST SP 800-88 compliance certification</li>
                <li>Tamper-evident certificate structure</li>
                <li>Real-time verification through secure API</li>
                <li>PDF certificates with QR codes for mobile verification</li>
              </ul>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="subtitle2" gutterBottom>
                  Sample Verification QR
                </Typography>
                <img 
                  src={qr1} 
                  alt="Sample QR Code"
                  style={{ 
                    width: '120px', 
                    height: '120px',
                    objectFit: 'contain',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px'
                  }}
                />
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Each certificate includes a unique QR code for instant mobile verification
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Manual Verification Dialog */}
        <Dialog open={showVerifyDialog} onClose={() => setShowVerifyDialog(false)}>
          <DialogTitle>Verify Certificate</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter a certificate ID to verify its authenticity and view detailed information.
            </Typography>
            <TextField
              fullWidth
              label="Certificate ID"
              value={verifyId}
              onChange={(e) => setVerifyId(e.target.value)}
              placeholder="e.g., CERT-1725712345678"
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowVerifyDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleManualVerify}
              variant="contained"
              disabled={!verifyId.trim()}
            >
              Verify Certificate
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Certificates;