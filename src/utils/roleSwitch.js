// src/utils/roleSwitch.js

// Get the current acting role (defaults to user's original role)
export const getActingRole = () => {
  const acting = localStorage.getItem('lms_acting_role');
  const user = JSON.parse(localStorage.getItem('lms_user') || '{}');
  if (acting && user.role === 'admin' || user.role === 'instructor') {
    return acting;
  }
  return user.role;
};

// Set the acting role (only for admin/instructor)
export const setActingRole = (role) => {
  const user = JSON.parse(localStorage.getItem('lms_user') || '{}');
  if (user.role === 'admin') {
    localStorage.setItem('lms_acting_role', role);
  } else if (user.role === 'instructor' && role === 'student') {
    localStorage.setItem('lms_acting_role', role);
  } else {
    localStorage.removeItem('lms_acting_role');
  }
};

// Reset acting role to original
export const resetActingRole = () => {
  localStorage.removeItem('lms_acting_role');
};