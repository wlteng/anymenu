import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Menu from '../components/Layout/Menu';

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { showToast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      showToast({
        title: 'Success',
        description: 'Successfully logged out!'
      });
      navigate('/');
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to logout. Please try again.',
        type: 'error'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <Menu />
          <h1 className="text-lg font-semibold">Profile</h1>
          <div className="w-10" /> {/* Spacer for balance */}
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-lg mx-auto p-4">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-20 h-20 rounded-full"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
                }}
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-medium">
                {(user?.displayName || 'U').charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold">{user?.displayName || 'User'}</h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;