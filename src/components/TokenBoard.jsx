import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useClinicMeta, useTokens, useUserToken, useClinicSettings } from '../hooks/useTokens';
import { supabase, getCurrentUser, getUserProfile } from '../supabaseClient';
import { voiceAnnouncement } from '../utils/voiceAnnouncement';
import TokenCard from './TokenCard';

const TokenBoard = ({ user }) => {
  const { clinicMeta, updateClinicMeta } = useClinicMeta();
  const { clinic_name, clinic_phone, doctor_name, doctor_degree, notification_sound_url } = useClinicSettings();
  const navigate = useNavigate();
  const { tokens, loading: tokensLoading, bookToken } = useTokens();
  const { userToken, loading: userTokenLoading } = useUserToken(user?.id);
  const [bookingToken, setBookingToken] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);


  // Get next 10 tokens after current token
  const nextTokens = tokens
    .filter(token => token.token_number > clinicMeta.current_token)
    .slice(0, 10);

  // Load user profile when user changes
  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      setShowNotificationPrompt(true);
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await getUserProfile(user.id);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;
    
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      toast.success('Notifications enabled!');
      setShowNotificationPrompt(false);
      // Send a test notification
      new Notification('Notifications Enabled', {
        body: 'You will now receive updates when tokens change.',
        icon: '/vite.svg' // Replace with app icon if available
      });
    }
  };

  const sendNotification = (tokenNumber) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    try {
      new Notification(`Token #${tokenNumber} is Now Serving`, {
        body: `Please proceed to the doctor's cabin.`,
        icon: '/vite.svg',
        vibrate: [200, 100, 200],
        tag: 'token-update', // Prevents stacking multiple notifications
        renotify: true
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  // Handle voice announcement and notifications when current token changes
  useEffect(() => {
    if (clinicMeta.current_token > 0 && isSoundEnabled) {
      // Play sound (custom or default) and speak
      voiceAnnouncement.announceToken(clinicMeta.current_token, notification_sound_url);
      
      // Send web notification
      sendNotification(clinicMeta.current_token);
    }
  }, [clinicMeta.current_token, isSoundEnabled, notification_sound_url]);

  const handleBookToken = async () => {
    if (!user) {
      toast.error('Please sign in to book a token');
      return;
    }

    if (!userProfile || !userProfile.first_name || !userProfile.last_name || !userProfile.mobile || !userProfile.address) {
      toast.error('Please complete your profile (Name, Mobile, Address) to book a token');
      navigate('/profile');
      return;
    }

    if (!clinicMeta.doctor_available) {
      toast.error('Doctor Not Available');
      return;
    }

    if (userToken) {
      toast.error('Please contact doctor with doctor mobile number');
      return;
    }

    if (tokens.length >= clinicMeta.daily_limit) {
      toast.error('Daily token limit reached. Please try tomorrow.');
      return;
    }

    setBookingToken(true);

    try {
      const tokenData = await bookToken({
        user_id: user.id,
        full_name: `${userProfile.first_name} ${userProfile.last_name}`,
        email: user.email,
        mobile: userProfile.mobile,
        address: userProfile.address
      });

      toast.success(`Token ${tokenData.token_number} booked successfully!`);
    } catch (error) {
      toast.error('Error booking token: ' + error.message);
    } finally {
      setBookingToken(false);
    }
  };

  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
    voiceAnnouncement.setEnabled(!isSoundEnabled);
    toast.info(!isSoundEnabled ? 'Voice announcements enabled' : 'Voice announcements disabled');
  };

  const testVoiceAnnouncement = () => {
    if (isSoundEnabled) {
      voiceAnnouncement.test(clinicMeta.current_token || 1);
      toast.info('Playing test announcement...');
    } else {
      toast.warn('Please enable sound first');
    }
  };

  if (clinicMeta.loading || tokensLoading) {
    return (
      <div className="w-full px-4 py-8 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="h-32 bg-gray-200 rounded-full w-32 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
            {clinic_name}
          </h1>
          {doctor_name && (
            <h2 className="text-xl lg:text-2xl font-semibold text-primary mb-2">
              {doctor_name}
              {doctor_degree && (
                <span className="text-lg lg:text-xl font-medium text-gray-500 ml-2">
                  ({doctor_degree})
                </span>
              )}
            </h2>
          )}
          {clinic_phone && (
            <p className="text-lg text-gray-600 mb-6">
              {clinic_phone}
            </p>
          )}
          
          {/* Status Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
              clinicMeta.doctor_available 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className={`w-2.5 h-2.5 rounded-full ${
                clinicMeta.doctor_available ? 'bg-green-500' : 'bg-red-500'
              } animate-pulse`}></div>
              <span className="font-semibold text-sm">
                {clinicMeta.doctor_available ? 'Doctor Available' : 'Doctor Unavailable'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
              <button
                onClick={toggleSound}
                className={`p-1.5 rounded-full transition-colors ${
                  isSoundEnabled ? 'bg-blue-100 text-primary' : 'bg-gray-100 text-gray-400'
                }`}
                title={isSoundEnabled ? 'Mute voice announcements' : 'Enable voice announcements'}
              >
                {isSoundEnabled ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.146 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.146l4.237-3.793a1 1 0 011.617.793zM7.146 8.146L5 10.293V13.707L7.146 11.854A1 1 0 018 12.207V4.793a1 1 0 01-.854-.647zM15.354 6.646a.5.5 0 010 .708L14.207 8.5l1.147 1.146a.5.5 0 01-.708.708L13.5 9.207l-1.146 1.147a.5.5 0 01-.708-.708L12.793 8.5l-1.147-1.146a.5.5 0 01.708-.708L13.5 7.793l1.146-1.147a.5.5 0 01.708 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.146 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.146l4.237-3.793a1 1 0 011.617.793zM7.146 8.146L5 10.293V13.707L7.146 11.854A1 1 0 018 12.207V4.793a1 1 0 01-.854-.647z" clipRule="evenodd" />
                    <path d="M11.854 6.146a.5.5 0 010 .708L10.707 8l1.147 1.146a.5.5 0 01-.708.708L10 8.707l-1.146 1.147a.5.5 0 01-.708-.708L9.293 8L8.146 6.854a.5.5 0 11.708-.708L10 7.293l1.146-1.147a.5.5 0 01.708 0z" />
                  </svg>
                )}
              </button>
              
              {isSoundEnabled && (
                <button
                  onClick={testVoiceAnnouncement}
                  className="text-xs font-medium text-primary hover:text-blue-700"
                >
                  Test Sound
                </button>
              )}
            </div>

            {'Notification' in window && Notification.permission === 'default' && (
              <button
                onClick={requestNotificationPermission}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                Enable Notifications
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Current Token & Actions */}
          <div className="lg:col-span-5 xl:col-span-4 order-1">
            <div className="sticky top-8 space-y-6">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-transform hover:scale-[1.02]">
                <TokenCard 
                  token={clinicMeta.current_token} 
                  isCurrentToken={true} 
                />
              </div>
              
              {/* Book Token Section */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                {user && clinicMeta.doctor_available ? (
                  <>
                    {userToken ? (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-green-800 font-bold text-lg mb-1">
                          Booked Successfully!
                        </p>
                        <p className="text-3xl font-bold text-green-600 my-3">
                          #{userToken.token_number}
                        </p>
                        <p className="text-sm text-green-700">
                          Please wait for your turn
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Need a Token?</h3>
                        <p className="text-sm text-gray-500 mb-6">Book your spot in the queue now.</p>
                        <button
                          onClick={handleBookToken}
                          disabled={bookingToken || !clinicMeta.doctor_available || tokens.length >= clinicMeta.daily_limit}
                          className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                          {bookingToken ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              <span>Booking...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l2 2 4-4" />
                              </svg>
                              <span>Book Token Now</span>
                            </div>
                          )}
                        </button>
                        {tokens.length >= clinicMeta.daily_limit && (
                          <p className="text-xs text-red-500 mt-3 font-medium">
                            Daily limit reached. Please try tomorrow.
                          </p>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    {!user ? (
                      <>
                        <p className="text-gray-600 mb-4">Sign in to book a token</p>
                        <a
                          href="/auth"
                          className="inline-block w-full bg-primary hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
                        >
                          Sign In
                        </a>
                      </>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <p className="text-gray-500 font-medium">Doctor is currently unavailable</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{tokens.length}</p>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Total Booked</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{Math.max(0, clinicMeta.daily_limit - tokens.length)}</p>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Remaining</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Next Tokens List */}
          <div className="lg:col-span-7 xl:col-span-8 order-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">
                  Up Next
                </h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                  {nextTokens.length} Waiting
                </span>
              </div>
              
              <div className="p-6">
                {nextTokens.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {nextTokens.map((token) => (
                      <TokenCard 
                        key={token.id} 
                        token={token}
                        isCurrent={token.token_number === clinicMeta.current_token + 1}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">No upcoming tokens</h4>
                    <p className="text-gray-500 mt-1">The queue is currently empty.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default TokenBoard;