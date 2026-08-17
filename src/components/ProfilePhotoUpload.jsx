// components/ProfilePhotoUpload.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import authApi from '../api/authApi';

const ProfilePhotoUpload = () => {
  const { user, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(user?.profilePhoto || null);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const response = await authApi.uploadProfilePhoto(file);
      const photoUrl = response?.data?.photoUrl || response?.data?.url || '';
      
      // Update user in context and localStorage
      const updatedUser = { ...user, profilePhoto: photoUrl };
      updateUser(updatedUser);
      
      alert('Photo updated successfully!');
    } catch (error) {
      console.error('Photo upload failed:', error);
      alert('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        {preview ? (
          <img
            src={preview}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border-2 border-orange-300"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-3xl text-gray-400">👤</span>
          </div>
        )}
        <label className="absolute bottom-0 right-0 bg-orange-500 rounded-full p-1.5 cursor-pointer hover:bg-orange-600 transition">
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handlePhotoUpload}
            disabled={uploading}
          />
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </label>
      </div>
      {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
    </div>
  );
};

export default ProfilePhotoUpload;