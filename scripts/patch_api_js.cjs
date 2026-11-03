const fs = require('fs');

// 1. Update api.js
const apiJsPath = 'c:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/src/config/api.js';
let apiJsContent = fs.readFileSync(apiJsPath, 'utf8');

const oldNormalize = `  // Handle Google Drive URLs - convert to thumbnail/preview format for img tags
  if (photoUrl.includes('drive.google.com')) {
    // Extract file ID from Google Drive URL
    const idMatch = photoUrl.match(/id=([^&]+)/);
    const fileMatch = photoUrl.match(/\\/file\\/d\\/([^\\/]+)/);
    const fileId = idMatch ? idMatch[1] : (fileMatch ? fileMatch[1] : null);

    if (fileId) {
      // Use thumbnail format that works in img tags with size parameters
      return \`https://drive.google.com/thumbnail?id=\${fileId}&sz=w1280-h1280\`;
    }
    // If we can't extract file ID, return as-is
    return photoUrl;
  }`;

const newNormalize = `  // Handle Google Drive URLs - convert to proxy endpoint to bypass Google 429 rate-limiting
  if (photoUrl.includes('drive.google.com')) {
    const idMatch = photoUrl.match(/id=([^&]+)/);
    const fileMatch = photoUrl.match(/\\/file\\/d\\/([^\\/]+)/);
    const fileId = idMatch ? idMatch[1] : (fileMatch ? fileMatch[1] : null);

    if (fileId) {
      return \`/api/v1/users/photo/\${fileId}\`;
    }
    return photoUrl;
  }`;

if (apiJsContent.includes("https://drive.google.com/thumbnail?id=")) {
  apiJsContent = apiJsContent.replace(oldNormalize, newNormalize);
  fs.writeFileSync(apiJsPath, apiJsContent, 'utf8');
  console.log('api.js updated to use proxy endpoint for Google Drive photos!');
} else {
  console.log('api.js already updated or pattern not found');
}

