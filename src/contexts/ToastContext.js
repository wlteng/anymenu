import React, { createContext, useContext, useState } from 'react';
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastContainer,
  ToastTitle,
  ToastDescription,
  ToastCloseButton,
} from '../components/ui/toast';

const ToastContext = createContext({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastContextProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = ({ title, description, type = 'default' }) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <ToastProvider>
        {children}
        {toasts.map(toast => (
          <Toast key={toast.id} className="duration-300">
            <ToastContainer variant={toast.type === 'error' ? 'destructive' : undefined}>
              {toast.title && <ToastTitle className="text-lg font-medium">{toast.title}</ToastTitle>}
              {toast.description && <ToastDescription className="text-sm opacity-90">{toast.description}</ToastDescription>}
              <ToastCloseButton />
            </ToastContainer>
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
};