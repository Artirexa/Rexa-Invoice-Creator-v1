# 🔐 Environment Setup Guide

## **Step 1: Create Environment File**

Since `.env` files are protected by your IDE, you'll need to create them manually:

### **For Development:**

Create a file named `.env.local` in the root directory of your project with the following content:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://rvxmjqeqfurufbnsluft.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2eG1qcWVxZnVydWZibnNsdWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2ODM5NTIsImV4cCI6MjA3NjI1OTk1Mn0.SNtoJwNryKnWPjwBKr5TJkkqR6ztLmntzy4k5sNks4k

# Application Configuration
VITE_APP_URL=http://localhost:5173
VITE_REDIRECT_URL=http://localhost:5173/auth/callback
```

### **For Team Members (Template):**

Create a file named `.env.example` in the root directory:

```env
# Supabase Configuration
# Get these values from your Supabase Dashboard → Settings → API
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Application Configuration
VITE_APP_URL=http://localhost:5173
VITE_REDIRECT_URL=http://localhost:5173/auth/callback

# Production Configuration (Update these for deployment)
# VITE_APP_URL=https://your-domain.com
# VITE_REDIRECT_URL=https://your-domain.com/auth/callback
```

---

## **Step 2: Verify .gitignore**

Your `.gitignore` already includes `*.local` (line 13), which means `.env.local` won't be committed to git. ✅

If you want to add more protection, you can manually add these lines to `.gitignore`:

```
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

---

## **Step 3: Update Vite Configuration (Optional)**

Your current Vite config is good, but you can add environment variable validation:

```typescript
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
```

---

## **Step 4: Google OAuth Setup**

### **A. Create Google OAuth Credentials**

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select existing one:
   - Click "Select a project" → "New Project"
   - Name: "Artirexa Invoice Creator"
   - Click "Create"

3. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth 2.0 credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - If prompted, configure OAuth consent screen:
     - User Type: External
     - App name: "Artirexa Invoice Creator"
     - User support email: Your email
     - Developer contact: Your email
     - Click "Save and Continue"
   - Application type: **"Web application"**
   - Name: "Artirexa Invoice Creator"
   - **Authorized JavaScript origins**:
     ```
     http://localhost:5173
     http://localhost:8080
     https://rvxmjqeqfurufbnsluft.supabase.co
     ```
   - **Authorized redirect URIs**:
     ```
     https://rvxmjqeqfurufbnsluft.supabase.co/auth/v1/callback
     http://localhost:5173/auth/callback
     http://localhost:8080/auth/callback
     ```
   - Click "Create"
   - **Copy the Client ID and Client Secret** (you'll need these next)

### **B. Configure Google OAuth in Supabase**

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard/project/rvxmjqeqfurufbnsluft
2. **Navigate to**: Authentication → Providers
3. **Find "Google" provider** and enable it
4. **Paste your credentials**:
   - **Client ID**: [Your Google Client ID]
   - **Client Secret**: [Your Google Client Secret]
5. **Click "Save"**

### **C. Configure Site URL and Redirect URLs**

1. **Go to**: Authentication → URL Configuration
2. **Set Site URL**:
   - Development: `http://localhost:5173`
   - Production: `https://your-domain.com`
3. **Add Redirect URLs** (one per line):
   ```
   http://localhost:5173/**
   http://localhost:8080/**
   http://localhost:5173/auth/callback
   http://localhost:8080/auth/callback
   http://localhost:5173/dashboard
   http://localhost:5173/login
   https://your-domain.com/**
   ```
4. **Click "Save"**

---

## **Step 5: Fix Email Confirmation Issue**

### **Option A: Disable Email Confirmation (Recommended for Development)**

1. **Go to Supabase Dashboard** → Authentication → Settings
2. **Find "Email Confirmation" section**
3. **Disable "Enable email confirmations"** (toggle OFF)
4. **Save changes**

### **Option B: Auto-Confirm Users (Keep Email Confirmation Enabled)**

Run this SQL in your Supabase SQL Editor:

```sql
-- Auto-confirm all existing users
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- Create a function to auto-confirm new users
CREATE OR REPLACE FUNCTION auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email_confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-confirm new users
DROP TRIGGER IF EXISTS auto_confirm_user_trigger ON auth.users;
CREATE TRIGGER auto_confirm_user_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_user();
```

---

## **Step 6: Test Your Configuration**

### **Restart Development Server:**

```bash
# Stop the current server (Ctrl+C)
# Start it again
npm run dev
```

### **Test Authentication:**

1. ✅ **Register new account** → Should work without email confirmation
2. ✅ **Login with email/password** → Should work immediately
3. ✅ **Google OAuth login** → Should redirect to Google and back
4. ✅ **Logout** → Should clear session properly
5. ✅ **Refresh page** → Should maintain login state

---

## **Step 7: Environment Variables Reference**

### **Available Environment Variables:**

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | `eyJhbGci...` |
| `VITE_APP_URL` | Your application URL | `http://localhost:5173` |
| `VITE_REDIRECT_URL` | OAuth redirect URL | `http://localhost:5173/auth/callback` |

### **How to Use in Code:**

```typescript
// Access environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const appUrl = import.meta.env.VITE_APP_URL;

// With fallback
const url = import.meta.env.VITE_APP_URL || 'http://localhost:5173';
```

---

## **Step 8: Production Deployment**

### **For Vercel/Netlify/Other Hosts:**

1. **Add environment variables** in your hosting platform's dashboard
2. **Update values** for production:
   ```env
   VITE_SUPABASE_URL=https://rvxmjqeqfurufbnsluft.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_APP_URL=https://your-domain.com
   VITE_REDIRECT_URL=https://your-domain.com/auth/callback
   ```

3. **Update Supabase Site URL** to your production domain
4. **Add production redirect URLs** to Supabase
5. **Update Google OAuth** with production URLs

---

## **Common Issues & Solutions**

### **"Cannot find module" or environment variables not working:**
- ✅ Restart your development server
- ✅ Check file is named `.env.local` (not `.env.local.txt`)
- ✅ Check variables start with `VITE_` prefix
- ✅ No spaces around `=` sign

### **"Google OAuth error":**
- ✅ Check Client ID and Secret are correct
- ✅ Verify redirect URLs match exactly
- ✅ Ensure Google+ API is enabled
- ✅ Check Site URL is configured in Supabase

### **"Email not confirmed" error:**
- ✅ Disable email confirmation in Supabase dashboard
- ✅ Or run the auto-confirm SQL script

### **"Invalid redirect URL":**
- ✅ Add all necessary URLs to Supabase redirect allowlist
- ✅ URLs must match exactly (including http/https)

---

## **Security Best Practices**

1. ✅ **Never commit** `.env.local` to git
2. ✅ **Use environment variables** for all sensitive data
3. ✅ **Different keys** for development and production
4. ✅ **Rotate keys** regularly
5. ✅ **Use anon key only** (never commit service_role key)
6. ✅ **Enable RLS** on all database tables

---

## **Quick Start Checklist**

- [ ] Create `.env.local` file with Supabase credentials
- [ ] Create `.env.example` template file
- [ ] Verify `.gitignore` includes `*.local`
- [ ] Create Google OAuth credentials
- [ ] Configure Google OAuth in Supabase
- [ ] Disable email confirmation (or auto-confirm)
- [ ] Configure Site URL and Redirect URLs
- [ ] Restart development server
- [ ] Test authentication (email and Google)
- [ ] Commit `.env.example` to git (NOT `.env.local`)

---

**You're all set! 🎉**

Your Supabase configuration is now properly set up with environment variables and ready for both development and production use.

