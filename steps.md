# Doctor Clinic Token Management - Setup Steps

This guide will help you set up the Doctor Clinic Token Management system step by step, even if you have no prior coding experience.

## 📋 Prerequisites

Before you begin, you'll need:

1. **A computer** with internet connection
2. **A modern web browser** (Chrome, Firefox, Safari, or Edge)
3. **A Supabase account** (free at [supabase.com](https://supabase.com))
4. **Node.js installed** on your computer

## Step 1: Install Node.js

### Windows:
1. Go to [nodejs.org](https://nodejs.org)
2. Download the LTS version (recommended)
3. Run the installer and follow the prompts
4. Open Command Prompt and type `node --version` to verify installation

### Mac:
1. Go to [nodejs.org](https://nodejs.org)
2. Download the LTS version for macOS
3. Run the installer
4. Open Terminal and type `node --version` to verify installation

### Linux:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# CentOS/RHEL
sudo yum install nodejs npm
```

## Step 2: Get the Code

### Option A: Download ZIP
1. Download the project ZIP file
2. Extract it to a folder like `C:\\Doctor\\doctor-token`
3. Open Command Prompt/Terminal and navigate to this folder

### Option B: Git Clone (if you have Git)
```bash
git clone <repository-url>
cd doctor-token
```

## Step 3: Set Up Supabase Backend

### 3.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click \"Start your project\"
3. Sign up with Google or create an account
4. Click \"New Project\"
5. Choose your organization
6. Enter project details:
   - **Name**: `doctor-clinic-tokens`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your location
7. Click \"Create new project\"
8. Wait 2-3 minutes for setup to complete

### 3.2 Get Your Project Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values (you'll need them later):
   - **Project URL**: `https://your-project.supabase.co`
   - **anon public key**: `eyJ...` (long string)

### 3.3 Set Up Database Tables
1. In Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy the entire contents of `database_schema.sql` from the project
4. Paste it into the SQL editor
5. Click **Run** (bottom right)
6. Wait for \"Success\" message

### 3.4 Set Up Security Policies
1. Create another **New query** in SQL Editor
2. Copy the entire contents of `rls_policies.sql` from the project
3. Paste it into the SQL editor
4. Click **Run**
5. Wait for \"Success\" message

### 3.5 Set Up Storage Policies (for file uploads)
1. Create another **New query** in SQL Editor
2. Copy the entire contents of `storage_policies.sql` from the project
3. Paste it into the SQL editor
4. Click **Run**
5. Wait for "Success" message

### 3.6 Enable Real-time (Important!)
1. Go to **Database** → **Replication**
2. Find these tables and toggle **Real-time** ON for each:
   - `tokens`
   - `clinic_meta`
   - `settings`
3. Click **Save** after each toggle

### 3.7 Set Up Authentication
1. Go to **Authentication** → **Settings**
2. Under **Auth Providers**, ensure **Email** is enabled
3. (Optional) To enable Google login:
   - Toggle **Google** ON
   - You'll need Google OAuth credentials (advanced setup)

### 3.8 Set Up File Storage (for profile photos)
1. Go to **Storage**
2. Click **Create bucket**
3. Name it: `avatars`
4. Make it **Public bucket**: YES
5. Click **Save**

## Step 4: Configure the Application

### 4.1 Install Dependencies
1. Open Command Prompt/Terminal
2. Navigate to your project folder:
   ```bash
   cd C:\\Doctor\\doctor-token
   # or wherever you extracted the files
   ```
3. Install required packages:
   ```bash
   npm install
   ```
4. Wait for installation to complete (may take 2-3 minutes)

### 4.2 Set Up Environment Variables
1. In the project folder, find `.env.local.example`
2. Copy it and rename the copy to `.env.local`
3. Open `.env.local` in any text editor (Notepad works)
4. Replace the placeholder values:

```env
# Replace these with your actual Supabase values
VITE_SUPABASE_URL=https://your-actual-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here

# Customize these for your clinic
VITE_APP_NAME=Your Clinic Token Management
VITE_CLINIC_NAME=Dr. Smith's Clinic
VITE_CLINIC_PHONE=+91-9876543210
```

5. Save the file

## Step 5: Run the Application

### 5.1 Start Development Server
1. In Command Prompt/Terminal, make sure you're in the project folder
2. Run this command:
   ```bash
   npm run dev
   ```
3. You should see output like:
   ```
   Local:   http://localhost:5173/
   ```
4. Open your web browser and go to `http://localhost:5173`

### 5.2 First Time Setup
1. You should see the token management homepage
2. Click **Sign In** in the top right
3. Click **Sign up** to create the first account
4. Fill in your details and register
5. Check your email for verification (if enabled)

## Step 6: Create Your First Admin User

### 6.1 Get User ID
1. Go back to Supabase dashboard
2. Go to **Authentication** → **Users**
3. You should see your registered user
4. Click on the user to see details
5. Copy the **ID** (it looks like: `123e4567-e89b-12d3-a456-426614174000`)

### 6.2 Make User Admin
1. Go to **SQL Editor** in Supabase
2. Create a **New query**
3. Type this command (replace the ID with your actual user ID):
   ```sql
   UPDATE profiles 
   SET is_admin = TRUE 
   WHERE id = 'your-user-id-here';
   ```
4. Click **Run**
5. You should see \"Success. Rows affected: 1\"

### 6.3 Test Admin Access
1. Go back to your application (`http://localhost:5173`)
2. Sign out and sign in again
3. You should now see \"Admin\" next to your name
4. The sidebar should show admin options like \"Admin Dashboard\"

## Step 7: Configure Your Clinic

### 7.1 Update Settings
1. In the application, click **Settings** in the sidebar
2. Update:
   - **Clinic Name**: Your actual clinic name
   - **Contact Phone**: Your clinic's phone number
   - **Daily Token Limit**: How many tokens per day (e.g., 50)
3. Click **Save Settings**

### 7.2 Test Doctor Availability
1. Go to **Admin Dashboard**
2. Click **Set Available** under Doctor Availability
3. Go back to the home page
4. You should see \"Doctor Available\" in green
5. Try booking a token to test the system

## Step 8: Deploy to Production (Optional)

### 8.1 Using Vercel (Recommended - Free)
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub, GitLab, or email
3. Click **Add New...** → **Project**
4. Upload your project folder or connect your Git repository
5. Set environment variables in Vercel dashboard:
   - Add all the values from your `.env.local` file
6. Deploy and get your live URL

### 8.2 Using Netlify (Alternative - Free)
1. Go to [netlify.com](https://netlify.com)
2. Sign up and drag-drop your `dist` folder (after running `npm run build`)
3. Set environment variables in site settings
4. Your site will be live at a netlify URL

## Step 9: Daily Usage

### For Patients:
1. Visit your website
2. Register/login
3. Complete profile information
4. Book tokens when doctor is available
5. Watch the real-time token board

### For Admin/Doctor:
1. Login to admin dashboard
2. Set availability at start of day
3. Advance tokens as patients are served
4. View analytics and manage settings
5. Book tokens for patients who need help

## 🔧 Troubleshooting

### \"npm install\" fails:
- Make sure Node.js is properly installed
- Try deleting `node_modules` folder and run `npm install` again
- Check your internet connection

### Can't connect to Supabase:
- Double-check your `.env.local` file
- Make sure SUPABASE_URL and SUPABASE_ANON_KEY are correct
- Verify your Supabase project is active

### Real-time updates not working:
- Ensure real-time is enabled for tables in Supabase
- Check browser console for errors (press F12)
- Try refreshing the page

### Can't create admin user:
- Make sure you registered a user first
- Copy the exact user ID from Supabase dashboard
- Run the SQL command exactly as shown

### Tokens not booking:
- Check doctor availability is set to \"Available\"
- Ensure daily limit isn't reached
- Verify user profile is complete

## 📞 Getting Help

If you encounter issues:

1. **Check the browser console**: Press F12 and look for red error messages
2. **Check Supabase logs**: Go to Logs section in Supabase dashboard
3. **Verify environment variables**: Make sure `.env.local` has correct values
4. **Test step by step**: Go through each setup step again
5. **Check network connection**: Ensure stable internet connection

## 🎉 Congratulations!

You now have a fully functional token management system for your clinic! 

### Next Steps:
- Train your staff on how to use the admin features
- Test the system with a few patients
- Customize settings to match your clinic's needs
- Consider setting up backups and monitoring

## 📱 Mobile Access

Your token management system works on mobile devices too:
- Patients can book tokens from their phones
- Staff can manage tokens from tablets
- The display board works on any device

## 🔄 Maintenance

### Daily:
- Check that auto-cleanup is working (old tokens removed)
- Monitor token booking patterns
- Ensure doctor availability is set correctly

### Weekly:
- Review analytics for usage patterns
- Check system performance
- Update clinic information if needed

### Monthly:
- Review Supabase usage and costs
- Check for any needed updates
- Backup important settings

---

**Your clinic token management system is now ready to use! 🎉**