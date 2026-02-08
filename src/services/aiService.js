import axios from 'axios';

// AI Service base URL (FastAPI backend)
const AI_BASE_URL = 'http://localhost:8001/api/ai';

/**
 * AI Service for interacting with FastAPI backend
 */
const aiService = {
  
  /**
   * Get AI response for customer query
   * @param {string} query - Customer's question
   * @param {number} ticketId - Optional ticket ID
   * @returns {Promise} AI response with confidence score
   */
  getAIResponse: async (query, ticketId = null) => {
    try {
      const response = await axios.post(`${AI_BASE_URL}/query`, {
        query: query,
        ticket_id: ticketId
      });
      return response.data;
    } catch (error) {
      console.error('Error getting AI response:', error);
      throw error;
    }
  },

  /**
   * Categorize ticket based on description
   * @param {string} description - Ticket description
   * @param {number} ticketId - Optional ticket ID
   * @returns {Promise} Category and priority
   */
  categorizeTicket: async (description, ticketId = null) => {
    try {
      const response = await axios.post(`${AI_BASE_URL}/categorize`, {
        description: description,
        ticket_id: ticketId
      });
      return response.data;
    } catch (error) {
      console.error('Error categorizing ticket:', error);
      throw error;
    }
  },

  /**
   * Health check for AI service
   * @returns {Promise} Service health status
   */
  healthCheck: async () => {
    try {
      const response = await axios.get('http://localhost:8001/health');
      return response.data;
    } catch (error) {
      console.error('AI service health check failed:', error);
      throw error;
    }
  }
};

export default aiService;
