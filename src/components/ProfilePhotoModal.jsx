// src/components/ProfilePhotoModal.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Upload, X, Loader2, AlertCircle,
  Video, VideoOff, RefreshCw, Check, Trash2,
  ArrowRight
} from 'lucide-react';
import Portal from './ui/Portal';
import toast from 'react-hot-toast';

const ProfilePhotoModal = ({ 
  isOpen, 
  onClose, 
  onUploadPhoto,
  onRemovePhoto,
  currentPhotoUrl 
}) => {
  const [mode, setMode] = useState(null); // 'upload' | 'camera' | 'remove' | null
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [removing, setRemoving] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isCameraSupported, setIsCameraSupported] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Refs to track current values for cleanup
  const previewUrlRef = useRef(null);
  const capturedImageRef = useRef(null);
  const cameraStreamRef = useRef(null);

  // Keep refs in sync with state
  useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);

  useEffect(() => {
    capturedImageRef.current = capturedImage;
  }, [capturedImage]);

  useEffect(() => {
    cameraStreamRef.current = cameraStream;
  }, [cameraStream]);

  // Cleanup function for resources only (not state reset)
  const cleanupResources = useCallback((urlToRevoke = null, streamToStop = null) => {
    // Revoke specific URL if provided
    if (urlToRevoke) {
      URL.revokeObjectURL(urlToRevoke);
    }

    // Stop specific stream if provided
    if (streamToStop) {
      streamToStop.getTracks().forEach(track => track.stop());
    }
  }, []);

  // Full reset function (resources + state)
  const resetModal = useCallback(() => {
    // Revoke current resources before resetting state
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    if (capturedImageRef.current) {
      URL.revokeObjectURL(capturedImageRef.current);
    }
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
    }

    // Reset all state
    setSelectedFile(null);
    setPreviewUrl(null);
    setCapturedImage(null);
    setCameraStream(null);
    setCameraReady(false);
    setError('');
    setMode(null);
    setShowRemoveConfirm(false);
    setUploadProgress(0);
  }, []);

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      resetModal();
    };
  }, [resetModal]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetModal();
    }
  }, [isOpen, resetModal]);

  // Check camera support on mount
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsCameraSupported(false);
    }
  }, []);

  // Handle mode change
  const handleModeChange = (newMode) => {
    // Don't call resetModal() for mode changes, only for reset
    // This preserves the mode state when switching between modes
    setError('');

    if (newMode === 'upload') {
      setMode('upload');
      setTimeout(() => fileInputRef.current?.click(), 100);
    } else if (newMode === 'camera') {
      setMode('camera');
      startCamera();
    } else if (newMode === 'remove') {
      setShowRemoveConfirm(true);
    } else {
      // Reset to initial state
      resetModal();
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      console.log('[ProfilePhotoModal] Starting camera...');
      setError('');
      setCameraReady(false);
      const constraints = {
        video: {
          facingMode: 'user', // Prefer front-facing camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      console.log('[ProfilePhotoModal] Requesting camera access with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('[ProfilePhotoModal] Camera stream obtained:', stream);
      setCameraStream(stream);

      // Use setTimeout to ensure the video ref is available after state update
      setTimeout(() => {
        console.log('[ProfilePhotoModal] Setting video srcObject, videoRef.current:', videoRef.current);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            console.log('[ProfilePhotoModal] Video metadata loaded');
            videoRef.current.play().then(() => {
              console.log('[ProfilePhotoModal] Video started playing successfully, setting cameraReady to true');
              setCameraReady(true);
            }).catch(err => {
              console.error('[ProfilePhotoModal] Video play error:', err);
            });
          };
        } else {
          console.error('[ProfilePhotoModal] videoRef.current is null when trying to set srcObject');
        }
      }, 0);
    } catch (err) {
      console.error('[ProfilePhotoModal] Camera error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission denied. Please allow camera access or use Upload Photo.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera found. Please use Upload Photo instead.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Camera is already in use. Please close other apps using the camera or use Upload Photo.');
      } else {
        setError('Unable to access camera. Please use Upload Photo instead.');
      }
      setIsCameraSupported(false);
    }
  };

  // Capture photo from camera
  const capturePhoto = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('[ProfilePhotoModal] capturePhoto called, event type:', e.type, 'target:', e.target.tagName);
    } else {
      console.log('[ProfilePhotoModal] capturePhoto called without event');
    }

    // Guard against automatic capture - only allow if camera is ready and event is a click
    if (!cameraReady) {
      console.log('[ProfilePhotoModal] capturePhoto aborted - camera not ready yet');
      return;
    }

    if (e && e.type !== 'click') {
      console.log('[ProfilePhotoModal] capturePhoto aborted - event is not a click:', e.type);
      return;
    }

    console.trace('[ProfilePhotoModal] capturePhoto call stack');
    if (!videoRef.current || !canvasRef.current) {
      console.log('[ProfilePhotoModal] capturePhoto aborted - videoRef or canvasRef is null');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    console.log('[ProfilePhotoModal] Canvas dimensions set to:', video.videoWidth, 'x', video.videoHeight);

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    console.log('[ProfilePhotoModal] Drawing to canvas complete, converting to blob...');

    // Convert to blob and create URL
    canvas.toBlob((blob) => {
      if (blob) {
        console.log('[ProfilePhotoModal] Blob created, setting capturedImage');
        const url = URL.createObjectURL(blob);
        setCapturedImage(url);
        // Stop camera stream after capture
        if (cameraStream) {
          console.log('[ProfilePhotoModal] Stopping camera stream');
          cameraStream.getTracks().forEach(track => track.stop());
          setCameraStream(null);
        }
      } else {
        console.error('[ProfilePhotoModal] Failed to create blob from canvas');
      }
    }, 'image/jpeg', 0.95);
  };

  // Retake photo
  const retakePhoto = () => {
    // Revoke captured image URL before restarting camera
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
      setCapturedImage(null);
    }
    startCamera();
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, WEBP)');
      // Reset file input to allow re-selection
      e.target.value = '';
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      // Reset file input to allow re-selection
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);

    // Reset file input to allow re-selection of same file
    e.target.value = '';
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Handle replace file
  const handleReplaceFile = () => {
    // Revoke old preview URL before selecting new file
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setSelectedFile(null);
    setError('');
    setTimeout(() => fileInputRef.current?.click(), 100);
  };

  // Handle upload
  const handleUpload = async () => {
    let fileToUpload = selectedFile;

    // Convert captured image to File if needed
    if (!fileToUpload && capturedImage) {
      fileToUpload = await urlToFile(capturedImage);
    }

    if (!fileToUpload) {
      setError('Please select or capture a photo first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      // Simulate progress (since we don't have real progress from the API)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await onUploadPhoto(fileToUpload);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Success - parent will handle closing
      toast.success('Profile photo uploaded successfully!');
      onClose();
    } catch (err) {
      console.error('[ProfilePhotoModal] Upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload photo. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle remove photo
  const handleRemovePhoto = async () => {
    setRemoving(true);
    setError('');

    try {
      await onRemovePhoto();
      toast.success('Profile photo removed successfully!');
      onClose();
    } catch (err) {
      console.error('[ProfilePhotoModal] Remove error:', err);
      setError(err.response?.data?.message || 'Failed to remove photo. Please try again.');
      setRemoving(false);
    }
  };

  // Convert data URL or blob URL to File object
  const urlToFile = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const extension = blob.type.split('/')[1] || 'jpg';
      const filename = `photo-${Date.now()}.${extension}`;
      return new File([blob], filename, { type: blob.type });
    } catch (err) {
      console.error('[ProfilePhotoModal] Error converting URL to File:', err);
      throw new Error('Failed to process captured photo');
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={handleBackdropClick}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden z-[70] max-h-[calc(100vh-32px)] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 id="modal-title" className="text-xl font-bold text-gray-900">
                Change Profile Photo
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Mode Selection */}
              {!mode && !showRemoveConfirm && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 text-center">
                    Choose how you'd like to add your profile photo
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleModeChange('upload')}
                      className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#2563EB] hover:bg-blue-50 transition-all group"
                    >
                      <Upload className="w-8 h-8 text-gray-400 group-hover:text-[#2563EB] transition-colors" />
                      <span className="font-semibold text-gray-700 group-hover:text-[#2563EB] transition-colors">
                        Upload Photo
                      </span>
                      <span className="text-xs text-gray-500">
                        from your device
                      </span>
                    </button>
                    
                    <button
                      onClick={() => handleModeChange('camera')}
                      disabled={!isCameraSupported}
                      className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#06B6D4] hover:bg-cyan-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Camera className="w-8 h-8 text-gray-400 group-hover:text-[#06B6D4] transition-colors" />
                      <span className="font-semibold text-gray-700 group-hover:text-[#06B6D4] transition-colors">
                        Take Photo
                      </span>
                      <span className="text-xs text-gray-500">
                        using your camera
                      </span>
                    </button>
                  </div>
                  
                  {/* Remove Current Photo option */}
                  {currentPhotoUrl && (
                    <div className="pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleModeChange('remove')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-200 rounded-xl hover:bg-red-50 transition-colors text-red-600"
                      >
                        <Trash2 size={18} />
                        <span>Remove Current Photo</span>
                      </button>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      Accepted formats: JPEG, PNG, WEBP • Maximum size: 5MB
                    </p>
                  </div>
                </div>
              )}

              {/* Upload Mode */}
              {mode === 'upload' && (
                <div className="space-y-4">
                  {/* Preview Area */}
                  <div className="relative aspect-square max-w-[280px] mx-auto bg-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-gray-300">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <Upload className="w-12 h-12 mb-2" />
                        <p className="text-sm">No image selected</p>
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  {selectedFile && (
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      <AlertCircle size={16} />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Upload Progress */}
                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Uploading...</span>
                        <span className="text-gray-900 font-medium">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          className="h-full bg-gradient-to-r from-[#2563EB] to-[#06B6D4]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    {previewUrl && !uploading ? (
                      <>
                        <button
                          onClick={handleReplaceFile}
                          className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-gray-700"
                        >
                          <RefreshCw size={18} />
                          <span>Choose Another Photo</span>
                        </button>
                        <button
                          onClick={handleUpload}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white rounded-xl hover:shadow-lg transition-all"
                        >
                          <ArrowRight size={18} />
                          <span>Next</span>
                        </button>
                      </>
                    ) : !previewUrl && !uploading ? (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white rounded-xl hover:shadow-lg transition-all"
                      >
                        <Upload size={18} />
                        <span>Select Photo</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setMode(null)}
                        className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}

              {/* Camera Mode */}
              {mode === 'camera' && (
                <div className="space-y-4">
                  {/* Camera or Captured Preview */}
                  <div className="relative aspect-square max-w-[280px] mx-auto bg-gray-900 rounded-2xl overflow-hidden">
                    {cameraStream && !capturedImage ? (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                          <span className="px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full">
                            Live
                          </span>
                        </div>
                      </>
                    ) : capturedImage ? (
                      <img
                        src={capturedImage}
                        alt="Captured"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <VideoOff className="w-12 h-12 mb-2" />
                        <p className="text-sm text-center px-4">
                          {error || 'Camera unavailable'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Hidden canvas for capture */}
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Error Message */}
                  {error && !cameraStream && !capturedImage && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      <AlertCircle size={16} />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Upload Progress */}
                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Uploading...</span>
                        <span className="text-gray-900 font-medium">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          className="h-full bg-gradient-to-r from-[#06B6D4] to-[#2563EB]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    {cameraStream && !capturedImage ? (
                      <>
                        <button
                          onClick={capturePhoto}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white rounded-xl hover:shadow-lg transition-all"
                        >
                          <Camera size={18} />
                          <span>Capture</span>
                        </button>
                        <button
                          onClick={() => {
                            if (cameraStream) {
                              cameraStream.getTracks().forEach(track => track.stop());
                              setCameraStream(null);
                            }
                            setMode(null);
                          }}
                          className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : capturedImage ? (
                      <>
                        <button
                          onClick={retakePhoto}
                          className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-gray-700"
                        >
                          <RefreshCw size={18} />
                          <span>Retake</span>
                        </button>
                        <button
                          onClick={handleUpload}
                          disabled={uploading}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <ArrowRight size={18} />
                              <span>Upload Photo</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            if (capturedImage) {
                              URL.revokeObjectURL(capturedImage);
                              setCapturedImage(null);
                            }
                            setMode(null);
                          }}
                          disabled={uploading}
                          className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleModeChange('upload')}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white rounded-xl hover:shadow-lg transition-all"
                        >
                          <Upload size={18} />
                          <span>Upload Photo Instead</span>
                        </button>
                        <button
                          onClick={() => setMode(null)}
                          className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Remove Confirmation */}
              {showRemoveConfirm && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-red-900">Remove Profile Photo</h3>
                      <p className="text-sm text-red-700 mt-1">
                        This will remove your profile photo and your avatar will revert to initials. This action cannot be undone.
                      </p>
                    </div>
                  </div>

                  {/* Removal Progress */}
                  {removing && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Removing photo...</span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowRemoveConfirm(false)}
                      disabled={removing}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRemovePhoto}
                      disabled={removing}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {removing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Removing...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 size={18} />
                          <span>Remove Photo</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </Portal>
  );
};

export default ProfilePhotoModal;
