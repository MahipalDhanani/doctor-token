import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../supabaseClient';
import { useTokens, useClinicMeta } from '../hooks/useTokens';

const AdminBooking = () => {
  const { bookToken } = useTokens();
  const { clinicMeta } = useClinicMeta();
  const [bookingType, setBookingType] = useState('existing'); // 'existing' or 'new'
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newUserForm, setNewUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    address: ''
  });

  useEffect(() => {
    if (bookingType === 'existing') {
      loadUsers();
    }
  }, [bookingType]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, mobile')
        .order('first_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error loading users');
    }
  };

  const handleNewUserInputChange = (e) => {
    setNewUserForm({
      ...newUserForm,
      [e.target.name]: e.target.value
    });
  };

  const handleBookToken = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let userDetails;

      if (bookingType === 'existing') {
        if (!selectedUser) {
          toast.error('Please select a user');
          return;
        }

        const user = users.find(u => u.id === selectedUser);
        if (!user) {
          toast.error('Selected user not found');
          return;
        }

        userDetails = {
          user_id: user.id,
          full_name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          mobile: user.mobile,
          address: '' // We'll need to get this from the full profile if needed
        };
      } else {
        // New user booking
        if (!newUserForm.firstName || !newUserForm.lastName || !newUserForm.mobile) {
          toast.error('Please fill in all required fields');
          return;
        }

        userDetails = {
          user_id: null, // No user account for temporary booking
          full_name: `${newUserForm.firstName} ${newUserForm.lastName}`,
          email: newUserForm.email,
          mobile: newUserForm.mobile,
          address: newUserForm.address
        };
      }

      const tokenData = await bookToken(userDetails, true); // true for admin booking

      toast.success(`Token ${tokenData.token_number} booked successfully for ${userDetails.full_name}!`);

      // Reset form
      if (bookingType === 'existing') {
        setSelectedUser('');
        setSearchTerm('');
      } else {
        setNewUserForm({
          firstName: '',
          lastName: '',
          email: '',
          mobile: '',
          address: ''
        });
      }
    } catch (error) {
      toast.error('Error booking token: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const email = user.email?.toLowerCase() || '';
    const mobile = user.mobile || '';
    const search = searchTerm.toLowerCase();

    return fullName.includes(search) || email.includes(search) || mobile.includes(search);
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Token Booking</h1>
          <div className="text-sm text-gray-600">
            Tokens Today: {clinicMeta.loading ? '-' : `${clinicMeta.current_token}/${clinicMeta.daily_limit}`}
          </div>
        </div>

        {/* Doctor Availability Check */}
        {!clinicMeta.loading && !clinicMeta.doctor_available && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800 font-medium">
                Doctor is currently unavailable. Bookings may not be processed immediately.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Booking Type Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Type</h3>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="bookingType"
                  value="existing"
                  checked={bookingType === 'existing'}
                  onChange={(e) => setBookingType(e.target.value)}
                  className="mr-2"
                />
                <span>Existing User</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="bookingType"
                  value="new"
                  checked={bookingType === 'new'}
                  onChange={(e) => setBookingType(e.target.value)}
                  className="mr-2"
                />
                <span>New/Temporary Booking</span>
              </label>
            </div>
          </div>

          <form onSubmit={handleBookToken}>
            {bookingType === 'existing' ? (
              /* Existing User Selection */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Users
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Search by name, email, or mobile number..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select User *
                  </label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Choose a user...</option>
                    {filteredUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} - {user.email} - {user.mobile}
                      </option>
                    ))}
                  </select>
                  {filteredUsers.length === 0 && searchTerm && (
                    <p className="text-sm text-gray-500 mt-1">No users found matching your search.</p>
                  )}
                </div>
              </div>
            ) : (
              /* New User Form */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={newUserForm.firstName}
                      onChange={handleNewUserInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={newUserForm.lastName}
                      onChange={handleNewUserInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={newUserForm.email}
                    onChange={handleNewUserInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter email address (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={newUserForm.mobile}
                    onChange={handleNewUserInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter mobile number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={newUserForm.address}
                    onChange={handleNewUserInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter address (optional)"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary hover:bg-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Booking...
                  </div>
                ) : (
                  'Book Token'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminBooking;