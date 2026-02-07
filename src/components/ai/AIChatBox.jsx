import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Chip,
  Divider,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as AIIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Source as SourceIcon,
  Psychology as BrainIcon
} from '@mui/icons-material';
import aiService from '../../services/aiService';

/**
 * AI Chat Box Component - Dark 3D Futuristic Theme
 * With dynamic confidence scoring from vector embeddings
 */
function AIChatBox({ ticketId = null }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiServiceStatus, setAiServiceStatus] = useState('checking');
  const messagesEndRef = useRef(null);

  // Check AI service health on component mount
  useEffect(() => {
    checkAIServiceHealth();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkAIServiceHealth = async () => {
    try {
      await aiService.healthCheck();
      setAiServiceStatus('online');
    } catch (error) {
      setAiServiceStatus('offline');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const aiResponse = await aiService.getAIResponse(inputMessage, ticketId);

      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponse.response,
        sender: 'ai',
        timestamp: new Date(),
        confidence: aiResponse.confidence_score,
        sources: aiResponse.sources,
        shouldEscalate: aiResponse.should_escalate || aiResponse.confidence_score < 0.75,
        topSimilarity: aiResponse.top_similarity
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble right now. Please try again or contact a human agent.",
        sender: 'ai',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.70) return '#00ff88';
    if (confidence >= 0.50) return '#ffaa00';
    return '#ff4444';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.85) return 'Excellent';
    if (confidence >= 0.70) return 'High';
    if (confidence >= 0.50) return 'Medium';
    if (confidence >= 0.35) return 'Low';
    return 'General Answer';
  };

  const getConfidenceDescription = (confidence) => {
    if (confidence >= 0.70) return 'Answer from knowledge base';
    if (confidence >= 0.50) return 'Partial match found';
    return 'General AI response';
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'transparent',
      p: 2
    }}>
      
      {/* Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2.5, 
          mb: 2,
          background: 'linear-gradient(135deg, rgba(10, 10, 25, 0.9) 0%, rgba(20, 15, 35, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          border: '1px solid rgba(0, 245, 255, 0.15)',
          boxShadow: '0 0 40px rgba(0, 245, 255, 0.08)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.5), rgba(255, 0, 255, 0.5), transparent)',
          }
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Box 
              sx={{ 
                background: 'linear-gradient(135deg, #00f5ff 0%, #ff00ff 100%)',
                borderRadius: '50%',
                p: 1.2,
                display: 'flex',
                mr: 2,
                boxShadow: '0 0 20px rgba(0, 245, 255, 0.5)',
                animation: 'glow 2s ease-in-out infinite alternate'
              }}
            >
              <BrainIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold" sx={{ 
                background: 'linear-gradient(135deg, #00f5ff 0%, #ff00ff 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px'
              }}>
                AI Support Assistant
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Powered by Gemini AI + Vector Embeddings
              </Typography>
            </Box>
          </Box>
          <Chip
            label={aiServiceStatus === 'online' ? '● Online' : '● Offline'}
            sx={{
              bgcolor: aiServiceStatus === 'online' 
                ? 'rgba(0, 255, 136, 0.2)' 
                : 'rgba(255, 68, 68, 0.2)',
              color: aiServiceStatus === 'online' ? '#00ff88' : '#ff4444',
              fontWeight: 'bold',
              border: `1px solid ${aiServiceStatus === 'online' ? '#00ff88' : '#ff4444'}`,
              px: 1
            }}
            size="small"
          />
        </Box>
      </Paper>

      {/* Service Status Alert */}
      {aiServiceStatus === 'offline' && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            bgcolor: 'rgba(255, 68, 68, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 68, 68, 0.3)',
            borderRadius: 2,
            color: '#ff6666'
          }}
        >
          AI Service is currently offline. Please try again later or contact support.
        </Alert>
      )}

      {/* Chat Messages Area */}
      <Paper
        elevation={0}
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 3,
          mb: 2,
          background: 'rgba(10, 10, 20, 0.6)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          border: '1px solid rgba(255, 255, 255, 0.05)',
          maxHeight: '450px',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(135deg, #00f5ff 0%, #ff00ff 100%)',
            borderRadius: '10px',
          },
        }}
      >
        {messages.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #00f5ff 0%, #ff00ff 100%)',
                borderRadius: '50%',
                p: 3,
                mb: 3,
                boxShadow: '0 0 60px rgba(0, 245, 255, 0.4), 0 0 100px rgba(255, 0, 255, 0.3)',
                animation: 'float 3s ease-in-out infinite'
              }}
            >
              <BrainIcon sx={{ fontSize: 60, color: 'white' }} />
            </Box>
            <Typography 
              variant="h5" 
              fontWeight="bold"
              sx={{
                background: 'linear-gradient(135deg, #00f5ff 0%, #ff00ff 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              👋 Hi! I'm your AI assistant
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 3, textAlign: 'center' }}>
              Ask me anything! I use semantic search to find the best answers.
            </Typography>
            
            {/* Quick Reply Suggestions */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', maxWidth: 550, mt: 1 }}>
              {[
                { emoji: "🔐", text: "Reset my password" },
                { emoji: "💰", text: "Refund policy" },
                { emoji: "📦", text: "Track my order" },
                { emoji: "❌", text: "Cancel subscription" }
              ].map((suggestion, index) => (
                <Chip
                  key={index}
                  label={`${suggestion.emoji} ${suggestion.text}`}
                  onClick={() => setInputMessage(suggestion.text)}
                  sx={{
                    cursor: 'pointer',
                    py: 2,
                    px: 1,
                    bgcolor: 'rgba(0, 245, 255, 0.08)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    border: '1px solid rgba(0, 245, 255, 0.2)',
                    borderRadius: '12px',
                    '&:hover': {
                      bgcolor: 'rgba(0, 245, 255, 0.15)',
                      borderColor: 'rgba(0, 245, 255, 0.5)',
                      transform: 'translateY(-3px) scale(1.02)',
                      boxShadow: '0 8px 25px rgba(0, 245, 255, 0.25)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                />
              ))}
            </Box>
          </Box>
        ) : (
          <>
            {messages.map((message) => (
              <Box
                key={message.id}
                display="flex"
                justifyContent={message.sender === 'user' ? 'flex-end' : 'flex-start'}
                mb={2}
              >
                <Card
                  elevation={0}
                  sx={{
                    maxWidth: '80%',
                    background: message.sender === 'user' 
                      ? 'linear-gradient(135deg, #00f5ff 0%, #0099ff 100%)'
                      : 'rgba(25, 25, 45, 0.9)',
                    color: 'white',
                    borderRadius: 3,
                    border: message.sender === 'user' 
                      ? 'none' 
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: message.sender === 'user'
                      ? '0 4px 30px rgba(0, 245, 255, 0.3)'
                      : '0 4px 20px rgba(0, 0, 0, 0.3)',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    {/* Message Header */}
                    <Box display="flex" alignItems="center" mb={1.5}>
                      {message.sender === 'ai' ? (
                        <Box
                          sx={{
                            background: 'linear-gradient(135deg, #00f5ff 0%, #ff00ff 100%)',
                            borderRadius: '50%',
                            p: 0.5,
                            display: 'flex',
                            mr: 1
                          }}
                        >
                          <AIIcon sx={{ fontSize: 16, color: 'white' }} />
                        </Box>
                      ) : (
                        <PersonIcon sx={{ mr: 1, fontSize: 18, opacity: 0.9 }} />
                      )}
                      <Typography variant="caption" fontWeight="bold" sx={{ opacity: 0.9 }}>
                        {message.sender === 'ai' ? 'AI Assistant' : 'You'}
                      </Typography>
                      <Typography variant="caption" sx={{ ml: 'auto', opacity: 0.6 }}>
                        {formatTime(message.timestamp)}
                      </Typography>
                    </Box>

                    {/* Message Text */}
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {message.text}
                    </Typography>

                    {/* Confidence Score Display - Only for AI messages */}
                    {message.sender === 'ai' && message.confidence !== undefined && (
                      <Box mt={2} sx={{ 
                        p: 1.5, 
                        borderRadius: 2, 
                        bgcolor: 'rgba(0, 0, 0, 0.4)',
                        border: `1px solid ${getConfidenceColor(message.confidence)}20`,
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>
                            {getConfidenceDescription(message.confidence)}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            fontWeight="bold"
                            sx={{ 
                              color: getConfidenceColor(message.confidence),
                              textShadow: `0 0 10px ${getConfidenceColor(message.confidence)}50`
                            }}
                          >
                            {(message.confidence * 100).toFixed(0)}% • {getConfidenceLabel(message.confidence)}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={message.confidence * 100}
                          sx={{
                            height: 4,
                            borderRadius: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              background: message.confidence >= 0.75 
                                ? 'linear-gradient(90deg, #00ff88, #00cc6a)'
                                : message.confidence >= 0.50 
                                  ? 'linear-gradient(90deg, #ffaa00, #ff8800)'
                                  : 'linear-gradient(90deg, #ff4444, #cc0000)',
                            }
                          }}
                        />
                      </Box>
                    )}

                    {/* Escalation Alert - only for very low confidence */}
                    {message.sender === 'ai' && message.confidence !== undefined && message.confidence < 0.50 && (
                      <Box mt={2}>
                        <Alert 
                          severity="info" 
                          icon={<WarningIcon sx={{ color: '#8b5cf6' }} />}
                          sx={{ 
                            py: 0.5,
                            bgcolor: 'rgba(139, 92, 246, 0.1)',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            color: '#c4b5fd',
                            borderRadius: 2
                          }}
                        >
                          <Typography variant="caption">
                            This is a general response. For specific help, contact support@company.com
                          </Typography>
                        </Alert>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>
            ))}
          </>
        )}

        {/* Loading Indicator - Typing Animation */}
        {loading && (
          <Box display="flex" alignItems="center" mb={2}>
            <Card 
              elevation={0}
              sx={{ 
                p: 2, 
                px: 3,
                bgcolor: 'rgba(25, 25, 45, 0.9)',
                borderRadius: 3,
                border: '1px solid rgba(0, 245, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                boxShadow: '0 0 20px rgba(0, 245, 255, 0.1)'
              }}
            >
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #00f5ff 0%, #ff00ff 100%)',
                  borderRadius: '50%',
                  p: 0.5,
                  display: 'flex'
                }}
              >
                <AIIcon sx={{ fontSize: 16, color: 'white' }} />
              </Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', ml: 1 }}>
                Searching knowledge base...
              </Typography>
            </Card>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Paper>

      {/* Input Area */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2,
          background: 'linear-gradient(135deg, rgba(10, 10, 25, 0.95) 0%, rgba(15, 10, 30, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          border: '1px solid rgba(0, 245, 255, 0.12)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.3), rgba(255, 0, 255, 0.3), transparent)',
          }
        }}
      >
        <Box display="flex" gap={1.5}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="Ask me anything..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading || aiServiceStatus === 'offline'}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                bgcolor: 'rgba(5, 5, 15, 0.8)',
                color: 'white',
                fontSize: '0.95rem',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  borderWidth: '1px',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 245, 255, 0.4)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#00f5ff',
                  borderWidth: 2,
                  boxShadow: '0 0 20px rgba(0, 245, 255, 0.2)'
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.35)',
              }
            }}
          />
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || loading || aiServiceStatus === 'offline'}
            className="cyber-button"
            sx={{ 
              minWidth: 130,
              background: 'linear-gradient(135deg, #00f5ff 0%, #00a8ff 100%)',
              borderRadius: 2.5,
              px: 3,
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#000',
              boxShadow: '0 4px 25px rgba(0, 245, 255, 0.35)',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #00e0eb 0%, #0090dd 100%)',
                boxShadow: '0 8px 35px rgba(0, 245, 255, 0.5)',
              },
              '&:disabled': {
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'rgba(255, 255, 255, 0.25)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Send
          </Button>
        </Box>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', mt: 1, display: 'block', textAlign: 'center', fontSize: '0.7rem' }}>
          Press Enter to send • Shift+Enter for new line
        </Typography>
      </Paper>
    </Box>
  );
}

export default AIChatBox;
