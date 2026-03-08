import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = location.state?.registered;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
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
          border: '1px solid rgba(99, 102, 241, 0.2)',
          boxShadow: '0 40px 80px -20px rgba(0,0,0,0.8), 0 0 60px rgba(99, 102, 241, 0.08)',
          animation: 'scaleIn 0.5s ease-out',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg, transparent, #6366f1, #06b6d4, #ec4899, transparent)',
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
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
              mb: 2, animation: 'float3D 5s ease-in-out infinite, pulseGlow 4s ease-in-out infinite',
              boxShadow: '0 10px 40px rgba(99, 102, 241, 0.4), 0 0 80px rgba(139, 92, 246, 0.15)',
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 30, color: '#fff' }} />
          </Box>
          <Typography variant="h5" sx={{
            fontWeight: 800, letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #f5f5f5 0%, #a78bfa 50%, #818cf8 100%)',
            backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)', mt: 0.5 }}>
            Sign in to AI Customer Support
          </Typography>
        </Box>

        {justRegistered && <Alert severity="success" sx={{ mb: 2, borderRadius: 3, bgcolor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24' }}>Account created successfully! Please sign in.</Alert>}

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 3, bgcolor: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>{error}</Alert>}

        <TextField
          fullWidth label="Email" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)} required
          sx={{
            mb: 2.5,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)',
              '& fieldset': { borderColor: 'rgba(99, 102, 241, 0.2)' },
              '&:hover fieldset': { borderColor: 'rgba(99, 102, 241, 0.4)' },
              '&.Mui-focused fieldset': { borderColor: '#6366f1', borderWidth: '1.5px' },
            },
            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)' },
            '& .MuiInputLabel-root.Mui-focused': { color: '#818cf8' },
          }}
        />
        <TextField
          fullWidth label="Password" type="password" value={password}
          onChange={(e) => setPassword(e.target.value)} required
          sx={{
            mb: 3.5,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)',
              '& fieldset': { borderColor: 'rgba(99, 102, 241, 0.2)' },
              '&:hover fieldset': { borderColor: 'rgba(99, 102, 241, 0.4)' },
              '&.Mui-focused fieldset': { borderColor: '#6366f1', borderWidth: '1.5px' },
            },
            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)' },
            '& .MuiInputLabel-root.Mui-focused': { color: '#818cf8' },
          }}
        />

        <Button
          type="submit" fullWidth variant="contained" disabled={loading}
          sx={{
            py: 1.6, borderRadius: 3, fontWeight: 700, fontSize: '1rem',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
            backgroundSize: '200% auto',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.35), 0 0 50px rgba(99, 102, 241, 0.1)',
            transition: 'all 0.4s ease',
            '&:hover': {
              backgroundPosition: 'right center',
              boxShadow: '0 12px 40px rgba(99, 102, 241, 0.5), 0 0 80px rgba(99, 102, 241, 0.15)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
        </Button>

        <Typography variant="body2" sx={{ textAlign: 'center', mt: 3, color: 'rgba(255,255,255,0.45)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{
            color: '#818cf8', textDecoration: 'none', fontWeight: 600,
            backgroundImage: 'linear-gradient(90deg, #818cf8, #06b6d4)',
            backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Register
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;
