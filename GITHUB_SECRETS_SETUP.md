# 🔑 GITHUB SECRETS SETUP - Fix Supabase Environment Variables

## 🚨 **THE PROBLEM:**
Your local `.env` file has the correct values, but GitHub Secrets aren't configured, so the production build has no access to Supabase variables.

## 🛠️ **STEP-BY-STEP FIX:**

### **1. Go to Your GitHub Repository**
- Navigate to: `https://github.com/MannyE/charlitexmobile`
- Click on **"Settings"** (top right of repository)

### **2. Navigate to Secrets**
- In the left sidebar, click: **"Secrets and variables"**
- Then click: **"Actions"**

### **3. Create Production Environment** (if not exists)
- Click the **"Environments"** tab
- If you see "production" environment, click on it
- If not, click **"New environment"**, name it `production`, click **"Configure environment"**

### **4. Add These Secrets to Production Environment:**

Click **"Add secret"** for each of these:

#### **Secret 1:**
- **Name**: `VITE_SUPABASE_URL`
- **Value**: `https://oxtucysongvsnglrtpoy.supabase.co`

#### **Secret 2:**
- **Name**: `VITE_SUPABASE_ANON_KEY`  
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94dHVjeXNvbmd2c25nbHJ0cG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MzczMTksImV4cCI6MjA3MjMxMzMxOX0.U0-daEOvApQL4pOAbYu1CPzRBDc1BfRgTR_7k1bKWSw`

#### **Secret 3:**
- **Name**: `VITE_APP_URL`
- **Value**: `https://charlitexmobile.com/`

#### **Secret 4:**
- **Name**: `FTP_SERVER`
- **Value**: `ftp.charlitexmobile.com`

#### **Secret 5:**
- **Name**: `FTP_USERNAME`  
- **Value**: `dev`

#### **Secret 6:**
- **Name**: `FTP_PASSWORD`
- **Value**: `[your-ftp-password]`

## ⚠️ **CRITICAL NOTES:**

1. **Environment Location**: Make sure secrets are in the **"production"** environment (not repository secrets)
2. **Exact Names**: Secret names must match exactly (case-sensitive)
3. **No Extra Spaces**: Copy values without leading/trailing spaces
4. **No Quotes**: Don't wrap values in quotes in GitHub Secrets

## 🚀 **AFTER ADDING SECRETS:**

1. **Trigger New Deployment:**
   ```bash
   # Make a small change to trigger deployment
   git commit --allow-empty -m "trigger deployment with secrets"
   git push origin main
   ```

2. **Wait 3-5 minutes** for deployment

3. **Test Website:**
   - Visit: `https://charlitexmobile.com/`
   - Hard refresh: Ctrl+Shift+R
   - No more Supabase errors!

## 🔍 **VERIFY SECRETS ARE WORKING:**

After deployment, in GitHub Actions logs, look for:
```
🌍 Using environment variables for build...
✅ Production build completed successfully
```

## 📋 **CHECKLIST:**
- [ ] Navigate to GitHub repository settings
- [ ] Go to Secrets and variables → Actions → Environments → production  
- [ ] Add all 6 secrets with exact names and values
- [ ] Push empty commit to trigger deployment
- [ ] Test website after deployment

## 🆘 **IF STILL NOT WORKING:**

Share a screenshot of your GitHub repository's **Settings → Secrets and variables → Actions → Environments → production** page so I can verify the configuration.
