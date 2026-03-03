import React from 'react';
import { Container, Box, Typography, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import AIChatBox from './components/ai/AIChatBox';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
    secondary: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#7c3aed',
    },
    background: {
      default: '#000000',
      paper: 'rgba(10, 10, 10, 0.8)',
    },
    text: {
      primary: '#f5f5f5',
      secondary: 'rgba(255, 255, 255, 0.55)',
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: '#000' }}>
        {/* Ambient Background */}
        <Box className="scene-bg" />
        <Box className="grid-overlay" />
        <Box className="noise-texture" />
        <Box className="ambient-orb ambient-orb-1" />
        <Box className="ambient-orb ambient-orb-2" />
        <Box className="ambient-orb ambient-orb-3" />

        {/* Micro Particles */}
        <Box className="micro-particles">
          {[...Array(6)].map((_, i) => (
            <Box key={i} className="micro-particle" />
          ))}
        </Box>

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, py: 3, px: { xs: 1.5, md: 3 } }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                mb: 2,
                animation: 'float3D 5s ease-in-out infinite',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
                fontSize: '1.8rem',
              }}
            >
              🤖
            </Box>
            <Typography
              variant="h4"
              sx={{
                background: 'linear-gradient(135deg, #f5f5f5 0%, rgba(255,255,255,0.7) 100%)',
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
                color: 'rgba(255,255,255,0.35)',
                fontWeight: 400,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                fontSize: '0.7rem',
              }}
            >
              Powered by Gemini AI & RAG
            </Typography>
          </Box>

          {/* Main Card */}
          <Box
            className="border-shimmer"
            sx={{
              borderRadius: '24px',
              overflow: 'hidden',
              maxWidth: 860,
              mx: 'auto',
              background: 'rgba(8, 8, 8, 0.85)',
              backdropFilter: 'blur(60px) saturate(1.2)',
              WebkitBackdropFilter: 'blur(60px) saturate(1.2)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.8), 0 0 60px rgba(59, 130, 246, 0.04)',
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
      </Box>
    </ThemeProvider>
  );
}

export default App;
