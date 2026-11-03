import fs from 'fs';

// 1. Fix SecurityConfig.java in course-service
const secConfigPath = 'c:/Users/SHIVASAI/OneDrive/Desktop/LMS/course-service/src/main/java/com/lms/courseservice/config/SecurityConfig.java';
let secContent = fs.readFileSync(secConfigPath, 'utf8');

const badLine1 = secContent.indexOf('// Get course progress');
if (badLine1 !== -1) {
  const badLineEnd = secContent.indexOf('// ============== QUIZ MANAGEMENT', badLine1);
  if (badLineEnd !== -1) {
    const replacement = `// Get course progress
                        .requestMatchers(HttpMethod.GET, "/api/v1/progress/courses", "/api/v1/progress/courses/**").authenticated()
                        // Resume learning
                        .requestMatchers(HttpMethod.GET, "/api/v1/progress/courses/*/resume").authenticated()

                        `;
    secContent = secContent.slice(0, badLine1) + replacement + secContent.slice(badLineEnd);
    fs.writeFileSync(secConfigPath, secContent, 'utf8');
    console.log('SecurityConfig.java patched successfully!');
  }
}

// 2. Add /courses mapping to ProgressController.java
const progCtrlPath = 'c:/Users/SHIVASAI/OneDrive/Desktop/LMS/course-service/src/main/java/com/lms/courseservice/controller/ProgressController.java';
let progContent = fs.readFileSync(progCtrlPath, 'utf8');

if (!progContent.includes('dashboardService')) {
  progContent = progContent.replace(
    'private final JwtUtil jwtUtil;',
    'private final JwtUtil jwtUtil;\n    private final com.lms.courseservice.service.DashboardService dashboardService;'
  );

  const newMethod = `
    /**
     * Get student's enrolled courses with progress or dashboard overview
     * GET /api/v1/progress/courses
     */
    @GetMapping({"", "/courses"})
    public ResponseEntity<ApiResponse<com.lms.courseservice.dto.StudentDashboardResponse>> getStudentDashboardViaProgress() {
        UUID studentId = extractUserId();
        var response = dashboardService.getStudentDashboard(studentId);
        return ResponseEntity.ok(
                ApiResponse.<com.lms.courseservice.dto.StudentDashboardResponse>builder()
                        .success(true)
                        .message("Course progress retrieved successfully")
                        .data(response)
                        .timestamp(getCurrentTimestamp())
                        .build()
        );
    }
`;

  const lastBrace = progContent.lastIndexOf('}');
  progContent = progContent.slice(0, lastBrace) + newMethod + '\n}\n';
  fs.writeFileSync(progCtrlPath, progContent, 'utf8');
  console.log('ProgressController.java patched successfully with /courses mapping!');
}
