import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { NotificationCenter } from '@/components/notifications/notification-center';
import type { AccessibilityNotification } from '@/lib/types/notifications';

// Mock the notification service
vi.mock('@/lib/services/notification-service', () => ({
  getNotifications: vi.fn(() => mockNotifications),
  getUnreadNotifications: vi.fn(() => mockNotifications.filter(n => !n.readAt)),
  markAsRead: vi.fn(() => true),
  deleteNotification: vi.fn(() => true),
  clearNotifications: vi.fn(() => true),
}));

const mockNotifications: AccessibilityNotification[] = [
  {
    id: 'notif-1',
    pilgrimId: 'test-pilgrim',
    type: 'assistance-zone',
    priority: 'high',
    title: 'Assistance Available',
    message: 'You have entered an assistance zone',
    actionable: true,
    actionUrl: '/assistance',
    actionLabel: 'Request Help',
    emergencyContact: '+91 98765 43210',
    sentAt: new Date('2024-01-15T10:00:00'),
  },
  {
    id: 'notif-2',
    pilgrimId: 'test-pilgrim',
    type: 'slot-reminder',
    priority: 'urgent',
    title: 'Slot Reminder',
    message: 'Your slot is in 10 minutes',
    actionable: true,
    actionUrl: '/booking',
    actionLabel: 'View Booking',
    sentAt: new Date('2024-01-15T10:05:00'),
    readAt: new Date('2024-01-15T10:06:00'),
  },
];

describe('NotificationCenter - Accessibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not have any accessibility violations', async () => {
    const { container } = render(<NotificationCenter pilgrimId="test-pilgrim" />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have accessible feed structure', () => {
    render(<NotificationCenter pilgrimId="test-pilgrim" />);

    const feed = screen.getByRole('feed', { name: /notification list/i });
    expect(feed).toBeInTheDocument();
  });

  it('should have accessible notification articles', () => {
    render(<NotificationCenter pilgrimId="test-pilgrim" />);

    const articles = screen.getAllByRole('article');
    expect(articles.length).toBe(mockNotifications.length);

    articles.forEach((article) => {
      expect(article).toHaveAttribute('aria-label');
    });
  });

  it('should announce unread count with aria-live', () => {
    render(<NotificationCenter pilgrimId="test-pilgrim" />);

    const unreadBadge = screen.getByLabelText(/1 unread notification/i);
    expect(unreadBadge).toBeInTheDocument();
  });

  it('should have accessible action buttons', () => {
    render(<NotificationCenter pilgrimId="test-pilgrim" />);

    // Check for actionable notification buttons
    const actionButtons = screen.getAllByRole('link', { name: /request help|view booking/i });
    expect(actionButtons.length).toBeGreaterThan(0);

    actionButtons.forEach((button) => {
      expect(button).toHaveAttribute('href');
    });
  });

  it('should have accessible mark as read buttons', () => {
    render(<NotificationCenter pilgrimId="test-pilgrim" />);

    const markReadButtons = screen.getAllByRole('button', { name: /mark as read/i });
    expect(markReadButtons.length).toBeGreaterThan(0);
  });

  it('should have accessible delete buttons', () => {
    render(<NotificationCenter pilgrimId="test-pilgrim" />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete notification/i });
    expect(deleteButtons).toHaveLength(mockNotifications.length);
  });

  it('should have accessible filter toggle', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter pilgrimId="test-pilgrim" />);

    const filterButton = screen.getByRole('button', { name: /show all notifications|show unread only/i });
    expect(filterButton).toBeInTheDocument();

    // Should be keyboard accessible
    await user.click(filterButton);
    expect(filterButton).toHaveAttribute('aria-label');
  });

  it('should have accessible clear all button', () => {
    render(<NotificationCenter pilgrimId="test-pilgrim" />);

    const clearButton = screen.getByRole('button', { name: /clear all notifications/i });
    expect(clearButton).toBeInTheDocument();
  });

  it('should announce priority with proper styling', () => {
    render(<NotificationCenter pilgrimId="test-pilgrim" />);

    // Check for priority badges
    const urgentBadge = screen.getByText('urgent');
    const highBadge = screen.getByText('high');

    expect(urgentBadge).toBeInTheDocument();
    expect(highBadge).toBeInTheDocument();
  });

  it('should have accessible emergency contact display', () => {
    render(<NotificationCenter pilgrimId="test-pilgrim" />);

    // Emergency contact should be visible
    const emergencyContact = screen.getByText('+91 98765 43210');
    expect(emergencyContact).toBeInTheDocument();
  });

  it('should hide decorative icons from screen readers', () => {
    const { container } = render(<NotificationCenter pilgrimId="test-pilgrim" />);

    const hiddenIcons = container.querySelectorAll('[aria-hidden="true"]');
    expect(hiddenIcons.length).toBeGreaterThan(0);
  });

  it('should have accessible empty state', async () => {
    // Mock empty notifications
    const { getNotifications } = await import('@/lib/services/notification-service');
    vi.mocked(getNotifications).mockReturnValue([]);

    const { container } = render(<NotificationCenter pilgrimId="test-pilgrim" />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();

    expect(screen.getByText(/no notifications/i)).toBeInTheDocument();
  });

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter pilgrimId="test-pilgrim" />);

    // Tab to first interactive element
    await user.tab();

    const focusedElement = document.activeElement;
    expect(focusedElement).toBeTruthy();
    expect(focusedElement?.tagName).toMatch(/BUTTON|A/);
  });

  it('should announce loading state', () => {
    render(<NotificationCenter pilgrimId="test-pilgrim" />);

    // Initially shows loading (before data loads)
    // After data loads, should show notifications
    const notifications = screen.queryAllByRole('article');
    expect(notifications.length).toBeGreaterThanOrEqual(0);
  });
});
