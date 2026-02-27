# 🚀 OptiDoc - Free 24x7 Deployment Guide

This guide will help you deploy OptiDoc for free using:
- **MongoDB Atlas** (Database) - Free 512MB
- **Render** (Backend) - Free tier
- **Vercel** (Frontend) - Free tier

---

## 📋 Prerequisites
- GitHub account
- MongoDB Atlas account
- Render account
- Vercel account

---

## Step 1️⃣: Setup MongoDB Atlas (Database)

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up for free

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose "FREE" (M0 Sandbox)
   - Select your preferred region (choose closest to your users)
   - Click "Create Cluster"

3. **Create Database User** ✅ (Already done - `omkapadiya34_db_user`)
   - If you need to reset password:
     - Go to "Database Access" in left sidebar
     - Find user `omkapadiya34_db_user`
     - Click "Edit" → "Edit Password"
     - Click "Autogenerate Secure Password" and COPY it
     - Click "Update User"

4. **Whitelist IP Address**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for deployment)
   - Click "Confirm"

5. **Get Connection String** ✅ (Your connection string)
   - Your MongoDB URI format:
     ```
     mongodb+srv://omkapadiya34_db_user:<db_password>@cluster0.e5qh4ci.mongodb.net/OptiDoc?retryWrites=true&w=majority
     ```
   - Replace `<db_password>` with your actual database password
   - **Note**: If password has special characters (@, #, %, etc.), URL-encode them:
     - `@` → `%40`
     - `#` → `%23`
     - `%` → `%25`

---

## Step 2️⃣: Push Code to GitHub

1. **Initialize Git** (if not already done)
   ```bash
   cd /home/om/OptiDoc
   git init
   git add .
   git commit -m "Initial commit for deployment"
   ```

2. **Create GitHub Repository**
   - Go to https://github.com/new
   - Name: `optidoc` (or your choice)
   - Keep it Public or Private (both work)
   - Don't initialize with README
   - Click "Create repository"

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/optidoc.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 3️⃣: Deploy Backend on Render

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect to your GitHub repository
   - Select "optidoc" repository
   - Configure:
     - **Name**: `optidoc-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Region**: Choose closest to you
     - **Branch**: `main`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: Free

3. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable"
   
   Add these variables:
   ```
   NODE_ENV = production
   PORT = 5000
   MONGO_URI = mongodb+srv://omkapadiya34_db_user:YOUR_DB_PASSWORD@cluster0.e5qh4ci.mongodb.net/OptiDoc?retryWrites=true&w=majority
   EMAIL_USER = omkapadiya34@gmail.com
   EMAIL_PASS = your-gmail-app-password
   ```
   
   **Important for EMAIL_PASS**: Use Gmail App Password, not your regular password
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification
   - Go to App Passwords
   - Generate new app password for "Mail"
   - Copy the 16-character password

4. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - Copy your backend URL: `https://optidoc-backend.onrender.com`

---

## Step 4️⃣: Deploy Frontend on Vercel

1. **Create Vercel Account**
   - Go to https://vercel.com/signup
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

3. **Add Environment Variable**
   - Before deploying, add environment variable:
     ```
     VITE_API_URL = https://optidoc-backend.onrender.com/api
     ```
   - Replace with your actual Render backend URL

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live at: `https://optidoc-xyz.vercel.app`

---

## Step 5️⃣: Update Backend CORS (Important!)

After deployment, you need to update CORS to allow your frontend domain.

1. **Edit backend/server.js**
   
   Replace:
   ```javascript
   app.use(cors());
   ```
   
   With:
   ```javascript
   app.use(cors({
     origin: [
       'http://localhost:5173',  // Local development
       'https://optidoc-xyz.vercel.app'  // Your Vercel URL
     ],
     credentials: true
   }));
   ```

2. **Commit and Push**
   ```bash
   git add .
   git commit -m "Update CORS for production"
   git push
   ```

3. Render will automatically redeploy (takes 2-3 minutes)

---

## Step 6️⃣: Restore Database (Optional)

If you want to restore your existing data:

1. **Install MongoDB Database Tools**
   ```bash
   # On Ubuntu/Debian
   sudo apt-get install mongodb-database-tools
   
   # On macOS
   brew install mongodb-database-tools
   ```

2. **Restore from backup**
   ```bash
   cd /home/om/OptiDoc/db-backup
   mongorestore --uri="mongodb+srv://omkapadiya34_db_user:YOUR_DB_PASSWORD@cluster0.e5qh4ci.mongodb.net" --db=OptiDoc OptiDoc/
   ```

---

## 🎉 Your App is Live!

- **Frontend**: `https://optidoc-xyz.vercel.app`
- **Backend**: `https://optidoc-backend.onrender.com`

---

## ⚠️ Important Notes

### Render Free Tier Limitations:
- Service spins down after 15 minutes of inactivity
- First request after inactivity takes ~30-60 seconds (cold start)
- 750 hours/month free (enough for 24x7 for one service)

### MongoDB Atlas Free Tier:
- 512MB storage
- Shared CPU
- Perfect for small to medium projects

### Vercel Free Tier:
- unlimited deployments
- 100GB bandwidth/month
- Always fast (no cold starts)

---

## 🔧 Troubleshooting

### Backend not starting:
- Check Render logs for errors
- Verify all environment variables are set correctly
- Check MongoDB connection string

### Frontend can't connect to backend:
- Verify `VITE_API_URL` is set in Vercel
- Check CORS settings in backend
- Ensure backend is running (check Render dashboard)

### Email not working:
- Verify Gmail App Password (not regular password)
- Check if 2-Step Verification is enabled on Google account
- Test with a simple API call

---

## 📱 Keeping Backend Active

Since Render free tier spins down after inactivity, you can use a free uptime monitoring service:

1. **UptimeRobot** (https://uptimerobot.com)
   - Free account: 50 monitors
   - Add your backend URL: `https://optidoc-backend.onrender.com/api/auth/test`
   - Check interval: every 5 minutes
   - This keeps your backend warm!

---

## 🔄 Continuous Deployment

Both Vercel and Render are now connected to your GitHub repository:
- Any push to `main` branch automatically triggers a new deployment
- Frontend deploys in ~2 minutes
- Backend deploys in ~5 minutes

---

## 🆘 Need Help?

If you encounter any issues:
1. Check the deployment logs on Render/Vercel
2. Verify all environment variables
3. Check MongoDB connection
4. Ensure GitHub repository is updated

---

## 📝 Quick Commands Reference

```bash
# Local development
cd /home/om/OptiDoc/backend
npm run dev

cd /home/om/OptiDoc/frontend
npm run dev

# Deploy changes
git add .
git commit -m "Your commit message"
git push

# Check if everything works
curl https://optidoc-backend.onrender.com/api/auth/test
```

---

Good luck with your deployment! 🎉
