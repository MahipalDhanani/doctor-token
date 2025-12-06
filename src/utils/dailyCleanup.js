import { supabase, getCurrentDateIST } from '../supabaseClient';

// Daily cleanup utility for removing old tokens
export const performDailyCleanup = async () => {
  try {
    console.log('Starting daily cleanup...');
    
    // Use the database function for cleanup
    const { data, error } = await supabase.rpc('cleanup_old_tokens');
    
    if (error) throw error;
    
    console.log('Daily cleanup completed successfully');
    return { success: true, message: 'Daily cleanup completed' };
  } catch (error) {
    console.error('Error during daily cleanup:', error);
    return { success: false, error: error.message };
  }
};

// Check if cleanup should run (at 12:05 AM IST)
export const shouldRunCleanup = () => {
  const now = new Date();
  const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  
  const hour = istTime.getHours();
  const minute = istTime.getMinutes();
  
  // Run cleanup between 12:00 and 12:30 AM IST
  return hour === 0 && minute >= 0 && minute <= 30;
};

// Initialize cleanup scheduler
export const initializeCleanupScheduler = () => {
  // Check every 5 minutes if cleanup should run
  const checkInterval = 5 * 60 * 1000; // 5 minutes
  
  const lastCleanupKey = 'lastCleanupDate';
  
  const scheduler = setInterval(async () => {
    if (shouldRunCleanup()) {
      const today = getCurrentDateIST();
      const lastCleanup = localStorage.getItem(lastCleanupKey);
      
      // Only run once per day
      if (lastCleanup !== today) {
        console.log('Running scheduled cleanup...');
        const result = await performDailyCleanup();
        
        if (result.success) {
          localStorage.setItem(lastCleanupKey, today);
          console.log('Scheduled cleanup completed');
        } else {
          console.error('Scheduled cleanup failed:', result.error);
        }
      }
    }
  }, checkInterval);
  
  // Return cleanup function
  return () => {
    clearInterval(scheduler);
  };
};

// Manual cleanup for admin use
export const runManualCleanup = async () => {
  return performDailyCleanup();
};

// Get cleanup status
export const getCleanupStatus = () => {
  const lastCleanup = localStorage.getItem('lastCleanupDate');
  const today = getCurrentDateIST();
  
  return {
    lastCleanup,
    isToday: lastCleanup === today,
    nextScheduled: shouldRunCleanup() ? 'Now' : 'Tonight at 12:05 AM IST'
  };
};