const fs = require('fs');

const userServicePath = 'c:/Users/SHIVASAI/OneDrive/Desktop/LMS/user-service/src/main/java/com/user/register/service/UserService.java';
let content = fs.readFileSync(userServicePath, 'utf8');

// 1. In getUserProfile (around line 324)
if (!content.includes('.profilePhoto(profilePhoto)\n\n                .coverPhoto(user.getCoverPhoto())')) {
  content = content.replace(
    '.profilePhoto(profilePhoto)\n\n                .photoURL(profilePhoto)',
    '.profilePhoto(profilePhoto)\n\n                .coverPhoto(user.getCoverPhoto())\n\n                .photoURL(profilePhoto)'
  );
  console.log('Added coverPhoto to getUserProfile');
}

// 2. In updateUserProfile (around line 1176)
if (!content.includes('.profilePhoto(profilePhoto)\n\n                .coverPhoto(user.getCoverPhoto())\n\n                .photoURL(profilePhoto)\n\n                .avatar(profilePhoto)\n\n                .city(decrypt(user.getCity()))')) {
  content = content.replace(
    '.profilePhoto(profilePhoto)\n\n                .photoURL(profilePhoto)\n\n                .avatar(profilePhoto)\n\n                .city(decrypt(user.getCity()))',
    '.profilePhoto(profilePhoto)\n\n                .coverPhoto(user.getCoverPhoto())\n\n                .photoURL(profilePhoto)\n\n                .avatar(profilePhoto)\n\n                .city(decrypt(user.getCity()))'
  );
  console.log('Added coverPhoto to updateUserProfile');
}

// 3. In removeProfilePhoto (around line 942)
if (!content.includes('.profilePhoto(null)\n                .coverPhoto(user.getCoverPhoto())')) {
  content = content.replace(
    '.profilePhoto(null)\n                .photoURL(null)',
    '.profilePhoto(null)\n                .coverPhoto(user.getCoverPhoto())\n                .photoURL(null)'
  );
  console.log('Added coverPhoto to removeProfilePhoto');
}

// 4. In getAllUsers (around line 1370)
if (!content.includes('.profilePhoto(user.getProfilePhoto())\n                        .coverPhoto(user.getCoverPhoto())')) {
  content = content.replace(
    '.profilePhoto(user.getProfilePhoto())\n                        .city(decrypt(user.getCity()))',
    '.profilePhoto(user.getProfilePhoto())\n                        .coverPhoto(user.getCoverPhoto())\n                        .city(decrypt(user.getCity()))'
  );
  console.log('Added coverPhoto to getAllUsers');
}

// 5. In getUserById (around line 1428)
if (!content.includes('.profilePhoto(user.getProfilePhoto())\n\n                .coverPhoto(user.getCoverPhoto())')) {
  content = content.replace(
    '.profilePhoto(user.getProfilePhoto())\n\n                .city(decrypt(user.getCity()))',
    '.profilePhoto(user.getProfilePhoto())\n\n                .coverPhoto(user.getCoverPhoto())\n\n                .city(decrypt(user.getCity()))'
  );
  console.log('Added coverPhoto to getUserById');
}

fs.writeFileSync(userServicePath, content, 'utf8');
console.log('UserService.java patched successfully!');

