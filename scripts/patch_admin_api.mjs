import fs from 'fs';

const filePath = 'c:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/src/api/adminApi.js';
let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

// 1. Patch getUsers and getInstructors
const oldUsers = `  // ======================== USER MANAGEMENT ========================
  getUsers: async (params = {}) => {
    const response = await axiosInstance.get('/api/v1/admin/users', { params });
    return response.data;
  },`;

const newUsers = `  // ======================== USER MANAGEMENT ========================
  getUsers: async (pageOrParams = {}, maybeSize) => {
    let params = {};
    if (typeof pageOrParams === 'object' && pageOrParams !== null) {
      params = pageOrParams;
    } else if (typeof pageOrParams === 'number') {
      params = { page: pageOrParams, size: maybeSize ?? 10 };
    }
    const response = await axiosInstance.get('/api/v1/admin/users', { params });
    return response.data;
  },`;

const oldInst = `  // ======================== INSTRUCTOR MANAGEMENT ========================
  getInstructors: async (params = {}) => {
    const response = await axiosInstance.get('/api/v1/admin/instructors', { params });
    return response.data;
  },`;

const newInst = `  // ======================== INSTRUCTOR MANAGEMENT ========================
  getInstructors: async (pageOrParams = {}, maybeSize) => {
    let params = {};
    if (typeof pageOrParams === 'object' && pageOrParams !== null) {
      params = pageOrParams;
    } else if (typeof pageOrParams === 'number') {
      params = { page: pageOrParams, size: maybeSize ?? 10 };
    }
    const response = await axiosInstance.get('/api/v1/admin/instructors', { params });
    return response.data;
  },`;

if (content.includes(oldUsers)) {
  content = content.replace(oldUsers, newUsers);
  console.log('Patched getUsers');
} else {
  console.error('Failed to match oldUsers');
}

if (content.includes(oldInst)) {
  content = content.replace(oldInst, newInst);
  console.log('Patched getInstructors');
} else {
  console.error('Failed to match oldInst');
}

// Add coupon methods if not present
const couponBlock = `
  // ======================== COUPON MANAGEMENT ========================
  getCoupons: async () => {
    const response = await axiosInstance.get('/api/v1/coupons');
    return response.data?.data || response.data || [];
  },

  getCouponById: async (couponId) => {
    const response = await axiosInstance.get(\`/api/v1/coupons/\${couponId}\`);
    return response.data?.data || response.data;
  },

  createCoupon: async (couponPayload) => {
    const response = await axiosInstance.post('/api/v1/coupons', couponPayload);
    return response.data?.data || response.data;
  },

  updateCoupon: async (couponId, couponPayload) => {
    const response = await axiosInstance.put(\`/api/v1/coupons/\${couponId}\`, couponPayload);
    return response.data?.data || response.data;
  },

  deleteCoupon: async (couponId) => {
    const response = await axiosInstance.delete(\`/api/v1/coupons/\${couponId}\`);
    return response.data?.data || response.data;
  },

  activateCoupon: async (couponId) => {
    const response = await axiosInstance.patch(\`/api/v1/coupons/\${couponId}/activate\`);
    return response.data?.data || response.data;
  },

  deactivateCoupon: async (couponId) => {
    const response = await axiosInstance.patch(\`/api/v1/coupons/\${couponId}/deactivate\`);
    return response.data?.data || response.data;
  },

  validateCoupon: async (code) => {
    const response = await axiosInstance.get(\`/api/v1/coupons/validate/\${code}\`);
    return response.data;
  },
`;

if (!content.includes('getCoupons:')) {
  // insert right before // ======================== REVIEWS
  content = content.replace('  // ======================== REVIEWS ====================', couponBlock + '\n  // ======================== REVIEWS ====================');
  console.log('Added coupon management methods to adminApi');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('adminApi.js successfully updated.');

