import { toast } from 'react-toastify';

// Voice Announcement Utility for Token Management System

class VoiceAnnouncement {
  constructor() {
    this.enabled = true;
    this.voicesLoaded = false;
    this.preferredVoice = null;
    this.settings = {
      rate: 0.8,
      pitch: 1.0,
      volume: 0.8,
      lang: 'en-US'
    };

    // Initialize voices if speech synthesis is available
    if ('speechSynthesis' in window) {
      this.initializeVoices();
    }
  }

  // ... (keep existing methods)

  // Announce token number
  announceToken(tokenNumber, soundUrl = null) {
    if (!this.isEnabled()) {
      console.log('Voice announcements disabled');
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const speak = () => {
      try {
        const text = `Token number ${tokenNumber}`;
        const utterance = new SpeechSynthesisUtterance(text);

        // Apply settings
        utterance.rate = this.settings.rate;
        utterance.pitch = this.settings.pitch;
        utterance.volume = this.settings.volume;
        utterance.lang = this.settings.lang;

        // Use preferred voice if available
        if (this.preferredVoice && this.voicesLoaded) {
          utterance.voice = this.preferredVoice;
        }

        // Add event listeners for debugging
        utterance.onstart = () => {
          console.log(`Voice announcement started: "${text}"`);
        };

        utterance.onend = () => {
          console.log(`Voice announcement completed: "${text}"`);
        };

        utterance.onerror = (event) => {
          console.error('Voice announcement error:', event.error);
          // Fallback to beep sound if no custom sound was played
          if (!soundUrl) this.playBeepSound();
        };

        // Speak the announcement
        speechSynthesis.speak(utterance);

      } catch (error) {
        console.error('Error in voice announcement:', error);
        if (!soundUrl) this.playBeepSound();
      }
    };

    if (soundUrl) {
      const audio = new Audio(soundUrl);
      audio.onended = () => {
        speak();
      };
      audio.onerror = (e) => {
        console.error('Error playing custom sound:', e);
        speak(); // Fallback to speech immediately
      };
      audio.play().catch(e => {
        console.error('Audio play failed (interaction needed?):', e);
        if (e.name === 'NotAllowedError') {
          toast.warn('Click anywhere to enable audio announcements', {
            autoClose: 3000,
            toastId: 'audio-permission' // Prevent duplicates
          });
        }
        speak();
      });
    } else {
      speak();
    }
  }

  // Initialize and load available voices
  initializeVoices() {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        this.voicesLoaded = true;

        // Find preferred English voice
        this.preferredVoice = voices.find(voice =>
          voice.lang.startsWith('en') &&
          (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.default)
        ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];

        console.log('Voice loaded:', this.preferredVoice?.name || 'Default');
      }
    };

    // Load voices immediately if available
    loadVoices();

    // Listen for voiceschanged event (required for some browsers)
    if (speechSynthesis.addEventListener) {
      speechSynthesis.addEventListener('voiceschanged', loadVoices);
    }
  }

  // Enable or disable voice announcements
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  // Check if voice announcements are enabled
  isEnabled() {
    return this.enabled && 'speechSynthesis' in window;
  }

  // Announce token number
  announceToken(tokenNumber, soundUrl = null) {
    if (!this.isEnabled()) {
      console.log('Voice announcements disabled');
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const speak = () => {
      try {
        const text = `Token number ${tokenNumber}`;
        const utterance = new SpeechSynthesisUtterance(text);

        // Apply settings
        utterance.rate = this.settings.rate;
        utterance.pitch = this.settings.pitch;
        utterance.volume = this.settings.volume;
        utterance.lang = this.settings.lang;

        // Use preferred voice if available
        if (this.preferredVoice && this.voicesLoaded) {
          utterance.voice = this.preferredVoice;
        }

        // Add event listeners for debugging
        utterance.onstart = () => {
          console.log(`Voice announcement started: "${text}"`);
        };

        utterance.onend = () => {
          console.log(`Voice announcement completed: "${text}"`);
        };

        utterance.onerror = (event) => {
          console.error('Voice announcement error:', event.error);
          // Fallback to beep sound if no custom sound was played
          if (!soundUrl) this.playBeepSound();
        };

        // Speak the announcement
        speechSynthesis.speak(utterance);

      } catch (error) {
        console.error('Error in voice announcement:', error);
        if (!soundUrl) this.playBeepSound();
      }
    };

    if (soundUrl) {
      const audio = new Audio(soundUrl);
      audio.onended = () => {
        speak();
      };
      audio.onerror = (e) => {
        console.error('Error playing custom sound:', e);
        speak(); // Fallback to speech immediately
      };
      audio.play().catch(e => {
        console.error('Audio play failed (interaction needed?):', e);
        speak();
      });
    } else {
      speak();
    }
  }

  // Fallback beep sound using Web Audio API
  playBeepSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // Hz
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing beep sound:', error);
    }
  }

  // Test voice announcement
  test(tokenNumber = 1) {
    this.announceToken(tokenNumber);
  }

  // Update voice settings
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
  }

  // Get available voices
  getAvailableVoices() {
    if ('speechSynthesis' in window) {
      return speechSynthesis.getVoices();
    }
    return [];
  }

  // Set preferred voice by name
  setPreferredVoice(voiceName) {
    const voices = this.getAvailableVoices();
    this.preferredVoice = voices.find(voice => voice.name === voiceName) || this.preferredVoice;
  }

  // Stop any ongoing announcements
  stop() {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }
}

// Create and export a singleton instance
export const voiceAnnouncement = new VoiceAnnouncement();

// Export the class for testing or multiple instances
export default VoiceAnnouncement;