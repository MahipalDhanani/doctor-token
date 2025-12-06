# Doctor Clinic Token Management System

A modern, real-time token management system built with React and Supabase for medical clinics to efficiently manage patient queues.

## 🚀 Features

### For Patients
- **Real-time Token Board**: View current token and next 10 tokens with live updates
- **Easy Booking**: Simple one-click token booking with user authentication
- **Audio Notifications**: Sound alerts when token numbers change (with mute option)
- **Profile Management**: Complete user profile with photo upload capability
- **Mobile Responsive**: Works seamlessly on all devices

### For Administrators
- **Doctor Availability Toggle**: Instantly control when bookings are accepted
- **Token Management**: Advance current token, reset, or clear all tokens
- **Admin Booking**: Book tokens for users who don't have accounts
- **Daily Limit Control**: Set and adjust maximum tokens per day
- **Analytics Dashboard**: View booking patterns with charts and tables
- **Settings Management**: Configure clinic details and notification sounds

### Technical Features
- **Real-time Updates**: Powered by Supabase real-time subscriptions
- **Secure Authentication**: Email/password and Google OAuth support
- **Row Level Security**: Database-level security with RLS policies
- **Daily Auto-cleanup**: Automatic removal of old tokens at midnight IST
- **Progressive Web App**: Can be installed on devices for app-like experience

## 🛠️ Technology Stack

- **Frontend**: React 19.x with Vite
- **Backend**: Supabase (PostgreSQL + Real-time + Auth + Storage)
- **Styling**: Tailwind CSS (via CDN)
- **Routing**: React Router DOM
- **Notifications**: React Toastify
- **Language**: JavaScript (ES6+)

## 📋 Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn package manager
- Supabase account
- Modern web browser

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd doctor-token
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Update `.env.local` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_NAME=Doctor Clinic Token Management
VITE_CLINIC_NAME=Your Clinic Name
VITE_CLINIC_PHONE=+91-1234567890
```

### 4. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL scripts in order:
   - Execute `database_schema.sql` in Supabase SQL Editor
   - Execute `rls_policies.sql` in Supabase SQL Editor
   - Execute `storage_policies.sql` in Supabase SQL Editor (for file uploads)

### 5. Create First Admin User

1. Register a user through the application
2. In Supabase dashboard, go to Authentication > Users
3. Copy the user's UUID
4. Run this SQL in Supabase SQL Editor:

```sql
UPDATE profiles 
SET is_admin = TRUE 
WHERE id = 'user-uuid-here';
```

### 6. Run the Application

```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 📁 Project Structure

```
doctor-token/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable React components
│   │   ├── Header.jsx     # Navigation header
│   │   ├── Sidebar.jsx    # Navigation sidebar
│   │   ├── TokenBoard.jsx # Main token display
│   │   ├── TokenCard.jsx  # Individual token card
│   │   └── Analytics.jsx  # Analytics dashboard
│   ├── pages/             # Page components
│   │   ├── Home.jsx       # Public token board
│   │   ├── Auth.jsx       # Login/Register
│   │   ├── Profile.jsx    # User profile
│   │   ├── AdminDashboard.jsx # Admin controls
│   │   ├── AdminBooking.jsx   # Admin booking
│   │   └── Settings.jsx   # System settings
│   ├── hooks/             # Custom React hooks
│   │   └── useTokens.js   # Token management hooks
│   ├── utils/             # Utility functions
│   │   └── dailyCleanup.js # Cleanup scheduler
│   ├── supabaseClient.js  # Supabase configuration
│   ├── App.jsx           # Main application component
│   └── main.jsx          # Application entry point
├── database_schema.sql    # Database structure
├── rls_policies.sql      # Security policies
├── database_setup.md     # Database setup guide
└── package.json          # Dependencies and scripts
```

## 🔧 Configuration

### Supabase Setup

1. **Authentication**: Enable email/password and Google OAuth
2. **Real-time**: Enable for tables: `tokens`, `clinic_meta`, `settings`
3. **Storage**: Create `avatars` bucket for profile photos
4. **RLS**: All tables have Row Level Security enabled

### Daily Cleanup

The system automatically removes old tokens at 12:05 AM IST. This can be:
- Configured in Settings page
- Triggered manually by admins
- Disabled if needed

## 🔒 Security Features

- **Row Level Security**: Users can only access their own data
- **Admin Verification**: Admin actions require elevated permissions
- **Input Validation**: All forms have client and server-side validation
- **Secure Authentication**: Powered by Supabase Auth
- **Environment Variables**: Sensitive data stored in environment files

## 📱 Mobile Support

The application is fully responsive and works on:
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Tablet devices (iPad, Android tablets)
- Mobile phones (iOS Safari, Android Chrome)
- Progressive Web App features for installation

## 🎨 Customization

### Styling
- Colors can be customized in `index.html` Tailwind config
- Primary color is currently set to `#1e6fbf`
- Responsive breakpoints follow Tailwind defaults

### Features
- Clinic name and contact info in Settings page
- Daily token limits are configurable
- Notification sounds can be customized
- Real-time updates can be configured

## 🔊 Audio Notifications

The system plays notification sounds when tokens advance:
- Default: Browser-generated beep sound
- Custom: Upload audio files to Supabase Storage
- Controls: Users can mute/unmute notifications
- Fallback: Browser notifications (with permission)

## 📊 Analytics

Administrators can view:
- Today's token statistics (total, completed, pending)
- Last 7 days booking chart
- Last 30 days heatmap
- Daily booking history table
- Peak usage patterns

## 🚀 Deployment

### Static Hosting (Recommended)

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**:
   ```bash
   npx vercel --prod
   ```

3. **Set environment variables** in hosting platform dashboard

### Manual Deployment

1. Upload `dist/` folder contents to web server
2. Configure environment variables
3. Ensure HTTPS is enabled
4. Test all functionality

## 🔄 Maintenance

### Regular Tasks
- Monitor Supabase usage and limits
- Review analytics for usage patterns
- Update clinic information as needed
- Check and test backup procedures

### Updates
- Keep dependencies updated
- Test new features in development
- Monitor for security updates
- Review and update documentation

## 🐛 Troubleshooting

### Common Issues

1. **Real-time not working**:
   - Check Supabase real-time is enabled
   - Verify RLS policies are correct
   - Check browser console for errors

2. **Authentication errors**:
   - Verify Supabase URL and keys
   - Check email confirmation settings
   - Ensure RLS policies allow access

3. **Token booking fails**:
   - Check doctor availability status
   - Verify daily limits not exceeded
   - Ensure user profile is complete

### Debug Mode
Enable debug logging by adding to `.env.local`:
```env
VITE_DEBUG=true
```

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Check Supabase dashboard for issues
4. Verify environment configuration

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the backend infrastructure
- [React](https://reactjs.org) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Vite](https://vitejs.dev) for the build tool

---

**Made with ❤️ for healthcare providers**