import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import './SignUp.css';

const SignUp = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !phone || !password) {
      setError('Please fill in all fields to create your account.');
      return;
    }
    
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    
    try {
      // Connect to the backend /auth/register API using our api.js module!
      await authApi.register(phone, password);

      setSuccessMessage('Account created successfully! Redirecting to login...');
      
      // Clear the form fields!
      setName('');
      setPhone('');
      setPassword('');
      
      // Redirect to login page after 2 seconds so the user can read the message
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-glass-card">
        <h2 className="signup-title">Create Account</h2>
        <p className="signup-subtitle">Join us and start your journey today.</p>
        
        {error && <div className="signup-error">{error}</div>}
        {successMessage && <div className="signup-success">{successMessage}</div>}
        
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)} 
            />
          </div>

          <div className="input-group">
            <label htmlFor="phone">Phone Number</label>
            <input 
              type="tel" 
              id="phone" 
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)} 
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          
          <button type="submit" className="signup-button" disabled={isLoading}>
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
        
        <p className="signup-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
