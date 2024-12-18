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
          <Toast key={toast.id}>
            <ToastContainer variant={toast.type === 'error' ? 'destructive' : undefined}>
              {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
              {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
              <ToastCloseButton />
            </ToastContainer>
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
};