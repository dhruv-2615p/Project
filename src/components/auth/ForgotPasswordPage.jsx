import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, CircularProgress, IconButton } from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import HistoryIcon from '@mui/icons-material/History';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import axios from 'axios';

const AUTH_BASE_URL = process.env.REACT_APP_AUTH_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8081' : '');

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const frontendUrl = window.location.origin;
      await axios.post(`${AUTH_BASE_URL}/api/auth/forgot-password`, { email, frontendUrl });
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to send reset link. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputSx = {
    mb: 3,
    '& .MuiOutlinedInput-root': {
      borderRadius: '14px', bgcolor: 'rgba(99, 102, 241, 0.05)', transition: 'all 0.3s ease',
      '& fieldset': { borderColor: 'rgba(99, 102, 241, 0.25)', borderWidth: '2px' },
      '&:hover fieldset': { borderColor: 'rgba(99, 102, 241, 0.5)' },
      '&.Mui-focused fieldset': { borderColor: '#6366f1', boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
      '&.Mui-focused': { bgcolor: 'rgba(99, 102, 241, 0.08)' },
    },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#818cf8' },
    '& .MuiInputBase-input': { color: '#fff', py: 1.6 },
  };

  const features = [
    { icon: <MarkEmailReadOutlinedIcon sx={{ fontSize: 28 }} />, title: 'Email Recovery', desc: 'We\'ll send a secure reset link to your inbox' },
    { icon: <HistoryIcon sx={{ fontSize: 28 }} />, title: 'Quick Process', desc: 'Reset your password in under a minute' },
    { icon: <VpnKeyIcon sx={{ fontSize: 28 }} />, title: 'Secure Tokens', desc: 'Time-limited tokens ensure account safety' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Box className="interactive-blobs">
        <Box className="mega-blob blob-1" sx={{ transform: `translate(${mousePos.x * 25}px, ${mousePos.y * 25}px)` }} />
        <Box className="mega-blob blob-2" sx={{ transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)` }} />
        <Box className="mega-blob blob-3" sx={{ transform: `translate(${mousePos.x * 15}px, ${mousePos.y * -15}px)` }} />
      </Box>

      <Box className="auth-particles">
        {[...Array(15)].map((_, i) => (
          <Box key={i} className="auth-particle" sx={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s`, animationDuration: `${8 + Math.random() * 10}s` }} />
        ))}
      </Box>

      <IconButton onClick={() => navigate('/login')} sx={{ position: 'absolute', top: 24, left: 24, zIndex: 10, color: 'rgba(255,255,255,0.5)', background: 'rgba(99, 102, 241, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(99, 102, 241, 0.2)', '&:hover': { background: 'rgba(99, 102, 241, 0.2)', color: '#fff', transform: 'translateX(-4px)' }, transition: 'all 0.3s ease' }}>
        <ArrowBackIcon />
      </IconButton>

      <Box sx={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        {/* Left - Branding Panel */}
        <Box sx={{ flex: 1, display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'center', px: { md: 6, lg: 8 } }}>
          <Box sx={{ maxWidth: 480 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <Box sx={{ width: 56, height: 56, borderRadius: '18px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 40px rgba(99, 102, 241, 0.5)', animation: 'pulseGlow 3s ease-in-out infinite' }}>
                <SupportAgentIcon sx={{ color: '#fff', fontSize: 28 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #fff, #a78bfa)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DRP AI</Typography>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1.1, mb: 2, background: 'linear-gradient(135deg, #fff 0%, #e2e8f0 40%, #818cf8 80%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Forgot Your Password? No Worries</Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400, mb: 5, lineHeight: 1.6 }}>We'll help you get back into your account securely.</Typography>

            {features.map((f, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 2, mb: 3, p: 2, borderRadius: '16px', background: 'rgba(99, 102, 241, 0.06)', border: '1px solid rgba(99, 102, 241, 0.12)', transition: 'all 0.3s', '&:hover': { background: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.25)', transform: 'translateX(6px)' } }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '14px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', flexShrink: 0 }}>{f.icon}</Box>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#fff', mb: 0.3 }}>{f.title}</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)' }}>{f.desc}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Right - Form Panel */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 2, md: 6 }, py: 4 }}>
          <Box
            component="form" onSubmit={handleSubmit}
            sx={{
              width: '100%', maxWidth: 460, p: { xs: 3, md: 5 }, borderRadius: '28px',
              background: 'rgba(8, 8, 30, 0.8)', backdropFilter: 'blur(60px) saturate(1.6)',
              border: '1px solid rgba(99, 102, 241, 0.2)', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.7), 0 0 60px rgba(99, 102, 241, 0.1)',
              animation: 'authCardEntry 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)', position: 'relative',
              '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px', borderRadius: '28px 28px 0 0', background: 'linear-gradient(90deg, #ec4899, #8b5cf6, #6366f1, #06b6d4, #10b981)', backgroundSize: '200% 100%', animation: 'borderShimmer 4s linear infinite' },
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 3.5 }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '20px', background: 'linear-gradient(135deg, #06b6d4, #6366f1, #8b5cf6)', mb: 2, boxShadow: '0 10px 40px rgba(6, 182, 212, 0.4)', animation: 'float3D 4s ease-in-out infinite' }}>
                <LockResetIcon sx={{ fontSize: 30, color: '#fff' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', mb: 0.5 }}>Reset Password</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)' }}>Enter your email to receive a reset link</Typography>
            </Box>

            {success ? (
              <Box sx={{ textAlign: 'center' }}>
                <Alert icon={<EmailIcon sx={{ fontSize: 24 }} />} severity="success" sx={{ mb: 3, borderRadius: '14px', bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981' }}>
                  Password reset link sent! Check your email inbox.
                </Alert>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)', mb: 3 }}>Didn't receive the email? Check your spam folder or try again.</Typography>
                <Button onClick={() => setSuccess(false)} variant="outlined" sx={{ borderColor: 'rgba(99, 102, 241, 0.5)', color: '#818cf8', borderRadius: '12px', '&:hover': { borderColor: '#6366f1', background: 'rgba(99, 102, 241, 0.1)' } }}>Send Again</Button>
              </Box>
            ) : (
              <>
                {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: '14px', bgcolor: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', animation: 'shake 0.5s ease-out' }}>{error}</Alert>}

                <TextField fullWidth label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required sx={inputSx} />

                <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ py: 1.8, borderRadius: '14px', fontWeight: 700, fontSize: '1rem', background: 'linear-gradient(135deg, #06b6d4, #6366f1, #8b5cf6)', backgroundSize: '200% auto', boxShadow: '0 8px 30px rgba(6, 182, 212, 0.4)', '&:hover': { backgroundPosition: 'right center', boxShadow: '0 12px 40px rgba(6, 182, 212, 0.5)', transform: 'translateY(-2px)' }, '&:disabled': { background: 'rgba(6, 182, 212, 0.3)' } }}>
                  {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Send Reset Link'}
                </Button>
              </>
            )}

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)' }}>
                Remember your password?{' '}
                <Link to="/login" style={{ textDecoration: 'none', fontWeight: 700, background: 'linear-gradient(90deg, #818cf8, #06b6d4)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sign In</Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ForgotPasswordPage;
