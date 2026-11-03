const fs = require('fs');

const filePath = 'c:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/src/pages/student/ProfileWorkspace.jsx';
let content = fs.readFileSync(filePath, 'utf8');
const isCRLF = content.includes('\r\n');
let norm = content.replace(/\r\n/g, '\n');

// 1. Replace fetchProfilePhotoAsBlob with robust fetchPhotoAsBlob
const oldFetchPhoto = `  // Fetch authenticated photo blob
  const fetchProfilePhotoAsBlob = async (photoUrl, retries = 2) => {
    if (!photoUrl) return null;
    if (photoUrl.includes('drive.google.com')) return photoUrl;

    for (let i = 0; i < retries; i++) {
      try {
        if (photoBlobUrlRef.current && photoBlobUrlRef.current.startsWith('blob:')) {
          URL.revokeObjectURL(photoBlobUrlRef.current);
          photoBlobUrlRef.current = null;
        }

        const response = await axiosInstance.get(photoUrl, { responseType: 'blob' });
        if (!response.data || response.data.size === 0) return null;

        const blob = new Blob([response.data], { type: response.headers['content-type'] || 'image/jpeg' });
        const blobUrl = URL.createObjectURL(blob);
        photoBlobUrlRef.current = blobUrl;
        return blobUrl;
      } catch (err) {
        if (i === retries - 1) return null;
        await new Promise(res => setTimeout(res, 400));
      }
    }
  };`;

const newFetchPhoto = `  // Fetch authenticated photo blob (resolves Google Drive and proxy URLs)
  const fetchPhotoAsBlob = async (photoUrl, retries = 2) => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith('blob:') || photoUrl.startsWith('data:')) return photoUrl;

    let targetUrl = photoUrl;
    if (photoUrl.includes('drive.google.com')) {
      const idMatch = photoUrl.match(/id=([^&]+)/);
      const fileMatch = photoUrl.match(/\\/file\\/d\\/([^\\/]+)/);
      const fileId = idMatch ? idMatch[1] : (fileMatch ? fileMatch[1] : null);
      if (fileId) {
        targetUrl = \`/api/v1/users/photo/\${fileId}\`;
      }
    }

    for (let i = 0; i < retries; i++) {
      try {
        const response = await axiosInstance.get(targetUrl, { responseType: 'blob' });
        if (!response.data || response.data.size === 0) return null;

        const blob = new Blob([response.data], { type: response.headers['content-type'] || 'image/jpeg' });
        return URL.createObjectURL(blob);
      } catch (err) {
        if (i === retries - 1) return targetUrl;
        await new Promise(res => setTimeout(res, 300));
      }
    }
    return targetUrl;
  };
  const fetchProfilePhotoAsBlob = fetchPhotoAsBlob;`;

if (norm.includes("if (photoUrl.includes('drive.google.com')) return photoUrl;")) {
  norm = norm.replace(oldFetchPhoto, newFetchPhoto);
  console.log('fetchPhotoAsBlob updated successfully!');
} else {
  console.log('fetchProfilePhotoAsBlob pattern not matched');
}

// 2. Update fetchProfile photo & cover blob hydration
const oldHydration = `      if (normalizedPhotoUrl) {
        const blobUrl = await fetchProfilePhotoAsBlob(normalizedPhotoUrl);
        setPhotoBlobUrl(blobUrl);
      } else {
        setPhotoBlobUrl(null);
      }

      if (normalizedCoverPhotoUrl) {
        setCoverPhotoUrl(normalizedCoverPhotoUrl);
      }`;

const newHydration = `      if (normalizedPhotoUrl || data.profilePhoto) {
        const blobUrl = await fetchPhotoAsBlob(data.profilePhoto || normalizedPhotoUrl);
        setPhotoBlobUrl(blobUrl);
      } else {
        setPhotoBlobUrl(null);
      }

      if (data.coverPhoto || normalizedCoverPhotoUrl) {
        const coverBlob = await fetchPhotoAsBlob(data.coverPhoto || normalizedCoverPhotoUrl);
        setCoverPhotoUrl(coverBlob);
      } else {
        setCoverPhotoUrl(null);
      }`;

if (norm.includes(oldHydration)) {
  norm = norm.replace(oldHydration, newHydration);
  console.log('fetchProfile cover photo blob hydration updated!');
} else {
  console.log('fetchProfile hydration pattern not matched');
}

// 3. Update handleCoverPhotoUpload
const oldUploadHandler = `      const response = await authApi.uploadCoverPhoto(file);
      const newCover = response?.data?.data?.coverPhoto || response?.data?.coverPhoto;
      if (newCover) {
        const normalized = normalizePhotoUrl(newCover);
        setCoverPhotoUrl(normalized);
        setProfile(prev => ({ ...prev, coverPhoto: normalized }));
        toast.success('Obsidian cover matrix updated');
      }`;

const newUploadHandler = `      const response = await authApi.uploadCoverPhoto(file);
      const newCover = response?.data?.data?.coverPhoto || response?.data?.coverPhoto || response?.coverPhoto;
      if (newCover) {
        setProfile(prev => ({ ...prev, coverPhoto: newCover }));
        const blobUrl = await fetchPhotoAsBlob(newCover);
        setCoverPhotoUrl(blobUrl || preview);
        toast.success('Obsidian cover matrix updated');
      } else {
        setCoverPhotoUrl(preview);
      }`;

if (norm.includes(oldUploadHandler)) {
  norm = norm.replace(oldUploadHandler, newUploadHandler);
  console.log('handleCoverPhotoUpload updated!');
} else {
  console.log('handleCoverPhotoUpload pattern not matched');
}

// 4. Update cover photo <img> tag with referrerPolicy="no-referrer"
const oldImg = `<img
                src={coverPhotoUrl}
                alt="Obsidian Cover"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />`;

const newImg = `<img
                src={coverPhotoUrl}
                alt="Obsidian Cover"
                referrerPolicy="no-referrer"
                onError={async () => {
                  if (profile?.coverPhoto && !coverPhotoUrl.startsWith('blob:')) {
                    const fallback = await fetchPhotoAsBlob(profile.coverPhoto);
                    if (fallback) setCoverPhotoUrl(fallback);
                  }
                }}
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />`;

if (norm.includes(oldImg)) {
  norm = norm.replace(oldImg, newImg);
  console.log('Cover photo <img> tag updated with no-referrer and onError fallback!');
} else {
  console.log('Cover photo <img> tag pattern not matched');
}

const finalContent = isCRLF ? norm.replace(/\n/g, '\r\n') : norm;
fs.writeFileSync(filePath, finalContent, 'utf8');
console.log('ProfileWorkspace.jsx patching finished!');

