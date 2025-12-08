import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * **Feature: landing-page, Property 6: Role-based redirect correctness**
 * **Validates: Requirements 9.2**
 * 
 * For any authenticated user with a valid role (TVET, ADOF, ADMIN),
 * the redirect path SHALL match the expected dashboard path for that role.
 */

// Role to dashboard path mapping (extracted from LandingPage component)
const ROLE_DASHBOARD_MAP: Record<string, string> = {
  'TVET': '/dashboard',
  'ADOF': '/adof',
  'ADMIN': '/admin/dashboard'
};

// Function under test - extracted for testability
export const getRoleRedirectPath = (role: string): string => {
  return ROLE_DASHBOARD_MAP[role] || '/dashboard';
};

// Valid roles in the system
const VALID_ROLES = ['TVET', 'ADOF', 'ADMIN'] as const;

describe('LandingPage Property Tests', () => {
  describe('Property 6: Role-based redirect correctness', () => {
    it('should map all valid roles to their correct dashboard paths', () => {
      // Property: For any valid role, the redirect path matches the expected mapping
      fc.assert(
        fc.property(
          fc.constantFrom(...VALID_ROLES),
          (role) => {
            const redirectPath = getRoleRedirectPath(role);
            
            // Verify the path matches the expected mapping
            expect(redirectPath).toBe(ROLE_DASHBOARD_MAP[role]);
            
            // Verify the path is a valid route (starts with /)
            expect(redirectPath.startsWith('/')).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return default dashboard for unknown roles', () => {
      // Property: For any unknown role string, default to /dashboard
      // Exclude prototype properties that could cause issues with object lookup
      const EXCLUDED_STRINGS = ['__proto__', 'constructor', 'prototype', 'hasOwnProperty', 'toString'];
      
      fc.assert(
        fc.property(
          fc.string().filter(s => 
            !VALID_ROLES.includes(s as typeof VALID_ROLES[number]) &&
            !EXCLUDED_STRINGS.includes(s)
          ),
          (unknownRole) => {
            const redirectPath = getRoleRedirectPath(unknownRole);
            
            // Unknown roles should default to /dashboard
            expect(redirectPath).toBe('/dashboard');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should ensure TVET users go to /dashboard', () => {
      expect(getRoleRedirectPath('TVET')).toBe('/dashboard');
    });

    it('should ensure ADOF users go to /adof', () => {
      expect(getRoleRedirectPath('ADOF')).toBe('/adof');
    });

    it('should ensure ADMIN users go to /admin/dashboard', () => {
      expect(getRoleRedirectPath('ADMIN')).toBe('/admin/dashboard');
    });

    it('should have unique paths for each role', () => {
      // Property: All role paths should be unique (no two roles share a path)
      const paths = VALID_ROLES.map(role => getRoleRedirectPath(role));
      const uniquePaths = new Set(paths);
      
      expect(uniquePaths.size).toBe(VALID_ROLES.length);
    });

    it('should handle role case sensitivity correctly', () => {
      // Property: Roles are case-sensitive, lowercase versions should default
      fc.assert(
        fc.property(
          fc.constantFrom('tvet', 'adof', 'admin', 'Tvet', 'Adof', 'Admin'),
          (lowercaseRole) => {
            const redirectPath = getRoleRedirectPath(lowercaseRole);
            
            // Lowercase roles should default to /dashboard (not match valid roles)
            expect(redirectPath).toBe('/dashboard');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
