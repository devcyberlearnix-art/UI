const fs = require('fs');

const sec1 = 'c:/Users/SHIVASAI/OneDrive/Desktop/LMS/user-service/src/main/java/com/user/register/config/SecurityConfig.java';
let c1 = fs.readFileSync(sec1, 'utf8');
c1 = c1.replace('.requestMatchers("/api/v1/users/photo/**").authenticated()', '.requestMatchers("/api/v1/users/photo/**").permitAll()');
fs.writeFileSync(sec1, c1, 'utf8');
console.log('SecurityConfig.java updated');

const sec2 = 'c:/Users/SHIVASAI/OneDrive/Desktop/LMS/user-service/src/main/java/com/user/register/security/UnifiedSecurityConfig.java';
let c2 = fs.readFileSync(sec2, 'utf8');
c2 = c2.replace('.requestMatchers("/api/v1/users/photo/**").authenticated()', '.requestMatchers("/api/v1/users/photo/**").permitAll()');
fs.writeFileSync(sec2, c2, 'utf8');
console.log('UnifiedSecurityConfig.java updated');

const gw = 'c:/Users/SHIVASAI/OneDrive/Desktop/LMS/api-gateway/src/main/java/com/swachvega/apigateway/filter/JwtAuthenticationFilter.java';
let cgw = fs.readFileSync(gw, 'utf8');
if (!cgw.includes('"/api/v1/users/photo/**"')) {
  cgw = cgw.replace('"/api/v1/users/login/social",', '"/api/v1/users/login/social",\n            "/api/v1/users/photo/**",');
  fs.writeFileSync(gw, cgw, 'utf8');
  console.log('JwtAuthenticationFilter.java updated');
} else {
  console.log('JwtAuthenticationFilter.java already has photo path');
}

