import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, CssBaseline, ThemeProvider, createTheme, IconButton, Tooltip, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AIChatBox from './components/ai/AIChatBox';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import EmailVerificationPage from './components/auth/EmailVerificationPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';
import LandingPage from './components/landing/LandingPage';
import TicketPage from './components/ticket/TicketPage';
import DashboardPage from './components/ticket/DashboardPage';
import AgentDashboard from './components/agent/AgentDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#7c3aed',
    },
    background: {
      default: '#030014',
      paper: 'rgba(8, 8, 30, 0.85)',
    },
    text: {
      primary: '#f5f5f5',
      secondary: 'rgba(255, 255, 255, 0.6)',
    },
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    error: { main: '#f43f5e' },
    info: { main: '#06b6d4' },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    h4: { fontWeight: 800 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 12 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500 },
      },
    },
  },
});

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: '#6366f1' }} />
      </Box>
    );
  }
  return user ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg, #030014 0%, #050020 40%, #080030 70%, #030018 100%)' }}>
      {/* Ambient Background */}
      <Box className="scene-bg" />
      <Box className="grid-overlay" />
      <Box className="noise-texture" />
      <Box className="ambient-orb ambient-orb-1" />
      <Box className="ambient-orb ambient-orb-2" />
      <Box className="ambient-orb ambient-orb-3" />

      {/* 3D Floating Shapes */}
      <Box className="floating-shapes">
        {[...Array(8)].map((_, i) => (
          <Box key={i} className={`float-shape float-shape-${i + 1}`} />
        ))}
      </Box>

      {/* Micro Particles */}
      <Box className="micro-particles">
        {[...Array(6)].map((_, i) => (
          <Box key={i} className="micro-particle" />
        ))}
      </Box>

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={user?.role === 'AGENT' ? <Navigate to="/agent-dashboard" /> : <LandingPage />} />
        <Route path="/landing" element={user?.role === 'AGENT' ? <Navigate to="/agent-dashboard" /> : <LandingPage />} />
        <Route path="/ticket" element={<TicketPage />} />

        {/* Auth Routes - redirect to appropriate dashboard if logged in */}
        <Route path="/login" element={user ? <Navigate to={user.role === 'AGENT' ? '/agent-dashboard' : '/'} /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to={user.role === 'AGENT' ? '/agent-dashboard' : '/'} /> : <RegisterPage />} />
        <Route path="/verify-email" element={user ? <Navigate to={user.role === 'AGENT' ? '/agent-dashboard' : '/'} /> : <EmailVerificationPage />} />
        <Route path="/forgot-password" element={user ? <Navigate to={user.role === 'AGENT' ? '/agent-dashboard' : '/'} /> : <ForgotPasswordPage />} />
        <Route path="/reset-password" element={user ? <Navigate to={user.role === 'AGENT' ? '/agent-dashboard' : '/'} /> : <ResetPasswordPage />} />

        {/* Protected Dashboard Route - agents go to agent dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {user?.role === 'AGENT' ? <Navigate to="/agent-dashboard" /> : <DashboardPage />}
            </ProtectedRoute>
          }
        />

        {/* Protected Agent Dashboard Route */}
        <Route
          path="/agent-dashboard"
          element={
            <ProtectedRoute>
              <AgentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected AI Chat Route */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              {user?.role === 'AGENT' ? <Navigate to="/agent-dashboard" /> : (
              <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, py: 3, px: { xs: 1.5, md: 3 } }}>
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 3, position: 'relative' }}>
                  {user && (
                    <Tooltip title="Go Back">
                      <IconButton
                        onClick={() => navigate(-1)}
                        sx={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          color: 'rgba(255,255,255,0.5)',
                          background: 'rgba(99, 102, 241, 0.1)',
                          border: '1px solid rgba(99, 102, 241, 0.2)',
                          '&:hover': {
                            color: '#fff',
                            background: 'rgba(99,102,241,0.2)',
                            transform: 'translateX(-3px)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <ArrowBackIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 60,
                      height: 60,
                      borderRadius: '18px',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
                      mb: 2,
                      animation: 'float3D 5s ease-in-out infinite, pulseGlow 4s ease-in-out infinite',
                      boxShadow: '0 8px 40px rgba(99, 102, 241, 0.4), 0 0 60px rgba(139, 92, 246, 0.2)',
                      fontSize: '1.8rem',
                    }}
                  >
                    🤖
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{
                      background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 40%, #06b6d4 70%, #ec4899 100%)',
                      backgroundSize: '200% auto',
                      animation: 'gradientShift 5s ease infinite',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 800,
                      letterSpacing: '-1.5px',
                      fontSize: { xs: '1.8rem', md: '2.4rem' },
                      mb: 0.5,
                    }}
                  >
                    AI Customer Support
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255,255,255,0.45)',
                      fontWeight: 400,
                      letterSpacing: '3px',
                      textTransform: 'uppercase',
                      fontSize: '0.7rem',
                    }}
                  >
                    Powered by Gemini AI & RAG
                  </Typography>
                  {user && (
                    <Typography variant="body2" sx={{
                      mt: 1, fontSize: '0.75rem',
                      background: 'linear-gradient(90deg, rgba(99,102,241,0.7), rgba(139,92,246,0.7))',
                      backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                      Welcome, {user.fullName}
                    </Typography>
                  )}
                </Box>

                {/* Main Card */}
                <Box
                  className="border-shimmer"
                  sx={{
                    borderRadius: '24px',
                    overflow: 'hidden',
                    maxWidth: 860,
                    mx: 'auto',
                    background: 'rgba(8, 8, 30, 0.8)',
                    backdropFilter: 'blur(60px) saturate(1.4)',
                    WebkitBackdropFilter: 'blur(60px) saturate(1.4)',
                    border: '1px solid rgba(99, 102, 241, 0.15)',
                    boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.8), 0 0 60px rgba(99, 102, 241, 0.08), 0 0 120px rgba(139, 92, 246, 0.04)',
                    height: { xs: '75vh', md: '700px' },
                  }}
                >
                  <AIChatBox ticketId={null} />
                </Box>

                {/* Footer */}
                <Box sx={{ textAlign: 'center', mt: 2.5 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.68rem' }}>
                    Semantic search with real-time confidence scoring
                  </Typography>
                </Box>
              </Container>
              )}
            </ProtectedRoute>
          }
        />
      </Routes>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
