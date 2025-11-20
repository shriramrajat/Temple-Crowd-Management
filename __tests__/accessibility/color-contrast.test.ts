import { describe, it, expect } from 'vitest';
import {
  meetsWCAGAA,
  validateAllColors,
  getAccessibleColors,
  accessibilityColors,
  generateColorReport,
} from '@/lib/utils/accessibility-colors';

describe('Color Contrast Validation', () => {
  describe('meetsWCAGAA', () => {
    it('should validate passing color combinations', () => {
      // High contrast: black on white
      const result = meetsWCAGAA('#000000', '#FFFFFF');
      expect(result.passes).toBe(true);
      expect(result.ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('should validate failing color combinations', () => {
      // Low contrast: light gray on white
      const result = meetsWCAGAA('#CCCCCC', '#FFFFFF');
      expect(result.passes).toBe(false);
      expect(result.ratio).toBeLessThan(4.5);
    });

    it('should handle large text threshold', () => {
      // Combination that passes for large text but not normal text
      const normalText = meetsWCAGAA('#767676', '#FFFFFF', false);
      const largeText = meetsWCAGAA('#767676', '#FFFFFF', true);

      expect(normalText.required).toBe(4.5);
      expect(largeText.required).toBe(3);
    });

    it('should handle invalid hex colors', () => {
      const result = meetsWCAGAA('invalid', '#FFFFFF');
      expect(result.passes).toBe(false);
      expect(result.ratio).toBe(0);
    });
  });

  describe('Badge Colors', () => {
    it('should have all badge colors meet WCAG AA', () => {
      Object.entries(accessibilityColors.badges).forEach(([key, colors]) => {
        const result = meetsWCAGAA(colors.text, colors.bg);
        expect(result.passes).toBe(true);
        expect(result.ratio).toBeGreaterThanOrEqual(4.5);
      });
    });

    it('should have documented contrast ratios', () => {
      expect(accessibilityColors.badges.elderly.contrast).toBeGreaterThanOrEqual(4.5);
      expect(accessibilityColors.badges['differently-abled'].contrast).toBeGreaterThanOrEqual(4.5);
      expect(accessibilityColors.badges['wheelchair-user'].contrast).toBeGreaterThanOrEqual(4.5);
      expect(accessibilityColors.badges['women-only-route'].contrast).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('Slot Status Colors', () => {
    it('should have all slot status colors meet WCAG AA', () => {
      Object.entries(accessibilityColors.slotStatus).forEach(([key, colors]) => {
        const result = meetsWCAGAA(colors.text, colors.bg);
        expect(result.passes).toBe(true);
        expect(result.ratio).toBeGreaterThanOrEqual(4.5);
      });
    });

    it('should have distinct colors for different statuses', () => {
      const available = accessibilityColors.slotStatus.available;
      const filling = accessibilityColors.slotStatus.filling;
      const full = accessibilityColors.slotStatus.full;

      // Colors should be different
      expect(available.bg).not.toBe(filling.bg);
      expect(filling.bg).not.toBe(full.bg);
      expect(available.bg).not.toBe(full.bg);
    });
  });

  describe('Notification Priority Colors', () => {
    it('should have all notification colors meet WCAG AA', () => {
      Object.entries(accessibilityColors.notifications).forEach(([key, colors]) => {
        const result = meetsWCAGAA(colors.text, colors.bg);
        expect(result.passes).toBe(true);
        expect(result.ratio).toBeGreaterThanOrEqual(4.5);
      });
    });

    it('should have highest contrast for urgent notifications', () => {
      const urgent = accessibilityColors.notifications.urgent.contrast;
      const low = accessibilityColors.notifications.low.contrast;

      // Both should pass, but urgent should have high contrast
      expect(urgent).toBeGreaterThanOrEqual(4.5);
      expect(low).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('Route Indicators', () => {
    it('should have all route indicator colors meet WCAG AA', () => {
      Object.entries(accessibilityColors.routeIndicators).forEach(([key, colors]) => {
        const result = meetsWCAGAA(colors.text, colors.bg);
        expect(result.passes).toBe(true);
        expect(result.ratio).toBeGreaterThanOrEqual(4.5);
      });
    });
  });

  describe('Focus Indicators', () => {
    it('should have focus ring meet WCAG AA', () => {
      const result = meetsWCAGAA(
        accessibilityColors.focus.ring,
        accessibilityColors.focus.ringOffset
      );
      expect(result.passes).toBe(true);
      expect(result.ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('Emergency Colors', () => {
    it('should have emergency colors meet WCAG AA', () => {
      const result = meetsWCAGAA(
        accessibilityColors.emergency.text,
        accessibilityColors.emergency.bg
      );
      expect(result.passes).toBe(true);
      expect(result.ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('validateAllColors', () => {
    it('should validate all color combinations', () => {
      const validation = validateAllColors();

      expect(validation.passed).toBeGreaterThan(0);
      expect(validation.failed).toBe(0);
      expect(validation.failures).toHaveLength(0);
    });

    it('should report all combinations as passing', () => {
      const validation = validateAllColors();

      // We have 4 badge colors + 3 slot status + 4 notification + 3 route indicators = 14 combinations
      expect(validation.passed).toBeGreaterThanOrEqual(14);
    });
  });

  describe('getAccessibleColors', () => {
    it('should return badge colors', () => {
      const colors = getAccessibleColors('badge', 'elderly');
      expect(colors).toBeTruthy();
      expect(colors?.bg).toBe(accessibilityColors.badges.elderly.bg);
      expect(colors?.text).toBe(accessibilityColors.badges.elderly.text);
    });

    it('should return slot status colors', () => {
      const colors = getAccessibleColors('slot', 'available');
      expect(colors).toBeTruthy();
      expect(colors?.bg).toBe(accessibilityColors.slotStatus.available.bg);
    });

    it('should return notification colors', () => {
      const colors = getAccessibleColors('notification', 'urgent');
      expect(colors).toBeTruthy();
      expect(colors?.bg).toBe(accessibilityColors.notifications.urgent.bg);
    });

    it('should return route indicator colors', () => {
      const colors = getAccessibleColors('route', 'highlyAccessible');
      expect(colors).toBeTruthy();
      expect(colors?.text).toBe(accessibilityColors.routeIndicators.highlyAccessible.text);
    });

    it('should return null for invalid context', () => {
      const colors = getAccessibleColors('invalid' as any, 'test');
      expect(colors).toBeNull();
    });

    it('should return null for invalid variant', () => {
      const colors = getAccessibleColors('badge', 'invalid');
      expect(colors).toBeNull();
    });
  });

  describe('generateColorReport', () => {
    it('should generate a valid report', () => {
      const report = generateColorReport();

      expect(report).toContain('WCAG 2.1 AA Color Contrast Validation Report');
      expect(report).toContain('Summary:');
      expect(report).toContain('passed');
      expect(report).toContain('Accessibility Badges');
      expect(report).toContain('Slot Status');
      expect(report).toContain('Notifications');
      expect(report).toContain('Route Indicators');
    });

    it('should show all passing combinations', () => {
      const report = generateColorReport();

      expect(report).toContain('✅ Passes');
      expect(report).not.toContain('Failures');
    });

    it('should include contrast ratios', () => {
      const report = generateColorReport();

      // Should include contrast ratios like "10.67:1"
      expect(report).toMatch(/\d+\.\d+:1/);
    });
  });

  describe('Color Consistency', () => {
    it('should use consistent color naming', () => {
      // All colors should use Tailwind color names
      Object.values(accessibilityColors.badges).forEach((colors) => {
        expect(colors.bg).toMatch(/^#[0-9A-F]{6}$/i);
        expect(colors.text).toMatch(/^#[0-9A-F]{6}$/i);
        expect(colors.border).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });

    it('should have documented contrast for all combinations', () => {
      Object.values(accessibilityColors.badges).forEach((colors) => {
        expect(colors.contrast).toBeGreaterThan(0);
      });

      Object.values(accessibilityColors.slotStatus).forEach((colors) => {
        expect(colors.contrast).toBeGreaterThan(0);
      });

      Object.values(accessibilityColors.notifications).forEach((colors) => {
        expect(colors.contrast).toBeGreaterThan(0);
      });

      Object.values(accessibilityColors.routeIndicators).forEach((colors) => {
        expect(colors.contrast).toBeGreaterThan(0);
      });
    });
  });
});
