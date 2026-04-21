/**
 * BLACK BOX (FUNCTIONAL) TESTS - RegisterPage
 * Tests registration form behavior, validation rules, and error handling
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

const mockRegister = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    register: mockRegister,
    user: null,
    loading: false,
  }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../components/auth/PromoScene', () => () => <div data-testid="promo-scene" />);

import RegisterPage from '../../components/auth/RegisterPage';

const renderRegister = () =>
  render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  );

beforeEach(() => {
  jest.clearAllMocks();
});

// ==================== RENDERING ====================

describe('BB-REG-01: Page renders correctly', () => {
  test('displays full name, email, and password fields', () => {
    renderRegister();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('displays Create Account button', () => {
    renderRegister();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  test('displays link to login page', () => {
    renderRegister();
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });
});

// ==================== PASSWORD RULES DISPLAY ====================

describe('BB-REG-02: Password validation rules shown', () => {
  test('shows password rules when user types a password', async () => {
    renderRegister();
    const pwField = screen.getByLabelText(/password/i);

    await userEvent.type(pwField, 'a');

    expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/one uppercase letter/i)).toBeInTheDocument();
    expect(screen.getByText(/one lowercase letter/i)).toBeInTheDocument();
    expect(screen.getByText(/one digit or special character/i)).toBeInTheDocument();
  });
});

// ==================== FORM SUBMISSION ====================

describe('BB-REG-03: Successful registration', () => {
  test('calls register and navigates to verify-email on success', async () => {
    mockRegister.mockResolvedValue({ message: 'Registered' });
    renderRegister();

    await userEvent.type(screen.getByLabelText(/full name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'john@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Abcdef1!');
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('John Doe', 'john@test.com', 'Abcdef1!');
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/verify-email', expect.anything());
    });
  });
});

describe('BB-REG-04: Registration error handling', () => {
  test('shows error when password rules not met', async () => {
    renderRegister();

    await userEvent.type(screen.getByLabelText(/full name/i), 'John');
    await userEvent.type(screen.getByLabelText(/email/i), 'john@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'weak');
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/password requirements/i)).toBeInTheDocument();
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  test('shows server error on registration failure', async () => {
    mockRegister.mockRejectedValue({
      response: { data: { error: 'Email already registered' } },
    });
    renderRegister();

    await userEvent.type(screen.getByLabelText(/full name/i), 'John');
    await userEvent.type(screen.getByLabelText(/email/i), 'existing@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Abcdef1!');
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/email already registered/i)).toBeInTheDocument();
    });
  });
});
