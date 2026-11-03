const fs = require('fs');

const userServicePath = 'c:/Users/SHIVASAI/OneDrive/Desktop/LMS/user-service/src/main/java/com/user/register/service/UserService.java';
let content = fs.readFileSync(userServicePath, 'utf8');
const isCRLF = content.includes('\r\n');
let norm = content.replace(/\r\n/g, '\n');

// 1. In buildUserProfileFromUser
if (!norm.includes('.profilePhoto(profilePhoto)\n\n                .coverPhoto(user.getCoverPhoto())')) {
  norm = norm.replace(
    '.profilePhoto(profilePhoto)\n\n                .photoURL(profilePhoto)',
    '.profilePhoto(profilePhoto)\n\n                .coverPhoto(user.getCoverPhoto())\n\n                .photoURL(profilePhoto)'
  );
  console.log('Added coverPhoto to buildUserProfileFromUser');
}

// 2. In updateUserProfile
if (!norm.includes('.profilePhoto(profilePhoto)\n\n                .coverPhoto(user.getCoverPhoto())\n\n                .photoURL(profilePhoto)\n\n                .avatar(profilePhoto)')) {
  norm = norm.replace(
    '.profilePhoto(profilePhoto)\n\n                .photoURL(profilePhoto)\n\n                .avatar(profilePhoto)',
    '.profilePhoto(profilePhoto)\n\n                .coverPhoto(user.getCoverPhoto())\n\n                .photoURL(profilePhoto)\n\n                .avatar(profilePhoto)'
  );
  console.log('Added coverPhoto to updateUserProfile');
}

// 3. In removeProfilePhoto
if (!norm.includes('.profilePhoto(null)\n                .coverPhoto(user.getCoverPhoto())')) {
  norm = norm.replace(
    '.profilePhoto(null)\n                .photoURL(null)',
    '.profilePhoto(null)\n                .coverPhoto(user.getCoverPhoto())\n                .photoURL(null)'
  );
  console.log('Added coverPhoto to removeProfilePhoto');
}

// 4. In getAllUsers
if (!norm.includes('.profilePhoto(user.getProfilePhoto())\n                        .coverPhoto(user.getCoverPhoto())')) {
  norm = norm.replace(
    '.profilePhoto(user.getProfilePhoto())\n                        .city(decrypt(user.getCity()))',
    '.profilePhoto(user.getProfilePhoto())\n                        .coverPhoto(user.getCoverPhoto())\n                        .city(decrypt(user.getCity()))'
  );
  console.log('Added coverPhoto to getAllUsers');
}

// 5. In getUserById
if (!norm.includes('.profilePhoto(user.getProfilePhoto())\n\n                .coverPhoto(user.getCoverPhoto())')) {
  norm = norm.replace(
    '.profilePhoto(user.getProfilePhoto())\n\n                .city(decrypt(user.getCity()))',
    '.profilePhoto(user.getProfilePhoto())\n\n                .coverPhoto(user.getCoverPhoto())\n\n                .city(decrypt(user.getCity()))'
  );
  console.log('Added coverPhoto to getUserById');
}

const finalContent = isCRLF ? norm.replace(/\n/g, '\r\n') : norm;
fs.writeFileSync(userServicePath, finalContent, 'utf8');
console.log('UserService.java patched and written with original line endings!');

