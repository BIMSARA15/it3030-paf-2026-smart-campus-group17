import React from 'react';
import { useAuth } from '../context/AuthContext';
import heroImage from '../assets/hero.png'; // Using your existing asset

const Landing = () => {
  const { login } = useAuth();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Smart Campus Operations Hub</h1>
        <p style={styles.subtitle}>
          Manage facility bookings, report maintenance issues, and streamline campus operations all in one place.
        </p>
        
        <button onClick={login} style={styles.loginButton}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" 
            alt="Google Logo" 
            style={styles.googleIcon} 
          />
          Sign in with Google
        </button>
      </div>
      
      <div style={styles.imageContainer}>
        <img src={heroImage} alt="Smart Campus Hero" style={styles.heroImage} />
      </div>
    </div>
  );
};

// Basic inline styles to get you started (you can move this to CSS/Tailwind later)
const styles = {
  container: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '50px', minHeight: '100vh', backgroundColor: '#f8f9fa' },
  content: { flex: 1, paddingRight: '40px' },
  title: { fontSize: '3rem', color: '#2c3e50', marginBottom: '20px' },
  subtitle: { fontSize: '1.2rem', color: '#546e7a', lineHeight: '1.6', marginBottom: '40px' },
  loginButton: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', fontSize: '1.1rem', backgroundColor: '#fff', color: '#333', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontWeight: 'bold' },
  googleIcon: { width: '20px', height: '20px' },
  imageContainer: { flex: 1, display: 'flex', justifyContent: 'center' },
  heroImage: { maxWidth: '100%', height: 'auto', borderRadius: '12px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }
};

export default Landing;