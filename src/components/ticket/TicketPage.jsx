import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
  IconButton,
  Tooltip,
  Fab,
  Zoom,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useAuth } from '../../context/AuthContext';
import ticketService from '../../services/ticketService';

const categories = [
  { value: 'technical', label: 'Technical Support', icon: '🔧', color: '#6366f1' },
  { value: 'billing', label: 'Billing & Payments', icon: '💳', color: '#10b981' },
  { value: 'account', label: 'Account Issues', icon: '👤', color: '#8b5cf6' },
  { value: 'feature', label: 'Feature Request', icon: '✨', color: '#f59e0b' },
  { value: 'general', label: 'General Inquiry', icon: '💬', color: '#06b6d4' },
];

const priorities = [
  { value: 'low', label: 'Low', color: '#10b981' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ef4444' },
  { value: 'urgent', label: 'Urgent', color: '#dc2626' },
];

const TicketPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [formData, setFormData] = useState({
    name: user?.fullName || '',
    email: user?.email || '',
    category: '',
    priority: 'medium',
    subject: '',
    description: '',
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const ticketData = {
        category: formData.category,
        priority: formData.priority,
        subject: formData.subject,
        description: formData.description,
      };
      
      await ticketService.createTicket(ticketData);
      setSubmitted(true);
      
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: user?.fullName || '',
          email: user?.email || '',
          category: '',
          priority: 'medium',
          subject: '',
          description: '',
        });
      }, 4000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create ticket. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAIChatClick = () => {
    if (user) {
      navigate('/chat');
    } else {
      navigate('/login', { state: { from: '/ticket' } });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', pb: 10, overflow: 'hidden' }}>
      {/* Interactive 3D Blobs - Lighter & More Vibrant */}
      <Box className="interactive-blobs">
        <Box
          className="mega-blob blob-1"
          sx={{
            transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)`,
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.6) 0%, rgba(139, 92, 246, 0.4) 40%, transparent 70%) !important',
          }}
        />
        <Box
          className="mega-blob blob-2"
          sx={{
            transform: `translate(${mousePos.x * -25}px, ${mousePos.y * -25}px)`,
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.5) 0%, rgba(16, 185, 129, 0.3) 40%, transparent 70%) !important',
          }}
        />
        <Box
          className="mega-blob blob-3"
          sx={{
            transform: `translate(${mousePos.x * 20}px, ${mousePos.y * -20}px)`,
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.5) 0%, rgba(245, 158, 11, 0.3) 40%, transparent 70%) !important',
          }}
        />
        <Box
          className="mega-blob blob-4"
          sx={{
            transform: `translate(${mousePos.x * -15}px, ${mousePos.y * 20}px)`,
          }}
        />
      </Box>

      {/* Floating Particles */}
      <Box className="auth-particles">
        {[...Array(15)].map((_, i) => (
          <Box
            key={i}
            className="auth-particle"
            sx={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
            }}
          />
        ))}
      </Box>

      {/* Navbar - Lighter */}
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
          background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, rgba(3, 0, 20, 0.7) 100%)',
          borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={() => navigate('/')}
            sx={{
              color: 'rgba(255,255,255,0.7)',
              background: 'rgba(99, 102, 241, 0.15)',
              '&:hover': { color: '#fff', background: 'rgba(99,102,241,0.3)', transform: 'translateX(-3px)' },
              transition: 'all 0.3s ease',
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 45,
                height: 45,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 25px rgba(99, 102, 241, 0.5)',
                animation: 'pulseGlow 3s ease-in-out infinite',
              }}
            >
              <SupportAgentIcon sx={{ color: '#fff', fontSize: 26 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #fff, #a78bfa, #06b6d4)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              DRP AI
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user && (
            <Tooltip title="My Dashboard" arrow>
              <IconButton
                onClick={() => navigate('/dashboard')}
                sx={{
                  color: '#fff',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  '&:hover': { background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', transform: 'scale(1.05)' },
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                }}
              >
                <DashboardIcon />
              </IconButton>
            </Tooltip>
          )}
          {user ? (
            <Box sx={{
              px: 2,
              py: 0.8,
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}>
              <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600 }}>
                ✓ {user.fullName}
              </Typography>
            </Box>
          ) : (
            <Button
              onClick={() => navigate('/login')}
              variant="contained"
              sx={{
                px: 3,
                py: 1,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                fontWeight: 600,
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 30px rgba(99, 102, 241, 0.5)',
                },
              }}
            >
              Login to Track
            </Button>
          )}
        </Box>
      </Box>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ pt: 14, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 90,
              height: 90,
              borderRadius: '28px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 40%, #06b6d4 100%)',
              mb: 3,
              boxShadow: '0 15px 50px rgba(99, 102, 241, 0.5), 0 0 80px rgba(139, 92, 246, 0.3)',
              animation: 'float3D 4s ease-in-out infinite',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: -4,
                borderRadius: '32px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4, #ec4899)',
                backgroundSize: '300% 300%',
                animation: 'gradientShift 5s ease infinite',
                zIndex: -1,
                filter: 'blur(20px)',
                opacity: 0.6,
              },
            }}
          >
            <SupportAgentIcon sx={{ fontSize: 45, color: '#fff' }} />
          </Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              mb: 1.5,
              background: 'linear-gradient(135deg, #fff 0%, #a78bfa 30%, #6366f1 60%, #06b6d4 100%)',
              backgroundSize: '200% auto',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradientShift 6s ease infinite',
              letterSpacing: '-1px',
            }}
          >
            Raise a Support Ticket
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: 550, mx: 'auto', fontWeight: 400 }}>
            Fill out the form below and our team will get back to you within 24 hours.
          </Typography>
        </Box>

        {/* Success Message */}
        {submitted && (
          <Alert
            icon={<CheckCircleOutlineIcon sx={{ fontSize: 28 }} />}
            severity="success"
            sx={{
              mb: 4,
              py: 2,
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.15))',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              color: '#10b981',
              fontSize: '1.1rem',
              fontWeight: 600,
              animation: 'fadeInUp 0.5s ease-out',
              boxShadow: '0 10px 40px rgba(16, 185, 129, 0.2)',
            }}
          >
            Your ticket has been submitted successfully! Our team will contact you soon.
          </Alert>
        )}

        {/* Form Card - Visible & Clean */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          className="border-shimmer"
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: '28px',
            background: 'rgba(15, 15, 40, 0.9)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.6), 0 0 50px rgba(99, 102, 241, 0.1)',
          }}
        >
          {/* Personal Info Row */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
            <TextField
              name="name"
              label="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
              sx={inputStyles}
            />
            <TextField
              name="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              fullWidth
              sx={inputStyles}
            />
          </Box>

          {/* Category & Priority Row */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
            <TextField
              name="category"
              label="Category"
              select
              value={formData.category}
              onChange={handleChange}
              required
              fullWidth
              sx={inputStyles}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.value} value={cat.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '8px',
                      background: `${cat.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                    }}>
                      {cat.icon}
                    </Box>
                    <span style={{ fontWeight: 500 }}>{cat.label}</span>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
            <TextField
              name="priority"
              label="Priority"
              select
              value={formData.priority}
              onChange={handleChange}
              required
              fullWidth
              sx={inputStyles}
            >
              {priorities.map((p) => (
                <MenuItem key={p.value} value={p.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: p.color,
                        boxShadow: `0 0 12px ${p.color}`,
                      }}
                    />
                    <span style={{ fontWeight: 500 }}>{p.label}</span>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Subject */}
          <TextField
            name="subject"
            label="Subject"
            value={formData.subject}
            onChange={handleChange}
            required
            fullWidth
            placeholder="Brief summary of your issue"
            sx={{ ...inputStyles, mb: 3 }}
          />

          {/* Description */}
          <TextField
            name="description"
            label="Describe your issue"
            value={formData.description}
            onChange={handleChange}
            required
            fullWidth
            multiline
            rows={8}
            placeholder="Please provide as much detail as possible..."
            sx={{ ...inputStyles, mb: 4 }}
          />

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
              {error}
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            disabled={submitted || loading}
            className="hero-btn-primary"
            sx={{
              py: 2,
              borderRadius: '18px',
              fontSize: '1.2rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 40%, #06b6d4 100%)',
              backgroundSize: '200% auto',
              boxShadow: '0 12px 40px rgba(99, 102, 241, 0.5), 0 0 60px rgba(99, 102, 241, 0.2)',
              transition: 'all 0.4s ease',
              '&:hover': {
                backgroundPosition: 'right center',
                transform: 'translateY(-3px) scale(1.02)',
                boxShadow: '0 15px 50px rgba(99, 102, 241, 0.6), 0 0 80px rgba(99, 102, 241, 0.3)',
              },
              '&:disabled': {
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.5), rgba(6, 182, 212, 0.5))',
              },
            }}
          >
            {submitted ? '✓ Ticket Submitted!' : loading ? 'Submitting...' : 'Submit Ticket'}
          </Button>
        </Box>

        {/* Info Cards - More Vibrant */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3, mt: 5 }}>
          {[
            { icon: '⚡', title: 'Fast Response', desc: 'Under 4 hours', color: '#f59e0b' },
            { icon: '🎯', title: 'Expert Support', desc: 'Technical specialists', color: '#6366f1' },
            { icon: '🔒', title: 'Secure', desc: 'Encrypted & protected', color: '#10b981' },
          ].map((item, i) => (
            <Box
              key={i}
              sx={{
                p: 3,
                borderRadius: '20px',
                background: `linear-gradient(135deg, ${item.color}15, ${item.color}08)`,
                border: `2px solid ${item.color}30`,
                textAlign: 'center',
                transition: 'all 0.4s ease',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: `${item.color}60`,
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: `0 20px 40px ${item.color}20`,
                },
              }}
            >
              <Box sx={{
                fontSize: '2.5rem',
                mb: 1.5,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
              }}>
                {item.icon}
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', mb: 0.5 }}>
                {item.title}
              </Typography>
              <Typography variant="body2" sx={{ color: item.color, fontWeight: 500 }}>
                {item.desc}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>

      {/* AI Chatbot FAB - Enhanced */}
      <Zoom in={true}>
        <Tooltip title={user ? 'Chat with AI Assistant' : 'Login to use AI Assistant'} placement="left">
          <Fab
            onClick={handleAIChatClick}
            sx={{
              position: 'fixed',
              bottom: 32,
              right: 32,
              width: 75,
              height: 75,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)',
              boxShadow: '0 10px 50px rgba(99, 102, 241, 0.6), 0 0 80px rgba(139, 92, 246, 0.4)',
              animation: 'pulseGlow 2.5s ease-in-out infinite',
              transition: 'all 0.4s ease',
              '&:hover': {
                transform: 'scale(1.15) translateY(-5px)',
                boxShadow: '0 15px 60px rgba(99, 102, 241, 0.7), 0 0 100px rgba(139, 92, 246, 0.5)',
              },
            }}
          >
            <SmartToyIcon sx={{ fontSize: 36, color: '#fff' }} />
          </Fab>
        </Tooltip>
      </Zoom>

      {/* AI Chat Label - Enhanced */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 115,
          right: 25,
          px: 2.5,
          py: 1,
          borderRadius: '25px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.15))',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          backdropFilter: 'blur(10px)',
          animation: 'float3D 3s ease-in-out infinite',
          boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
        }}
      >
        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
          💬 Need instant help?
        </Typography>
      </Box>
    </Box>
  );
};

// Clean input styles - Visible
const inputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px',
    background: 'rgba(255,255,255,0.05)',
    '& fieldset': { borderColor: 'rgba(99, 102, 241, 0.3)' },
    '&:hover fieldset': { borderColor: 'rgba(99, 102, 241, 0.5)' },
    '&.Mui-focused fieldset': { borderColor: '#6366f1', borderWidth: '2px' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#818cf8' },
  '& .MuiInputBase-input': { color: '#fff' },
};

export default TicketPage;
