# ⚡ Quick Start Guide

Get your Artirexa Invoice Generator up and running in 5 minutes!

---

## **🚀 Step 1: Create Environment File**

Since `.env` files are protected, create them manually:

### **Windows (PowerShell):**

```powershell
# Navigate to your project directory
cd "F:\WEB Devolopment\WEMIXT\Artirexa Invoice Generator\Rexa-Invoice-Creator-v1"

# Copy the example file
Copy-Item env.example.txt .env.local
```

### **Manual Method:**

1. Open File Explorer
2. Navigate to: `F:\WEB Devolopment\WEMIXT\Artirexa Invoice Generator\Rexa-Invoice-Creator-v1`
3. Create a new file named `.env.local`
4. Copy the contents from `env.example.txt` into `.env.local`
5. Save the file

---

## **🔧 Step 2: Fix Email Confirmation (Required)**

### **Option A: Disable Email Confirmation (Fastest)**

1. Go to: https://supabase.com/dashboard/project/rvxmjqeqfurufbnsluft
2. Navigate: **Authentication** → **Settings**
3. Find: **"Email Confirmation"**
4. Toggle: **OFF**
5. Click: **Save**

### **Option B: Auto-Confirm Users**

1. Go to: https://supabase.com/dashboard/project/rvxmjqeqfurufbnsluft
2. Navigate: **SQL Editor**
3. Click: **New Query**
4. Paste this SQL:

```sql
-- Auto-confirm all existing users
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- Create function to auto-confirm new users
CREATE OR REPLACE FUNCTION auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email_confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS auto_confirm_user_trigger ON auth.users;
CREATE TRIGGER auto_confirm_user_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_user();
```

5. Click: **Run**

---

## **🎯 Step 3: Start Development Server**

```bash
# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

Server will start at: **http://localhost:8080**

---

## **✅ Step 4: Test Authentication**

### **Test Email/Password Login:**

1. Open: http://localhost:8080
2. Click: **Sign Up**
3. Enter:
   - **Name**: Test User
   - **Email**: test@example.com
   - **Password**: test123
4. Click: **Create Account**
5. You should be redirected to the dashboard

### **Test Login:**

1. Click: **Logout**
2. Click: **Login**
3. Enter your credentials
4. Click: **Sign In**
5. You should be logged in

---

## **🔐 Step 5: Configure Google OAuth (Optional)**

### **Quick Setup:**

1. **Google Cloud Console**: Follow `GOOGLE_OAUTH_SETUP.md`
2. **Get Credentials**: Copy Client ID and Secret
3. **Supabase Dashboard**: 
   - Go to: **Authentication** → **Providers**
   - Enable: **Google**
   - Paste: Client ID and Secret
   - Click: **Save**

### **Test Google Sign-In:**

1. Go to: http://localhost:8080/login
2. Click: **Continue with Google**
3. Select your Google account
4. You should be redirected to dashboard

---

## **📋 Project Structure**

```
Rexa-Invoice-Creator-v1/
├── src/
│   ├── lib/
│   │   ├── supabase.ts          # ✅ Now uses environment variables
│   │   ├── authService.ts       # Authentication logic
│   │   └── database.ts          # Database operations
│   ├── pages/
│   │   ├── Login.tsx            # Login page
│   │   ├── Signup.tsx           # Signup page
│   │   └── Dashboard.tsx        # Main dashboard
│   └── components/              # UI components
├── .env.local                   # ⚠️ Your environment variables (create this!)
├── env.example.txt              # ✅ Template for .env.local
├── .gitignore                   # ✅ Updated to exclude .env files
├── vite.config.ts               # ✅ Updated to validate env vars
├── ENVIRONMENT_SETUP_GUIDE.md   # 📖 Full setup documentation
├── GOOGLE_OAUTH_SETUP.md        # 📖 Google OAuth guide
└── QUICK_START.md               # 📖 This file
```

---

## **🐛 Common Issues**

### **Issue: "Missing Supabase environment variables"**

**Solution**:
- Make sure `.env.local` file exists
- Restart development server: `Ctrl+C` then `npm run dev`
- Check file name is exactly `.env.local` (not `.env.local.txt`)

### **Issue: "Email not confirmed"**

**Solution**:
- Disable email confirmation in Supabase (Step 2 above)
- Or run the auto-confirm SQL script

### **Issue: "Google OAuth not working"**

**Solution**:
- Follow `GOOGLE_OAUTH_SETUP.md` completely
- Verify redirect URLs match exactly
- Check Client ID and Secret are correct

### **Issue: "Port 8080 already in use"**

**Solution**:
```bash
# Option 1: Kill the process
# Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process

# Option 2: Use different port
# Edit vite.config.ts, change port to 5173
```

---

## **📚 Additional Resources**

- **Full Setup Guide**: `ENVIRONMENT_SETUP_GUIDE.md`
- **Google OAuth**: `GOOGLE_OAUTH_SETUP.md`
- **Supabase Docs**: https://supabase.com/docs
- **Vite Docs**: https://vitejs.dev/
- **React Docs**: https://react.dev/

---

## **✨ What's Next?**

After setup is complete:

1. ✅ **Customize branding**: Update logo and colors
2. ✅ **Configure email templates**: In Supabase dashboard
3. ✅ **Set up database tables**: Run SQL from `src/lib/supabase.ts`
4. ✅ **Create your first invoice**: Test the invoice generator
5. ✅ **Deploy to production**: See `ENVIRONMENT_SETUP_GUIDE.md`

---

## **🆘 Need Help?**

Check these files for detailed information:

1. **Environment Variables**: `ENVIRONMENT_SETUP_GUIDE.md`
2. **Google OAuth**: `GOOGLE_OAUTH_SETUP.md`
3. **Supabase Issues**: `SUPABASE_CONFIG_FIX.md`
4. **Authentication**: `AUTHENTICATION_FIXES.md`

---

**Happy Coding! 🎉**

Your invoice generator is ready to use. Create beautiful invoices with ease!

