import React, { useState, useEffect } from 'react';
import { Menu as MenuIcon, X, Store, Heart, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SetupDialog from '../foodmenu/SetupDialog';
import { signInWithGoogle } from '../../firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { LoadingSpinner } from '../ui/loading';
import { getUserShops } from '../../firebase/utils';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogAction } from '../../components/ui/alert';

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
  }, [user, preview]);

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
      <div className="p-4">
        <button
          onClick={() => setShowLoginPrompt(true)}
          className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700"
        >
          Login
        </button>
      </div>
    );
    
    return (
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mb-6">
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
        <div className="flex-1">
          <div className="font-medium text-base">{user.displayName || 'User'}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      </div>
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Menu"
      >
        <MenuIcon className="w-6 h-6" />
      </button>

      <div className={`fixed inset-y-0 left-0 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } z-50`}>
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Menu</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(100vh-64px)] overflow-auto">
          <div className="flex-1 overflow-auto">
            {/* User Profile/Login */}
            <div className="p-4 border-b">
              {renderUserProfile()}
            </div>

            {/* Create Menu / My Shops */}
            {!hasShops ? (
              <div className="text-center py-6">
                <h1 className="text-2xl font-bold text-blue-600 mb-2">
                  Create Menu
                </h1>
                <p className="text-sm text-gray-500 mb-6">FOR FREE</p>
                <button
                  onClick={handleCreateMenu}
                  className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 transition-colors"
                >
                  Create Your Menu
                </button>
              </div>
            ) : (
              <button
                onClick={handleMyShopsClick}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Store className="w-5 h-5" />
                  <span className="font-medium">My Shops</span>
                </div>
              </button>
            )}

            {/* Recent Shops */}
            <div className="p-4 border-b">
              <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent Shops
              </h3>
              <div className="space-y-3">
                {recentShops.map((shop) => (
                  <div 
                    key={shop.id} 
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() => navigate(`/menu/${shop.username}`)}
                  >
                    {shop.logo ? (
                      <img 
                        src={shop.logo} 
                        alt={shop.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-xl text-gray-500">{shop.name.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{shop.name}</div>
                      <div className="text-sm text-gray-500">domain.com/{shop.username}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Favorite Items */}
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Favorites
              </h3>
              {favoriteItems.length === 0 ? (
                <p className="text-sm text-gray-500 text-center p-4">
                  No favorite items yet
                </p>
              ) : (
                <div className="space-y-3">
                  {favoriteItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-gray-500">${item.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Keep the existing AlertDialog and SetupDialog */}
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
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" 
                      fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" 
                      fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" 
                      fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" 
                      fill="#EA4335"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <SetupDialog 
        isOpen={setupDialogOpen}
        onClose={() => {
          setSetupDialogOpen(false);
          checkUserShops();
        }}
      />
    </>
  );
};

export default Menu;