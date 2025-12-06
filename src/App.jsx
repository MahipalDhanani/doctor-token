import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { supabase } from './supabaseClient';
import { initializeCleanupScheduler } from './utils/dailyCleanup';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminBooking from './pages/AdminBooking';
import Settings from './pages/Settings';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    // Initialize daily cleanup scheduler
    const cleanupScheduler = initializeCleanupScheduler();

    return () => {
      subscription.unsubscribe();
      cleanupScheduler(); // Cleanup scheduler on unmount
    };
  }, []);

  const checkAdminStatus = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors if no profile exists
      
      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return;
      }
      
      // If no profile exists, create one
      if (!data) {
        console.log('No profile found, creating one...');
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ id: userId, is_admin: false });
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
        }
        setIsAdmin(false);
        return;
      }
      
      setIsAdmin(data?.is_admin || false);
    } catch (error) {
      console.error('Error in checkAdminStatus:', error);
      setIsAdmin(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && (
          <>
            <Header 
              user={user} 
              isAdmin={isAdmin} 
              toggleSidebar={toggleSidebar}
              sidebarOpen={sidebarOpen}
            />
            <div className="lg:flex lg:h-screen lg:pt-16">
              <Sidebar 
                isAdmin={isAdmin} 
                isOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
              />
              <main className="flex-1 lg:overflow-y-auto bg-gray-50">
                <div className="h-full">
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Home />} />
                    
                    {/* Protected routes */}
                    <Route 
                      path="/profile" 
                      element={user ? <Profile user={user} /> : <Navigate to="/auth" />} 
                    />
                    
                    {/* Admin routes */}
                    <Route 
                      path="/admin" 
                      element={
                        user && isAdmin ? <AdminDashboard /> : <Navigate to="/" />
                      } 
                    />
                    <Route 
                      path="/admin/book" 
                      element={
                        user && isAdmin ? <AdminBooking /> : <Navigate to="/" />
                      } 
                    />
                    <Route 
                      path="/settings" 
                      element={
                        user && isAdmin ? <Settings /> : <Navigate to="/" />
                      } 
                    />
                    
                    {/* Catch all route */}
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </div>
              </main>
            </div>
          </>
        )}
        
        {!user && (
          <main className="min-h-screen">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              
              {/* Auth routes */}
              <Route 
                path="/auth" 
                element={user ? <Navigate to="/" /> : <Auth />} 
              />
              
              {/* Redirect to auth for protected routes */}
              <Route path="*" element={<Navigate to="/auth" />} />
            </Routes>
          </main>
        )}
        
        {/* Toast notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App;
