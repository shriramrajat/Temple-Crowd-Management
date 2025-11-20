import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { SlotConfirmation } from '@/components/booking/slot-confirmation';
import type { SlotAllocation } from '@/lib/types/priority-slots';
import type { AccessibilityProfile } from '@/lib/types/accessibility';

describe('SlotConfirmation - Accessibility Tests', () => {
  const mockProfile: AccessibilityProfile = {
    pilgrimId: 'test-pilgrim',
    categories: ['elderly', 'wheelchair-user'],
    mobilitySpeed: 'slow',
    requiresAssistance: true,
    emergencyContact: {
      name: 'John Doe',
      phone: '+91 98765 43210',
      relationship: 'Son',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAllocation: SlotAllocation = {
    allocationId: 'alloc-123',
    pilgrimId: 'test-pilgrim',
    slotId: 'slot-1',
    accessibilityProfile: mockProfile,
    bookingTime: new Date('2024-01-15T09:00:00'),
    status: 'confirmed',
    qrCode: 'QR123456',
    estimatedWaitTime: 15,
  };

  const mockSlotTime = new Date('2024-01-15T10:00:00');
  const mockLocation = 'Main Temple';
  const mockOnClose = vi.fn();

  it('should not have any accessibility violations', async () => {
    const { container } = render(
      <SlotConfirmation
        allocation={mockAllocation}
        slotTime={mockSlotTime}
        slotLocation={mockLocation}
        open={true}
        onClose={mockOnClose}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have accessible dialog structure', () => {
    render(
      <SlotConfirmation
        allocation={mockAllocation}
        slotTime={mockSlotTime}
        slotLocation={mockLocation}
        open={true}
        onClose={mockOnClose}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-labelledby', 'confirmation-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'confirmation-description');
  });

  it('should have accessible dialog title and description', () => {
    render(
      <SlotConfirmation
        allocation={mockAllocation}
        slotTime={mockSlotTime}
        slotLocation={mockLocation}
        open={true}
        onClose={mockOnClose}
      />
    );

    const title = screen.getByRole('heading', { name: /booking confirmed/i });
    expect(title).toBeInTheDocument();
    expect(title).toHaveAttribute('id', 'confirmation-title');

    const description = screen.getByText(/your priority darshan slot has been successfully reserved/i);
    expect(description).toBeInTheDocument();
    expect(description).toHaveAttribute('id', 'confirmation-description');
  });

  it('should have accessible QR code with proper labeling', () => {
    render(
      <SlotConfirmation
        allocation={mockAllocation}
        slotTime={mockSlotTime}
        slotLocation={mockLocation}
        open={true}
        onClose={mockOnClose}
      />
    );

    const qrCode = screen.getByRole('img', { name: /qr code for booking id/i });
    expect(qrCode).toBeInTheDocument();
  });

  it('should have accessible download button', () => {
    render(
      <SlotConfirmation
        allocation={mockAllocation}
        slotTime={mockSlotTime}
        slotLocation={mockLocation}
        open={true}
        onClose={mockOnClose}
      />
    );

    const downloadButton = screen.getByRole('button', { name: /download qr code for offline access/i });
    expect(downloadButton).toBeInTheDocument();
  });

  it('should have accessible accommodations region', () => {
    render(
      <SlotConfirmation
        allocation={mockAllocation}
        slotTime={mockSlotTime}
        slotLocation={mockLocation}
        open={true}
        onClose={mockOnClose}
      />
    );

    const accommodationsRegion = screen.getByRole('region', { name: /special accommodations/i });
    expect(accommodationsRegion).toBeInTheDocument();
  });

  it('should have accessible reminder list', () => {
    render(
      <SlotConfirmation
        allocation={mockAllocation}
        slotTime={mockSlotTime}
        slotLocation={mockLocation}
        open={true}
        onClose={mockOnClose}
      />
    );

    const reminderList = screen.getByRole('list', { name: /notification reminders/i });
    expect(reminderList).toBeInTheDocument();

    const reminderItems = screen.getAllByRole('listitem');
    expect(reminderItems).toHaveLength(2); // 30 min and 10 min reminders
  });

  it('should have accessible emergency contact region', () => {
    render(
      <SlotConfirmation
        allocation={mockAllocation}
        slotTime={mockSlotTime}
        slotLocation={mockLocation}
        open={true}
        onClose={mockOnClose}
      />
    );

    const emergencyRegion = screen.getByRole('region', { name: /emergency contact information/i });
    expect(emergencyRegion).toBeInTheDocument();

    // Check for definition list structure
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('+91 98765 43210')).toBeInTheDocument();
    expect(screen.getByText('Son')).toBeInTheDocument();
  });

  it('should have accessible action buttons group', () => {
    render(
      <SlotConfirmation
        allocation={mockAllocation}
        slotTime={mockSlotTime}
        slotLocation={mockLocation}
        open={true}
        onClose={mockOnClose}
      />
    );

    const buttonGroup = screen.getByRole('group', { name: /confirmation actions/i });
    expect(buttonGroup).toBeInTheDocument();

    const calendarButton = screen.getByRole('button', { name: /add booking to calendar/i });
    const doneButton = screen.getByRole('button', { name: /close confirmation dialog/i });

    expect(calendarButton).toBeInTheDocument();
    expect(doneButton).toBeInTheDocument();
  });

  it('should have accessible priority slot badge', () => {
    render(
      <SlotConfirmation
        allocation={mockAllocation}
        slotTime={mockSlotTime}
        slotLocation={mockLocation}
        open={true}
        onClose={mockOnClose}
      />
    );

    const priorityBadge = screen.getByLabelText(/priority slot booking/i);
    expect(priorityBadge).toBeInTheDocument();
  });

  it('should hide decorative icons from screen readers', () => {
    const { container } = render(
      <SlotConfirmation
        allocation={mockAllocation}
        slotTime={mockSlotTime}
        slotLocation={mockLocation}
        open={true}
        onClose={mockOnClose}
      />
    );

    const hiddenIcons = container.querySelectorAll('[aria-hidden="true"]');
    expect(hiddenIcons.length).toBeGreaterThan(0);
  });

  it('should have accessible document role for content', () => {
    render(
      <SlotConfirmation
        allocation={mockAllocation}
        slotTime={mockSlotTime}
        slotLocation={mockLocation}
        open={true}
        onClose={mockOnClose}
      />
    );

    const document = screen.getByRole('document');
    expect(document).toBeInTheDocument();
  });

  it('should handle missing emergency contact gracefully', async () => {
    const allocationWithoutContact: SlotAllocation = {
      ...mockAllocation,
      accessibilityProfile: {
        ...mockProfile,
        emergencyContact: undefined,
      },
    };

    const { container } = render(
      <SlotConfirmation
        allocation={allocationWithoutContact}
        slotTime={mockSlotTime}
        slotLocation={mockLocation}
        open={true}
        onClose={mockOnClose}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();

    // Emergency contact section should not be present
    const emergencyRegion = screen.queryByRole('region', { name: /emergency contact information/i });
    expect(emergencyRegion).not.toBeInTheDocument();
  });
});
