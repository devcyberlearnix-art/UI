# ASIVO LMS — BANNER APPEARANCE API DOCUMENTATION
## RESTful Endpoints & Schema Specifications

---

### 1. Overview
All banner APIs are served authoritatively by **Course Service** (`port 8083`) and routed through **API Gateway** (`port 8079`).

---

### 2. Endpoints Summary

| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/api/v1/banners` | Public | Returns active scheduled banners with appearance settings |
| `GET` | `/api/v1/admin/banners` | `ROLE_MAIN_ADMIN`, `ROLE_SUB_ADMIN` | Returns all banners with telemetry and appearance attributes |
| `POST` | `/api/v1/admin/banners` | `ROLE_MAIN_ADMIN`, `ROLE_SUB_ADMIN` | Creates new banner with appearance configuration |
| `PUT` | `/api/v1/admin/banners/{id}` | `ROLE_MAIN_ADMIN`, `ROLE_SUB_ADMIN` | Full update of existing banner |
| `PATCH` | `/api/v1/admin/banners/{id}` | `ROLE_MAIN_ADMIN`, `ROLE_SUB_ADMIN` | Partial update of specific banner fields |
| `DELETE` | `/api/v1/admin/banners/{id}` | `ROLE_MAIN_ADMIN` | Soft-deletes a banner |

---

### 3. Request & Response Schemas

#### 3.1 Banner Appearance Properties
```json
{
  "overlayType": "GRADIENT",
  "overlayColor": "#000000",
  "overlayOpacity": 50,
  "gradientDirection": "LEFT_TO_RIGHT",
  "headingColor": "#FFFFFF",
  "descriptionColor": "#EAE5DC",
  "textShadowEnabled": true,
  "contentAlignment": "LEFT",
  "verticalAlignment": "CENTER",
  "mobileImageUrl": "https://drive.google.com/uc?id=... (optional)"
}
```

#### 3.2 Field Validations & Constraints

- `overlayType`: String enum: `NONE`, `SOLID`, `GRADIENT`. Default: `GRADIENT`.
- `overlayColor`: Hex format (`#RRGGBB`). Default: `#000000`.
- `overlayOpacity`: Integer between `0` and `90` (inclusive). Default: `50`.
- `gradientDirection`: String enum: `LEFT_TO_RIGHT`, `RIGHT_TO_LEFT`, `TOP_TO_BOTTOM`, `BOTTOM_TO_TOP`. Default: `LEFT_TO_RIGHT`.
- `headingColor`: Hex format (`#RRGGBB`). Default: `#FFFFFF`.
- `descriptionColor`: Hex format (`#RRGGBB`). Default: `#EAE5DC`.
- `textShadowEnabled`: Boolean. Default: `true`.
- `contentAlignment`: String enum: `LEFT`, `CENTER`, `RIGHT`. Default: `LEFT`.
- `verticalAlignment`: String enum: `TOP`, `CENTER`, `BOTTOM`. Default: `CENTER`.

#### 3.3 Sample Payload: Update Appearance (`PUT /api/v1/admin/banners/9`)
```json
{
  "title": "Specialized Cybersecurity & Engineering Bootcamp",
  "description": "Master enterprise cybersecurity mesh, threat detection, and resilient systems.",
  "imageUrl": "https://drive.google.com/uc?id=19YCoHHQ3u2cL36u3BaQ8ZFSVJI_PmUpC",
  "mobileImageUrl": "https://drive.google.com/uc?id=19YCoHHQ3u2cL36u3BaQ8ZFSVJI_PmUpC",
  "altText": "Cybersecurity Bootcamp",
  "ctaText": "Join Bootcamp Now",
  "ctaUrl": "/courses/9",
  "courseId": 9,
  "displayOrder": 901,
  "status": "ACTIVE",
  "targetType": "COURSE",
  "overlayType": "SOLID",
  "overlayColor": "#5B3E57",
  "overlayOpacity": 70,
  "gradientDirection": "LEFT_TO_RIGHT",
  "headingColor": "#FFFFFF",
  "descriptionColor": "#EAE5DC",
  "textShadowEnabled": true,
  "contentAlignment": "CENTER",
  "verticalAlignment": "CENTER"
}
```

#### 3.4 Sample Public Response (`GET /api/v1/banners`)
```json
{
  "success": true,
  "message": "Public active banners retrieved successfully",
  "data": [
    {
      "id": 9,
      "title": "Specialized Cybersecurity & Engineering Bootcamp",
      "description": "Master enterprise cybersecurity mesh, threat detection, and resilient systems.",
      "imageUrl": "https://drive.google.com/uc?id=19YCoHHQ3u2cL36u3BaQ8ZFSVJI_PmUpC",
      "mobileImageUrl": "https://drive.google.com/uc?id=19YCoHHQ3u2cL36u3BaQ8ZFSVJI_PmUpC",
      "altText": "Cybersecurity Bootcamp",
      "ctaText": "Join Bootcamp Now",
      "ctaUrl": "/courses/9",
      "courseId": 9,
      "displayOrder": 901,
      "status": "ACTIVE",
      "targetType": "COURSE",
      "overlayType": "SOLID",
      "overlayColor": "#5B3E57",
      "overlayOpacity": 70,
      "gradientDirection": "LEFT_TO_RIGHT",
      "headingColor": "#FFFFFF",
      "descriptionColor": "#EAE5DC",
      "textShadowEnabled": true,
      "contentAlignment": "CENTER",
      "verticalAlignment": "CENTER"
    }
  ]
}
```
