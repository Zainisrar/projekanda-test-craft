import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TestimonialsSection, Testimonial, TESTIMONIALS } from '../TestimonialsSection';

/**
 * **Feature: landing-page, Property 4: Testimonials render with required fields**
 * **Validates: Requirements 6.2**
 *
 * For any testimonial in the testimonials array, the rendered testimonial card
 * SHALL display the quote, user name, and role.
 */

const testimonialArbitrary = fc.record({
  quote: fc.string({ minLength: 1, maxLength: 300 }),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  role: fc.string({ minLength: 1, maxLength: 100 }),
});

describe('TestimonialsSection Property Tests', () => {
  describe('Property 4: Testimonials render with required fields', () => {
    it('should render all default testimonials with quote, name, and role', () => {
      render(<TestimonialsSection />);

      TESTIMONIALS.forEach((testimonial, index) => {
        const quoteElement = screen.getByTestId(`testimonial-quote-${index}`);
        const nameElement = screen.getByTestId(`testimonial-name-${index}`);
        const roleElement = screen.getByTestId(`testimonial-role-${index}`);

        expect(quoteElement).toBeInTheDocument();
        expect(quoteElement.textContent).toContain(testimonial.quote);

        expect(nameElement).toBeInTheDocument();
        expect(nameElement.textContent).toBe(testimonial.name);

        expect(roleElement).toBeInTheDocument();
        expect(roleElement.textContent).toBe(testimonial.role);
      });
    });

    it('should render at least 3 testimonials by default', () => {
      render(<TestimonialsSection />);

      expect(TESTIMONIALS.length).toBeGreaterThanOrEqual(3);

      TESTIMONIALS.forEach((_, index) => {
        expect(screen.getByTestId(`testimonial-card-${index}`)).toBeInTheDocument();
      });
    });

    it('should render custom testimonials with all required fields', () => {
      fc.assert(
        fc.property(
          fc.array(testimonialArbitrary, { minLength: 1, maxLength: 5 }),
          (testimonials) => {
            const { unmount } = render(<TestimonialsSection testimonials={testimonials} />);

            testimonials.forEach((testimonial, index) => {
              const quoteElement = screen.getByTestId(`testimonial-quote-${index}`);
              const nameElement = screen.getByTestId(`testimonial-name-${index}`);
              const roleElement = screen.getByTestId(`testimonial-role-${index}`);

              expect(quoteElement).toBeInTheDocument();
              expect(nameElement).toBeInTheDocument();
              expect(roleElement).toBeInTheDocument();

              expect(nameElement.textContent).toBe(testimonial.name);
              expect(roleElement.textContent).toBe(testimonial.role);
            });

            unmount();
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
