# Online Hobby & Skills Tracker with Community Sharing on Cloud

A cloud-based web application for managing personal skills and hobbies, setting learning goals, tracking practice activities, monitoring progress, and sharing achievements through a community platform.

The project demonstrates the integration of **React, FastAPI, REST APIs, JWT authentication, Supabase PostgreSQL, Supabase Storage, and Docker** into a practical cloud-computing application.

---

## Overview

The **Online Hobby & Skills Tracker with Community Sharing on Cloud** provides a centralized platform where users can organize their learning activities and monitor their progress over time.

Users can create skills or hobbies, define learning goals and milestones, record practice sessions, view progress analytics, and participate in a community through posts, comments, likes, and follows.

Application data is persisted using **Supabase PostgreSQL**, while **Supabase Storage** provides cloud-based object/file storage.

The application is designed with a separation between the React frontend, FastAPI backend, and cloud services, providing a practical example of a modern cloud-connected web application architecture.

---

## Key Features

### 👤 User Authentication & Profiles
- User registration and login
- JWT-based authentication
- Protected API endpoints
- User profile management
- User-specific data access

### 🎯 Skill & Hobby Management
- Create and manage skills and hobbies
- Categorize skills
- Set current and target proficiency levels
- Define learning periods
- Track active, paused, and completed skills
- Add descriptions for learning activities

### 📌 Goals & Milestones
- Create learning goals for individual skills
- Set target values and deadlines
- Track current progress
- Manage goal status
- Define milestones for larger goals
- Monitor completed milestones

### ⏱️ Practice Tracking
- Record practice sessions
- Track duration and activities
- Add practice notes
- Associate practice sessions with specific skills
- Calculate practice statistics

### 📊 Progress Analytics
- Total practice hours
- Weekly practice hours
- Monthly practice hours
- Practice distribution by skill
- Most-practiced skill
- Current and longest practice streaks
- Goal and milestone statistics

### 🌐 Community Sharing
- Create skill-related posts
- Comment on community posts
- Like posts
- Follow other users
- Share learning progress and achievements

### ☁️ Cloud Storage
- Cloud-connected PostgreSQL database through Supabase
- Supabase Storage for object/file storage
- User-specific file management
- Cloud persistence across application sessions

### 🔐 Security
- JWT authentication
- Protected backend routes
- User-specific data filtering
- Environment-based configuration
- Secrets kept outside source control

### 🐳 Development & Deployment
- Dockerized backend
- React/Vite frontend
- Git/GitHub-ready project structure
- Environment-based configuration

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Build Tool | Vite |
| Backend | Python FastAPI |
| API | REST API |
| Authentication | JWT |
| Database | Supabase PostgreSQL |
| Object Storage | Supabase Storage |
| Containerization | Docker |
| Styling | HTML5 / CSS3 |
| Version Control | Git & GitHub |

---

## Architecture

```text
                         ┌─────────────────────────┐
                         │       React + Vite      │
                         │        Frontend         │
                         └────────────┬────────────┘
                                      │
                                  REST API
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │      FastAPI Backend    │
                         │                         │
                         │ • Authentication        │
                         │ • Business Logic        │
                         │ • Validation             │
                         │ • Analytics              │
                         │ • Community Features     │
                         └────────────┬────────────┘
                                      │
                     ┌────────────────┴────────────────┐
                     │                                 │
                     ▼                                 ▼
          ┌─────────────────────┐          ┌─────────────────────┐
          │ Supabase PostgreSQL │          │  Supabase Storage   │
          │                     │          │                     │
          │ Users               │          │ User Files          │
          │ Skills              │          │ Objects             │
          │ Goals               │          │                     │
          │ Milestones          │          └─────────────────────┘
          │ Practice Sessions   │
          │ Posts               │
          │ Comments            │
          │ Likes               │
          │ Follows             │
          └─────────────────────┘
```

---

## Cloud Computing Concepts Demonstrated

This project demonstrates several practical cloud-computing concepts:

- **Cloud Database** — Supabase PostgreSQL
- **Cloud Object Storage** — Supabase Storage
- **RESTful Cloud Services** — FastAPI REST endpoints
- **Authentication & Authorization** — JWT-based authentication
- **Cloud Data Persistence** — persistent application data stored remotely
- **Containerization** — Docker-based backend environment
- **Environment-Based Configuration** — secrets and service configuration through environment variables
- **Client-Server Architecture** — React frontend communicating with a cloud-connected backend
- **Scalable Application Structure** — separation of presentation, API, business logic, database, and storage layers

---

## Project Structure

```text
Cloud-Hobby-Skills-Tracker/
│
├── backend/
│   ├── app.py
│   ├── auth.py
│   ├── cloud_store.py
│   ├── store.py
│   ├── requirements.txt
│   ├── .env.example
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── ...
│
├── Dockerfile
├── docker-compose.yml
├── README.md
└── ...
```

---

## Database

The application uses **Supabase PostgreSQL** for persistent cloud data storage.

### Main Tables

```text
users
skills
goals
milestones
practice_sessions
posts
comments
likes
follows
files
```

### Relationships

```text
User
 ├── Skills
 │    └── Goals
 │         └── Milestones
 │
 ├── Practice Sessions
 │
 ├── Posts
 │    ├── Comments
 │    └── Likes
 │
 ├── Follows
 │
 └── Files
```

This relational structure allows the application to maintain relationships between users, learning activities, goals, community content, and uploaded files.

---

## Supabase Storage

The application uses **Supabase Storage** for cloud-based object/file storage.

A private storage bucket is used for application files, while file metadata is maintained in PostgreSQL.

The database stores information such as:

- File ID
- User ID
- Object path
- Original filename
- Content type
- File size
- File purpose
- Creation timestamp

This demonstrates the separation between **structured data storage** and **object storage**.

---

## Authentication

Authentication is implemented using **JSON Web Tokens (JWT)**.

The general authentication flow is:

```text
User
 │
 ▼
React Login/Register
 │
 ▼
FastAPI Authentication API
 │
 ├── Validate credentials
 │
 └── Generate JWT
       │
       ▼
React stores authentication state
       │
       ▼
Protected API Requests
       │
       ▼
FastAPI validates JWT
       │
       ▼
User-specific data
```

Protected endpoints verify the authenticated user before accessing or modifying user-specific resources.

---

## API

The FastAPI backend exposes REST endpoints for the application's major features.

Examples include:

```text
/api/register
/api/login
/api/profile
/api/skills
/api/goals
/api/milestones
/api/practice
/api/posts
/api/comments
/api/files
/api/analytics/dashboard
```

Interactive API documentation is available through FastAPI's automatically generated documentation:

```text
http://localhost:8000/docs
```

when the backend is running locally.

---

## Installation

### Prerequisites

Install the following:

- Python 3.12+
- Node.js and npm
- Docker Desktop
- Git
- A Supabase account

---

## 1. Clone the Repository

```bash
git clone https://github.com/srsimsima81-cloud/Online-Hobby-And-Skills-Tracker-With-Community-Sharing-On-Cloud.git
cd Online-Hobby-And-Skills-Tracker-With-Community-Sharing-On-Cloud
```

---

## 2. Configure Supabase

Create a Supabase project and configure:

- PostgreSQL database
- Required database tables
- `hobby-files` Storage bucket

Run the project's database schema in the **Supabase SQL Editor**.

Do not commit real Supabase credentials to GitHub.

---

## 3. Backend Configuration

Navigate to the backend:

```bash
cd backend
```

Create the environment file from the example:

### Windows CMD

```bat
copy .env.example .env
```

### PowerShell

```powershell
Copy-Item .env.example .env
```

Configure the required environment variables in `.env`.

Example:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
```

Use your actual values locally.

**Never commit the real `.env` file.**

---

## 4. Backend Setup

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```bat
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI backend:

```bash
uvicorn app:app --reload
```

The backend will be available at:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

---

## 5. Frontend Setup

Open another terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

## 6. Docker

The backend can also be run using Docker where configured.

From the project root:

```bash
docker compose up -d --build
```

Check the running services:

```bash
docker compose ps
```

Stop the services:

```bash
docker compose down
```

---

## Environment Variables

Real credentials and secrets must remain outside Git.

Use:

```text
.env
```

for local configuration and:

```text
.env.example
```

for safe placeholder configuration.

Never commit:

```text
.env
*.key
*.pem
credentials.json
service-account files
```

or other files containing secrets.

---

## Usage

After starting the frontend and backend:

1. Register an account.
2. Log in using the registered credentials.
3. Complete the profile.
4. Add skills or hobbies.
5. Create learning goals.
6. Add milestones where required.
7. Record practice sessions.
8. Monitor progress through analytics.
9. Create community posts.
10. Interact with community content.
11. Upload and manage supported files through cloud storage.

---

## Sample Demonstration Workflow

A typical demonstration can follow this sequence:

```text
Register
   ↓
Login
   ↓
Create Skills/Hobbies
   ↓
Create Learning Goals
   ↓
Record Practice Sessions
   ↓
View Analytics
   ↓
Create Community Post
   ↓
Comment / Like / Follow
   ↓
Upload File
   ↓
Verify Cloud Persistence
```

---

## Testing

The application should be tested across the following areas:

### Authentication
- Registration
- Login
- Invalid credentials
- Protected routes
- JWT validation

### Skills
- Create skill
- View skills
- Update skill
- Status changes
- User-specific access

### Goals & Milestones
- Goal creation
- Progress tracking
- Deadline handling
- Milestone creation
- Milestone completion

### Practice
- Practice-session creation
- Duration tracking
- Skill association
- Analytics calculations
- Practice streaks

### Community
- Post creation
- Comments
- Likes
- Follows
- User-specific content

### Cloud
- Supabase database persistence
- Supabase Storage upload
- File retrieval
- File deletion
- User-specific file access

---

## Expected Output and Verification

After successful setup, the application should provide:

- Working registration and login
- Authenticated user dashboard
- Skill and hobby management
- Goal and milestone tracking
- Practice-session recording
- Practice analytics
- Community posts
- Comments and likes
- Follow functionality
- Cloud database persistence
- Cloud file storage
- Protected API endpoints
- Responsive React interface

The application should continue to display persisted data after restarting the backend because the primary application data is stored in the cloud database rather than only in local memory.

---

## Educational Purpose

This project is developed as an educational demonstration of cloud-connected application development.

It focuses on understanding:

- Cloud databases
- Cloud object storage
- REST APIs
- Authentication
- Client-server architecture
- Containerization
- Persistent cloud data
- Community-oriented application design

---
