import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { authApi } from '../services/api';
import './Login.css';

const Login = () => {
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
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
      <div className="login-glass-card">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Sign in to your account to continue.</p>
        
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
