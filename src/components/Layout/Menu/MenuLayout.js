import React, { useEffect } from 'react';

const MenuLayout = ({ 
  isOpen, 
  onClose, 
  header, 
  children 
}) => {
  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      <div 
        className={`fixed inset-y-0 left-0 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } z-20 flex flex-col`} // Changed z-index from 60 to 20
      >
        {header}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-10" // Changed z-index from 50 to 10
          onClick={onClose}
        />
      )}
    </>
  );
};

export default MenuLayout;