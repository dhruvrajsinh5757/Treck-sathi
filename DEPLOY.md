# Connecting frontend (Vercel) and backend (Render)

## Backend (Render)

1. In your Render service **Environment** tab, add:
   - **CLIENT_URL** = `https://treck-sathi-jipx.vercel.app`  
     (your Vercel app URL so CORS allows the frontend)

2. Keep **MONGODB_URI** and any other existing env vars.

3. Redeploy the backend after changing env vars.

## Frontend (Vercel)

1. In Vercel: **Project → Settings → Environment Variables**
2. Add:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://treck-sathi.onrender.com`  
     (no trailing slash; your Render backend URL)

3. Redeploy the frontend (e.g. push to Git or “Redeploy” in Vercel) so the new variable is applied.

After both are set and redeployed, the Vercel app will call the Render API and load images from Render.
