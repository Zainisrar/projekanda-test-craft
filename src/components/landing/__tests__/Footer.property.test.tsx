import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Footer, FooterLinkGroup, FOOTER_LINK_GROUPS } from '../Footer';

/**
 * **Feature: landing-page, Property 5: Footer links are grouped by category**
 * **Validates: Requirements 8.2**
 *
 * For any footer link group, all links within that group
 * SHALL be rendered under the correct category heading.
 */

const footerLinkArbitrary = fc.record({
  label: fc.string({ minLength: 1, maxLength: 30 }),
  href: fc.string({ minLength: 1, maxLength: 100 }),
});

const footerLinkGroupArbitrary = fc.record({
  title: fc.string({ minLength: 1, maxLength: 30 }),
  links: fc.array(footerLinkArbitrary, { minLength: 1, maxLength: 5 }),
});

describe('Footer Property Tests', () => {
  describe('Property 5: Footer links are grouped by category', () => {
    it('should render all default link groups with correct titles', () => {
      render(<Footer />);

      FOOTER_LINK_GROUPS.forEach((group, index) => {
        const groupTitle = screen.getByTestId(`footer-group-title-${index}`);
        const groupLinks = screen.getByTestId(`footer-group-links-${index}`);

        expect(groupTitle).toBeInTheDocument();
        expect(groupTitle.textContent).toBe(group.title);

        expect(groupLinks).toBeInTheDocument();
        expect(groupLinks.children.length).toBe(group.links.length);
      });
    });

    it('should render links under their correct category', () => {
      render(<Footer />);

      FOOTER_LINK_GROUPS.forEach((group, groupIndex) => {
        group.links.forEach((link, linkIndex) => {
          const linkElement = screen.getByTestId(`footer-link-${groupIndex}-${linkIndex}`);
          expect(linkElement).toBeInTheDocument();
          expect(linkElement.textContent).toBe(link.label);
        });
      });
    });

    it('should render custom link groups with correct structure', () => {
      fc.assert(
        fc.property(
          fc.array(footerLinkGroupArbitrary, { minLength: 1, maxLength: 4 }),
          (linkGroups) => {
            const { unmount } = render(<Footer linkGroups={linkGroups} />);

            linkGroups.forEach((group, groupIndex) => {
              const groupTitle = screen.getByTestId(`footer-group-title-${groupIndex}`);
              const groupLinks = screen.getByTestId(`footer-group-links-${groupIndex}`);

              expect(groupTitle).toBeInTheDocument();
              expect(groupTitle.textContent).toBe(group.title);

              expect(groupLinks).toBeInTheDocument();
              expect(groupLinks.children.length).toBe(group.links.length);

              group.links.forEach((link, linkIndex) => {
                const linkElement = screen.getByTestId(`footer-link-${groupIndex}-${linkIndex}`);
                expect(linkElement).toBeInTheDocument();
                expect(linkElement.textContent).toBe(link.label);
              });
            });

            unmount();
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have Product, Company, and Legal groups by default', () => {
      const groupTitles = FOOTER_LINK_GROUPS.map(g => g.title);
      expect(groupTitles).toContain('Product');
      expect(groupTitles).toContain('Company');
      expect(groupTitles).toContain('Legal');
    });
  });
});
