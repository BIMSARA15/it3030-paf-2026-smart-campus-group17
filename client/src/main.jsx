import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { BookingProvider } from './context/BookingContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx';

// 1. 👇 Import axios here
import axios from 'axios';

// 2. 👇 Add this global rule! Now EVERY axios request in your app will send cookies.
axios.defaults.withCredentials = true; 
// (Optional but helpful: set your base URL so you don't have to type localhost:8080 everywhere)
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>  
      <NotificationProvider>
      <BookingProvider>
        <App />
      </BookingProvider>
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>
)