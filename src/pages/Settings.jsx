import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../supabaseClient';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    clinic_name: '',
    clinic_phone: '',
    notification_sound_url: '',
    max_tokens_per_day: '',
    auto_cleanup_enabled: 'true'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('*');

      if (error) throw error;

      const settingsMap = {};
      data.forEach(setting => {
        settingsMap[setting.key] = setting.value;
      });

      setSettings({
        clinic_name: settingsMap.clinic_name || '',
        clinic_phone: settingsMap.clinic_phone || '',
        notification_sound_url: settingsMap.notification_sound_url || '',
        max_tokens_per_day: settingsMap.max_tokens_per_day || '50',
        auto_cleanup_enabled: settingsMap.auto_cleanup_enabled || 'true'
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'true' : 'false') : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update each setting
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        description: getSettingDescription(key)
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('settings')
          .upsert(update, { onConflict: 'key' });
        
        if (error) throw error;
      }

      toast.success('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Error updating settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const getSettingDescription = (key) => {
    const descriptions = {
      clinic_name: 'Name of the clinic',
      clinic_phone: 'Contact phone number',
      notification_sound_url: 'URL for token change notification sound',
      max_tokens_per_day: 'Default maximum tokens per day',
      auto_cleanup_enabled: 'Enable automatic daily cleanup of old tokens'
    };
    return descriptions[key] || '';
  };

  const testNotificationSound = () => {
    if (settings.notification_sound_url) {
      const audio = new Audio(settings.notification_sound_url);
      audio.play().catch(error => {
        console.error('Error playing sound:', error);
        toast.error('Cannot play the notification sound. Please check the URL.');
      });
    } else {
      // Use default beep sound
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        
        toast.success('Default notification sound played');
      } catch (error) {
        toast.error('Cannot play notification sound');
      }
    }
  };

  const runManualCleanup = async () => {
    if (window.confirm('Are you sure you want to run manual cleanup? This will remove all tokens from previous days.')) {
      setSaving(true);
      try {
        const { error } = await supabase.rpc('cleanup_old_tokens');
        if (error) throw error;
        toast.success('Manual cleanup completed successfully!');
      } catch (error) {
        console.error('Error running cleanup:', error);
        toast.error('Error running cleanup: ' + error.message);
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i}>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Clinic Settings</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Clinic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Clinic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clinic Name *
                  </label>
                  <input
                    type="text"
                    name="clinic_name"
                    value={settings.clinic_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter clinic name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="clinic_phone"
                    value={settings.clinic_phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="+91-1234567890"
                  />
                </div>
              </div>
            </div>

            {/* Token Management */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Token Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Maximum Tokens Per Day
                  </label>
                  <input
                    type="number"
                    name="max_tokens_per_day"
                    value={settings.max_tokens_per_day}
                    onChange={handleInputChange}
                    min="1"
                    max="200"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will be used as default for new days
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auto Cleanup
                  </label>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="auto_cleanup_enabled"
                        checked={settings.auto_cleanup_enabled === 'true'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span className="text-sm">Enable automatic daily cleanup</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Automatically remove tokens from previous days
                  </p>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Settings</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Notification Sound URL
                </label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    name="notification_sound_url"
                    value={settings.notification_sound_url}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://example.com/notification.mp3"
                  />
                  <button
                    type="button"
                    onClick={testNotificationSound}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
                  >
                    Test Sound
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use default beep sound
                </p>
              </div>
            </div>

            {/* System Actions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">System Actions</h3>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={runManualCleanup}
                  disabled={saving}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md disabled:opacity-50"
                >
                  Run Manual Cleanup
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Manually remove all tokens from previous days
              </p>
            </div>

            {/* Save Button */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={loadSettings}
                disabled={saving}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-primary hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Settings'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;