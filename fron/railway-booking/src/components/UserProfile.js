import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './UserProfile.css';

const UserProfile = ({ user, setUser }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user && user.id) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        currentPassword: '',
        newPassword: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Basic validation
    if (!user?.id) {
      setError('User not loaded');
      setIsLoading(false);
      return;
    }

    try {
      // Prepare payload - only send changed fields
      const payload = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone
      };

      // Only include password fields if they're being changed
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          setError('Current password is required to change password');
          setIsLoading(false);
          return;
        }
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update user context and local storage
      const updatedUser = { ...user, ...data.user };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      // Clear password fields after successful update
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: ''
      }));
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.message || 'An error occurred while updating your profile');
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <motion.div
      className="profile-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="profile-card">
        <h1>User Profile</h1>
        
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError('')} className="close-error">
              &times;
            </button>
          </div>
        )}
        
        {success && (
          <div className="success-message">
            {success}
            <button onClick={() => setSuccess('')} className="close-success">
              &times;
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          
          {isEditing && (
            <>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Required to make changes"
                />
              </div>
              
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current password"
                />
                {formData.newPassword && (
                  <small className="password-hint">
                    Password must be at least 8 characters long
                  </small>
                )}
              </div>
            </>
          )}
          
          <div className="profile-actions">
            {isEditing ? (
              <>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => {
                    setIsEditing(false);
                    setError('');
                    setSuccess('');
                    // Reset form to original user data
                    if (user) {
                      setFormData({
                        username: user.username,
                        email: user.email,
                        phone: user.phone || '',
                        currentPassword: '',
                        newPassword: ''
                      });
                    }
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default UserProfile;