import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Card, CardContent, Box, Button,
  Alert, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, CircularProgress,
  AppBar, Toolbar, Divider, Grid
} from '@mui/material';
import {
  VerifiedUser, Security, Download, ArrowBack,
  CheckCircle, Error, Info
} from '@mui/icons-material';
import axios from 'axios';

// Import QR code images
import qr1 from './img/qr1.png';
import qr2 from './img/qr2.png';
import qr3 from './img/qr3.png';

interface CertificateData {
  certificate_id: string;
  device_info: {
    serial: string;
    model: string;
    storage_type: string;
    size: number;
    encryption_status: boolean;
  };
  sanitization: {
    method: string;
    passes: number;
    timestamp: string;
    duration: number;
    status: string;
  };
  verification: {
    pre_wipe_hash: string;
    post_wipe_hash: string;
    effectiveness: string;
  };
  compliance: {
    standard: string;
    classification: string;
  };
  signature: string;
  verification_url: string;
  pdf_path?: string;
}

const Verification: React.FC = () => {
  const { certId } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');

  // Get random QR code image
  const getQRCodeImage = () => {
    const qrImages = [qr1, qr2, qr3];
    return qrImages[Math.floor(Math.random() * qrImages.length)];
  };

  useEffect(() => {
    if (certId) {
      verifyCertificate(certId);
    }
  }, [certId]);

  const verifyCertificate = async (certificateId: string) => {
    try {
      setLoading(true);
      const response = await axios.post('https://sanitiq-prototype.onrender.com/api/certificates/verify', {
        certificate_id: certificateId
      });

      if (response.data.success) {
        setCertificate(response.data.certificate);
        setVerified(response.data.valid);
      } else {
        setError(response.data.error || 'Verification failed');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Network error during verification');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!certificate) return;
    
    try {
      const response = await axios.get(
        `https://sanitiq-prototype.onrender.com/api/certificates/${certificate.certificate_id}/pdf`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${certificate.certificate_id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" onClick={() => navigate('/')} startIcon={<ArrowBack />}>
            Back
          </Button>
          <Typography variant="h6" sx={{ ml: 2 }}>
            Certificate Verification
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Certificate Verification Results
        </Typography>

        {error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : certificate ? (
          <>
            {/* Verification Status */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  {verified ? (
                    <CheckCircle color="success" sx={{ mr: 2, fontSize: 40 }} />
                  ) : (
                    <Error color="error" sx={{ mr: 2, fontSize: 40 }} />
                  )}
                  <Box>
                    <Typography variant="h5" color={verified ? 'success.main' : 'error.main'}>
                      {verified ? 'Certificate Verified' : 'Certificate Invalid'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Certificate ID: {certificate.certificate_id}
                    </Typography>
                  </Box>
                </Box>
                
                <Box display="flex" gap={2} mt={2}>
                  <Chip 
                    icon={<VerifiedUser />}
                    label={certificate.sanitization.status}
                    color={certificate.sanitization.status === 'COMPLETED' ? 'success' : 'warning'}
                  />
                  <Chip 
                    icon={<Security />}
                    label={certificate.compliance.standard}
                    variant="outlined"
                  />
                  <Chip 
                    label={certificate.compliance.classification}
                    variant="outlined"
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Device Information */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Device Information
                </Typography>
                <TableContainer>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell><strong>Serial Number</strong></TableCell>
                        <TableCell>{certificate.device_info.serial}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Model</strong></TableCell>
                        <TableCell>{certificate.device_info.model}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Storage Type</strong></TableCell>
                        <TableCell>{certificate.device_info.storage_type}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Capacity</strong></TableCell>
                        <TableCell>{(certificate.device_info.size / (1024**3)).toFixed(1)} GB</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Encryption Status</strong></TableCell>
                        <TableCell>
                          {certificate.device_info.encryption_status ? 'Encrypted' : 'Not Encrypted'}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* Sanitization Details */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Sanitization Process
                </Typography>
                <TableContainer>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell><strong>Method Used</strong></TableCell>
                        <TableCell>{certificate.sanitization.method}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Passes Completed</strong></TableCell>
                        <TableCell>{certificate.sanitization.passes}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Duration</strong></TableCell>
                        <TableCell>{certificate.sanitization.duration.toFixed(2)} seconds</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Completed At</strong></TableCell>
                        <TableCell>{new Date(certificate.sanitization.timestamp).toLocaleString()}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* Enhanced Verification Hashes */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Cryptographic Verification
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom color="primary">
                        Pre-wipe Hash (SHA-256):
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace', 
                          wordBreak: 'break-all',
                          backgroundColor: '#f5f5f5',
                          padding: 1,
                          borderRadius: 1
                        }}
                      >
                        {certificate.verification.pre_wipe_hash}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom color="primary">
                        Post-wipe Hash (SHA-256):
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace', 
                          wordBreak: 'break-all',
                          backgroundColor: '#f5f5f5',
                          padding: 1,
                          borderRadius: 1
                        }}
                      >
                        {certificate.verification.post_wipe_hash}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom color="primary">
                        Digital Signature:
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace', 
                          wordBreak: 'break-all',
                          backgroundColor: '#f5f5f5',
                          padding: 1,
                          borderRadius: 1
                        }}
                      >
                        {certificate.signature.substring(0, 100)}...
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="subtitle2" color="primary">
                        Effectiveness:
                      </Typography>
                      <Chip 
                        label={certificate.verification.effectiveness}
                        color={certificate.verification.effectiveness === 'PASS' ? 'success' : 'error'}
                        icon={<CheckCircle />}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box textAlign="center">
                      <Typography variant="subtitle2" gutterBottom>
                        Verification QR Code
                      </Typography>
                      <Box 
                        sx={{ 
                          border: '2px solid #e0e0e0',
                          borderRadius: 2,
                          p: 2,
                          backgroundColor: '#fafafa'
                        }}
                      >
                        <img 
                          src={getQRCodeImage()} 
                          alt="Verification QR Code"
                          style={{ 
                            width: '150px', 
                            height: '150px',
                            objectFit: 'contain'
                          }}
                        />
                        </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Scan with mobile device to verify certificate online
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Actions */}
            <Box display="flex" gap={2} mb={4}>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={downloadPDF}
              >
                Download Certificate PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<Info />}
                onClick={() => navigate('/certificates')}
              >
                View All Certificates
              </Button>
            </Box>
          </>
        ) : (
          <Alert severity="info">
            Certificate not found or invalid certificate ID.
          </Alert>
        )}
      </Container>
    </Box>
  );
};

export default Verification;