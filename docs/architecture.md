# Architecture and cloud concepts

**SaaS:** Supabase provides managed database/object-storage services consumed by the application.

**PaaS:** a managed host can run the FastAPI service without managing servers.

**IaaS:** an advanced deployment may run the container on an AWS/Azure/GCP VM/container service.

**Cloud database:** Supabase PostgreSQL stores users, skills, goals, milestones, practice, posts, comments, likes and follows.

**Object storage:** Supabase Storage stores profile images, achievement certificates, screenshots and community attachments. PostgreSQL stores metadata and object paths.

**Authentication/authorization:** signed JWT identifies the user; ownership checks protect resources.

**REST/client-server:** React is the client; FastAPI exposes stateless HTTP APIs.

**Serverless/event-driven:** advanced extensions can move notifications, media processing and analytics jobs to functions/workers triggered by events.

**Scalability/elasticity:** stateless API replicas can scale horizontally; object storage and managed DB handle larger datasets; queues and cache can be introduced later.

**CDN/load balancing/API gateway:** production edge services can serve static React assets/media and route API traffic to multiple backend instances.

**Caching:** Redis/CDN can cache public/trending feed data and expensive analytics.

**Secrets/logging/monitoring/backup/CI-CD:** environment variables, host secret stores, structured logs, provider metrics, database backups and GitHub Actions are the operational foundation.
