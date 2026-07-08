import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import './Login.css';

const Login = () => {
  // We store the user's phone number and password.
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  // This function is called when the user submits the form
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the default browser refresh on submit
    
    // Simple validation
    if (!phone || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      // We now use our dedicated api.js module! This makes the component much cleaner.
      const data = await authApi.login(phone, password);

      // We successfully got the token! 
      // You can store it in localStorage so the user stays logged in
      localStorage.setItem('access_token', data.access_token);
      setSuccessMessage(`Login successful! Taking you to the dashboard...`);
      
      // Clear the form fields!
      setPhone('');
      setPassword('');
      
      // Redirect after a short delay so the user sees the success message
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-glass-card">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Please enter your details to sign in.</p>
        
        {/* If there's an error, we show this div */}
        {error && <div className="login-error">{error}</div>}
        {successMessage && <div className="login-success">{successMessage}</div>}
        
        {/* Our login form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="phone">Phone Number</label>
            <input 
              type="tel" 
              id="phone" 
              placeholder="Enter your phone number"
              value={phone}
              // When the user types, update the phone state
              onChange={(e) => setPhone(e.target.value)} 
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              placeholder="••••••••"
              value={password}
              // When the user types, update the password state
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          
          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" /> Remember me
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>
          
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="login-footer">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

// Export the component so it can be used in other files (like App.jsx)
export default Login;
