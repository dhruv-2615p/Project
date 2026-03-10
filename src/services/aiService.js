import axios from 'axios';

// AI Service base URL (FastAPI backend)
const AI_BASE_URL = (process.env.REACT_APP_AI_URL || 'https://ai-customersupport.azurewebsites.net') + '/api/ai';
const HEALTH_URL = (process.env.REACT_APP_AI_URL || 'https://ai-customersupport.azurewebsites.net') + '/health';

/**
 * AI Service for interacting with FastAPI backend
 */
const aiService = {
  
  /**
   * Get AI response for customer query
   */
  getAIResponse: async (query, ticketId = null) => {
    try {
      const response = await axios.post(`${AI_BASE_URL}/query`, {
        query: query,
        ticket_id: ticketId
      }, { timeout: 90000 });
      return response.data;
    } catch (error) {
      console.error('Error getting AI response:', error);
      throw error;
    }
  },

  /**
   * Categorize ticket based on description
   */
  categorizeTicket: async (description, ticketId = null) => {
    try {
      const response = await axios.post(`${AI_BASE_URL}/categorize`, {
        description: description,
        ticket_id: ticketId
      }, { timeout: 60000 });
      return response.data;
    } catch (error) {
      console.error('Error categorizing ticket:', error);
      throw error;
    }
  },

  /**
   * Health check for AI service with retry
   * Backend on Azure B1 can take up to 90s to cold-start (RAG engine init)
   */
  healthCheck: async (retries = 3, delayMs = 5000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios.get(HEALTH_URL, { timeout: 1000000 });
        return response.data;
      } catch (error) {
        console.warn(`Health check attempt ${attempt}/${retries} failed:`, error.message);
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        } else {
          throw error;
        }
      }
    }
  }
};

export default aiService;
