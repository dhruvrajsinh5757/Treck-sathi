# Connecting frontend (Vercel) and backend (Render)

## Backend (Render)

1. The backend **already allows** `https://treck-sathi-jipx.vercel.app` for CORS by default, so login/API from Vercel should work without extra env vars.
2. Optional: In your Render service **Environment** tab you can set **CLIENT_URL** = `https://treck-sathi-jipx.vercel.app` (or comma-separated URLs) to override allowed origins.
3. Keep **MONGODB_URI** and any other existing env vars.
4. **Redeploy** the backend on Render after pulling this fix so the new CORS defaults take effect.

## Frontend (Vercel)

1. In Vercel: **Project → Settings → Environment Variables**
2. Add:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://treck-sathi.onrender.com`  
     (no trailing slash; your Render backend URL)

3. Redeploy the frontend (e.g. push to Git or “Redeploy” in Vercel) so the new variable is applied.

After both are set and redeployed, the Vercel app will call the Render API and load images from Render.
