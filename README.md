# Puskesmas Backend API

Patient Management System API untuk Puskesmas dengan fitur lengkap dan role-based authentication.

## 🚀 Features

- ✅ **Authentication & Authorization** (JWT dengan refresh tokens + Role-based access)
- ✅ **Patient Management** (CRUD operations dengan authorization)
- ✅ **Excel Import/Export** (Template-based data management)
- ✅ **Search & Filtering** (Advanced patient search)
- ✅ **Role-Based Access Control** (User/Admin hierarchy)
- ✅ **Security Features** (Rate limiting, validation, bcrypt)
- ✅ **Auto-Admin Setup** (First user becomes admin automatically)
- ✅ **Production Ready** (Logging, error handling, monitoring)

## � User Roles

### User (Default)
- View patients
- Basic operations

### Admin
- All user permissions
- Create/Update/Delete patients
- Manage users
- Excel import/export
- Create additional admins

## �📋 API Endpoints

### Authentication

- `POST /api/v1/auth/registration` - Register new user (first user = auto admin)
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/create-admin` - Create admin user (admin only)

### Patients (Protected Routes)

- `GET /api/v1/patients` - Get all patients (authenticated users)
- `POST /api/v1/patients/create` - Create new patient (admin only)
- `GET /api/v1/patients/:id` - Get patient by ID (authenticated users)
- `PUT /api/v1/patients/:id` - Update patient (admin only)
- `DELETE /api/v1/patients/:id` - Delete patient (admin only)
- `GET /api/v1/patients/search` - Search patients (authenticated users)

### Excel Operations (Admin Only)

- `GET /api/v1/patients/excel/export` - Export patients to Excel
- `POST /api/v1/patients/excel/import` - Import patients from Excel
- `GET /api/v1/patients/excel/template` - Download Excel template

### User Management (Admin Only)

- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Health Check

- `GET /health` - Application health status

## 🔧 Technology Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** MongoDB
- **Cache:** Redis
- **File Storage:** Cloudinary
- **Authentication:** JWT
- **Validation:** Joi
- **Security:** Helmet, CORS, Rate limiting

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database
- Redis instance
- Cloudinary account

### Installation

```bash
# Clone repository
git clone <repository-url>
cd puskesmas-backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm start
```

### Environment Variables

Required environment variables (see `.env.example`):

```env
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### First Time Setup

1. Register the first user - akan otomatis menjadi admin
2. Or use manual script: `npx tsx make-admin.ts` (if available)
3. Admin can then create additional users/admins

## 📊 Data Format

### User Schema

```json
{
  "email": "admin@puskesmas.com",
  "password": "hashed_password",
  "role": "admin",
  "avatar": {
    "public_id": "avatar_id",
    "url": "https://cloudinary.com/avatar.jpg"
  },
  "createdAt": "2025-07-29T12:48:10.056Z",
  "updatedAt": "2025-07-29T12:48:10.056Z"
}
```

### Patient Schema

```json
{
  "name": "Anita",
  "address": "Desa Baru",
  "registrationNumber": "01.01.00.01",
  "birthDay": "Palembang, 1961-09-18",
  "createdAt": "2025-07-29T12:48:10.056Z",
  "updatedAt": "2025-07-29T12:48:10.056Z"
}
```

## 🔒 Security Features

- ✅ Environment variables protection
- ✅ Rate limiting (Auth: 5/15min, API: 100/15min)
- ✅ Password hashing (bcrypt)
- ✅ JWT token rotation with refresh tokens
- ✅ Role-based authorization (User/Admin)
- ✅ Input validation & sanitization (Joi schemas)
- ✅ CORS protection
- ✅ Security headers (Helmet)
- ✅ First-user auto-admin setup
- ✅ Protected routes with middleware

## 🔐 Authorization Levels

| Feature | User | Admin |
|---------|------|-------|
| View Patients | ✅ | ✅ |
| Create Patients | ❌ | ✅ |
| Update Patients | ❌ | ✅ |
| Delete Patients | ❌ | ✅ |
| Excel Operations | ❌ | ✅ |
| User Management | ❌ | ✅ |
| Create Admins | ❌ | ✅ |

## 🛠️ Development Scripts

```bash
# Start server
npm start

# Development with auto-reload
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build
```

## 👨‍💻 Developer

**Ikhlas Abdillah** - Backend Developer