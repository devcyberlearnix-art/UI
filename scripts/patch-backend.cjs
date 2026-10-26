const fs = require('fs');
const path = require('path');

const LMS_ROOT = 'C:\\Users\\SHIVASAI\\OneDrive\\Desktop\\LMS';

// 1. Update SecurityConfig.java
const secPath = path.join(LMS_ROOT, 'course-service', 'src', 'main', 'java', 'com', 'lms', 'courseservice', 'config', 'SecurityConfig.java');
let secContent = fs.readFileSync(secPath, 'utf8');

const needle = '.requestMatchers(HttpMethod.PUT, "/api/v1/assignments/*", "/api/v1/assignments/*/submission/*/grade")';
const patchInsert = `.requestMatchers(HttpMethod.PUT, "/api/v1/assignments/*", "/api/v1/assignments/*/submission/*/grade", "/api/v1/assignments/submissions/*/grade")
                        .hasAnyRole("INSTRUCTOR", "MAIN_ADMIN", "SUB_ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/assignments/*/publish", "/api/v1/assignments/*/unpublish", "/api/v1/assignments/submissions/*/grade")`;

if (secContent.includes(needle)) {
  secContent = secContent.replace(needle, patchInsert);
  fs.writeFileSync(secPath, secContent, 'utf8');
  console.log('✅ SecurityConfig.java patched successfully');
} else if (secContent.includes('/api/v1/assignments/*/publish')) {
  console.log('ℹ️ SecurityConfig.java already includes PATCH matchers');
} else {
  console.log('⚠️ SecurityConfig.java needle not found');
}

// 2. Update SubmissionService.java to throw AccessDeniedException on enrollment failure
const subServicePath = path.join(LMS_ROOT, 'course-service', 'src', 'main', 'java', 'com', 'lms', 'courseservice', 'service', 'SubmissionService.java');
let subContent = fs.readFileSync(subServicePath, 'utf8');

if (!subContent.includes('org.springframework.security.access.AccessDeniedException')) {
  subContent = subContent.replace(
    'import lombok.RequiredArgsConstructor;',
    'import lombok.RequiredArgsConstructor;\nimport org.springframework.security.access.AccessDeniedException;'
  );
}

subContent = subContent.replace(
  'throw new AssignmentException("Student is not enrolled in this course");',
  'throw new AccessDeniedException("Student is not enrolled in this course. Course enrollment is required.");'
);
fs.writeFileSync(subServicePath, subContent, 'utf8');
console.log('✅ SubmissionService.java patched successfully');

// 3. Update AssignmentController.java to enforce enrollment and staff roles
const assignCtrlPath = path.join(LMS_ROOT, 'course-service', 'src', 'main', 'java', 'com', 'lms', 'courseservice', 'controller', 'AssignmentController.java');
let assignContent = fs.readFileSync(assignCtrlPath, 'utf8');

// Ensure imports
if (!assignContent.includes('org.springframework.security.access.AccessDeniedException')) {
  assignContent = assignContent.replace(
    'import com.lms.courseservice.service.SubmissionService;',
    'import com.lms.courseservice.service.SubmissionService;\nimport com.lms.courseservice.repository.EnrollmentRepository;\nimport org.springframework.security.access.AccessDeniedException;\nimport org.springframework.security.core.Authentication;\nimport org.springframework.security.core.context.SecurityContextHolder;'
  );
}

// Add enrollmentRepository dependency
if (!assignContent.includes('private final EnrollmentRepository enrollmentRepository;')) {
  assignContent = assignContent.replace(
    'private final SubmissionService submissionService;',
    'private final SubmissionService submissionService;\n    private final EnrollmentRepository enrollmentRepository;'
  );
}

// Add helper to check if caller is staff
if (!assignContent.includes('private boolean isStaff()')) {
  assignContent = assignContent.replace(
    'private UUID extractUserId() {',
    `private boolean isStaff() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getAuthorities() == null) return false;
        return auth.getAuthorities().stream().anyMatch(a -> {
            String role = a.getAuthority();
            return "ROLE_INSTRUCTOR".equals(role) || "ROLE_MAIN_ADMIN".equals(role) || "ROLE_SUB_ADMIN".equals(role);
        });
    }

    private UUID extractUserId() {`
  );
}

// Normalize line endings to \n
assignContent = assignContent.replace(/\r\n/g, '\n');

// Protect getAssignmentsByCourse with PreAuthorize
assignContent = assignContent.replace(
  '    @GetMapping("/course/{courseId}")\n    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getAssignmentsByCourse(@PathVariable Long courseId)',
  '    @PreAuthorize("hasAnyRole(\'INSTRUCTOR\',\'MAIN_ADMIN\',\'SUB_ADMIN\')")\n    @GetMapping("/course/{courseId}")\n    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getAssignmentsByCourse(@PathVariable Long courseId)'
);

// Protect getAssignmentsBySection with PreAuthorize
assignContent = assignContent.replace(
  '    @GetMapping("/section/{sectionId}")\n    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getAssignmentsBySection(@PathVariable Long sectionId)',
  '    @PreAuthorize("hasAnyRole(\'INSTRUCTOR\',\'MAIN_ADMIN\',\'SUB_ADMIN\')")\n    @GetMapping("/section/{sectionId}")\n    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getAssignmentsBySection(@PathVariable Long sectionId)'
);

// Update getPublishedAssignmentsByCourse to verify enrollment for students
const oldPub = `    @GetMapping("/course/{courseId}/published")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getPublishedAssignmentsByCourse(@PathVariable Long courseId) {
        List<AssignmentResponse> response = assignmentService.getPublishedAssignmentsByCourse(courseId);`;

const newPub = `    @GetMapping("/course/{courseId}/published")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getPublishedAssignmentsByCourse(@PathVariable Long courseId) {
        if (!isStaff()) {
            UUID studentId = extractUserId();
            if (!enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
                throw new AccessDeniedException("Student is not enrolled in this course. Course enrollment is required.");
            }
        }
        List<AssignmentResponse> response = assignmentService.getPublishedAssignmentsByCourse(courseId);`;

if (assignContent.includes(oldPub)) {
  assignContent = assignContent.replace(oldPub, newPub);
  console.log('✅ getPublishedAssignmentsByCourse enrollment check added');
} else {
  console.log('ℹ️ getPublishedAssignmentsByCourse already patched or not found');
}

// Update getAssignment to verify enrollment for students
const oldGetOne = `    @GetMapping("/{assignmentId}")
    public ResponseEntity<ApiResponse<AssignmentResponse>> getAssignment(@PathVariable Long assignmentId) {
        AssignmentResponse response = assignmentService.getAssignment(assignmentId);`;

const newGetOne = `    @GetMapping("/{assignmentId}")
    public ResponseEntity<ApiResponse<AssignmentResponse>> getAssignment(@PathVariable Long assignmentId) {
        AssignmentResponse response = assignmentService.getAssignment(assignmentId);
        if (!isStaff()) {
            UUID studentId = extractUserId();
            if (!enrollmentRepository.existsByStudentIdAndCourseId(studentId, response.getCourseId())) {
                throw new AccessDeniedException("Student is not enrolled in this course. Course enrollment is required.");
            }
        }`;

if (assignContent.includes(oldGetOne)) {
  assignContent = assignContent.replace(oldGetOne, newGetOne);
  console.log('✅ getAssignment enrollment check added');
} else {
  console.log('ℹ️ getAssignment already patched or not found');
}

fs.writeFileSync(assignCtrlPath, assignContent, 'utf8');
console.log('✅ AssignmentController.java saved successfully');

