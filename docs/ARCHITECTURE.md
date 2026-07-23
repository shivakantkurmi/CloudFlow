# CloudFlow - Architecture Documentation

## System Design

CloudFlow is built following **Clean Architecture** principles, separating concerns into distinct layers:

```
┌─────────────────────────────────┐
│       CLIENT (React/Vite)       │
├─────────────────────────────────┤
│       HTTP/WebSocket            │
├─────────────────────────────────┤
│    Express.js (Server)          │
├─────────────────────────────────┤
│   Routes → Controllers          │
├─────────────────────────────────┤
│   Services (Business Logic)     │
├─────────────────────────────────┤
│   Prisma ORM (Data Access)      │
├─────────────────────────────────┤
│   PostgreSQL (Database)         │
└─────────────────────────────────┘
```

## Backend Architecture

### 1. Routes Layer
- Express route definitions
- Route grouping by feature (auth, projects, tasks, etc.)
- Middleware attachment at route level

### 2. Controllers Layer
- Thin controllers handling HTTP request/response
- Input validation through middleware
- Delegate business logic to services
- Format responses consistently

### 3. Services Layer
- Core business logic
- Data transformation
- Cross-cutting concerns (notifications, activity logs)
- Database operations through Prisma

### 4. Middleware Layer
- **Authentication**: JWT verification
- **Authorization**: Role-based access control
- **Validation**: Input validation with express-validator
- **Error Handling**: Centralized error response formatting
- **Rate Limiting**: Request throttling
- **CORS**: Cross-origin resource sharing

### 5. Data Access Layer (Prisma)
- ORM for type-safe database queries
- Automatic migrations
- Relationship management
- Transaction support

### 6. Real-time Layer (Socket.IO)
- Event-driven architecture
- Namespace organization
- Room-based broadcasting
- Automatic reconnection handling

## Frontend Architecture

### 1. Pages Layer
- Route-mapped components
- Page-level data fetching
- Layout management

### 2. Components Layer
- Reusable UI components
- Props-based configuration
- Separated logic and presentation

### 3. Hooks Layer
- Custom React hooks for business logic
- API data fetching hooks
- Redux connection hooks
- State management helpers

### 4. Store Layer (Redux Toolkit)
- Slices for feature-based state
- Async thunks for API calls
- Selectors for state derivation
- Normalized state structure

### 5. Services Layer
- API client (Axios instance)
- Socket.IO client initialization
- External service integration

### 6. Utils Layer
- Helper functions
- Constants
- Formatting utilities

## Data Flow

### Request Flow (Backend)
```
HTTP Request
    ↓
Express Middleware (CORS, Helmet, Rate Limit)
    ↓
Route Handler
    ↓
Controller (Extract & Validate Input)
    ↓
Service (Business Logic)
    ↓
Prisma (Database Query)
    ↓
PostgreSQL (Data Persistence)
    ↓
Service (Format Response Data)
    ↓
Controller (Send HTTP Response)
    ↓
HTTP Response
```

### Real-time Flow (WebSocket)
```
Client Socket.IO Event
    ↓
Socket Handler (Namespace)
    ↓
Service (Process Event)
    ↓
Prisma (Update Database)
    ↓
Broadcast to Room/Namespace
    ↓
Client Updates Redux Store
    ↓
UI Re-renders
```

### State Management Flow (Frontend)
```
User Interaction
    ↓
Dispatch Redux Action
    ↓
Async Thunk (API Call)
    ↓
Update Slice State
    ↓
Selector (Derived State)
    ↓
Component Re-renders
```

## Key Design Principles

### 1. Separation of Concerns
- Each layer has a single responsibility
- Controllers don't contain business logic
- Services don't handle HTTP concerns
- Middleware focuses on cross-cutting concerns

### 2. DRY (Don't Repeat Yourself)
- Reusable middleware for common operations
- Shared validation schemas
- Common error handling
- Utility functions for repeated logic

### 3. Security First
- Authentication on all protected routes
- Authorization checks in services
- Input validation at controller level
- Password hashing and JWT signing
- CORS and Helmet protection

### 4. Scalability
- Middleware can be easily added/removed
- Services can be extracted to microservices
- Database queries are optimized with proper indexing
- Socket.IO namespaces allow feature-specific real-time handling

### 5. Testability
- Services are pure functions
- Controllers are thin and easily mockable
- Middleware can be tested independently
- Business logic is separated from HTTP concerns

## Module Organization

Each module follows this structure:

```
Module X
├── Backend
│   ├── routes/authRoutes.js
│   ├── controllers/authController.js
│   ├── services/authService.js
│   ├── middleware/authMiddleware.js
│   ├── validators/authValidator.js
│   └── utils/tokenUtils.js
├── Frontend
│   ├── pages/LoginPage.jsx
│   ├── components/LoginForm.jsx
│   ├── store/authSlice.js
│   ├── hooks/useAuth.js
│   └── services/authService.js
└── Tests
    ├── backend.test.js
    └── frontend.test.js
```

## Technology Choices

### Why Express.js?
- Lightweight and flexible
- Rich middleware ecosystem
- Great for REST APIs
- Excellent Socket.IO integration

### Why Prisma?
- Type-safe database access
- Auto-generated migrations
- Intuitive schema design
- Great DX with IDE autocompletion

### Why Redux Toolkit?
- Simplified Redux setup
- Built-in immer for immutable updates
- Async thunks for data fetching
- Better devtools integration

### Why Tailwind CSS?
- Utility-first approach
- Highly customizable
- Small bundle size
- Rapid UI development

### Why Socket.IO?
- Real-time bidirectional communication
- Fallback to polling if WebSocket unavailable
- Easy room/namespace management
- Automatic reconnection

## Performance Optimizations

### Backend
- Database query optimization with indexes
- Connection pooling
- Caching where appropriate
- Efficient pagination
- Response compression

### Frontend
- Code splitting with React.lazy()
- Image optimization
- Redux selectors for derived state
- Component memoization
- Bundle size monitoring

## Security Measures

1. **Authentication**: JWT with refresh tokens
2. **Authorization**: Role-based access control (RBAC)
3. **Input Validation**: express-validator schemas
4. **Password Security**: bcryptjs hashing
5. **CORS**: Whitelist trusted origins
6. **Helmet**: HTTP header security
7. **Rate Limiting**: Prevent brute force attacks
8. **SQL Injection**: Prevented by Prisma ORM
9. **XSS Protection**: React's built-in escaping

## Error Handling Strategy

### Backend
- Centralized error handler middleware
- Custom error classes
- Proper HTTP status codes
- Consistent error response format
- Detailed logging

### Frontend
- Global error boundary
- Toast notifications for user feedback
- Redux error state management
- Retry logic for failed requests
- Graceful degradation

---

**Status**: Module 0 architecture complete. Ready for database setup and Module 1 (Authentication).
