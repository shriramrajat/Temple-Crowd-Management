import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { AccessibilityProfileForm } from '@/components/accessibility/profile-form';

describe('AccessibilityProfileForm - Accessibility Tests', () => {
  const mockOnSubmit = vi.fn();

  it('should not have any accessibility violations', async () => {
    const { container } = render(
      <AccessibilityProfileForm onSubmit={mockOnSubmit} />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper form labeling', () => {
    render(<AccessibilityProfileForm onSubmit={mockOnSubmit} />);

    // Check for form label
    expect(screen.getByRole('form', { name: /accessibility profile form/i })).toBeInTheDocument();
  });

  it('should have accessible fieldsets with legends', () => {
    render(<AccessibilityProfileForm onSubmit={mockOnSubmit} />);

    // Check for fieldset legends
    expect(screen.getByText('Accessibility Categories')).toBeInTheDocument();
    expect(screen.getByText('Mobility Speed')).toBeInTheDocument();
    expect(screen.getByText('Emergency Contact (Optional)')).toBeInTheDocument();
    expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
  });

  it('should support keyboard navigation for category selection', async () => {
    const user = userEvent.setup();
    render(<AccessibilityProfileForm onSubmit={mockOnSubmit} />);

    // Find the first category button
    const elderlyButton = screen.getByRole('button', { name: /elderly/i });

    // Should be keyboard accessible
    elderlyButton.focus();
    expect(elderlyButton).toHaveFocus();

    // Should toggle on Enter key
    await user.keyboard('{Enter}');
    expect(elderlyButton).toHaveAttribute('aria-pressed', 'true');

    // Should toggle on Space key
    await user.keyboard(' ');
    expect(elderlyButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('should have accessible radio group for mobility speed', () => {
    render(<AccessibilityProfileForm onSubmit={mockOnSubmit} />);

    // Check for radiogroup
    const radioGroup = screen.getByRole('radiogroup', { name: /this helps us calculate/i });
    expect(radioGroup).toBeInTheDocument();

    // Check for radio buttons
    const slowRadio = screen.getByRole('radio', { name: /mobility speed: slow/i });
    const moderateRadio = screen.getByRole('radio', { name: /mobility speed: moderate/i });
    const normalRadio = screen.getByRole('radio', { name: /mobility speed: normal/i });

    expect(slowRadio).toBeInTheDocument();
    expect(moderateRadio).toBeInTheDocument();
    expect(normalRadio).toBeInTheDocument();
  });

  it('should have accessible switches with proper labels', () => {
    render(<AccessibilityProfileForm onSubmit={mockOnSubmit} />);

    // Check for assistance switch
    const assistanceSwitch = screen.getByRole('switch', { name: /requires assistance/i });
    expect(assistanceSwitch).toBeInTheDocument();
    expect(assistanceSwitch).toHaveAttribute('aria-checked');

    // Check for notification preference switches
    const assistanceZoneSwitch = screen.getByRole('switch', { name: /assistance zone alerts/i });
    const slotRemindersSwitch = screen.getByRole('switch', { name: /priority slot reminders/i });
    const weatherAlertsSwitch = screen.getByRole('switch', { name: /weather alerts/i });
    const routeAlertsSwitch = screen.getByRole('switch', { name: /route recalculation alerts/i });

    expect(assistanceZoneSwitch).toBeInTheDocument();
    expect(slotRemindersSwitch).toBeInTheDocument();
    expect(weatherAlertsSwitch).toBeInTheDocument();
    expect(routeAlertsSwitch).toBeInTheDocument();
  });

  it('should have accessible form inputs with labels', () => {
    render(<AccessibilityProfileForm onSubmit={mockOnSubmit} />);

    // Check for emergency contact inputs
    const nameInput = screen.getByLabelText(/name/i);
    const phoneInput = screen.getByLabelText(/phone number/i);
    const relationshipInput = screen.getByLabelText(/relationship/i);

    expect(nameInput).toBeInTheDocument();
    expect(phoneInput).toBeInTheDocument();
    expect(relationshipInput).toBeInTheDocument();

    // Check for proper input types
    expect(phoneInput).toHaveAttribute('type', 'tel');
  });

  it('should announce form validation errors to screen readers', async () => {
    const user = userEvent.setup();
    render(<AccessibilityProfileForm onSubmit={mockOnSubmit} />);

    // Submit form without required fields
    const submitButton = screen.getByRole('button', { name: /save accessibility profile/i });
    await user.click(submitButton);

    // Wait for validation errors
    const errors = await screen.findAllByRole('alert');
    expect(errors.length).toBeGreaterThan(0);

    // Check that errors have aria-live
    errors.forEach((error) => {
      expect(error).toHaveAttribute('aria-live', 'polite');
    });
  });

  it('should have proper aria-invalid on invalid inputs', async () => {
    const user = userEvent.setup();
    render(<AccessibilityProfileForm onSubmit={mockOnSubmit} />);

    // Try to submit with invalid data
    const phoneInput = screen.getByLabelText(/phone number/i);
    await user.type(phoneInput, 'invalid');

    const submitButton = screen.getByRole('button', { name: /save accessibility profile/i });
    await user.click(submitButton);

    // Check for aria-invalid
    expect(phoneInput).toHaveAttribute('aria-invalid');
  });

  it('should have accessible submit button with loading state', () => {
    const { rerender } = render(
      <AccessibilityProfileForm onSubmit={mockOnSubmit} isLoading={false} />
    );

    const submitButton = screen.getByRole('button', { name: /save accessibility profile/i });
    expect(submitButton).not.toHaveAttribute('aria-busy');

    // Rerender with loading state
    rerender(<AccessibilityProfileForm onSubmit={mockOnSubmit} isLoading={true} />);

    expect(submitButton).toHaveAttribute('aria-busy', 'true');
    expect(submitButton).toBeDisabled();
  });

  it('should have proper focus management', async () => {
    const user = userEvent.setup();
    render(<AccessibilityProfileForm onSubmit={mockOnSubmit} />);

    // Tab through form elements
    await user.tab();
    
    // First focusable element should be a category button
    const firstButton = screen.getAllByRole('button')[0];
    expect(firstButton).toHaveFocus();

    // Continue tabbing
    await user.tab();
    
    // Should move to next interactive element
    const focusedElement = document.activeElement;
    expect(focusedElement).toBeTruthy();
  });
});
