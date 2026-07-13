import React, { useState, useEffect, useRef } from 'react';
import { authApi } from '../../services/api';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const fetchProfile = async () => {
    try {
      const data = await authApi.getMe();
      setUser(data);
      setFullName(data.full_name || '');
      setWhatsappNumber(data.whatsapp_number || '');
    } catch (err) {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const updated = await authApi.updateProfile({ 
        full_name: fullName,
        whatsapp_number: whatsappNumber 
      });
      setUser(updated);
      setMessage('Profile updated successfully!');
      
      // Update global avatar event
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMessage('');
    setError('');
    try {
      setSaving(true);
      const res = await authApi.uploadProfilePicture(file);
      setUser(prev => ({ ...prev, profile_picture_url: res.profile_picture_url }));
      setMessage('Profile picture updated successfully!');
      
      // Update global avatar event
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err) {
      setError(err.message || 'Failed to upload profile picture.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteImage = async () => {
    setMessage('');
    setError('');
    try {
      setSaving(true);
      await authApi.deleteProfilePicture();
      setUser(prev => ({ ...prev, profile_picture_url: null }));
      setMessage('Profile picture deleted successfully!');
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err) {
      setError(err.message || 'Failed to delete profile picture.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  // We need to use import.meta.env to build the correct API url for images
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8050';
  const avatarUrl = user?.profile_picture_url 
    ? (user.profile_picture_url.startsWith('http') ? user.profile_picture_url : `${API_BASE_URL}${user.profile_picture_url}`)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&background=38bdf8&color=fff&rounded=true&bold=true&size=128`;

  return (
    <div className="profile-container fade-in">
      <div className="profile-header">
        <h1>Profile Settings</h1>
        <p>Manage your account details and profile picture.</p>
      </div>

      <div className="profile-card glass-panel">
        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}

        <div className="profile-picture-section">
          <div className="profile-picture-wrapper" onClick={handleImageClick}>
            <img src={avatarUrl} alt="Profile" className="profile-picture-lg" />
            <div className="profile-picture-overlay">
              <span>✏️ Edit</span>
            </div>
          </div>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }}
          />
          <div className="profile-picture-info">
            <h3>Profile Picture</h3>
            <p>Click the image to upload a new picture (JPG, PNG).</p>
            {user?.profile_picture_url && (
              <button 
                type="button" 
                onClick={handleDeleteImage} 
                className="delete-picture-btn"
                disabled={saving}
              >
                🗑️ Delete Picture
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="profile-form">
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={user?.email || ''} disabled className="input-disabled" />
            <span className="input-hint">Your email address is managed by Google and cannot be changed here.</span>
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              placeholder="Enter your full name" 
              required 
            />
          </div>

          <div className="form-group">
            <label>WhatsApp Number (Optional)</label>
            <input 
              type="tel" 
              value={whatsappNumber} 
              onChange={(e) => setWhatsappNumber(e.target.value)} 
              placeholder="+88017XXXXXXXX" 
              pattern="^\+[1-9]\d{1,14}$"
              title="Must include country code starting with + and contain only numbers."
            />
            <span className="input-hint">Add your WhatsApp number with country code (e.g. +880...) to receive daily practice reminders.</span>
          </div>
          
          <div className="form-group">
            <label>Subscription Plan</label>
            <input type="text" value={user?.subscription_plan || 'free'} disabled className="input-disabled" style={{ textTransform: 'capitalize' }} />
          </div>

          <button type="submit" className="save-btn" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
