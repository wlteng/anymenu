import React, { useState } from 'react';
import { signInWithGoogle } from '../../../firebase/auth';
import { useToast } from '../../../contexts/ToastContext';
import { LoadingSpinner } from '../../../components/ui/loading';
import LoginDialog from './LoginDialog';

const NonLogin = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { showToast } = useToast();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      showToast({
        title: 'Success',
        description: 'Successfully logged in!'
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to login. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
      setShowLoginPrompt(false);
    }
  };

  const handleCreateMenu = () => {
    setShowLoginPrompt(true);
  };

  return (
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

      <button
        onClick={handleCreateMenu}
        className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 transition-colors"
      >
        Create Free Menu
      </button>

      {/* Login Dialog */}
      <LoginDialog 
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        onLogin={handleGoogleLogin}
        isLoading={isLoading}
      />
    </div>
  );
};

export default NonLogin;