import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, CircularProgress, IconButton } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';

const AUTH_BASE_URL = process.env.REACT_APP_AUTH_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8081' : '');

const passwordRules = [
  { label: 'At least 6 characters', test: (p) => p.length >= 6 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'One digit or special character', test: (p) => /[\d\W]/.test(p) },
];

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  const allPasswordRulesMet = passwordRules.every((r) => r.test(password));
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

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
    if (!token) { setError('Invalid or missing reset token. Please request a new reset link.'); return; }
    if (!allPasswordRulesMet) { setError('Please meet all password requirements.'); return; }
    if (!passwordsMatch) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await axios.post(`${AUTH_BASE_URL}/api/auth/reset-password`, { token, newPassword: password });
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to reset password. The link may have expired.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputSx = {
    mb: 2,
    '& .MuiOutlinedInput-root': {
      borderRadius: '14px', bgcolor: 'rgba(16, 185, 129, 0.05)', transition: 'all 0.3s ease',
      '& fieldset': { borderColor: 'rgba(16, 185, 129, 0.25)', borderWidth: '2px' },
      '&:hover fieldset': { borderColor: 'rgba(16, 185, 129, 0.5)' },
      '&.Mui-focused fieldset': { borderColor: '#10b981', boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' },
    },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#34d399' },
    '& .MuiInputBase-input': { color: '#fff', py: 1.6 },
  };

  if (!token) {
    return (
      <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
        <Box className="interactive-blobs">
          <Box className="mega-blob blob-1" />
          <Box className="mega-blob blob-2" />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', px: 2, position: 'relative', zIndex: 1 }}>
          <Box sx={{ p: 5, borderRadius: '28px', background: 'rgba(8, 8, 30, 0.8)', backdropFilter: 'blur(60px)', border: '1px solid rgba(244, 63, 94, 0.3)', textAlign: 'center', maxWidth: 450 }}>
            <Typography variant="h5" sx={{ color: '#f43f5e', fontWeight: 700, mb: 2 }}>Invalid Reset Link</Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}>This password reset link is invalid or has expired. Please request a new one.</Typography>
            <Button onClick={() => navigate('/forgot-password')} variant="contained" sx={{ borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', fontWeight: 600 }}>Request New Link</Button>
          </Box>
        </Box>
      </Box>
    );
  }

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

      <IconButton onClick={() => navigate('/login')} sx={{ position: 'absolute', top: 24, left: 24, zIndex: 10, color: 'rgba(255,255,255,0.5)', background: 'rgba(16, 185, 129, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(16, 185, 129, 0.2)', '&:hover': { background: 'rgba(16, 185, 129, 0.2)', color: '#fff', transform: 'translateX(-4px)' }, transition: 'all 0.3s ease' }}>
        <ArrowBackIcon />
      </IconButton>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', position: 'relative', zIndex: 1, px: { xs: 2, md: 4 }, py: 4 }}>
        <Box
          component="form" onSubmit={handleSubmit}
          sx={{
            width: '100%', maxWidth: 460, p: { xs: 3, md: 5 }, borderRadius: '28px',
            background: 'rgba(8, 8, 30, 0.8)', backdropFilter: 'blur(60px) saturate(1.6)',
            border: '1px solid rgba(16, 185, 129, 0.2)', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.7), 0 0 60px rgba(16, 185, 129, 0.1)',
            animation: 'authCardEntry 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)', position: 'relative',
            '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px', borderRadius: '28px 28px 0 0', background: 'linear-gradient(90deg, #10b981, #06b6d4, #6366f1, #8b5cf6)', backgroundSize: '200% 100%', animation: 'borderShimmer 4s linear infinite' },
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3.5 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '20px', background: 'linear-gradient(135deg, #10b981, #06b6d4, #6366f1)', mb: 2, boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)', animation: 'float3D 4s ease-in-out infinite' }}>
              <LockOutlinedIcon sx={{ fontSize: 30, color: '#fff' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', mb: 0.5 }}>Create New Password</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)' }}>Enter your new password below</Typography>
          </Box>

          {success ? (
            <Box sx={{ textAlign: 'center' }}>
              <Alert icon={<CheckCircleOutlineIcon sx={{ fontSize: 24 }} />} severity="success" sx={{ mb: 3, borderRadius: '14px', bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981' }}>
                Password reset successful! You can now sign in with your new password.
              </Alert>
              <Button onClick={() => navigate('/login')} variant="contained" sx={{ px: 4, py: 1.5, borderRadius: '14px', fontWeight: 700, background: 'linear-gradient(135deg, #10b981, #06b6d4)', boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4)', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 40px rgba(16, 185, 129, 0.5)' } }}>Go to Login</Button>
            </Box>
          ) : (
            <>
              {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: '14px', bgcolor: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', animation: 'shake 0.5s ease-out' }}>{error}</Alert>}

              <TextField
                fullWidth label="New Password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                InputProps={{ endAdornment: <IconButton onClick={() => setShowPassword(!showPassword)} sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#10b981' } }}>{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton> }}
                sx={inputSx}
              />

              {password && (
                <Box sx={{ mb: 2, pl: 1 }}>
                  {passwordRules.map((rule, i) => {
                    const passed = rule.test(password);
                    return (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
                        {passed ? <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#10b981' }} /> : <CancelOutlinedIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.25)' }} />}
                        <Typography variant="caption" sx={{ color: passed ? '#10b981' : 'rgba(255,255,255,0.35)', fontSize: '0.72rem' }}>{rule.label}</Typography>
                      </Box>
                    );
                  })}
                </Box>
              )}

              <TextField
                fullWidth label="Confirm Password" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                InputProps={{ endAdornment: <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#10b981' } }}>{showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton> }}
                sx={{ ...inputSx, mb: 1 }}
              />

              {confirmPassword && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, pl: 1, mb: 3 }}>
                  {passwordsMatch ? <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#10b981' }} /> : <CancelOutlinedIcon sx={{ fontSize: 16, color: '#f43f5e' }} />}
                  <Typography variant="caption" sx={{ color: passwordsMatch ? '#10b981' : '#f43f5e', fontSize: '0.72rem' }}>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</Typography>
                </Box>
              )}

              <Button type="submit" fullWidth variant="contained" disabled={loading || !allPasswordRulesMet || !passwordsMatch} sx={{ py: 1.8, borderRadius: '14px', fontWeight: 700, fontSize: '1rem', background: 'linear-gradient(135deg, #10b981, #06b6d4, #6366f1)', backgroundSize: '200% auto', boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4)', '&:hover': { backgroundPosition: 'right center', boxShadow: '0 12px 40px rgba(16, 185, 129, 0.5)', transform: 'translateY(-2px)' }, '&:disabled': { background: 'rgba(16, 185, 129, 0.3)' } }}>
                {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Reset Password'}
              </Button>
            </>
          )}

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)' }}>
              <Link to="/login" style={{ textDecoration: 'none', fontWeight: 700, background: 'linear-gradient(90deg, #10b981, #06b6d4)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Back to Login</Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ResetPasswordPage;
