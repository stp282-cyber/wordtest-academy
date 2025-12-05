# Vercel Deployment Guide

## ✅ Completed Migration

All database models have been successfully migrated from Oracle to Supabase API:
- ✅ User.js
- ✅ Academy.js
- ✅ Wordbook.js
- ✅ Word.js
- ✅ Class.js
- ✅ TestResult.js
- ✅ CurriculumTemplate.js
- ✅ academyController.js
- ✅ All routes re-enabled in server.js
- ✅ File upload configured for /tmp directory

## Backend Deployment to Vercel

### Prerequisites
Make sure your `.env` file contains:
```
SUPABASE_URL=https://tynnlfijydacaxpislut.supabase.co
SUPABASE_KEY=your-supabase-anon-key
JWT_SECRET=your-jwt-secret
PORT=5000
```

### Deploy Backend

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Navigate to backend directory**:
   ```bash
   cd c:\Users\최경진2\Desktop\wordtest-academy\backend
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N** (first time) or **Y** (if updating)
   - Project name? `wordtest-academy-backend`
   - Directory? `./`
   - Override settings? **N**

4. **Set Environment Variables in Vercel**:
   ```bash
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_KEY
   vercel env add JWT_SECRET
   ```
   
   Or set them in Vercel Dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add:
     - `SUPABASE_URL`: https://tynnlfijydacaxpislut.supabase.co
     - `SUPABASE_KEY`: (your Supabase anon key)
     - `JWT_SECRET`: (your JWT secret)

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

6. **Note your backend URL** (e.g., `https://wordtest-academy-backend.vercel.app`)

## Frontend Deployment to Vercel

### Update Frontend Environment

1. **Create `.env` file in frontend directory**:
   ```bash
   cd c:\Users\최경진2\Desktop\wordtest-academy\frontend
   ```

2. **Create `.env` file with your backend URL**:
   ```
   VITE_API_URL=https://wordtest-academy-backend.vercel.app
   ```

### Deploy Frontend

1. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N** (first time)
   - Project name? `wordtest-academy-frontend`
   - Directory? `./`
   - Override settings? **N**

2. **Set Environment Variable**:
   ```bash
   vercel env add VITE_API_URL
   ```
   Enter your backend URL when prompted.

3. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

## Testing Deployment

### Test Backend
```bash
curl https://your-backend-url.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-05T...",
  "database": "connected"
}
```

### Test Frontend
1. Open your frontend URL in browser
2. Try logging in with test credentials
3. Check browser console for any errors

## Troubleshooting

### Backend Issues

**Error: "Cannot find module"**
- Make sure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error: "Database connection failed"**
- Check environment variables in Vercel dashboard
- Verify SUPABASE_URL and SUPABASE_KEY are correct

**Error: "Function timeout"**
- Check Vercel function logs
- Optimize slow database queries

### Frontend Issues

**Error: "Network Error" or "CORS"**
- Verify backend URL in frontend `.env`
- Check CORS settings in backend `server.js`
- Ensure backend is deployed and running

**Error: "404 on refresh"**
- `vercel.json` should have rewrites configured (already done)

## Post-Deployment

1. **Update CORS in backend** if needed:
   - Edit `src/server.js`
   - Add your frontend URL to CORS origins
   - Redeploy backend

2. **Monitor logs**:
   ```bash
   vercel logs
   ```

3. **Set up custom domain** (optional):
   - Go to Vercel dashboard
   - Project settings → Domains
   - Add your custom domain

## Local Development

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

Make sure to use `VITE_API_URL=http://localhost:5000` in frontend `.env.local` for local development.
