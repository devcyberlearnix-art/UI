const fs = require('fs');

async function main() {
  const loginRes = await fetch('http://localhost:8079/api/v1/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'dev.cyberlearnix@gmail.com', password: 'MainAdmin@123' })
  });
  const { authentication } = await loginRes.json();
  const token = authentication.accessToken;

  // Test validate with valid 1920x1080 image
  const imgBytes = fs.readFileSync('C:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/scripts/sample_banner_16_9.jpg');
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const imgFormData = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="banner.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`),
    imgBytes,
    Buffer.from(`\r\n--${boundary}--\r\n`)
  ]);

  const valRes = await fetch('http://localhost:8079/api/v1/admin/banners/validate-image', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'multipart/form-data; boundary=' + boundary
    },
    body: imgFormData
  });
  console.log('Validate 16:9 JPEG status:', valRes.status);
  console.log('Validate 16:9 JPEG response:', await valRes.json());

  // Test upload with valid 1920x1080 image
  const uploadBoundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const uploadFormData = Buffer.concat([
    Buffer.from(`--${uploadBoundary}\r\nContent-Disposition: form-data; name="file"; filename="banner.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`),
    imgBytes,
    Buffer.from(`\r\n--${uploadBoundary}\r\nContent-Disposition: form-data; name="imageType"\r\n\r\ndesktop\r\n--${uploadBoundary}--\r\n`)
  ]);

  const upRes = await fetch('http://localhost:8079/api/v1/admin/banners/upload-image', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'multipart/form-data; boundary=' + uploadBoundary
    },
    body: uploadFormData
  });
  console.log('Upload 16:9 JPEG status:', upRes.status);
  console.log('Upload 16:9 JPEG response:', await upRes.json());
}

main().catch(console.error);