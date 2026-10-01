# Online Hobby & Skills Tracker with Community Sharing on Cloud

Educational cloud-computing proof-of-work project using **React + FastAPI + Supabase PostgreSQL + Supabase Storage + JWT + REST APIs**. It tracks hobbies/skills, goals, milestones, practice, progress, achievements, community posts, likes, comments and following.

## Fixed stack
- Frontend: React 18 + Vite
- Backend: Python 3.11+ + FastAPI
- Cloud database: Supabase PostgreSQL
- Cloud object storage: Supabase Storage
- Authentication: application-managed JWT with bcrypt password hashing
- Authorization: ownership checks + optional admin role
- API: REST/JSON
- Testing: pytest/TestClient
- Optional Docker + GitHub Actions

SQLite is deliberately **not** used in the final implementation. For offline demonstration, `DATABASE_MODE=memory` is available as a temporary local simulation; cloud mode remains Supabase PostgreSQL.

## What the project demonstrates
Cloud database, object storage, authentication, authorization, REST, client-server architecture, stateless API design, environment variables, secrets management, logging, validation, analytics, pagination-ready feed queries, scalability, availability, CI/CD, CDN/load-balancing concepts and cloud deployment.

## Architecture
```text
Browser -> React/Vite -> HTTPS REST -> FastAPI -> JWT/Auth + business logic
                                      |-> Supabase PostgreSQL (structured data)
                                      |-> Supabase Storage (images/files)

Production extension: CDN -> React -> API Gateway/Load Balancer -> FastAPI replicas -> DB/Storage/Cache/Workers/Monitoring
```

## Simple explanation
The app is a cloud learning journal plus community. A user creates a profile, adds skills, sets measurable goals, logs practice, sees progress and uploads proof. Achievements can be shared with other fictional community members. Central cloud storage means the same account can be accessed from multiple devices.

## Industry relevance
The architecture is similar to EdTech/LMS systems, fitness trackers, employee learning portals, professional skill platforms, creator communities, portfolio platforms and social applications: structured user data lives in a managed database while user-generated media lives in object storage.

## Database model
```text
USERS 1--N SKILLS 1--N GOALS 1--N MILESTONES
  |         |             |
  |         +--N PRACTICE | 
  +--N POSTS 1--N COMMENTS
  |           +--N LIKES
  +--N FOLLOWS
  +--N FILES
```
Primary keys are UUIDs. Foreign keys enforce ownership relationships. Cloud-mode indexes are included for user/date, feed, comments, likes and follow queries.

## Supabase setup
1. Create a Supabase project.
2. Run `database/schema.sql` in SQL Editor.
3. Create Storage bucket `hobby-files`.
4. Keep it private for stronger security; the backend can generate signed URLs in production. A public bucket is acceptable for a classroom demo only if no private data is uploaded.
5. Put the database connection string, Supabase URL and service-role key in `backend/.env`. **Never commit these values.**

### backend/.env
```env
DATABASE_MODE=supabase
STORAGE_MODE=supabase
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_KEY=YOUR_SERVICE_ROLE_KEY
SUPABASE_BUCKET=hobby-files
SUPABASE_BUCKET_PUBLIC=false
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRE_MINUTES=120
CORS_ORIGINS=http://localhost:5173
```

## Windows local setup
```bat
cd backend
py -3 -m venv .venv
.venv\Scriptsctivate
python -m pip install --upgrade pip
pip install -r requirements.txt
copy .env.example .env
```
For no-cloud end-to-end verification, edit `.env` to:
```env
DATABASE_MODE=memory
STORAGE_MODE=local
JWT_SECRET=local-demo-secret-change-me
CORS_ORIGINS=http://localhost:5173
```
Then:
```bat
uvicorn app:app --reload
```
In another terminal:
```bat
cd frontend
npm install
copy .env.example .env
npm run dev
```
Open `http://localhost:5173`; API docs are at `http://127.0.0.1:8000/docs`.

## Fictional demo credentials
- maya@example.com / DemoPass123!
- aarav@example.com / DemoPass123!
- zoya@example.com / DemoPass123!

The memory demo starts with skills, goals, practice, posts, a like, a comment and a follow so the dashboard is meaningful immediately.

## Core workflow
Register/login -> JWT -> profile -> skill -> goal -> practice -> progress/milestone -> file upload -> community post -> feed -> like/comment/follow -> analytics.

## Progress and streak logic
`progress = min(100, current_value / target_value * 100)`.
Practice adds `duration_minutes / 60` to active goals for that skill. A streak counts consecutive calendar dates with at least one practice session, beginning with today or yesterday. This avoids counting multiple sessions on one day as multiple streak days.

## REST API
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/logout`
- GET/PUT `/api/profile`
- CRUD `/api/skills`
- POST/GET `/api/goals`
- POST/GET `/api/goals/{id}/milestones`
- POST/GET `/api/practice`
- GET `/api/skills/{id}/practice`
- POST/GET/DELETE `/api/posts...`
- POST/DELETE `/api/posts/{id}/like`
- POST/GET `/api/posts/{id}/comments`
- POST/DELETE `/api/users/{id}/follow`
- POST/GET/DELETE `/api/files...`
- GET `/api/analytics/dashboard`

Protected endpoints require `Authorization: Bearer <JWT>`.

## Expected Output and Verification
1. Login: dashboard opens and profile name appears.
2. Add Photography: it appears in Skills & Goals.
3. Create a 20-hour goal: progress is 0%.
4. Log 60 minutes: goal becomes 5% and practice history gains a row.
5. Reach a milestone: milestone changes to achieved.
6. Upload JPG/PNG/PDF <=5MB: file record/object is created.
7. Create post: post appears in community feed.
8. Second demo user likes/comments: counts update.
9. Follow another user: relationship is stored once.
10. Dashboard: practice totals, streak, goals, engagement and skill chart display.

## Recommended screenshots
Login/registration; dashboard; skill/goal screen; practice history; analytics; profile; community feed; post creation; likes/comments/following; upload/storage; Supabase SQL tables; Supabase Storage bucket; FastAPI `/docs`; CI test result; architecture diagram; GitHub repository.

## Testing
```bat
cd backend
.venv\Scriptsctivate
pytest -q
```
The automated suite uses memory/local modes so it does not require secrets. Before submission, repeat the main workflows once against your own Supabase project.

## Security
Passwords are bcrypt-hashed. JWT secrets and Supabase service credentials are environment variables. Ownership is checked before editing/deleting. Uploads are restricted to JPG/PNG/WEBP/PDF and 5 MB. Production should use HTTPS, private buckets + short-lived signed URLs, gateway rate limiting, centralized secrets, monitoring and backups. User-generated content requires moderation/reporting, spam controls and careful XSS/content validation.

## Privacy and moderation
Public profile fields should exclude email unless intentionally exposed. Posts are user-controlled public content. A production version should add reporting, blocking, moderation queues, content scanning, privacy settings and complete account/data deletion workflows. Never expose service keys or private records through public APIs.

## Scalability
10 users: one API instance is sufficient. 1,000 users: managed PostgreSQL, indexes and pagination. 100,000+ users: horizontal API replicas behind a load balancer, CDN, caching, background workers/queues and feed optimization. Fan-out-on-read keeps writes simple but can make reads expensive; fan-out-on-write makes reads fast but increases write complexity. A hybrid is suitable at large scale.

## Failure handling
DB failure -> controlled error/503 strategy; upload failure -> do not leave a broken metadata record; upload succeeds but DB write fails -> cleanup object; DB write succeeds but upload fails -> use an operation state/retry strategy; token expiry -> frontend clears token and returns to login; network failure -> retry with user feedback; duplicate requests -> unique constraints/idempotent operations; timeouts -> bounded DB/API timeouts; logs must not contain passwords/tokens.

## Student-friendly deployment
Frontend can be deployed on a free-eligible static host such as Vercel/Netlify; FastAPI on a free-eligible backend host; PostgreSQL and Storage on Supabase. Free limits change, so verify current provider terms before deployment. Set `VITE_API_URL` to the deployed API URL and configure backend secrets in the host's environment settings.

## Enterprise mapping
AWS: S3/CloudFront, Cognito, API Gateway, Lambda/App Runner, RDS/DynamoDB, S3, ElastiCache, CloudWatch. Azure: Static Web Apps, identity services, Container Apps/Functions, PostgreSQL, Blob Storage, Front Door, Monitor. GCP: Cloud Storage, Cloud Run, Cloud SQL, Identity Platform, Cloud CDN, Cloud Monitoring.

## GitHub hygiene
Never commit `.env`, service keys, passwords, `.venv`, `node_modules`, caches or logs. Suggested commits: architecture, auth, tracking, community, storage, analytics, tests, documentation.
