import { useState, useEffect } from 'react';
import { supabase, getCurrentDateIST } from '../supabaseClient';

// Hook for managing clinic metadata (current token, availability, daily limit)
export const useClinicMeta = () => {
  const [clinicMeta, setClinicMeta] = useState({
    current_token: 0,
    daily_limit: 50,
    doctor_available: false,
    loading: true,
    error: null
  });

  useEffect(() => {
    let subscription;

    const fetchClinicMeta = async () => {
      try {
        const today = getCurrentDateIST();
        const { data, error } = await supabase
          .from('clinic_meta')
          .select('*')
          .eq('meta_date', today)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setClinicMeta(prev => ({
            ...prev,
            current_token: data.current_token,
            daily_limit: data.daily_limit,
            doctor_available: data.doctor_available,
            loading: false,
            error: null
          }));
        } else {
          // No data for today, create initial entry
          const { data: newData, error: insertError } = await supabase
            .from('clinic_meta')
            .insert({
              meta_date: today,
              current_token: 0,
              daily_limit: 50,
              doctor_available: false
            })
            .select()
            .single();

          if (insertError) throw insertError;

          setClinicMeta(prev => ({
            ...prev,
            current_token: newData.current_token,
            daily_limit: newData.daily_limit,
            doctor_available: newData.doctor_available,
            loading: false,
            error: null
          }));
        }
      } catch (error) {
        console.error('Error fetching clinic meta:', error);
        setClinicMeta(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    // Initial fetch
    fetchClinicMeta();

    // Set up real-time subscription
    const today = getCurrentDateIST();
    subscription = supabase
      .channel('clinic_meta_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clinic_meta',
          filter: `meta_date=eq.${today}`
        },
        (payload) => {
          console.log('Clinic meta change received:', payload);
          if (payload.new) {
            setClinicMeta(prev => ({
              ...prev,
              current_token: payload.new.current_token,
              daily_limit: payload.new.daily_limit,
              doctor_available: payload.new.doctor_available
            }));
          }
        }
      )
      .subscribe();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, []);

  const updateClinicMeta = async (updates) => {
    try {
      const today = getCurrentDateIST();
      const { error } = await supabase
        .from('clinic_meta')
        .update(updates)
        .eq('meta_date', today);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating clinic meta:', error);
      throw error;
    }
  };

  return { clinicMeta, updateClinicMeta };
};

// Hook for managing tokens
export const useTokens = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let subscription;

    const fetchTokens = async () => {
      try {
        const today = getCurrentDateIST();
        const { data, error } = await supabase
          .from('tokens')
          .select('*')
          .eq('booking_date', today)
          .order('token_number', { ascending: true });

        if (error) throw error;

        setTokens(data || []);
        setLoading(false);
        setError(null);
      } catch (error) {
        console.error('Error fetching tokens:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchTokens();

    // Set up real-time subscription
    const today = getCurrentDateIST();
    subscription = supabase
      .channel('tokens_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tokens',
          filter: `booking_date=eq.${today}`
        },
        (payload) => {
          console.log('Token change received:', payload);

          if (payload.eventType === 'INSERT') {
            setTokens(prev => [...prev, payload.new].sort((a, b) => a.token_number - b.token_number));
          } else if (payload.eventType === 'UPDATE') {
            setTokens(prev => prev.map(token =>
              token.id === payload.new.id ? payload.new : token
            ));
          } else if (payload.eventType === 'DELETE') {
            setTokens(prev => prev.filter(token => token.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, []);

  const bookToken = async (userDetails, isAdminBooking = false) => {
    try {
      const today = getCurrentDateIST();

      // Get next token number
      const { data: nextTokenData } = await supabase
        .rpc('get_next_token_number', { target_date: today });

      const nextTokenNumber = nextTokenData || 1;

      const { data, error } = await supabase
        .from('tokens')
        .insert({
          token_number: nextTokenNumber,
          booking_date: today,
          user_id: userDetails.user_id,
          full_name: userDetails.full_name,
          email: userDetails.email,
          mobile: userDetails.mobile,
          address: userDetails.address,
          booked_by_admin: isAdminBooking
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error booking token:', error);
      throw error;
    }
  };

  return { tokens, loading, error, bookToken };
};

// Hook for getting user's today's token
export const useUserToken = (userId) => {
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUserToken = async () => {
      try {
        const today = getCurrentDateIST();
        const { data, error } = await supabase
          .from('tokens')
          .select('*')
          .eq('user_id', userId)
          .eq('booking_date', today)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        setUserToken(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user token:', error);
        setLoading(false);
      }
    };

    fetchUserToken();
  }, [userId]);

  return { userToken, loading };
};

// Hook for fetching clinic settings (name, phone, doctor_name, doctor_degree)
export const useClinicSettings = () => {
  const [settings, setSettings] = useState({
    clinic_name: 'Doctor Clinic Token Management',
    doctor_name: '',
    doctor_degree: '',
    clinic_phone: '',
    loading: true
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .in('key', ['clinic_name', 'clinic_phone', 'doctor_name', 'doctor_degree', 'notification_sound_url']);

        if (error) throw error;

        const settingsMap = {};
        data?.forEach(setting => {
          settingsMap[setting.key] = setting.value;
        });

        setSettings({
          clinic_name: settingsMap.clinic_name || 'Doctor Clinic Token Management',
          doctor_name: settingsMap.doctor_name || '',
          doctor_degree: settingsMap.doctor_degree || '',
          clinic_phone: settingsMap.clinic_phone || '',
          notification_sound_url: settingsMap.notification_sound_url || '',
          loading: false
        });
      } catch (error) {
        console.error('Error fetching clinic settings:', error);
        setSettings(prev => ({ ...prev, loading: false }));
      }
    };

    fetchSettings();
  }, []);

  return settings;
};