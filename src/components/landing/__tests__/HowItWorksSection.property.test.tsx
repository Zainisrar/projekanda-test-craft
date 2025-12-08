import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { HowItWorksSection, Step, STEPS } from '../HowItWorksSection';

/**
 * **Feature: landing-page, Property 2: Steps render with required elements**
 * **Validates: Requirements 4.3**
 *
 * For any step in the steps array, the rendered step
 * SHALL display a number, icon, and description.
 */

// Arbitrary for generating valid Step objects
const stepArbitrary = fc.record({
  number: fc.integer({ min: 1, max: 10 }),
  icon: fc.constant(<span data-testid="test-icon">Icon</span>),
  title: fc.string({ minLength: 1, maxLength: 50 }),
  description: fc.string({ minLength: 1, maxLength: 200 }),
});

describe('HowItWorksSection Property Tests', () => {
  describe('Property 2: Steps render with required elements', () => {
    it('should render all default steps with number, icon, title, and description', () => {
      render(<HowItWorksSection />);

      // Property: For each step in STEPS, all required elements exist
      STEPS.forEach((step, index) => {
        const numberElement = screen.getByTestId(`step-number-${index}`);
        const iconElement = screen.getByTestId(`step-icon-${index}`);
        const titleElement = screen.getByTestId(`step-title-${index}`);
        const descriptionElement = screen.getByTestId(`step-description-${index}`);

        expect(numberElement).toBeInTheDocument();
        expect(numberElement.textContent).toBe(String(step.number));

        expect(iconElement).toBeInTheDocument();

        expect(titleElement).toBeInTheDocument();
        expect(titleElement.textContent).toBe(step.title);

        expect(descriptionElement).toBeInTheDocument();
        expect(descriptionElement.textContent).toBe(step.description);
      });
    });

    it('should render exactly 4 steps by default', () => {
      render(<HowItWorksSection />);

      expect(STEPS.length).toBe(4);

      STEPS.forEach((_, index) => {
        expect(screen.getByTestId(`step-${index}`)).toBeInTheDocument();
      });
    });

    it('should render custom steps with all required elements', () => {
      fc.assert(
        fc.property(
          fc.array(stepArbitrary, { minLength: 1, maxLength: 6 }),
          (steps) => {
            const { unmount } = render(<HowItWorksSection steps={steps} />);

            steps.forEach((step, index) => {
              const numberElement = screen.getByTestId(`step-number-${index}`);
              const iconElement = screen.getByTestId(`step-icon-${index}`);
              const titleElement = screen.getByTestId(`step-title-${index}`);
              const descriptionElement = screen.getByTestId(`step-description-${index}`);

              // All required elements must exist
              expect(numberElement).toBeInTheDocument();
              expect(iconElement).toBeInTheDocument();
              expect(titleElement).toBeInTheDocument();
              expect(descriptionElement).toBeInTheDocument();

              // Content must match
              expect(numberElement.textContent).toBe(String(step.number));
              expect(titleElement.textContent).toBe(step.title);
              expect(descriptionElement.textContent).toBe(step.description);
            });

            unmount();
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should ensure steps are numbered sequentially by default', () => {
      STEPS.forEach((step, index) => {
        expect(step.number).toBe(index + 1);
      });
    });
  });
});
