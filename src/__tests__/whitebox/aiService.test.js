/**
 * WHITE BOX TESTS - aiService
 * Tests internal logic: base URL resolution, retry mechanism, API call structure
 */
import axios from 'axios';

jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
}));

// Set hostname to localhost for predictable base URL
delete window.location;
window.location = { hostname: 'localhost' };

let aiService;
beforeAll(() => {
  aiService = require('../../services/aiService').default;
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ==================== AI QUERY ====================

describe('WB-AI-01: getAIResponse()', () => {
  test('sends query and optional ticketId to /api/ai/query', async () => {
    const mockData = {
      response: 'Reset your password at settings.',
      confidence_score: 0.92,
      sources: ['faq.md'],
      should_escalate: false,
      success: true,
    };
    axios.post.mockResolvedValue({ data: mockData });

    const result = await aiService.getAIResponse('How to reset password?', 42);

    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:8000/api/ai/query',
      { query: 'How to reset password?', ticket_id: 42 },
      { timeout: 90000 }
    );
    expect(result).toEqual(mockData);
  });

  test('sends null ticketId when not provided', async () => {
    axios.post.mockResolvedValue({ data: { success: true } });

    await aiService.getAIResponse('test query');
    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:8000/api/ai/query',
      { query: 'test query', ticket_id: null },
      { timeout: 90000 }
    );
  });

  test('propagates errors on failure', async () => {
    axios.post.mockRejectedValue(new Error('Network Error'));
    await expect(aiService.getAIResponse('test')).rejects.toThrow('Network Error');
  });
});

// ==================== CATEGORIZE ====================

describe('WB-AI-02: categorizeTicket()', () => {
  test('sends description to /api/ai/categorize', async () => {
    const mockData = { category: 'Technical', priority: 'High', confidence: 0.88 };
    axios.post.mockResolvedValue({ data: mockData });

    const result = await aiService.categorizeTicket('My app keeps crashing', 10);

    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:8000/api/ai/categorize',
      { description: 'My app keeps crashing', ticket_id: 10 },
      { timeout: 60000 }
    );
    expect(result).toEqual(mockData);
  });
});

// ==================== HEALTH CHECK WITH RETRY ====================

describe('WB-AI-03: healthCheck() retry logic', () => {
  test('returns on first successful attempt', async () => {
    const healthData = { status: 'healthy', service: 'AI Customer Support Service' };
    axios.get.mockResolvedValue({ data: healthData });

    const result = await aiService.healthCheck(3, 10);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(result).toEqual(healthData);
  });

  test('retries on failure and succeeds on second attempt', async () => {
    axios.get
      .mockRejectedValueOnce(new Error('Connection refused'))
      .mockResolvedValueOnce({ data: { status: 'healthy' } });

    const result = await aiService.healthCheck(3, 10);
    expect(axios.get).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ status: 'healthy' });
  });

  test('throws after exhausting all retries', async () => {
    axios.get.mockRejectedValue(new Error('Service unavailable'));

    await expect(aiService.healthCheck(2, 10)).rejects.toThrow('Service unavailable');
    expect(axios.get).toHaveBeenCalledTimes(2);
  });
});
