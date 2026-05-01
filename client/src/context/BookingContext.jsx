import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const BookingContext = createContext();
const API_BASE_URL = 'http://localhost:8080';

const normalizeResourceType = (type) => {
  if (type === 'Lab') return 'lab';
  return 'room';
};

const normalizeResource = (resource) => ({
  ...resource,
  name: resource.resourceName,
  location: `Block ${resource.block}, Level ${resource.level}`,
  type: normalizeResourceType(resource.type),
  resourceType: resource.type,
  features: Array.isArray(resource.features) ? resource.features : [],
  description: resource.description || '',
  resourceCode: resource.resourceCode || '',
  status: resource.status || 'Available',
  utilityIds: Array.isArray(resource.utilityIds) ? resource.utilityIds : [],
});

const normalizeUtility = (utility) => ({
  ...utility,
  utilityCode: utility.utilityCode || '',
  utilityName: utility.utilityName || '',
  category: utility.category || '',
  quantity: utility.quantity || 0,
  status: utility.status || 'Available',
  location: utility.location || '',
  description: utility.description || '',
});

export const useBooking = () => useContext(BookingContext);

export const BookingProvider = ({ children }) => {
  const { user } = useAuth();
  
  // 1. Initialize state from localStorage (loads saved data on refresh)
  const [bookings, setBookings] = useState(() => {
    const savedBookings = localStorage.getItem('smart_campus_bookings');
    if (savedBookings) {
      return JSON.parse(savedBookings);
    }
    return [];
  });

  // 2. Save to localStorage every time the bookings array changes
  useEffect(() => {
    localStorage.setItem('smart_campus_bookings', JSON.stringify(bookings));
  }, [bookings]);

  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [resourcesError, setResourcesError] = useState('');
  const [utilities, setUtilities] = useState([]);
  const [utilitiesLoading, setUtilitiesLoading] = useState(false);
  const [utilitiesError, setUtilitiesError] = useState('');

  const fetchResources = async () => {
    setResourcesLoading(true);
    setResourcesError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/resources`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch resources: ${response.status}`);
      }

      const data = await response.json();
      setResources(Array.isArray(data) ? data.map(normalizeResource) : []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setResourcesError('Failed to load resources.');
      setResources([]);
    } finally {
      setResourcesLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchUtilities = async () => {
    setUtilitiesLoading(true);
    setUtilitiesError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/utilities`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch utilities: ${response.status}`);
      }

      const data = await response.json();
      setUtilities(Array.isArray(data) ? data.map(normalizeUtility) : []);
    } catch (error) {
      console.error('Error fetching utilities:', error);
      setUtilitiesError('Failed to load utilities.');
      setUtilities([]);
    } finally {
      setUtilitiesLoading(false);
    }
  };

  useEffect(() => {
    fetchUtilities();
  }, []);

  // FETCH REAL BOOKINGS FROM THE DATABASE
  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache' // Prevents using stale cached data
        },
        credentials: 'include', // Allows Spring Security to verify the session
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.status}`);
      }

      const data = await response.json();
      
      // Overwrite the local storage data with the REAL database data
      setBookings(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error('Error fetching bookings from database:', error);
    }
  };

  // Run this function automatically when the app loads
  useEffect(() => {
    fetchBookings();

  // Set up an interval to fetch fresh data every 5 seconds (5000 milliseconds)
  const intervalId = setInterval(() => {
      fetchBookings();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Fetch bookings using the Email Query Parameter
  const fetchUserBookings = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/search?email=${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user bookings: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
      
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return [];
    }
  };

  
  const getResourceById = (id) => resources.find(r => r.id === id);
  const getUtilityById = (id) => utilities.find(u => u.id === id);
  const getUtilitiesForResource = (resourceId) => {
    const resource = getResourceById(resourceId);
    if (!resource) return [];
    return resource.utilityIds
      .map((utilityId) => getUtilityById(utilityId))
      .filter(Boolean);
  };

  const checkConflict = (resourceId, date, startTime, endTime) => {
    return bookings.find(b =>
      b.resourceId === resourceId &&
      b.date === date &&
      b.status === 'APPROVED' &&
      ((startTime >= b.startTime && startTime < b.endTime) ||
       (endTime > b.startTime && endTime <= b.endTime))
    ) || null;
  };

const createBooking = async (bookingData) => {
    try {
      // 1. Send the actual POST request to your Spring Boot backend
      const response = await fetch('http://localhost:8080/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // CRITICAL for Spring Security
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to save booking to database');
      }

      // 2. Get the saved booking back from Spring Boot (now with a real MongoDB ID)
      const savedBooking = await response.json();
      
      // 3. Update the React UI state
      setBookings((current) => [...current, savedBooking]);
      
      return { success: true, message: 'Booking request submitted successfully.', booking: savedBooking };
      
    } catch (error) {
      console.error("Error creating booking:", error);
      return { success: false, message: error.message || 'Failed to connect to the server.' };
    }
  };

  const updateBooking = async (id, updatedData) => {
    try {
      // Use standard fetch instead of the undefined 'api' variable
      const response = await fetch(`http://localhost:8080/api/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Needed for Spring Security
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking in database');
      }

      // Get the updated booking back from Spring Boot
      const updatedBooking = await response.json();

      // Update the local state so the UI changes immediately
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          String(booking.id) === String(id) ? updatedBooking : booking
        )
      );

      return { success: true, message: 'Booking updated successfully!', booking: updatedBooking };
    } catch (error) {
      console.error('Error updating booking:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to update booking. Please try again.' 
      };
    }
  };

  const cancelBooking = async (id, reason) => { // <-- Added 'reason' here!
    try {
      const response = await fetch(`http://localhost:8080/api/bookings/${id}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'CANCELLED',
          cancellationReason: reason // Now it knows what 'reason' is!
        }),
      });


      if (!response.ok) {
        throw new Error('Failed to cancel booking in database');
      }

      const updatedBooking = await response.json();

      setBookings(prevBookings => 
        prevBookings.map(b => 
          b.id === id ? updatedBooking : b
        )
      );
    } catch (error) {
      console.error("Error cancelling booking:", error);
    }
  };

  const approveBooking = async (id, adminNote) => {
    try {
      // 1. Send the PUT request to Spring Boot
      const response = await fetch(`http://localhost:8080/api/bookings/${id}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'APPROVED',
          adminNote: adminNote,
          reviewedBy: user?.name || 'Admin' // Sends the admin's name
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update database');
      }

      // 2. Get the updated booking back from the database
      const updatedBooking = await response.json();

      // 3. Update the React UI so the admin sees the change immediately
      setBookings(prevBookings => 
        prevBookings.map(b => (b.id === id ? updatedBooking : b))
      );
    } catch (error) {
      console.error("Error approving booking:", error);
    }
  };

  const rejectBooking = async (id, rejectionReason) => {
    try {
      // 1. Send the PUT request to Spring Boot
      const response = await fetch(`http://localhost:8080/api/bookings/${id}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'REJECTED',
          rejectionReason: rejectionReason,
          reviewedBy: user?.name || 'Admin'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update database');
      }

      const updatedBooking = await response.json();

      // 2. Update the React UI
      setBookings(prevBookings => 
        prevBookings.map(b => (b.id === id ? updatedBooking : b))
      );
    } catch (error) {
      console.error("Error rejecting booking:", error);
    }
  };

  const approveBookingByLecturer = async (id, adminNote) => {
    try {
      const response = await fetch(`http://localhost:8080/api/bookings/${id}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'PENDING',
          adminNote,
          reviewedBy: user?.name || 'Lecturer'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update database');
      }

      const updatedBooking = await response.json();
      setBookings(prevBookings =>
        prevBookings.map(b => (b.id === id ? updatedBooking : b))
      );

      return { success: true, booking: updatedBooking };
    } catch (error) {
      console.error('Error approving booking as lecturer:', error);
      return { success: false, message: error.message || 'Failed to update database' };
    }
  };

  const rejectBookingByLecturer = async (id, rejectionReason) => {
    try {
      const response = await fetch(`http://localhost:8080/api/bookings/${id}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'REJECTED',
          rejectionReason,
          reviewedBy: user?.name || 'Lecturer'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update database');
      }

      const updatedBooking = await response.json();
      setBookings(prevBookings =>
        prevBookings.map(b => (b.id === id ? updatedBooking : b))
      );

      return { success: true, booking: updatedBooking };
    } catch (error) {
      console.error('Error rejecting booking as lecturer:', error);
      return { success: false, message: error.message || 'Failed to update database' };
    }
  };

  // Hard Delete a booking (Admin Only)
  const purgeBooking = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/bookings/${id}`, {
        method: 'DELETE', // Uses your new REST endpoint!
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete booking');
      }

      // Remove the booking from the React state so it disappears from the screen
      setBookings(prevBookings => prevBookings.filter(b => b.id !== id));
      
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  };

  return (
    <BookingContext.Provider value={{ 
      resources, utilities, bookings, currentUser: user, 
      createBooking, checkConflict, getResourceById, updateBooking, cancelBooking,
      approveBooking, rejectBooking, fetchResources, resourcesLoading, resourcesError,
      fetchUtilities, utilitiesLoading, utilitiesError, getUtilityById, getUtilitiesForResource,
      approveBookingByLecturer, rejectBookingByLecturer,
      fetchUserBookings, purgeBooking
    }}>
      {children}
    </BookingContext.Provider>
  );
};
