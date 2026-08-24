// ProfilePhotoUpload.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';

const ProfilePhotoUpload = ({ onUploadSuccess }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setError('');
    setSuccess('');

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('[ProfilePhoto] User not authenticated - storing photo for later upload');
      
      // Store photo data temporarily
      const reader = new FileReader();
      reader.onload = (e) => {
        sessionStorage.setItem('pendingProfilePhoto', e.target.result);
        setSuccess('Photo will be uploaded after login');
        
        // Redirect to login
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Please login to upload your profile photo' 
            } 
          });
        }, 1500);
      };
      reader.readAsDataURL(selectedFile);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('profilePhoto', selectedFile);

      console.log('[ProfilePhoto] Uploading profile photo');
      const response = await authApi.uploadProfilePhoto(formData);
      console.log('[ProfilePhoto] Upload successful:', response);

      setSuccess('Profile photo uploaded successfully!');
      
      // Clear pending photo
      sessionStorage.removeItem('pendingProfilePhoto');
      
      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(response);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSelectedFile(null);
      
    } catch (error) {
      console.error('[ProfilePhoto] Upload failed:', error);
      
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        authApi.logout();
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(error.response?.data?.message || 'Upload failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError('');
    setSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="profile-photo-upload">
      <h3>Profile Photo</h3>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="upload-area">
        {previewUrl ? (
          <div className="preview-container">
            <img src={previewUrl} alt="Profile preview" className="preview-image" />
            <button 
              onClick={handleRemovePhoto}
              className="remove-btn"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="upload-placeholder">
            <p>Click to select a profile photo</p>
            <p className="hint">JPEG, PNG, GIF, WEBP (max 5MB)</p>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="file-input"
          style={{ display: 'none' }}
        />
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="select-btn"
          disabled={loading}
        >
          Select Photo
        </button>
      </div>

      {selectedFile && (
        <button 
          onClick={handleUpload}
          className="upload-btn"
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload Photo'}
        </button>
      )}
    </div>
  );
};

export default ProfilePhotoUpload;