// src/pages/ResetOtp.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';

// For backwards compatibility with routes referencing /reset-otp
export const ResetOtp = () => {
  const location = useLocation();
  // If email state is passed, keep context and render the complete ForgotPassword recovery workspace
  return <ForgotPassword location={location} />;
};

export default ResetOtp;
