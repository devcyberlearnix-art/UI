// src/components/ProfilePhotoUpload.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import authApi from '../api/authApi';

const ProfilePhotoUpload = () => {
  const { user, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(user?.profilePhoto || null);
  const [error, setError] = useState(null);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    setError(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('photo', file);

      // Call the API
      const response = await authApi.uploadProfilePhoto(formData);
      
      console.log('Upload response:', response);

      // Extract photo URL from response
      const photoUrl = response?.data?.photoUrl || 
                       response?.data?.url || 
                       response?.data?.photo ||
                       response?.data?.data?.photoUrl ||
                       response?.data?.data?.url ||
                       response?.photoUrl ||
                       response?.url ||
                       '';

      if (photoUrl) {
        // Update user in context and localStorage
        if (updateUser && typeof updateUser === 'function') {
          updateUser({ profilePhoto: photoUrl });
        } else {
          // Fallback: manually update
          const updatedUser = { ...user, profilePhoto: photoUrl };
          localStorage.setItem('lms_user', JSON.stringify(updatedUser));
          // Try to update using setUser if available
          const { setUser } = useAuth();
          if (setUser) setUser(updatedUser);
        }
        
        alert('Photo updated successfully!');
      } else {
        setError('Failed to get photo URL from response');
        console.error('Response structure:', response);
      }
    } catch (error) {
      console.error('Photo upload failed:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else if (error.response?.status === 413) {
        setError('File too large. Maximum size is 5MB.');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
        console.error('Server error details:', error.response?.data);
      } else {
        setError(error.response?.data?.message || 'Failed to upload photo');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {preview ? (
          <img
            src={preview}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-2 border-orange-300 shadow-lg"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
            <span className="text-4xl text-gray-400">👤</span>
          </div>
        )}
        
        <label className="absolute bottom-0 right-0 bg-orange-500 rounded-full p-2 cursor-pointer hover:bg-orange-600 transition-all duration-200 shadow-lg hover:shadow-orange-500/30">
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handlePhotoUpload}
            disabled={uploading}
          />
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </label>
      </div>

      {uploading && (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
          <span className="text-sm text-gray-500">Uploading...</span>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg max-w-xs text-center">
          {error}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center max-w-xs">
        Click the camera icon to upload a new photo.<br />
        Supported: JPG, PNG, GIF, WebP (Max 5MB)
      </p>
    </div>
  );
};

export default ProfilePhotoUpload;