import axios from 'axios';
import authService from './authService';

// Use relative URL in production, localhost for development
const AUTH_BASE_URL = process.env.REACT_APP_AUTH_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8081' : '');

const ticketApi = axios.create({
  baseURL: AUTH_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to all requests
ticketApi.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const ticketService = {
  // Create a new ticket
  createTicket: async (ticketData) => {
    const response = await ticketApi.post('/api/tickets', ticketData);
    return response.data;
  },

  // Get all tickets for current user
  getUserTickets: async () => {
    const response = await ticketApi.get('/api/tickets');
    return response.data;
  },

  // Get a specific ticket by ID
  getTicketById: async (ticketId) => {
    const response = await ticketApi.get(`/api/tickets/${ticketId}`);
    return response.data;
  },

  // Update ticket status
  updateTicketStatus: async (ticketId, status) => {
    const response = await ticketApi.put(`/api/tickets/${ticketId}/status`, { status });
    return response.data;
  },

  // Add AI response to ticket
  addAiResponse: async (ticketId, aiResponse) => {
    const response = await ticketApi.put(`/api/tickets/${ticketId}/ai-response`, { aiResponse });
    return response.data;
  },

  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await ticketApi.get('/api/tickets/dashboard');
    return response.data;
  },

  // Agent-specific methods
  getAgentTickets: async () => {
    const response = await ticketApi.get('/api/agent/tickets');
    return response.data;
  },

  sendAgentResponse: async (ticketId, responseText) => {
    const response = await ticketApi.post(`/api/agent/tickets/${ticketId}/respond`, { response: responseText });
    return response.data;
  },

  assignTicketToAgent: async (ticketId) => {
    const response = await ticketApi.post(`/api/agent/tickets/${ticketId}/assign`);
    return response.data;
  },

  updateAgentTicketStatus: async (ticketId, status) => {
    const response = await ticketApi.put(`/api/agent/tickets/${ticketId}/status`, { status });
    return response.data;
  },
};

export default ticketService;
