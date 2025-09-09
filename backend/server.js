const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

function authenticateToken(req, res, next) {
  // DEMO: Skip JWT verification
  return next();
}
  // --- For real JWT token validation (if you want to enable):
  /*
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  // Optional: Add real verification here
  jwt.verify(token, 'your_secret_key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
  */
// Enhanced mock data with more realistic details
let devices = [
  {
    id: '1',
    serial: 'SSD-Samsung-970EVO-001',
    model: 'Samsung SSD 970 EVO Plus',
    storage_type: 'SSD',
    size: 512 * 1024 * 1024 * 1024,
    encryption_status: false,
    health: 'Good',
    temperature: '42°C'
  },
  {
    id: '2', 
    serial: 'HDD-Seagate-ST1000-002',
    model: 'Seagate Barracuda 1TB',
    storage_type: 'HDD',
    size: 1024 * 1024 * 1024 * 1024,
    encryption_status: true,
    health: 'Good',
    temperature: '38°C'
  },
  {
    id: '3',
    serial: 'USB-Kingston-DT100-003',
    model: 'Kingston DataTraveler 100',
    storage_type: 'USB',
    size: 32 * 1024 * 1024 * 1024,
    encryption_status: false,
    health: 'Good',
    temperature: 'N/A'
  }
];

let jobs = [];
let certificates = [];
let stats = {
  totalDevices: 3,
  completedWipes: 0,
  activeCertificates: 0,
  ongoingOperations: 0
};

app.use(cors());
app.use(express.json());

// Enhanced login with better response
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin') {
    res.json({ 
      success: true, 
      token: 'demo-jwt-token-12345',
      user: { 
        id: 1, 
        username: 'admin',
        role: 'administrator',
        email: 'admin@sanitiq.com'
      }
    });
  } else {
    res.status(401).json({ 
      success: false, 
      error: 'Invalid credentials. Use admin/admin for demo.' 
    });
  }
});

// Get dashboard stats
app.get('/api/stats', (req, res) => {
  stats.totalDevices = devices.length;
  stats.completedWipes = jobs.filter(j => j.status === 'completed').length;
  stats.activeCertificates = certificates.length;
  stats.ongoingOperations = jobs.filter(j => j.status === 'running').length;
  
  res.json(stats);
});

// Get devices with enhanced info
app.get('/api/devices', (req, res) => {
  setTimeout(() => {
    res.json({ success: true, devices });
  }, 500); // Simulate network delay
});

// Start sanitization with realistic timing
app.post('/api/sanitize', (req, res) => {
  const { device_id, method } = req.body;
  const device = devices.find(d => d.id === device_id);
  
  if (!device) {
    return res.status(404).json({ success: false, error: 'Device not found' });
  }

  const jobId = `job-${Date.now()}`;
  const methodDurations = {
    'single_pass': 30,
    'dod_5220_22_m': 90, 
    'secure_erase': 20,
    'nist_sp_800_88': 60
  };

  const newJob = {
    id: jobId,
    device_id,
    device,
    method,
    status: 'running',
    progress: 0,
    started_at: new Date(),
    estimated_duration: methodDurations[method] || 60,
    current_operation: 'Initializing...'
  };

  jobs.push(newJob);
  simulateRealisticProgress(jobId, methodDurations[method] || 60);

  res.json({ success: true, job_id: jobId, message: 'Sanitization started' });
});

// Enhanced progress simulation
function simulateRealisticProgress(jobId, duration) {
  const job = jobs.find(j => j.id === jobId);
  if (!job) return;

  const steps = [
    'Initializing device...',
    'Analyzing storage structure...',
    'Starting sanitization pass...',
    'Overwriting data blocks...',
    'Verifying sanitization...',
    'Generating verification hash...',
    'Finalizing process...'
  ];

  let currentStep = 0;
  const totalSteps = duration * 10; // 100ms intervals
  const stepProgress = 100 / totalSteps;

  const progressInterval = setInterval(() => {
    job.progress += stepProgress + (Math.random() * 2 - 1); // Add some variance
    job.progress = Math.min(job.progress, 100);
    
    // Update current operation
    const stepIndex = Math.floor((job.progress / 100) * steps.length);
    if (stepIndex < steps.length) {
      job.current_operation = steps[stepIndex];
    }
    
    if (job.progress >= 100) {
      job.progress = 100;
      job.status = 'completed';
      job.completed_at = new Date();
      job.current_operation = 'Completed successfully';
      stats.completedWipes++;
      stats.ongoingOperations--;
      clearInterval(progressInterval);
      
      // Auto-generate certificate
      setTimeout(() => generateAutoCertificate(job), 1000);
    }
  }, 100);
  
  stats.ongoingOperations++;
}

// Enhanced auto-certificate generation with crypto data
function generateAutoCertificate(job) {
  const preWipeHash = generateMockHash();
  const postWipeHash = generateMockHash();
  const digitalSignature = generateMockSignature();
  
  const certificate = {
    id: `CERT-${Date.now()}`,
    job_id: job.id,
    device: job.device,
    method: job.method,
    timestamp: new Date().toISOString(),
    status: 'VERIFIED',
    compliance: 'NIST SP 800-88',
    verification_url: `http://localhost:3000/verify/CERT-${Date.now()}`,
    pre_wipe_hash: preWipeHash,
    post_wipe_hash: postWipeHash,
    signature: digitalSignature,
    certificate_data: {
      device_info: job.device,
      sanitization_result: {
        method_used: job.method,
        passes_completed: getPassesForMethod(job.method),
        duration: (new Date().getTime() - new Date(job.started_at).getTime()) / 1000,
        status: 'COMPLETED',
        effectiveness: 'PASS'
      }
    }
  };

  certificates.push(certificate);
  stats.activeCertificates++;
  
  console.log(`✅ Certificate generated: ${certificate.id} with crypto verification`);
}

// Get job status with enhanced info
app.get('/api/jobs/:jobId', (req, res) => {
  const job = jobs.find(j => j.id === req.params.jobId);
  if (!job) {
    return res.status(404).json({ success: false, error: 'Job not found' });
  }
  res.json({ success: true, job });
});

// Get ongoing jobs
app.get('/api/jobs/ongoing', (req, res) => {
  const ongoingJobs = jobs.filter(j => j.status === 'running');
  res.json({ success: true, jobs: ongoingJobs });
});

// Generate certificate
app.post('/api/certificates', (req, res) => {
  const { job_id } = req.body;
  const job = jobs.find(j => j.id === job_id);
  
  if (!job || job.status !== 'completed') {
    return res.status(400).json({ 
      success: false, 
      error: 'Job not completed or not found' 
    });
  }

  const existingCert = certificates.find(c => c.job_id === job_id);
  if (existingCert) {
    return res.json({ success: true, certificate: existingCert });
  }

  generateAutoCertificate(job);
  const certificate = certificates[certificates.length - 1];
  res.json({ success: true, certificate });
});

// Get certificates
app.get('/api/certificates', (req, res) => {
  res.json({ success: true, certificates });
});

// Enhanced certificate verification endpoint
app.post('/api/certificates/verify', (req, res) => {
  const { certificate_id } = req.body;
  
  const certificate = certificates.find(c => 
    c.id.includes(certificate_id) || 
    certificate_id.includes(c.id) ||
    c.id === certificate_id
  );
  
  if (!certificate) {
    return res.status(404).json({ 
      success: false, 
      error: 'Certificate not found',
      valid: false 
    });
  }

  // Enhanced certificate data with all cryptographic details
  const enhancedCertificate = {
    certificate_id: certificate.id,
    device_info: {
      serial: certificate.device.serial,
      model: certificate.device.model,
      storage_type: certificate.device.storage_type,
      size: certificate.device.size,
      encryption_status: certificate.device.encryption_status || false
    },
    sanitization: {
      method: certificate.method,
      passes: getPassesForMethod(certificate.method),
      timestamp: certificate.timestamp,
      duration: Math.random() * 120 + 30,
      status: 'COMPLETED'
    },
    verification: {
      pre_wipe_hash: certificate.pre_wipe_hash || generateMockHash(),
      post_wipe_hash: certificate.post_wipe_hash || generateMockHash(),
      effectiveness: 'PASS'
    },
    compliance: {
      standard: 'NIST SP 800-88',
      classification: certificate.device.storage_type === 'SSD' ? 'PURGE' : 'CLEAR'
    },
    signature: certificate.signature || generateMockSignature(),
    verification_url: certificate.verification_url || `http://localhost:3000/verify/${certificate.id}`,
    pdf_path: `certificates/${certificate.id}.pdf`
  };

  res.json({ 
    success: true, 
    valid: true,
    certificate: enhancedCertificate
  });
});

// Enhanced PDF generation function
function generatePDFContent(certificate) {
  const pdfTemplate = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
/F2 6 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 1200
>>
stream
BT
/F2 20 Tf
306 750 Td
-90 0 Td
(SanitiQ Data Sanitization Certificate) Tj
0 -40 Td
/F2 14 Tf
(Certificate ID: ${certificate.id}) Tj
0 -30 Td
/F1 12 Tf
0 -20 Td
(Device: ${certificate.device.model} - ${certificate.device.storage_type}) Tj
0 -15 Td
(Capacity: ${Math.round(certificate.device.size / (1024**3))} GB) Tj
0 -15 Td
(Serial: ${certificate.device.serial}) Tj
0 -30 Td
/F2 12 Tf
0.2 0.4 0.9 rg
(Cryptographic Verification) Tj
0 0 0 rg
/F1 10 Tf
0 -20 Td
(Pre-wipe Hash (SHA-256):) Tj
0 -12 Td
(${certificate.pre_wipe_hash || generateMockHash()}) Tj
0 -20 Td
(Post-wipe Hash (SHA-256):) Tj
0 -12 Td
(${certificate.post_wipe_hash || generateMockHash()}) Tj
0 -20 Td
(Digital Signature:) Tj
0 -12 Td
(RSA-SHA256:${certificate.signature || generateMockSignature()}) Tj
0 -25 Td
/F2 12 Tf
0.2 0.4 0.9 rg
(Effectiveness: ) Tj
0 0.6 0 rg
(PASS) Tj
0 0 0 rg
0 -30 Td
/F1 10 Tf
(Generated: ${new Date(certificate.timestamp).toLocaleString()}) Tj
0 -15 Td
(Method: ${certificate.method}) Tj
0 -15 Td
(Compliance: NIST SP 800-88) Tj
0 -30 Td
(Verification QR Code: Scan to verify online) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

6 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica-Bold
>>
endobj

xref
0 7
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000136 00000 n 
0000000271 00000 n 
0000001524 00000 n 
0000001593 00000 n 
trailer
<<
/Size 7
/Root 1 0 R
>>
startxref
1667
%%EOF`;

  return Buffer.from(pdfTemplate);
}

// Enhanced PDF download endpoint
app.get('/api/certificates/:certId/pdf', (req, res) => {
  const { certId } = req.params;
  const certificate = certificates.find(c => 
    c.id.includes(certId) || 
    certId.includes(c.id) ||
    c.id === certId
  );
  
  if (!certificate) {
    return res.status(404).json({ success: false, error: 'Certificate not found' });
  }

  // Enhanced certificate with crypto data for PDF
  const enhancedCert = {
    ...certificate,
    pre_wipe_hash: certificate.pre_wipe_hash || generateMockHash(),
    post_wipe_hash: certificate.post_wipe_hash || generateMockHash(),
    signature: certificate.signature || generateMockSignature()
  };

  const pdfContent = generatePDFContent(enhancedCert);
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="SanitiQ_Certificate_${certId}.pdf"`);
  res.send(pdfContent);
});

// Enhanced helper functions
function getPassesForMethod(method) {
  const methodPasses = {
    'single_pass': 1,
    'dod_5220_22_m': 3,
    'secure_erase': 1,
    'nist_sp_800_88': 1
  };
  return methodPasses[method] || 1;
}

function generateMockHash() {
  return 'sha256:' + Array.from({length: 64}, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

function generateMockSignature() {
  return 'RSA-SHA256:' + Array.from({length: 128}, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

// Create demo certificate on startup
setTimeout(() => {
  const demoJob = {
    id: 'demo-completed-123',
    device_id: '1',
    device: devices[0],
    method: 'secure_erase',
    status: 'completed',
    progress: 100,
    started_at: new Date(Date.now() - 900000), // 15 minutes ago
    completed_at: new Date(Date.now() - 600000), // 10 minutes ago
    current_operation: 'Completed successfully'
  };
  jobs.push(demoJob);
  generateAutoCertificate(demoJob);
  
  console.log('✅ Demo data loaded');
}, 1000);
// File scanning endpoint
app.post('/api/devices/:deviceId/scan',authenticateToken,  async (req, res) => {
  const { deviceId } = req.params;
  const device = devices.find(d => d.id === deviceId);
  
  if (!device) {
    return res.status(404).json({ success: false, error: 'Device not found' });
  }

  // Mock file detection
  const mockFiles = {
    '.pdf': Math.floor(Math.random() * 50) + 10,
    '.jpg': Math.floor(Math.random() * 200) + 50,
    '.jpeg': Math.floor(Math.random() * 100) + 25,
    '.png': Math.floor(Math.random() * 80) + 20,
    '.doc': Math.floor(Math.random() * 30) + 5,
    '.docx': Math.floor(Math.random() * 40) + 10,
    '.xls': Math.floor(Math.random() * 20) + 3,
    '.xlsx': Math.floor(Math.random() * 25) + 5,
    '.mp4': Math.floor(Math.random() * 15) + 2,
    '.mp3': Math.floor(Math.random() * 60) + 15,
    '.exe': Math.floor(Math.random() * 10) + 1,
    '.dll': Math.floor(Math.random() * 100) + 20,
    '.tmp': Math.floor(Math.random() * 500) + 100,
    '.log': Math.floor(Math.random() * 50) + 10,
  };

  res.json({ success: true, detectedFiles: mockFiles });
});

// Enhanced sanitization with file processing
app.post('/api/sanitize/files', authenticateToken, async (req, res) => {
  const { device_id, method, selectedFileTypes } = req.body;
  const device = devices.find(d => d.id === device_id);
  
  if (!device) {
    return res.status(404).json({ success: false, error: 'Device not found' });
  }

  const jobId = `job-${Date.now()}`;
  
  // Generate mock files to process
  const filesToProcess = selectedFileTypes.flatMap(fileType => {
    const count = Math.floor(Math.random() * 10) + 1;
    return Array.from({ length: count }, (_, i) => ({
      name: `file_${i + 1}${fileType}`,
      path: `/Users/Documents/file_${i + 1}${fileType}`,
      size: Math.floor(Math.random() * 10485760), // Up to 10MB
      type: fileType,
      status: 'pending',
      progress: 0
    }));
  });

  const newJob = {
    id: jobId,
    device_id,
    device,
    method,
    status: 'running',
    progress: 0,
    started_at: new Date(),
    files: filesToProcess,
    currentFile: null
  };

  jobs.push(newJob);
  simulateFileProcessing(jobId);

  res.json({ success: true, job_id: jobId });
});

// File processing simulation
function simulateFileProcessing(jobId) {
  const job = jobs.find(j => j.id === jobId);
  if (!job || !job.files) return;

  let fileIndex = 0;
  const processNextFile = () => {
    if (fileIndex >= job.files.length) {
      job.status = 'completed';
      job.progress = 100;
      job.completed_at = new Date();
      stats.completedWipes++;
      setTimeout(() => generateAutoCertificate(job), 1000);
      return;
    }

    const currentFile = job.files[fileIndex];
    currentFile.status = 'processing';
    job.currentFile = currentFile.name;
    
    // Simulate file processing time
    const processingTime = Math.random() * 2000 + 500; // 0.5-2.5 seconds per file
    
    const fileProgressInterval = setInterval(() => {
      currentFile.progress += Math.random() * 20 + 5;
      
      if (currentFile.progress >= 100) {
        currentFile.progress = 100;
        currentFile.status = Math.random() > 0.05 ? 'completed' : 'failed'; // 95% success rate
        clearInterval(fileProgressInterval);
        
        fileIndex++;
        job.progress = (fileIndex / job.files.length) * 100;
        
        setTimeout(processNextFile, 200); // Small delay between files
      }
    }, processingTime / 20);
  };

  processNextFile();
}

app.listen(PORT, () => {
  console.log(`
🚀 SanitiQ Prototype Backend Started!
📡 Server: http://localhost:${PORT}
📊 Devices: ${devices.length} mock devices loaded
👤 Login: admin / admin
⏰ Started: ${new Date().toLocaleTimeString()}
  `);
});