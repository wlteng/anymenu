import React, { useState, useEffect } from 'react';
import { Plus, Share } from 'lucide-react';

const ShopPwa = ({ shop }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Handle Android PWA install
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    });

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallPrompt(false);
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      // Update PWA manifest dynamically
      const manifestData = {
        name: shop.name,
        short_name: shop.name,
        icons: [
          {
            src: shop.squareLogo,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: shop.squareLogo,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000'
      };

      const blob = new Blob([JSON.stringify(manifestData)], { type: 'application/json' });
      const manifestUrl = URL.createObjectURL(blob);

      // Update manifest link
      const manifestLink = document.querySelector('link[rel="manifest"]');
      if (manifestLink) {
        manifestLink.href = manifestUrl;
      } else {
        const newManifestLink = document.createElement('link');
        newManifestLink.rel = 'manifest';
        newManifestLink.href = manifestUrl;
        document.head.appendChild(newManifestLink);
      }

      // Show install prompt
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-lg border-t z-50">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          {shop.squareLogo && (
            <img 
              src={shop.squareLogo} 
              alt={shop.name} 
              className="w-12 h-12 rounded-xl"
            />
          )}
          <div>
            <h3 className="font-medium">{shop.name}</h3>
            <p className="text-sm text-gray-500">Add to Home Screen</p>
          </div>
        </div>

        {isIOS ? (
          <button
            onClick={() => setShowInstallPrompt(false)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg"
          >
            <Share className="w-5 h-5" />
            <span>Share</span>
          </button>
        ) : (
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Install</span>
          </button>
        )}
      </div>

      {isIOS && (
        <div className="mt-3 max-w-lg mx-auto">
          <p className="text-sm text-gray-500">
            To install, tap the share button in your browser's toolbar and select 
            'Add to Home Screen'
          </p>
        </div>
      )}
    </div>
  );
};

export default ShopPwa;