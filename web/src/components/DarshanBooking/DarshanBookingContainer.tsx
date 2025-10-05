import React from 'react';
import { DarshanBooking } from './DarshanBooking';
import { AuthProvider } from '@/contexts/AuthContext';
import { Booking, BookingError } from '@/types/booking';

/**
 * Container component that provides authentication context to DarshanBooking
 * This demonstrates proper integration with the authentication system
 */
interface DarshanBookingContainerProps {
  onBookingComplete?: (booking: Booking) => void;
  onError?: (error: BookingError) => void;
  onAuthRequired?: () => void;
  className?: string;
}

export const DarshanBookingContainer: React.FC<DarshanBookingContainerProps> = ({
  onBookingComplete,
  onError,
  onAuthRequired,
  className
}) => {
  return (
    <AuthProvider>
      <DarshanBooking
        onBookingComplete={onBookingComplete}
        onError={onError}
        onAuthRequired={onAuthRequired}
        className={className}
      />
    </AuthProvider>
  );
};

/**
 * Standalone component that can be used when AuthProvider is already available in the app
 */
export const DarshanBookingStandalone: React.FC<DarshanBookingContainerProps> = (props) => {
  return <DarshanBooking {...props} />;
};

export default DarshanBookingContainer;