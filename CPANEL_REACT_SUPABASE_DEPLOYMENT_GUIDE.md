# 🚀 Complete Guide: React + Supabase + cPanel Deployment with CI/CD

**A comprehensive step-by-step guide for beginners to deploy a React application with Supabase backend to cPanel hosting with automated GitHub Actions deployment.**

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Supabase Configuration](#supabase-configuration)
4. [cPanel Hosting Setup](#cpanel-hosting-setup)
5. [GitHub Repository Setup](#github-repository-setup)
6. [CI/CD Pipeline Configuration](#cicd-pipeline-configuration)
7. [Environment Variables & Secrets](#environment-variables--secrets)
8. [Code Structure](#code-structure)
9. [Deployment Process](#deployment-process)
10. [Troubleshooting](#troubleshooting)
11. [Maintenance](#maintenance)

---

## Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js** (version 18 or higher) installed
- ✅ **Git** installed and configured
- ✅ **GitHub account** (free)
- ✅ **Supabase account** (free tier available)
- ✅ **cPanel hosting account** with FTP access
- ✅ **Basic knowledge** of terminal/command line
- ✅ **Text editor** (VS Code recommended)

---

## Project Setup

### Step 1: Create React Project with Vite

```bash
# Create a new React project using Vite (faster than Create React App)
npm create vite@latest your-project-name -- --template react

# Navigate to project directory
cd your-project-name

# Install dependencies
npm install

# Install additional packages we'll need
npm install @supabase/supabase-js
npm install @tailwindcss/vite
npm install libphonenumber-js

# Install development dependencies
npm install --save-dev eslint terser
```

### Step 2: Configure Package.json Scripts

Update your `package.json` with these scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:prod": "NODE_ENV=production vite build",
    "deploy": "npm run build:prod",
    "lint": "eslint .",
    "preview": "vite preview",
    "health-check": "node scripts/health-check.js"
  }
}
```

**Explanation:**
- `build:prod`: Creates optimized production build
- `deploy`: Alias for production build
- `lint`: Checks code quality (required for CI/CD)
- `health-check`: Tests if deployed site is working

### Step 3: Configure Vite for Production

Create/update `vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  // Base path for your domain (usually '/' for main domain)
  base: '/',
  
  build: {
    // Output directory (this gets uploaded to cPanel)
    outDir: 'dist',
    
    // Directory for static assets within dist
    assetsDir: 'assets',
    
    // Don't generate sourcemaps for production (smaller files)
    sourcemap: false,
    
    // Use terser for better minification
    minify: 'terser',
    
    // Optimize bundle splitting
    rollupOptions: {
      output: {
        // Split large dependencies into separate chunks
        manualChunks: {
          // React libraries in one chunk
          vendor: ['react', 'react-dom'],
          // Supabase in another chunk  
          supabase: ['@supabase/supabase-js'],
        },
        // File naming patterns (adds hash for cache busting)
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
    
    // Warn if chunks are larger than 1000kb
    chunkSizeWarningLimit: 1000,
    
    // Performance optimizations
    target: 'es2018', // Modern browsers support
    cssCodeSplit: true, // Split CSS into separate files
    reportCompressedSize: false, // Faster builds
  },
  
  // Development server configuration
  server: {
    port: 3000,
  },
});
```

---

## Supabase Configuration

### Step 1: Create Supabase Project

1. **Go to** [supabase.com](https://supabase.com)
2. **Sign up/Login** with GitHub account
3. **Click** "New Project"
4. **Choose** organization and project name
5. **Set** database password (save this!)
6. **Wait** for project to initialize (~2 minutes)

### Step 2: Get API Keys

1. **Navigate to** Settings → API
2. **Copy** these values (you'll need them later):
   - `Project URL` (example: `https://xxxxx.supabase.co`)
   - `anon public` key (starts with `eyJhbGciOi...`)

### Step 3: Create Database Schema

1. **Go to** SQL Editor in Supabase dashboard
2. **Run this SQL** to create your tables:

```sql
-- Enable UUID extension (usually already enabled)
create extension if not exists pgcrypto;

-- Create waitlist table (example schema)
create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  phone text not null,
  consent boolean not null default true,
  created_at timestamptz not null default now(),
  unique (phone),
  unique (user_id)
);

-- Enable Row Level Security (RLS)
alter table public.waitlist enable row level security;

-- Policy: Users can only insert their own records
create policy "insert-own-waitlist-row"
on public.waitlist
for insert
to authenticated
with check (auth.uid() = user_id);

-- Policy: Users can only see their own records
create policy "select-own-waitlist-row"
on public.waitlist
for select
to authenticated
using (auth.uid() = user_id);

-- IMPORTANT: Policy for duplicate checking (allows anonymous users to check if phone exists)
create policy "check-phone-exists"
on public.waitlist
for select
to anon
using (true);
```

**Explanation of RLS Policies:**
- `insert-own-waitlist-row`: Users can only add records with their own user_id
- `select-own-waitlist-row`: Users can only see their own records
- `check-phone-exists`: Anonymous users can check if phone numbers exist (needed for duplicate detection)

### Step 4: Configure Supabase Client

Create `src/config/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

// Get environment variables (these will be set in .env file)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configure authentication settings
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
```

---

## cPanel Hosting Setup

### Step 1: Get cPanel FTP Credentials

1. **Login** to your cPanel hosting account
2. **Navigate to** "FTP Accounts" or "File Manager"
3. **Note down** these details:
   - **FTP Server**: Usually your domain name or provided by host
   - **Username**: Your cPanel username or FTP username
   - **Password**: Your cPanel password or create new FTP user
   - **Port**: Usually `21` for FTP

### Step 2: Identify Upload Directory

- **Main domain**: Files go to `/public_html/`
- **Subdomain**: Files go to `/public_html/subdomain_name/`
- **Addon domain**: Files go to `/public_html/addon_domain_name/`

### Step 3: Test FTP Connection

You can test FTP connection using:
- **FileZilla** (GUI FTP client)
- **Command line**: `ftp your-domain.com`
- **cPanel File Manager**: Upload test file manually

---

## GitHub Repository Setup

### Step 1: Create Repository

```bash
# Initialize git in your project directory
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "🎉 Initial commit: React + Supabase project setup"

# Create repository on GitHub (through website or CLI)
# Then add remote origin
git remote add origin https://github.com/yourusername/your-repo-name.git

# Push to GitHub
git push -u origin main
```

### Step 2: Create Environment Variables Template

Create `.env.example` file:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Application Configuration  
VITE_APP_URL=https://yourdomain.com
```

Create `.env` file for local development:

```bash
# Copy .env.example to .env and fill in your actual values
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_URL=http://localhost:3000
```

**Important:** Add `.env` to `.gitignore` so secrets aren't committed:

```gitignore
# Environment variables
.env
.env.local
.env.production

# Build output
dist/
build/

# Dependencies
node_modules/

# Logs
*.log
```

---

## CI/CD Pipeline Configuration

### Step 1: Create GitHub Actions Workflow

Create `.github/workflows/cpanel-deploy.yml`:

```yaml
# GitHub Actions workflow for automated deployment to cPanel
name: 🚀 Deploy to cPanel

# Trigger conditions: when code is pushed to main branch or manually triggered
on:
  push:
    branches: [main, master]
  workflow_dispatch: # Allows manual triggering from GitHub UI
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        default: 'production'
        type: choice
        options:
          - production
          - staging
      skip_tests:
        description: 'Skip quality checks (use only for hotfixes)'
        required: false
        default: false
        type: boolean

# Environment variables used across all jobs
env:
  NODE_VERSION: '18' # Node.js version to use
  
# Define the jobs that make up this workflow
jobs:
  # ==================== QUALITY ASSURANCE ====================
  # This job runs code quality checks (linting, security audit)
  quality-check:
    name: 🔍 Quality Assurance
    runs-on: ubuntu-latest
    # Skip this job if user chose to skip tests
    if: always() && !inputs.skip_tests

    steps:
      # Download the repository code
      - name: 🚚 Checkout Repository
        uses: actions/checkout@v4

      # Set up Node.js environment
      - name: 🔧 Setup Node.js ${{ env.NODE_VERSION }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm' # Cache npm dependencies for faster builds

      # Install project dependencies
      - name: 📦 Install Dependencies
        run: |
          npm ci --prefer-offline --no-audit --production=false
          echo "✅ Dependencies installed successfully"

      # Run ESLint to check code quality
      - name: 🧹 Run ESLint
        run: |
          echo "🔍 Running ESLint code quality checks..."
          npm run lint
          echo "✅ ESLint checks passed"

      # Check for security vulnerabilities
      - name: 🛡️ Security Audit
        run: |
          echo "🔒 Running security vulnerability audit..."
          npm audit --audit-level high --production
          echo "✅ Security audit completed"

  # ==================== PRODUCTION BUILD ====================  
  # This job builds the React app for production
  build-production:
    name: 🏗️ Production Build
    runs-on: ubuntu-latest
    # Run after quality-check passes (or if tests are skipped)
    needs: [quality-check]
    if: always() && (needs.quality-check.result == 'success' || inputs.skip_tests)
    # IMPORTANT: This gives access to environment secrets
    environment: production

    # Output variables that other jobs can use
    outputs:
      deployment-ready: ${{ steps.build-check.outputs.ready }}
      build-size: ${{ steps.build-check.outputs.size }}

    steps:
      - name: 🚚 Checkout Repository
        uses: actions/checkout@v4

      - name: 🔧 Setup Node.js ${{ env.NODE_VERSION }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: 📦 Install Dependencies
        run: |
          npm ci --prefer-offline --no-audit --production=false
          echo "✅ Production dependencies installed"

      # Set up environment variables for the build
      - name: 🌍 Set Environment Variables
        run: |
          echo "Setting up production environment..."
          echo "VITE_SUPABASE_URL=${{ secrets.VITE_SUPABASE_URL }}" >> .env.production
          echo "VITE_SUPABASE_ANON_KEY=${{ secrets.VITE_SUPABASE_ANON_KEY }}" >> .env.production
          echo "VITE_APP_URL=${{ secrets.VITE_APP_URL }}" >> .env.production
          echo "✅ Environment variables configured"

      # Build the React application
      - name: 🏗️ Build for Production
        run: |
          echo "🚀 Building application for production..."
          npm run build:prod
          echo "✅ Production build completed successfully"
        # Pass environment variables to the build process
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_APP_URL: ${{ secrets.VITE_APP_URL }}

      # Verify the build was successful
      - name: 📊 Verify Build
        id: build-check
        run: |
          if [ -d "dist" ] && [ -f "dist/index.html" ]; then
            echo "✅ Build verification successful"
            echo "ready=true" >> $GITHUB_OUTPUT
            # Calculate build size for monitoring
            BUILD_SIZE=$(du -sh dist | cut -f1)
            echo "size=$BUILD_SIZE" >> $GITHUB_OUTPUT
            echo "📦 Build size: $BUILD_SIZE"
          else
            echo "❌ Build verification failed"
            echo "ready=false" >> $GITHUB_OUTPUT
            exit 1
          fi

      # Save build artifacts for deployment job
      - name: 💾 Upload Build Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: production-build
          path: dist/
          retention-days: 1 # Keep for 1 day only (saves storage)

  # ==================== CPANEL DEPLOYMENT ====================
  # This job uploads the built files to cPanel via FTP
  deploy-cpanel:
    name: 🌐 Deploy to cPanel
    runs-on: ubuntu-latest
    needs: [build-production]
    # Only run if build was successful
    if: always() && needs.build-production.outputs.deployment-ready == 'true'
    # Access to deployment secrets
    environment: ${{ inputs.environment || 'production' }}

    steps:
      - name: 🚚 Checkout Repository
        uses: actions/checkout@v4

      # Download the built files from previous job
      - name: 📥 Download Build Artifacts
        uses: actions/download-artifact@v4
        with:
          name: production-build
          path: ./dist

      # Verify we have the build files
      - name: 🔍 Verify Build Files
        run: |
          echo "🔍 Verifying downloaded build files..."
          if [ -f "dist/index.html" ]; then
            echo "✅ Build files verified successfully"
            ls -la dist/
          else
            echo "❌ Build files missing"
            exit 1
          fi

      # Check FTP connection before deployment
      - name: 🔍 Pre-deployment Checks
        run: |
          echo "🔍 Pre-deployment checks..."
          # Check if required secrets are set
          if [ -z "${{ secrets.FTP_SERVER }}" ]; then
            echo "❌ FTP_SERVER secret not configured"
            exit 1
          fi
          if [ -z "${{ secrets.FTP_USERNAME }}" ]; then
            echo "❌ FTP_USERNAME secret not configured"
            exit 1
          fi
          if [ -z "${{ secrets.FTP_PASSWORD }}" ]; then
            echo "❌ FTP_PASSWORD secret not configured"
            exit 1
          fi
          echo "✅ All FTP secrets are configured"

      # Deploy to cPanel via FTP
      - name: 🚀 Deploy to cPanel via FTP
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          # FTP connection details (from GitHub secrets)
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          
          # Local directory to upload (the built files)
          local-dir: ./dist/
          
          # Remote directory on cPanel (where files should go)
          server-dir: /public_html/
          
          # Connection settings
          protocol: ftp # Use FTP protocol (most cPanel hosts support this)
          port: 21 # Standard FTP port
          
          # Upload settings
          dry-run: false # Set to true to test without actually uploading
          
          # Clean up old files before uploading new ones
          dangerous-clean-slate: true
          
          # Exclude certain files from upload
          exclude: |
            **/.git*
            **/.git*/**
            **/node_modules/**
            **/.env*
            **/README.md

      # Verify deployment was successful
      - name: ✅ Post-deployment Verification
        run: |
          echo "🎉 Deployment completed successfully!"
          echo "📦 Build size: ${{ needs.build-production.outputs.build-size }}"
          echo "🌐 Your site should be live at: ${{ secrets.VITE_APP_URL }}"
          echo ""
          echo "🔍 Next steps:"
          echo "1. Visit your website to verify it's working"
          echo "2. Test the main functionality"
          echo "3. Check browser console for any errors"

      # Notify on failure
      - name: 📢 Deployment Failed
        if: failure()
        run: |
          echo "❌ FAILED: Deployment to cPanel failed!"
          echo "🔍 Check the logs above for detailed error information"
          echo "💡 Common fixes:"
          echo "   - Verify all GitHub secrets are configured correctly"
          echo "   - Check cPanel FTP access and permissions"
          echo "   - Ensure build completed successfully"
```

### Step 2: Create Health Check Script

Create `scripts/health-check.js`:

```javascript
/* eslint-disable no-console */
/**
 * Health check script to verify website is working after deployment
 * This can be run manually or as part of CI/CD pipeline
 */

const SITE_URL = 'https://yourdomain.com'; // Replace with your actual domain

/**
 * Test if the website is accessible and contains expected content
 */
async function runHealthCheck() {
  console.log('🏥 Starting website health check...');
  console.log(`🔗 Testing: ${SITE_URL}`);
  
  try {
    // Test 1: Check if site is accessible
    console.log('\n📡 Test 1: Website accessibility...');
    const response = await fetch(SITE_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log('✅ Website is accessible');
    
    // Test 2: Check if content loads correctly
    console.log('\n📄 Test 2: Content validation...');
    const html = await response.text();
    
    // Check for key elements that should be present
    const checks = [
      { name: 'HTML structure', test: html.includes('<html') },
      { name: 'React root element', test: html.includes('id="root"') },
      { name: 'Title tag', test: html.includes('<title>') },
      { name: 'Meta description', test: html.includes('name="description"') },
    ];
    
    let passed = 0;
    checks.forEach(check => {
      if (check.test) {
        console.log(`  ✅ ${check.name}`);
        passed++;
      } else {
        console.log(`  ❌ ${check.name}`);
      }
    });
    
    // Test 3: Performance check
    console.log('\n⚡ Test 3: Performance check...');
    const startTime = Date.now();
    await fetch(SITE_URL);
    const loadTime = Date.now() - startTime;
    
    console.log(`📊 Page load time: ${loadTime}ms`);
    
    if (loadTime < 2000) {
      console.log('✅ Good performance');
    } else if (loadTime < 5000) {
      console.log('⚠️ Moderate performance');
    } else {
      console.log('❌ Slow performance');
    }
    
    // Summary
    console.log('\n📊 Health Check Summary:');
    console.log(`✅ Tests passed: ${passed}/${checks.length}`);
    console.log(`⚡ Load time: ${loadTime}ms`);
    
    if (passed === checks.length && loadTime < 5000) {
      console.log('🎉 All health checks passed!');
      process.exit(0);
    } else {
      console.log('⚠️ Some checks failed. Please investigate.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    console.log('\n🔍 Troubleshooting tips:');
    console.log('1. Check if the domain DNS is properly configured');
    console.log('2. Verify files were uploaded correctly to cPanel');
    console.log('3. Check cPanel error logs');
    console.log('4. Ensure index.html exists in the public_html directory');
    process.exit(1);
  }
}

// Run the health check
runHealthCheck();
```

---

## Environment Variables & Secrets

### Step 1: Configure GitHub Secrets

1. **Go to** your GitHub repository
2. **Navigate to** Settings → Secrets and variables → Actions
3. **Click** "New repository secret"
4. **Add these secrets** one by one:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# FTP Configuration  
FTP_SERVER=yourdomain.com
FTP_USERNAME=your-cpanel-username
FTP_PASSWORD=your-cpanel-password

# Application Configuration
VITE_APP_URL=https://yourdomain.com
```

### Step 2: Create GitHub Environment

1. **Go to** Settings → Environments
2. **Click** "New environment"
3. **Name it** "production"
4. **Add the same secrets** to this environment
5. **Optionally** add protection rules (require reviews, etc.)

**Why environments?** They provide additional security and allow different configs for staging/production.

---

## Code Structure

### Essential Service Files

#### Authentication Service (`src/services/authService.js`)

```javascript
import { supabase } from '../config/supabase';
import { ERROR_MESSAGES } from '../constants/validation';

/**
 * Send OTP to phone number for authentication
 * @param {string} phoneNumber - International format phone number (e.g., +1234567890)
 * @returns {Promise<Object>} - { success: boolean, data?: any, error?: string }
 */
export const sendOTP = async (phoneNumber) => {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
    });

    if (error) {
      return {
        success: false,
        error: getOTPErrorMessage(error),
      };
    }

    return {
      success: true,
      data,
    };
  } catch {
    return {
      success: false,
      error: ERROR_MESSAGES.API.GENERIC_ERROR,
    };
  }
};

/**
 * Verify OTP code entered by user
 * @param {string} phoneNumber - Phone number that received OTP
 * @param {string} token - 6-digit OTP code
 * @returns {Promise<Object>} - { success: boolean, data?: any, error?: string }
 */
export const verifyOTP = async (phoneNumber, token) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token,
      type: 'sms',
    });

    if (error) {
      return {
        success: false,
        error: getOTPErrorMessage(error),
      };
    }

    return {
      success: true,
      data,
    };
  } catch {
    return {
      success: false,
      error: ERROR_MESSAGES.API.GENERIC_ERROR,
    };
  }
};

/**
 * Get current authenticated user
 * @returns {Promise<Object>} - { success: boolean, user?: any, error?: string }
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      user,
    };
  } catch {
    return {
      success: false,
      error: 'Failed to get user information',
    };
  }
};

/**
 * Convert Supabase error to user-friendly message
 * @param {Object} error - Supabase error object
 * @returns {string} - User-friendly error message
 */
const getOTPErrorMessage = (error) => {
  const message = error.message?.toLowerCase() || '';
  const errorCode = error.errorCode || error.code || '';

  // Handle Twilio rate limiting errors specifically
  if (errorCode === 'sms_send_failed' || message.includes('sms_send_failed')) {
    if (message.includes('too ma') || message.includes('20429')) {
      return '⏰ Too many SMS requests to this number. Please wait 15-30 minutes and try again, or use a different phone number.';
    }
    return 'SMS delivery failed. Please verify your phone number and try again.';
  }

  // Handle rate limiting in general
  if (message.includes('rate') || message.includes('limit') || message.includes('many')) {
    return '⏰ Too many requests. Please wait 15-30 minutes before trying again.';
  }

  // Handle 422 errors (Unprocessable Content)
  if (message.includes('unprocessable') || errorCode === '422') {
    if (message.includes('phone')) {
      return 'Invalid phone number format. Please check your number and try again.';
    }
    return 'Phone number format not supported. Please verify your number is correct.';
  }

  if (message.includes('network') || message.includes('connection')) {
    return ERROR_MESSAGES.API.NETWORK_ERROR;
  }

  if (message.includes('invalid') && message.includes('phone')) {
    return 'Invalid phone number. Please check the format and try again.';
  }

  return ERROR_MESSAGES.API.GENERIC_ERROR;
};
```

#### Database Service (`src/services/databaseService.js`)

```javascript
import { supabase } from '../config/supabase';
import { ERROR_MESSAGES } from '../constants/validation';

/**
 * Check if a phone number already exists in the waitlist
 * @param {string} phoneNumber - Full international phone number
 * @returns {Promise<Object>} - { exists: boolean, error?: string }
 */
export const checkUserExists = async (phoneNumber) => {
  try {
    // Check exact phone number first
    const { data, error } = await supabase
      .from('waitlist')
      .select('phone')
      .eq('phone', phoneNumber)
      .single();

    // Try alternative formats if the first query fails
    if (error && error.code === 'PGRST116') {
      // PGRST116 = no rows found, try different phone number formats
      const alternatives = [
        phoneNumber.replace('+', ''), // Remove +: "14699961154"
        phoneNumber.replace('+1', ''), // Remove +1: "4699961154"
        phoneNumber, // Keep original: "+14699961154"
      ].filter((alt, index, arr) => arr.indexOf(alt) === index); // Remove duplicates

      // Try each alternative format
      for (const altPhone of alternatives) {
        const { data: altData } = await supabase
          .from('waitlist')
          .select('phone')
          .eq('phone', altPhone)
          .single();

        if (altData) {
          return { exists: true };
        }
      }
    }

    // Handle other errors (not "no rows found")
    if (error && error.code !== 'PGRST116') {
      return {
        exists: false,
        error: getDatabaseErrorMessage(error),
      };
    }

    return { exists: !!data };
  } catch {
    return {
      exists: false,
      error: ERROR_MESSAGES.DATABASE.NETWORK_ERROR,
    };
  }
};

/**
 * Add user to waitlist after OTP verification
 * @param {string} phoneNumber - Full international phone number
 * @param {string} userId - User ID from authentication
 * @returns {Promise<Object>} - { success: boolean, data?: any, error?: string }
 */
export const addUserToWaitlist = async (phoneNumber, userId) => {
  try {
    const { data, error } = await supabase
      .from('waitlist')
      .insert([
        {
          user_id: userId,
          phone: phoneNumber,
          consent: true,
        },
      ])
      .select();

    if (error) {
      return {
        success: false,
        error: getDatabaseErrorMessage(error),
      };
    }

    return {
      success: true,
      data: data[0],
    };
  } catch {
    return {
      success: false,
      error: ERROR_MESSAGES.DATABASE.UNKNOWN_ERROR,
    };
  }
};

/**
 * Maps database error to user-friendly message
 * @param {Object} error - Supabase error object
 * @returns {string} - User-friendly error message
 */
const getDatabaseErrorMessage = (error) => {
  const errorCode = error.code;
  const message = error.message?.toLowerCase() || '';

  // Handle common database errors
  switch (errorCode) {
    case '23505': // Unique violation
      if (message.includes('phone')) {
        return 'This phone number is already registered.';
      }
      return 'This record already exists.';
      
    case '23503': // Foreign key violation
      return 'Invalid user reference.';
      
    case '42501': // Insufficient privilege
      return 'Permission denied.';
      
    case 'PGRST116': // No rows found
      return 'Record not found.';
      
    default:
      return ERROR_MESSAGES.DATABASE.GENERIC_ERROR;
  }
};
```

#### Validation Constants (`src/constants/validation.js`)

```javascript
/**
 * Validation rules and error messages for the application
 */

// Phone number validation rules by country
export const COUNTRY_VALIDATION_RULES = {
  '+1': { // US/Canada
    minLength: 10,
    maxLength: 10,
    pattern: /^\d{10}$/,
    format: '(XXX) XXX-XXXX'
  }
};

// Centralized error messages for consistency
export const ERROR_MESSAGES = {
  PHONE: {
    REQUIRED: 'Phone number is required',
    INVALID_FORMAT: 'Please enter a valid phone number',
    INVALID_COUNTRY: 'Country code not supported',
    TOO_SHORT: 'Phone number is too short',
    TOO_LONG: 'Phone number is too long'
  },
  
  OTP: {
    REQUIRED: 'Verification code is required',
    INVALID_LENGTH: 'Verification code must be 6 digits',
    INVALID_FORMAT: 'Verification code must contain only numbers',
    EXPIRED: 'Verification code has expired',
    INVALID: 'Invalid verification code'
  },
  
  API: {
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    GENERIC_ERROR: 'Something went wrong. Please try again.',
    RATE_LIMITED: 'Too many requests. Please wait a moment and try again.'
  },
  
  DATABASE: {
    NETWORK_ERROR: 'Database connection error. Please try again.',
    GENERIC_ERROR: 'Database error. Please contact support.',
    UNKNOWN_ERROR: 'An unexpected error occurred. Please contact support.'
  }
};

// OTP configuration
export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 10,
  RESEND_COOLDOWN_SECONDS: 60
};
```

---

## Deployment Process

### Step 1: Initial Setup

```bash
# 1. Set up local environment
cp .env.example .env
# Edit .env with your actual Supabase credentials

# 2. Test locally
npm run dev
# Visit http://localhost:3000 to test

# 3. Test production build locally
npm run build:prod
npm run preview
# Visit http://localhost:4173 to test production build
```

### Step 2: Configure GitHub Secrets

1. **Add all required secrets** to GitHub (as shown in Environment Variables section)
2. **Create production environment** in GitHub repository settings

### Step 3: Deploy

```bash
# Commit and push changes
git add .
git commit -m "🚀 Ready for deployment"
git push origin main

# This will automatically trigger the GitHub Actions workflow
```

### Step 4: Monitor Deployment

1. **Go to** GitHub repository → Actions tab
2. **Watch** the workflow progress:
   - Quality Check (linting, security audit)
   - Production Build (React build with optimizations)
   - cPanel Deploy (FTP upload to hosting)

### Step 5: Verify Deployment

1. **Visit** your website URL
2. **Test** key functionality
3. **Check** browser console for errors
4. **Run** health check: `npm run health-check`

---

## Troubleshooting

### Common Issues and Solutions

#### 1. ESLint Errors Blocking Deployment

**Problem**: `eslint . Error: X problems (X errors, X warnings)`

**Solution**:
```bash
# Fix common ESLint issues
# Unused variables
const { data, error } = response; // ❌ 'data' unused
const { error } = response; // ✅ Only get what you need

# Unused error parameters  
} catch (err) { // ❌ 'err' unused
} catch { // ✅ Ignore error parameter

# Console statements (warnings)
console.log('debug info'); // ❌ Warning in production
// console.log('debug info'); // ✅ Comment out for production
```

#### 2. FTP Deployment Failures

**Problem**: `❌ FTP_SERVER secret not configured`

**Solution**:
1. **Check** GitHub Secrets are set correctly
2. **Verify** FTP credentials work (test with FileZilla)
3. **Ensure** cPanel FTP is enabled
4. **Try** different FTP server address formats:
   - `yourdomain.com`
   - `ftp.yourdomain.com`
   - IP address provided by host

#### 3. Supabase Connection Issues

**Problem**: `Missing Supabase environment variables`

**Solution**:
```bash
# 1. Check .env file (local development)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...

# 2. Check GitHub Secrets (production)
# Go to GitHub → Settings → Secrets and variables → Actions
# Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set

# 3. Check Supabase project status
# Go to Supabase dashboard, ensure project is running
```

#### 4. Build Failures

**Problem**: Build fails with module resolution errors

**Solution**:
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Update vite config if needed
npm install --save-dev @vitejs/plugin-react
```

#### 5. Row Level Security Issues

**Problem**: Database queries return empty results

**Solution**:
```sql
-- Add policy to allow duplicate checking
create policy "check-phone-exists"
on public.waitlist
for select
to anon
using (true);

-- Verify policies are active
select * from pg_policies where tablename = 'waitlist';
```

### Debugging Steps

1. **Check Logs**:
   - GitHub Actions logs (detailed error messages)
   - cPanel Error Logs (server-side issues)
   - Browser Console (client-side errors)

2. **Test Locally**:
   ```bash
   # Test development
   npm run dev
   
   # Test production build
   npm run build:prod
   npm run preview
   
   # Test linting
   npm run lint
   ```

3. **Verify Configurations**:
   - Environment variables set correctly
   - FTP credentials work
   - Supabase project active
   - Domain DNS pointing to correct server

---

## Maintenance

### Regular Tasks

#### 1. Monitor Deployments
- **Check** GitHub Actions for failed deployments
- **Review** error logs weekly
- **Update** dependencies monthly: `npm update`

#### 2. Security Updates
```bash
# Check for vulnerabilities
npm audit

# Fix automatically fixable issues
npm audit fix

# Manual review for high-severity issues
npm audit --audit-level high
```

#### 3. Performance Monitoring
```bash
# Run health check
npm run health-check

# Check build size
npm run build:prod
du -sh dist/
```

#### 4. Database Maintenance
- **Monitor** Supabase usage (API calls, storage)
- **Review** RLS policies periodically
- **Backup** important data
- **Clean** up old/unused records

### Scaling Considerations

#### When to Upgrade:
1. **Traffic Growth**: 
   - Consider CDN (Cloudflare)
   - Upgrade hosting plan
   - Optimize images/assets

2. **Feature Expansion**:
   - Add staging environment
   - Implement proper testing
   - Add monitoring/analytics

3. **Team Growth**:
   - Add code review requirements
   - Implement branch protection
   - Set up development environments

---

## Conclusion

This guide provides a complete setup for deploying React applications with Supabase backend to cPanel hosting using GitHub Actions CI/CD.

**Key Benefits**:
- ✅ **Automated deployments** on every push to main
- ✅ **Quality assurance** with linting and security audits  
- ✅ **Environment management** for different deployment stages
- ✅ **Error handling** and user-friendly messages
- ✅ **Security** with proper RLS policies and secret management

**Next Steps**:
1. Follow this guide step-by-step
2. Customize the code for your specific needs
3. Test thoroughly in development before production
4. Monitor and maintain your deployment pipeline

**Need Help?**
- Check the troubleshooting section for common issues
- Review GitHub Actions logs for detailed error information
- Test each component individually before full deployment

Happy deploying! 🚀
