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
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4"
          onClick={handleBackdropClick}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="w-full max-w-lg bg-[#0F0F13] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden z-[70] max-h-[calc(100vh-32px)] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04]">
              <h2 id="modal-title" className="text-base font-bold text-[#F5F5F7] tracking-tight">
                Profile Identity Vector Configuration
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-[#8E8E93] hover:text-[#F5F5F7]"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* Mode Selection */}
              {!mode && !showRemoveConfirm && (
                <div className="space-y-4">
                  <p className="text-xs text-[#8E8E93] text-center font-light">
                    Select a high-resolution media ingest mode for your profile representation
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleModeChange('upload')}
                      className="flex flex-col items-center gap-3 p-6 border border-white/[0.06] rounded-xl hover:border-[#C5A880]/50 bg-[#14141A] hover:bg-[#1B1B24] transition-all group"
                    >
                      <Upload className="w-7 h-7 text-[#8E8E93] group-hover:text-[#C5A880] transition-colors" />
                      <span className="font-semibold text-xs text-[#F5F5F7] tracking-wide">
                        Upload Media
                      </span>
                      <span className="text-[10px] text-[#8E8E93] font-mono">
                        Direct Local File
                      </span>
                    </button>
                    
                    <button
                      onClick={() => handleModeChange('camera')}
                      disabled={!isCameraSupported}
                      className="flex flex-col items-center gap-3 p-6 border border-white/[0.06] rounded-xl hover:border-[#C5A880]/50 bg-[#14141A] hover:bg-[#1B1B24] transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Camera className="w-7 h-7 text-[#8E8E93] group-hover:text-[#C5A880] transition-colors" />
                      <span className="font-semibold text-xs text-[#F5F5F7] tracking-wide">
                        Capture Live
                      </span>
                      <span className="text-[10px] text-[#8E8E93] font-mono">
                        Hardware Viewfinder
                      </span>
                    </button>
                  </div>
                  
                  {/* Remove Current Photo option */}
                  {currentPhotoUrl && (
                    <div className="pt-2 border-t border-white/[0.04]">
                      <button
                        onClick={() => handleModeChange('remove')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-rose-500/20 bg-rose-500/5 rounded-xl hover:bg-rose-500/10 transition-colors text-xs font-semibold text-rose-300"
                      >
                        <Trash2 size={15} />
                        <span>Purge Current Profile Photo</span>
                      </button>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <p className="text-[10px] text-[#8E8E93] font-mono">
                      Supported: JPEG, PNG, WEBP • Sub-5MB Allocation
                    </p>
                  </div>
                </div>
              )}

              {/* Upload Mode */}
              {mode === 'upload' && (
                <div className="space-y-4">
                  {/* Preview Area */}
                  <div className="relative aspect-square max-w-[260px] mx-auto bg-[#14141A] rounded-2xl overflow-hidden border border-white/[0.08] flex items-center justify-center">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-[#8E8E93]">
                        <Upload className="w-10 h-10 mb-2 opacity-50" />
                        <p className="text-xs">No media asset buffered</p>
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  {selectedFile && (
                    <div className="text-center space-y-0.5">
                      <p className="text-xs font-medium text-[#F5F5F7]">{selectedFile.name}</p>
                      <p className="text-[10px] text-[#C5A880] font-mono">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs">
                      <AlertCircle size={15} />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Upload Progress */}
                  {uploading && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#8E8E93] font-mono">Syncing Payload...</span>
                        <span className="text-[#C5A880] font-mono font-bold">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-[#14141A] rounded-full h-1.5 overflow-hidden border border-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          className="h-full bg-[#C5A880]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-2.5 pt-2">
                    {previewUrl && !uploading ? (
                      <>
                        <button
                          onClick={handleUpload}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C5A880] text-[#070709] rounded-xl hover:bg-[#D4BC98] transition-colors text-xs font-bold shadow-[0_4px_20px_rgba(197,168,128,0.22)]"
                        >
                          <ArrowRight size={15} />
                          <span>Commit Profile Media</span>
                        </button>
                        <button
                          onClick={handleReplaceFile}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-white/[0.08] bg-[#14141A] hover:bg-[#1B1B24] rounded-xl transition-colors text-xs text-[#E5E5E7]"
                        >
                          <RefreshCw size={14} />
                          <span>Choose Alternate Media</span>
                        </button>
                      </>
                    ) : !previewUrl && !uploading ? (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C5A880] text-[#070709] rounded-xl hover:bg-[#D4BC98] transition-colors text-xs font-bold shadow-[0_4px_20px_rgba(197,168,128,0.22)]"
                      >
                        <Upload size={15} />
                        <span>Select File Chunk</span>
                      </button>
                    ) : null}

                    {!uploading && (
                      <button
                        onClick={() => setMode(null)}
                        className="w-full px-4 py-1.5 text-xs text-[#8E8E93] hover:text-[#F5F5F7] transition-colors text-center"
                      >
                        Cancel Selection
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
                  <div className="relative aspect-square max-w-[260px] mx-auto bg-[#14141A] rounded-2xl overflow-hidden border border-white/[0.08]">
                    {cameraStream && !capturedImage ? (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="px-2 py-0.5 bg-[#070709]/80 border border-white/10 text-[#F5F5F7] text-[10px] font-mono rounded-md">
                            VIEWFINDER ACTIVE
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
                      <div className="flex flex-col items-center justify-center h-full text-[#8E8E93]">
                        <VideoOff className="w-10 h-10 mb-2 opacity-50" />
                        <p className="text-xs text-center px-4">
                          {error || 'Optical sensor unavailable'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Hidden canvas for capture */}
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Error Message */}
                  {error && !cameraStream && !capturedImage && (
                    <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs">
                      <AlertCircle size={15} />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Upload Progress */}
                  {uploading && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#8E8E93] font-mono">Transmitting Vector...</span>
                        <span className="text-[#C5A880] font-mono font-bold">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-[#14141A] rounded-full h-1.5 overflow-hidden border border-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          className="h-full bg-[#C5A880]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-2.5 pt-2">
                    {cameraStream && !capturedImage ? (
                      <>
                        <button
                          onClick={capturePhoto}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C5A880] text-[#070709] rounded-xl hover:bg-[#D4BC98] transition-colors text-xs font-bold shadow-[0_4px_20px_rgba(197,168,128,0.22)]"
                        >
                          <Camera size={15} />
                          <span>Capture Frame</span>
                        </button>
                        <button
                          onClick={() => {
                            if (cameraStream) {
                              cameraStream.getTracks().forEach(track => track.stop());
                              setCameraStream(null);
                            }
                            setMode(null);
                          }}
                          className="w-full px-4 py-1.5 text-xs text-[#8E8E93] hover:text-[#F5F5F7] transition-colors text-center"
                        >
                          Disengage Camera
                        </button>
                      </>
                    ) : capturedImage ? (
                      <>
                        <button
                          onClick={handleUpload}
                          disabled={uploading}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C5A880] text-[#070709] rounded-xl hover:bg-[#D4BC98] transition-colors text-xs font-bold shadow-[0_4px_20px_rgba(197,168,128,0.22)] disabled:opacity-50"
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Transmitting Frame...</span>
                            </>
                          ) : (
                            <>
                              <ArrowRight size={15} />
                              <span>Commit Captured Media</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={retakePhoto}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-white/[0.08] bg-[#14141A] hover:bg-[#1B1B24] rounded-xl transition-colors text-xs text-[#E5E5E7]"
                        >
                          <RefreshCw size={14} />
                          <span>Retake Live Frame</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleModeChange('upload')}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C5A880] text-[#070709] rounded-xl hover:bg-[#D4BC98] transition-colors text-xs font-bold"
                        >
                          <Upload size={15} />
                          <span>Fallback to File Upload</span>
                        </button>
                        <button
                          onClick={() => setMode(null)}
                          className="w-full px-4 py-1.5 text-xs text-[#8E8E93] hover:text-[#F5F5F7] transition-colors text-center"
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
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                      <AlertCircle size={16} />
                      <span>Confirm Identity Media Deletion</span>
                    </div>
                    <p className="text-xs text-[#8E8E93] leading-relaxed">
                      Are you sure you want to remove your profile photo? Your account will revert to the monogram initials fallback.
                    </p>
                  </div>

                  {/* Removal Progress */}
                  {removing && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-xs text-[#8E8E93]">
                        <Loader2 className="w-4 h-4 animate-spin text-[#C5A880]" />
                        <span>Purging photo payload...</span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowRemoveConfirm(false)}
                      disabled={removing}
                      className="flex-1 px-4 py-2.5 border border-white/[0.08] bg-[#14141A] hover:bg-[#1B1B24] transition-colors text-xs text-[#E5E5E7] rounded-xl font-semibold disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRemovePhoto}
                      disabled={removing}
                      className="flex-1 px-4 py-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {removing ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Purging...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 size={14} />
                          <span>Purge Photo</span>
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
