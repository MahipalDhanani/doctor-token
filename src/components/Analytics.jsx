import React, { useState, useEffect } from 'react';
import { supabase, getCurrentDateIST } from '../supabaseClient';

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    today: { total: 0, completed: 0, pending: 0 },
    thisWeek: { total: 0, daily: [] },
    thisMonth: { total: 0, daily: [] },
    loading: true
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const today = getCurrentDateIST();
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);

      // Today's data
      const { data: todayTokens } = await supabase
        .from('tokens')
        .select('*')
        .eq('booking_date', today);

      // Current token for today
      const { data: clinicMeta } = await supabase
        .from('clinic_meta')
        .select('current_token')
        .eq('meta_date', today)
        .single();

      // Weekly data
      const { data: weeklyTokens } = await supabase
        .from('tokens')
        .select('booking_date')
        .gte('booking_date', weekAgo.toISOString().split('T')[0])
        .order('booking_date');

      // Monthly data
      const { data: monthlyTokens } = await supabase
        .from('tokens')
        .select('booking_date')
        .gte('booking_date', monthAgo.toISOString().split('T')[0])
        .order('booking_date');

      // Process data
      const currentToken = clinicMeta?.current_token || 0;
      const todayTotal = todayTokens?.length || 0;

      // Group weekly data by date
      const weeklyByDate = groupByDate(weeklyTokens || []);
      const monthlyByDate = groupByDate(monthlyTokens || []);

      setAnalytics({
        today: {
          total: todayTotal,
          completed: currentToken,
          pending: Math.max(0, todayTotal - currentToken)
        },
        thisWeek: {
          total: weeklyTokens?.length || 0,
          daily: weeklyByDate
        },
        thisMonth: {
          total: monthlyTokens?.length || 0,
          daily: monthlyByDate
        },
        loading: false
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      setAnalytics(prev => ({ ...prev, loading: false }));
    }
  };

  const groupByDate = (tokens) => {
    const grouped = tokens.reduce((acc, token) => {
      const date = token.booking_date;
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, count]) => ({
      date,
      count
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getMaxCount = (data) => {
    return Math.max(...data.map(item => item.count), 1);
  };

  if (analytics.loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Today's Total</h3>
          <p className="text-3xl font-bold text-blue-600">{analytics.today.total}</p>
          <p className="text-sm text-gray-500">Tokens Booked</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Completed</h3>
          <p className="text-3xl font-bold text-green-600">{analytics.today.completed}</p>
          <p className="text-sm text-gray-500">Tokens Processed</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Pending</h3>
          <p className="text-3xl font-bold text-orange-600">{analytics.today.pending}</p>
          <p className="text-sm text-gray-500">In Queue</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Last 7 Days ({analytics.thisWeek.total} total)
          </h3>
          {analytics.thisWeek.daily.length > 0 ? (
            <div className="space-y-3">
              {analytics.thisWeek.daily.map((day) => {
                const maxCount = getMaxCount(analytics.thisWeek.daily);
                const percentage = (day.count / maxCount) * 100;
                
                return (
                  <div key={day.date} className="flex items-center space-x-3">
                    <div className="w-16 text-sm text-gray-600">
                      {formatDate(day.date)}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                      <div
                        className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      >
                        <span className="text-white text-xs font-medium">
                          {day.count}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No data available for the last 7 days</p>
            </div>
          )}
        </div>

        {/* Monthly Overview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Last 30 Days ({analytics.thisMonth.total} total)
          </h3>
          {analytics.thisMonth.daily.length > 0 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-7 gap-1 text-xs text-gray-600 mb-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="text-center font-medium">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {analytics.thisMonth.daily.slice(0, 28).map((day) => {
                  const maxCount = getMaxCount(analytics.thisMonth.daily);
                  const intensity = day.count / maxCount;
                  const bgColor = intensity > 0.7 ? 'bg-blue-600' :
                                  intensity > 0.4 ? 'bg-blue-400' :
                                  intensity > 0.1 ? 'bg-blue-200' : 'bg-gray-100';
                  
                  return (
                    <div
                      key={day.date}
                      className={`w-8 h-8 rounded ${bgColor} flex items-center justify-center text-xs font-medium ${
                        intensity > 0.4 ? 'text-white' : 'text-gray-700'
                      }`}
                      title={`${formatDate(day.date)}: ${day.count} tokens`}
                    >
                      {day.count > 0 ? day.count : ''}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                <span>Less</span>
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-gray-100 rounded"></div>
                  <div className="w-3 h-3 bg-blue-200 rounded"></div>
                  <div className="w-3 h-3 bg-blue-400 rounded"></div>
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                </div>
                <span>More</span>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No data available for the last 30 days</p>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Daily Statistics</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tokens Booked
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Day of Week
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.thisWeek.daily.slice(-10).reverse().map((day) => {
                const date = new Date(day.date);
                const dayOfWeek = date.toLocaleDateString('en-IN', { weekday: 'long' });
                const fullDate = date.toLocaleDateString('en-IN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                });
                
                return (
                  <tr key={day.date}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {fullDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {day.count}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dayOfWeek}
                    </td>
                  </tr>
                );
              })}
              {analytics.thisWeek.daily.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;