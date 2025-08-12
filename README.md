# 🏥 Puskesmas Backend API

RESTful API untuk sistem manajemen pasien puskesmas dengan authentication dan role-based access control.

## 🚀 Fitur Utama

- **Authentication** - JWT login/logout dengan role-based access
- **Patient Management** - CRUD operations dengan validasi lengkap
- **Search & Filter** - Pencarian nama, alamat, dan filter alphabet
- **Statistics** - Dashboard analytics dan monitoring data
- **User Management** - Admin panel untuk manage users
- **Security** - Rate limiting, input validation, password hashing

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+ dengan TypeScript
- **Framework**: Express.js dengan middleware security
- **Database**: MongoDB dengan Mongoose ODM
- **Cache**: Redis untuk session dan performance
- **Authentication**: JWT dengan bcrypt password hashing
- **Validation**: Joi schemas untuk input validation
- **Logging**: Winston untuk comprehensive logging

## ⚡ Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local atau Atlas)
- Redis (optional, untuk production)

### Installation

1. **Install dependencies**

```bash
npm install
```

2. **Environment setup**

```bash
cp .env.example .env
# Edit .env dengan konfigurasi database
```

3. **Run development**

```bash
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL=mongodb://localhost:27017/puskesmas
MONGO_DB_NAME=puskesmas

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Server
PORT=5000
NODE_ENV=development

# Security
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

## 📋 API Endpoints

### Authentication

```
POST   /api/v1/auth/login     # User login
POST   /api/v1/auth/logout    # User logout
GET    /api/v1/auth/me        # Get current user info
```

### Patients

```
GET    /api/v1/patients       # Get all patients (paginated)
POST   /api/v1/patients       # Create new patient
GET    /api/v1/patients/:id   # Get patient by ID
PUT    /api/v1/patients/:id   # Update patient
DELETE /api/v1/patients/:id   # Delete patient
GET    /api/v1/patients/stats # Get patient statistics
```

### Users (Admin only)

```
GET    /api/v1/users          # Get all users
POST   /api/v1/users          # Create new user
PUT    /api/v1/users/:id      # Update user
DELETE /api/v1/users/:id      # Delete user
```

## 👥 User Roles

- **USER**: CRUD patients, view dashboard, manage own profile
- **ADMIN**: Semua akses USER + manage users dan system settings

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes
- **Input Validation**: Joi schemas untuk semua endpoints
- **Password Security**: bcrypt dengan salt rounds
- **JWT Authentication**: Secure token-based auth
- **CORS Protection**: Configured untuk production
- **Request Sanitization**: XSS dan injection protection

## 📊 Patient Registration Format

Mendukung format nomor registrasi fleksibel:

- `XX.XX.XX.XX` - 8 digit standard
- `XX.XX.XX.XXX` - 9 digit extended
- `XX.XX.XX.XXA` - 8 digit + letter (A-Z)
- `XX.XX.XX.XXXA` - 9 digit + letter (A-Z)

## 📁 Project Structure

```
backend/
├── controllers/      # Route handlers
├── middleware/       # Custom middleware
├── models/          # MongoDB models
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Helper utilities
├── validators/      # Input validation schemas
└── logs/           # Application logs
```

## 🚀 Production Deployment

**Current Deployment**: [Fly.io](https://fly.io)

### Build Commands

```bash
npm run build    # Compile TypeScript
npm start        # Run production server
```

### Health Check

```
GET /api/v1/health
```

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Development dengan hot reload
npm run build    # Build untuk production
npm start        # Start production server
npm run lint     # ESLint checking
npm test         # Run test suite
```

### Database Seeding

```bash
npm run seed     # Seed initial admin user
```

## � API Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10
  }
}
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

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

| Category           | Technology           | Purpose                        |
| ------------------ | -------------------- | ------------------------------ |
| **Runtime**        | Node.js 18+          | JavaScript runtime environment |
| **Language**       | TypeScript           | Type-safe development          |
| **Framework**      | Express.js           | Web application framework      |
| **Database**       | MongoDB              | NoSQL document database        |
| **ODM**            | Mongoose             | MongoDB object modeling        |
| **Cache**          | Redis                | Session storage & caching      |
| **Authentication** | JWT                  | Secure token-based auth        |
| **Validation**     | Joi                  | Schema validation              |
| **Security**       | bcrypt, Helmet, CORS | Password hashing & security    |
| **Logging**        | Winston              | Application logging            |
| **File Upload**    | Multer               | Multipart form handling        |

## ⚡ Quick Start

### Prerequisites

Pastikan Anda telah menginstall:

```bash
✅ Node.js >= 18.x
✅ MongoDB >= 6.x
✅ Redis >= 6.x
✅ npm atau yarn
✅ Git
```

### Installation

```bash
# 1️⃣ Clone repository
git clone https://github.com/yourusername/puskesmas-backend.git
cd puskesmas-backend

# 2️⃣ Install dependencies
npm install

# 3️⃣ Setup environment variables
cp .env.example .env
# Edit .env file dengan konfigurasi Anda

# 4️⃣ Start required services
# MongoDB: mongod
# Redis: redis-server

# 5️⃣ Run application
npm run dev          # Development mode
npm start           # Production mode
```

### ⚙️ Environment Configuration

Buat file `.env` di root directory:

```env
# 🌐 Server Configuration
PORT=5000
NODE_ENV=development

# 🗄️ Database Configuration
MONGO_URI=mongodb://localhost:27017/puskesmas
# Atau MongoDB Atlas: mongodb+srv://user:pass@cluster.mongodb.net/puskesmas

# 🔐 JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# 🔴 Redis Configuration
REDIS_URL=redis://localhost:6379

# 🛡️ Security Configuration
RATE_LIMIT_WINDOW=900000  # 15 minutes in milliseconds
RATE_LIMIT_MAX=100        # Max requests per window
```

### 🚀 First Run

```bash
# 1. Start your services
mongod                    # Start MongoDB
redis-server              # Start Redis

# 2. Run the application
npm run dev

# 3. Test the API
curl http://localhost:5000/api/v1/patients
# Should return authentication required message

# 4. Create first admin user (development only)
npm run create-admin
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

## 📊 API Usage Examples

### 🔐 Authentication Examples

#### Register New User

```bash
curl -X POST http://localhost:5000/api/v1/auth/registration \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dokter@puskesmas.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "64f8a7b2c1234567890abcde",
    "email": "dokter@puskesmas.com",
    "role": "USER"
  }
}
```

#### Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dokter@puskesmas.com",
    "password": "SecurePass123!"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "64f8a7b2c1234567890abcde",
      "email": "dokter@puskesmas.com",
      "role": "USER"
    }
  }
}
```

### 🏥 Patient Management Examples

#### Get All Patients (with Pagination)

```bash
curl -X GET "http://localhost:5000/api/v1/patients?page=1&limit=10" \
  -H "access-token: YOUR_JWT_TOKEN"
```

#### Create New Patient

```bash
curl -X POST http://localhost:5000/api/v1/patients/create \
  -H "Content-Type: application/json" \
  -H "access-token: YOUR_JWT_TOKEN" \
  -d '{
    "name": "Budi Santoso",
    "address": "Jl. Merdeka No. 123, Jakarta Pusat",
    "registrationNumber": "P001.2025.001",
    "birthPlace": "Jakarta",
    "birthDay": "1985-05-15",
    "phone": "081234567890",
    "gender": "Laki-laki"
  }'
```

#### Search Patients by Name

```bash
curl -X GET "http://localhost:5000/api/v1/patients/search/name?name=Budi" \
  -H "access-token: YOUR_JWT_TOKEN"
```

#### Get Patient Statistics

```bash
curl -X GET "http://localhost:5000/api/v1/patients/total" \
  -H "access-token: YOUR_JWT_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalPatients": 1245,
    "todayRegistrations": 15,
    "thisMonthRegistrations": 342,
    "genderDistribution": {
      "male": 623,
      "female": 622
    },
    "ageGroups": {
      "children": 245,
      "adults": 678,
      "elderly": 322
    }
  }
}
```

## 📁 Project Structure

```
📦 puskesmas-backend/
├── 📁 controllers/              # 🎯 Business logic controllers
│   ├── authController.ts        # Authentication & authorization
│   ├── patientController.ts     # Patient CRUD operations
│   ├── userController.ts        # User management
│   ├── calendarController.ts    # Calendar & scheduling
│   └── patientExcelController.ts # Excel import/export
├── 📁 middleware/              # 🛡️ Custom middleware
│   ├── authMiddleware.ts        # JWT authentication
│   ├── authRateLimit.ts         # Rate limiting
│   ├── catchAsyncError.ts       # Error handling
│   ├── error.ts                 # Global error handler
│   ├── metrics.ts               # Performance monitoring
│   └── multerConfig.ts          # File upload configuration
├── 📁 models/                  # 🗄️ Database schemas (Mongoose)
│   ├── patientModel.ts          # Patient data model
│   └── userModel.ts             # User data model
├── 📁 routes/                  # 🛣️ API route definitions
│   ├── authRoute.ts             # Authentication routes
│   ├── patientRoute.ts          # Patient management routes
│   ├── userRoute.ts             # User management routes
│   ├── calendarRoute.ts         # Calendar routes
│   └── patientExcelRoute.ts     # Excel handling routes
├── 📁 services/                # 🔧 Business logic services
│   ├── patientService.ts        # Patient business logic
│   └── userService.ts           # User business logic
├── 📁 utils/                   # 🛠️ Utility functions
│   ├── apiResponse.ts           # Standardized API responses
│   ├── db.ts                    # Database connection
│   ├── envValidator.ts          # Environment validation
│   ├── errorHandler.ts          # Error handling utilities
│   ├── jwt.ts                   # JWT utilities
│   ├── logger.ts                # Winston logging configuration
│   └── redis.ts                 # Redis connection & utilities
├── 📁 validators/              # ✅ Data validation schemas
│   └── schemas.ts               # Joi validation schemas
├── 📁 logs/                    # 📋 Application logs (gitignored)
├── 📁 @types/                  # 🏷️ TypeScript type definitions
│   └── express/index.d.ts       # Extended Express types
├── 📄 app.ts                   # ⚙️ Express application setup
├── 📄 server.ts                # 🚀 Server entry point
├── 📄 make-admin.ts            # 👑 Admin creation utility
├── 📄 package.json             # 📦 Dependencies & scripts
├── 📄 tsconfig.json            # 🔧 TypeScript configuration
├── 📄 README.md                # 📖 Project documentation
└── 📄 SECURITY-CHECKLIST.md    # 🛡️ Security guidelines
```

### 📋 Key Files Explanation

| File                    | Purpose           | Description                               |
| ----------------------- | ----------------- | ----------------------------------------- |
| `app.ts`                | Application Setup | Express configuration, middleware, routes |
| `server.ts`             | Entry Point       | Server startup, database connection       |
| `make-admin.ts`         | Development Tool  | Create admin users (dev only)             |
| `SECURITY-CHECKLIST.md` | Security Guide    | Security best practices                   |

## 🔧 Development

### 🚀 Development Scripts

```bash
# Development with hot reload
npm run dev

# Production mode
npm start

# Build TypeScript
npm run build

# Production with explicit environment
npm run start:prod

# Development with explicit environment
npm run start:dev

# Windows-specific scripts
npm run start:prod:win
npm run start:dev:win
```

### 🔄 Development Workflow

1. **Setup Development Environment**

   ```bash
   # Clone and install
   git clone <repository-url>
   cd puskesmas-backend
   npm install

   # Setup environment
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Start Development Services**

   ```bash
   # Start MongoDB
   mongod --dbpath /path/to/data

   # Start Redis
   redis-server

   # Start development server
   npm run dev
   ```

3. **Testing & Validation**

   ```bash
   # Test API endpoints
   curl http://localhost:5000/api/v1/patients

   # Check logs
   tail -f logs/app.log
   ```

### 🧪 Testing the API

```bash
# Health check
curl http://localhost:5000/health

# Test authentication
curl -X POST http://localhost:5000/api/v1/auth/registration \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","confirmPassword":"Test123!"}'
```

## 🚀 Deployment

### 🚨 Security & Deployment Guidelines

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

### 📋 Production Deployment

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
