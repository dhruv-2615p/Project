import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, CircularProgress, IconButton } from '@mui/material';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../context/AuthContext';

const passwordRules = [
  { label: 'At least 6 characters', test: (p) => p.length >= 6 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'One digit or special character', test: (p) => /[\d\W]/.test(p) },
];

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { register } = useAuth();
  const navigate = useNavigate();

  const allPasswordRulesMet = passwordRules.every((r) => r.test(password));
  const isNotVerified = error.toLowerCase().includes('not verified');

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
    if (!allPasswordRulesMet) {
      setError('Please meet all password requirements.');
      return;
    }
    setLoading(true);
    try {
      await register(fullName, email, password);
      navigate('/verify-email', { state: { email } });
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputSx = {
    mb: 2.5,
    '& .MuiOutlinedInput-root': {
      borderRadius: '14px',
      bgcolor: 'rgba(139, 92, 246, 0.05)',
      transition: 'all 0.3s ease',
      '& fieldset': { borderColor: 'rgba(139, 92, 246, 0.25)', borderWidth: '2px' },
      '&:hover fieldset': { borderColor: 'rgba(139, 92, 246, 0.5)' },
      '&.Mui-focused fieldset': { borderColor: '#8b5cf6', boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
      '&.Mui-focused': { bgcolor: 'rgba(139, 92, 246, 0.08)' },
    },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#a78bfa' },
    '& .MuiInputBase-input': { color: '#fff', py: 1.6 },
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

      <IconButton
        onClick={() => navigate('/')}
        sx={{ position: 'absolute', top: 24, left: 24, zIndex: 10, color: 'rgba(255,255,255,0.5)', background: 'rgba(139, 92, 246, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(139, 92, 246, 0.2)', '&:hover': { background: 'rgba(139, 92, 246, 0.2)', color: '#fff', transform: 'translateX(-4px)' }, transition: 'all 0.3s ease' }}
      >
        <ArrowBackIcon />
      </IconButton>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', position: 'relative', zIndex: 1, px: { xs: 2, md: 4 }, py: 4 }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: '100%',
            maxWidth: 480,
            p: { xs: 3, md: 5 },
            borderRadius: '28px',
            background: 'rgba(8, 8, 30, 0.8)',
            backdropFilter: 'blur(60px) saturate(1.6)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.7), 0 0 60px rgba(139, 92, 246, 0.1)',
            animation: 'authCardEntry 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
            position: 'relative',
            '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px', borderRadius: '28px 28px 0 0', background: 'linear-gradient(90deg, #10b981, #06b6d4, #6366f1, #8b5cf6, #ec4899)', backgroundSize: '200% 100%', animation: 'borderShimmer 4s linear infinite' },
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3.5 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '20px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1, #06b6d4)', mb: 2, boxShadow: '0 10px 40px rgba(139, 92, 246, 0.4)', animation: 'float3D 4s ease-in-out infinite' }}>
              <PersonAddAltIcon sx={{ fontSize: 30, color: '#fff' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', mb: 0.5 }}>Create Account</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)' }}>Join DRP AI Customer Support</Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: '14px', bgcolor: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', animation: 'shake 0.5s ease-out' }}>
              {error}
              {isNotVerified && email && (
                <Box sx={{ mt: 1 }}>
                  <Button size="small" variant="outlined" onClick={() => navigate('/verify-email', { state: { email } })} sx={{ borderColor: '#06b6d4', color: '#06b6d4', borderRadius: '10px', fontWeight: 600, '&:hover': { borderColor: '#22d3ee', bgcolor: 'rgba(6,182,212,0.1)' } }}>
                    Verify Email Instead
                  </Button>
                </Box>
              )}
            </Alert>
          )}

          <TextField fullWidth label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required sx={inputSx} />
          <TextField fullWidth label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required sx={inputSx} />
          <TextField
            fullWidth label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
            InputProps={{ endAdornment: <IconButton onClick={() => setShowPassword(!showPassword)} sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#8b5cf6' } }}>{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton> }}
            sx={{ ...inputSx, mb: 1.5 }}
          />

          {password && (
            <Box sx={{ mb: 2, pl: 0.5 }}>
              {passwordRules.map((rule, i) => {
                const passed = rule.test(password);
                return (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
                    {passed ? <CheckCircleOutlineIcon sx={{ fontSize: 15, color: '#10b981' }} /> : <CancelOutlinedIcon sx={{ fontSize: 15, color: 'rgba(255,255,255,0.2)' }} />}
                    <Typography variant="caption" sx={{ color: passed ? '#10b981' : 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>{rule.label}</Typography>
                  </Box>
                );
              })}
            </Box>
          )}

          <Button
            type="submit" fullWidth variant="contained" disabled={loading}
            sx={{
              py: 1.8, borderRadius: '14px', fontWeight: 700, fontSize: '1rem',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1, #06b6d4)', backgroundSize: '200% auto',
              boxShadow: '0 8px 30px rgba(139, 92, 246, 0.4)',
              '&:hover': { backgroundPosition: 'right center', boxShadow: '0 12px 40px rgba(139, 92, 246, 0.5)', transform: 'translateY(-2px)' },
              '&:disabled': { background: 'rgba(139, 92, 246, 0.3)' },
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Create Account'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ textDecoration: 'none', fontWeight: 700, background: 'linear-gradient(90deg, #a78bfa, #06b6d4)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sign In</Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterPage;
