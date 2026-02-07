import React from 'react';
import { Container, Box, Typography, Paper, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import AIChatBox from './components/ai/AIChatBox';
import './App.css';

// Dark 3D Futuristic Theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00f5ff', // Cyan neon
      light: '#6effff',
      dark: '#00c2cc',
    },
    secondary: {
      main: '#ff00ff', // Magenta neon
      light: '#ff66ff',
      dark: '#cc00cc',
    },
    background: {
      default: '#0a0a0f',
      paper: 'rgba(20, 20, 35, 0.8)',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", sans-serif',
    h4: {
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
          background: `
            linear-gradient(180deg, #030305 0%, #0a0a15 30%, #050510 60%, #030305 100%)
          `,
          py: 2,
          px: 2,
        }}
      >
        {/* Animated 3D Orbs */}
        <Box className="orb orb-1" />
        <Box className="orb orb-2" />
        <Box className="orb orb-3" />
        <Box className="orb orb-4" />
        
        {/* Aurora Effect */}
        <Box className="aurora" />
        
        {/* Hexagon Grid Pattern */}
        <Box className="hex-grid" />
        
        {/* Floating Particles */}
        <Box className="particles">
          {[...Array(10)].map((_, i) => (
            <Box key={i} className="particle" />
          ))}
        </Box>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <Box 
            sx={{ 
              textAlign: 'center', 
              mb: 2,
              pt: 1
            }}
          >
            <Box 
              component="span"
              sx={{
                display: 'inline-block',
                fontSize: '3rem',
                mb: 1,
                animation: 'float3D 4s ease-in-out infinite',
                filter: 'drop-shadow(0 0 20px rgba(0, 245, 255, 0.8))'
              }}
            >
              🤖
            </Box>
            <Typography 
              variant="h3" 
              sx={{ 
                background: 'linear-gradient(135deg, #00f5ff 0%, #8b5cf6 50%, #ff00ff 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 900,
                mb: 0.5,
                letterSpacing: '-2px',
                fontSize: { xs: '2rem', md: '3rem' },
                animation: 'textGlow 3s ease-in-out infinite',
              }}
            >
              AI Customer Support
            </Typography>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: 'rgba(255,255,255,0.6)',
                fontWeight: 400,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                fontSize: '0.8rem'
              }}
            >
              Powered by Gemini AI & Vector Embeddings
            </Typography>
          </Box>

          {/* Main Chat Container */}
          <Paper 
            elevation={24}
            className="shimmer"
            sx={{ 
              borderRadius: 4,
              overflow: 'hidden',
              maxWidth: 950,
              mx: 'auto',
              background: 'rgba(8, 8, 18, 0.95)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(0, 245, 255, 0.15)',
              boxShadow: `
                0 30px 60px -15px rgba(0, 0, 0, 0.6),
                0 0 50px rgba(0, 245, 255, 0.08),
                0 0 100px rgba(139, 92, 246, 0.05),
                inset 0 1px 0 rgba(255, 255, 255, 0.08)
              `,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #00f5ff, #ff00ff, transparent)',
              }
            }}
          >
            <Box sx={{ height: '680px' }}>
              <AIChatBox ticketId={null} />
            </Box>
          </Paper>

          {/* Footer */}
          <Box sx={{ textAlign: 'center', mt: 2, pb: 2 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255,255,255,0.4)',
                fontSize: '0.75rem'
              }}
            >
              ✨ Semantic search with real-time confidence scoring
            </Typography>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
