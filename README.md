# CloudFlow

## Overview

CloudFlow is a full-stack collaborative project management platform inspired by modern enterprise tools such as Jira and Linear. It provides organization workspaces, project management, Kanban boards, task tracking, real-time collaboration, role-based access control (RBAC), activity logs, notifications, and file attachments.

**Tech Stack**

- **Frontend**: React + Vite + Redux Toolkit + Tailwind CSS + Axios
- **Backend**: Node.js + Express + Socket.IO + Multer
- **Database**: PostgreSQL (Supabase) + Prisma ORM
- **Authentication**: JWT + Refresh Tokens (deduplicated refresh handlers & global session checks)
- **Real-time**: Socket.IO (room-based project channels)
- **Deployment**:
  - Frontend: Vercel
  - Backend: Render
  - Database: Supabase PostgreSQL (Port 6543 pooler)
- **Original cloud architecture**: AWS (designed for EC2, RDS, S3, ALB, CloudFront, etc.)

---

# Deployment Note

> [!IMPORTANT]
> CloudFlow was originally deployed on AWS as part of a cloud-native architecture.
>
> To reduce ongoing cloud costs, the AWS infrastructure was intentionally destroyed and this repository currently uses **Vercel + Render** for demonstration purposes.
>
> The application remains fully functional and can be redeployed to AWS by following the instructions below.

---

# Render Limitation

> [!WARNING]
> The current remote backend runs on **Render**, whose free instances use **ephemeral storage**.
>
> This means:
> - Uploaded task attachments are stored only on the running instance container disk.
> - Files will disappear after a server restart, sleep cycle, or a new deployment.
> - Local uploads are **not suitable for production**.
>
> For production deployments, migrate file storage to **Amazon S3** or use **Supabase Storage**.

---

# Current Features

- **Robust Authentication**: JWT authorization, refresh token rotation, and transparent forced logout redirects for expired sessions.
- **Organization Workspaces**: Dynamic organization onboarding and a header dropdown switcher.
- **Project Management**: Support for private & public projects with automatic organization membership sync.
- **RBAC Security**: 
  - Organization-level roles: `OWNER`, `ADMIN`, `MEMBER`.
  - Project-level roles: `PROJECT_MANAGER`, `DEVELOPER`, `TESTER`, `VIEWER`.
  - Permission protections (e.g., preventing project managers from removing organization creators/owners).
  - Automatic organization cleanup (removing users from organization memberships when they leave or are kicked from their last project).
  - Visual project creation locks for standard members.
- **Task Board & Lists**: Drag-and-drop Kanban columns (To Do, In Progress, Testing, Done) and a spreadsheet-like List tab view.
- **Real-time Websocket Comments**: Chat threads under tasks syncing instantly across everyone's screen.
- **Task Attachments**: Multer-based secure file upload, download, and delete flows.
- **Activity Timeline**: Full-fidelity audit log logging all actions (task moves, comments, updates, project invites).
- **Notification Center Center**: Real-time notifications and unread counters.

---

# AWS Migration Guide

## 1. Amazon RDS (Recommended)

Replace the current PostgreSQL database with Amazon RDS.

### Steps

1. Create a PostgreSQL RDS instance.
2. Allow inbound traffic from the backend EC2 security group.
3. Update `.env`:
   ```env
   DATABASE_URL=postgresql://username:password@rds-endpoint:5432/cloudflow
   ```
4. Run:
   ```bash
   npx prisma migrate deploy
   ```

---

## 2. Amazon S3 (Required for Production)

Replace the local uploads folder (`backend/uploads/`) with Amazon S3.

### Required Changes

Install the AWS SDK clients:
```bash
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage
```

Create an S3 service file:
`src/services/s3.js`

Replace every local upload in `collaborationService.js` with:
- Upload to S3 bucket.
- Save the S3 object key/path in PostgreSQL.
- Generate signed download URLs when users request files.

Enable bucket protection:
- Bucket Versioning.
- Block Public Access.
- IAM-only access (IAM role policy).

---

## 3. IAM Role

Never hardcode AWS credentials or save secret keys in files.

Attach an IAM Role to your EC2 instance profile with permissions for:
- S3 read/write.
- CloudWatch logging.

The AWS SDK will automatically read the credentials from the EC2 metadata server.

---

## 4. CloudWatch

Install the CloudWatch Agent on EC2.

Configure it to monitor:
- CPU utilization.
- Memory usage.
- Disk space.
- Express application error logs.

---

## 5. Secrets Manager

Move sensitive values from the `.env` file to AWS Secrets Manager.

Recommended secrets:
- `JWT_SECRET`
- `DATABASE_URL`
- `SMTP credentials`

---

## 6. Application Load Balancer

Place an ALB in front of the EC2 Auto Scaling Group.

Benefits:
- SSL/TLS termination.
- Health checks.
- Scalability.

---

## 7. Auto Scaling Group

Launch EC2 instances using an Auto Scaling Group.

Benefits:
- Automatic recovery of crashed instances.
- Horizontal scaling based on CPU/traffic thresholds.

---

## 8. CloudFront + S3

Deploy the React build folder (`dist/`) to an S3 bucket and distribute it globally using CloudFront.

Benefits:
- CDN caching.
- HTTPS termination.
- Faster global page load performance.

---

## 9. Amazon SES

Replace SMTP credentials with SES for transactional emails.

Use cases:
- Project invitation emails.
- Password resets.
- Real-time notifications alerts.

---

## 10. Amazon SQS (Future)

Current notification flow:
```text
API ──> Send Notification
```

Future decoupled flow:
```text
API ──> SQS Queue ──> Notification Worker
```

Benefits:
- Retry support.
- Better scalability.
- Non-blocking API requests.

---

## 11. Amazon SNS (Future)

SNS can be connected to the SQS processing queue.

Use cases:
- Email.
- SMS.
- Push notifications.

---

## Suggested Production Architecture

```text
Users
   │
Route53
   │
CloudFront
 ├───────────────┐
 │               │
React (S3)      ALB
                  │
          Auto Scaling Group
             │          │
           EC2        EC2
             │
      ┌──────┼─────────┐
      │      │         │
     RDS     S3    CloudWatch
      │
 Secrets Manager
      │
   IAM Roles
      │
   SQS → Worker → SNS
```
