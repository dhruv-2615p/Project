import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
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
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', px: 2, position: 'relative', zIndex: 1 }}>
      <Box
        className="auth-card-glow"
        component="form"
        onSubmit={handleVerify}
        sx={{
          width: '100%',
          maxWidth: 440,
          p: 4.5,
          borderRadius: '28px',
          background: 'rgba(8, 8, 30, 0.8)',
          backdropFilter: 'blur(60px) saturate(1.4)',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          boxShadow: '0 40px 80px -20px rgba(0,0,0,0.8), 0 0 60px rgba(6, 182, 212, 0.08)',
          animation: 'scaleIn 0.5s ease-out',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg, transparent, #06b6d4, #8b5cf6, #ec4899, transparent)',
            backgroundSize: '200% 100%', animation: 'borderShimmer 3s linear infinite',
          },
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3.5 }}>
          <Box
            component="span"
            sx={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 64, height: 64, borderRadius: '20px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #6366f1 100%)',
              mb: 2, animation: 'float3D 5s ease-in-out infinite, pulseGlow 4s ease-in-out infinite',
              boxShadow: '0 10px 40px rgba(6, 182, 212, 0.35), 0 0 80px rgba(139, 92, 246, 0.15)',
            }}
          >
            <MarkEmailReadOutlinedIcon sx={{ fontSize: 30, color: '#fff' }} />
          </Box>
          <Typography variant="h5" sx={{
            fontWeight: 800, letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #f5f5f5 0%, #67e8f9 50%, #a78bfa 100%)',
            backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Verify Your Email
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)', mt: 0.5 }}>
            We sent a 6-digit OTP to
          </Typography>
          <Typography variant="body2" sx={{ color: '#67e8f9', fontWeight: 600, mt: 0.3 }}>
            {email}
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 3, bgcolor: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 3, bgcolor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }}>{success}</Alert>}

        <TextField
          fullWidth label="Enter OTP" value={otp}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
            setOtp(val);
          }}
          required
          inputProps={{ maxLength: 6, inputMode: 'numeric', style: { textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.3rem', fontWeight: 700 } }}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)',
              '& fieldset': { borderColor: 'rgba(6, 182, 212, 0.2)' },
              '&:hover fieldset': { borderColor: 'rgba(6, 182, 212, 0.4)' },
              '&.Mui-focused fieldset': { borderColor: '#06b6d4', borderWidth: '1.5px' },
            },
            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)' },
            '& .MuiInputLabel-root.Mui-focused': { color: '#67e8f9' },
          }}
        />

        <Button
          type="submit" fullWidth variant="contained" disabled={loading}
          sx={{
            py: 1.6, borderRadius: 3, fontWeight: 700, fontSize: '1rem',
            background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #6366f1 100%)',
            backgroundSize: '200% auto',
            boxShadow: '0 8px 32px rgba(6, 182, 212, 0.35), 0 0 50px rgba(139, 92, 246, 0.1)',
            transition: 'all 0.4s ease',
            '&:hover': {
              backgroundPosition: 'right center',
              boxShadow: '0 12px 40px rgba(6, 182, 212, 0.5), 0 0 80px rgba(139, 92, 246, 0.15)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify Email'}
        </Button>

        <Typography variant="body2" sx={{ textAlign: 'center', mt: 3, color: 'rgba(255,255,255,0.45)' }}>
          Didn't receive the code?{' '}
          <Box
            component="span"
            onClick={!resending ? handleResend : undefined}
            sx={{
              color: '#67e8f9', fontWeight: 600, cursor: resending ? 'default' : 'pointer',
              opacity: resending ? 0.5 : 1,
              '&:hover': resending ? {} : { textDecoration: 'underline' },
            }}
          >
            {resending ? 'Sending...' : 'Resend OTP'}
          </Box>
        </Typography>
      </Box>
    </Box>
  );
};

export default EmailVerificationPage;
