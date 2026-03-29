import React, { useState, useEffect, useRef } from 'react';
import {
  Box, TextField, Typography, Chip, Alert, LinearProgress, IconButton,
  Fade, Grow, Avatar, Tooltip, CircularProgress
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as AIIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  AutoAwesome as SparkleIcon,
  FiberManualRecord as DotIcon,
  Refresh as RefreshIcon,
  SupportAgent as SupportIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import aiService from '../../services/aiService';

function AIChatBox({ ticketId = null }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiServiceStatus, setAiServiceStatus] = useState('checking');
  const [copiedId, setCopiedId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const retryTimerRef = useRef(null);

  // Health check on mount
  useEffect(() => {
    checkAIServiceHealth();
    return () => { if (retryTimerRef.current) clearInterval(retryTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-retry every 15s when offline; stop when online
  useEffect(() => {
    if (retryTimerRef.current) clearInterval(retryTimerRef.current);
    if (aiServiceStatus === 'offline') {
      retryTimerRef.current = setInterval(() => {
        checkAIServiceHealth();
      }, 15000);
    }
    return () => { if (retryTimerRef.current) clearInterval(retryTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiServiceStatus]);

  const checkAIServiceHealth = async () => {
    setAiServiceStatus('checking');
    try {
      await aiService.healthCheck(3, 5000);
      setAiServiceStatus('online');
    } catch (err) {
      setAiServiceStatus('offline');
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setSelectedImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    const text = inputMessage.trim();
    if ((!text && !selectedImage) || loading) return;

    const userMsg = {
      id: Date.now(),
      text: text || '(Image attached)',
      sender: 'user',
      timestamp: new Date(),
      image: imagePreview
    };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');

    const currentImage = selectedImage;
    const currentText = text;

    // Clear image after adding to messages
    handleRemoveImage();
    setLoading(true);

    try {
      const resp = await aiService.getAIResponse(currentText, ticketId, currentImage);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: resp.response,
        sender: 'ai',
        timestamp: new Date(),
        confidence: resp.confidence_score,
        sources: resp.sources,
        shouldEscalate: resp.should_escalate || resp.confidence_score < 0.75,
        topSimilarity: resp.top_similarity
      }]);
      if (aiServiceStatus !== 'online') setAiServiceStatus('online');
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting. Please try again in a moment.",
        sender: 'ai', timestamp: new Date(), isError: true
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getConfColor = (c) => c >= 0.70 ? '#10b981' : c >= 0.50 ? '#f59e0b' : '#f43f5e';
  const getConfLabel = (c) => c >= 0.85 ? 'Excellent Match' : c >= 0.70 ? 'High Confidence' : c >= 0.50 ? 'Moderate' : c >= 0.35 ? 'Low Confidence' : 'General Answer';
  const getConfDesc = (c) => c >= 0.70 ? 'From knowledge base' : c >= 0.50 ? 'Partial match found' : 'General AI response';
  const fmtTime = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const suggestions = [
    { emoji: '\uD83D\uDD10', text: 'How do I reset my password?' },
    { emoji: '\uD83D\uDCB0', text: 'What is the refund policy?' },
    { emoji: '\uD83D\uDCE6', text: 'How can I track my order?' },
    { emoji: '\u274C', text: 'How to cancel my subscription?' },
  ];

  const isOffline = aiServiceStatus === 'offline';
  const isChecking = aiServiceStatus === 'checking';
  const statusColor = aiServiceStatus === 'online' ? '#10b981' : isChecking ? '#f59e0b' : '#f43f5e';
  const statusText = aiServiceStatus === 'online' ? 'Online' : isChecking ? 'Connecting...' : 'Offline';

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ====== HEADER ====== */}
      <Box sx={{
        px: { xs: 2, md: 3 }, py: 2,
        background: 'linear-gradient(180deg, rgba(8,8,30,0.98) 0%, rgba(5,5,24,0.95) 100%)',
        borderBottom: '1px solid rgba(99,102,241,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{
            width: 46, height: 46, borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
            boxShadow: '0 6px 24px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}>
            <SupportIcon sx={{ fontSize: 26, color: '#fff' }} />
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff', lineHeight: 1.3, letterSpacing: '-0.3px' }}>
              AI Support Agent
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>
              Powered by Gemini AI &amp; RAG
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isOffline && (
            <Tooltip title="Retry connection" arrow>
              <IconButton onClick={checkAIServiceHealth} size="small" sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#fff' } }}>
                <RefreshIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
          <Chip
            icon={isChecking
              ? <CircularProgress size={10} sx={{ color: statusColor + ' !important' }} />
              : <DotIcon sx={{
                  fontSize: '8px !important', color: statusColor + ' !important',
                  animation: aiServiceStatus === 'online' ? 'statusPulse 3s ease-in-out infinite' : 'none',
                }} />
            }
            label={statusText}
            size="small"
            sx={{
              bgcolor: statusColor + '15', color: statusColor,
              border: '1px solid ' + statusColor + '30',
              fontWeight: 600, fontSize: '0.68rem', height: 28,
              '& .MuiChip-icon': { ml: '8px' },
            }}
          />
        </Box>
      </Box>

      {/* ====== OFFLINE BANNER ====== */}
      {isOffline && (
        <Alert
          severity="warning"
          action={
            <IconButton size="small" onClick={checkAIServiceHealth} sx={{ color: '#f59e0b' }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          }
          sx={{
            mx: 2, mt: 1.5, py: 0.5,
            bgcolor: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.12)',
            borderRadius: '12px', color: '#fbbf24', fontSize: '0.78rem',
            '& .MuiAlert-icon': { color: '#f59e0b' },
          }}
        >
          AI Service is starting up. Auto-retrying every 15 seconds...
        </Alert>
      )}

      {/* ====== MESSAGES ====== */}
      <Box sx={{
        flexGrow: 1, overflowY: 'auto', px: { xs: 2, md: 3 }, py: 2.5,
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.06)', borderRadius: '10px' },
        '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(255,255,255,0.12)' },
      }}>

        {/* Empty State */}
        {messages.length === 0 && (
          <Fade in timeout={600}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Box sx={{
                width: 90, height: 90, borderRadius: '28px',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15), rgba(6,182,212,0.08))',
                border: '1px solid rgba(99,102,241,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mb: 3, animation: 'float3D 6s ease-in-out infinite',
                boxShadow: '0 12px 48px rgba(99,102,241,0.15), 0 0 60px rgba(139,92,246,0.06)',
              }}>
                <SparkleIcon sx={{ fontSize: 42, color: '#818cf8' }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1.35rem', color: '#fff', mb: 0.5 }}>
                How can I help you today?
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.35)', mb: 4, textAlign: 'center', maxWidth: 380, fontSize: '0.85rem', lineHeight: 1.6 }}>
                Ask me anything about your account, orders, billing, or technical issues.
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', maxWidth: 520 }}>
                {suggestions.map((s, i) => (
                  <Chip key={i}
                    label={s.emoji + '  ' + s.text}
                    onClick={() => { setInputMessage(s.text); setTimeout(() => inputRef.current?.focus(), 50); }}
                    sx={{
                      cursor: isOffline || isChecking ? 'not-allowed' : 'pointer',
                      opacity: isOffline || isChecking ? 0.4 : 1,
                      pointerEvents: isOffline || isChecking ? 'none' : 'auto',
                      py: 2.5, px: 1,
                      bgcolor: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.65)',
                      fontWeight: 500, fontSize: '0.82rem',
                      border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px',
                      transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      '&:hover': {
                        bgcolor: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.3)',
                        color: '#fff', transform: 'translateY(-3px) scale(1.02)',
                        boxShadow: '0 12px 32px rgba(99, 102, 241, 0.15)',
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Fade>
        )}

        {/* Messages */}
        {messages.map((msg, idx) => (
          <Grow in key={msg.id} timeout={350}>
            <Box sx={{
              display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              mb: 2.5,
            }}>
              <Box sx={{ maxWidth: { xs: '88%', md: '75%' } }}>

                {/* Sender label */}
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.6,
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                }}>
                  <Avatar sx={{
                    width: 24, height: 24, borderRadius: '8px',
                    bgcolor: msg.sender === 'user' ? 'rgba(255,255,255,0.1)' : 'transparent',
                    background: msg.sender === 'ai' ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : undefined,
                  }}>
                    {msg.sender === 'ai'
                      ? <AIIcon sx={{ fontSize: 14, color: '#fff' }} />
                      : <PersonIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }} />}
                  </Avatar>
                  <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 500, fontSize: '0.66rem' }}>
                    {msg.sender === 'ai' ? 'AI Assistant' : 'You'} &middot; {fmtTime(msg.timestamp)}
                  </Typography>
                </Box>

                {/* Bubble */}
                <Box sx={{
                  position: 'relative', p: 2, px: 2.5,
                  borderRadius: '18px',
                  borderTopLeftRadius: msg.sender === 'ai' ? '6px' : '18px',
                  borderTopRightRadius: msg.sender === 'user' ? '6px' : '18px',
                  background: msg.sender === 'user'
                    ? 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)'
                    : msg.isError
                      ? 'rgba(139, 92, 246, 0.06)'
                      : 'rgba(255,255,255,0.04)',
                  border: msg.sender === 'user' ? 'none'
                    : msg.isError ? '1px solid rgba(139, 92, 246, 0.12)' : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: msg.sender === 'user'
                    ? '0 6px 28px rgba(79, 70, 229, 0.2), inset 0 1px 0 rgba(255,255,255,0.15)'
                    : '0 2px 12px rgba(0,0,0,0.15)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: msg.sender === 'user'
                      ? '0 8px 32px rgba(79, 70, 229, 0.25)'
                      : '0 4px 18px rgba(0,0,0,0.2)',
                  },
                  '&:hover .copy-btn': { opacity: 1 },
                }}>
                  {/* Show image if present */}
                  {msg.image && (
                    <Box sx={{
                      mb: msg.text ? 1.5 : 0,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      maxWidth: '300px',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <img
                        src={msg.image}
                        alt="Uploaded"
                        style={{
                          width: '100%',
                          height: 'auto',
                          display: 'block'
                        }}
                      />
                    </Box>
                  )}
                  <Typography sx={{
                    whiteSpace: 'pre-wrap', lineHeight: 1.75, fontSize: '0.88rem',
                    color: msg.sender === 'user' ? '#fff' : msg.isError ? '#c4b5fd' : 'rgba(255,255,255,0.88)',
                  }}>
                    {msg.text}
                  </Typography>

                  {/* Copy button */}
                  {msg.sender === 'ai' && !msg.isError && (
                    <IconButton
                      className="copy-btn"
                      onClick={() => handleCopy(msg.text, msg.id)}
                      size="small"
                      sx={{
                        position: 'absolute', top: 8, right: 8, opacity: 0,
                        transition: 'opacity 0.2s', color: 'rgba(255,255,255,0.3)',
                        '&:hover': { color: 'rgba(255,255,255,0.6)' },
                      }}
                    >
                      {copiedId === msg.id
                        ? <CheckIcon sx={{ fontSize: 14 }} />
                        : <CopyIcon sx={{ fontSize: 14 }} />}
                    </IconButton>
                  )}
                </Box>

                {/* Confidence */}
                {msg.sender === 'ai' && msg.confidence !== undefined && (
                  <Box sx={{
                    mt: 1, p: 1.2, px: 1.5, borderRadius: '12px',
                    bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.63rem', fontWeight: 500 }}>
                        {getConfDesc(msg.confidence)}
                      </Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.66rem', color: getConfColor(msg.confidence) }}>
                        {(msg.confidence * 100).toFixed(0)}% &middot; {getConfLabel(msg.confidence)}
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={msg.confidence * 100}
                      sx={{
                        height: 3, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 2,
                          background: msg.confidence >= 0.70
                            ? 'linear-gradient(90deg, #10b981, #059669)'
                            : msg.confidence >= 0.50
                              ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                              : 'linear-gradient(90deg, #f43f5e, #e11d48)',
                        }
                      }}
                    />
                  </Box>
                )}

                {/* Escalation */}
                {msg.sender === 'ai' && msg.confidence !== undefined && msg.confidence < 0.50 && (
                  <Box sx={{
                    mt: 1, p: 1, px: 1.5, borderRadius: '12px',
                    bgcolor: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.1)',
                    display: 'flex', alignItems: 'center', gap: 0.8,
                  }}>
                    <WarningIcon sx={{ fontSize: 13, color: '#a78bfa' }} />
                    <Typography sx={{ color: '#c4b5fd', fontSize: '0.7rem' }}>
                      General response. For specific help, contact support.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Grow>
        ))}

        {/* Typing indicator */}
        {loading && (
          <Fade in>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
              <Avatar sx={{
                width: 24, height: 24, borderRadius: '8px', mt: 0.3,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              }}>
                <AIIcon sx={{ fontSize: 14, color: '#fff' }} />
              </Avatar>
              <Box sx={{
                p: 1.5, px: 2.5, borderRadius: '18px', borderTopLeftRadius: '6px',
                bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', gap: 1.5,
              }}>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </Box>
                <Typography sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem' }}>
                  Thinking...
                </Typography>
              </Box>
            </Box>
          </Fade>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* ====== INPUT ====== */}
      <Box sx={{
        px: { xs: 2, md: 3 }, py: 2,
        borderTop: '1px solid rgba(99,102,241,0.15)',
        background: 'linear-gradient(0deg, rgba(8,8,30,0.98) 0%, rgba(5,5,24,0.95) 100%)',
      }}>
        {/* Image preview */}
        {imagePreview && (
          <Box sx={{
            mb: 1.5,
            p: 1,
            borderRadius: '12px',
            bgcolor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(99,102,241,0.2)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            position: 'relative'
          }}>
            <ImageIcon sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 20 }} />
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                maxWidth: '80px',
                maxHeight: '80px',
                borderRadius: '8px',
                objectFit: 'cover'
              }}
            />
            <IconButton
              size="small"
              onClick={handleRemoveImage}
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                bgcolor: 'rgba(239,68,68,0.9)',
                color: '#fff',
                width: 24,
                height: 24,
                '&:hover': { bgcolor: 'rgba(220,38,38,1)' }
              }}
            >
              <CloseIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />

          {/* Attach button */}
          <Tooltip title="Attach image" arrow>
            <IconButton
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || isOffline || isChecking || selectedImage !== null}
              sx={{
                width: 50,
                height: 50,
                borderRadius: '16px',
                flexShrink: 0,
                bgcolor: selectedImage ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                color: selectedImage ? '#818cf8' : 'rgba(255,255,255,0.3)',
                border: '1px solid rgba(99,102,241,0.15)',
                transition: 'all 0.3s',
                '&:hover': {
                  bgcolor: 'rgba(99,102,241,0.15)',
                  borderColor: 'rgba(99,102,241,0.3)',
                  color: '#818cf8'
                },
                '&:disabled': {
                  bgcolor: 'rgba(255,255,255,0.02)',
                  color: 'rgba(255,255,255,0.1)',
                  borderColor: 'rgba(255,255,255,0.05)'
                }
              }}
            >
              <AttachFileIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <TextField
            inputRef={inputRef}
            fullWidth multiline maxRows={4}
            placeholder={isOffline ? 'AI Service is offline...' : isChecking ? 'Connecting to AI...' : 'Type your message...'}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading || isOffline || isChecking}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.04)',
                color: '#f5f5f5', fontSize: '0.9rem', py: 0.5,
                '& fieldset': { borderColor: 'rgba(99,102,241,0.15)' },
                '&:hover fieldset': { borderColor: 'rgba(99,102,241,0.3)' },
                '&.Mui-focused fieldset': { borderColor: 'rgba(99,102,241,0.5)', borderWidth: '1.5px' },
                '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.02)' },
              },
              '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.2)' },
              '& .MuiInputBase-input.Mui-disabled::placeholder': { color: 'rgba(255,255,255,0.15)' },
            }}
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={(!inputMessage.trim() && !selectedImage) || loading || isOffline || isChecking}
            sx={{
              width: 50, height: 50, borderRadius: '16px', flexShrink: 0,
              background: (inputMessage.trim() || selectedImage) && !loading && !isOffline && !isChecking
                ? 'linear-gradient(135deg, #4f46e5, #3730a3)' : 'rgba(255,255,255,0.04)',
              color: (inputMessage.trim() || selectedImage) && !loading && !isOffline && !isChecking ? '#fff' : 'rgba(255,255,255,0.15)',
              boxShadow: (inputMessage.trim() || selectedImage) && !loading && !isOffline && !isChecking ? '0 4px 20px rgba(79,70,229,0.25)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: 'linear-gradient(135deg, #b91c1c, #991b1b)',
                boxShadow: '0 6px 28px rgba(220,38,38,0.35)',
                transform: 'translateY(-1px)',
              },
              '&:disabled': { background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.1)' },
            }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: 'rgba(255,255,255,0.3)' }} /> : <SendIcon sx={{ fontSize: 20 }} />}
          </IconButton>
        </Box>
        <Typography sx={{ color: 'rgba(255,255,255,0.12)', mt: 0.8, textAlign: 'center', fontSize: '0.62rem' }}>
          Press Enter to send &middot; Shift+Enter for new line
        </Typography>
      </Box>
    </Box>
  );
}

export default AIChatBox;
