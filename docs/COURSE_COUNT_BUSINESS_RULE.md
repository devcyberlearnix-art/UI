# FD_LMS / Asivo — Course Count Business Rule Specification

## 1. Executive Summary & Defect Root Cause

### 1.1 Historical Defect
Prior to Version 14, the public platform statistics banner displayed **287** as the total number of "Active Courses". 
A database audit revealed the following distribution in `lms_course_db.courses`:

| Course Status | Database Record Count | Business Classification | Exposure in Public Catalog |
|:---|:---:|:---|:---|
| **`PUBLISHED`** | **228** | Active, verified, publicly enrollable courses | **Allowed** |
| **`ARCHIVED`** | **31** | Retired curricula, legacy versions, deprecated | **Excluded** |
| **`DRAFT`** | **28** | Authoring in-progress, pending QA/compliance | **Excluded** |
| **TOTAL** | **287** | All database rows | — |

The previous Course Service implementation in `com.lms.courseservice.service.CourseService` invoked:
```java
// DEFECTIVE IMPLEMENTATION:
Page<Course> coursePage = courseRepository.findAll(pageable);
```
This unfiltered pagination query leaked all 31 archived courses and 28 draft courses to the public `/api/v1/courses` endpoint, causing the public catalog's pagination metadata (`totalElements`) to report 287 courses. Consequently, both the public landing page hero statistics and the catalog pagination presented draft and retired curricula to prospective students.

---

## 2. Authoritative Business Rule Definition

### 2.1 The Active Published Course Rule
A course is classified as **Active** and eligible for public catalog aggregation, public search indexing, and public telemetry reporting **if and only if**:
1. `courses.status = 'PUBLISHED'` (case-insensitive string comparison: `"PUBLISHED"`).
2. It is not marked `ARCHIVED`.
3. It is not marked `DRAFT`.
4. It is not logically or physically deleted (`is_deleted = false` or row absence).

```
Active Courses = Total Courses (287) - Archived Courses (31) - Draft Courses (28) = Exactly 228
```

### 2.2 System Invariant & Uniformity
The total count displayed in the platform telemetry statistic must **always** equal the `totalElements` reported by the public catalog pagination endpoint `GET /api/v1/courses`. The platform telemetry and catalog exploration must maintain 100% semantic and mathematical parity.

---

## 3. Backend Implementation & Query Modification

### 3.1 Repository Method Addition
File: `c:\Users\SHIVASAI\OneDrive\Desktop\LMS\course-service\src\main\java\com\lms\courseservice\repository\CourseRepository.java`

```java
package com.lms.courseservice.repository;

import com.lms.courseservice.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    
    /**
     * Find all active courses filtered strictly by status.
     * Used for public catalog listing to guarantee draft and archived isolation.
     */
    Page<Course> findByStatusIgnoreCase(String status, Pageable pageable);
    
    // ... other methods
}
```

### 3.2 Service Layer Update
File: `c:\Users\SHIVASAI\OneDrive\Desktop\LMS\course-service\src\main\java\com\lms\courseservice\service\CourseService.java`

```java
@Transactional(readOnly = true)
public CoursePageResponse getAllCourses(Pageable pageable) {
    log.info("Fetching public courses with pageable: {}, strictly filtering for PUBLISHED status", pageable);
    
    // BUSINESS INTEGRITY RULE: Exclude DRAFT (28) and ARCHIVED (31) courses from public catalog
    Page<Course> coursePage = courseRepository.findByStatusIgnoreCase("PUBLISHED", pageable);
    
    List<CourseResponse> courseResponses = coursePage.getContent().stream()
            .map(courseMapper::toResponse)
            .collect(Collectors.toList());

    return CoursePageResponse.builder()
            .content(courseResponses)
            .pageNumber(coursePage.getNumber())
            .pageSize(coursePage.getSize())
            .totalElements(coursePage.getTotalElements())
            .totalPages(coursePage.getTotalPages())
            .isLast(coursePage.isLast())
            .build();
}
```

---

## 4. Verification & Live Evidence

### 4.1 Live Gateway Endpoint Verification
Querying `GET http://localhost:8079/api/v1/courses?page=0&size=5`:
```json
{
  "totalElements": 228,
  "totalPages": 46,
  "size": 5,
  "numberOfElements": 5,
  "firstCourseStatus": "PUBLISHED"
}
```

### 4.2 Comprehensive Status Verification Across All 228 Records
Executing full catalog query `GET http://localhost:8079/api/v1/courses?page=0&size=250`:
```javascript
Count: 228
Unique statuses in response: [ 'PUBLISHED' ]
```
Zero non-published records are exposed in the catalog.

### 4.3 Database Direct Verification
```sql
SELECT status, count(*) 
FROM courses 
GROUP BY status;
```
Result:
- `PUBLISHED`: 228
- `ARCHIVED`: 31
- `DRAFT`: 28
- Total: 287

---

## 5. Architectural Compliance & Sign-Off
- **Status**: `PASS`
- **Catalog totalElements**: `228`
- **Telemetry Active Courses**: `228`
- **No Hardcoding**: Value is computed dynamically via Spring Data JPA `findByStatusIgnoreCase("PUBLISHED", pageable)`.

