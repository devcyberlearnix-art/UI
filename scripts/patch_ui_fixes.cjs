const fs = require('fs');

// 1. Patch courseApi.js
const courseApiPath = 'c:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/src/api/courseApi.js';
let courseApiContent = fs.readFileSync(courseApiPath, 'utf8');

const target1 = `  getStudentDashboard: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/progress/courses');
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('[courseApi] GET /api/v1/progress/courses fallback to /api/v1/dashboard/student');
      const fallback = await axiosInstance.get('/api/v1/dashboard/student');
      return fallback.data?.data || fallback.data;
    }
  },`;

const replacement1 = `  getStudentDashboard: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/dashboard/student');
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('[courseApi] GET /api/v1/dashboard/student fallback to /api/v1/progress/courses');
      const fallback = await axiosInstance.get('/api/v1/progress/courses');
      return fallback.data?.data || fallback.data;
    }
  },`;

// Normalize line breaks for matching
const norm1 = courseApiContent.replace(/\r\n/g, '\n');
const normTarget1 = target1.replace(/\r\n/g, '\n');
const normRep1 = replacement1.replace(/\r\n/g, '\n');

if (norm1.includes(normTarget1)) {
  const updated1 = norm1.replace(normTarget1, normRep1);
  fs.writeFileSync(courseApiPath, updated1, 'utf8');
  console.log('courseApi.js patched successfully!');
} else {
  console.log('courseApi.js already patched or target not found');
}

// 2. Patch stompClient.js
const stompPath = 'c:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/src/utils/stompClient.js';
let stompContent = fs.readFileSync(stompPath, 'utf8');

const target2 = `export const getStompClient = () => {
  if (!stompInstance && typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Connect through the Spring Cloud API Gateway on 8080 or current host
    const host = window.location.port === '5173' ? 'localhost:8080' : window.location.host;
    const wsUrl = \`\${protocol}//\${host}/ws/notifications/websocket\`;
    const token = localStorage.getItem('token') || localStorage.getItem('jwt');
    stompInstance = new StompClient(wsUrl, token);
  }
  return stompInstance;
};`;

const replacement2 = `export const getStompClient = () => {
  // Check if WebSocket telemetry is explicitly enabled
  const isWsEnabled = import.meta.env?.VITE_WS_ENABLED === 'true';
  if (!isWsEnabled) {
    return null;
  }
  if (!stompInstance && typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Connect through the Spring Cloud API Gateway on 8080 or current host
    const host = window.location.port === '5173' ? 'localhost:8080' : window.location.host;
    const wsUrl = \`\${protocol}//\${host}/ws/notifications/websocket\`;
    const token = localStorage.getItem('token') || localStorage.getItem('jwt');
    stompInstance = new StompClient(wsUrl, token);
  }
  return stompInstance;
};`;

const norm2 = stompContent.replace(/\r\n/g, '\n');
const normTarget2 = target2.replace(/\r\n/g, '\n');
const normRep2 = replacement2.replace(/\r\n/g, '\n');

if (norm2.includes(normTarget2)) {
  const updated2 = norm2.replace(normTarget2, normRep2);
  fs.writeFileSync(stompPath, updated2, 'utf8');
  console.log('stompClient.js patched successfully!');
} else {
  console.log('stompClient.js already patched or target not found');
}

