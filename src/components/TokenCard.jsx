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
      <div className="flex flex-col items-center justify-center p-8">
        <div className="bg-primary text-white rounded-full w-32 h-32 lg:w-40 lg:h-40 flex items-center justify-center mb-4 shadow-lg">
          <span className="text-4xl lg:text-5xl font-bold">
            {token || '-'}
          </span>
        </div>
        <p className="text-lg lg:text-xl font-semibold text-gray-700">Current Token</p>
        {token > 0 && (
          <p className="text-sm text-gray-500 mt-2">Now serving</p>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${
      isCurrent ? 'border-green-500 bg-green-50' : 'border-gray-300'
    }`}>
      <div className="flex items-center space-x-3">
        {/* Token Number */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
          isCurrent ? 'bg-green-500' : 'bg-gray-400'
        }`}>
          {token.token_number}
        </div>
        
        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-blue-600">
                {getInitials(token.full_name)}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 truncate">
                {token.full_name}
              </p>
              {/* <p className="text-xs text-gray-500 truncate">
                {token.mobile}
              </p> */}
            </div>
          </div>
          
          {token.booked_by_admin && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
              Admin Booked
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenCard;