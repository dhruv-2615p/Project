/**
 * WHITE BOX TESTS - authService
 * Tests internal logic: localStorage operations, API call structure, token handling
 */
import authService from '../../services/authService';

// Mock axios - authService uses axios.create() to get an instance
jest.mock('axios', () => {
  const mockInstance = {
    post: jest.fn(),
    get: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  return {
    create: jest.fn(() => mockInstance),
    __mockInstance: mockInstance,
  };
});

const axios = require('axios');
const mockApi = axios.__mockInstance;

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

// ==================== TOKEN MANAGEMENT ====================

describe('WB-AUTH-01: getToken()', () => {
  test('returns null when no token stored', () => {
    const token = authService.getToken();
    expect(token).toBeNull();
  });

  test('returns stored token', () => {
    localStorage.setItem('auth_token', 'test-jwt-token');
    const token = authService.getToken();
    expect(token).toBe('test-jwt-token');
  });
});

// ==================== USER DATA MANAGEMENT ====================

describe('WB-AUTH-02: getUser()', () => {
  test('returns null when no user stored', () => {
    const user = authService.getUser();
    expect(user).toBeNull();
  });

  test('parses and returns stored user JSON', () => {
    const userData = { fullName: 'John Doe', email: 'john@test.com' };
    localStorage.setItem('auth_user', JSON.stringify(userData));
    const user = authService.getUser();
    expect(user).toEqual(userData);
  });
});

// ==================== SAVE AUTH ====================

describe('WB-AUTH-03: saveAuth()', () => {
  test('stores token and user in localStorage', () => {
    const authData = {
      token: 'jwt-token-123',
      fullName: 'Jane Doe',
      email: 'jane@test.com',
    };
    authService.saveAuth(authData);
    expect(localStorage.getItem('auth_token')).toBe('jwt-token-123');
    expect(JSON.parse(localStorage.getItem('auth_user'))).toEqual({
      fullName: 'Jane Doe',
      email: 'jane@test.com',
    });
  });
});

// ==================== LOGOUT ====================

describe('WB-AUTH-04: logout()', () => {
  test('removes token and user from localStorage', () => {
    localStorage.setItem('auth_token', 'some-token');
    localStorage.setItem('auth_user', '{"fullName":"Test"}');
    authService.logout();
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });
});

// ==================== API CALLS ====================

describe('WB-AUTH-05: register()', () => {
  test('calls POST /api/auth/register with correct payload', async () => {
    const mockResponse = { data: { fullName: 'Test', email: 'test@test.com', token: null } };
    mockApi.post.mockResolvedValue(mockResponse);

    const result = await authService.register('Test', 'test@test.com', 'Password1!');
    expect(mockApi.post).toHaveBeenCalledWith('/api/auth/register', {
      fullName: 'Test',
      email: 'test@test.com',
      password: 'Password1!',
    });
    expect(result).toEqual(mockResponse.data);
  });
});

describe('WB-AUTH-06: login()', () => {
  test('calls POST /api/auth/login with email and password', async () => {
    const mockResponse = { data: { token: 'jwt-123', fullName: 'Test', email: 'test@test.com' } };
    mockApi.post.mockResolvedValue(mockResponse);

    const result = await authService.login('test@test.com', 'Password1!');
    expect(mockApi.post).toHaveBeenCalledWith('/api/auth/login', {
      email: 'test@test.com',
      password: 'Password1!',
    });
    expect(result).toEqual(mockResponse.data);
  });
});

describe('WB-AUTH-07: sendOtp()', () => {
  test('calls POST /api/auth/send-otp with email', async () => {
    const mockResponse = { data: { message: 'OTP sent' } };
    mockApi.post.mockResolvedValue(mockResponse);

    const result = await authService.sendOtp('test@test.com');
    expect(mockApi.post).toHaveBeenCalledWith('/api/auth/send-otp', { email: 'test@test.com' });
    expect(result).toEqual(mockResponse.data);
  });
});

describe('WB-AUTH-08: verifyOtp()', () => {
  test('calls POST /api/auth/verify-otp with email and otp', async () => {
    const mockResponse = { data: { message: 'Verified' } };
    mockApi.post.mockResolvedValue(mockResponse);

    const result = await authService.verifyOtp('test@test.com', '123456');
    expect(mockApi.post).toHaveBeenCalledWith('/api/auth/verify-otp', {
      email: 'test@test.com',
      otp: '123456',
    });
    expect(result).toEqual(mockResponse.data);
  });
});

describe('WB-AUTH-09: validate()', () => {
  test('calls GET /api/auth/validate with Bearer token header', async () => {
    const mockResponse = { data: { fullName: 'Test', email: 'test@test.com' } };
    mockApi.get.mockResolvedValue(mockResponse);

    const result = await authService.validate('jwt-token-abc');
    expect(mockApi.get).toHaveBeenCalledWith('/api/auth/validate', {
      headers: { Authorization: 'Bearer jwt-token-abc' },
    });
    expect(result).toEqual(mockResponse.data);
  });
});
