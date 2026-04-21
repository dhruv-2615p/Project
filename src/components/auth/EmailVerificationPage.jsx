import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, CircularProgress, IconButton } from '@mui/material';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import authService from '../../services/authService';

const EmailVerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
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

  if (!email) {
    return <Navigate to="/register" />;
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      await authService.verifyOtp(email, otp);
      setSuccess('Email verified successfully! Redirecting to login...');
      setTimeout(() => navigate('/login', { state: { registered: true } }), 2000);
    } catch (err) {
      const msg = err.response?.data?.error || 'Verification failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setResending(true);
    try {
      await authService.sendOtp(email);
      setSuccess('A new OTP has been sent to your email.');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to resend OTP.';
      setError(msg);
    } finally {
      setResending(false);
    }
  };

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

      <IconButton onClick={() => navigate('/register')} sx={{ position: 'absolute', top: 24, left: 24, zIndex: 10, color: 'rgba(255,255,255,0.5)', background: 'rgba(6, 182, 212, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(6, 182, 212, 0.2)', '&:hover': { background: 'rgba(6, 182, 212, 0.2)', color: '#fff', transform: 'translateX(-4px)' }, transition: 'all 0.3s ease' }}>
        <ArrowBackIcon />
      </IconButton>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', position: 'relative', zIndex: 1, px: { xs: 2, md: 4 }, py: 4 }}>
        <Box
          component="form" onSubmit={handleVerify}
          sx={{
            width: '100%', maxWidth: 460, p: { xs: 3, md: 5 }, borderRadius: '28px',
            background: 'rgba(8, 8, 30, 0.8)', backdropFilter: 'blur(60px) saturate(1.6)',
            border: '1px solid rgba(6, 182, 212, 0.2)', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.7), 0 0 60px rgba(6, 182, 212, 0.1)',
            animation: 'authCardEntry 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)', position: 'relative',
            '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px', borderRadius: '28px 28px 0 0', background: 'linear-gradient(90deg, #06b6d4, #8b5cf6, #6366f1, #ec4899, #10b981)', backgroundSize: '200% 100%', animation: 'borderShimmer 4s linear infinite' },
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3.5 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '20px', background: 'linear-gradient(135deg, #06b6d4, #8b5cf6, #6366f1)', mb: 2, boxShadow: '0 10px 40px rgba(6, 182, 212, 0.4)', animation: 'float3D 4s ease-in-out infinite' }}>
              <MarkEmailReadOutlinedIcon sx={{ fontSize: 30, color: '#fff' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', mb: 0.5 }}>Verify Your Email</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)' }}>We sent a 6-digit OTP to</Typography>
            <Typography variant="body2" sx={{ color: '#67e8f9', fontWeight: 600, mt: 0.3 }}>{email}</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '14px', bgcolor: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', animation: 'shake 0.5s ease-out' }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '14px', bgcolor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>{success}</Alert>}

          <TextField
            fullWidth label="Enter OTP" value={otp}
            onChange={(e) => { const val = e.target.value.replace(/\D/g, '').slice(0, 6); setOtp(val); }}
            required
            inputProps={{ maxLength: 6, inputMode: 'numeric', style: { textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.3rem', fontWeight: 700 } }}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: '14px', bgcolor: 'rgba(6, 182, 212, 0.05)', transition: 'all 0.3s ease',
                '& fieldset': { borderColor: 'rgba(6, 182, 212, 0.25)', borderWidth: '2px' },
                '&:hover fieldset': { borderColor: 'rgba(6, 182, 212, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#06b6d4', boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#67e8f9' },
              '& .MuiInputBase-input': { color: '#fff' },
            }}
          />

          <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ py: 1.8, borderRadius: '14px', fontWeight: 700, fontSize: '1rem', background: 'linear-gradient(135deg, #06b6d4, #8b5cf6, #6366f1)', backgroundSize: '200% auto', boxShadow: '0 8px 30px rgba(6, 182, 212, 0.4)', '&:hover': { backgroundPosition: 'right center', boxShadow: '0 12px 40px rgba(6, 182, 212, 0.5)', transform: 'translateY(-2px)' }, '&:disabled': { background: 'rgba(6, 182, 212, 0.3)' } }}>
            {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Verify Email'}
          </Button>

          <Typography variant="body2" sx={{ textAlign: 'center', mt: 3, color: 'rgba(255,255,255,0.45)' }}>
            Didn't receive the code?{' '}
            <Box component="span" onClick={!resending ? handleResend : undefined} sx={{ color: '#67e8f9', fontWeight: 600, cursor: resending ? 'default' : 'pointer', opacity: resending ? 0.5 : 1, '&:hover': resending ? {} : { textDecoration: 'underline' } }}>
              {resending ? 'Sending...' : 'Resend OTP'}
            </Box>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default EmailVerificationPage;
