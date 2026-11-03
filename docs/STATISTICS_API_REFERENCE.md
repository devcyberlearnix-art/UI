# FD_LMS / Asivo — Statistics API Reference

**Document Version**: 1.0  
**Service**: `cyberlearnix-admin-service`  
**Gateway Base URL**: `http://localhost:8079` (Internal port 8086)  
**Authentication**: Bearer JWT (Role: `MAIN_ADMIN` or `ADMIN` for management endpoints; None for public)

---

## 1. Overview of Endpoints

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/website-stats` | Admin (JWT) | Fetch active draft statistics configurations |
| `PUT` | `/api/v1/admin/website-stats` | Admin (JWT) | Update draft statistics configurations |
| `POST` | `/api/v1/admin/landing-page/publish` | Admin (JWT) | Publish current drafts to live and purge Redis cache |
| `GET` | `/api/v1/public/website-stats` | Public | Retrieve published statistics items directly |
| `GET` | `/api/v1/public/landing-page` | Public | Retrieve full landing page payload including statistics |

---

## 2. Admin Endpoints

### 2.1 Get Draft Statistics
- **Method**: `GET`
- **Path**: `/api/v1/admin/website-stats`
- **Headers**:
  ```http
  Authorization: Bearer <ADMIN_JWT_TOKEN>
  ```
- **Response**: `HTTP 200 OK`
  ```json
  [
    {
      "id": 1,
      "statKey": "ACTIVE_COURSES",
      "value": "280+",
      "label": "Engineering Courses",
      "subtext": "{\"m\":\"H\",\"k\":\"ACTIVE_COURSES\",\"p\":\"\",\"s\":\"+\",\"i\":\"BookOpen\",\"d\":0,\"desc\":\"Courses\"}",
      "displayOrder": 1,
      "isActive": true
    },
    {
      "id": 2,
      "statKey": "ENROLLED_ENGINEERS",
      "value": "75+",
      "label": "Enrolled Engineers",
      "subtext": "{\"m\":\"H\",\"k\":\"ENROLLED_ENGINEERS\",\"p\":\"\",\"s\":\"+\",\"i\":\"Users\",\"d\":0,\"desc\":\"Students\"}",
      "displayOrder": 2,
      "isActive": true
    },
    {
      "id": 3,
      "statKey": "AVERAGE_RATING",
      "value": "4.4",
      "label": "Platform Rating",
      "subtext": "{\"m\":\"A\",\"k\":\"AVERAGE_RATING\",\"p\":\"\",\"s\":\"/ 5.0\",\"i\":\"Star\",\"d\":1,\"desc\":\"Rating\"}",
      "displayOrder": 3,
      "isActive": true
    },
    {
      "id": 4,
      "statKey": "LEAD_INSTRUCTORS",
      "value": "16",
      "label": "Lead Instructors",
      "subtext": "{\"m\":\"A\",\"k\":\"LEAD_INSTRUCTORS\",\"p\":\"\",\"s\":\"\",\"i\":\"GraduationCap\",\"d\":0,\"desc\":\"Mentors\"}",
      "displayOrder": 4,
      "isActive": true
    }
  ]
  ```

---

### 2.2 Update Draft Statistics
- **Method**: `PUT`
- **Path**: `/api/v1/admin/website-stats`
- **Headers**:
  ```http
  Authorization: Bearer <ADMIN_JWT_TOKEN>
  Content-Type: application/json
  ```
- **Request Body**:
  An array of statistics configuration objects.
  ```json
  [
    {
      "statKey": "ACTIVE_COURSES",
      "value": "280+",
      "label": "Engineering Courses",
      "subtext": "{\"m\":\"H\",\"k\":\"ACTIVE_COURSES\",\"p\":\"\",\"s\":\"+\",\"i\":\"BookOpen\",\"d\":0,\"desc\":\"Courses\"}",
      "displayOrder": 1,
      "isActive": true
    }
  ]
  ```
- **Constraint Rules**:
  - `subtext` string must not exceed **100 characters** (enforced by compact serializer).
  - `statKey` must be unique per entry.
- **Responses**:
  - `HTTP 200 OK`: Statistics draft updated successfully.
  - `HTTP 401 Unauthorized`: Missing or invalid Bearer token.
  - `HTTP 403 Forbidden`: User does not hold `MAIN_ADMIN` or `ADMIN` authority.
  - `HTTP 409 Conflict`: Payload string length exceeds database column definition.

---

### 2.3 Publish Drafts to Live
- **Method**: `POST`
- **Path**: `/api/v1/admin/landing-page/publish`
- **Headers**:
  ```http
  Authorization: Bearer <ADMIN_JWT_TOKEN>
  ```
- **Request Body**: `{}` (Empty JSON object)
- **Response**: `HTTP 200 OK`
  ```json
  {
    "success": true,
    "message": "Landing page published successfully.",
    "version": 12,
    "publishedAt": "2026-11-01T06:38:09.112Z"
  }
  ```
- **Side Effects**:
  - Increments landing page version counter.
  - Evicts Redis key `public:landing-page`.

---

## 3. Public Endpoints

### 3.1 Get Public Landing Page Configuration
- **Method**: `GET`
- **Path**: `/api/v1/public/landing-page`
- **Auth**: None (Public)
- **Response**: `HTTP 200 OK`
  ```json
  {
    "version": 12,
    "heroSection": {
      "badgeText": "ENGINEERING EDUCATION REDEFINED",
      "mainHeading": "Master Cloud Architecture & Enterprise Systems",
      "subheading": "Hands-on, microservice-driven curricula created by senior engineers.",
      "primaryCtaText": "Explore Courses",
      "primaryCtaLink": "/courses",
      "secondaryCtaText": "View Learning Paths",
      "secondaryCtaLink": "#paths"
    },
    "statistics": [
      {
        "statKey": "ACTIVE_COURSES",
        "value": "280+",
        "label": "Engineering Courses",
        "subtext": "{\"m\":\"H\",\"k\":\"ACTIVE_COURSES\",\"p\":\"\",\"s\":\"+\",\"i\":\"BookOpen\",\"d\":0,\"desc\":\"Courses\"}",
        "displayOrder": 1
      },
      {
        "statKey": "ENROLLED_ENGINEERS",
        "value": "75+",
        "label": "Enrolled Engineers",
        "subtext": "{\"m\":\"H\",\"k\":\"ENROLLED_ENGINEERS\",\"p\":\"\",\"s\":\"+\",\"i\":\"Users\",\"d\":0,\"desc\":\"Students\"}",
        "displayOrder": 2
      },
      {
        "statKey": "AVERAGE_RATING",
        "value": "4.4",
        "label": "Platform Rating",
        "subtext": "{\"m\":\"A\",\"k\":\"AVERAGE_RATING\",\"p\":\"\",\"s\":\"/ 5.0\",\"i\":\"Star\",\"d\":1,\"desc\":\"Rating\"}",
        "displayOrder": 3
      },
      {
        "statKey": "LEAD_INSTRUCTORS",
        "value": "16",
        "label": "Lead Instructors",
        "subtext": "{\"m\":\"A\",\"k\":\"LEAD_INSTRUCTORS\",\"p\":\"\",\"s\":\"\",\"i\":\"GraduationCap\",\"d\":0,\"desc\":\"Mentors\"}",
        "displayOrder": 4
      }
    ],
    "navigation": [...]
  }
  ```

---

### 3.2 Get Public Website Stats
- **Method**: `GET`
- **Path**: `/api/v1/public/website-stats`
- **Auth**: None (Public)
- **Response**: `HTTP 200 OK`
  Returns an array of published statistics objects.

