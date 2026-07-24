# CloudFlow

> A modern collaborative project management platform built with React, Node.js, Express, Prisma and PostgreSQL. CloudFlow provides organizations, projects, Kanban boards, tasks, real-time collaboration, notifications, activity logs, RBAC, and file attachments.

## Tech Stack

- **Frontend:** React (Vite) + Redux Toolkit + Tailwind CSS + Axios
- **Backend:** Node.js + Express + Socket.IO + Multer
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** JWT + Refresh Tokens (deduplicated client refresh handler)
- **Realtime:** Socket.IO (project channel rooms)
- **Containerization:** Docker
- **Current Deployment:** Vercel + Render

---

# Project Status

CloudFlow was originally deployed on AWS during development.

To reduce recurring cloud costs, the AWS infrastructure was intentionally destroyed. The application is currently deployed using:

- Frontend → **Vercel**
- Backend → **Render** (via standard web service container instances)
- Database → **Supabase PostgreSQL** (using Port 6543 transaction pooler)

The application remains fully functional and can be redeployed on AWS using the instructions below.

---

# Render Storage Warning

> [!WARNING]
> The current Render deployment stores uploaded files locally under `backend/uploads/`.
>
> Render free instances use **ephemeral storage**.
>
> This means uploaded attachments can be lost whenever the service restarts, goes to sleep, or is redeployed.
>
> **For production deployments, Amazon S3 or Supabase Storage buckets should always be used instead of local storage.**

---

# Features

- **User Authentication**: Secure JWT-based access tokens with refresh token rotation and auto-logout on session expiration.
- **Organizations & Workspaces**: Create workspaces and toggle between different team scopes seamlessly using the top-left switcher.
- **Project Management**: Create public & private projects. Automatic organization membership sync dynamically grants workspace permissions when invited to projects.
- **Granular RBAC**:
  - Organization roles: `OWNER`, `ADMIN`, `MEMBER`.
  - Project roles: `PROJECT_MANAGER`, `DEVELOPER`, `TESTER`, `VIEWER`.
  - Security checks that prevent project managers from removing workspace creators/owners.
- **Kanban Board**: Drag-and-drop task cards between columns (`To Do`, `In Progress`, `Testing`, `Done`).
- **Task Management**: Spreadsheet-like detailed list layout with priorities (`Low`, `Medium`, `High`, `Critical`), due dates, assignees, and custom labels.
- **Real-time Comments**: Comment threads on tasks syncing immediately across all active screens.
- **File Attachments**: Upload, download, and delete attachments safely.
- **Notification Center**: Header notifications dropdown updating in real-time when assigned to tasks or invited to projects.
- **Activity Timeline**: Full auditing timeline logging all actions (task moves, comments, edits, invites).
- **Access Cleanup**: Automatic organization membership cleanup when users leave or are removed from their last remaining project in that organization.

---

# AWS Production Deployment

The following AWS services can be integrated **using the current application with little or no business logic changes**.

## 1. Docker (Backend)

Containerize the backend before deployment.

Example Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 5000

CMD ["npm","start"]
```

Build

```bash
docker build -t cloudflow-backend .
```

Run locally

```bash
docker run -p 5000:5000 --env-file .env cloudflow-backend
```

---

## 2. Amazon EC2

Recommended Instance

- Ubuntu 22.04
- t3.small (or higher)

Install Docker

```bash
sudo apt update
sudo apt install docker.io -y
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu
newgrp docker
```

Run the container

```bash
docker pull <image>

docker run -d \
--restart always \
-p 5000:5000 \
--env-file .env \
--name cloudflow \
<image>
```

---

## 3. Nginx

Install

```bash
sudo apt install nginx -y
```

Configure Nginx as a reverse proxy with WebSocket support.

Benefits

- Reverse Proxy
- HTTPS
- WebSocket forwarding
- Better security

---

## 4. Amazon RDS

Replace the local PostgreSQL instance with Amazon RDS.

Update

```env
DATABASE_URL=postgresql://user:password@rds-endpoint:5432/cloudflow
```

Run

```bash
npx prisma migrate deploy
```

No application logic changes are required.

---

## 5. Amazon S3

### Current

```
Browser
    │
Express
    │
backend/uploads/
```

### Production

```
Browser
    │
Express
    │
Amazon S3
```

Changes required

- Install AWS SDK
- Upload files to S3
- Store object key and metadata in PostgreSQL
- Generate signed download URLs

This is a small storage-layer change; the attachment feature itself remains unchanged.

---

## 6. IAM Roles

Attach an IAM Role to the EC2 instance.

Avoid storing AWS credentials inside `.env`.

---

## 7. AWS Secrets Manager

Move sensitive values such as

- DATABASE_URL
- JWT_SECRET
- Refresh Token Secret
- SMTP credentials
- API Keys

from `.env` into Secrets Manager.

---

## 8. Amazon CloudWatch

Monitor

- Application logs
- Docker logs
- CPU
- Memory
- Disk
- Network

---

## 9. Application Load Balancer (ALB)

Place an ALB in front of the EC2 instance.

Benefits

- HTTPS termination
- Health checks
- Better availability
- Easy horizontal scaling

---

## 10. Auto Scaling Group

Move EC2 into an Auto Scaling Group.

Benefits

- Automatic recovery
- Scale with traffic
- High availability

---

## 11. Amazon S3 + CloudFront (Frontend)

Deploy the React production build to an S3 bucket.

Connect CloudFront as a CDN.

Benefits

- Faster asset delivery
- HTTPS
- Lower latency
- Global caching

---

## 12. Route 53

Point your domain to CloudFront and the ALB.

Example

```
cloudflow.example.com

api.cloudflow.example.com
```

---

# Suggested AWS Architecture

```text
                    Users
                      │
                  Route 53
                      │
                 CloudFront
              ┌────────┴────────┐
              │                 │
         React (S3)            ALB
                                 │
                     Auto Scaling Group
                         ┌───────┴───────┐
                         │               │
                    EC2 (Docker)    EC2 (Docker)
                         │
          ┌──────────────┼──────────────┐
          │              │              │
         RDS             S3        CloudWatch
          │
   Secrets Manager
          │
      IAM Roles
```

---

# Future Enhancements

The following services are **not implemented in the current version**. They are planned for future releases to improve scalability and reliability.

## Amazon SQS

Use SQS to decouple notification processing.

Future flow

```
API
 │
 ▼
SQS Queue
 │
 ▼
Notification Worker
 │
 ▼
Database + Socket.IO
```

Benefits

- Retry support
- Non-blocking APIs
- Better scalability

---

## Amazon SNS

After SQS processing, publish notifications using SNS.

Potential use cases

- Email notifications
- SMS alerts
- Push notifications

---

## Amazon SES

Replace SMTP for

- Password reset emails
- Project invitations
- Email notifications

---

## Redis (ElastiCache)

- Rate limiting
- Caching
- Presence tracking
- Frequently accessed project data

---

## GitHub Actions CI/CD

Automate

- Build
- Test
- Docker image creation
- Deployment to EC2

---

## Blue-Green Deployment

Deploy new versions with zero downtime.

---

# License

This project is intended for educational and portfolio purposes. Feel free to fork and extend it for learning.
