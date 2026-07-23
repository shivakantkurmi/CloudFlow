# CloudFlow - Database Schema

## Overview

PostgreSQL database designed with proper normalization, foreign key constraints, and appropriate indexing for performance.

## Tables

### 1. Users
Stores user account information.

```sql
id (String, Primary Key)
email (String, Unique)
passwordHash (String)
firstName (String)
lastName (String)
avatar (String, Nullable)
role (Enum: ADMIN, PROJECT_MANAGER, MEMBER)
status (Enum: ACTIVE, INACTIVE, SUSPENDED)
createdAt (DateTime)
updatedAt (DateTime)
```

**Indexes**: email

---

### 2. Projects
Stores project information.

```sql
id (String, Primary Key)
name (String)
description (String, Nullable)
key (String, Unique)  -- Short key like "CLOUD"
ownerId (String, Foreign Key -> Users.id)
status (Enum: ACTIVE, ARCHIVED, DELETED)
visibility (Enum: PRIVATE, PUBLIC)
createdAt (DateTime)
updatedAt (DateTime)
```

**Indexes**: ownerId, status

---

### RefreshTokens
Stores a hash of every issued refresh token. This supports rotation and explicit logout without persisting a usable credential.

```sql
id (String, Primary Key)
tokenHash (String, Unique)
userId (String, Foreign Key -> Users.id, CASCADE)
expiresAt (DateTime)
revokedAt (DateTime, Nullable)
createdAt (DateTime)
```

**Indexes**: userId, expiresAt

---

### 3. ProjectMembers
Links users to projects with role assignments.

```sql
id (String, Primary Key)
projectId (String, Foreign Key -> Projects.id, CASCADE)
userId (String, Foreign Key -> Users.id, CASCADE)
role (Enum: ADMIN, LEAD, MEMBER)
joinedAt (DateTime)
```

**Constraints**: Unique(projectId, userId)
**Indexes**: projectId, userId

---

### 4. Tasks
Stores task information within projects.

```sql
id (String, Primary Key)
projectId (String, Foreign Key -> Projects.id, CASCADE)
title (String)
description (String, Nullable)
assigneeId (String, Foreign Key -> Users.id, SET NULL, Nullable)
status (Enum: TODO, IN_PROGRESS, TESTING, COMPLETED)
priority (Enum: LOW, MEDIUM, HIGH, CRITICAL)
dueDate (DateTime, Nullable)
position (Float)  -- For Kanban ordering
createdAt (DateTime)
updatedAt (DateTime)
```

**Indexes**: projectId, assigneeId, status

---

### 5. TaskLabels
Stores labels/tags for tasks.

```sql
id (String, Primary Key)
taskId (String, Foreign Key -> Tasks.id, CASCADE)
label (String)  -- e.g., "bug", "feature", "urgent"
color (String)  -- Hex color code
```

**Indexes**: taskId

---

### 6. TaskComments
Stores comments on tasks.

```sql
id (String, Primary Key)
taskId (String, Foreign Key -> Tasks.id, CASCADE)
authorId (String, Foreign Key -> Users.id, CASCADE)
content (String)
createdAt (DateTime)
updatedAt (DateTime)
```

**Indexes**: taskId, authorId

---

### 7. TaskAttachments
Stores file attachments on tasks.

```sql
id (String, Primary Key)
taskId (String, Foreign Key -> Tasks.id, CASCADE)
uploadedById (String, Foreign Key -> Users.id, CASCADE)
fileName (String)
filePath (String)  -- Local path: uploads/projectId/taskId/filename
fileSize (Int)  -- In bytes
mimeType (String)
uploadedAt (DateTime)
```

**Indexes**: taskId, uploadedById

---

### 8. Notifications
Stores user notifications.

```sql
id (String, Primary Key)
userId (String, Foreign Key -> Users.id, CASCADE)
type (Enum: PROJECT_INVITE, TASK_ASSIGNED, TASK_COMMENTED, etc.)
title (String)
message (String)
relatedId (String, Nullable)  -- Could be projectId, taskId, etc.
read (Boolean, Default: false)
createdAt (DateTime)
```

**Indexes**: userId, read

---

### 9. ActivityLogs
Stores activity history for audit trail.

```sql
id (String, Primary Key)
projectId (String, Foreign Key -> Projects.id, CASCADE)
userId (String, Foreign Key -> Users.id, CASCADE)
action (Enum: CREATED, UPDATED, DELETED, COMMENTED, ASSIGNED, etc.)
entityType (String)  -- "task", "project", "member", etc.
entityId (String)  -- ID of the entity being acted upon
oldValues (Json, Nullable)  -- For tracking changes
newValues (Json, Nullable)
createdAt (DateTime)
```

**Indexes**: projectId, userId, createdAt

---

## Relationships

```
Users (1) ----< (many) ProjectMembers
Users (1) ----< (many) Projects (as owner)
Users (1) ----< (many) Tasks (as assignee)
Users (1) ----< (many) TaskComments
Users (1) ----< (many) TaskAttachments
Users (1) ----< (many) Notifications
Users (1) ----< (many) ActivityLogs

Projects (1) ----< (many) ProjectMembers
Projects (1) ----< (many) Tasks
Projects (1) ----< (many) ActivityLogs

Tasks (1) ----< (many) TaskLabels
Tasks (1) ----< (many) TaskComments
Tasks (1) ----< (many) TaskAttachments
```

## Indexing Strategy

- **Primary Keys**: All tables
- **Foreign Keys**: Automatic
- **Search Fields**: email, status, createdAt
- **Join Columns**: projectId, userId, taskId
- **Filtering**: status, read

## Cascade Rules

- **ON DELETE CASCADE**: Most relationships to prevent orphaned records
- **ON DELETE SET NULL**: Task assignee (tasks can exist unassigned)

## Normalization

- **First Normal Form (1NF)**: All tables have atomic values
- **Second Normal Form (2NF)**: No partial dependencies
- **Third Normal Form (3NF)**: No transitive dependencies

The schema follows 3NF principles with proper separation of concerns.
