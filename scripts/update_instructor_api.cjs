const fs = require('fs');
let content = fs.readFileSync('src/api/instructorApi.js', 'utf8');

const additions = `
  // ======================== ANNOUNCEMENTS ========================
  createAnnouncement: async (instructorId, courseId, data) => {
    const id = instructorId || "me";
    const response = await axiosInstance.post(
      \`/api/v1/instructors/\${id}/courses/\${courseId}/announcements\`,
      data
    );
    return response.data;
  },

  // ======================== COURSE MESSAGES ========================
  sendCourseMessage: async (instructorId, courseId, data) => {
    const id = instructorId || "me";
    const response = await axiosInstance.post(
      \`/api/v1/instructors/\${id}/courses/\${courseId}/messages\`,
      data
    );
    return response.data;
  },

  // ======================== MODULES & RESOURCES ========================
  addModule: async (instructorId, courseId, data) => {
    const id = instructorId || "me";
    const response = await axiosInstance.post(
      \`/api/v1/instructors/\${id}/courses/\${courseId}/modules\`,
      data
    );
    return response.data;
  },

  updateModule: async (instructorId, courseId, moduleId, data) => {
    const id = instructorId || "me";
    const response = await axiosInstance.put(
      \`/api/v1/instructors/\${id}/courses/\${courseId}/modules/\${moduleId}\`,
      data
    );
    return response.data;
  },

  deleteModule: async (instructorId, courseId, moduleId) => {
    const id = instructorId || "me";
    const response = await axiosInstance.delete(
      \`/api/v1/instructors/\${id}/courses/\${courseId}/modules/\${moduleId}\`
    );
    return response.data;
  },

  uploadModuleResource: async (instructorId, courseId, file, type = "PDF") => {
    const id = instructorId || "me";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    const response = await axiosInstance.post(
      \`/api/v1/instructors/\${id}/courses/\${courseId}/modules/upload\`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  },

  // ======================== CONTENT PUBLISHING ========================
  publishContent: async (instructorId, contentId, publish = true) => {
    const id = instructorId || "me";
    const response = await axiosInstance.patch(
      \`/api/v1/instructors/\${id}/content/\${contentId}/publish\`,
      { publish }
    );
    return response.data;
  },

  // ======================== INSTRUCTOR PROFILE ========================
  getInstructorProfile: async (instructorId) => {
    const id = instructorId || "me";
    const response = await axiosInstance.get(
      \`/api/v1/instructors/\${id}/profile\`
    );
    return response.data;
  },

  // ======================== PUBLIC COURSE ========================
  getPublicCourseById: async (courseId) => {
    const response = await axiosInstance.get(\`/api/v1/courses/\${courseId}\`);
    return response.data;
  },
`;

const lastIndex = content.lastIndexOf('};');
if (lastIndex !== -1) {
  content = content.slice(0, lastIndex) + additions + content.slice(lastIndex);
  fs.writeFileSync('src/api/instructorApi.js', content, 'utf8');
  console.log('Successfully updated src/api/instructorApi.js');
} else {
  console.error('Could not find closing brace in src/api/instructorApi.js');
}

