import React from 'react';
import { Store, ChevronRight, LogOut, UserCircle } from 'lucide-react';
import { signInWithGoogle, signOutUser } from '../../../firebase/auth';
import { useToast } from '../../../contexts/ToastContext';
import { LoadingSpinner } from '../../../components/ui/loading';

const MenuItem = ({ icon: Icon, label, onClick, rightElement, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors ${className}`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
      </div>
      {rightElement || <ChevronRight className="w-4 h-4 text-gray-400" />}
    </button>
  );
};

const GoogleLoginButton = ({ onClick, isLoading }) => (
  <button
    onClick={onClick}
    disabled={isLoading}
    className="w-full flex items-center justify-center gap-2 p-4 hover:bg-gray-100 transition-colors"
  >
    {isLoading ? (
      <LoadingSpinner size="w-5 h-5" />
    ) : (
      <>
        <img 
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google"
          className="w-5 h-5"
        />
        <span className="font-medium">Login with Google</span>
      </>
    )}
  </button>
);

const UserMenu = ({ onNavigate, user }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const { showToast } = useToast();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      showToast({
        title: 'Success',
        description: 'Successfully logged in!'
      });
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to login. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      showToast({
        title: 'Success',
        description: 'Successfully logged out!'
      });
      onNavigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      showToast({
        title: 'Error',
        description: 'Failed to logout. Please try again.',
        type: 'error'
      });
    }
  };

  const menuItems = user ? [
    {
      icon: Store,
      label: 'My Shops',
      onClick: () => onNavigate('/my-shops')
    },
    {
      icon: UserCircle,
      label: 'Profile',
      onClick: () => onNavigate('/profile')
    },
    {
      icon: LogOut,
      label: 'Logout',
      onClick: handleLogout,
      className: 'text-red-600 hover:bg-red-50',
      rightElement: null
    }
  ] : [];

  return (
    <div className="border-b">
      {user ? (
        menuItems.map((item, index) => (
          <MenuItem
            key={index}
            icon={item.icon}
            label={item.label}
            onClick={item.onClick}
            rightElement={item.rightElement}
            className={item.className}
          />
        ))
      ) : (
        <GoogleLoginButton 
          onClick={handleGoogleLogin} 
          isLoading={isLoading} 
        />
      )}
    </div>
  );
};

export default UserMenu;