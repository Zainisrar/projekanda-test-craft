# Implementation Plan

- [x] 1. Set up landing page component structure
  - [x] 1.1 Create landing page directory and main LandingPage component
    - Create `src/components/landing/` directory
    - Create `LandingPage.tsx` with basic structure and state management for auth modal
    - Define interfaces for component props and state
    - _Requirements: 1.1, 9.1_
  - [x] 1.2 Create AuthModal component wrapping existing AuthForm
    - Create `src/components/landing/AuthModal.tsx`
    - Use Radix Dialog component for modal behavior
    - Integrate existing AuthForm component
    - Handle mode switching (signin/signup) and close behavior
    - _Requirements: 1.3, 1.4, 9.1, 9.3, 9.4_
  - [x] 1.3 Write property test for role-based redirect correctness
    - **Property 6: Role-based redirect correctness**
    - **Validates: Requirements 9.2**

- [x] 2. Implement Navbar component
  - [x] 2.1 Create Navbar component with navigation links
    - Create `src/components/landing/Navbar.tsx`
    - Implement fixed positioning with scroll background change
    - Add logo, navigation links, and Sign In/Sign Up buttons
    - Implement smooth scroll to sections on link click
    - _Requirements: 1.1, 1.2, 1.5_
  - [x] 2.2 Add mobile responsive hamburger menu
    - Implement mobile menu state and toggle
    - Create slide-out menu for mobile viewports
    - _Requirements: 10.1_

- [x] 3. Implement Hero section
  - [x] 3.1 Create HeroSection component
    - Create `src/components/landing/HeroSection.tsx`
    - Add compelling headline and subheadline content
    - Implement "Get Started" and "Learn More" CTA buttons
    - Add background decorative elements
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 4. Implement Features section
  - [x] 4.1 Create FeaturesSection component with feature cards
    - Create `src/components/landing/FeaturesSection.tsx`
    - Define features data array with icons, titles, descriptions
    - Implement responsive grid layout for feature cards
    - Add hover animations for cards
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 4.2 Write property test for feature card rendering
    - **Property 1: Feature cards render with required elements**
    - **Validates: Requirements 3.1**

- [x] 5. Implement How It Works section
  - [x] 5.1 Create HowItWorksSection component
    - Create `src/components/landing/HowItWorksSection.tsx`
    - Define steps data array with numbers, icons, titles, descriptions
    - Implement step-by-step visual layout
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 5.2 Write property test for steps rendering
    - **Property 2: Steps render with required elements**
    - **Validates: Requirements 4.3**

- [x] 6. Implement Who It's For section
  - [x] 6.1 Create WhoItsForSection component
    - Create `src/components/landing/WhoItsForSection.tsx`
    - Define user types data for TVET and ADOF
    - Implement user type cards with descriptions and benefits
    - Add CTA buttons that open auth modal
    - _Requirements: 5.1, 5.2, 5.3_
  - [x] 6.2 Write property test for user type cards
    - **Property 3: User type cards contain required information**
    - **Validates: Requirements 5.2**

- [x] 7. Implement Testimonials section
  - [x] 7.1 Create TestimonialsSection component
    - Create `src/components/landing/TestimonialsSection.tsx`
    - Define testimonials data with quotes, names, roles
    - Define statistics data with values and labels
    - Implement testimonial cards and statistics display
    - _Requirements: 6.1, 6.2, 6.3_
  - [x] 7.2 Write property test for testimonial cards
    - **Property 4: Testimonials render with required fields**
    - **Validates: Requirements 6.2**

- [x] 8. Implement CTA and Footer sections
  - [x] 8.1 Create CTASection component
    - Create `src/components/landing/CTASection.tsx`
    - Add compelling message and "Get Started Free" button
    - _Requirements: 7.1, 7.2, 7.3_
  - [x] 8.2 Create Footer component
    - Create `src/components/landing/Footer.tsx`
    - Define footer link groups (Product, Company, Legal)
    - Implement logo, description, and copyright
    - _Requirements: 8.1, 8.2, 8.3_
  - [x] 8.3 Write property test for footer link grouping
    - **Property 5: Footer links are grouped by category**
    - **Validates: Requirements 8.2**

- [x] 9. Integrate landing page with routing
  - [x] 9.1 Update Index page to show LandingPage for unauthenticated users
    - Modify `src/pages/Index.tsx` to render LandingPage instead of AuthForm
    - Ensure authenticated users still redirect to appropriate dashboards
    - _Requirements: 9.2_
  - [x] 9.2 Create barrel export for landing components
    - Create `src/components/landing/index.ts` with all exports
    - _Requirements: N/A (code organization)_

- [x] 10. Final polish and responsive adjustments
  - [x] 10.1 Ensure all sections are responsive
    - Test and adjust layouts for mobile, tablet, and desktop
    - Verify hamburger menu works correctly on mobile
    - _Requirements: 10.1, 10.2, 10.3_
  - [x] 10.2 Add smooth scroll behavior and section IDs
    - Add id attributes to all sections for navigation
    - Implement smooth scroll CSS/JS behavior
    - _Requirements: 1.2, 2.5_

- [x] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Write unit tests for landing page components
  - [x] 12.1 Write unit tests for LandingPage and AuthModal
    - Test modal open/close behavior
    - Test mode switching
    - _Requirements: 1.3, 1.4, 9.1, 9.4_
  - [x] 12.2 Write unit tests for Navbar
    - Test navigation link rendering
    - Test button click handlers
    - _Requirements: 1.1, 1.2_

- [x] 13. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
