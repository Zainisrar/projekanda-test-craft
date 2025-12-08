import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AuthModal } from '../AuthModal';
import { AuthProvider } from '@/contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// Mock the API
vi.mock('@/lib/api', () => ({
  api: {
    signin: vi.fn(),
    signup: vi.fn(),
  },
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{ui}</AuthProvider>
    </BrowserRouter>
  );
};

describe('AuthModal Unit Tests', () => {
  describe('Modal open/close behavior', () => {
    it('should render when isOpen is true', () => {
      const mockOnClose = vi.fn();
      const mockOnModeChange = vi.fn();

      renderWithProviders(
        <AuthModal
          isOpen={true}
          mode="signin"
          onClose={mockOnClose}
          onModeChange={mockOnModeChange}
        />
      );

      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });

    it('should not render content when isOpen is false', () => {
      const mockOnClose = vi.fn();
      const mockOnModeChange = vi.fn();

      renderWithProviders(
        <AuthModal
          isOpen={false}
          mode="signin"
          onClose={mockOnClose}
          onModeChange={mockOnModeChange}
        />
      );

      expect(screen.queryByText('Welcome Back')).not.toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
      const mockOnClose = vi.fn();
      const mockOnModeChange = vi.fn();

      renderWithProviders(
        <AuthModal
          isOpen={true}
          mode="signin"
          onClose={mockOnClose}
          onModeChange={mockOnModeChange}
        />
      );

      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Mode switching', () => {
    it('should display signin form when mode is signin', () => {
      const mockOnClose = vi.fn();
      const mockOnModeChange = vi.fn();

      renderWithProviders(
        <AuthModal
          isOpen={true}
          mode="signin"
          onClose={mockOnClose}
          onModeChange={mockOnModeChange}
        />
      );

      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      // Check for Sign In button (there may be multiple)
      expect(screen.getAllByText('Sign In').length).toBeGreaterThanOrEqual(1);
      // Full Name field should not exist in signin mode
      expect(screen.queryByLabelText('Full Name')).not.toBeInTheDocument();
    });

    it('should display signup form when mode is signup', () => {
      const mockOnClose = vi.fn();
      const mockOnModeChange = vi.fn();

      renderWithProviders(
        <AuthModal
          isOpen={true}
          mode="signup"
          onClose={mockOnClose}
          onModeChange={mockOnModeChange}
        />
      );

      // Check for Create Account text (may appear multiple times)
      expect(screen.getAllByText('Create Account').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    });

    it('should call onModeChange when toggle link is clicked', () => {
      const mockOnClose = vi.fn();
      const mockOnModeChange = vi.fn();

      renderWithProviders(
        <AuthModal
          isOpen={true}
          mode="signin"
          onClose={mockOnClose}
          onModeChange={mockOnModeChange}
        />
      );

      const toggleLink = screen.getByText('Sign up');
      fireEvent.click(toggleLink);

      expect(mockOnModeChange).toHaveBeenCalledWith('signup');
    });
  });
});
