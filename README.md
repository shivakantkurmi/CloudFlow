# CloudFlow - Jira-Inspired DevOps Project Management Platform

A production-grade project management platform built with modern web technologies.

## 🏗️ Project Structure

```
CloudFlow/
├── backend/          # Express.js + PostgreSQL + Prisma
├── frontend/         # React + Vite + Redux Toolkit
└── docs/             # Documentation
```

## 🔧 Tech Stack

### Backend
- Node.js + Express.js
- PostgreSQL + Prisma ORM
- JWT Authentication
- Socket.IO for real-time features
- Multer for file uploads
- Express Validator for input validation

### Frontend
- React 18 with Vite
- Redux Toolkit for state management
- React Router for navigation
- Tailwind CSS for styling
- Axios for HTTP requests
- Socket.IO Client for real-time updates

## 📋 Prerequisites

- Node.js (v16+)
- PostgreSQL (v12+)
- Git

## ⚡ Quick Start

### 1. Setup Backend

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Setup database
npm run db:generate
npm run db:migrate

# Start development server
npm run dev
```

### 2. Setup Frontend

```bash
cd frontend
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

## 📁 Folder Structure

### Backend: `backend/src/`

- **config/** - Configuration files
- **routes/** - API route definitions
- **controllers/** - Request handlers
- **services/** - Business logic
- **middleware/** - Custom middleware (auth, validation, error handling)
- **validators/** - Input validation schemas
- **utils/** - Helper functions
- **sockets/** - Socket.IO event handlers
- **uploads/** - Local file storage

### Frontend: `frontend/src/`

- **components/** - Reusable React components
- **pages/** - Page-level components
- **services/** - API client & Socket.IO client
- **store/** - Redux Toolkit slices
- **hooks/** - Custom React hooks
- **utils/** - Helper functions
- **styles/** - Global CSS

## 🗄️ Database Schema

See [Database Documentation](./docs/DATABASE.md) for complete schema details.

Core tables:
- Users
- Projects
- ProjectMembers
- Tasks
- TaskComments
- TaskAttachments
- Notifications
- ActivityLogs

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- CORS protection
- Helmet.js for HTTP headers
- Input validation & sanitization
- Rate limiting

## 📚 API Documentation

See [API Documentation](./docs/API.md) for complete endpoint reference.

## 🧪 Testing

Testing guides for each module will be provided during development.

## 📦 Building for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

## 📝 License

ISC

## 👥 Development Team

Senior Software Architect & Full Stack Engineer

---

**Status**: All core modules complete. Ready for final review and presentation!
