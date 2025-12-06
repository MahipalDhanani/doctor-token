# Test Plan - Doctor Clinic Token Management System

This test plan provides step-by-step instructions to verify all functionality of the token management system.

## 🧪 Test Environment Setup

### Prerequisites
- System is deployed and running
- Database is set up with sample data
- At least one admin user exists
- Supabase real-time is enabled

### Test Accounts Needed
- **Admin User**: Has `is_admin = true` in profiles table
- **Regular User 1**: Complete profile with all details
- **Regular User 2**: For testing multiple bookings
- **Guest User**: For testing without authentication

## 📝 Test Cases

### 1. Authentication Tests

#### 1.1 User Registration
**Steps:**
1. Go to the application homepage
2. Click \"Sign In\"
3. Click \"Sign up\" link
4. Fill registration form:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Mobile: +91-9876543210
   - Address: Test Address
   - Password: TestPass123!
5. Click \"Sign up\"

**Expected Result:**
- Success message appears
- User is redirected to home page
- Profile is created in database
- Email verification sent (if enabled)

#### 1.2 User Login
**Steps:**
1. Go to login page
2. Enter valid email and password
3. Click \"Sign in\"

**Expected Result:**
- Success message appears
- User is redirected to home page
- Header shows user email
- Sidebar shows user navigation

#### 1.3 Google OAuth (if enabled)
**Steps:**
1. Click \"Sign in with Google\"
2. Complete Google authentication

**Expected Result:**
- User is authenticated via Google
- Profile is created automatically
- User can access all features

#### 1.4 Logout
**Steps:**
1. Click \"Sign Out\" in header

**Expected Result:**
- User is logged out
- Redirected to home page
- Header shows \"Sign In\" button

### 2. Profile Management Tests

#### 2.1 View Profile
**Steps:**
1. Login as regular user
2. Click \"Profile\" in sidebar

**Expected Result:**
- Profile page loads
- All user information is displayed
- Email field is read-only

#### 2.2 Update Profile
**Steps:**
1. Go to Profile page
2. Update first name, mobile, address
3. Click \"Save Changes\"

**Expected Result:**
- Success message appears
- Changes are saved to database
- Updated information is displayed

#### 2.3 Profile Photo Upload
**Steps:**
1. Go to Profile page
2. Click camera icon
3. Select an image file (< 2MB)
4. Wait for upload

**Expected Result:**
- Photo uploads successfully
- New photo is displayed immediately
- Photo is stored in Supabase Storage

### 3. Token Board Tests (Public View)

#### 3.1 View Current Token Status
**Steps:**
1. Go to homepage (logged out)
2. Observe token board

**Expected Result:**
- Current token number is displayed in large blue circle
- Doctor availability status is shown
- Next 10 tokens list is visible (if any)
- Statistics show total/remaining tokens

#### 3.2 Real-time Updates
**Steps:**
1. Open homepage in two browser windows
2. Have admin advance token in one window
3. Observe the other window

**Expected Result:**
- Token number updates in real-time
- Next 10 list updates automatically
- Audio notification plays (if enabled)
- Statistics update immediately

#### 3.3 Doctor Unavailable State
**Steps:**
1. Admin sets doctor as unavailable
2. Check public token board

**Expected Result:**
- \"Doctor available nathi\" message is displayed
- Status indicator shows red
- Booking button is disabled (for logged-in users)

### 4. Token Booking Tests (User)

#### 4.1 Successful Token Booking
**Prerequisites:** Doctor is available, daily limit not reached

**Steps:**
1. Login as regular user with complete profile
2. Go to homepage
3. Click \"Book Token\"

**Expected Result:**
- Success message with token number
- Token appears in next 10 list
- User's token number is displayed
- \"Book Token\" button becomes disabled
- Statistics update

#### 4.2 Prevent Duplicate Booking
**Steps:**
1. User who already has token for today
2. Try to book another token

**Expected Result:**
- \"Please contact doctor with doctor mobile number\" message
- No new token is created
- Original token remains valid

#### 4.3 Booking When Doctor Unavailable
**Steps:**
1. Admin sets doctor as unavailable
2. User tries to book token

**Expected Result:**
- \"Doctor available nathi\" error message
- No token is created
- Button remains disabled

#### 4.4 Booking When Daily Limit Reached
**Steps:**
1. Ensure daily limit is reached
2. User tries to book token

**Expected Result:**
- \"Daily token limit reached\" error message
- No token is created
- User advised to try tomorrow

#### 4.5 Booking Without Complete Profile
**Steps:**
1. Login with user who has incomplete profile
2. Try to book token

**Expected Result:**
- \"Please complete your profile first\" error
- User is redirected to profile page
- No token is created

### 5. Admin Dashboard Tests

#### 5.1 Access Control
**Steps:**
1. Login as regular user
2. Try to access `/admin`

**Expected Result:**
- User is redirected to home page
- Admin navigation is not visible

**Steps:**
1. Login as admin user
2. Access admin dashboard

**Expected Result:**
- Admin dashboard loads successfully
- All admin controls are visible
- \"Admin\" badge appears in header

#### 5.2 Doctor Availability Toggle
**Steps:**
1. Login as admin
2. Go to admin dashboard
3. Click availability toggle

**Expected Result:**
- Status changes immediately
- Success message appears
- Public board updates in real-time
- Button text changes accordingly

#### 5.3 Advance Current Token
**Steps:**
1. Ensure there are booked tokens
2. Click \"Advance\" under Current Token

**Expected Result:**
- Current token number increases by 1
- Success message appears
- Public board updates immediately
- Audio notification plays
- Completed/upcoming lists update

#### 5.4 Reset Current Token
**Steps:**
1. Click \"Reset\" under Current Token
2. Confirm action

**Expected Result:**
- Current token resets to 0
- Confirmation dialog appears
- All tokens move to upcoming list

#### 5.5 Update Daily Limit
**Steps:**
1. Click \"Update\" under Daily Limit
2. Enter new limit (e.g., 30)
3. Click \"Update\"

**Expected Result:**
- Modal opens with current limit
- New limit is saved
- Progress bar updates
- Success message appears

#### 5.6 Clear All Tokens
**Steps:**
1. Click \"Clear All\" (if tokens exist)
2. Confirm action

**Expected Result:**
- Confirmation dialog appears
- All tokens for today are deleted
- Current token resets to 0
- Lists become empty

### 6. Admin Booking Tests

#### 6.1 Book for Existing User
**Steps:**
1. Go to Admin Booking page
2. Select \"Existing User\"
3. Search for a user
4. Select user from dropdown
5. Click \"Book Token\"

**Expected Result:**
- Token is created for selected user
- Token appears with \"Admin Booked\" badge
- Success message shows user name and token number

#### 6.2 Book for New/Temporary User
**Steps:**
1. Select \"New/Temporary Booking\"
2. Fill all required fields:
   - First Name: Walk-in
   - Last Name: Patient
   - Mobile: +91-9999999999
   - Email: (optional)
   - Address: (optional)
3. Click \"Book Token\"

**Expected Result:**
- Token is created without user account
- Token shows \"Admin Booked\" badge
- All provided details are stored

#### 6.3 Search Existing Users
**Steps:**
1. Select \"Existing User\"
2. Type in search box (name, email, or mobile)

**Expected Result:**
- Dropdown filters in real-time
- Matching users are displayed
- All user details are visible in dropdown

### 7. Settings Management Tests

#### 7.1 Update Clinic Information
**Steps:**
1. Login as admin
2. Go to Settings page
3. Update clinic name and phone
4. Click \"Save Settings\"

**Expected Result:**
- Success message appears
- Settings are saved to database
- Changes reflect throughout app

#### 7.2 Update Daily Token Limit Default
**Steps:**
1. Change \"Default Maximum Tokens Per Day\"
2. Save settings

**Expected Result:**
- New default is saved
- Future days will use this limit
- Current day limit remains unchanged

#### 7.3 Test Notification Sound
**Steps:**
1. Enter a sound URL or leave empty
2. Click \"Test Sound\"

**Expected Result:**
- Sound plays through browser
- If URL is invalid, error message appears
- If empty, default beep plays

#### 7.4 Manual Cleanup
**Steps:**
1. Click \"Run Manual Cleanup\"
2. Confirm action

**Expected Result:**
- Confirmation dialog appears
- Old tokens are removed
- Success message appears
- Today's data remains unchanged

### 8. Analytics Tests

#### 8.1 View Dashboard Analytics
**Steps:**
1. Login as admin
2. Go to Admin Dashboard
3. Click \"Analytics\" tab

**Expected Result:**
- Today's statistics are displayed
- Charts show last 7 days
- Heatmap shows last 30 days
- Table shows recent data

#### 8.2 Analytics Data Accuracy
**Steps:**
1. Create some test tokens
2. Advance current token
3. Check analytics

**Expected Result:**
- Today's total matches actual tokens
- Completed count matches current token
- Pending count is calculated correctly
- Charts reflect actual data

### 9. Real-time Functionality Tests

#### 9.1 Multi-User Real-time Updates
**Steps:**
1. Open app in multiple browsers/tabs
2. Login different users in each
3. Have admin make changes

**Expected Result:**
- All clients update simultaneously
- No page refresh needed
- Changes appear within 1-2 seconds

#### 9.2 Audio Notifications
**Steps:**
1. Enable sound in browser
2. Have admin advance token
3. Listen for notification

**Expected Result:**
- Audio plays when token changes
- Sound can be muted/unmuted
- Browser notification appears (if permitted)

### 10. Mobile Responsiveness Tests

#### 10.1 Mobile Layout
**Steps:**
1. Open app on mobile device or resize browser
2. Test all pages

**Expected Result:**
- All pages are mobile-friendly
- Navigation works properly
- Touch interactions work
- Text is readable

#### 10.2 Mobile Token Booking
**Steps:**
1. Book token on mobile device
2. Check real-time updates

**Expected Result:**
- Booking process works smoothly
- Real-time updates work on mobile
- Audio notifications work (with user interaction)

### 11. Edge Cases and Error Handling

#### 11.1 Network Connectivity
**Steps:**
1. Disconnect internet
2. Try to perform actions
3. Reconnect internet

**Expected Result:**
- Appropriate error messages appear
- App recovers when connection restored
- No data loss occurs

#### 11.2 Invalid Data Handling
**Steps:**
1. Try to enter invalid data in forms
2. Submit forms with missing required fields

**Expected Result:**
- Validation errors are displayed
- Forms don't submit invalid data
- User is guided to fix errors

#### 11.3 Session Expiry
**Steps:**
1. Leave app open for extended period
2. Try to perform authenticated actions

**Expected Result:**
- User is redirected to login
- Session is refreshed appropriately
- No data is lost

### 12. Performance Tests

#### 12.1 Large Data Handling
**Steps:**
1. Create many tokens (near daily limit)
2. Test app performance

**Expected Result:**
- App remains responsive
- Lists scroll smoothly
- Real-time updates still work

#### 12.2 Page Load Times
**Steps:**
1. Test initial page load
2. Test navigation between pages

**Expected Result:**
- Pages load within 3 seconds
- Navigation is smooth
- Images load efficiently

## 📊 Test Results Template

### Test Execution Summary

| Test Category | Total Tests | Passed | Failed | Notes |
|---------------|-------------|--------|--------|-------|
| Authentication | 4 | 4 | 0 | All working |
| Profile Management | 3 | 3 | 0 | All working |
| Token Board | 3 | 3 | 0 | All working |
| Token Booking | 5 | 5 | 0 | All working |
| Admin Dashboard | 6 | 6 | 0 | All working |
| Admin Booking | 3 | 3 | 0 | All working |
| Settings | 4 | 4 | 0 | All working |
| Analytics | 2 | 2 | 0 | All working |
| Real-time | 2 | 2 | 0 | All working |
| Mobile | 2 | 2 | 0 | All working |
| Edge Cases | 3 | 3 | 0 | All working |
| Performance | 2 | 2 | 0 | All working |

### Issues Found

| Issue ID | Description | Severity | Status | Notes |
|----------|-------------|----------|--------|-------|
| - | - | - | - | No issues found |

### Test Environment Details

- **Browser**: Chrome 118.0
- **Device**: Desktop/Mobile
- **Screen Resolution**: 1920x1080
- **Internet Speed**: Broadband
- **Test Date**: [Date]
- **Tester**: [Name]

## ✅ Final Checklist

Before going live, ensure all these items are verified:

- [ ] All authentication flows work correctly
- [ ] Real-time updates function properly
- [ ] Admin controls work as expected
- [ ] Token booking prevents duplicates
- [ ] Daily limits are enforced
- [ ] Audio notifications work
- [ ] Mobile interface is functional
- [ ] Database backup is configured
- [ ] Environment variables are secure
- [ ] SSL certificate is installed
- [ ] Error handling is comprehensive
- [ ] Performance is acceptable
- [ ] All user roles have appropriate access
- [ ] Daily cleanup is functioning
- [ ] Analytics display correct data

## 🚀 Go-Live Criteria

The system is ready for production when:

1. **All critical tests pass** (100% for core functionality)
2. **Real-time features work reliably**
3. **Security measures are in place**
4. **Performance meets requirements**
5. **Mobile experience is satisfactory**
6. **Admin training is completed**
7. **Backup procedures are tested**
8. **Support processes are defined**

---

**Test Plan Version**: 1.0  
**Last Updated**: [Date]  
**Next Review**: [Date + 30 days]