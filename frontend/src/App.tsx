import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Sanitize from './components/Sanitize';
import Certificates from './components/Certificates';
import Verification from './components/Verification';
const theme = createTheme({
  palette: {
    primary: { main: '#2563EB' },
    secondary: { main: '#16A34A' },
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/sanitize" element={<Sanitize />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/verify/:certId" element={<Verification />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;