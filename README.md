# Puskesmas Backend API

Patient Management System API untuk Puskesmas dengan fitur lengkap.

## 🚀 Features

- ✅ **Authentication & Authorization** (JWT dengan refresh tokens)
- ✅ **Patient Management** (CRUD operations)
- ✅ **Excel Import/Export** (Template-based data management)
- ✅ **Search & Filtering** (Advanced patient search)
- ✅ **Security Features** (Rate limiting, validation, bcrypt)
- ✅ **Production Ready** (Logging, error handling, monitoring)

## 📋 API Endpoints

### Authentication
- `POST /api/v1/auth/registration` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout

### Patients
- `GET /api/v1/patients` - Get all patients
- `POST /api/v1/patients/create` - Create new patient
- `GET /api/v1/patients/:id` - Get patient by ID
- `PUT /api/v1/patients/:id` - Update patient
- `DELETE /api/v1/patients/:id` - Delete patient
- `GET /api/v1/patients/search` - Search patients

### Excel Operations
- `GET /api/v1/patients/excel/export` - Export patients to Excel
- `POST /api/v1/patients/excel/import` - Import patients from Excel
- `GET /api/v1/patients/excel/template` - Download Excel template

### Health Check
- `GET /health` - Application health status

## 🔧 Technology Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** MongoDB (Atlas)
- **Cache:** Redis (Upstash)
- **File Storage:** Cloudinary
- **Authentication:** JWT
- **Validation:** Joi
- **Security:** Helmet, CORS, Rate limiting

## 🌐 Deployment

This application is optimized for deployment on:
- ✅ **Koyeb** (Always-on free tier)
- ✅ **AWS EC2** (Free tier)
- ✅ **DigitalOcean** (VPS)
- ✅ **Docker** (Container deployment)

## 📊 Data Format

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
- ✅ JWT token rotation
- ✅ Input validation & sanitization
- ✅ CORS protection
- ✅ Security headers (Helmet)

## 🚀 Live Demo

- **API Base URL:** `https://your-app.koyeb.app/api/v1`
- **Health Check:** `https://your-app.koyeb.app/health`

## 👨‍💻 Developer

**Ikhlas Abdillah** - Backend Developer

---

Ready for production deployment! 🎉
