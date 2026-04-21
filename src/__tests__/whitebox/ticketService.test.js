/**
 * WHITE BOX TESTS - ticketService
 * Tests internal logic: auth interceptor, API call structure, token injection
 */

// Capture interceptor function
let requestInterceptor = null;
let mockInstance = null;

jest.mock('../../services/authService', () => ({
  __esModule: true,
  default: { getToken: jest.fn(() => 'mock-jwt-token') },
}));

jest.mock('axios', () => {
  const instance = {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn((fn) => { requestInterceptor = fn; }),
      },
      response: { use: jest.fn() },
    },
  };
  mockInstance = instance;
  return {
    create: jest.fn(() => instance),
  };
});

// Must import AFTER mocks are set up
const ticketService = require('../../services/ticketService').default;
const authService = require('../../services/authService').default;

beforeEach(() => {
  mockInstance.post.mockReset();
  mockInstance.get.mockReset();
  mockInstance.put.mockReset();
  authService.getToken.mockReturnValue('mock-jwt-token');
});

// ==================== INTERCEPTOR ====================

describe('WB-TICKET-01: Auth interceptor injects Bearer token', () => {
  test('adds Authorization header to outgoing requests', () => {
    expect(requestInterceptor).toBeDefined();
    const config = { headers: {} };
    const result = requestInterceptor(config);
    expect(result.headers.Authorization).toBe('Bearer mock-jwt-token');
  });

  test('passes config through even if no token', () => {
    authService.getToken.mockReturnValue(null);
    const config = { headers: {} };
    const result = requestInterceptor(config);
    expect(result.headers.Authorization).toBeUndefined();
  });
});

// ==================== API CALLS ====================

describe('WB-TICKET-02: createTicket()', () => {
  test('calls POST /api/tickets with ticket data', async () => {
    const ticketData = { category: 'Technical', priority: 'High', subject: 'Bug', description: 'App crashes' };
    mockInstance.post.mockResolvedValue({ data: { id: 1, ...ticketData, status: 'open' } });

    const result = await ticketService.createTicket(ticketData);
    expect(mockInstance.post).toHaveBeenCalledWith('/api/tickets', ticketData);
  });
});

describe('WB-TICKET-03: getUserTickets()', () => {
  test('calls GET /api/tickets', async () => {
    mockInstance.get.mockResolvedValue({ data: [{ id: 1, subject: 'Test' }] });

    const result = await ticketService.getUserTickets();
    expect(mockInstance.get).toHaveBeenCalledWith('/api/tickets');
  });
});

describe('WB-TICKET-04: getTicketById()', () => {
  test('calls GET /api/tickets/:id with correct ID', async () => {
    mockInstance.get.mockResolvedValue({ data: { id: 5, subject: 'Test' } });

    const result = await ticketService.getTicketById(5);
    expect(mockInstance.get).toHaveBeenCalledWith('/api/tickets/5');
  });
});

describe('WB-TICKET-05: updateTicketStatus()', () => {
  test('calls PUT /api/tickets/:id/status with status payload', async () => {
    mockInstance.put.mockResolvedValue({ data: { id: 1, status: 'closed' } });

    const result = await ticketService.updateTicketStatus(1, 'closed');
    expect(mockInstance.put).toHaveBeenCalledWith('/api/tickets/1/status', { status: 'closed' });
  });
});

describe('WB-TICKET-06: getDashboardStats()', () => {
  test('calls GET /api/tickets/dashboard', async () => {
    mockInstance.get.mockResolvedValue({
      data: { totalTickets: 10, openTickets: 3, resolvedTickets: 7 },
    });

    const result = await ticketService.getDashboardStats();
    expect(mockInstance.get).toHaveBeenCalledWith('/api/tickets/dashboard');
  });
});
