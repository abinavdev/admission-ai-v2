# AdmissionAI Production Deployment Guide

This document provides step-by-step instructions for deploying the AdmissionAI platform to production. The frontend is hosted on **Vercel**, the backend API on **Render**, and the database on **Supabase**.

---

## 1. Database Setup (Supabase)

Before deploying the backend or frontend, configure the Supabase PostgreSQL database.

### Step 1: Create a Supabase Project
1. Log in to the [Supabase Dashboard](https://supabase.com).
2. Click **New Project** and select your organization.
3. Enter a Project Name (e.g., `AdmissionAI Production`), set a secure Database Password, and select your preferred region.
4. Wait for the database instance to provision.

### Step 2: Retrieve Database Connections
1. Go to **Project Settings** > **Database** in the Supabase Sidebar.
2. Under **Connection string**, choose **URI**:
   - **Transaction Connection Pooler (Port 6543)**: Copy this URI. Add `&pgbouncer=true&connection_limit=10` at the end. This will be your `DATABASE_URL`.
   - **Direct Connection (Port 5432)**: Copy this URI. This will be your `DIRECT_URL`.

---

## 2. Backend Deployment (Render)

Deploy the Node.js/Express backend service to Render as a **Web Service**.

### Step 1: Create a New Web Service
1. Log in to the [Render Dashboard](https://render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository containing the project.
4. Configure the Web Service settings:
   - **Name**: `admission-ai-backend` (or similar)
   - **Region**: Select the region closest to your database (e.g., Singapore/US/Frankfurt).
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`

### Step 2: Run Database Migrations on Render
To run Prisma migrations in production, configure Render to execute them automatically before deployment:
- Go to the **Settings** tab of your Render Web Service.
- Find the **Pre-deploy Command** setting.
- Set it to:
  ```bash
  npx prisma migrate deploy
  ```
This ensures that schema migrations are safely applied to Supabase before a new version of the API boots up.

### Step 3: Configure Environment Variables
In the **Environment** tab of the Render Web Service, add the following variables:

| Environment Variable | Recommended Value / Description |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `3001` (Render will inject this automatically, but setting it explicitly is safe) |
| `DATABASE_URL` | *Your Transaction connection pooler URI from Supabase* |
| `DIRECT_URL` | *Your Direct database connection URI from Supabase* |
| `JWT_SECRET` | *A long, secure, randomly generated string* |
| `JWT_EXPIRES_IN` | `7d` |
| `GEMINI_API_KEY` | *Your Google Gemini API Key* |
| `GEMINI_MODEL` | `gemini-2.5-flash` |
| `FRONTEND_URL` | *Your Vercel deployment URL (e.g., `https://admission-ai.vercel.app` - setup this after deploying frontend)* |

---

## 3. Frontend Deployment (Vercel)

Deploy the React/Vite/TS frontend application to Vercel.

### Step 1: Connect Project to Vercel
1. Log in to the [Vercel Dashboard](https://vercel.com).
2. Click **Add New** > **Project**.
3. Import your GitHub repository.
4. Configure the project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (Root directory of the repository)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 2: Add Environment Variables
Under **Environment Variables**, configure:

| Key | Value |
| :--- | :--- |
| `VITE_API_URL` | *Your Render Backend Web Service URL (e.g., `https://admission-ai-backend.onrender.com`)* |

### Step 3: Deploy
1. Click **Deploy**.
2. Once the build completes, copy the generated Vercel deployment URL (e.g., `https://your-project.vercel.app`).

### Step 4: Link CORS Origin
1. Return to the **Render Dashboard** for your backend web service.
2. Go to the **Environment** tab.
3. Update the `FRONTEND_URL` variable with your new Vercel URL.
4. Save the changes. Render will automatically redeploy the backend with the new CORS permissions.

---

## 4. Post-Deployment Verification Checklist

Perform these checks to verify the production system is healthy and fully operational:

1. **Verify CORS Connection**:
   - Access your Vercel frontend.
   - Open browser developer tools (F12) and go to the Network tab.
   - Attempt to register or log in. Ensure requests to the backend (`VITE_API_URL/api/auth/...`) succeed with HTTP `200` or `201` status codes instead of failing with CORS errors.

2. **Verify Backend Health**:
   - Navigate to `https://<your-render-url>/api/health` in your browser.
   - Verify that it returns exactly:
     ```json
     {
       "status": "ok"
     }
     ```

3. **Verify Gemini AI Responses**:
   - Navigate to the Student Portal.
   - Send a message to the AI Assistant (e.g., *"What courses are available?"*).
   - Ensure the AI responds with detailed answers extracted from the database documents, confirming the `@google/genai` integration and database connection are working.

4. **Verify Document Uploads**:
   - Log in to the Admin Dashboard.
   - Navigate to the Knowledge Base page.
   - Upload a small text (`.txt`) or PDF (`.pdf`) document.
   - Check if the document status updates to `PROCESSED`. This verifies that:
     - File storage folder uploads are running.
     - PDF parse parsing logic compiles and functions correctly.
     - Prisma client is generating document chunks in the database.
