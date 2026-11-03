import fs from 'fs';

const filePath = 'C:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/src/api/adminApi.js';
let content = fs.readFileSync(filePath, 'utf8');

const injectionPoint = '  // ======================== LEGACY COMPATIBILITY ====================';

const newMethods = `  // ======================== BANNER MANAGEMENT (15 ENDPOINTS) ========================
  createBanner: async (bannerPayload) => {
    const response = await axiosInstance.post('/api/v1/admin/banners', bannerPayload);
    return response.data;
  },

  getAllBanners: async () => {
    const response = await axiosInstance.get('/api/v1/admin/banners');
    return response.data;
  },

  getBanners: async () => {
    return adminApi.getAllBanners();
  },

  getBannerById: async (bannerId) => {
    const response = await axiosInstance.get(\`/api/v1/admin/banners/\${bannerId}\`);
    return response.data;
  },

  updateBanner: async (bannerId, bannerPayload) => {
    const response = await axiosInstance.put(\`/api/v1/admin/banners/\${bannerId}\`, bannerPayload);
    return response.data;
  },

  patchBanner: async (bannerId, bannerPayload) => {
    const response = await axiosInstance.patch(\`/api/v1/admin/banners/\${bannerId}\`, bannerPayload);
    return response.data;
  },

  updateBannerStatus: async (bannerId, statusPayload) => {
    const payload = typeof statusPayload === 'string' ? { status: statusPayload } : statusPayload;
    const response = await axiosInstance.patch(\`/api/v1/admin/banners/\${bannerId}/status\`, payload);
    return response.data;
  },

  reorderBanners: async (reorderPayload) => {
    const response = await axiosInstance.patch('/api/v1/admin/banners/reorder', reorderPayload);
    return response.data;
  },

  deleteBanner: async (bannerId) => {
    const response = await axiosInstance.delete(\`/api/v1/admin/banners/\${bannerId}\`);
    return response.data;
  },

  getBannerAnalytics: async (bannerId) => {
    const path = bannerId ? \`/api/v1/admin/banners/\${bannerId}/analytics\` : '/api/v1/admin/banners/analytics';
    const response = await axiosInstance.get(path);
    return response.data;
  },

  uploadBannerImage: async (file, imageType = 'desktop') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('imageType', imageType);
    const response = await axiosInstance.post('/api/v1/admin/banners/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  validateBannerImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post('/api/v1/admin/banners/validate-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getDeletedBanners: async () => {
    const response = await axiosInstance.get('/api/v1/admin/banners/deleted');
    return response.data;
  },

  restoreBanner: async (bannerId) => {
    const response = await axiosInstance.post(\`/api/v1/admin/banners/\${bannerId}/restore\`);
    return response.data;
  },

  getBannersByTarget: async (targetType) => {
    const response = await axiosInstance.get(\`/api/v1/admin/banners/target/\${targetType}\`);
    return response.data;
  },

  trackBannerConversion: async (bannerId) => {
    const response = await axiosInstance.post(\`/api/v1/admin/banners/\${bannerId}/conversion\`);
    return response.data;
  },

  // ======================== ADMIN AUTH & PASSWORD RECOVERY (8 ENDPOINTS) ========================
  loginDirect: async (email, password) => {
    const response = await axiosInstance.post('/api/v1/admin/login', { email, password });
    return response.data;
  },

  requestLoginOtp: async (email) => {
    const response = await axiosInstance.post('/api/v1/admin/login/otp/request', { email });
    return response.data;
  },

  verifyLoginOtp: async (email, otp) => {
    const response = await axiosInstance.post('/api/v1/admin/login/otp/verify', { email, otp });
    return response.data;
  },

  resendLoginOtp: async (email) => {
    const response = await axiosInstance.post('/api/v1/admin/login/otp/resend', { email });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axiosInstance.post('/api/v1/admin/password/forgot', { email });
    return response.data;
  },

  verifyPasswordOtp: async (email, otp) => {
    const response = await axiosInstance.post('/api/v1/admin/password/verify-otp', { email, otp });
    return response.data;
  },

  resendPasswordOtp: async (email) => {
    const response = await axiosInstance.post('/api/v1/admin/password/otp/resend', { email });
    return response.data;
  },

  resetPassword: async (email, otp, newPassword) => {
    const response = await axiosInstance.post('/api/v1/admin/password/reset', { email, otp, newPassword });
    return response.data;
  },

  // ======================== ADMIN 2FA & SECURITY MUTATIONS (8 ENDPOINTS) ========================
  initiateEmailChange: async (payload) => {
    const response = await axiosInstance.post('/api/v1/admin/email/change-request', payload);
    return response.data;
  },

  verifyOldEmailOtp: async (sessionId, otp) => {
    const response = await axiosInstance.post('/api/v1/admin/email/verify-old', { sessionId, otp });
    return response.data;
  },

  verifyNewEmailOtp: async (sessionId, otp) => {
    const response = await axiosInstance.post('/api/v1/admin/email/verify-new', { sessionId, otp });
    return response.data;
  },

  resendEmailChangeOtp: async (sessionId, type = 'old') => {
    const response = await axiosInstance.post('/api/v1/admin/email/resend-otp', { sessionId, type });
    return response.data;
  },

  getEmailChangeSession: async (sessionId) => {
    const response = await axiosInstance.get(\`/api/v1/admin/email/change-request/\${sessionId}\`);
    return response.data;
  },

  initiatePasswordChange: async (payload) => {
    const response = await axiosInstance.post('/api/v1/admin/change-password', payload);
    return response.data;
  },

  verifyChangePasswordOtp: async (otp) => {
    const response = await axiosInstance.post('/api/v1/admin/change-password/verify-otp', { otp });
    return response.data;
  },

  resendChangePasswordOtp: async () => {
    const response = await axiosInstance.post('/api/v1/admin/change-password/resend-otp');
    return response.data;
  },

  // ======================== LIFECYCLE & SERVICE HEALTH (3 ENDPOINTS) ========================
  deleteInstructor: async (instructorId) => {
    const response = await axiosInstance.delete(\`/api/v1/admin/instructors/\${instructorId}\`);
    return response.data;
  },

  getAdminProfileDirect: async () => {
    const response = await axiosInstance.get('/api/v1/admin/profile');
    return response.data;
  },

  refreshUserEligibility: async (userId) => {
    const response = await axiosInstance.get(\`/api/v1/admin/internal/users/\${userId}/refresh-eligibility\`);
    return response.data;
  },

`;

if (!content.includes('// ======================== BANNER MANAGEMENT (15 ENDPOINTS)')) {
  content = content.replace(injectionPoint, newMethods + injectionPoint);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated adminApi.js with all 34 endpoints!');
} else {
  console.log('adminApi.js already contains new methods.');
}

