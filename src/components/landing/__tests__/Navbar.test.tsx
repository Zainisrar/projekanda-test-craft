import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Navbar } from '../Navbar';

describe('Navbar Unit Tests', () => {
  describe('Navigation link rendering', () => {
    it('should render all navigation links', () => {
      const mockOnSignIn = vi.fn();
      const mockOnSignUp = vi.fn();

      render(<Navbar onSignIn={mockOnSignIn} onSignUp={mockOnSignUp} />);

      // Use getAllByText since links appear in both desktop and mobile menus
      expect(screen.getAllByText('Features').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('How It Works').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Who It's For").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Testimonials').length).toBeGreaterThanOrEqual(1);
    });

    it('should render the logo', () => {
      const mockOnSignIn = vi.fn();
      const mockOnSignUp = vi.fn();

      render(<Navbar onSignIn={mockOnSignIn} onSignUp={mockOnSignUp} />);

      expect(screen.getByText('Fit Finder')).toBeInTheDocument();
    });

    it('should render Sign In and Sign Up buttons', () => {
      const mockOnSignIn = vi.fn();
      const mockOnSignUp = vi.fn();

      render(<Navbar onSignIn={mockOnSignIn} onSignUp={mockOnSignUp} />);

      // Desktop and mobile buttons
      const signInButtons = screen.getAllByText('Sign In');
      const signUpButtons = screen.getAllByText('Sign Up');

      expect(signInButtons.length).toBeGreaterThanOrEqual(1);
      expect(signUpButtons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Button click handlers', () => {
    it('should call onSignIn when Sign In button is clicked', () => {
      const mockOnSignIn = vi.fn();
      const mockOnSignUp = vi.fn();

      render(<Navbar onSignIn={mockOnSignIn} onSignUp={mockOnSignUp} />);

      // Click the first Sign In button (desktop)
      const signInButtons = screen.getAllByText('Sign In');
      fireEvent.click(signInButtons[0]);

      expect(mockOnSignIn).toHaveBeenCalled();
    });

    it('should call onSignUp when Sign Up button is clicked', () => {
      const mockOnSignIn = vi.fn();
      const mockOnSignUp = vi.fn();

      render(<Navbar onSignIn={mockOnSignIn} onSignUp={mockOnSignUp} />);

      // Click the first Sign Up button (desktop)
      const signUpButtons = screen.getAllByText('Sign Up');
      fireEvent.click(signUpButtons[0]);

      expect(mockOnSignUp).toHaveBeenCalled();
    });
  });

  describe('Mobile menu', () => {
    it('should render mobile menu toggle button', () => {
      const mockOnSignIn = vi.fn();
      const mockOnSignUp = vi.fn();

      render(<Navbar onSignIn={mockOnSignIn} onSignUp={mockOnSignUp} />);

      const menuButton = screen.getByLabelText('Open menu');
      expect(menuButton).toBeInTheDocument();
    });

    it('should toggle mobile menu when button is clicked', () => {
      const mockOnSignIn = vi.fn();
      const mockOnSignUp = vi.fn();

      render(<Navbar onSignIn={mockOnSignIn} onSignUp={mockOnSignUp} />);

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      // After clicking, the button should now say "Close menu"
      expect(screen.getByLabelText('Close menu')).toBeInTheDocument();
    });
  });
});
