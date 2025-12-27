import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import TokenBoard from '../components/TokenBoard';
import TokenBoardSkeleton from '../components/TokenBoardSkeleton';

const Home = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <TokenBoardSkeleton />;
  }

  return <TokenBoard user={user} />;
};

export default Home;