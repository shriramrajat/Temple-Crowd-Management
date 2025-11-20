/**
 * Integration Test: Navigation Component Authentication States (Desktop Only)
 * 
 * Tests that the navigation component properly displays different UI based on authentication state:
 * - Unauthenticated state shows only Logo, SOS, Login, Register
 * - Authenticated state shows full navigation menu
 * - Admin user sees Admin link
 * 
 * Note: Tests focus on desktop navigation only to avoid duplicate element issues
 * 
 * Requirements: 2.1, 2.2, 3.1, 3.2, 3.3
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Navigation } from '@/components/auth/navigation';
import { useSession } from 'next-auth/react';

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock UserNav component
vi.mock('@/components/auth/user-nav', () => ({
  UserNav: () => <div data-testid="user-nav">UserNav</div>,
}));

describe('Navigation Component Authentication States', () => {
  // Helper to get desktop navigation container
  const getDesktopNav = () => {
    const nav = screen.getByRole('navigation');
    // Desktop nav has class "hidden md:flex"
    return within(nav).getAllByRole('generic').find(el => 
      el.className.includes('hidden') && el.className.includes('md:flex')
    )!;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Unauthenticated State', () => {
    beforeEach(() => {
      // Mock unauthenticated session
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn(),
      });
    });

    it('should display Logo when unauthenticated', () => {
      render(<Navigation />);
      
      const logo = screen.getByText(/ShraddhaSecure/i);
      expect(logo).toBeInTheDocument();
    });

    it('should display SOS link when unauthenticated', () => {
      render(<Navigation />);
      
      const desktopNav = getDesktopNav();
      const sosLink = within(desktopNav).getByText('SOS');
      expect(sosLink).toBeInTheDocument();
      expect(sosLink.closest('a')).toHaveAttribute('href', '/sos');
    });

    it('should display UserNav component when unauthenticated', () => {
      render(<Navigation />);
      
      const desktopNav = getDesktopNav();
      const userNav = within(desktopNav).getByTestId('user-nav');
      expect(userNav).toBeInTheDocument();
    });

    it('should NOT display Home link when unauthenticated', () => {
      render(<Navigation />);
      
      const desktopNav = getDesktopNav();
      // Look for Home link in desktop nav
      const homeLink = within(desktopNav).queryByText('Home');
      expect(homeLink).not.toBeInTheDocument();
    });

    it('should NOT display Profile link when unauthenticated', () => {
      render(<Navigation />);
      
      const desktopNav = getDesktopNav();
      const profileLink = within(desktopNav).queryByText('Profile');
      expect(profileLink).not.toBeInTheDocument();
    });

    it('should NOT display Live link when unauthenticated', () => {
      render(<Navigation />);
      
      const desktopNav = getDesktopNav();
      const liveLink = within(desktopNav).queryByText('Live');
      expect(liveLink).not.toBeInTheDocument();
    });

    it('should NOT display Book Darshan link when unauthenticated', () => {
      render(<Navigation />);
      
      const desktopNav = getDesktopNav();
      const bookDarshanLink = within(desktopNav).queryByText('Book Darshan');
      expect(bookDarshanLink).not.toBeInTheDocument();
    });

    it('should NOT display Routes link when unauthenticated', () => {
      render(<Navigation />);
      
      const desktopNav = getDesktopNav();
      const routesLink = within(desktopNav).queryByText('Routes');
      expect(routesLink).not.toBeInTheDocument();
    });

    it('should NOT display Forecast link when unauthenticated', () => {
      render(<Navigation />);
      
      const desktopNav = getDesktopNav();
      const forecastLink = within(desktopNav).queryByText('Forecast');
      expect(forecastLink).not.toBeInTheDocument();
    });

    it('should NOT display Admin link when unauthenticated', () => {
      render(<Navigation />);
      
      const desktopNav = getDesktopNav();
      const adminLink = within(desktopNav).queryByText('Admin');
      expect(adminLink).not.toBeInTheDocument();
    });

    it('should only show Logo, SOS, and UserNav when unauthenticated', () => {
      render(<Navigation />);
      
      const desktopNav = getDesktopNav();
      // Verify only expected elements are present
      expect(screen.getByText(/ShraddhaSecure/i)).toBeInTheDocument();
      expect(within(desktopNav).getByText('SOS')).toBeInTheDocument();
      expect(within(desktopNav).getByTestId('user-nav')).toBeInTheDocument();
      
      // Verify feature links are not present
      expect(within(desktopNav).queryByText('Profile')).not.toBeInTheDocument();
      expect(within(desktopNav).queryByText('Live')).not.toBeInTheDocument();
      expect(within(desktopNav).queryByText('Routes')).not.toBeInTheDocument();
      expect(within(desktopNav).queryByText('Forecast')).not.toBeInTheDocument();
    });
  });

  describe('Authenticated State - Pilgrim User', () => {
    beforeEach(() => {
      // Mock authenticated pilgrim session
      vi.mocked(useSession).mockReturnValue({
        data: {
          user: {
            id: 'test-user-1',
            email: 'pilgrim@example.com',
            name: 'Test Pilgrim',
            userType: 'pilgrim',
            role: 'user',
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        status: 'authenticated',
        update: vi.fn(),
      });
    });

    it('should display Logo when authenticated', () => {
      render(<Navigation />);
      
      const logo = screen.getByText(/ShraddhaSecure/i);
      expect(logo).toBeInTheDocument();
    });

    it('should display Home link when authenticated', () => {
      render(<Navigation />);
      
      const desktopNav = getDesktopNav();
      const homeLink = within(desktopNav).getByText('Home');
      expect(homeLink).toBeInTheDocument();
      expect(homeLink.closest('a')).toHaveAttribute('href', '/');
    });

    it('should display Profile link when authenticated', () => {
      render(<Navigation />);
      
      const desktopNav = getDesktopNav();
      const profileLink = within(desktopNav).getByText('Profile');
      expect(profileLink).toBeInTheDocument();
      expect(profileLink.closest('a')).toHaveAttribute('href', '/profile');
    });

    it('should display Live link when authenticated', () => {
      render(<Navigation />);
      
      const desktopNav = getDesktopNav();
      const liveLink = within(desktopNav).getByText('Live');
      expect(liveLink).toBeInTheDocument();
      expect(liveLink.closest('a')).toHaveAttribute('href', '/heatmap');
    });

    it('should display SOS link when authenticated', () => {
      render(<Navigation />);
      
      const desktopNav = getDesktopNav();
      const sosLink = within(desktopNav).getByText('SOS');
      expect(sosLink).toBeInTheDocument();
      expect(sosLink.closest('a')).toHaveAttribute('href', '/sos');
    });

    it('should display Book Darshan link when authenticated', () => {
      render(<Navigation />);
      
      const desktopNav = getDesktopNav();
      const bookLink = within(desktopNav).getByText('Book Darshan');
      expect(bookLink).toBeInTheDocument();
      expect(bookLink.closest('a')).toHaveAttribute('href', '/darshan');
    });

    it('should display Routes link when authenticated', () => {
      render(<Navigation />);
      
      const desktopNav = getDesktopNav();
      const routesLink = within(desktopNav).getByText('Routes');
      expect(routesLink).toBeInTheDocument();
      expect(routesLink.closest('a')).toHaveAttribute('href', '/routes');
    });

    it('should display Forecast link when authenticated', () => {
      render(<Navigation />);
      
      const desktopNav = getDesktopNav();
      const forecastLink = within(desktopNav).getByText('Forecast');
      expect(forecastLink).toBeInTheDocument();
      expect(forecastLink.closest('a')).toHaveAttribute('href', '/forecast');
    });

    it('should display UserNav component when authenticated', () => {
      render(<Navigation />);
      
      const desktopNav = getDesktopNav();
      const userNav = within(desktopNav).getByTestId('user-nav');
      expect(userNav).toBeInTheDocument();
    });

    it('should NOT display Admin link for non-admin user', () => {
      render(<Navigation />);
      
      const adminLink = screen.queryByText('Admin');
      expect(adminLink).not.toBeInTheDocument();
    });

    it('should display all feature navigation links for authenticated user', () => {
      render(<Navigation />);
      
      const desktopNav = getDesktopNav();
      // Verify all expected links are present (desktop navigation only)
      expect(within(desktopNav).getByText('Home')).toBeInTheDocument();
      expect(within(desktopNav).getByText('Profile')).toBeInTheDocument();
      expect(within(desktopNav).getByText('Live')).toBeInTheDocument();
      expect(within(desktopNav).getByText('SOS')).toBeInTheDocument();
      expect(within(desktopNav).getByText('Routes')).toBeInTheDocument();
      expect(within(desktopNav).getByText('Forecast')).toBeInTheDocument();
    });
  });

  describe('Authenticated State - Admin User', () => {
    beforeEach(() => {
      // Mock authenticated admin session
      vi.mocked(useSession).mockReturnValue({
        data: {
          user: {
            id: 'admin-1',
            email: 'admin@example.com',
            name: 'Admin User',
            userType: 'admin',
            role: 'admin',
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        status: 'authenticated',
        update: vi.fn(),
      });
    });

    it('should display Admin link for admin user', () => {
      render(<Navigation />);
      
      const desktopNav = getDesktopNav();
      const adminLink = within(desktopNav).getByText('Admin');
      expect(adminLink).toBeInTheDocument();
      expect(adminLink.closest('a')).toHaveAttribute('href', '/admin');
    });

    it('should display all feature links including Admin for admin user', () => {
      render(<Navigation />);
      
      const desktopNav = getDesktopNav();
      // Verify all expected links including Admin are present (desktop navigation only)
      expect(within(desktopNav).getByText('Home')).toBeInTheDocument();
      expect(within(desktopNav).getByText('Profile')).toBeInTheDocument();
      expect(within(desktopNav).getByText('Live')).toBeInTheDocument();
      expect(within(desktopNav).getByText('SOS')).toBeInTheDocument();
      expect(within(desktopNav).getByText('Routes')).toBeInTheDocument();
      expect(within(desktopNav).getByText('Forecast')).toBeInTheDocument();
      expect(within(desktopNav).getByText('Admin')).toBeInTheDocument();
    });

    it('should display UserNav component for admin user', () => {
      render(<Navigation />);
      
      const desktopNav = getDesktopNav();
      const userNav = within(desktopNav).getByTestId('user-nav');
      expect(userNav).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    beforeEach(() => {
      // Mock loading session
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'loading',
        update: vi.fn(),
      });
    });

    it('should treat loading state as unauthenticated', () => {
      render(<Navigation />);
      
      const desktopNav = getDesktopNav();
      // Should show unauthenticated UI (desktop navigation only)
      expect(screen.getByText(/ShraddhaSecure/i)).toBeInTheDocument();
      expect(within(desktopNav).getByText('SOS')).toBeInTheDocument();
      expect(within(desktopNav).getByTestId('user-nav')).toBeInTheDocument();
      
      // Should not show authenticated links
      expect(within(desktopNav).queryByText('Profile')).not.toBeInTheDocument();
      expect(within(desktopNav).queryByText('Live')).not.toBeInTheDocument();
    });
  });
});
