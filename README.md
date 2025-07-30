# Puskesmas Backend API

Patient Management System API untuk Puskesmas dengan fitur lengkap dan role-based authentication.

## 🚀 Features

- ✅ **Authentication & Authorization** (JWT dengan refresh tokens + Role-based access)
- ✅ **Patient Management** (Full CRUD operations untuk USER & ADMIN)
- ✅ **Pagination & Search** (Advanced search dengan alphabetical sorting)
- ✅ **Statistics & Analytics** (Dashboard data dengan chart support)
- ✅ **Role-Based Access Control** (USER/ADMIN dengan clear separation)
- ✅ **Security Features** (Rate limiting, validation, bcrypt, Redis sessions)
- ✅ **Production Ready** (Logging, error handling, monitoring)

## 👥 User Roles & Permissions

### 🔵 USER Role (Default)

- ✅ **Full CRUD** pada patients (Create, Read, Update, Delete)
- ✅ **Search & Pagination** semua fitur pencarian
- ✅ **Statistics Access** view dashboard data
- ✅ **Profile Management** update own profile
- ❌ **User Management** tidak bisa manage users lain

### 🔴 ADMIN Role

- ✅ **All USER permissions** + additional privileges
- ✅ **User Management** (view all users, delete users, update roles)
- ✅ **Admin Operations** (create admin, manage system)

## 📋 API Endpoints

### 🔐 Authentication

```http
POST /api/v1/auth/registration  # Register new user
POST /api/v1/auth/login         # User login
POST /api/v1/auth/logout        # User logout
POST /api/v1/auth/refresh       # Refresh access token
```

### 🏥 Patient Management (USER & ADMIN)

```http
# CRUD Operations (Both USER & ADMIN)
GET    /api/v1/patients         # Get all patients (with pagination)
POST   /api/v1/patients/create  # Create new patient
GET    /api/v1/patients/:id     # Get patient by ID
PUT    /api/v1/patients/:id     # Update patient
DELETE /api/v1/patients/:id     # Delete patient

# Search & Filter (Both USER & ADMIN)
GET /api/v1/patients/search                    # General search
GET /api/v1/patients/search/name?name=John     # Search by name
GET /api/v1/patients/search/address?address=Jakarta # Search by address
GET /api/v1/patients/search/alphabet?letter=A # Filter by alphabet

# Statistics (Both USER & ADMIN)
GET /api/v1/patients/total     # Get comprehensive statistics
```

### 👤 User Management (ADMIN ONLY)

```http
GET    /api/v1/users/all-users      # Get all users
DELETE /api/v1/users/delete/:id     # Delete user
PUT    /api/v1/users/update-role    # Update user role
GET    /api/v1/users/activity/:id   # Get user activity

# Profile Management (USER & ADMIN)
GET /api/v1/users/me              # Get own profile
PUT /api/v1/users/update-info     # Update own profile
PUT /api/v1/users/update-password # Change own password
```

## 🔧 Technology Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** MongoDB dengan Mongoose ODM
- **Cache & Sessions:** Redis
- **Authentication:** JWT dengan refresh tokens
- **Validation:** Joi schemas
- **Security:** bcrypt, Rate limiting, CORS, Helmet
- **Logging:** Winston
- **File Handling:** Multer

## 🚀 Getting Started

### Prerequisites

```bash
# Required software
Node.js >= 18.x
MongoDB >= 6.x
Redis >= 6.x
npm atau yarn
```

### Installation

```bash
# 1. Clone repository
git clone https://github.com/Santoss104/uptpuskesmas-backend.git
cd uptpuskesmas-backend

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env file dengan configuration Anda

# 4. Start required services
# MongoDB: mongod
# Redis: redis-server

# 5. Run application
npm run dev          # Development mode
npm start           # Production mode
```

### Environment Variables

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/puskesmas
# or MongoDB Atlas: mongodb+srv://user:pass@cluster.mongodb.net/puskesmas

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Security
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

## 📊 API Usage Examples

### Authentication

```bash
# Register new user
curl -X POST http://localhost:5000/api/v1/auth/registration \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Patient Operations

```bash
# Get patients with pagination
curl -X GET "http://localhost:5000/api/v1/patients?page=1&limit=10" \
  -H "access-token: YOUR_JWT_TOKEN"

# Create patient
curl -X POST http://localhost:5000/api/v1/patients/create \
  -H "Content-Type: application/json" \
  -H "access-token: YOUR_JWT_TOKEN" \
  -d '{
    "name": "John Doe",
    "address": "Jakarta Pusat",
    "registrationNumber": "P001.2025",
    "birthPlace": "Jakarta",
    "birthDay": "1990-01-15"
  }'

# Search patients
curl -X GET "http://localhost:5000/api/v1/patients/search/name?name=John" \
  -H "access-token: YOUR_JWT_TOKEN"
```

## 🛡️ Security Features

### Rate Limiting

- Login attempts: 5 per 15 minutes
- General API: 100 requests per 15 minutes
- Account lockout after 5 failed login attempts

### Data Validation

- Joi schemas untuk semua input
- Custom validation messages
- Input sanitization

### Password Security

- bcrypt hashing dengan salt rounds
- Minimum password requirements
- Password change tracking

## 📁 Project Structure

```
📦 puskesmas-backend/
├── 📁 controllers/          # Business logic controllers
├── 📁 middleware/          # Authentication & validation
├── 📁 models/              # Database schemas (Mongoose)
├── 📁 routes/              # API route definitions
├── 📁 services/            # Business logic services
├── 📁 utils/               # Utility functions
├── 📁 validators/          # Data validation schemas
├── 📄 app.ts               # Express application setup
├── 📄 server.ts            # Server entry point
├── 📄 package.json         # Dependencies & scripts
└── 📄 README.md            # Documentation
```

## � Development

### Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env
# Edit .env with your local configuration

# 3. Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev          # Development with hot reload
npm run start        # Production mode
npm run start:prod   # Production with explicit NODE_ENV
npm run start:dev    # Development with explicit NODE_ENV
npm run build        # TypeScript compilation
```

### 🚨 Security & Deployment

⚠️ **CRITICAL: Files that MUST NEVER be committed to GitHub:**

- `.env*` - Contains sensitive credentials & secrets
- `logs/` - Application logs may contain sensitive data
- `*.key, *.pem, *.crt` - SSL certificates and private keys
- `make-admin.ts` - Development utility script
- `deploy-*.sh` - Deployment scripts with server info
- `ecosystem.config.js` - PM2 production configuration
- `Dockerfile` - Container deployment configuration
- `docker-compose.yml` - Docker orchestration files
- `DEPLOYMENT.md` - Deployment guides with infrastructure details

✅ **Safe to commit:**

- `.env.example` - Template without credentials
- Source code files (`.ts`, `.js`)
- Documentation (README.md, API docs)
- Package configuration (`package.json`, `tsconfig.json`)
- Public configuration files without secrets

### 📋 Deployment Notes

For production deployment:
1. Create your own deployment scripts locally (don't commit them)
2. Use environment-specific configuration files
3. Follow security best practices for your hosting platform
4. Set up proper monitoring and logging
5. Configure SSL/TLS certificates
6. Set up firewall rules and security groups

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Ikhlas Abdillah**

- GitHub: [@Santoss104](https://github.com/Santoss104)

---

**📞 Support**

Jika ada pertanyaan atau masalah, silakan buat issue di repository ini.

**🎯 Status: Production Ready** ✅
