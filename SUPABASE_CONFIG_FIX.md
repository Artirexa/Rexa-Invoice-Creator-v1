# 🔧 **Supabase Configuration Fix**

## **Issue 1: Email Confirmation Blocking Login**

### **Solution: Disable Email Confirmation in Supabase**

1. **Go to your Supabase Dashboard**
2. **Navigate to Authentication → Settings**
3. **Find "Email Confirmation" section**
4. **Disable "Enable email confirmations"** (toggle OFF)
5. **Save the changes**

### **Alternative: Keep Email Confirmation but Auto-Confirm**

If you want to keep email confirmation enabled, run this SQL in your Supabase SQL Editor:

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
CREATE TRIGGER auto_confirm_user_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_user();
```

---

## **Issue 2: Google OAuth Not Working**

### **Solution: Configure Google OAuth in Supabase**

1. **Go to your Supabase Dashboard**
2. **Navigate to Authentication → Providers**
3. **Find "Google" provider**
4. **Enable Google provider** (toggle ON)
5. **Add your Google OAuth credentials:**

#### **Get Google OAuth Credentials:**

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select existing one
3. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"
4. **Create OAuth 2.0 credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "Artirexa Invoice Creator"
   - Authorized redirect URIs: 
     - `https://your-project-id.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for development)
5. **Copy Client ID and Client Secret**

#### **Configure in Supabase:**

1. **Client ID**: Paste your Google Client ID
2. **Client Secret**: Paste your Google Client Secret
3. **Redirect URL**: `https://your-project-id.supabase.co/auth/v1/callback`
4. **Save the configuration**

---

## **Issue 3: Site URL Configuration**

### **Configure Site URL in Supabase:**

1. **Go to Authentication → Settings**
2. **Set Site URL**: 
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`
3. **Add Redirect URLs**:
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000/login`
   - `http://localhost:3000/reset-password`
   - `https://your-domain.com/dashboard`
   - `https://your-domain.com/login`
   - `https://your-domain.com/reset-password`

---

## **Quick Fix Commands**

### **For Development (Disable Email Confirmation):**

Run this SQL in Supabase SQL Editor:

```sql
-- Disable email confirmation for all users
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- Update auth settings (if you have access)
-- This might need to be done through the dashboard
```

### **Test Authentication:**

1. **Clear browser cache and cookies**
2. **Try registering a new account**
3. **Try logging in with email/password**
4. **Try Google OAuth login**

---

## **Common Issues & Solutions**

### **"Email not confirmed" Error:**
- **Solution**: Disable email confirmation in Supabase dashboard
- **Alternative**: Run the auto-confirm SQL above

### **"Google OAuth error":**
- **Check**: Google OAuth credentials are correct
- **Check**: Redirect URLs match exactly
- **Check**: Google+ API is enabled
- **Check**: Site URL is configured correctly

### **"Invalid redirect URL":**
- **Solution**: Add all necessary redirect URLs in Supabase
- **Check**: URLs match exactly (including http/https)

### **"Popup blocked" Error:**
- **Solution**: Allow popups for your domain
- **Alternative**: Use redirect flow instead of popup

---

## **Testing Steps**

1. **Register new account** → Should work without email confirmation
2. **Login with email/password** → Should work immediately
3. **Google OAuth login** → Should redirect to Google and back
4. **Logout** → Should clear session properly
5. **Refresh page** → Should maintain login state

---

## **Production Considerations**

For production deployment:

1. **Enable email confirmation** for security
2. **Set up proper SMTP** for email sending
3. **Configure production redirect URLs**
4. **Set up proper domain** in Google OAuth
5. **Enable HTTPS** for all URLs

---

**After making these changes, both login methods should work properly!**
