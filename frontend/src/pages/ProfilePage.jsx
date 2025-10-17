import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import API from '../services/api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    organization: '',
  });

  // Password change states
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    fetchUserData();
    fetchStats();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await API.get('/auth/me');
      const userData = response.data.user;
      setUser(userData);
      setFormData({
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        organization: userData.organization || '',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await API.get('/sessions/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPasswordError('');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccessMessage('');

      const response = await API.patch('/auth/me', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        organization: formData.organization,
      });

      setUser(response.data.user);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setSuccessMessage('');

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    try {
      await API.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordChange(false);
      setSuccessMessage('Password changed successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Failed to change password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/sign-in');
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-grayAccent flex items-center justify-center px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-graphite font-sans">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />

      <section className="min-h-screen bg-grayAccent px-4 sm:px-6 lg:px-8 py-6 sm:py-10 font-sans">
        {/* --- Header --- */}
        <div className="mb-6 sm:mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif text-primary font-medium mb-2">
              My Profile
            </h1>
            <p className="text-graphite text-xs sm:text-sm">
              Manage your account settings and view your progress
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-primary hover:text-primary/80 font-medium transition-colors text-sm sm:text-base"
          >
            ← Dashboard
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg">
            <p className="text-green-800 text-sm font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* --- Left Column: Profile Info --- */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 border-t-4 border-primary">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-serif text-primary font-medium">
                  Account Information
                </h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {!isEditing ? (
                // View Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-grayLight border border-grayNeutral p-4 rounded-lg">
                      <p className="text-xs text-graphite font-medium font-mono uppercase tracking-wide mb-2">
                        First Name
                      </p>
                      <p className="text-primary font-medium">
                        {user?.first_name || 'Not set'}
                      </p>
                    </div>

                    <div className="bg-grayLight border border-grayNeutral p-4 rounded-lg">
                      <p className="text-xs text-graphite font-medium font-mono uppercase tracking-wide mb-2">
                        Last Name
                      </p>
                      <p className="text-primary font-medium">
                        {user?.last_name || 'Not set'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-grayLight border border-grayNeutral p-4 rounded-lg">
                    <p className="text-xs text-graphite font-medium font-mono uppercase tracking-wide mb-2">
                      Email Address
                    </p>
                    <p className="text-primary font-medium">{user?.email}</p>
                  </div>

                  <div className="bg-grayLight border border-grayNeutral p-4 rounded-lg">
                    <p className="text-xs text-graphite font-medium font-mono uppercase tracking-wide mb-2">
                      Organization
                    </p>
                    <p className="text-primary font-medium">
                      {user?.organization || 'Not set'}
                    </p>
                  </div>

                  <div className="bg-grayLight border border-grayNeutral p-4 rounded-lg">
                    <p className="text-xs text-graphite font-medium font-mono uppercase tracking-wide mb-2">
                      Account Role
                    </p>
                    <p className="text-primary font-medium uppercase">{user?.role || 'MSL'}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-grayLight border border-grayNeutral p-4 rounded-lg">
                      <p className="text-xs text-graphite font-medium font-mono uppercase tracking-wide mb-2">
                        Member Since
                      </p>
                      <p className="text-primary font-medium text-sm">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>

                    <div className="bg-grayLight border border-grayNeutral p-4 rounded-lg">
                      <p className="text-xs text-graphite font-medium font-mono uppercase tracking-wide mb-2">
                        Last Login
                      </p>
                      <p className="text-primary font-medium text-sm">
                        {user?.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-graphite font-medium font-mono uppercase tracking-wide mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-grayNeutral rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-primary"
                        placeholder="Enter first name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-graphite font-medium font-mono uppercase tracking-wide mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-grayNeutral rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-primary"
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-graphite font-medium font-mono uppercase tracking-wide mb-2">
                      Organization
                    </label>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-grayNeutral rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-primary"
                      placeholder="Enter organization name"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          firstName: user?.first_name || '',
                          lastName: user?.last_name || '',
                          organization: user?.organization || '',
                        });
                      }}
                      className="flex-1 bg-graphite hover:bg-graphite/90 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Security Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-serif text-primary font-medium mb-6">
                Security Settings
              </h2>

              {!showPasswordChange ? (
                <div>
                  <div className="bg-grayLight border border-grayNeutral p-4 rounded-lg mb-4">
                    <p className="text-xs text-graphite font-medium font-mono uppercase tracking-wide mb-2">
                      Password
                    </p>
                    <p className="text-primary font-medium">••••••••••</p>
                  </div>
                  <button
                    onClick={() => setShowPasswordChange(true)}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 text-sm sm:text-base"
                  >
                    Change Password
                  </button>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {passwordError && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                      <p className="text-red-800 text-sm">{passwordError}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-graphite font-medium font-mono uppercase tracking-wide mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 border border-grayNeutral rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-primary"
                      placeholder="Enter current password"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-graphite font-medium font-mono uppercase tracking-wide mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 border border-grayNeutral rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-primary"
                      placeholder="Enter new password (min 6 characters)"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-graphite font-medium font-mono uppercase tracking-wide mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 border border-grayNeutral rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-primary"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
                    >
                      Update Password
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordChange(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                        });
                        setPasswordError('');
                      }}
                      className="flex-1 bg-graphite hover:bg-graphite/90 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* --- Right Column: Stats & Actions --- */}
          <div className="lg:col-span-1 space-y-6">
            {/* Practice Statistics */}
            <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-primary">
              <h3 className="text-lg sm:text-xl font-serif text-primary font-medium mb-6">
                Your Statistics
              </h3>

              <div className="space-y-4">
                <div className="text-center bg-grayLight border border-grayNeutral p-4 rounded-lg">
                  <p className="text-xs text-graphite font-medium font-mono uppercase mb-2">
                    Total Sessions
                  </p>
                  <p className="text-3xl sm:text-4xl font-bold text-primary font-mono">
                    {stats?.totalSessions || 0}
                  </p>
                </div>

                <div className="text-center bg-grayLight border border-grayNeutral p-4 rounded-lg">
                  <p className="text-xs text-graphite font-medium font-mono uppercase mb-2">
                    Current Streak
                  </p>
                  <p className="text-3xl sm:text-4xl font-bold text-primary font-mono">
                    {stats?.currentStreak || 0}
                  </p>
                  <p className="text-xs text-graphite mt-1">days</p>
                </div>

                <div className="text-center bg-grayLight border border-grayNeutral p-4 rounded-lg">
                  <p className="text-xs text-graphite font-medium font-mono uppercase mb-2">
                    Avg Confidence
                  </p>
                  <p className="text-3xl sm:text-4xl font-bold text-primary font-mono">
                    {stats?.avgConfidence?.toFixed(1) || '0.0'}
                  </p>
                  <p className="text-xs text-graphite mt-1">out of 5.0</p>
                </div>

                <div className="text-center bg-grayLight border border-grayNeutral p-4 rounded-lg">
                  <p className="text-xs text-graphite font-medium font-mono uppercase mb-2">
                    Practice Time
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-primary font-mono">
                    {stats?.totalPracticeTimeSeconds 
                      ? Math.floor(stats.totalPracticeTimeSeconds / 60)
                      : 0}
                  </p>
                  <p className="text-xs text-graphite mt-1">minutes</p>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg sm:text-xl font-serif text-primary font-medium mb-4">
                Quick Actions
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/questions')}
                  className="w-full bg-primary hover:bg-primary/90 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-300 text-sm sm:text-base"
                >
                  Start Practice Session
                </button>

                <button
                  onClick={() => navigate('/personas')}
                  className="w-full bg-grayLight hover:bg-grayNeutral text-primary border border-primary px-4 py-3 rounded-lg font-medium transition-colors duration-300 text-sm sm:text-base"
                >
                  View Physician Personas
                </button>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-grayLight hover:bg-grayNeutral text-primary border border-grayNeutral px-4 py-3 rounded-lg font-medium transition-colors duration-300 text-sm sm:text-base"
                >
                  View Dashboard
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-red-500">
              <h3 className="text-lg font-serif text-red-600 font-medium mb-4">
                Danger Zone
              </h3>
              <p className="text-graphite text-xs sm:text-sm mb-4">
                Once you logout, you'll need to sign in again to access your account.
              </p>
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-300 text-sm sm:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* --- Category Performance (Full Width) --- */}
        {stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
          <div className="max-w-6xl mx-auto mt-6">
            <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-serif text-primary font-medium mb-6">
                Performance by Category
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b-2 border-primary">
                      <th className="pb-3 text-xs sm:text-sm font-medium text-graphite font-mono uppercase tracking-wide">
                        Category
                      </th>
                      <th className="pb-3 text-xs sm:text-sm font-medium text-graphite font-mono uppercase tracking-wide text-center">
                        Sessions
                      </th>
                      <th className="pb-3 text-xs sm:text-sm font-medium text-graphite font-mono uppercase tracking-wide text-center">
                        Avg Confidence
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.categoryBreakdown.map((cat, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-grayNeutral last:border-none hover:bg-grayLight transition"
                      >
                        <td className="py-3 sm:py-4 text-xs sm:text-sm text-primary font-medium">
                          {cat.category}
                        </td>
                        <td className="py-3 sm:py-4 text-xs sm:text-sm text-center text-primary font-mono font-bold">
                          {cat.count}
                        </td>
                        <td className="py-3 sm:py-4 text-xs sm:text-sm text-center">
                          <span className="text-primary font-mono font-bold">
                            {parseFloat(cat.avg_confidence || 0).toFixed(1)}
                          </span>
                          <span className="text-graphite text-xs ml-1">/ 5.0</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- Persona Performance (Full Width) --- */}
        {stats?.personaBreakdown && stats.personaBreakdown.length > 0 && (
          <div className="max-w-6xl mx-auto mt-6">
            <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-serif text-primary font-medium mb-6">
                Performance by Persona
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.personaBreakdown.map((persona, idx) => (
                  <div
                    key={idx}
                    className="bg-grayLight border border-primary p-4 sm:p-5 rounded-lg"
                  >
                    <p className="text-xs text-graphite font-medium font-mono uppercase tracking-wide mb-3">
                      {persona.persona_name}
                    </p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-graphite mb-1">Sessions</p>
                        <p className="text-2xl sm:text-3xl font-bold text-primary font-mono">
                          {persona.count}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-graphite mb-1">Avg Confidence</p>
                        <p className="text-xl sm:text-2xl font-bold text-primary font-mono">
                          {parseFloat(persona.avg_confidence || 0).toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}