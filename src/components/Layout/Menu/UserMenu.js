import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../../../firebase/auth';
import { useToast } from '../../../contexts/ToastContext';
import { LoadingSpinner } from '../../ui/loading';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from '../../ui/alert';
import MyShopButton from './MyShopButton';
import LoveFood from './LoveFood';
import RecentShops from './RecentShops';
import CreateMenuButton from './CreateMenuButton';

const UserMenu = ({ isOpen, onClose, user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      showToast({
        title: 'Success',
        description: 'Successfully logged in!'
      });
      setShowLoginPrompt(false);
      onClose();
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

  const handleCreateMenu = () => {
    setShowLoginPrompt(true);
  };

  return (
    <>
      <div 
        className={`fixed inset-y-0 left-0 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } z-[60]`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          {user?.photoURL ? (
            <img 
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-10 h-10 rounded-full"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
              {(user?.displayName || 'U').charAt(0)}
            </div>
          )}
          
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {user ? (
            <>
              <div className="p-4 border-b">
                <button 
                  onClick={() => {
                    navigate('/profile');
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-10 h-10 rounded-full"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                      {(user.displayName || 'U').charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 text-left">
                    <div className="font-medium text-base">{user.displayName || 'User'}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </button>
              </div>
              <div className="border-b">
                <MyShopButton onClick={() => {
                  navigate('/my-shops');
                  onClose();
                }} />
              </div>
              <RecentShops />
              <LoveFood />
            </>
          ) : (
            <div className="p-4 space-y-4">
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border rounded-lg hover:bg-gray-50 font-medium"
              >
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <img 
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                      alt="Google"
                      className="w-5 h-5"
                    />
                    <span>Login with Google</span>
                  </>
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <CreateMenuButton onClick={handleCreateMenu} />
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[50]"
          onClick={onClose}
        />
      )}

      {/* Login Prompt Dialog */}
      <AlertDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <AlertDialogContent>
          <AlertDialogTitle>Login Required</AlertDialogTitle>
          <AlertDialogDescription>
            Please login first to create your menu.
          </AlertDialogDescription>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
            >
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <img 
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="w-5 h-5"
                  />
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UserMenu;