import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { AccessibleRouteMap } from '@/components/routes/accessible-route-map';
import { RouteDetails } from '@/components/routes/route-details';
import type { OptimizedRoute } from '@/lib/types/route-optimization';

describe('Route Components - Accessibility Tests', () => {
  const mockRoute: OptimizedRoute = {
    routeId: 'route-1',
    segments: [
      {
        id: 'seg-1',
        startPoint: { latitude: 18.5204, longitude: 73.8567 },
        endPoint: { latitude: 18.5214, longitude: 73.8577 },
        distance: 150,
        estimatedTime: 3,
        accessibility: {
          hasStairs: false,
          maxIncline: 2,
          minWidth: 2.0,
          surfaceType: 'paved',
          hasHandrails: true,
          wheelchairAccessible: true,
        },
        isWomenOnly: false,
        amenities: [
          {
            type: 'restroom',
            location: { latitude: 18.5209, longitude: 73.8572 },
            accessible: true,
            distanceFromPath: 50,
          },
        ],
      },
      {
        id: 'seg-2',
        startPoint: { latitude: 18.5214, longitude: 73.8577 },
        endPoint: { latitude: 18.5224, longitude: 73.8587 },
        distance: 120,
        estimatedTime: 2,
        accessibility: {
          hasStairs: false,
          maxIncline: 3,
          minWidth: 1.8,
          surfaceType: 'paved',
          hasHandrails: false,
          wheelchairAccessible: true,
        },
        isWomenOnly: true,
        amenities: [],
      },
    ],
    totalDistance: 270,
    estimatedDuration: 5,
    accessibilityScore: 85,
    amenitiesCount: 1,
    isWomenOnlyRoute: false,
    alternativeRoutes: [
      {
        reason: 'Shorter distance but steeper incline',
        route: {
          routeId: 'route-2',
          segments: [],
          totalDistance: 200,
          estimatedDuration: 4,
          accessibilityScore: 70,
          amenitiesCount: 0,
          isWomenOnlyRoute: false,
          alternativeRoutes: [],
        },
      },
    ],
  };

  describe('AccessibleRouteMap', () => {
    it('should not have any accessibility violations', async () => {
      const { container } = render(<AccessibleRouteMap route={mockRoute} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper region labeling', () => {
      render(<AccessibleRouteMap route={mockRoute} />);

      const region = screen.getByRole('region', { name: /accessible route map/i });
      expect(region).toBeInTheDocument();
    });

    it('should have accessible navigation structure', () => {
      render(<AccessibleRouteMap route={mockRoute} />);

      const nav = screen.getByRole('navigation', { name: /route navigation/i });
      expect(nav).toBeInTheDocument();
    });

    it('should have accessible ordered list for segments', () => {
      render(<AccessibleRouteMap route={mockRoute} />);

      const list = screen.getByRole('list', { name: /route segments/i });
      expect(list).toBeInTheDocument();

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(mockRoute.segments.length);
    });

    it('should have accessible start and end point regions', () => {
      render(<AccessibleRouteMap route={mockRoute} />);

      const startRegion = screen.getByRole('region', { name: /starting point/i });
      const endRegion = screen.getByRole('region', { name: /destination point/i });

      expect(startRegion).toBeInTheDocument();
      expect(endRegion).toBeInTheDocument();
    });

    it('should have accessible accessibility score', () => {
      render(<AccessibleRouteMap route={mockRoute} />);

      const score = screen.getByLabelText(/accessibility score: 85 out of 100/i);
      expect(score).toBeInTheDocument();
    });

    it('should have accessible alternative routes list', () => {
      const mockOnSelect = vi.fn();
      render(
        <AccessibleRouteMap
          route={mockRoute}
          onAlternativeSelect={mockOnSelect}
          showAlternatives={true}
        />
      );

      const altList = screen.getByRole('list', { name: /alternative route options/i });
      expect(altList).toBeInTheDocument();

      const altItems = screen.getAllByRole('listitem');
      // Should have segment items + alternative route items
      expect(altItems.length).toBeGreaterThan(mockRoute.segments.length);
    });

    it('should have accessible select buttons for alternatives', () => {
      const mockOnSelect = vi.fn();
      render(
        <AccessibleRouteMap
          route={mockRoute}
          onAlternativeSelect={mockOnSelect}
          showAlternatives={true}
        />
      );

      const selectButtons = screen.getAllByRole('button', { name: /select alternative route/i });
      expect(selectButtons.length).toBe(mockRoute.alternativeRoutes.length);

      selectButtons.forEach((button) => {
        expect(button).toHaveAttribute('aria-label');
      });
    });
  });

  describe('RouteDetails', () => {
    it('should not have any accessibility violations', async () => {
      const { container } = render(<RouteDetails route={mockRoute} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible navigation for step-by-step guidance', () => {
      render(<RouteDetails route={mockRoute} />);

      const nav = screen.getByRole('navigation', { name: /route step-by-step guidance/i });
      expect(nav).toBeInTheDocument();
    });

    it('should have accessible entry and exit point regions', () => {
      render(<RouteDetails route={mockRoute} />);

      const entryRegion = screen.getByRole('region', { name: /accessible entry point/i });
      const exitRegion = screen.getByRole('region', { name: /accessible exit point/i });

      expect(entryRegion).toBeInTheDocument();
      expect(exitRegion).toBeInTheDocument();
    });

    it('should have accessible segment articles with headings', () => {
      render(<RouteDetails route={mockRoute} />);

      const articles = screen.getAllByRole('article');
      expect(articles).toHaveLength(mockRoute.segments.length);

      // Each article should have a heading
      articles.forEach((article, index) => {
        const heading = screen.getByRole('heading', { name: `Step ${index + 1}` });
        expect(heading).toBeInTheDocument();
      });
    });

    it('should have accessible amenities list', () => {
      render(<RouteDetails route={mockRoute} />);

      const amenitiesList = screen.getByRole('list', { name: /nearby facilities/i });
      expect(amenitiesList).toBeInTheDocument();
    });

    it('should have accessible route summary with definition list', () => {
      render(<RouteDetails route={mockRoute} />);

      const summaryRegion = screen.getByRole('region', { name: /route summary/i });
      expect(summaryRegion).toBeInTheDocument();

      // Check for definition list structure
      const summaryHeading = screen.getByRole('heading', { name: /route summary/i });
      expect(summaryHeading).toBeInTheDocument();
    });

    it('should have proper emoji labels for amenities', () => {
      render(<RouteDetails route={mockRoute} />);

      // Amenity icons should have role="img" and aria-label
      const amenityIcons = screen.getAllByRole('img');
      amenityIcons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-label');
      });
    });

    it('should hide decorative icons from screen readers', () => {
      const { container } = render(<RouteDetails route={mockRoute} />);

      // Find all icons with aria-hidden
      const hiddenIcons = container.querySelectorAll('[aria-hidden="true"]');
      expect(hiddenIcons.length).toBeGreaterThan(0);
    });

    it('should have accessible progress indicators', () => {
      render(<RouteDetails route={mockRoute} />);

      // Progress indicators should have aria-label
      const progressIndicators = screen.getAllByLabelText(/progress after step/i);
      expect(progressIndicators.length).toBe(mockRoute.segments.length - 1);
    });
  });
});
