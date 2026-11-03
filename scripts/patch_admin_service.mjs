import fs from 'fs';

const courseClientPath = 'C:\\Users\\SHIVASAI\\OneDrive\\Desktop\\LMS\\admin-service\\src\\main\\java\\com\\example\\admin\\client\\AdminCourseServiceClient.java';
let courseContent = fs.readFileSync(courseClientPath, 'utf8');

// 1. Fix getAllCourses()
const oldGetAllCourses = `    public List<CourseDTO> getAllCourses() {
        try {
            String url = courseServiceUrl + "/api/v1/courses";
            ResponseEntity<Object[]> response = restTemplate.exchange(
                    url,
                    org.springframework.http.HttpMethod.GET,
                    new HttpEntity<>(createHeaders()),
                    Object[].class
            );
            return parseCourseList(response.getBody());
        } catch (RestClientException e) {
            System.err.println("✗ Failed to get courses from Course Service: " + e.getMessage());
            return List.of();
        }
    }`;

const newGetAllCourses = `    public List<CourseDTO> getAllCourses() {
        try {
            String url = courseServiceUrl + "/api/v1/courses?page=0&size=1000";
            ResponseEntity<Object> response = restTemplate.exchange(
                    url,
                    org.springframework.http.HttpMethod.GET,
                    new HttpEntity<>(createHeaders()),
                    Object.class
            );
            return parseCourseList(response.getBody());
        } catch (RestClientException e) {
            System.err.println("✗ Failed to get courses from Course Service: " + e.getMessage());
            return List.of();
        }
    }`;

// 2. Fix getCoursesByInstructor()
const oldGetByInst = `    public List<CourseDTO> getCoursesByInstructor(String instructorId) {
        try {
            String courseUrl = courseServiceUrl + "/api/v1/courses?instructorId=" + instructorId;
            ResponseEntity<Object[]> response = restTemplate.exchange(
                    courseUrl,
                    org.springframework.http.HttpMethod.GET,
                    new HttpEntity<>(createHeaders()),
                    Object[].class
            );
            return parseCourseList(response.getBody());
        } catch (RestClientException e) {
            System.err.println("✗ Failed to get courses for instructor: " + e.getMessage());
            return List.of();
        }
    }`;

const newGetByInst = `    public List<CourseDTO> getCoursesByInstructor(String instructorId) {
        try {
            String courseUrl = courseServiceUrl + "/api/v1/courses?page=0&size=1000&instructorId=" + instructorId;
            ResponseEntity<Object> response = restTemplate.exchange(
                    courseUrl,
                    org.springframework.http.HttpMethod.GET,
                    new HttpEntity<>(createHeaders()),
                    Object.class
            );
            return parseCourseList(response.getBody());
        } catch (RestClientException e) {
            System.err.println("✗ Failed to get courses for instructor: " + e.getMessage());
            return List.of();
        }
    }`;

// 3. Fix parseCourseList
const oldParse = `    private List<CourseDTO> parseCourseList(Object[] body) {
        if (body == null) {
            return List.of();
        }
        List<CourseDTO> result = new ArrayList<>();
        for (Object item : body) {
            result.add(mapToCourseDto(item));
        }
        return result;
    }`;

const newParse = `    private List<CourseDTO> parseCourseList(Object body) {
        if (body == null) {
            return List.of();
        }
        if (body instanceof Object[] arr) {
            List<CourseDTO> result = new ArrayList<>();
            for (Object item : arr) {
                CourseDTO dto = mapToCourseDto(item);
                if (dto != null) result.add(dto);
            }
            return result;
        }
        if (body instanceof List<?> list) {
            List<CourseDTO> result = new ArrayList<>();
            for (Object item : list) {
                CourseDTO dto = mapToCourseDto(item);
                if (dto != null) result.add(dto);
            }
            return result;
        }
        if (body instanceof Map<?, ?> map) {
            if (map.get("content") instanceof List<?> contentList) {
                return parseCourseList(contentList);
            }
            if (map.get("data") instanceof List<?> dataList) {
                return parseCourseList(dataList);
            }
            if (map.get("courses") instanceof List<?> coursesList) {
                return parseCourseList(coursesList);
            }
        }
        return List.of();
    }`;

courseContent = courseContent.replace(/\r\n/g, '\n');
const normalizedOldGetAll = oldGetAllCourses.replace(/\r\n/g, '\n');
const normalizedOldGetByInst = oldGetByInst.replace(/\r\n/g, '\n');
const normalizedOldParse = oldParse.replace(/\r\n/g, '\n');

if (!courseContent.includes(normalizedOldGetAll)) {
  console.error('Could not find oldGetAllCourses in AdminCourseServiceClient.java');
} else {
  courseContent = courseContent.replace(normalizedOldGetAll, newGetAllCourses.replace(/\r\n/g, '\n'));
  console.log('Replaced getAllCourses');
}

if (!courseContent.includes(normalizedOldGetByInst)) {
  console.error('Could not find oldGetByInst in AdminCourseServiceClient.java');
} else {
  courseContent = courseContent.replace(normalizedOldGetByInst, newGetByInst.replace(/\r\n/g, '\n'));
  console.log('Replaced getCoursesByInstructor');
}

if (!courseContent.includes(normalizedOldParse)) {
  console.error('Could not find oldParse in AdminCourseServiceClient.java');
} else {
  courseContent = courseContent.replace(normalizedOldParse, newParse.replace(/\r\n/g, '\n'));
  console.log('Replaced parseCourseList');
}

fs.writeFileSync(courseClientPath, courseContent);
console.log('AdminCourseServiceClient.java written.');

// Now patch AdminAuthService.java
const authPath = 'C:\\Users\\SHIVASAI\\OneDrive\\Desktop\\LMS\\admin-service\\src\\main\\java\\com\\example\\admin\\service\\AdminAuthService.java';
let authContent = fs.readFileSync(authPath, 'utf8').replace(/\r\n/g, '\n');

const oldAuthBlock = `        auditService.logAction(admin.getId(), "ADMIN_OTP_LOGIN");

        String firstName = decryptSafely(admin.getFirstName(), "Admin");
        String lastName = decryptSafely(admin.getLastName(), "");
        String mobileNumber = decryptSafely(admin.getMobileNumber(), "");

        return AdminLoginResponse.builder()
                .admin(AdminLoginResponse.AdminInfo.builder()
                        .id(admin.getId())
                        .email(admin.getEmail())
                        .role(admin.getRole())
                        .assignedService(admin.getAssignedService() != null ? admin.getAssignedService().name() : "ALL")
                        .adminType(admin.getAdminType() != null ? admin.getAdminType().name() : "MAIN_ADMIN")
                        .firstName(firstName)
                        .lastName(lastName)
                        .mobileNumber(mobileNumber)
                        .build())
                .authentication(AdminLoginResponse.AuthenticationInfo.builder()
                        .accessToken("")
                        .accessTokenExpiresIn("")
                        .refreshToken("")
                        .refreshTokenExpiresIn("")
                        .build())`;

const newAuthBlock = `        auditService.logAction(admin.getId(), "ADMIN_OTP_LOGIN");

        String accessToken = jwtService.generateAccessToken(
                admin.getId().toString(),
                admin.getEmail(),
                admin.getRole(),
                admin.getAdminType() != null ? admin.getAdminType().name() : "MAIN_ADMIN",
                admin.getAssignedService() != null ? admin.getAssignedService().name() : "ALL"
        );

        String refreshToken = jwtService.generateRefreshToken(
                admin.getId().toString(),
                admin.getEmail(),
                admin.getRole()
        );

        String firstName = decryptSafely(admin.getFirstName(), "Admin");
        String lastName = decryptSafely(admin.getLastName(), "");
        String mobileNumber = decryptSafely(admin.getMobileNumber(), "");

        return AdminLoginResponse.builder()
                .admin(AdminLoginResponse.AdminInfo.builder()
                        .id(admin.getId())
                        .email(admin.getEmail())
                        .role(admin.getRole())
                        .assignedService(admin.getAssignedService() != null ? admin.getAssignedService().name() : "ALL")
                        .adminType(admin.getAdminType() != null ? admin.getAdminType().name() : "MAIN_ADMIN")
                        .firstName(firstName)
                        .lastName(lastName)
                        .mobileNumber(mobileNumber)
                        .build())
                .authentication(AdminLoginResponse.AuthenticationInfo.builder()
                        .accessToken(accessToken)
                        .accessTokenExpiresIn("15m")
                        .refreshToken(refreshToken)
                        .refreshTokenExpiresIn("7d")
                        .build())`;

if (!authContent.includes(oldAuthBlock)) {
  console.error('Could not find oldAuthBlock in AdminAuthService.java');
} else {
  authContent = authContent.replace(oldAuthBlock, newAuthBlock);
  fs.writeFileSync(authPath, authContent);
  console.log('AdminAuthService.java patched.');
}

