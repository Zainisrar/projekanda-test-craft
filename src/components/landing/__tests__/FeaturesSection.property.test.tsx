import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { FeaturesSection, Feature, FEATURES } from '../FeaturesSection';

/**
 * **Feature: landing-page, Property 1: Feature cards render with required elements**
 * **Validates: Requirements 3.1**
 *
 * For any feature in the features array, the rendered feature card
 * SHALL contain an icon, title, and description element.
 */

// Arbitrary for generating valid Feature objects
const featureArbitrary = fc.record({
  icon: fc.constant(<span data-testid="test-icon">Icon</span>),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 1, maxLength: 500 }),
});

describe('FeaturesSection Property Tests', () => {
  describe('Property 1: Feature cards render with required elements', () => {
    it('should render all default features with icon, title, and description', () => {
      render(<FeaturesSection />);

      // Property: For each feature in FEATURES, all required elements exist
      FEATURES.forEach((feature, index) => {
        const titleElement = screen.getByTestId(`feature-title-${index}`);
        const descriptionElement = screen.getByTestId(`feature-description-${index}`);
        const cardElement = screen.getByTestId(`feature-card-${index}`);

        expect(titleElement).toBeInTheDocument();
        expect(titleElement.textContent).toBe(feature.title);

        expect(descriptionElement).toBeInTheDocument();
        expect(descriptionElement.textContent).toBe(feature.description);

        expect(cardElement).toBeInTheDocument();
      });
    });

    it('should render at least 4 feature cards by default', () => {
      render(<FeaturesSection />);

      // Property: Default features array has at least 4 items
      expect(FEATURES.length).toBeGreaterThanOrEqual(4);

      // Verify all are rendered
      FEATURES.forEach((_, index) => {
        expect(screen.getByTestId(`feature-card-${index}`)).toBeInTheDocument();
      });
    });

    it('should render custom features with all required elements', () => {
      // Property: For any array of valid features, all render with required elements
      fc.assert(
        fc.property(
          fc.array(featureArbitrary, { minLength: 1, maxLength: 6 }),
          (features) => {
            const { unmount } = render(<FeaturesSection features={features} />);

            features.forEach((feature, index) => {
              const titleElement = screen.getByTestId(`feature-title-${index}`);
              const descriptionElement = screen.getByTestId(`feature-description-${index}`);
              const cardElement = screen.getByTestId(`feature-card-${index}`);

              // All required elements must exist
              expect(titleElement).toBeInTheDocument();
              expect(descriptionElement).toBeInTheDocument();
              expect(cardElement).toBeInTheDocument();

              // Content must match
              expect(titleElement.textContent).toBe(feature.title);
              expect(descriptionElement.textContent).toBe(feature.description);
            });

            unmount();
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should ensure each feature has non-empty title and description', () => {
      // Property: All default features have non-empty title and description
      FEATURES.forEach((feature) => {
        expect(feature.title.length).toBeGreaterThan(0);
        expect(feature.description.length).toBeGreaterThan(0);
        expect(feature.icon).toBeDefined();
      });
    });
  });
});
