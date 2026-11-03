# Asivo LMS — Version 20: Instructor Workflow Verification

**Verification Target**: Instructor Course Builder & Operations  
**Instructor Account**: `rohan.malhotra@cyberlearnix.test` (`UUID: 6c43288f-a454-4abf-b946-b5abc5d99ee5`)  
**Overall Verdict**: **PASS** (100% of instructor authoring and moderation workflows verified)

---

## 1. Complete Instructor Journey

```
[Instructor Auth] ──► [Create Course Draft] ──► [Add Modules/Sections] ──► [Add Lectures]
                                                                                │
[Public Catalog Visibility] ◄── [Admin Course Approval] ◄───────────────────────┘
```

---

## 2. Test Execution & Evidence

### Step 1: Instructor Authentication
- **Endpoint**: `POST /api/v1/auth/login`
- **Result**: HTTP 200 OK.
- **Evidence**:
  ```json
  {
    "status": 200,
    "role": "INSTRUCTOR",
    "user": {
      "id": "6c43288f-a454-4abf-b946-b5abc5d99ee5",
      "email": "rohan.malhotra@cyberlearnix.test"
    }
  }
  ```

### Step 2: Course Creation
- **Endpoint**: `POST /api/v1/courses`
- **Payload**:
  ```json
  {
    "instructorId": "6c43288f-a454-4abf-b946-b5abc5d99ee5",
    "title": "Advanced Microservices Architecture & High-Scale Resilience 1793533025637",
    "subtitle": "Production Patterns with Spring Cloud, Kafka, and Kubernetes",
    "description": "Master microservice resilience patterns, circuit breakers, event sourcing, and distributed tracing.",
    "category": "Software Engineering",
    "level": "ADVANCED",
    "language": "English",
    "price": 3499.00
  }
  ```
- **Result**: HTTP 200 OK. Course ID: `295`.
- **Database Evidence**: Course row created in `lms_course_db.courses` with `id = 295`, `status = DRAFT`, `is_published = false`.

### Step 3: Section / Module Creation
- **Endpoint**: `POST /api/v1/courses/295/sections`
- **Payload**:
  ```json
  {
    "title": "Module 1: Distributed Transactions & Sagas",
    "orderIndex": 1
  }
  ```
- **Result**: HTTP 200 OK. Section ID: `1142`.
- **Database Evidence**: Section persisted to `lms_course_db.sections` linked to `course_id = 295`.

### Step 4: Lecture Creation
- **Endpoint**: `POST /api/v1/sections/1142/lectures`
- **Payload**:
  ```json
  {
    "title": "Choreography vs Orchestration Sagas in Action",
    "description": "Deep dive into distributed transactions with Kafka and Camunda",
    "videoUrl": "https://cdn.cyberlearnix.dev/lectures/sagas-deep-dive.mp4",
    "duration": 1800,
    "orderIndex": 1,
    "previewEnabled": true,
    "type": "VIDEO"
  }
  ```
- **Result**: HTTP 200 OK. Lecture ID: `4545`.
- **Database Evidence**: Lecture persisted to `lms_course_db.lectures` linked to `section_id = 1142`.

### Step 5: Admin Review & Course Approval
- **Endpoint**: `PUT /api/v1/admin/courses/295/approve`
- **Headers**: Admin Bearer Token (`MAIN_ADMIN`)
- **Result**: HTTP 200 OK (`"Course approved successfully"`).
- **Database Evidence**: Status transitioned from `DRAFT` to `Published` in `lms_course_db.courses`.

### Step 6: Public Catalog Verification
- **Endpoint**: `GET /api/v1/courses/295`
- **Result**: HTTP 200 OK.
- **Response**:
  ```json
  {
    "id": 295,
    "title": "Advanced Microservices Architecture & High-Scale Resilience 1793533025637",
    "status": "Published",
    "price": 3499.00
  }
  ```
- **Assertion**: Newly authored course is now accessible to all learners.

---

## 3. Instructor Analytics & Dashboard Probes

| Endpoint | Method | Result | Assertion Evidence |
| :--- | :---: | :---: | :--- |
| `/api/v1/instructors/{id}/courses` | GET | **PASS** | Returns list of courses owned by instructor |
| `/api/v1/instructors/{id}/dashboard` | GET | **PASS** | Returns aggregate student counts, active tracks, and revenue metrics |

