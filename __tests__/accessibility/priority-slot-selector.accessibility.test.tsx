import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { PrioritySlotSelector } from '@/components/booking/priority-slot-selector';
import type { PrioritySlot } from '@/lib/types/priority-slots';
import type { AccessibilityProfile } from '@/lib/types/accessibility';

describe('PrioritySlotSelector - Accessibility Tests', () => {
  const mockProfile: AccessibilityProfile = {
    pilgrimId: 'test-pilgrim',
    categories: ['elderly', 'wheelchair-user'],
    mobilitySpeed: 'slow',
    requiresAssistance: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSlots: PrioritySlot[] = [
    {
      id: 'slot-1',
      slotTime: new Date('2024-01-15T10:00:00'),
      duration: 30,
      capacity: 20,
      reserved: 5,
      available: 15,
      accessibilityCategories: ['elderly', 'wheelchair-user'],
      location: 'Main Temple',
      status: 'available',
    },
    {
      id: 'slot-2',
      slotTime: new Date('2024-01-15T11:00:00'),
      duration: 30,
      capacity: 20,
      reserved: 16,
      available: 4,
      accessibilityCategories: ['elderly'],
      location: 'Main Temple',
      status: 'filling',
    },
    {
      id: 'slot-3',
      slotTime: new Date('2024-01-15T12:00:00'),
      duration: 30,
      capacity: 20,
      reserved: 20,
      available: 0,
      accessibilityCategories: ['elderly'],
      location: 'Main Temple',
      status: 'full',
    },
  ];

  const mockOnSelectSlot = vi.fn();

  it('should not have any accessibility violations', async () => {
    const { container } = render(
      <PrioritySlotSelector
        slots={mockSlots}
        profile={mockProfile}
        onSelectSlot={mockOnSelectSlot}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper region labeling', () => {
    render(
      <PrioritySlotSelector
        slots={mockSlots}
        profile={mockProfile}
        onSelectSlot={mockOnSelectSlot}
      />
    );

    const region = screen.getByRole('region', { name: /priority slot selection/i });
    expect(region).toBeInTheDocument();
  });

  it('should have accessible list structure', () => {
    render(
      <PrioritySlotSelector
        slots={mockSlots}
        profile={mockProfile}
        onSelectSlot={mockOnSelectSlot}
      />
    );

    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(mockSlots.length);
  });

  it('should have descriptive aria-labels for each slot', () => {
    render(
      <PrioritySlotSelector
        slots={mockSlots}
        profile={mockProfile}
        onSelectSlot={mockOnSelectSlot}
      />
    );

    const slots = screen.getAllByRole('listitem');
    
    // First slot should have comprehensive label
    expect(slots[0]).toHaveAttribute('aria-label');
    const label = slots[0].getAttribute('aria-label');
    expect(label).toContain('available');
    expect(label).toContain('Main Temple');
    expect(label).toContain('priority eligible');
  });

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    render(
      <PrioritySlotSelector
        slots={mockSlots}
        profile={mockProfile}
        onSelectSlot={mockOnSelectSlot}
      />
    );

    const slots = screen.getAllByRole('listitem');
    const firstSlot = slots[0];

    // Focus first slot
    firstSlot.focus();
    expect(firstSlot).toHaveFocus();

    // Select with Enter key
    await user.keyboard('{Enter}');
    expect(mockOnSelectSlot).toHaveBeenCalledWith(mockSlots[0]);

    // Reset mock
    mockOnSelectSlot.mockClear();

    // Select with Space key
    await user.keyboard(' ');
    expect(mockOnSelectSlot).toHaveBeenCalledWith(mockSlots[0]);
  });

  it('should have proper aria-pressed state', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <PrioritySlotSelector
        slots={mockSlots}
        profile={mockProfile}
        onSelectSlot={mockOnSelectSlot}
        selectedSlotId={undefined}
      />
    );

    const slots = screen.getAllByRole('listitem');
    expect(slots[0]).toHaveAttribute('aria-pressed', 'false');

    // Rerender with selected slot
    rerender(
      <PrioritySlotSelector
        slots={mockSlots}
        profile={mockProfile}
        onSelectSlot={mockOnSelectSlot}
        selectedSlotId="slot-1"
      />
    );

    expect(slots[0]).toHaveAttribute('aria-pressed', 'true');
  });

  it('should mark full slots as disabled', () => {
    render(
      <PrioritySlotSelector
        slots={mockSlots}
        profile={mockProfile}
        onSelectSlot={mockOnSelectSlot}
      />
    );

    const slots = screen.getAllByRole('listitem');
    const fullSlot = slots[2]; // Third slot is full

    expect(fullSlot).toHaveAttribute('aria-disabled', 'true');
    expect(fullSlot).toHaveAttribute('tabindex', '-1');
  });

  it('should have accessible capacity progress bar', () => {
    render(
      <PrioritySlotSelector
        slots={mockSlots}
        profile={mockProfile}
        onSelectSlot={mockOnSelectSlot}
      />
    );

    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBeGreaterThan(0);

    progressBars.forEach((bar) => {
      expect(bar).toHaveAttribute('aria-valuenow');
      expect(bar).toHaveAttribute('aria-valuemin', '0');
      expect(bar).toHaveAttribute('aria-valuemax', '100');
      expect(bar).toHaveAttribute('aria-label');
    });
  });

  it('should announce slot count with aria-live', () => {
    render(
      <PrioritySlotSelector
        slots={mockSlots}
        profile={mockProfile}
        onSelectSlot={mockOnSelectSlot}
      />
    );

    const slotCount = screen.getByText(/3 slots available/i);
    expect(slotCount.closest('[aria-live]')).toHaveAttribute('aria-live', 'polite');
  });

  it('should have visible focus indicators', async () => {
    const user = userEvent.setup();
    render(
      <PrioritySlotSelector
        slots={mockSlots}
        profile={mockProfile}
        onSelectSlot={mockOnSelectSlot}
      />
    );

    const slots = screen.getAllByRole('listitem');
    const firstSlot = slots[0];

    // Tab to first slot
    await user.tab();
    
    // Check for focus-visible class
    expect(firstSlot.className).toContain('focus-visible');
  });

  it('should handle empty slots gracefully', async () => {
    const { container } = render(
      <PrioritySlotSelector
        slots={[]}
        profile={mockProfile}
        onSelectSlot={mockOnSelectSlot}
      />
    );

    // Should still pass accessibility
    const results = await axe(container);
    expect(results).toHaveNoViolations();

    // Should show appropriate message
    expect(screen.getByText(/no priority slots available/i)).toBeInTheDocument();
  });

  it('should have accessible priority badge', () => {
    render(
      <PrioritySlotSelector
        slots={mockSlots}
        profile={mockProfile}
        onSelectSlot={mockOnSelectSlot}
      />
    );

    // Find priority badges
    const priorityBadges = screen.getAllByLabelText(/priority eligible slot/i);
    expect(priorityBadges.length).toBeGreaterThan(0);
  });
});
