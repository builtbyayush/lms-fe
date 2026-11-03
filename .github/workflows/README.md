# GitHub Actions — lms-fe

## Frontend Docker Build and Deploy

File: **`frontend-docker.yml`**

1. Builds **`iamcyberster/lms-fe:latest`** (amd64, GHA layer cache).
2. Pushes to **Docker Hub** (`NEXT_PUBLIC_API_BASE_URL` from repo **variable**, default `/api`).
3. SSHs to **EC2**, stops the old container, **`docker image prune -af`** (unused layers), **`docker pull`**, recreates **`lms-fe`**, prunes again on **host port 3001**.

### Secrets

- **Hub:** `DOCKERHUB_USERNAME` (`iamcyberster`), `DOCKERHUB_TOKEN` (or legacy `DOCKER_USERNAME` / `DOCKER_PASSWORD`)
- **EC2:** `EC2_SSH_HOST`, `EC2_SSH_USER`, `EC2_SSH_PRIVATE_KEY`

### Variables

- **`NEXT_PUBLIC_API_BASE_URL`** — e.g. `/api` when nginx proxies `https://lms.ziloty.in/api/` to the backend.

EC2 must already run Docker and nginx routing `/` → `127.0.0.1:3001`.
