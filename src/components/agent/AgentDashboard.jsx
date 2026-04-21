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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';
import ticketService from '../../services/ticketService';

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

const AgentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [responseText, setResponseText] = useState('');
  const [responding, setResponding] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'AGENT') {
      navigate('/dashboard');
      return;
    }
    loadTickets();
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

  const loadTickets = async () => {
    try {
      setError('');
      const data = await ticketService.getAgentTickets();
      setTickets(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load tickets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTickets();
  };

  const handleAssign = async (ticketId) => {
    try {
      setError('');
      await ticketService.assignTicketToAgent(ticketId);
      setSuccess('Ticket assigned to you successfully');
      await loadTickets();
      // Update selected ticket if open
      if (selectedTicket?.id === ticketId) {
        const updatedTickets = await ticketService.getAgentTickets();
        const updated = updatedTickets.find(t => t.id === ticketId);
        if (updated) setSelectedTicket(updated);
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assign ticket');
    }
  };

  const handleRespond = async () => {
    if (!responseText.trim() || !selectedTicket) return;
    setResponding(true);
    try {
      setError('');
      const updatedTicket = await ticketService.sendAgentResponse(selectedTicket.id, responseText.trim());
      setSuccess('Response sent successfully');
      setResponseText('');
      // Refresh ticket list and update selected ticket
      await loadTickets();
      setSelectedTicket(updatedTicket);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send response');
    } finally {
      setResponding(false);
    }
  };

  const handleStatusChange = async (ticketId, status) => {
    setStatusUpdating(true);
    try {
      setError('');
      const updatedTicket = await ticketService.updateAgentTicketStatus(ticketId, status);
      setSuccess(`Ticket status updated to "${status}"`);
      await loadTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(updatedTicket);
      }
      setNewStatus('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const filteredTickets = useMemo(() => {
    if (statusFilter === 'all') return tickets;
    return tickets.filter((t) => t.status === statusFilter);
  }, [tickets, statusFilter]);

  const statusCounts = useMemo(() => ({
    open: tickets.filter(t => t.status === 'open').length,
    'in-progress': tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  }), [tickets]);

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
            width: 60, height: 60, borderRadius: '16px',
            background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: `0 8px 25px ${color}40`,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 800, color: '#f0f0ff', mb: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
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
    <Box sx={{ minHeight: '100vh', position: 'relative', pb: 10, overflow: 'hidden', background: 'linear-gradient(180deg, #030014 0%, #050020 40%, #080030 70%, #030018 100%)' }}>
      {/* Background Effects */}
      <Box className="interactive-blobs">
        <Box className="mega-blob blob-1" sx={{ transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)`, background: 'radial-gradient(circle, rgba(99, 102, 241, 0.5) 0%, rgba(139, 92, 246, 0.3) 40%, transparent 70%) !important' }} />
        <Box className="mega-blob blob-2" sx={{ transform: `translate(${mousePos.x * -25}px, ${mousePos.y * -25}px)`, background: 'radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, rgba(16, 185, 129, 0.25) 40%, transparent 70%) !important' }} />
      </Box>
      <Box className="auth-particles">
        {[...Array(12)].map((_, i) => (
          <Box key={i} className="auth-particle" sx={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s`, animationDuration: `${10 + Math.random() * 10}s` }} />
        ))}
      </Box>

      {/* Navbar */}
      <Box component="nav" sx={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, py: 2,
        px: { xs: 2, md: 6 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backdropFilter: 'blur(20px)',
        background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, rgba(3, 0, 20, 0.7) 100%)',
        borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/')} sx={{
            color: 'rgba(255,255,255,0.7)', background: 'rgba(99, 102, 241, 0.15)',
            '&:hover': { color: '#fff', background: 'rgba(99,102,241,0.3)', transform: 'translateX(-3px)' },
            transition: 'all 0.3s ease',
          }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 45, height: 45, borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 25px rgba(99, 102, 241, 0.5)',
            }}>
              <SupportAgentIcon sx={{ color: '#fff', fontSize: 26 }} />
            </Box>
            <Typography variant="h6" sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #fff, #a78bfa, #06b6d4)',
              backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Agent Dashboard
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Refresh" arrow>
            <IconButton onClick={handleRefresh} disabled={refreshing} sx={{
              color: '#fff', background: 'rgba(99, 102, 241, 0.2)',
              '&:hover': { background: 'rgba(99,102,241,0.4)' },
            }}>
              <RefreshIcon sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </Tooltip>
          {user && (
            <Box sx={{
              px: 2, py: 0.8, borderRadius: '12px',
              background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)',
            }}>
              <Typography variant="body2" sx={{ color: '#a78bfa', fontWeight: 600 }}>
                🛡️ {user.fullName}
              </Typography>
            </Box>
          )}
          <Tooltip title="Logout" arrow>
            <IconButton onClick={handleLogout} sx={{
              color: 'rgba(255,255,255,0.7)', background: 'rgba(239, 68, 68, 0.15)',
              '&:hover': { color: '#fff', background: 'rgba(239,68,68,0.3)' },
            }}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ pt: 14, position: 'relative', zIndex: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Welcome Banner */}
        <Box sx={{
          mb: 4, p: { xs: 3, md: 4 }, borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.08) 50%, rgba(6, 182, 212, 0.1) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.25)', backdropFilter: 'blur(20px)',
        }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#f0f0ff', mb: 0.5 }}>
            Welcome, Agent {user?.fullName?.split(' ')[0] || ''} 🛡️
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {tickets.length === 0
              ? 'No tickets in the queue right now. Check back later!'
              : `You have ${statusCounts.open} open ticket${statusCounts.open !== 1 ? 's' : ''} and ${statusCounts['in-progress']} in progress.`}
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 5 }}>
          <StatCard
            icon={<ConfirmationNumberIcon sx={{ color: '#fff', fontSize: 28 }} />}
            title="Total Queue" value={tickets.length}
            color="#6366f1" gradient={['#6366f1', '#8b5cf6']}
          />
          <StatCard
            icon={<AccessTimeIcon sx={{ color: '#fff', fontSize: 28 }} />}
            title="Open" value={statusCounts.open}
            color="#06b6d4" gradient={['#06b6d4', '#0891b2']}
          />
          <StatCard
            icon={<AutorenewIcon sx={{ color: '#fff', fontSize: 28 }} />}
            title="In Progress" value={statusCounts['in-progress']}
            color="#f59e0b" gradient={['#f59e0b', '#d97706']}
          />
          <StatCard
            icon={<CheckCircleIcon sx={{ color: '#fff', fontSize: 28 }} />}
            title="Resolved" value={statusCounts.resolved}
            color="#10b981" gradient={['#10b981', '#059669']}
          />
        </Box>

        {/* Filter Tabs */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5" sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #fff, #a78bfa)',
            backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Ticket Queue
          </Typography>
          <Tabs
            value={statusFilter} onChange={(_, v) => setStatusFilter(v)}
            variant="scrollable" scrollButtons="auto"
            sx={{
              minHeight: 36,
              '& .MuiTab-root': {
                minHeight: 36, py: 0.5, px: 2, fontSize: '0.8rem', fontWeight: 600,
                color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize',
                '&.Mui-selected': { color: '#a78bfa' },
              },
              '& .MuiTabs-indicator': { background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: 2 },
            }}
          >
            <Tab label={`All (${tickets.length})`} value="all" />
            <Tab label={`Open (${statusCounts.open})`} value="open" />
            <Tab label={`In Progress (${statusCounts['in-progress']})`} value="in-progress" />
            <Tab label={`Resolved (${statusCounts.resolved})`} value="resolved" />
          </Tabs>
        </Box>

        {/* Ticket Cards */}
        {filteredTickets.length === 0 ? (
          <Card sx={{
            p: 6, textAlign: 'center',
            background: 'rgba(99, 102, 241, 0.05)', border: '2px dashed rgba(99, 102, 241, 0.3)', borderRadius: '20px',
          }}>
            <SupportAgentIcon sx={{ fontSize: 60, color: 'rgba(255,255,255,0.3)', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
              {statusFilter === 'all' ? 'No tickets in queue' : `No ${statusFilter} tickets`}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
              {statusFilter === 'all' ? 'All clear! No tickets need attention.' : 'Try switching to a different filter.'}
            </Typography>
          </Card>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
            {filteredTickets.map((ticket) => (
              <Card
                key={ticket.id}
                onClick={() => {
                  setSelectedTicket(ticket);
                  setResponseText('');
                  setNewStatus('');
                }}
                sx={{
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)',
                  border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: '20px',
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
                      label={ticket.status} size="small"
                      sx={{
                        background: statusColors[ticket.status]?.bg || statusColors.open.bg,
                        color: statusColors[ticket.status]?.text || statusColors.open.text,
                        border: `1px solid ${statusColors[ticket.status]?.border || statusColors.open.border}`,
                        fontWeight: 600, textTransform: 'capitalize',
                      }}
                    />
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#f0f0ff', mb: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ticket.subject}
                  </Typography>
                  <Typography variant="body2" sx={{
                    color: 'rgba(255,255,255,0.7)', mb: 2, overflow: 'hidden', textOverflow: 'ellipsis',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    {ticket.description}
                  </Typography>

                  {/* Customer Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <PersonIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }} />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      {ticket.userName} ({ticket.userEmail})
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={ticket.priority} size="small"
                      sx={{
                        background: priorityColors[ticket.priority]?.bg,
                        color: priorityColors[ticket.priority]?.text,
                        border: `1px solid ${priorityColors[ticket.priority]?.border}`,
                        fontWeight: 600, textTransform: 'capitalize',
                      }}
                    />
                    <Tooltip title={formatDate(ticket.createdAt)} arrow>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', cursor: 'default' }}>
                        {getRelativeTime(ticket.createdAt)}
                      </Typography>
                    </Tooltip>
                  </Box>

                  {/* Indicators */}
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {ticket.assignedAgentName && (
                      <Chip icon={<AssignmentIndIcon sx={{ fontSize: 14 }} />} label={ticket.assignedAgentName} size="small"
                        sx={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.3)', fontSize: '0.7rem' }} />
                    )}
                    {ticket.aiResponse && (
                      <Chip icon={<SmartToyIcon sx={{ fontSize: 14 }} />} label="AI Response" size="small"
                        sx={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', fontSize: '0.7rem' }} />
                    )}
                    {ticket.agentResponse && (
                      <Chip icon={<SupportAgentIcon sx={{ fontSize: 14 }} />} label="Agent Responded" size="small"
                        sx={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '0.7rem' }} />
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Container>

      {/* Ticket Detail Dialog */}
      <Dialog
        open={!!selectedTicket} onClose={() => setSelectedTicket(null)}
        maxWidth="md" fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(3, 0, 20, 0.98) 0%, rgba(20, 10, 40, 0.98) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '24px', backdropFilter: 'blur(20px)',
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
                    <Typography sx={{
                      fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: 700, color: '#a78bfa',
                      background: 'rgba(139, 92, 246, 0.15)', px: 1, py: 0.2, borderRadius: '6px',
                    }}>
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
                    fontWeight: 600, textTransform: 'capitalize',
                  }}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              {/* Meta Info */}
              <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip label={`Priority: ${selectedTicket.priority}`} sx={{
                  background: priorityColors[selectedTicket.priority]?.bg,
                  color: priorityColors[selectedTicket.priority]?.text,
                  border: `1px solid ${priorityColors[selectedTicket.priority]?.border}`,
                  fontWeight: 600, textTransform: 'capitalize',
                }} />
                <Chip label={`Category: ${selectedTicket.category}`} sx={{
                  background: 'rgba(99, 102, 241, 0.15)', color: '#a78bfa',
                  border: '1px solid rgba(99, 102, 241, 0.3)', fontWeight: 600, textTransform: 'capitalize',
                }} />
                <Chip icon={<PersonIcon />} label={`${selectedTicket.userName} (${selectedTicket.userEmail})`} sx={{
                  background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4',
                  border: '1px solid rgba(6, 182, 212, 0.3)', fontWeight: 500,
                }} />
              </Box>

              {/* Description */}
              <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                Customer's Description
              </Typography>
              <Box sx={{
                p: 3, borderRadius: '16px',
                background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', mb: 3,
              }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.9)', whiteSpace: 'pre-wrap' }}>
                  {selectedTicket.description}
                </Typography>
              </Box>

              {/* AI Response */}
              {selectedTicket.aiResponse && (
                <>
                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SmartToyIcon sx={{ color: '#8b5cf6' }} />
                    <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      AI Assistant Response
                    </Typography>
                  </Box>
                  <Box sx={{
                    p: 3, borderRadius: '16px', mb: 3,
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                  }}>
                    <Typography sx={{ color: 'rgba(255,255,255,0.9)', whiteSpace: 'pre-wrap' }}>
                      {selectedTicket.aiResponse}
                    </Typography>
                  </Box>
                </>
              )}

              {/* Existing Agent Response */}
              {selectedTicket.agentResponse && (
                <>
                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SupportAgentIcon sx={{ color: '#10b981' }} />
                    <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Your Response
                    </Typography>
                  </Box>
                  <Box sx={{
                    p: 3, borderRadius: '16px', mb: 3,
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}>
                    <Typography sx={{ color: 'rgba(255,255,255,0.9)', whiteSpace: 'pre-wrap' }}>
                      {selectedTicket.agentResponse}
                    </Typography>
                  </Box>
                </>
              )}

              {/* Assign Button */}
              {!selectedTicket.assignedAgentName && (
                <Button
                  onClick={() => handleAssign(selectedTicket.id)}
                  startIcon={<AssignmentIndIcon />}
                  variant="outlined"
                  sx={{
                    mb: 3, color: '#a78bfa', borderColor: 'rgba(139, 92, 246, 0.4)',
                    '&:hover': { background: 'rgba(139, 92, 246, 0.15)', borderColor: '#a78bfa' },
                  }}
                >
                  Assign to Me
                </Button>
              )}

              {/* Agent Response Input */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  {selectedTicket.agentResponse ? 'Update Response' : 'Write Response'}
                </Typography>
                <TextField
                  fullWidth multiline rows={3}
                  placeholder="Type your response to the customer..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '14px', bgcolor: 'rgba(99, 102, 241, 0.05)',
                      '& fieldset': { borderColor: 'rgba(99, 102, 241, 0.25)', borderWidth: '2px' },
                      '&:hover fieldset': { borderColor: 'rgba(99, 102, 241, 0.5)' },
                      '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                    },
                    '& .MuiInputBase-input': { color: '#fff' },
                  }}
                />
                <Button
                  onClick={handleRespond}
                  disabled={!responseText.trim() || responding}
                  startIcon={responding ? <CircularProgress size={16} /> : <SendIcon />}
                  variant="contained"
                  sx={{
                    mt: 1.5, px: 3, borderRadius: '12px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
                  }}
                >
                  {responding ? 'Sending...' : 'Send Response'}
                </Button>
              </Box>

              {/* Status Update */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Update Status:
                </Typography>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.5)' }}>Status</InputLabel>
                  <Select
                    value={newStatus} label="Status"
                    onChange={(e) => setNewStatus(e.target.value)}
                    sx={{
                      borderRadius: '12px', color: '#fff',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(99, 102, 241, 0.3)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(99, 102, 241, 0.5)' },
                      '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.5)' },
                    }}
                  >
                    <MenuItem value="open">Open</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                    <MenuItem value="closed">Closed</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  onClick={() => handleStatusChange(selectedTicket.id, newStatus)}
                  disabled={!newStatus || statusUpdating || newStatus === selectedTicket.status}
                  variant="outlined"
                  size="small"
                  sx={{
                    borderRadius: '10px', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)',
                    '&:hover': { background: 'rgba(16, 185, 129, 0.15)', borderColor: '#10b981' },
                  }}
                >
                  {statusUpdating ? 'Updating...' : 'Update'}
                </Button>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button onClick={() => setSelectedTicket(null)} sx={{
                color: 'rgba(255,255,255,0.7)',
                '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.1)' },
              }}>
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

export default AgentDashboard;
