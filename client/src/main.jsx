import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { BookingProvider } from './context/BookingContext.jsx' // 1. Import the BookingProvider

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>  
      {/* 2. Wrap App inside the BookingProvider */}
      <BookingProvider>
        <App />
      </BookingProvider>
    </AuthProvider>
  </StrictMode>
)