# Voice Announcement Feature

## Overview
The Doctor Clinic Token Management system now includes voice announcements that speak the token number when it's updated, making it more accessible and user-friendly.

## Features

### 🔊 **Voice Announcements**
- **Text-to-Speech**: Announces "Token number X" when current token advances
- **Automatic Trigger**: Plays when admin advances the token counter
- **Smart Voice Selection**: Automatically selects the best English voice available
- **Cross-browser Support**: Works on Chrome, Firefox, Safari, Edge

### 🎛️ **User Controls**
- **Toggle Button**: Users can enable/disable voice announcements
- **Test Function**: "Test Voice" button to preview announcement
- **Visual Feedback**: Icon changes based on sound enabled/disabled state
- **Toast Notifications**: Confirms when sound is enabled/disabled

### 🛡️ **Fallback & Error Handling**
- **Beep Sound**: Falls back to beep if text-to-speech fails
- **Browser Compatibility**: Graceful degradation for unsupported browsers
- **Error Logging**: Console logging for debugging issues
- **Voice Loading**: Handles voice loading across different browsers

## Technical Implementation

### Voice Announcement Utility (`/src/utils/voiceAnnouncement.js`)
```javascript
// Usage
import { voiceAnnouncement } from '../utils/voiceAnnouncement';

// Enable/disable
voiceAnnouncement.setEnabled(true);

// Announce token
voiceAnnouncement.announceToken(5); // Speaks "Token number 5"

// Test announcement
voiceAnnouncement.test(1);
```

### Settings
- **Rate**: 0.8 (slightly slower for clarity)
- **Pitch**: 1.0 (normal pitch)
- **Volume**: 0.8 (comfortable level)
- **Language**: en-US (English)

## User Experience

### For Patients
1. **Real-time Updates**: Hear announcements when tokens advance
2. **Accessibility**: Better for visually impaired users
3. **Background Usage**: Don't need to constantly watch screen
4. **Personal Control**: Can mute if preferred

### For Admin
- Voice announcements work automatically when advancing tokens
- No additional configuration needed
- Visual confirmation with test button

## Browser Support

| Browser | Text-to-Speech | Fallback Beep |
|---------|----------------|---------------|
| Chrome  | ✅ Full Support | ✅ |
| Firefox | ✅ Full Support | ✅ |
| Safari  | ✅ Full Support | ✅ |
| Edge    | ✅ Full Support | ✅ |
| IE      | ❌ Not Supported | ✅ |

## Troubleshooting

### No Voice Announcement
1. Check if sound is enabled (speaker icon should be blue)
2. Try the "Test Voice" button
3. Ensure browser supports speech synthesis
4. Check browser console for errors

### Wrong Language/Voice
- The system automatically selects the best English voice
- Different browsers have different voice options
- Voice selection happens automatically on page load

### Performance
- Voice announcements are lightweight and don't affect app performance
- Voices are loaded once and cached by the browser
- Fallback beep uses Web Audio API for minimal overhead

## Code Structure

```
src/
├── utils/
│   └── voiceAnnouncement.js    # Main voice utility
├── components/
│   └── TokenBoard.jsx          # UI controls and integration
└── hooks/
    └── useTokens.js           # Token state management
```

This feature enhances accessibility and user experience by providing audio feedback for token updates, making the system more inclusive for all users.