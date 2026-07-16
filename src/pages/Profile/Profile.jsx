import React, { useState, useEffect, useRef } from 'react';
import { authApi } from '../../services/api';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [botNumber, setBotNumber] = useState('');
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
        full_name: fullName
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

  const handleRequestOtp = async () => {
    setMessage('');
    setError('');
    setSaving(true);
    try {
      const res = await authApi.generateWhatsappLink();
      setVerifyCode(res.verify_code);
      setBotNumber(res.bot_number);
      setShowOtpInput(true);
      setMessage('Almost done! Click the button below to verify your number.');
    } catch (err) {
      setError(err.message || 'Failed to start verification.');
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyOtp = async () => {
    // Legacy: we keep this if needed, but in magic link flow they just refresh or we check status.
    setMessage('');
    setError('');
    setSaving(true);
    try {
      // In a real flow, you could poll the backend to see if it was verified.
      // For now, we just fetch profile again to see if it changed.
      await fetchProfile();
      setShowOtpInput(false);
      setMessage('Checked verification status!');
    } catch (err) {
      setError(err.message || 'Failed to check status.');
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
            <label>WhatsApp Account</label>
            {!user?.whatsapp_number ? (
              <div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>No WhatsApp account linked.</p>
                <button 
                  type="button" 
                  onClick={handleRequestOtp} 
                  disabled={saving}
                  className="btn-primary"
                >
                  Link WhatsApp Account
                </button>
              </div>
            ) : (
              <div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  {user.whatsapp_number} 
                </p>
                <button 
                  type="button" 
                  onClick={handleRequestOtp} 
                  disabled={saving}
                  className="btn-secondary"
                >
                  Change WhatsApp Account
                </button>
              </div>
            )}
          </div>

          {showOtpInput && (
            <div className="form-group fade-in" style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--primary-color)' }}>
              <label style={{ color: 'var(--primary-color)' }}>Complete Verification</label>
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                To securely verify your number without manually typing codes, just send a quick message to our bot on WhatsApp!
              </p>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <a 
                  href={`https://api.whatsapp.com/send?phone=${botNumber}&text=${verifyCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    padding: '0.8rem 1.5rem', 
                    background: '#25D366', 
                    color: 'white', 
                    borderRadius: '8px', 
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Verify via WhatsApp
                </a>
                <button 
                  type="button" 
                  onClick={handleVerifyOtp} 
                  disabled={saving} 
                  style={{ padding: '0.8rem 1.5rem', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}
                >
                  I have sent the message
                </button>
              </div>
            </div>
          )}
          
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
