# Deployment Guide

## Frontend Deployment (Vercel - Recommended for Next.js)

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New Project"
3. Import your Git repository (GitHub, GitLab, or Bitbucket)
4. Configure the project:
   - **Root Directory**: Set to `frontend`
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (runs automatically in frontend directory)
   - **Output Directory**: `.next` (default)
5. Add environment variables if needed
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI (if not already installed):
   ```bash
   npm install -g vercel
   # Or use npx without installation:
   npx vercel
   ```

2. Navigate to the project root:
   ```bash
   cd "/Users/antondelange/Desktop/ICT50220 Diploma of Information Technology/Projects/Splendid Wren"
   ```

3. Run Vercel deployment:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Login to Vercel (if not already logged in)
   - Link to existing project or create new
   - Confirm settings (should auto-detect Next.js in frontend folder)

5. For production deployment:
   ```bash
   vercel --prod
   ```

### Option 3: Deploy via Git Integration (Recommended for CI/CD)

1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Vercel
3. Vercel will automatically deploy on every push to main/master branch

## Backend Deployment

The backend Express.js server needs separate hosting. Recommended options:

### Option 1: Railway (Recommended)

1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add environment variables in Railway dashboard
6. Railway will provide a URL (e.g., `https://your-app.railway.app`)

### Option 2: Render

1. Go to [render.com](https://render.com) and sign up
2. Click "New" → "Web Service"
3. Connect your Git repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add environment variables
6. Deploy

### Option 3: Heroku

1. Install Heroku CLI: `brew install heroku/brew/heroku` (Mac) or download from heroku.com
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set buildpack: `heroku buildpacks:set heroku/nodejs`
5. Configure:
   ```bash
   cd backend
   heroku config:set NODE_ENV=production
   ```
6. Deploy: `git push heroku main`

## Environment Variables

### Frontend (.env.local in frontend directory)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### Backend (.env in backend directory)
```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

## Post-Deployment Checklist

- [ ] Test all pages load correctly
- [ ] Verify images and assets load
- [ ] Test contact form submission
- [ ] Check mobile responsiveness
- [ ] Verify API endpoints work
- [ ] Test audio/video playback (hero section)
- [ ] Check loading animation works
- [ ] Verify ripple effects on hero section
- [ ] Test navigation between pages
- [ ] Check SEO metadata
- [ ] Verify favicon loads

## Custom Domain Setup

### Vercel (Frontend)
1. Go to your project settings in Vercel dashboard
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### Backend
- Update CORS_ORIGIN to include your custom domain
- Update frontend NEXT_PUBLIC_API_URL if backend has custom domain

## Troubleshooting

### Build Errors
- Ensure all dependencies are in package.json
- Check Node.js version (should be 18+)
- Verify all environment variables are set

### API Connection Issues
- Verify CORS_ORIGIN includes frontend URL
- Check backend is running and accessible
- Verify environment variables are set correctly

### Image/Asset Loading Issues
- Ensure all images are in `frontend/public/Images/`
- Check file paths are correct (case-sensitive)
- Verify Next.js Image component is used correctly
