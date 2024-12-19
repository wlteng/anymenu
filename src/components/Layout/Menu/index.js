import React, { useState, useEffect } from 'react';
import { Menu as MenuIcon, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SetupDialog from '../../foodmenu/SetupDialog';
import { signInWithGoogle } from '../../../firebase/auth';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { LoadingSpinner } from '../../ui/loading';
import { getUserShops } from '../../../firebase/utils';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from '../../ui/alert';
import MyShopButton from './MyShopButton';
import CreateMenuButton from './CreateMenuButton';
import RecentShops from './RecentShops';
import LoveFood from './LoveFood';


const Menu = ({ onTemplateChange, currentTemplate, preview = false, shop = null }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasShops, setHasShops] = useState(false);
  const [recentShops, setRecentShops] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);

  useEffect(() => {
    if (!preview) {
      checkUserShops();
    }

    // Handle body scroll and backdrop when menu is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('menu-open');
    } else {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('menu-open');
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('menu-open');
    };
  }, [user, preview, isOpen]);

  const checkUserShops = async () => {
    if (!user) {
      setHasShops(false);
      return;
    }
    try {
      const shops = await getUserShops(user.uid);
      setHasShops(shops.length > 0);
      setRecentShops(shops);
    } catch (error) {
      console.error('Error checking shops:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      showToast({
        title: 'Success',
        description: 'Successfully logged in!'
      });
      setShowLoginPrompt(false);
      setIsOpen(false);
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
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    setSetupDialogOpen(true);
    setIsOpen(false);
  };

  const handleMyShopsClick = () => {
    setIsOpen(false);
    navigate('/my-shops');
  };

  const renderUserProfile = () => {
    if (!user) return (
      <div className="p-4 space-y-4">
        {/* Google Login Button */}
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

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or</span>
          </div>
        </div>

        {/* Create Menu Button */}
        <button
          onClick={handleCreateMenu}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Create Free Menu
        </button>
      </div>
    );
    
    return (
      <button 
        onClick={() => {
          navigate('/profile');
          setIsOpen(false);
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
    );
  };

  if (preview && shop) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Menu"
        >
          <MenuIcon className="w-6 h-6" />
        </button>

        {/* Preview Menu Content */}
        <div className={`fixed inset-y-0 left-0 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } z-50`}>
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold">Menu</h2>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col h-[calc(100vh-64px)] overflow-auto">
            <div className="p-6">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mb-6">
                {shop.squareLogo ? (
                  <img 
                    src={shop.squareLogo} 
                    alt={shop.name}
                    className="w-16 h-16 object-cover rounded-lg cursor-pointer"
                    onClick={() => navigate(`/${shop.username}`)}
                  />
                ) : (
                  <div 
                    className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer"
                    onClick={() => navigate(`/${shop.username}`)}
                  >
                    <span className="text-2xl text-gray-500">
                      {shop.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <div className="font-medium text-lg">{shop.name}</div>
                  <div className="text-sm text-gray-500">domain.com/{shop.username}</div>
                </div>
              </div>

              {user && <LoveFood items={favoriteItems} />}
            </div>
          </div>
        </div>

        {/* Backdrop for preview */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      {/* Menu Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Menu"
      >
        <MenuIcon className="w-6 h-6" />
      </button>

      {/* Backdrop with blur */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu Panel */}
      <div 
        className={`fixed inset-y-0 left-0 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } z-50`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Menu</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(100vh-64px)] overflow-auto">
          <div className="flex-1 overflow-auto">
            <div className="p-4 border-b">
              {renderUserProfile()}
            </div>

            {user && (
              <>
                {!hasShops ? (
                  <div className="text-center p-5">
                    <CreateMenuButton onClick={handleCreateMenu} />
                  </div>
                ) : (
                  <div className="border-b">
                    <MyShopButton onClick={handleMyShopsClick} />
                  </div>
                )}

                <RecentShops shops={recentShops} />
                <LoveFood items={favoriteItems} />
              </>
            )}
          </div>
        </div>
      </div>

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

      {/* Setup Dialog */}
      <SetupDialog 
        isOpen={setupDialogOpen}
        onClose={() => {
          setSetupDialogOpen(false);
          checkUserShops();
        }}
      />

      {/* Global styles for blur effect */}
      <style jsx global>{`
        body.menu-open .main-content {
          filter: blur(4px);
          pointer-events: none;
          user-select: none;
        }

        .main-content {
          transition: filter 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
};

export default Menu;