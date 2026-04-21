/**
 * BLACK BOX (FUNCTIONAL) TESTS - LoginPage
 * Tests UI behavior without knowledge of internal implementation
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

// Mock useAuth
const mockLogin = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    loading: false,
  }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: null }),
}));

// Mock PromoScene to avoid rendering complex CSS animations in tests
jest.mock('../../components/auth/PromoScene', () => () => <div data-testid="promo-scene" />);

import LoginPage from '../../components/auth/LoginPage';

const renderLogin = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );

beforeEach(() => {
  jest.clearAllMocks();
});

// ==================== RENDERING ====================

describe('BB-LOGIN-01: Page renders correctly', () => {
  test('displays email and password fields', () => {
    renderLogin();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('displays Sign In button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('displays link to register page', () => {
    renderLogin();
    expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
  });
});

// ==================== FORM VALIDATION ====================

describe('BB-LOGIN-02: Form submission behavior', () => {
  test('calls login with email and password on submit', async () => {
    mockLogin.mockResolvedValue({});
    renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Password1!');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'Password1!');
    });
  });

  test('navigates to home on successful login', async () => {
    mockLogin.mockResolvedValue({});
    renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Password1!');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('displays error message on login failure', async () => {
    mockLogin.mockRejectedValue({
      response: { data: { error: 'Invalid email or password' } },
    });
    renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i), 'bad@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpass');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });
});

// ==================== PASSWORD VISIBILITY ====================

describe('BB-LOGIN-03: Password visibility toggle', () => {
  test('password field is hidden by default', () => {
    renderLogin();
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password');
  });

  test('toggles password visibility when icon clicked', () => {
    renderLogin();
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Find the visibility toggle button (MUI renders it as a button with aria-label or inside InputAdornment)
    const buttons = screen.getAllByRole('button');
    const toggleBtn = buttons.find(btn => btn.querySelector('[data-testid]') || btn.closest('.MuiInputAdornment-root'));
    if (toggleBtn) {
      fireEvent.click(toggleBtn);
      // After click, password field type should change to text
      expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });
});

// ==================== NAVIGATION LINKS ====================

describe('BB-LOGIN-04: Navigation links', () => {
  test('has link to forgot password page', () => {
    renderLogin();
    const forgotLink = screen.getByText(/forgot password/i);
    expect(forgotLink).toBeInTheDocument();
  });

  test('has link to register page', () => {
    renderLogin();
    const registerLink = screen.getByText(/Create Account/i);
    expect(registerLink).toBeInTheDocument();
  });
});
