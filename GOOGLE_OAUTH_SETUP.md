# 🔐 Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your Artirexa Invoice Generator.

---

## **Prerequisites**

- ✅ Supabase project already set up
- ✅ Google account
- ✅ 15-20 minutes

---

## **Step 1: Create Google Cloud Project**

### **1.1 Access Google Cloud Console**

Go to: https://console.cloud.google.com/

### **1.2 Create New Project**

1. Click "**Select a project**" at the top
2. Click "**New Project**"
3. Fill in project details:
   - **Project name**: `Artirexa Invoice Creator`
   - **Organization**: Leave as default (optional)
   - **Location**: Leave as default
4. Click "**Create**"
5. Wait for project creation (30 seconds - 1 minute)
6. Select your new project from the dropdown

---

## **Step 2: Configure OAuth Consent Screen**

### **2.1 Navigate to OAuth Consent Screen**

1. In the left sidebar, go to: **APIs & Services** → **OAuth consent screen**
2. Or use this direct link: https://console.cloud.google.com/apis/credentials/consent

### **2.2 Configure Consent Screen**

1. **User Type**: Select **"External"**
   - This allows anyone with a Google account to sign in
   - Click "**Create**"

2. **App Information**:
   - **App name**: `Artirexa Invoice Creator`
   - **User support email**: Your email address
   - **App logo**: Upload logo (optional)
   - **Application home page**: `http://localhost:5173` (or your domain)
   - **Application privacy policy link**: (optional for development)
   - **Application terms of service link**: (optional for development)

3. **Developer Contact Information**:
   - **Email addresses**: Your email address

4. Click "**Save and Continue**"

5. **Scopes** (Step 2):
   - Click "**Add or Remove Scopes**"
   - Select these scopes:
     - ✅ `userinfo.email`
     - ✅ `userinfo.profile`
     - ✅ `openid`
   - Click "**Update**"
   - Click "**Save and Continue**"

6. **Test Users** (Step 3):
   - For development, add your email addresses
   - Click "**Add Users**"
   - Enter email addresses (one per line)
   - Click "**Add**"
   - Click "**Save and Continue**"

7. **Summary** (Step 4):
   - Review your settings
   - Click "**Back to Dashboard**"

---

## **Step 3: Create OAuth 2.0 Credentials**

### **3.1 Navigate to Credentials**

1. In the left sidebar, go to: **APIs & Services** → **Credentials**
2. Or use this direct link: https://console.cloud.google.com/apis/credentials

### **3.2 Create OAuth Client ID**

1. Click "**+ Create Credentials**" at the top
2. Select "**OAuth client ID**"
3. Choose application type: **"Web application"**
4. Fill in the details:

   **Name**: `Artirexa Invoice Creator Web Client`

   **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   http://localhost:8080
   https://rvxmjqeqfurufbnsluft.supabase.co
   ```
   *(Add each URL separately by clicking "Add URI")*

   **Authorized redirect URIs**:
   ```
   https://rvxmjqeqfurufbnsluft.supabase.co/auth/v1/callback
   http://localhost:5173/auth/callback
   http://localhost:8080/auth/callback
   ```
   *(Add each URL separately by clicking "Add URI")*

5. Click "**Create**"

### **3.3 Save Your Credentials**

A popup will appear with your credentials:

- **Client ID**: `xxxxx.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xxxxx`

⚠️ **IMPORTANT**: Copy these values immediately! You'll need them for Supabase configuration.

---

## **Step 4: Enable Required APIs**

### **4.1 Enable Google+ API** (if not already enabled)

1. Go to: **APIs & Services** → **Library**
2. Search for: **"Google+ API"**
3. Click on "**Google+ API**"
4. Click "**Enable**"

### **4.2 Enable People API**

1. Go to: **APIs & Services** → **Library**
2. Search for: **"People API"**
3. Click on "**People API**"
4. Click "**Enable**"

---

## **Step 5: Configure Supabase**

### **5.1 Access Supabase Dashboard**

Go to: https://supabase.com/dashboard/project/rvxmjqeqfurufbnsluft

### **5.2 Enable Google Provider**

1. Go to: **Authentication** → **Providers**
2. Find "**Google**" in the list
3. Click to expand
4. Toggle "**Enable Sign in with Google**" to **ON**

### **5.3 Add Google Credentials**

Paste the credentials you copied from Google Cloud Console:

- **Client ID (for OAuth)**: `[Your Google Client ID]`
- **Client Secret (for OAuth)**: `[Your Google Client Secret]`

Click "**Save**"

### **5.4 Configure Site URL**

1. Go to: **Authentication** → **URL Configuration**
2. Set **Site URL**: 
   - Development: `http://localhost:5173`
   - Production: `https://your-domain.com`

### **5.5 Add Redirect URLs**

In the "**Redirect URLs**" section, add these URLs (one per line):

```
http://localhost:5173/**
http://localhost:8080/**
http://localhost:5173/auth/callback
http://localhost:8080/auth/callback
http://localhost:5173/dashboard
http://localhost:5173/login
http://localhost:3000/**
```

Click "**Save**"

---

## **Step 6: Test Google OAuth**

### **6.1 Restart Development Server**

```bash
# Stop your current server (Ctrl+C)
npm run dev
```

### **6.2 Test Sign In**

1. Open your app: http://localhost:5173
2. Go to **Login** page
3. Click "**Continue with Google**" button
4. You should be redirected to Google sign-in
5. Select your Google account
6. Grant permissions
7. You should be redirected back to your app (dashboard)

### **6.3 Verify User Profile**

1. Check if you're logged in
2. Verify your profile information is displayed
3. Try logging out and logging in again

---

## **Step 7: Troubleshooting**

### **Common Issues**

#### **Error: "redirect_uri_mismatch"**

**Problem**: Redirect URLs don't match

**Solution**:
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth 2.0 Client ID
3. Verify redirect URIs exactly match:
   ```
   https://rvxmjqeqfurufbnsluft.supabase.co/auth/v1/callback
   ```
4. No trailing slashes, exact match required

#### **Error: "Access blocked: Authorization Error"**

**Problem**: App not verified by Google

**Solution**:
1. Add your email as a test user in OAuth consent screen
2. Or publish your app (for production)

#### **Error: "invalid_client"**

**Problem**: Client ID or Secret is wrong

**Solution**:
1. Go to Google Cloud Console → Credentials
2. Copy Client ID and Secret again
3. Paste them into Supabase dashboard
4. Make sure there are no extra spaces

#### **Error: "popup_closed_by_user"**

**Problem**: User closed the popup

**Solution**:
- This is normal, just try again
- Or check if popup was blocked by browser

#### **Google Sign-In Button Does Nothing**

**Problem**: OAuth not properly configured

**Solution**:
1. Check browser console for errors
2. Verify Google OAuth is enabled in Supabase
3. Check redirect URLs are correct
4. Clear browser cache and cookies
5. Try in incognito/private mode

---

## **Step 8: Production Deployment**

When you're ready to deploy to production:

### **8.1 Update Google Cloud Console**

1. Go to OAuth consent screen
2. Click "**Publish App**" (or keep in testing mode)
3. Update Authorized JavaScript origins:
   ```
   https://your-domain.com
   https://rvxmjqeqfurufbnsluft.supabase.co
   ```
4. Update Authorized redirect URIs:
   ```
   https://your-domain.com/auth/callback
   https://rvxmjqeqfurufbnsluft.supabase.co/auth/v1/callback
   ```

### **8.2 Update Supabase**

1. Update Site URL to your production domain
2. Add production redirect URLs:
   ```
   https://your-domain.com/**
   https://your-domain.com/auth/callback
   https://your-domain.com/dashboard
   https://your-domain.com/login
   ```

### **8.3 Update Environment Variables**

In your hosting platform (Vercel, Netlify, etc.):

```env
VITE_APP_URL=https://your-domain.com
VITE_REDIRECT_URL=https://your-domain.com/auth/callback
```

---

## **Quick Reference**

### **Google Cloud Console URLs**

- **Dashboard**: https://console.cloud.google.com/
- **Credentials**: https://console.cloud.google.com/apis/credentials
- **OAuth Consent**: https://console.cloud.google.com/apis/credentials/consent
- **API Library**: https://console.cloud.google.com/apis/library

### **Supabase Dashboard URLs**

- **Project Dashboard**: https://supabase.com/dashboard/project/rvxmjqeqfurufbnsluft
- **Authentication**: https://supabase.com/dashboard/project/rvxmjqeqfurufbnsluft/auth/providers
- **URL Config**: https://supabase.com/dashboard/project/rvxmjqeqfurufbnsluft/auth/url-configuration

### **Redirect URIs**

- **Supabase Callback**: `https://rvxmjqeqfurufbnsluft.supabase.co/auth/v1/callback`
- **Development**: `http://localhost:5173/auth/callback`
- **Production**: `https://your-domain.com/auth/callback`

---

## **Checklist**

- [ ] Created Google Cloud project
- [ ] Configured OAuth consent screen
- [ ] Created OAuth 2.0 credentials
- [ ] Copied Client ID and Secret
- [ ] Enabled Google+ API
- [ ] Enabled People API
- [ ] Configured Google provider in Supabase
- [ ] Added Client ID and Secret to Supabase
- [ ] Configured Site URL in Supabase
- [ ] Added redirect URLs in Supabase
- [ ] Restarted development server
- [ ] Tested Google sign-in
- [ ] Verified user profile creation

---

**You're all set! 🎉**

Google OAuth is now configured and ready to use. Users can sign in with their Google accounts.

For support or issues, check the troubleshooting section above or contact your development team.

