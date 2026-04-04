import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, IconButton, Tooltip } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const blobsRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: <SmartToyIcon sx={{ fontSize: 40 }} />,
      title: 'AI-Powered Support',
      description: 'Get instant answers with our advanced RAG-based AI assistant powered by Gemini.',
      gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      title: 'Lightning Fast',
      description: 'Real-time responses with semantic search for accurate, context-aware solutions.',
      gradient: 'linear-gradient(135deg, #06b6d4, #10b981)',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Secure & Private',
      description: 'Enterprise-grade security with encrypted communications and data protection.',
      gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    },
    {
      icon: <AutoAwesomeIcon sx={{ fontSize: 40 }} />,
      title: 'Smart Escalation',
      description: 'Automatic confidence scoring with seamless human handoff when needed.',
      gradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Interactive 3D Blobs */}
      <Box ref={blobsRef} className="interactive-blobs">
        <Box
          className="mega-blob blob-1"
          sx={{
            transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)`,
          }}
        />
        <Box
          className="mega-blob blob-2"
          sx={{
            transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)`,
          }}
        />
        <Box
          className="mega-blob blob-3"
          sx={{
            transform: `translate(${mousePos.x * 15}px, ${mousePos.y * -25}px)`,
          }}
        />
        <Box
          className="mega-blob blob-4"
          sx={{
            transform: `translate(${mousePos.x * -25}px, ${mousePos.y * 15}px)`,
          }}
        />
      </Box>

      {/* Navbar */}
      <Box
        component="nav"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          py: 2,
          px: { xs: 2, md: 6 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backdropFilter: 'blur(20px)',
          background: 'rgba(3, 0, 20, 0.6)',
          borderBottom: '1px solid rgba(99, 102, 241, 0.1)',
        }}
      >
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
            }}
          >
            <SupportAgentIcon sx={{ color: '#fff', fontSize: 24 }} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #f5f5f5, #a78bfa)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
            }}
          >
            DRP AI
          </Typography>
        </Box>

        {/* Auth Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user ? (
            <>
              <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                Hi, {user.fullName}
              </Typography>
              <Tooltip title="Logout">
                <IconButton
                  onClick={logout}
                  sx={{
                    color: 'rgba(255,255,255,0.5)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    '&:hover': { color: '#f43f5e', borderColor: '#f43f5e', background: 'rgba(244, 63, 94, 0.1)' },
                  }}
                >
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <>
              <Button
                onClick={() => navigate('/login')}
                startIcon={<LoginIcon />}
                sx={{
                  px: 2.5,
                  py: 1,
                  borderRadius: '12px',
                  color: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#6366f1',
                    background: 'rgba(99, 102, 241, 0.1)',
                    color: '#fff',
                  },
                }}
              >
                Login
              </Button>
              <Button
                onClick={() => navigate('/register')}
                startIcon={<PersonAddIcon />}
                variant="contained"
                sx={{
                  px: 2.5,
                  py: 1,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  fontWeight: 600,
                  boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 30px rgba(99, 102, 241, 0.5)',
                  },
                }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Hero Section */}
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 1,
          pt: { xs: 16, md: 20 },
          pb: { xs: 8, md: 12 },
          textAlign: 'center',
        }}
      >
        {/* Floating Badge */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 2.5,
            py: 1,
            mb: 4,
            borderRadius: '50px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            animation: 'fadeInUp 0.8s ease-out',
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 10px #10b981',
              animation: 'statusPulse 2s infinite',
            }}
          />
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500, letterSpacing: '0.5px' }}>
            Powered by Gemini AI & RAG Technology
          </Typography>
        </Box>

        {/* Main Heading */}
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2.8rem', sm: '3.5rem', md: '4.5rem', lg: '5.5rem' },
            fontWeight: 900,
            lineHeight: 1.1,
            mb: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 30%, #6366f1 50%, #06b6d4 70%, #ec4899 100%)',
            backgroundSize: '200% auto',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'fadeInUp 0.8s ease-out 0.1s both, gradientShift 8s ease infinite',
            letterSpacing: '-2px',
          }}
        >
          Customer Support
          <br />
          <Box component="span" sx={{ color: '#06b6d4' }}>Reimagined</Box>
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="h5"
          sx={{
            color: 'rgba(255,255,255,0.6)',
            maxWidth: 700,
            mx: 'auto',
            mb: 5,
            fontWeight: 400,
            lineHeight: 1.6,
            animation: 'fadeInUp 0.8s ease-out 0.2s both',
          }}
        >
          Experience the future of customer support with AI that understands context,
          learns from your knowledge base, and delivers instant, accurate solutions.
        </Typography>

        {/* CTA Buttons */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            justifyContent: 'center',
            mb: 6,
            animation: 'fadeInUp 0.8s ease-out 0.3s both',
          }}
        >
          <Button
            onClick={() => navigate('/ticket')}
            variant="contained"
            size="large"
            startIcon={<SupportAgentIcon />}
            className="hero-btn-primary"
            sx={{
              px: 4,
              py: 1.8,
              fontSize: '1.1rem',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
              backgroundSize: '200% auto',
              fontWeight: 700,
              boxShadow: '0 8px 40px rgba(99, 102, 241, 0.4), 0 0 60px rgba(139, 92, 246, 0.2)',
              transition: 'all 0.4s ease',
              '&:hover': {
                backgroundPosition: 'right center',
                transform: 'translateY(-3px) scale(1.02)',
                boxShadow: '0 12px 50px rgba(99, 102, 241, 0.5), 0 0 80px rgba(139, 92, 246, 0.3)',
              },
            }}
          >
            Raise Support Ticket
          </Button>
          <Button
            onClick={() => user ? navigate('/chat') : navigate('/login')}
            variant="outlined"
            size="large"
            startIcon={<SmartToyIcon />}
            sx={{
              px: 4,
              py: 1.8,
              fontSize: '1.1rem',
              borderRadius: '16px',
              borderWidth: '2px',
              borderColor: 'rgba(99, 102, 241, 0.5)',
              color: '#fff',
              fontWeight: 700,
              backdropFilter: 'blur(10px)',
              background: 'rgba(99, 102, 241, 0.1)',
              transition: 'all 0.4s ease',
              '&:hover': {
                borderColor: '#6366f1',
                background: 'rgba(99, 102, 241, 0.2)',
                transform: 'translateY(-3px)',
                boxShadow: '0 8px 30px rgba(99, 102, 241, 0.3)',
              },
            }}
          >
            Try AI Assistant
          </Button>
        </Box>

        {/* Scroll Indicator */}
        <IconButton
          onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
          sx={{
            animation: 'float3D 3s ease-in-out infinite, fadeInUp 0.8s ease-out 0.5s both',
            color: 'rgba(255,255,255,0.4)',
            '&:hover': { color: '#6366f1' },
          }}
        >
          <KeyboardArrowDownIcon sx={{ fontSize: 40 }} />
        </IconButton>
      </Container>

      {/* Features Section */}
      <Box
        id="features"
        sx={{
          position: 'relative',
          zIndex: 1,
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              fontWeight: 800,
              mb: 2,
              background: 'linear-gradient(135deg, #f5f5f5, #a78bfa, #6366f1)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Why Choose DRP AI?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.5)',
              mb: 8,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Enterprise-grade AI customer support that scales with your business
          </Typography>

          {/* Feature Cards */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
              gap: 3,
            }}
          >
            {features.map((feature, index) => (
              <Box
                key={index}
                className="feature-card"
                sx={{
                  p: 4,
                  borderRadius: '24px',
                  background: 'rgba(8, 8, 30, 0.6)',
                  backdropFilter: 'blur(40px)',
                  border: '1px solid rgba(99, 102, 241, 0.15)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  animation: `fadeInUp 0.6s ease-out ${0.1 * index}s both`,
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    borderColor: 'rgba(99, 102, 241, 0.4)',
                    boxShadow: '0 20px 60px rgba(99, 102, 241, 0.2), 0 0 40px rgba(139, 92, 246, 0.1)',
                    '& .feature-icon': {
                      transform: 'scale(1.1) rotateY(10deg)',
                    },
                  },
                }}
              >
                <Box
                  className="feature-icon"
                  sx={{
                    width: 70,
                    height: 70,
                    borderRadius: '20px',
                    background: feature.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    color: '#fff',
                    boxShadow: `0 8px 30px ${feature.gradient.includes('6366f1') ? 'rgba(99,102,241,0.4)' :
                      feature.gradient.includes('06b6d4') ? 'rgba(6,182,212,0.4)' :
                      feature.gradient.includes('f59e0b') ? 'rgba(245,158,11,0.4)' : 'rgba(236,72,153,0.4)'}`,
                    transition: 'transform 0.4s ease',
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 1.5,
                    color: '#fff',
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255,255,255,0.5)',
                    lineHeight: 1.7,
                  }}
                >
                  {feature.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: '32px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1), rgba(6,182,212,0.1))',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #6366f1, #8b5cf6, #06b6d4, transparent)',
              },
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                mb: 2,
                background: 'linear-gradient(135deg, #fff, #a78bfa)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Ready to Transform Your Support?
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'rgba(255,255,255,0.6)', mb: 4, maxWidth: 500, mx: 'auto' }}
            >
              Join thousands of businesses delivering exceptional customer experiences with AI-powered support.
            </Typography>
            <Button
              onClick={() => navigate('/register')}
              variant="contained"
              size="large"
              sx={{
                px: 5,
                py: 1.8,
                fontSize: '1.1rem',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                fontWeight: 700,
                boxShadow: '0 8px 40px rgba(99, 102, 241, 0.4)',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 50px rgba(99, 102, 241, 0.5)',
                },
              }}
            >
              Get Started Free
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          py: 4,
          borderTop: '1px solid rgba(99, 102, 241, 0.1)',
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)' }}>
          © 2026 DRP AI Customer Support. Powered by Gemini AI & RAG Technology.
        </Typography>
      </Box>
    </Box>
  );
};

export default LandingPage;
