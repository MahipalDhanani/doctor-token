import React from 'react';

const TokenCard = ({ token, isCurrentToken = false, isCurrent = false }) => {
  const getInitials = (fullName) => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isCurrentToken) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full"></div>
          <div className="relative bg-white text-primary rounded-full w-32 h-32 lg:w-40 lg:h-40 flex items-center justify-center mb-4 shadow-xl border-4 border-blue-50">
            <span className="text-5xl lg:text-6xl font-bold tracking-tighter">
              {token || '-'}
            </span>
          </div>
        </div>
        <p className="text-lg font-bold text-gray-800 uppercase tracking-wide">Current Token</p>
        {token > 0 && (
          <div className="mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium animate-pulse">
            Now Serving
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`group relative bg-white rounded-xl p-4 transition-all duration-200 hover:shadow-lg border ${
      isCurrent 
        ? 'border-green-500 shadow-md ring-1 ring-green-500' 
        : 'border-gray-100 hover:border-blue-200 shadow-sm'
    }`}>
      <div className="flex items-center gap-4">
        {/* Token Number */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm transition-colors ${
          isCurrent 
            ? 'bg-green-500 text-white' 
            : 'bg-gray-50 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600'
        }`}>
          {token.token_number}
        </div>
        
        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              isCurrent ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {getInitials(token.full_name)}
            </div>
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {token.full_name}
            </h4>
          </div>
          
          <div className="flex items-center gap-2">
            {token.booked_by_admin && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 border border-amber-200">
                Admin
              </span>
            )}
            {/* Add more metadata tags here if needed */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenCard;