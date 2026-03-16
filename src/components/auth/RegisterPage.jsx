import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const allPasswordRulesMet = passwordRules.every((r) => r.test(password));
  const isAlreadyRegistered = error.toLowerCase().includes('already registered');

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

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', px: 2, position: 'relative', zIndex: 1 }}>
      <Box
        className="auth-card-glow"
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: '100%',
          maxWidth: 440,
          p: 4.5,
          borderRadius: '28px',
          background: 'rgba(8, 8, 30, 0.8)',
          backdropFilter: 'blur(60px) saturate(1.4)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          boxShadow: '0 40px 80px -20px rgba(0,0,0,0.8), 0 0 60px rgba(139, 92, 246, 0.08)',
          animation: 'scaleIn 0.5s ease-out',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg, transparent, #8b5cf6, #06b6d4, #ec4899, transparent)',
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
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)',
              mb: 2, animation: 'float3D 5s ease-in-out infinite, pulseGlow 4s ease-in-out infinite',
              boxShadow: '0 10px 40px rgba(139, 92, 246, 0.35), 0 0 80px rgba(99, 102, 241, 0.15)',
            }}
          >
            <PersonAddAltIcon sx={{ fontSize: 30, color: '#fff' }} />
          </Box>
          <Typography variant="h5" sx={{
            fontWeight: 800, letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #f5f5f5 0%, #a78bfa 50%, #818cf8 100%)',
            backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Create Account
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)', mt: 0.5 }}>
            Get started with AI Customer Support
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 3, bgcolor: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>
            {error}
            {isAlreadyRegistered && email && (
              <Box sx={{ mt: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate('/verify-email', { state: { email } })}
                  sx={{
                    borderColor: '#06b6d4', color: '#06b6d4', borderRadius: 2, fontWeight: 600, fontSize: '0.75rem',
                    '&:hover': { borderColor: '#22d3ee', color: '#22d3ee', bgcolor: 'rgba(6,182,212,0.08)' },
                  }}
                >
                  Verify Email Instead
                </Button>
              </Box>
            )}
          </Alert>
        )}

        <TextField
          fullWidth label="Full Name" value={fullName}
          onChange={(e) => setFullName(e.target.value)} required
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)',
              '& fieldset': { borderColor: 'rgba(139, 92, 246, 0.2)' },
              '&:hover fieldset': { borderColor: 'rgba(139, 92, 246, 0.4)' },
              '&.Mui-focused fieldset': { borderColor: '#8b5cf6', borderWidth: '1.5px' },
            },
            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)' },
            '& .MuiInputLabel-root.Mui-focused': { color: '#a78bfa' },
          }}
        />
        <TextField
          fullWidth label="Email" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)} required
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)',
              '& fieldset': { borderColor: 'rgba(139, 92, 246, 0.2)' },
              '&:hover fieldset': { borderColor: 'rgba(139, 92, 246, 0.4)' },
              '&.Mui-focused fieldset': { borderColor: '#8b5cf6', borderWidth: '1.5px' },
            },
            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)' },
            '& .MuiInputLabel-root.Mui-focused': { color: '#a78bfa' },
          }}
        />
        <TextField
          fullWidth label="Password" type="password" value={password}
          onChange={(e) => setPassword(e.target.value)} required
          sx={{
            mb: 1.5,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)',
              '& fieldset': { borderColor: 'rgba(139, 92, 246, 0.2)' },
              '&:hover fieldset': { borderColor: 'rgba(139, 92, 246, 0.4)' },
              '&.Mui-focused fieldset': { borderColor: '#8b5cf6', borderWidth: '1.5px' },
            },
            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)' },
            '& .MuiInputLabel-root.Mui-focused': { color: '#a78bfa' },
          }}
        />

        {password && (
          <Box sx={{ mb: 2.5, pl: 1 }}>
            {passwordRules.map((rule, i) => {
              const passed = rule.test(password);
              return (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
                  {passed
                    ? <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#10b981' }} />
                    : <CancelOutlinedIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.25)' }} />}
                  <Typography variant="caption" sx={{ color: passed ? '#10b981' : 'rgba(255,255,255,0.35)', fontSize: '0.72rem' }}>
                    {rule.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}

        <Button
          type="submit" fullWidth variant="contained" disabled={loading}
          sx={{
            py: 1.6, borderRadius: 3, fontWeight: 700, fontSize: '1rem',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)',
            backgroundSize: '200% auto',
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.35), 0 0 50px rgba(99, 102, 241, 0.1)',
            transition: 'all 0.4s ease',
            '&:hover': {
              backgroundPosition: 'right center',
              boxShadow: '0 12px 40px rgba(139, 92, 246, 0.5), 0 0 80px rgba(99, 102, 241, 0.15)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
        </Button>

        <Typography variant="body2" sx={{ textAlign: 'center', mt: 3, color: 'rgba(255,255,255,0.45)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{
            color: '#a78bfa', textDecoration: 'none', fontWeight: 600,
            backgroundImage: 'linear-gradient(90deg, #a78bfa, #06b6d4)',
            backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Sign In
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterPage;
