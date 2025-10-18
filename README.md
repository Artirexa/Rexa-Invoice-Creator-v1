# 📄 Artirexa Invoice Generator

A modern, feature-rich invoice generator built with React, TypeScript, and Supabase. Create, manage, and export professional invoices with ease.

## 🚀 Quick Start

### **Prerequisites**

- Node.js 16+ & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Supabase account (free tier available)

### **Setup (5 minutes)**

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd Rexa-Invoice-Creator-v1

# Step 3: Install dependencies
npm install

# Step 4: Create environment file
# Copy env.example.txt to .env.local
# Windows PowerShell:
Copy-Item env.example.txt .env.local

# Step 5: Configure Supabase (see below)

# Step 6: Start the development server
npm run dev
```

The application will be available at **http://localhost:8080**

### **⚡ Super Quick Start**

If you just want to get started immediately, see **[QUICK_START.md](./QUICK_START.md)** for a 5-minute setup guide.

---

## 🔐 Environment Configuration

### **Required: Create .env.local**

Your Supabase credentials are configured via environment variables. Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://rvxmjqeqfurufbnsluft.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Application URLs
VITE_APP_URL=http://localhost:5173
VITE_REDIRECT_URL=http://localhost:5173/auth/callback
```

**📖 See [ENVIRONMENT_SETUP_GUIDE.md](./ENVIRONMENT_SETUP_GUIDE.md) for detailed instructions.**

### **Supabase Setup**

1. **Disable Email Confirmation** (for development):
   - Go to: [Supabase Dashboard](https://supabase.com/dashboard/project/rvxmjqeqfurufbnsluft)
   - Navigate: Authentication → Settings
   - Disable: "Email Confirmation"

2. **Optional: Set up Google OAuth**:
   - Follow: [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)

---

## 📂 Project Structure

```
Rexa-Invoice-Creator-v1/
├── src/
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client & config
│   │   ├── authService.ts       # Authentication logic
│   │   └── database.ts          # Database operations
│   ├── pages/
│   │   ├── Login.tsx            # Login page
│   │   ├── Signup.tsx           # Signup page
│   │   ├── Dashboard.tsx        # Main dashboard
│   │   ├── InvoiceEditor.tsx    # Invoice creation/editing
│   │   └── InvoiceList.tsx      # Invoice management
│   ├── components/              # Reusable UI components
│   └── utils/
│       └── pdfGenerator.ts      # PDF export functionality
├── .env.local                   # Environment variables (create this!)
├── env.example.txt              # Environment template
├── QUICK_START.md               # 5-minute setup guide
├── ENVIRONMENT_SETUP_GUIDE.md   # Full environment setup
├── GOOGLE_OAUTH_SETUP.md        # Google OAuth configuration
└── README.md                    # This file
```

---

## 💻 Development

### **Using Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/2b28d644-d7a1-4056-a41e-8ddeb92dd8fc) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

### **Using Your Preferred IDE**

Clone this repo and push changes. Pushed changes will also be reflected in Lovable.

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd Rexa-Invoice-Creator-v1

# Install dependencies
npm install

# Create .env.local (see Environment Configuration above)

# Start development server
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## 🛠️ Technologies Used

This project is built with modern web technologies:

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React** - UI framework
- **Supabase** - Backend-as-a-Service (Auth, Database, Storage)
- **shadcn-ui** - Beautiful UI components
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **jsPDF** - PDF generation

## ✨ Features

- 🔐 **Secure Authentication** - Email/password and Google OAuth
- 📝 **Invoice Creation** - Create professional invoices with ease
- 📊 **Invoice Management** - View, edit, and delete invoices
- 💾 **Auto-save** - Never lose your work
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Customizable Branding** - Add your company logo and details
- 📄 **PDF Export** - Download invoices as PDF
- 🔒 **Row Level Security** - Data isolated per user
- 🚀 **Fast & Modern** - Built with latest web technologies

---

## 🚀 Deployment

### **Deploy with Lovable**

Simply open [Lovable](https://lovable.dev/projects/2b28d644-d7a1-4056-a41e-8ddeb92dd8fc) and click on Share -> Publish.

### **Deploy with Vercel/Netlify**

1. **Add environment variables** in your hosting dashboard:
   ```env
   VITE_SUPABASE_URL=https://rvxmjqeqfurufbnsluft.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_APP_URL=https://your-domain.com
   VITE_REDIRECT_URL=https://your-domain.com/auth/callback
   ```

2. **Update Supabase settings**:
   - Set Site URL to your production domain
   - Add production redirect URLs

3. **Deploy**: Push to main branch or connect to your hosting platform

### **Custom Domain**

For custom domains with Lovable projects, see: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)

---

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get started in 5 minutes
- **[ENVIRONMENT_SETUP_GUIDE.md](./ENVIRONMENT_SETUP_GUIDE.md)** - Complete environment setup
- **[GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)** - Google OAuth configuration
- **[SUPABASE_CONFIG_FIX.md](./SUPABASE_CONFIG_FIX.md)** - Supabase troubleshooting
- **[AUTHENTICATION_FIXES.md](./AUTHENTICATION_FIXES.md)** - Authentication issues

---

## 🐛 Troubleshooting

### **Common Issues**

**"Missing Supabase environment variables"**
- Create `.env.local` file with your Supabase credentials
- Restart development server

**"Email not confirmed" error**
- Disable email confirmation in Supabase dashboard
- See [SUPABASE_CONFIG_FIX.md](./SUPABASE_CONFIG_FIX.md)

**Google OAuth not working**
- Follow [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)
- Verify redirect URLs match exactly

**Port already in use**
- Kill the process or change port in `vite.config.ts`

For more help, see our documentation files above.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is private and proprietary.

---

## 🆘 Support

- **Documentation**: Check the guides in the root directory
- **Lovable Support**: [Lovable Docs](https://docs.lovable.dev/)
- **Supabase Support**: [Supabase Docs](https://supabase.com/docs)

---

**Built with ❤️ using [Lovable](https://lovable.dev)**
