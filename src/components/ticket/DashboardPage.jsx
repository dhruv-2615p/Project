import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  IconButton,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddIcon from '@mui/icons-material/Add';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ArchiveIcon from '@mui/icons-material/Archive';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAuth } from '../../context/AuthContext';
import ticketService from '../../services/ticketService';
import aiService from '../../services/aiService';

const priorityColors = {
  low: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' },
  medium: { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' },
  high: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
  urgent: { bg: 'rgba(220, 38, 38, 0.15)', text: '#dc2626', border: 'rgba(220, 38, 38, 0.3)' },
};

const statusColors = {
  open: { bg: 'rgba(6, 182, 212, 0.15)', text: '#06b6d4', border: 'rgba(6, 182, 212, 0.3)' },
  'in-progress': { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' },
  resolved: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' },
  closed: { bg: 'rgba(107, 114, 128, 0.15)', text: '#6b7280', border: 'rgba(107, 114, 128, 0.3)' },
};

const categoryIcons = {
  technical: '🔧',
  billing: '💳',
  account: '👤',
  feature: '✨',
  general: '💬',
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredTickets = useMemo(() => {
    if (statusFilter === 'all') return tickets;
    return tickets.filter((t) => t.status === statusFilter);
  }, [tickets, statusFilter]);

  const resolvedPercent = useMemo(() => {
    if (!stats || stats.totalTickets === 0) return 0;
    return Math.round(((stats.resolvedTickets + stats.closedTickets) / stats.totalTickets) * 100);
  }, [stats]);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/dashboard' } });
      return;
    }
    loadDashboardData();
  }, [user, navigate]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const loadDashboardData = async () => {
    try {
      setError('');
      const [statsData, ticketsData] = await Promise.all([
        ticketService.getDashboardStats(),
        ticketService.getUserTickets(),
      ]);
      setStats(statsData);
      setTickets(ticketsData);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
  };

  const handleGetAiHelp = async (ticket) => {
    setSelectedTicket(ticket);
    if (ticket.aiResponse) return;
    
    setAiLoading(true);
    try {
      const aiResponse = await aiService.getAIResponse(
        `Category: ${ticket.category}\nPriority: ${ticket.priority}\nSubject: ${ticket.subject}\n\nDescription: ${ticket.description}\n\nPlease provide helpful guidance for this support ticket.`
      );
      
      await ticketService.addAiResponse(ticket.id, aiResponse.response);
      
      setTickets(prev => prev.map(t => 
        t.id === ticket.id ? { ...t, aiResponse: aiResponse.response } : t
      ));
      setSelectedTicket(prev => ({ ...prev, aiResponse: aiResponse.response }));
    } catch (err) {
      setError('Failed to get AI response');
    } finally {
      setAiLoading(false);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await ticketService.updateTicketStatus(ticketId, newStatus);
      setTickets(prev => prev.map(t => 
        t.id === ticketId ? { ...t, status: newStatus } : t
      ));
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => ({ ...prev, status: newStatus }));
      }
      const statsData = await ticketService.getDashboardStats();
      setStats(statsData);
    } catch (err) {
      setError('Failed to update ticket status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const StatCard = ({ icon, title, value, color, gradient }) => (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${gradient[0]}15 0%, ${gradient[1]}08 100%)`,
        border: `2px solid ${color}30`,
        borderRadius: '20px',
        transition: 'all 0.4s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: `0 20px 40px ${color}20`,
          borderColor: `${color}60`,
        },
      }}
    >
      <CardContent sx={{ textAlign: 'center', py: 3 }}>
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: `0 8px 25px ${color}40`,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 800, color: '#fff', mb: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#030014' }}>
        <CircularProgress size={60} sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', pb: 10, overflow: 'hidden' }}>
      {/* Background Blobs */}
      <Box className="interactive-blobs">
        <Box
          className="mega-blob blob-1"
          sx={{
            transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)`,
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.5) 0%, rgba(139, 92, 246, 0.3) 40%, transparent 70%) !important',
          }}
        />
        <Box
          className="mega-blob blob-2"
          sx={{
            transform: `translate(${mousePos.x * -25}px, ${mousePos.y * -25}px)`,
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, rgba(16, 185, 129, 0.25) 40%, transparent 70%) !important',
          }}
        />
      </Box>

      {/* Floating Particles */}
      <Box className="auth-particles">
        {[...Array(12)].map((_, i) => (
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
              }}
            >
              <DashboardIcon sx={{ color: '#fff', fontSize: 26 }} />
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
              My Dashboard
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Refresh" arrow>
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{
                color: '#fff',
                background: 'rgba(99, 102, 241, 0.2)',
                '&:hover': { background: 'rgba(99,102,241,0.4)' },
              }}
            >
              <RefreshIcon sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </Tooltip>
          <Button
            onClick={() => navigate('/ticket')}
            startIcon={<AddIcon />}
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
            New Ticket
          </Button>
          {user && (
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
          )}
        </Box>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ pt: 14, position: 'relative', zIndex: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Welcome Banner */}
        <Box
          sx={{
            mb: 4,
            p: { xs: 3, md: 4 },
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.08) 50%, rgba(6, 182, 212, 0.1) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            display: 'flex',
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', mb: 0.5 }}>
              {getGreeting()}, {user?.fullName?.split(' ')[0] || 'User'} 👋
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.55)' }}>
              {stats?.totalTickets === 0
                ? 'You have no tickets yet. Create one to get started!'
                : `You have ${stats?.openTickets || 0} open ticket${(stats?.openTickets || 0) !== 1 ? 's' : ''} and ${stats?.inProgressTickets || 0} in progress.`}
            </Typography>
          </Box>
          {stats && stats.totalTickets > 0 && (
            <Box sx={{ minWidth: 160, textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress
                  variant="determinate"
                  value={resolvedPercent}
                  size={72}
                  thickness={5}
                  sx={{ color: '#10b981', '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }}
                />
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={72}
                  thickness={5}
                  sx={{ color: 'rgba(255,255,255,0.06)', position: 'absolute', left: 0 }}
                />
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#10b981' }}>
                    {resolvedPercent}%
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,0.5)', mt: 0.5 }}>
                Resolved
              </Typography>
            </Box>
          )}
        </Box>

        {/* Stats Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }, gap: 3, mb: 5 }}>
          <StatCard
            icon={<ConfirmationNumberIcon sx={{ color: '#fff', fontSize: 28 }} />}
            title="Total Tickets"
            value={stats?.totalTickets || 0}
            color="#6366f1"
            gradient={['#6366f1', '#8b5cf6']}
          />
          <StatCard
            icon={<AccessTimeIcon sx={{ color: '#fff', fontSize: 28 }} />}
            title="Open"
            value={stats?.openTickets || 0}
            color="#06b6d4"
            gradient={['#06b6d4', '#0891b2']}
          />
          <StatCard
            icon={<AutorenewIcon sx={{ color: '#fff', fontSize: 28 }} />}
            title="In Progress"
            value={stats?.inProgressTickets || 0}
            color="#f59e0b"
            gradient={['#f59e0b', '#d97706']}
          />
          <StatCard
            icon={<CheckCircleIcon sx={{ color: '#fff', fontSize: 28 }} />}
            title="Resolved"
            value={stats?.resolvedTickets || 0}
            color="#10b981"
            gradient={['#10b981', '#059669']}
          />
          <StatCard
            icon={<ArchiveIcon sx={{ color: '#fff', fontSize: 28 }} />}
            title="Closed"
            value={stats?.closedTickets || 0}
            color="#6b7280"
            gradient={['#6b7280', '#4b5563']}
          />
        </Box>

        {/* Tickets Section */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #fff, #a78bfa)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Your Tickets
          </Typography>
          <Tabs
            value={statusFilter}
            onChange={(_, v) => setStatusFilter(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 36,
              '& .MuiTab-root': {
                minHeight: 36,
                py: 0.5,
                px: 2,
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'capitalize',
                '&.Mui-selected': { color: '#a78bfa' },
              },
              '& .MuiTabs-indicator': { background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: 2 },
            }}
          >
            <Tab label={`All (${tickets.length})`} value="all" />
            <Tab label={`Open (${stats?.openTickets || 0})`} value="open" />
            <Tab label={`In Progress (${stats?.inProgressTickets || 0})`} value="in-progress" />
            <Tab label={`Resolved (${stats?.resolvedTickets || 0})`} value="resolved" />
            <Tab label={`Closed (${stats?.closedTickets || 0})`} value="closed" />
          </Tabs>
        </Box>

        {filteredTickets.length === 0 ? (
          <Card
            sx={{
              p: 6,
              textAlign: 'center',
              background: 'rgba(99, 102, 241, 0.05)',
              border: '2px dashed rgba(99, 102, 241, 0.3)',
              borderRadius: '20px',
            }}
          >
            <ConfirmationNumberIcon sx={{ fontSize: 60, color: 'rgba(255,255,255,0.3)', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
              {statusFilter === 'all' ? 'No tickets yet' : `No ${statusFilter} tickets`}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mb: 3 }}>
              {statusFilter === 'all' ? 'Create a support ticket and track it here.' : 'Try switching to a different status tab.'}
            </Typography>
            {statusFilter === 'all' && (
              <Button
                onClick={() => navigate('/ticket')}
                startIcon={<AddIcon />}
                variant="contained"
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                }}
              >
                Create Your First Ticket
              </Button>
            )}
          </Card>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
            {filteredTickets.map((ticket) => (
              <Card
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                sx={{
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.05) 100%)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: '20px',
                  transition: 'all 0.4s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 15px 40px rgba(99, 102, 241, 0.2)',
                    borderColor: 'rgba(99, 102, 241, 0.4)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontSize: 24 }}>{categoryIcons[ticket.category] || '📋'}</Typography>
                      <Box>
                        <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', fontWeight: 700, lineHeight: 1 }}>
                          #TK-{String(ticket.id).padStart(3, '0')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }}>
                          {ticket.category}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={ticket.status}
                      size="small"
                      sx={{
                        background: statusColors[ticket.status]?.bg || statusColors.open.bg,
                        color: statusColors[ticket.status]?.text || statusColors.open.text,
                        border: `1px solid ${statusColors[ticket.status]?.border || statusColors.open.border}`,
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    />
                  </Box>
                  
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: '#fff',
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {ticket.subject}
                  </Typography>
                  
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255,255,255,0.6)',
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {ticket.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={ticket.priority}
                      size="small"
                      sx={{
                        background: priorityColors[ticket.priority]?.bg,
                        color: priorityColors[ticket.priority]?.text,
                        border: `1px solid ${priorityColors[ticket.priority]?.border}`,
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    />
                    <Tooltip title={formatDate(ticket.createdAt)} arrow>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', cursor: 'default' }}>
                        {getRelativeTime(ticket.createdAt)}
                      </Typography>
                    </Tooltip>
                  </Box>
                  
                  {ticket.aiResponse && (
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SmartToyIcon sx={{ fontSize: 16, color: '#8b5cf6' }} />
                      <Typography variant="caption" sx={{ color: '#8b5cf6' }}>
                        AI Response Available
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Container>

      {/* Ticket Detail Dialog */}
      <Dialog
        open={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(3, 0, 20, 0.98) 0%, rgba(20, 10, 40, 0.98) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '24px',
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        {selectedTicket && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ fontSize: 32 }}>{categoryIcons[selectedTicket.category] || '📋'}</Typography>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography
                      sx={{
                        fontSize: '0.7rem',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: '#a78bfa',
                        background: 'rgba(139, 92, 246, 0.15)',
                        px: 1,
                        py: 0.2,
                        borderRadius: '6px',
                      }}
                    >
                      #TK-{String(selectedTicket.id).padStart(3, '0')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      Created {formatDate(selectedTicket.createdAt)}
                    </Typography>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>
                    {selectedTicket.subject}
                  </Typography>
                </Box>
                <Chip
                  label={selectedTicket.status}
                  sx={{
                    background: statusColors[selectedTicket.status]?.bg,
                    color: statusColors[selectedTicket.status]?.text,
                    border: `1px solid ${statusColors[selectedTicket.status]?.border}`,
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <Chip
                  label={`Priority: ${selectedTicket.priority}`}
                  sx={{
                    background: priorityColors[selectedTicket.priority]?.bg,
                    color: priorityColors[selectedTicket.priority]?.text,
                    border: `1px solid ${priorityColors[selectedTicket.priority]?.border}`,
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}
                />
                <Chip
                  label={`Category: ${selectedTicket.category}`}
                  sx={{
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: '#a78bfa',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}
                />
              </Box>
              
              <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                Description
              </Typography>
              <Box
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  background: 'rgba(99, 102, 241, 0.05)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  mb: 3,
                }}
              >
                <Typography sx={{ color: 'rgba(255,255,255,0.9)', whiteSpace: 'pre-wrap' }}>
                  {selectedTicket.description}
                </Typography>
              </Box>

              {/* AI Response Section */}
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SmartToyIcon sx={{ color: '#8b5cf6' }} />
                  <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    AI Assistant Response
                  </Typography>
                </Box>
                {!selectedTicket.aiResponse && (
                  <Button
                    onClick={() => handleGetAiHelp(selectedTicket)}
                    disabled={aiLoading}
                    startIcon={aiLoading ? <CircularProgress size={16} /> : <SmartToyIcon />}
                    size="small"
                    sx={{
                      background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                      color: '#fff',
                      '&:hover': { background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' },
                    }}
                  >
                    {aiLoading ? 'Getting Help...' : 'Get AI Help'}
                  </Button>
                )}
              </Box>
              
              <Box
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  background: selectedTicket.aiResponse 
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)'
                    : 'rgba(99, 102, 241, 0.05)',
                  border: `1px solid ${selectedTicket.aiResponse ? 'rgba(139, 92, 246, 0.3)' : 'rgba(99, 102, 241, 0.2)'}`,
                }}
              >
                {aiLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={24} sx={{ color: '#8b5cf6' }} />
                    <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      AI is analyzing your ticket...
                    </Typography>
                  </Box>
                ) : selectedTicket.aiResponse ? (
                  <Typography sx={{ color: 'rgba(255,255,255,0.9)', whiteSpace: 'pre-wrap' }}>
                    {selectedTicket.aiResponse}
                  </Typography>
                ) : (
                  <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                    Click "Get AI Help" to receive intelligent suggestions for this ticket.
                  </Typography>
                )}
              </Box>

              {/* Close Ticket Action */}
              {selectedTicket.status !== 'closed' && (
                <Box sx={{ mt: 3 }}>
                  <Button
                    onClick={() => handleStatusChange(selectedTicket.id, 'closed')}
                    size="small"
                    variant="outlined"
                    sx={{
                      color: '#6b7280',
                      borderColor: 'rgba(107,114,128,0.4)',
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'rgba(107,114,128,0.15)',
                        borderColor: '#6b7280',
                      },
                    }}
                  >
                    Close Ticket
                  </Button>
                  <Typography variant="caption" sx={{ ml: 2, color: 'rgba(255,255,255,0.35)' }}>
                    Our support agent will update progress
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button
                onClick={() => setSelectedTicket(null)}
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.1)' },
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );
};

export default DashboardPage;
