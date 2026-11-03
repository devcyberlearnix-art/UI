# LMS-Auth Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Features & Functionality](#features--functionality)
5. [User Roles & Permissions](#user-roles--permissions)
6. [Authentication Flow](#authentication-flow)
7. [API Endpoints](#api-endpoints)
8. [Setup & Installation](#setup--installation)
9. [Deployment Guide](#deployment-guide)
10. [Development Guidelines](#development-guidelines)

---

## 🎯 Project Overview

**LMS-Auth** is a comprehensive Learning Management System (LMS) with role-based authentication and authorization. The platform supports multiple user types including Students, Instructors, Sub-Admins, and Super-Admins, each with specific permissions and dashboards.

### Key Features
- **Multi-Role Authentication**: Support for Student, Instructor, Sub-Admin, and Super-Admin roles
- **OTP-Based Login**: Secure authentication using both password and OTP methods
- **Role-Based Access Control**: Granular permissions for different user types
- **Dashboard Management**: Customized dashboards for each user role
- **Course Management**: Full lifecycle management for courses and instructors
- **Payment & Order Processing**: Integrated payment and order management system
- **Real-Time Notifications**: Toast notifications for user feedback
- **Responsive Design**: Mobile-first design with Tailwind CSS

### Backend Integration
- **Base URL**: `https://matted-ascent-specimen.ngrok-free.dev`
- **Authentication**: JWT-based token authentication
- **API Communication**: Axios with interceptors for auth headers

---

## 🛠 Technology Stack

### Frontend Framework
- **React 18.2.0**: UI library for building user interfaces
- **Vite 5.0.8**: Build tool and development server

### Routing & State Management
- **React Router DOM 6.30.3**: Client-side routing
- **React Context API**: Global state management for authentication

### UI & Styling
- **Tailwind CSS 3.3.6**: Utility-first CSS framework
- **Framer Motion 10.18.0**: Animation library
- **Lucide React 0.294.0**: Icon library
- **React Icons 5.6.0**: Additional icon components

### HTTP & API
- **Axios 1.18.0**: HTTP client for API requests
- **JWT Decode 4.0.0**: JWT token parsing

### Forms & Validation
- **React Hook Form 7.75.0**: Form management and validation

### Notifications
- **React Hot Toast 2.6.0**: Toast notification system

### Data Visualization
- **Recharts 3.8.1**: Chart library for analytics

---

## 📁 Project Structure

```
lms-auth/
├── public/                 # Static assets
├── src/
│   ├── api/               # API integration layer
│   │   ├── axiosInstance.js    # Axios configuration with interceptors
│   │   ├── authApi.js          # Authentication API endpoints
│   │   ├── adminApi.js         # Admin-specific API endpoints
│   │   ├── courseApi.js        # Course management API
│   │   ├── instructorApi.js    # Instructor management API
│   │   └── studentApi.js       # Student-specific API
│   │
│   ├── components/        # Reusable components
│   │   ├── common/             # Common UI components
│   │   ├── dashboard/          # Dashboard-specific components
│   │   │   ├── Sidebar.jsx     # Navigation sidebar
│   │   │   ├── TopNav.jsx      # Top navigation bar
│   │   │   └── AdminNavbar.jsx # Admin navbar
│   │   ├── home/               # Landing page components
│   │   ├── order/              # Order-related components
│   │   ├── ui/                 # UI components
│   │   ├── ParticleBackground.jsx
│   │   └── ProtectedRoute.jsx  # Route protection wrapper
│   │
│   ├── context/           # React Context providers
│   │   ├── AuthContext.jsx     # Authentication state management
│   │   └── OrderContext.jsx    # Order state management
│   │
│   ├── layouts/           # Layout components
│   │   ├── DashboardLayout.jsx # Main dashboard layout
│   │   └── AdminLayout.jsx     # Admin-specific layout
│   │
│   ├── pages/             # Page components
│   │   ├── Landing.jsx          # Landing page
│   │   ├── Login.jsx            # Student login
│   │   ├── Register.jsx         # Student registration
│   │   ├── ForgotPassword.jsx  # Password reset flow
│   │   ├── ResetOtp.jsx        # OTP verification
│   │   ├── OtpLogin.jsx        # OTP-based login
│   │   ├── OtpVerify.jsx       # OTP verification
│   │   │
│   │   ├── admin/              # Admin pages
│   │   │   ├── AdminLogin.jsx          # Admin login with OTP
│   │   │   ├── AdminRegister.jsx       # Sub-admin registration
│   │   │   ├── RegistrationSuccess.jsx  # Registration success
│   │   │   ├── Dashboard.jsx            # Super admin dashboard
│   │   │   ├── SubDashboard.jsx         # Sub-admin dashboard
│   │   │   ├── Users.jsx               # User management
│   │   │   ├── Courses.jsx              # Course management
│   │   │   ├── Instructors.jsx          # Instructor management
│   │   │   ├── InstructorApplications.jsx  # Instructor applications
│   │   │   ├── Orders.jsx               # Order management
│   │   │   ├── OrderDetails.jsx        # Order details
│   │   │   ├── Payments.jsx             # Payment management
│   │   │   ├── Analytics.jsx            # Analytics dashboard
│   │   │   ├── Reports.jsx              # Reports generation
│   │   │   ├── Certificates.jsx         # Certificate management
│   │   │   ├── Notifications.jsx        # Notification management
│   │   │   ├── Reviews.jsx              # Review management
│   │   │   ├── AdminManagement.jsx      # Admin user management
│   │   │   ├── Roles.jsx                # Role & permission management
│   │   │   ├── Settings.jsx             # System settings
│   │   │   ├── Profile.jsx              # Admin profile
│   │   │   ├── CMS.jsx                  # Content management
│   │   │   ├── Moderation.jsx           # Content moderation
│   │   │   ├── Support.jsx              # Support management
│   │   │   ├── AIFeatures.jsx           # AI features
│   │   │   └── Gamification.jsx         # Gamification features
│   │   │
│   │   ├── student/            # Student pages
│   │   │   ├── StudentDashboard.jsx  # Student dashboard
│   │   │   ├── MyLearning.jsx         # My courses
│   │   │   ├── Wishlist.jsx           # Wishlist
│   │   │   ├── Orders.jsx              # Order history
│   │   │   ├── Checkout.jsx            # Checkout process
│   │   │   └── Cart.jsx                # Shopping cart
│   │   │
│   │   └── instructor/         # Instructor pages
│   │       ├── InstructorDashboard.jsx  # Instructor dashboard
│   │       ├── CreateCourse.jsx          # Course creation
│   │       ├── MyCourses.jsx             # Course management
│   │       └── Analytics.jsx             # Instructor analytics
│   │
│   ├── services/          # Business logic services
│   ├── utils/             # Utility functions
│   ├── assets/            # Static assets (images, etc.)
│   ├── App.jsx            # Main app component with routing
│   ├── App.css            # Global styles
│   ├── index.css          # Tailwind imports
│   ├── main.jsx           # Application entry point
│   └── config.js          # Configuration constants
│
├── .gitignore            # Git ignore rules
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
└── README.md            # Project readme
```

---

## ✨ Features & Functionality

### Authentication System
- **Multi-Method Login**: Password-based and OTP-based authentication
- **Email Verification**: Email verification for new registrations
- **Password Reset**: Complete forgot password flow with OTP verification
- **Session Management**: JWT token storage in localStorage and sessionStorage
- **Auto-Logout**: Automatic logout on token expiration

### Role-Based Access Control
- **Super Admin**: Full system access, can create sub-admins
- **Sub Admin**: Limited access based on assigned permissions
- **Instructor**: Course management and student interaction
- **Student**: Course enrollment and learning management

### Dashboard Features
- **User Management**: Create, update, delete users with role management
- **Course Management**: Full CRUD operations for courses
- **Instructor Management**: Approve/reject instructor applications
- **Order Processing**: View and manage student orders
- **Payment Tracking**: Monitor and process payments
- **Analytics Dashboard**: Visual insights with charts and graphs
- **Report Generation**: Generate various system reports
- **Notification System**: Real-time notifications for users

### User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Smooth Animations**: Framer Motion for page transitions
- **Toast Notifications**: Real-time feedback for user actions
- **Loading States**: Visual feedback during API calls
- **Error Handling**: Comprehensive error messages and recovery

---

## 👥 User Roles & Permissions

### Super Admin
**Email**: `mainadmin@cyberlearnix.com`

**Full Access To**:
- All admin features and settings
- Create and manage sub-admins
- Role and permission management
- System configuration
- User management (all users)
- Course management
- Payment processing
- Analytics and reports
- CMS and content management
- AI features and gamification

**Dashboard**: `/admin/dashboard`

### Sub Admin
**Limited Access Based on Permissions**:

**Available Permissions**:
- `users:view` - View user list
- `users:edit` - Edit user information
- `courses:view` - View courses
- `courses:edit` - Edit courses
- `instructors:view` - View instructors
- `instructors:approve` - Approve/reject instructors
- `orders:view` - View orders
- `payments:view` - View payments
- `analytics:view` - View analytics
- `reports:view` - View reports

**Restricted From**:
- Admin Management
- Role & Permissions management
- System Settings
- CMS configuration
- Moderation tools

**Dashboard**: `/admin/sub-dashboard`

### Instructor
**Access To**:
- Course creation and management
- Student progress tracking
- Analytics for their courses
- Student communication

**Dashboard**: `/instructor/dashboard`

### Student
**Access To**:
- Course browsing and enrollment
- Learning management
- Progress tracking
- Certificate viewing
- Order history

**Dashboard**: `/student/dashboard`

---

## 🔐 Authentication Flow

### 1. Password-Based Login

```
User enters credentials → 
POST /admin/internal/login → 
Validate credentials → 
Generate JWT token → 
Store in localStorage/sessionStorage → 
Redirect to appropriate dashboard
```

### 2. OTP-Based Login

```
User enters email → 
POST /admin/internal/login/otp/request → 
Send OTP to email → 
User enters OTP → 
POST /admin/internal/login/otp/verify → 
Validate OTP → 
Generate JWT token → 
Store in localStorage/sessionStorage → 
Redirect to appropriate dashboard
```

### 3. Password Reset Flow

```
User enters email → 
POST /admin/password/forgot → 
Send OTP to email → 
User enters OTP → 
POST /admin/password/verify-otp → 
Validate OTP → 
User enters new password → 
POST /admin/password/reset → 
Update password → 
Redirect to login
```

### 4. Sub-Admin Registration

```
Super Admin fills registration form → 
POST /admin/register → 
Create sub-admin with permissions → 
Clear session → 
Redirect to registration success → 
Auto-redirect to login → 
Sub-admin logs in → 
Redirect to sub-dashboard
```

### Token Management

**Storage Locations**:
- `localStorage.lms_token` - Primary token storage
- `localStorage.access_token` - Backup token storage
- `sessionStorage.lms_token` - Session-based storage
- `localStorage.lms_user` - User data JSON

**Token Usage**:
- Automatically added to Authorization header
- Skipped for public endpoints
- Auto-logout on 401 errors
- Cleared on logout

---

## 🔌 API Endpoints

### Authentication Endpoints

#### Login
- `POST /admin/internal/login` - Password-based login
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

#### OTP Login
- `POST /admin/internal/login/otp/request` - Request login OTP
  ```json
  {
    "email": "user@example.com"
  }
  ```

- `POST /admin/internal/login/otp/verify` - Verify login OTP
  ```json
  {
    "email": "user@example.com",
    "otp": "123456"
  }
  ```

- `POST /admin/resend-otp` - Resend OTP
  ```json
  {
    "email": "user@example.com"
  }
  ```

#### Password Management
- `POST /admin/password/forgot` - Request password reset
  ```json
  {
    "email": "user@example.com"
  }
  ```

- `POST /admin/password/verify-otp` - Verify reset OTP
  ```json
  {
    "email": "user@example.com",
    "otp": "123456"
  }
  ```

- `POST /admin/password/reset` - Reset password
  ```json
  {
    "email": "user@example.com",
    "otp": "123456",
    "newPassword": "newpass123",
    "confirmPassword": "newpass123"
  }
  ```

#### Email Verification
- `POST /admin/verify-email` - Verify email address
  ```json
  {
    "email": "user@example.com"
  }
  ```

#### Registration
- `POST /admin/register` - Register sub-admin
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "sub_admin",
    "permissions": ["users:view", "courses:view"]
  }
  ```

#### Logout
- `POST /admin/logout` - Logout user

### Admin Management Endpoints

#### Profile
- `GET /admin/profile` - Get admin profile
- `PUT /admin/profile` - Update admin profile

#### Users
- `GET /admin/users` - Get all users
- `DELETE /admin/users/:id` - Delete user
- `PUT /admin/users/:id` - Update user
- `PUT /admin/users/:id/status` - Toggle user status

#### Courses
- `GET /admin/courses` - Get all courses
- `POST /admin/courses` - Create course
- `PUT /admin/courses/:id` - Update course
- `DELETE /admin/courses/:id` - Delete course

#### Instructors
- `GET /admin/instructors` - Get all instructors
- `PUT /admin/instructors/:id/approve` - Approve instructor
- `PUT /admin/instructors/:id/reject` - Reject instructor
- `DELETE /admin/instructors/:id` - Delete instructor

#### Orders
- `GET /admin/orders` - Get all orders
- `GET /admin/orders/:id` - Get order details
- `DELETE /admin/orders/:id` - Delete order

#### Payments
- `GET /admin/payments` - Get all payments
- `GET /admin/payments/:id` - Get payment details
- `PUT /admin/payments/:id/status` - Update payment status
- `POST /admin/payments/:id/refund` - Process refund

### Student Endpoints

#### Learning
- `GET /student/courses` - Get enrolled courses
- `POST /student/courses/:id/enroll` - Enroll in course
- `GET /student/progress` - Get learning progress

#### Orders
- `GET /student/orders` - Get order history
- `POST /student/orders` - Create order

### Instructor Endpoints

#### Courses
- `GET /instructor/courses` - Get instructor courses
- `POST /instructor/courses` - Create course
- `PUT /instructor/courses/:id` - Update course

#### Analytics
- `GET /instructor/analytics` - Get instructor analytics

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 16+ and npm/yarn
- Git
- Modern web browser

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lms-auth
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Create .env file in root directory
   VITE_API_BASE_URL=https://matted-ascent-specimen.ngrok-free.dev
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

---

## 🌐 Deployment Guide

### Deployment Options

#### 1. Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### 2. Netlify Deployment

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

#### 3. Traditional Web Server

```bash
# Build
npm run build

# Upload dist/ contents to your web server
# Configure server to handle SPA routing
```

### Environment Configuration

**Production Environment Variables**:
```env
VITE_API_BASE_URL=https://your-production-api.com
```

### Server Configuration (Nginx Example)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/lms-auth/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass https://your-api-server.com;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 📝 Development Guidelines

### Code Style

- Use functional components with hooks
- Follow React best practices
- Use descriptive variable names
- Add comments for complex logic
- Maintain consistent formatting

### API Integration

- Use existing API methods from `api/` directory
- Handle errors with try-catch blocks
- Show loading states during API calls
- Display user-friendly error messages
- Use toast notifications for feedback

### Component Structure

```jsx
// Component imports
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// Component definition
const ComponentName = () => {
  // State management
  const [state, setState] = useState(null);
  
  // Hooks
  const { user } = useAuth();
  
  // Effects
  useEffect(() => {
    // Side effects
  }, []);
  
  // Handlers
  const handleAction = () => {
    // Event handling
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

### Authentication Check

```jsx
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProtectedComponent = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);
  
  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }
  
  return <div>Protected Content</div>;
};
```

### Error Handling Pattern

```jsx
const handleApiCall = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const result = await apiMethod();
    toast.success('Operation successful');
    // Handle success
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    setError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};
```

### Role-Based Rendering

```jsx
const { user } = useAuth();
const isSuperAdmin = user?.role?.toLowerCase().includes('super_admin');
const isSubAdmin = user?.role?.toLowerCase().includes('sub_admin');

{isSuperAdmin && <SuperAdminComponent />}
{isSubAdmin && <SubAdminComponent />}
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Failed to fetch" Error
- Check API base URL in `axiosInstance.js`
- Verify backend server is running
- Check CORS configuration
- Ensure public endpoints are in the whitelist

#### 2. Authentication Failed
- Verify token is stored correctly
- Check token expiration
- Ensure Authorization header is being sent
- Verify user role permissions

#### 3. Route Not Found
- Check route configuration in `App.jsx`
- Verify ProtectedRoute wrapper
- Ensure user role matches allowed roles

#### 4. Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for dependency conflicts
- Verify Node.js version compatibility

---

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review API endpoint documentation
- Verify backend API status
- Check browser console for errors

---

## 📄 License

This project is proprietary and confidential.

---

## 🔄 Version History

### Version 1.0.0 (Current)
- Initial release with multi-role authentication
- Complete admin dashboard with role-based access
- OTP-based authentication system
- Real-time API integration
- Responsive design implementation

---

**Document Version**: 1.0.0  
**Last Updated**: July 2026  
**Project**: LMS-Auth  
**Backend API**: https://matted-ascent-specimen.ngrok-free.dev
