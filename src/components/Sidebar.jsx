import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Sidebar = ({ user, isAdmin, isOpen, toggleSidebar }) => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: 'home' },
    { name: 'Profile', href: '/profile', icon: 'user' },
  ];

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: 'dashboard' },
    { name: 'Book Token', href: '/admin/book', icon: 'plus' },
    { name: 'Settings', href: '/settings', icon: 'settings' },
  ];

  const isActiveLink = (href) => {
    if (href === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(href);
  };

  const SidebarIcon = ({ icon, active }) => {
    const iconClasses = `h-5 w-5 transition-colors ${active ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}`;
    
    switch (icon) {
      case 'home':
        return (
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case 'user':
        return (
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'dashboard':
        return (
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        );
      case 'plus':
        return (
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case 'settings':
        return (
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 shadow-xl lg:shadow-none transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:flex lg:flex-col lg:w-72
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header & User Info */}
          <div className="lg:hidden p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xl font-bold text-gray-900">Menu</span>
              <button 
                onClick={toggleSidebar} 
                className="p-2 -mr-2 text-gray-500 hover:text-gray-700 focus:outline-none rounded-lg hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {user && (
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {user.user_metadata.first_name?.[0]}
                </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-semibold text-gray-900 truncate">
                    {user.user_metadata.first_name} {user.user_metadata.last_name}
                   </p>
                   <p className="text-xs text-gray-500 truncate">{user.email}</p>
                 </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            {navigation.map((item) => {
              const active = isActiveLink(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) toggleSidebar();
                  }}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-blue-50 text-primary'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <SidebarIcon icon={item.icon} active={active} />
                  <span className="ml-3">{item.name}</span>
                </Link>
              );
            })}

            {isAdmin && (
              <>
                <div className="px-4 mt-8 mb-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Admin Controls
                  </p>
                </div>
                {adminNavigation.map((item) => {
                  const active = isActiveLink(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => {
                        if (window.innerWidth < 1024) toggleSidebar();
                      }}
                      className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        active
                          ? 'bg-blue-50 text-primary'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <SidebarIcon icon={item.icon} active={active} />
                      <span className="ml-3">{item.name}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>
          
          {/* Footer */}
          <div className="flex-shrink-0 p-4 border-t border-gray-100">
            <div className="lg:hidden mb-4">
              {user ? (
                 <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  Sign Out
                </button>
              ) : (
                <Link 
                  to="/auth" 
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 transition-colors"
                  onClick={toggleSidebar}
                >
                  Sign In
                </Link>
              )}
            </div>
            <p className="text-xs text-center text-gray-400">
              Clinic Token Manager v1.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;