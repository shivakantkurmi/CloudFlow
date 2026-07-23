# CloudFlow - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

## Response Format

### Success Response (2xx)
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

### Error Response (4xx, 5xx)
```json
{
  "success": false,
  "error": "error_code",
  "message": "Human readable message"
}
```

## Status Codes
- **200**: OK
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **409**: Conflict
- **422**: Unprocessable Entity
- **500**: Internal Server Error

---

## Endpoints (To be added per module)

### Module 1: Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get the authenticated user

`register` accepts `email`, `firstName`, `lastName`, and a password with at least eight characters, including uppercase, lowercase, and a number. `login` accepts `email` and `password`. Successful registration, login, and refresh responses include `{ user, accessToken, refreshToken }`; refresh tokens are rotated on every refresh.

### Module 2: Project Management
- `POST /projects` - Create project
- `GET /projects` - Get user's projects
- `GET /projects/:id` - Get project details
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `POST /projects/:id/members` - Add member to project
- `GET /projects/:id/members` - Get project members
- `DELETE /projects/:id/members/:userId` - Remove member from project

Project keys are normalized to uppercase and must be unique. Creating a project creates an `ADMIN` project membership for its owner. Member invitations add an existing active user by email; project owners, project admins/leads, and system admins have management permissions, while only owners/system admins may delete.

### Module 3: Task Management
- `POST /projects/:projectId/tasks` - Create task
- `GET /projects/:projectId/tasks` - Get project tasks
- `GET /projects/:projectId/tasks/:id` - Get task details
- `PUT /projects/:projectId/tasks/:id` - Update task
- `DELETE /projects/:projectId/tasks/:id` - Delete task

Task payloads support `title`, `description`, `assigneeId`, `dueDate`, `priority`, `status`, and `labels` (`[{ label, color? }]`). Assignees must already belong to the project. Project members can create tasks; only the task creator, a project lead/admin, or a system admin can modify or delete one.

### Module 4: Kanban Board
- `GET /projects/:projectId/tasks/status/:status` - Get tasks by status
- `PUT /projects/:projectId/tasks/:id/status` - Change task status

The status endpoint accepts `{ status, position }`. The board uses fractional positions while dragging, avoiding a full-column rewrite for ordinary reorder operations.

### Module 5: Real-time Features (WebSocket)
- `task:created` - New task created
- `task:updated` - Task updated
- `task:deleted` - Task deleted
- `comment:added` - New comment added
- `notification:new` - New notification

Socket clients connect with the access token as `auth.token`. Authorized clients join a project room with `project:join` and receive task events only for that room. Comment and notification broadcasts use the same authenticated room design when those modules are added.

### Module 6: Comments & Attachments
- `POST /tasks/:taskId/comments` - Add comment
- `GET /tasks/:taskId/comments` - Get comments
- `DELETE /tasks/:taskId/comments/:id` - Delete comment
- `POST /tasks/:taskId/attachments` - Upload attachment
- `GET /tasks/:taskId/attachments` - Get attachments
- `DELETE /tasks/:taskId/attachments/:id` - Delete attachment

### Module 7: Activity & Search
- `GET /projects/:projectId/activity` - Get activity log
- `GET /search` - Search tasks, projects, users

### Module 8: Profile & Dashboard
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update profile
- `GET /dashboard` - Get dashboard data
- `GET /notifications` - Get notifications
- `PUT /notifications/:id/read` - Mark notification as read

---

## Error Codes

- `INVALID_CREDENTIALS` - Email or password incorrect
- `EMAIL_ALREADY_EXISTS` - Email already registered
- `USER_NOT_FOUND` - User doesn't exist
- `PROJECT_NOT_FOUND` - Project doesn't exist
- `TASK_NOT_FOUND` - Task doesn't exist
- `UNAUTHORIZED` - No token or invalid token
- `FORBIDDEN` - Insufficient permissions
- `VALIDATION_ERROR` - Input validation failed
- `DUPLICATE_ENTRY` - Resource already exists
- `INTERNAL_SERVER_ERROR` - Server error

---

## Rate Limiting

Global rate limit: 100 requests per 15 minutes per IP
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1234567890
```

---

**Note**: Detailed endpoint specifications will be added as each module is implemented.
