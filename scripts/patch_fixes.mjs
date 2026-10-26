import fs from 'fs';
import path from 'path';

const lmsRoot = 'C:/Users/SHIVASAI/OneDrive/Desktop/LMS';

console.log('=== Starting Remediation Patches ===');

// 1. user-service Registration password mismatch fix
const regServiceFile = path.join(lmsRoot, 'user-service/src/main/java/com/user/register/service/RegistrationService.java');
let regServiceContent = fs.readFileSync(regServiceFile, 'utf8');

regServiceContent = regServiceContent.replace(
  'throw new RuntimeException("Password and Confirm Password do not match");',
  'throw new IllegalArgumentException("Password and Confirm Password do not match");'
);
regServiceContent = regServiceContent.replace(
  'throw new RuntimeException("Password is required");',
  'throw new IllegalArgumentException("Password is required");'
);
regServiceContent = regServiceContent.replace(
  'throw new RuntimeException("Confirm Password is required");',
  'throw new IllegalArgumentException("Confirm Password is required");'
);
regServiceContent = regServiceContent.replace(
  'throw new RuntimeException("Password is too weak");',
  'throw new IllegalArgumentException("Password is too weak");'
);
fs.writeFileSync(regServiceFile, regServiceContent, 'utf8');
console.log('1. Patched RegistrationService.java to throw IllegalArgumentException');

// Check RegistrationController.java exception handling
const regControllerFile = path.join(lmsRoot, 'user-service/src/main/java/com/user/register/controller/RegistrationController.java');
let regControllerContent = fs.readFileSync(regControllerFile, 'utf8');
if (!regControllerContent.includes('catch (IllegalArgumentException e)')) {
  regControllerContent = regControllerContent.replace(
    'catch (ResponseStatusException e) {\n            throw e;\n        }',
    'catch (ResponseStatusException e) {\n            throw e;\n        } catch (IllegalArgumentException e) {\n            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);\n        }'
  );
  fs.writeFileSync(regControllerFile, regControllerContent, 'utf8');
  console.log('2. Patched RegistrationController.java exception handling');
} else {
  console.log('2. RegistrationController.java already has IllegalArgumentException handler');
}

// 3. api-gateway JwtAuthenticationFilter.java: add /api/v1/certificates/verify/** to PUBLIC_PATHS
const gatewayFilterFile = path.join(lmsRoot, 'api-gateway/src/main/java/com/swachvega/apigateway/filter/JwtAuthenticationFilter.java');
let gatewayContent = fs.readFileSync(gatewayFilterFile, 'utf8');
if (!gatewayContent.includes('/api/v1/certificates/verify/**')) {
  gatewayContent = gatewayContent.replace(
    '"/api/v1/enrollments/internal/enroll",',
    '"/api/v1/enrollments/internal/enroll",\n            "/api/v1/certificates/verify/**",\n            "/api/v1/certificates/verify/*",'
  );
  fs.writeFileSync(gatewayFilterFile, gatewayContent, 'utf8');
  console.log('3. Patched api-gateway PUBLIC_PATHS with /api/v1/certificates/verify/**');
} else {
  console.log('3. api-gateway already contains /api/v1/certificates/verify/**');
}

// 4. notification-service NotificationController.java: add /mark-all-read endpoint
const notifControllerFile = path.join(lmsRoot, 'notification-service/src/main/java/com/example/notification/controller/NotificationController.java');
let notifContent = fs.readFileSync(notifControllerFile, 'utf8');
if (!notifContent.includes('markAllNotificationsRead') && !notifContent.includes('/mark-all-read')) {
  // Inject UserNotificationService into NotificationController
  notifContent = notifContent.replace(
    'private final NotificationService notificationService;',
    'private final NotificationService notificationService;\n    private final com.example.notification.service.UserNotificationService userNotificationService;'
  );
  const markAllMethod = `
    @PostMapping("/mark-all-read")
    public ResponseEntity<ApiResponse<String>> markAllNotificationsRead() {
        userNotificationService.markAllAsRead();
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read successfully", "OK"));
    }

    @PutMapping("/mark-all-read")
    public ResponseEntity<ApiResponse<String>> markAllNotificationsReadPut() {
        userNotificationService.markAllAsRead();
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read successfully", "OK"));
    }
`;
  notifContent = notifContent.replace(
    '@PostMapping("/{id}/retry")',
    `${markAllMethod}\n    @PostMapping("/{id}/retry")`
  );
  fs.writeFileSync(notifControllerFile, notifContent, 'utf8');
  console.log('4. Patched notification-service NotificationController with /mark-all-read');
} else {
  console.log('4. NotificationController already has /mark-all-read');
}

// 5. Expose Actuator Health for the 5 non-payment services
const actuatorServices = [
  { name: 'cart-service', port: 8081, type: 'properties' },
  { name: 'coupon-service', port: 8082, type: 'properties' },
  { name: 'instructor-service', port: 8088, type: 'properties' },
  { name: 'review-service', port: 8089, type: 'yml' },
  { name: 'notification-service', port: 8093, type: 'properties' },
];

for (const s of actuatorServices) {
  // a) build.gradle: add actuator dependency
  const bgFile = path.join(lmsRoot, s.name, 'build.gradle');
  let bg = fs.readFileSync(bgFile, 'utf8');
  if (!bg.includes('spring-boot-starter-actuator')) {
    bg = bg.replace(
      "implementation 'org.springframework.boot:spring-boot-starter-web'",
      "implementation 'org.springframework.boot:spring-boot-starter-web'\n    implementation 'org.springframework.boot:spring-boot-starter-actuator'"
    );
    fs.writeFileSync(bgFile, bg, 'utf8');
    console.log(`5a. Added actuator dependency to ${s.name}/build.gradle`);
  }

  // b) application config: expose health endpoint, hide details
  if (s.type === 'properties') {
    const propFile = path.join(lmsRoot, s.name, 'src/main/resources/application.properties');
    let prop = fs.existsSync(propFile) ? fs.readFileSync(propFile, 'utf8') : '';
    if (!prop.includes('management.endpoints.web.exposure.include')) {
      prop += `\n# Actuator Health Check (Docker)\nmanagement.endpoints.web.exposure.include=health\nmanagement.endpoint.health.show-details=never\n`;
      fs.writeFileSync(propFile, prop, 'utf8');
      console.log(`5b. Added management config to ${s.name}/application.properties`);
    }
  } else if (s.type === 'yml') {
    const ymlFile = path.join(lmsRoot, s.name, 'src/main/resources/application.yml');
    let yml = fs.existsSync(ymlFile) ? fs.readFileSync(ymlFile, 'utf8') : '';
    if (!yml.includes('exposure:') && !yml.includes('include: health')) {
      yml += `\nmanagement:\n  endpoints:\n    web:\n      exposure:\n        include: health\n  endpoint:\n    health:\n      show-details: never\n`;
      fs.writeFileSync(ymlFile, yml, 'utf8');
      console.log(`5b. Added management config to ${s.name}/application.yml`);
    }
  }

  // c) SecurityConfig.java: ensure /actuator/health is permitAll
  const srcDir = path.join(lmsRoot, s.name, 'src/main/java');
  function findSecurityConfig(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        const found = findSecurityConfig(full);
        if (found) return found;
      } else if (e.name === 'SecurityConfig.java') {
        return full;
      }
    }
    return null;
  }
  const secFile = findSecurityConfig(srcDir);
  if (secFile) {
    let secContent = fs.readFileSync(secFile, 'utf8');
    if (!secContent.includes('/actuator/health') && !secContent.includes('/actuator/**')) {
      if (secContent.includes('.requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html")')) {
        secContent = secContent.replace(
          '.requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html")',
          '.requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html", "/actuator/health")'
        );
      } else if (secContent.includes('.requestMatchers("/api/v1/auth/**", "/api/v1/courses/**")')) {
        secContent = secContent.replace(
          '.requestMatchers("/api/v1/auth/**", "/api/v1/courses/**")',
          '.requestMatchers("/api/v1/auth/**", "/api/v1/courses/**", "/actuator/health")'
        );
      } else if (secContent.includes('.authorizeHttpRequests(auth -> auth')) {
        secContent = secContent.replace(
          '.authorizeHttpRequests(auth -> auth',
          '.authorizeHttpRequests(auth -> auth\n                        .requestMatchers("/actuator/health").permitAll()'
        );
      }
      fs.writeFileSync(secFile, secContent, 'utf8');
      console.log(`5c. Added /actuator/health permitAll to ${s.name} SecurityConfig`);
    }
  }
}

console.log('=== All Remediation Patches Applied Successfully ===');
