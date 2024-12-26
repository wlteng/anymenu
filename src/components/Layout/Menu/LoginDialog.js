import React from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from '../../../components/ui/alert';
import { LoadingSpinner } from '../../../components/ui/loading';

const LoginDialog = ({ 
  isOpen, 
  onClose, 
  onLogin, 
  isLoading,
  title = "Login Required",
  description = "Please login first to create your menu."
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="px-6">
        <AlertDialogTitle className="text-lg font-semibold">{title}</AlertDialogTitle>
        <AlertDialogDescription className="text-gray-600">
          {description}
        </AlertDialogDescription>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onLogin}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
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
  );
};

export default LoginDialog;