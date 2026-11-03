# FD_LMS / Asivo — Statistics Metadata Compatibility & Schema Governance

## 1. Executive Summary & Root Cause Analysis

### 1.1 The Truncation Defect
In Version 12 and Version 13, public visitors observed truncated words in the statistics banner:
- `"Distinct verified engi"` (cut off mid-word from "engineers")
- `"Verified student revie"` (cut off mid-word from "reviews")
- `"Active senior architec"` (cut off mid-word from "architects")

### 1.2 Root Cause
The PostgreSQL database table `cms_website_statistics` defines the `subtext` column with a strict constraint:
```sql
subtext VARCHAR(100)
```
To encode CMS calculation modes (`AUTOMATIC`, `HYBRID`, `MANUAL`), prefixes (`★ `), suffixes (`+`), decimal precision, and keys without altering the underlying database schema, a previous developer packed metadata into `subtext` using JSON.
However, to ensure the JSON string stayed under 100 characters, they applied an arbitrary character slice:
```javascript
// DEFECTIVE IMPLEMENTATION:
txt: (stat.description || '').slice(0, 22)
```
This slice truncated multi-word descriptions mid-character, degrading visual quality and brand trust on the landing page.

---

## 2. Solution Design: Complete Descriptions with Compact Encoding

### 2.1 Complete Descriptions Standard
The descriptions were redesigned to be concise, natural, informative, and **complete words**:

| Statistic Key | Clean Complete Description | Description Length |
|:---|:---|:---:|
| `ACTIVE_COURSES` | `"Published courses"` | 17 chars |
| `ENROLLED_ENGINEERS` | `"Verified enrollments"` | 20 chars |
| `AVERAGE_RATING` | `"Genuine student reviews"` | 23 chars |
| `LEAD_INSTRUCTORS` | `"Active approved instructors"` | 26 chars |

### 2.2 Compact Metadata Schema
The JSON serializer (`serializeStatisticRecord`) encodes essential CMS flags using single-letter and abbreviated property names:
- `m`: Data mode (`A` = AUTOMATIC, `H` = HYBRID, `M` = MANUAL)
- `k`: Statistic Key
- `p`: Prefix string
- `s`: Suffix string
- `d`: Decimal precision (integer)
- `txt`: Complete description string

### 2.3 Exact String Length & Database Safety Verification

```json
[
  {
    "label": "Active Courses",
    "subtext": "{\"m\":\"A\",\"k\":\"ACTIVE_COURSES\",\"p\":\"\",\"s\":\"\",\"d\":0,\"txt\":\"Published courses\"}",
    "length": 76,
    "limit": 100,
    "headroom": 24
  },
  {
    "label": "Enrolled Engineers",
    "subtext": "{\"m\":\"H\",\"k\":\"ENROLLED_ENGINEERS\",\"p\":\"\",\"s\":\"+\",\"d\":0,\"txt\":\"Verified enrollments\"}",
    "length": 84,
    "limit": 100,
    "headroom": 16
  },
  {
    "label": "Average Rating",
    "subtext": "{\"m\":\"A\",\"k\":\"AVERAGE_RATING\",\"p\":\"★ \",\"s\":\"\",\"d\":1,\"txt\":\"Genuine student reviews\"}",
    "length": 84,
    "limit": 100,
    "headroom": 16
  },
  {
    "label": "Lead Instructors",
    "subtext": "{\"m\":\"A\",\"k\":\"LEAD_INSTRUCTORS\",\"p\":\"\",\"s\":\"\",\"d\":0,\"txt\":\"Active approved instructors\"}",
    "length": 88,
    "limit": 100,
    "headroom": 12
  }
]
```

Every single payload is strictly $\le 88$ characters, providing at least 12 characters of safety buffer below the `VARCHAR(100)` database boundary.

---

## 3. Backward Compatibility & Parser Resilience

### 3.1 Three-Tier Parsing Hierarchy
File: `src/utils/statisticsCalculator.js` (`parseStatisticRecord`)

1. **Structured Compact JSON**:
   When `subtext` starts with `{` and ends with `}`, it is parsed into metadata.
2. **Legacy Plain Text**:
   If `subtext` is plain English text (e.g., from pre-CMS database records: `"Production architectures"`, `"Across top tech firms"`), the parser assigns `dataMode = AUTOMATIC` and sets `description = subtext`.
3. **Legacy Truncated JSON Auto-Healing**:
   If an older snapshot contains truncated words, the parser automatically restores them to clean complete strings:
   - `"Distinct verified engi"` $\to$ `"Verified enrollments"`
   - `"Verified student revie"` $\to$ `"Genuine student reviews"`
   - `"Active senior architec"` $\to$ `"Active approved instructors"`
4. **Malformed JSON Handling**:
   Wrapped in `try...catch`; if JSON parse fails, it falls back gracefully to `DEFAULT_STATISTICS_CONFIG` without crashing the React application.

---

## 4. Verification & Browser DOM Parity

### 4.1 Browser DOM Extraction via Playwright
Inspecting rendered DOM nodes at `http://localhost:4173`:
```json
[
  {
    "number": "228",
    "label": "Active Courses",
    "description": "Published courses"
  },
  {
    "number": "75+",
    "label": "Enrolled Engineers",
    "description": "Verified enrollments"
  },
  {
    "number": "★ 4.4",
    "label": "Average Rating",
    "description": "Genuine student reviews"
  },
  {
    "number": "16",
    "label": "Lead Instructors",
    "description": "Active approved instructors"
  }
]
```

- **Truncation Rate**: 0%
- **Malformed Metadata Rate**: 0%
- **PostgreSQL Constraint Errors**: 0
- **Status**: `PASS`

