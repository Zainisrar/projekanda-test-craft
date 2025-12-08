import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { WhoItsForSection, UserType, USER_TYPES } from '../WhoItsForSection';

/**
 * **Feature: landing-page, Property 3: User type cards contain required information**
 * **Validates: Requirements 5.2**
 *
 * For any user type in the user types array, the rendered card
 * SHALL display the target audience description and at least one benefit.
 */

const userTypeArbitrary = fc.record({
  title: fc.string({ minLength: 1, maxLength: 50 }),
  description: fc.string({ minLength: 1, maxLength: 200 }),
  benefits: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 5 }),
  icon: fc.constant(<span data-testid="test-icon">Icon</span>),
});

describe('WhoItsForSection Property Tests', () => {
  describe('Property 3: User type cards contain required information', () => {
    it('should render all default user types with description and benefits', () => {
      const mockOnGetStarted = () => {};
      render(<WhoItsForSection onGetStarted={mockOnGetStarted} />);

      USER_TYPES.forEach((userType, index) => {
        const titleElement = screen.getByTestId(`user-type-title-${index}`);
        const descriptionElement = screen.getByTestId(`user-type-description-${index}`);
        const benefitsElement = screen.getByTestId(`user-type-benefits-${index}`);

        expect(titleElement).toBeInTheDocument();
        expect(titleElement.textContent).toBe(userType.title);

        expect(descriptionElement).toBeInTheDocument();
        expect(descriptionElement.textContent).toBe(userType.description);

        expect(benefitsElement).toBeInTheDocument();
        expect(benefitsElement.children.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should render custom user types with all required elements', () => {
      fc.assert(
        fc.property(
          fc.array(userTypeArbitrary, { minLength: 1, maxLength: 4 }),
          (userTypes) => {
            const mockOnGetStarted = () => {};
            const { unmount } = render(
              <WhoItsForSection userTypes={userTypes} onGetStarted={mockOnGetStarted} />
            );

            userTypes.forEach((userType, index) => {
              const descriptionElement = screen.getByTestId(`user-type-description-${index}`);
              const benefitsElement = screen.getByTestId(`user-type-benefits-${index}`);

              expect(descriptionElement).toBeInTheDocument();
              expect(descriptionElement.textContent).toBe(userType.description);

              expect(benefitsElement).toBeInTheDocument();
              expect(benefitsElement.children.length).toBe(userType.benefits.length);
              expect(benefitsElement.children.length).toBeGreaterThanOrEqual(1);
            });

            unmount();
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should ensure each default user type has at least one benefit', () => {
      USER_TYPES.forEach((userType) => {
        expect(userType.benefits.length).toBeGreaterThanOrEqual(1);
        expect(userType.description.length).toBeGreaterThan(0);
      });
    });
  });
});
