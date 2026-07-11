import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { authApi } from '../services/api';
import './Login.css';

const Login = () => {
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      // Send the Google credential token to our backend
      const data = await authApi.loginWithGoogle(credentialResponse.credential);

      localStorage.setItem('access_token', data.access_token);
      setSuccessMessage(`Login successful! Taking you to the dashboard...`);
      
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In failed. Please try again.');
  };

  return (
    <div className="login-container">
      <button 
        onClick={toggleTheme} 
        style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', zIndex: 10 }}
      >
        {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>

      <div className="login-glass-card">
        <div className="brand-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 className="brand-title" style={{ fontSize: '2.5rem', margin: '0 0 8px 0', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800' }}>
            b4interview
          </h1>
          <h2 className="brand-tagline" style={{ fontSize: '1.2rem', margin: '0 0 16px 0', color: 'var(--text-primary)', fontWeight: '600' }}>
            Land Your Dream Job with AI
          </h2>
          <p className="brand-slogan" style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 24px 0' }}>
            Upload your CV. Get grilled by our AI recruiter.<br/>Walk into your real interview with unbreakable confidence.
          </p>

          <div className="features-grid" style={{
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px',
            textAlign: 'left',
            background: 'rgba(0,0,0,0.2)',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid var(--glass-border)',
            marginBottom: '24px'
          }}>
            <div className="feature-item" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '1.5rem', background: 'var(--bg-surface)', padding: '8px', borderRadius: '12px' }}>📄</div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>Hyper-Personalized Prep</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>We instantly analyze your uploaded CV to generate brutal, highly-specific questions that real hiring managers would ask.</p>
              </div>
            </div>
            
            <div className="feature-item" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '1.5rem', background: 'var(--bg-surface)', padding: '8px', borderRadius: '12px' }}>🎙️</div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>Live Interview Simulation</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Face off against an adaptive AI that dynamically adjusts the difficulty based on your answers in real-time.</p>
              </div>
            </div>
            
            <div className="feature-item" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '1.5rem', background: 'var(--bg-surface)', padding: '8px', borderRadius: '12px' }}>📈</div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>Actionable Feedback</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Get a detailed scorecard highlighting your blind spots, complete with "perfect answer" suggestions to ace the real deal.</p>
              </div>
            </div>
          </div>
        </div>
        
        {error && <div className="login-error">{error}</div>}
        {successMessage && <div className="login-success">{successMessage}</div>}

        <div className="google-auth-wrapper" style={{ display: 'flex', justifyContent: 'center', margin: '32px 0' }}>
          {isLoading ? (
            <div style={{ color: 'var(--text-secondary)' }}>Authenticating...</div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_blue"
              shape="rectangular"
              size="large"
              text="signin_with"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
