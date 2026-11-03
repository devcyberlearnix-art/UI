# FD_LMS / Asivo — Statistics Data Sources & Database Mapping

**Document Version**: 1.0  
**Scope**: Schema definitions, SQL aggregations, Redis cache topology, and service sources for platform statistics  
**Target Databases**: PostgreSQL 16 Instances on `localhost:15432`

---

## 1. Database Schema Definitions

### 1.1 Admin CMS Service Database (`lms_admin_db`)
Table: `website_statistics`
```sql
CREATE TABLE website_statistics (
    id BIGSERIAL PRIMARY KEY,
    stat_key VARCHAR(50) NOT NULL UNIQUE,
    value VARCHAR(50) NOT NULL,
    label VARCHAR(100) NOT NULL,
    subtext VARCHAR(100) NULL, -- Note: Constrained to 100 characters; holds compact JSON
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_published BOOLEAN NOT NULL DEFAULT false,
    version_id BIGINT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_website_stats_active_order ON website_statistics(is_active, display_order);
CREATE INDEX idx_website_stats_published ON website_statistics(is_published);
```

---

### 1.2 Course Service Database (`lms_course_db`)
Table: `courses`
```sql
CREATE TABLE courses (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'DRAFT', 'PUBLISHED', 'ARCHIVED'
    deleted BOOLEAN NOT NULL DEFAULT false,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Metric Calculation Query (`ACTIVE_COURSES`):
```sql
SELECT COUNT(*) AS active_courses_count
FROM courses
WHERE status = 'PUBLISHED' 
  AND deleted = false;
```
*Current Live Output*: **287**

---

### 1.3 Order Service Database (`lms_order_db`)
Table: `orders`
```sql
CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY, -- UUID
    user_id VARCHAR(36) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'PENDING', 'COMPLETED', 'CANCELLED'
    total_amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Table: `course_enrollments` (`lms_course_db`)
```sql
CREATE TABLE course_enrollments (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    course_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'ACTIVE', 'REVOKED'
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Metric Calculation Query (`ENROLLED_ENGINEERS`):
```sql
-- Distinct active student engineers across both systems
SELECT COUNT(DISTINCT user_id) AS distinct_students_count
FROM course_enrollments
WHERE status = 'ACTIVE';

-- Cross-verified against completed orders:
SELECT 
    COUNT(*) AS total_orders,
    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) AS completed_orders,
    COUNT(DISTINCT user_id) AS distinct_purchasers
FROM orders;
```
*Current Live Output*:
- Total orders: **171**
- Completed orders: **100**
- Distinct enrolled student engineers: **75**

---

### 1.4 Review Service Database (`lms_review_db`)
Table: `reviews`
```sql
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'REJECTED', 'PENDING'
    deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Metric Calculation Query (`AVERAGE_RATING`):
```sql
SELECT 
    COUNT(*) AS total_reviews,
    SUM(rating) AS total_score,
    ROUND(AVG(rating)::numeric, 2) AS exact_average,
    ROUND(AVG(rating)::numeric, 1) AS rounded_average
FROM reviews
WHERE status = 'ACTIVE' 
  AND deleted = false;
```
*Current Live Output*:
- Total active reviews: **19**
- Total score: **83.0**
- Exact average: **4.37 / 5.0**
- Rounded average: **4.4 / 5.0**

---

### 1.5 User Service Database (`lms_user_db`)
Table: `users`
```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL, -- 'STUDENT', 'INSTRUCTOR', 'ADMIN', 'MAIN_ADMIN'
    active BOOLEAN NOT NULL DEFAULT true,
    deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Metric Calculation Query (`LEAD_INSTRUCTORS`):
```sql
SELECT COUNT(*) AS active_instructors_count
FROM users
WHERE role = 'INSTRUCTOR' 
  AND active = true 
  AND deleted = false;
```
*Current Live Output*: **16**

---

## 2. Redis Caching Architecture

| Cache Key | Data Type | TTL | Purpose | Invalidation Event |
| :--- | :--- | :--- | :--- | :--- |
| `public:landing-page` | String (JSON) | 300 seconds (5 min) | Fast edge serving of hero, stats, nav | Admin publishes changes (`POST /landing-page/publish`) |
| `public:website-stats`| String (JSON) | 300 seconds (5 min) | Direct statistics payload | Admin publishes changes |
| `course:catalog:summary`| String (JSON) | 600 seconds (10 min) | Catalog count cache | Instructor creates/publishes course |
| `review:platform:avg` | String (JSON) | 900 seconds (15 min) | Cached platform review score | Learner submits new approved review |

---

## 3. Data Integrity & Cold-Start Protections

1. **Fallback Skeletons**:
   - If Redis is cold and PostgreSQL is undergoing maintenance, the frontend calculator defaults to static fallback metadata defined in `DEFAULT_STATISTICS_CONFIG`.
2. **Double-Counting Prevention**:
   - Counting distinct `user_id` instead of raw rows in `course_enrollments` or `orders` guarantees that single students who purchase 5 courses are not counted as 5 separate engineers.
3. **Draft Isolation**:
   - The admin database uses `is_published = true/false` flags. Operations on draft items do not touch live keys until explicit publish triggers are executed.

