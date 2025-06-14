
## Quickstart

1. **Set environment variables:**
   ```bash
   cp .env.example .env
   ```

2. **Build and start all services:**
   ```bash
   make up
   ```

3. **Run DB migrations:**
   ```bash
   make migrate
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8080
   - Postgres: localhost:5432
   - Redis: localhost:6379


### Running Tests

1. **Set test environment variables:**

   ```bash
   cp .env.test.example .env.test
   ```

2. **Start test services:**
    ```bash
    make test-up
    ```

3.  **Run tests:**
    ```bash
    make test
    ```

4. **Stop test services:**
    ```bash
    make test-down
    ```

## Setup without Docker

### 1. Install Root Dependencies

```bash
bun install
```

### 2. Install `frontend` and `backend` Dependencies

Run the setup script from the root to install dependencies for each service:

```bash
bun run setup
```

### 3. Create environment files

Create `.env` files for backend and frontend, using .env.example as a starting point:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit the `.env` files to set the configuruation to work with your local env.

### 4. Run development servers

Start backend and frontend development servers concurrently:

```bash
bun run dev
```

### 5. Build production bundles

Build backend and frontend prod bundles concurrently:

```bash
bun run build
```

### 6. Start production servers locally

Run both backend and frontend production servers concurrently:

```bash
bun run start
```

## Deployment to Google Cloud Run

GitHub Actions workflows are used to automate testing, building, and deploying each app to Google Cloud Run.


The backend will always be deployed before the frontend. If the backend deployment fails, the frontend will not be deployed.

### GitHub Action Config

Set the following secrets in your GitHub repo env settings:

- `GCP_SERVICE_ACCOUNT`: JSON credentials for your Google Cloud service account
- `GCP_PROJECT_ID`: Your Google Cloud project ID
- `GCP_REGION`: The region where your Cloud Run services will be deployed
