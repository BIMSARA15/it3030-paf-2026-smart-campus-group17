import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const BookingContext = createContext();

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

  // Mock resources matching your screenshot
  const resources = [
    { id: '1', name: 'Lecture Hall A', type: 'room', location: 'Block A, Level 1', capacity: 200, features: ['Projector', 'Audio System', 'Air Conditioning'] },
    { id: '2', name: 'Lecture Hall B', type: 'room', location: 'Block A, Level 2', capacity: 150, features: ['Smart Board', 'Audio System', 'Air Conditioning'] },
    { id: '3', name: 'Conference Room 1', type: 'room', location: 'Block B, Level 3', capacity: 20, features: ['Video Conferencing', 'Projector', 'Whiteboard'] },
    { id: '4', name: 'Chemistry Lab', type: 'lab', location: 'Block C, Level 1', capacity: 40, features: ['Fume Hoods', 'Gas Lines', 'Safety Showers'] }
  ];

  const getResourceById = (id) => resources.find(r => r.id === id);

  const checkConflict = (resourceId, date, startTime, endTime) => {
    return bookings.find(b =>
      b.resourceId === resourceId &&
      b.date === date &&
      b.status === 'APPROVED' &&
      ((startTime >= b.startTime && startTime < b.endTime) ||
       (endTime > b.startTime && endTime <= b.endTime))
    ) || null;
  };

  const createBooking = (bookingData) => {
    const newBooking = {
      ...bookingData,
      id: Math.random().toString(36).substring(2, 9).toUpperCase(), 
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setBookings([...bookings, newBooking]);
    return { success: true, message: 'Booking request submitted successfully.' };
  };

  const cancelBooking = (id) => {
    setBookings(prevBookings => 
      prevBookings.map(b => 
        b.id === id 
          ? { ...b, status: 'CANCELLED', updatedAt: new Date().toISOString() } 
          : b
      )
    );
  };

  const approveBooking = (id, adminNote) => {
    setBookings(prevBookings => 
      prevBookings.map(b => 
        b.id === id 
          ? { ...b, status: 'APPROVED', adminNote, reviewedBy: user?.name, updatedAt: new Date().toISOString() } 
          : b
      )
    );
  };

  const rejectBooking = (id, rejectionReason) => {
    setBookings(prevBookings => 
      prevBookings.map(b => 
        b.id === id 
          ? { ...b, status: 'REJECTED', rejectionReason, reviewedBy: user?.name, updatedAt: new Date().toISOString() } 
          : b
      )
    );
  };

  return (
    <BookingContext.Provider value={{ 
      resources, bookings, currentUser: user, 
      createBooking, checkConflict, getResourceById, cancelBooking,
      approveBooking, rejectBooking 
    }}>
      {children}
    </BookingContext.Provider>
  );
};