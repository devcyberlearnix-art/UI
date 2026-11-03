const fs = require('fs');
const file = 'src/context/AuthContext.jsx';
let content = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

const oldCode = `      localStorage.removeItem('lms_token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('lms_user');
      sessionStorage.removeItem('lms_token');
      sessionStorage.removeItem('lms_user');`;

const newCode = `      localStorage.removeItem('lms_token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('lms_user');
      localStorage.removeItem('lms_cart');
      localStorage.removeItem('lms_guest_cart_backup');
      sessionStorage.removeItem('lms_token');
      sessionStorage.removeItem('lms_user');
      window.dispatchEvent(new Event('cartUpdated'));`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(file, content.replace(/\n/g, '\r\n'), 'utf8');
  console.log('AUTH_CONTEXT_LOGOUT_PATCHED');
} else {
  console.log('TARGET_NOT_FOUND');
}

