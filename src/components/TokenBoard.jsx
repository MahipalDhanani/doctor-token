import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useClinicMeta, useTokens, useUserToken } from '../hooks/useTokens';
import { supabase, getCurrentUser, getUserProfile } from '../supabaseClient';
import { voiceAnnouncement } from '../utils/voiceAnnouncement';
import TokenCard from './TokenCard';

const TokenBoard = ({ user }) => {
  const { clinicMeta, updateClinicMeta } = useClinicMeta();
  const { tokens, loading: tokensLoading, bookToken } = useTokens();
  const { userToken, loading: userTokenLoading } = useUserToken(user?.id);
  const [bookingToken, setBookingToken] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

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

  // Play sound when current token changes
  useEffect(() => {
    if (soundEnabled && clinicMeta.current_token > 0) {
      voiceAnnouncement.setEnabled(true);
      voiceAnnouncement.announceToken(clinicMeta.current_token);
    } else {
      voiceAnnouncement.setEnabled(false);
    }
  }, [clinicMeta.current_token, soundEnabled]);

  const loadUserProfile = async () => {
    try {
      const profile = await getUserProfile(user.id);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Notifications enabled!');
      }
    }
  };

  const handleBookToken = async () => {
    if (!user) {
      toast.error('Please sign in to book a token');
      return;
    }

    if (!userProfile) {
      toast.error('Please complete your profile first');
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
    setSoundEnabled(!soundEnabled);
    voiceAnnouncement.setEnabled(soundEnabled);
    toast.info(!soundEnabled ? 'Voice announcements enabled' : 'Voice announcements disabled');
  };

  const testVoiceAnnouncement = () => {
    if (soundEnabled) {
      voiceAnnouncement.test(clinicMeta.current_token || 1);
      toast.info('Playing test announcement...');
    } else {
      toast.warn('Please enable sound first');
    }
  };

  if (clinicMeta.loading || tokensLoading) {
    return (
      <div className="w-full px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="h-32 bg-gray-200 rounded-full w-32 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            Doctor Clinic Token Management
          </h1>
          
          {/* Doctor Status */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              clinicMeta.doctor_available 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-3 h-3 rounded-full ${
                clinicMeta.doctor_available ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="font-medium">
                {clinicMeta.doctor_available ? 'Doctor Available' : 'Doctor Not Available'}
              </span>
            </div>
            
            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-full ${
                soundEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}
              title={soundEnabled ? 'Mute voice announcements' : 'Enable voice announcements'}
            >
              {soundEnabled ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.146 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.146l4.237-3.793a1 1 0 011.617.793zM7.146 8.146L5 10.293V13.707L7.146 11.854A1 1 0 018 12.207V4.793a1 1 0 01-.854-.647zM15.354 6.646a.5.5 0 010 .708L14.207 8.5l1.147 1.146a.5.5 0 01-.708.708L13.5 9.207l-1.146 1.147a.5.5 0 01-.708-.708L12.793 8.5l-1.147-1.146a.5.5 0 01.708-.708L13.5 7.793l1.146-1.147a.5.5 0 01.708 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.146 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.146l4.237-3.793a1 1 0 011.617.793zM7.146 8.146L5 10.293V13.707L7.146 11.854A1 1 0 018 12.207V4.793a1 1 0 01-.854-.647z" clipRule="evenodd" />
                  <path d="M11.854 6.146a.5.5 0 010 .708L10.707 8l1.147 1.146a.5.5 0 01-.708.708L10 8.707l-1.146 1.147a.5.5 0 01-.708-.708L9.293 8L8.146 6.854a.5.5 0 11.708-.708L10 7.293l1.146-1.147a.5.5 0 01.708 0z" />
                </svg>
              )}
            </button>
            
            {/* Test Voice Button */}
            {soundEnabled && (
              <button
                onClick={testVoiceAnnouncement}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                title="Test voice announcement"
              >
                🔊 Test Voice
              </button>
            )}
            
            {/* Notification Permission */}
            {'Notification' in window && Notification.permission === 'default' && (
              <button
                onClick={requestNotificationPermission}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Enable Notifications
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 gap-4 lg:gap-6 xl:gap-8">
          {/* Current Token Display */}
          <div className="xl:col-span-1 lg:col-span-1 order-1 lg:order-1">
            <div className="bg-white rounded-lg shadow-lg">
              <TokenCard 
                token={clinicMeta.current_token} 
                isCurrentToken={true} 
              />
            </div>
            
            {/* Book Token Button */}
            {user && clinicMeta.doctor_available && (
              <div className="mt-6">
                {userToken ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-green-800 font-medium">
                      Your Token: #{userToken.token_number}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      Please wait for your turn
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleBookToken}
                    disabled={bookingToken || !clinicMeta.doctor_available || tokens.length >= clinicMeta.daily_limit}
                    className="w-full bg-primary hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bookingToken ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Booking...
                      </div>
                    ) : (
                      'Book Token'
                    )}
                  </button>
                )}
              </div>
            )}
            
            {!user && (
              <div className="mt-6 text-center">
                <p className="text-gray-600 mb-4">Sign in to book a token</p>
                <a
                  href="/auth"
                  className="inline-block bg-primary hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
                >
                  Sign In
                </a>
              </div>
            )}
          </div>

          {/* Next Tokens List */}
          <div className="xl:col-span-2 lg:col-span-1 order-2 lg:order-2">
            <div className="bg-white rounded-lg shadow-lg p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-4 lg:mb-6">
                Next 10 Tokens
              </h3>
              
              {nextTokens.length > 0 ? (
                <div className="space-y-3">
                  {nextTokens.map((token) => (
                    <TokenCard 
                      key={token.id} 
                      token={token}
                      isCurrent={token.token_number === clinicMeta.current_token + 1}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-lg font-medium">No upcoming tokens</p>
                  <p className="text-sm mt-1">Be the first to book a token today!</p>
                </div>
              )}
            </div>
            
            {/* Statistics */}
            <div className="mt-4 lg:mt-6 grid grid-cols-2 gap-3 lg:gap-4">
              <div className="bg-white rounded-lg shadow p-3 lg:p-4 text-center">
                <p className="text-xl lg:text-2xl font-bold text-primary">{tokens.length}</p>
                <p className="text-xs lg:text-sm text-gray-600">Total Booked</p>
              </div>
              <div className="bg-white rounded-lg shadow p-3 lg:p-4 text-center">
                <p className="text-xl lg:text-2xl font-bold text-green-600">{clinicMeta.daily_limit - tokens.length}</p>
                <p className="text-xs lg:text-sm text-gray-600">Remaining</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default TokenBoard;