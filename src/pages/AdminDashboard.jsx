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
      <div className="w-full px-4 py-6 lg:py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6 lg:mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-md p-4 lg:p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-6 lg:py-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 lg:mb-8 gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Tab Navigation */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 lg:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 lg:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Analytics
            </button>
          </div>
          <div className="text-xs lg:text-sm text-gray-600">
            Date: {getCurrentDateIST()}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' ? (
        <>
          {/* Control Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
              {/* Doctor Availability */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Doctor Availability
                </h3>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    clinicMeta.doctor_available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {clinicMeta.doctor_available ? 'Available' : 'Unavailable'}
                  </span>
                  <button
                    onClick={toggleDoctorAvailability}
                    disabled={updating}
                    className={`px-4 py-2 rounded-md text-white font-medium ${
                      clinicMeta.doctor_available
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-green-600 hover:bg-green-700'
                    } disabled:opacity-50`}
                  >
                    {clinicMeta.doctor_available ? 'Set Unavailable' : 'Set Available'}
                  </button>
                </div>
              </div>

              {/* Current Token */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Current Token
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-primary">
                    {clinicMeta.current_token}
                  </span>
                  <div className="space-x-2">
                    <button
                      onClick={advanceToken}
                      disabled={updating || clinicMeta.current_token >= tokens.length}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:opacity-50"
                    >
                      Advance
                    </button>
                    <button
                      onClick={resetCurrentToken}
                      disabled={updating}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm disabled:opacity-50"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Daily Limit */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Daily Limit
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-800">
                    {tokens.length} / {clinicMeta.daily_limit}
                  </span>
                  <button
                    onClick={() => setShowLimitModal(true)}
                    className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm"
                  >
                    Update
                  </button>
                </div>
                <div className="mt-2">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((tokens.length / clinicMeta.daily_limit) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => window.location.href = '/admin/book'}
                    className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                  >
                    Book Token
                  </button>
                  <button
                    onClick={deleteAllTokens}
                    disabled={updating || tokens.length === 0}
                    className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm disabled:opacity-50"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>

            {/* Token Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upcoming Tokens */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Upcoming Tokens ({upcomingTokens.length})
                </h3>
                <div className="max-h-96 overflow-y-auto">
                  {upcomingTokens.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingTokens.map((token) => (
                        <TokenCard 
                          key={token.id} 
                          token={token}
                          isCurrent={token.token_number === clinicMeta.current_token + 1}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <p>No upcoming tokens</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Completed Tokens */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Completed Tokens ({completedTokens.length})
                </h3>
                <div className="max-h-96 overflow-y-auto">
                  {completedTokens.length > 0 ? (
                    <div className="space-y-3">
                      {completedTokens.reverse().map((token) => (
                        <div key={token.id} className="bg-gray-50 rounded-lg p-3 opacity-75">
                          <TokenCard token={token} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <p>No completed tokens yet</p>
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
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Update Daily Token Limit
                </h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Daily Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={newDailyLimit}
                    onChange={(e) => setNewDailyLimit(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter daily limit"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {clinicMeta.daily_limit} | Booked: {tokens.length}
                  </p>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowLimitModal(false);
                      setNewDailyLimit(clinicMeta.daily_limit.toString());
                    }}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateDailyLimit}
                    disabled={updating}
                    className="px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
                  >
                    {updating ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default AdminDashboard;