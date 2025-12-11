import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useClinicMeta, useTokens } from '../hooks/useTokens';
import { supabase, getCurrentDateIST } from '../supabaseClient';
import TokenCard from '../components/TokenCard';
import Analytics from '../components/Analytics';

const AdminDashboard = () => {
  const { clinicMeta, updateClinicMeta } = useClinicMeta();
  const { tokens, loading: tokensLoading } = useTokens();
  const [updating, setUpdating] = useState(false);
  const [newDailyLimit, setNewDailyLimit] = useState('');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'analytics'

  useEffect(() => {
    setNewDailyLimit(clinicMeta.daily_limit.toString());
  }, [clinicMeta.daily_limit]);

  const toggleDoctorAvailability = async () => {
    setUpdating(true);
    try {
      await updateClinicMeta({
        doctor_available: !clinicMeta.doctor_available
      });
      toast.success(
        clinicMeta.doctor_available 
          ? 'Doctor marked as unavailable' 
          : 'Doctor marked as available'
      );
    } catch (error) {
      toast.error('Error updating availability: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const advanceToken = async () => {
    if (clinicMeta.current_token >= tokens.length) {
      toast.warning('No more tokens to advance');
      return;
    }

    setUpdating(true);
    try {
      const { data, error } = await supabase.rpc('advance_current_token');
      
      if (error) throw error;
      
      toast.success(`Token advanced to ${data}`);
    } catch (error) {
      toast.error('Error advancing token: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const updateDailyLimit = async () => {
    const limit = parseInt(newDailyLimit);
    if (isNaN(limit) || limit < 1 || limit > 200) {
      toast.error('Please enter a valid limit between 1 and 200');
      return;
    }

    setUpdating(true);
    try {
      await updateClinicMeta({
        daily_limit: limit
      });
      toast.success('Daily limit updated successfully');
      setShowLimitModal(false);
    } catch (error) {
      toast.error('Error updating daily limit: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const resetCurrentToken = async () => {
    if (window.confirm('Are you sure you want to reset the current token to 0?')) {
      setUpdating(true);
      try {
        await updateClinicMeta({
          current_token: 0
        });
        toast.success('Current token reset to 0');
      } catch (error) {
        toast.error('Error resetting token: ' + error.message);
      } finally {
        setUpdating(false);
      }
    }
  };

  const deleteAllTokens = async () => {
    if (window.confirm('Are you sure you want to delete all tokens for today? This action cannot be undone.')) {
      setUpdating(true);
      try {
        const today = getCurrentDateIST();
        const { error } = await supabase
          .from('tokens')
          .delete()
          .eq('booking_date', today);
        
        if (error) throw error;
        
        // Reset current token to 0
        await updateClinicMeta({ current_token: 0 });
        
        toast.success('All tokens deleted successfully');
      } catch (error) {
        toast.error('Error deleting tokens: ' + error.message);
      } finally {
        setUpdating(false);
      }
    }
  };

  const upcomingTokens = tokens.filter(token => token.token_number > clinicMeta.current_token);
  const completedTokens = tokens.filter(token => token.token_number <= clinicMeta.current_token);

  if (clinicMeta.loading || tokensLoading) {
    return (
      <div className="w-full px-4 py-6 lg:py-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 h-40"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-6 lg:py-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your clinic's daily operations</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Tab Navigation */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Analytics
            </button>
          </div>
          <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 font-medium whitespace-nowrap">
            {getCurrentDateIST()}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' ? (
        <>
          {/* Control Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
              {/* Doctor Availability */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between transition-shadow hover:shadow-md h-full">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Availability
                  </h3>
                  <div className={`w-2.5 h-2.5 rounded-full ${clinicMeta.doctor_available ? 'bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-300'}`}></div>
                </div>
                
                <div className="flex items-center justify-between mt-auto">
                  <span className={`text-xl font-bold tracking-tight ${
                    clinicMeta.doctor_available ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {clinicMeta.doctor_available ? 'Online' : 'Offline'}
                  </span>
                  
                  <button
                    onClick={toggleDoctorAvailability}
                    disabled={updating}
                    className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      clinicMeta.doctor_available ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none absolute top-0 inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        clinicMeta.doctor_available ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Current Token */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between transition-shadow hover:shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Current Token
                  </h3>
                </div>
                
                <div className="flex items-end justify-between">
                  <span className="text-4xl font-bold text-gray-900">
                    {clinicMeta.current_token}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={resetCurrentToken}
                      disabled={updating}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Reset to 0"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <button
                      onClick={advanceToken}
                      disabled={updating || clinicMeta.current_token >= tokens.length}
                      className="px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>

              {/* Daily Limit */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between transition-shadow hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Daily Limit
                  </h3>
                  <button
                    onClick={() => setShowLimitModal(true)}
                    className="text-xs text-primary hover:text-blue-700 font-medium"
                  >
                    Edit
                  </button>
                </div>
                
                <div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-bold text-gray-900">{tokens.length}</span>
                    <span className="text-sm text-gray-500">/ {clinicMeta.daily_limit}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        tokens.length >= clinicMeta.daily_limit ? 'bg-red-500' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min((tokens.length / clinicMeta.daily_limit) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between transition-shadow hover:shadow-md">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => window.location.href = '/admin/book'}
                    className="flex flex-col items-center justify-center p-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l2 2 4-4" />
                    </svg>
                    <span className="text-xs font-medium">Book</span>
                  </button>
                  <button
                    onClick={deleteAllTokens}
                    disabled={updating || tokens.length === 0}
                    className="flex flex-col items-center justify-center p-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="text-xs font-medium">Clear</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Token Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Upcoming Tokens */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-900">
                    Upcoming Queue
                  </h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {upcomingTokens.length}
                  </span>
                </div>
                <div className="p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                  {upcomingTokens.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingTokens.map((token) => (
                        <TokenCard 
                          key={token.id} 
                          token={token}
                          isCurrent={token.token_number === clinicMeta.current_token + 1}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">No upcoming tokens</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Completed Tokens */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-900">
                    Completed
                  </h3>
                  <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {completedTokens.length}
                  </span>
                </div>
                <div className="p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                  {completedTokens.length > 0 ? (
                    <div className="space-y-4">
                      {completedTokens.reverse().map((token) => (
                        <div key={token.id} className="opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0">
                          <TokenCard token={token} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">No completed tokens yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Analytics Tab */
          <Analytics />
        )}

        {/* Update Daily Limit Modal */}
        {showLimitModal && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Update Daily Token Limit
                </h3>
                <p className="text-sm text-gray-500">
                  Set the maximum number of tokens that can be booked for today.
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Daily Limit
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={newDailyLimit}
                    onChange={(e) => setNewDailyLimit(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                    placeholder="Enter limit (1-200)"
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Current: {clinicMeta.daily_limit}</span>
                  <span>Booked: {tokens.length}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowLimitModal(false);
                    setNewDailyLimit(clinicMeta.daily_limit.toString());
                  }}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={updateDailyLimit}
                  disabled={updating}
                  className="px-5 py-2.5 bg-primary hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Updating...' : 'Update Limit'}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default AdminDashboard;