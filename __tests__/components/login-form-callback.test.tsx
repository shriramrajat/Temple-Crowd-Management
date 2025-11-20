/**
 * Component Test: Login Form Callback URL Handling
 * 
 * Tests that the login form properly extracts and uses callbackUrl from URL parameters
 * and passes it to NextAuth signIn function.
 * 
 * Requirements: 1.2, 1.4
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '@/components/auth/login-form';
import { useSearchParams, useRouter } from 'next/navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  useRouter: vi.fn(),
}));

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
  getSession: vi.fn(),
}));

// Mock toast helpers
vi.mock('@/lib/utils/toast-helpers', () => ({
  showErrorToast: vi.fn(),
  showSuccessToast: vi.fn(),
}));

describe('Login Form Callback URL Handling', () => {
  const mockPush = vi.fn();
  const mockRefresh = vi.fn();
  const mockRouter = {
    push: mockPush,
    refresh: mockRefresh,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue(mockRouter as any);
  });

  it('should extract callbackUrl from URL search params', async () => {
    // Mock search params with callbackUrl
    const mockSearchParams = new URLSearchParams('callbackUrl=/profile');
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

    // Mock successful sign in
    const { signIn } = await import('next-auth/react');
    vi.mocked(signIn).mockResolvedValue({ ok: true, error: null } as any);

    const { getSession } = await import('next-auth/react');
    vi.mocked(getSession).mockResolvedValue({} as any);

    // Render login form
    render(<LoginForm showUserTypeToggle={false} />);

    // Fill in form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Wait for form submission
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/profile');
    });
  });

  it('should use default redirect when no callbackUrl is provided', async () => {
    // Mock search params without callbackUrl
    const mockSearchParams = new URLSearchParams('');
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

    // Mock successful sign in
    const { signIn } = await import('next-auth/react');
    vi.mocked(signIn).mockResolvedValue({ ok: true, error: null } as any);

    const { getSession } = await import('next-auth/react');
    vi.mocked(getSession).mockResolvedValue({} as any);

    // Render login form
    render(<LoginForm showUserTypeToggle={false} />);

    // Fill in form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Wait for form submission - should redirect to default darshan page for pilgrim
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/darshan');
    });
  });

  it('should prioritize redirectPath prop over callbackUrl param', async () => {
    // Mock search params with callbackUrl
    const mockSearchParams = new URLSearchParams('callbackUrl=/profile');
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

    // Mock successful sign in
    const { signIn } = await import('next-auth/react');
    vi.mocked(signIn).mockResolvedValue({ ok: true, error: null } as any);

    const { getSession } = await import('next-auth/react');
    vi.mocked(getSession).mockResolvedValue({} as any);

    // Render login form with redirectPath prop
    render(<LoginForm showUserTypeToggle={false} redirectPath="/custom-redirect" />);

    // Fill in form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Wait for form submission - should use redirectPath prop
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/custom-redirect');
    });
  });

  it('should handle redirect query param as fallback', async () => {
    // Mock search params with redirect param (alternative to callbackUrl)
    const mockSearchParams = new URLSearchParams('redirect=/darshan/my-bookings');
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

    // Mock successful sign in
    const { signIn } = await import('next-auth/react');
    vi.mocked(signIn).mockResolvedValue({ ok: true, error: null } as any);

    const { getSession } = await import('next-auth/react');
    vi.mocked(getSession).mockResolvedValue({} as any);

    // Render login form
    render(<LoginForm showUserTypeToggle={false} />);

    // Fill in form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Wait for form submission
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/darshan/my-bookings');
    });
  });

  it('should redirect to admin default when user type is admin and no callbackUrl', async () => {
    // Mock search params without callbackUrl
    const mockSearchParams = new URLSearchParams('');
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

    // Mock successful sign in
    const { signIn } = await import('next-auth/react');
    vi.mocked(signIn).mockResolvedValue({ ok: true, error: null } as any);

    const { getSession } = await import('next-auth/react');
    vi.mocked(getSession).mockResolvedValue({} as any);

    // Render login form with admin user type
    render(<LoginForm defaultUserType="admin" showUserTypeToggle={true} />);

    // Switch to admin tab
    const adminTab = screen.getByRole('tab', { name: /admin login/i });
    fireEvent.click(adminTab);

    // Fill in form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(submitButton);

    // Wait for form submission - should redirect to admin default
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin');
    });
  });

  it('should preserve callbackUrl with query parameters', async () => {
    // Mock search params with callbackUrl containing query params
    // Note: URLSearchParams will parse the query string, so we need to encode the callbackUrl value
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('callbackUrl', '/darshan/my-bookings?status=confirmed&page=2');
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

    // Mock successful sign in
    const { signIn } = await import('next-auth/react');
    vi.mocked(signIn).mockResolvedValue({ ok: true, error: null } as any);

    const { getSession } = await import('next-auth/react');
    vi.mocked(getSession).mockResolvedValue({} as any);

    // Render login form
    render(<LoginForm showUserTypeToggle={false} />);

    // Fill in form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Wait for form submission - should preserve full URL with query params
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/darshan/my-bookings?status=confirmed&page=2');
    });
  });
});
