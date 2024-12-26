import React from 'react';
import { Phone, Globe, Facebook, Twitter, Instagram } from 'lucide-react';

const SocialLink = ({ icon: Icon, url, label }) => {
  if (!url) return null;
  
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 p-3 hover:bg-gray-50 rounded-lg text-gray-600"
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </a>
  );
};

const ShopInfo = ({ shop, isSample = false }) => {
  // Sample data for the homepage
  const sampleShop = {
    name: 'Sample Restaurant',
    username: 'sample-restaurant',
    description: 'Welcome to our restaurant! We serve delicious food made with fresh ingredients. Come experience our wonderful atmosphere and exceptional service.',
    whatsappNumber: '60123456789',
    squareLogo: '/img/logo/applogo.png',  // App logo for sample shop
    websiteUrl: '#',
    facebookUrl: '#',
    twitterUrl: '#',
    instagramUrl: '#'
  };

  const displayShop = isSample ? sampleShop : shop;

  return (
    <div className="p-6 border-b">
      <div className="flex items-center gap-3 mb-6">
        {displayShop?.squareLogo ? (
          <img 
            src={displayShop.squareLogo}
            alt={displayShop.name}
            className="w-16 h-16 object-cover rounded-lg"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/img/logo/applogo.png'; // Fallback to app logo
            }}
          />
        ) : (
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl text-gray-500">{displayShop?.name?.charAt(0) || 'S'}</span>
          </div>
        )}
        <div>
          <div className="font-medium text-lg">{displayShop?.name}</div>
          <div className="text-sm text-gray-500">anymenu.info/{displayShop?.username}</div>
        </div>
      </div>

      <p className="text-gray-600 mb-6">{displayShop?.description}</p>

      {displayShop?.whatsappNumber && (
        <button
          onClick={() => {
            const cleanNumber = displayShop.whatsappNumber.replace(/\D/g, '');
            window.open(`https://wa.me/${cleanNumber}`, '_blank');
          }}
          className="w-full flex items-center justify-center gap-2 bg-green-500 text-white rounded-lg py-3 hover:bg-green-600 transition-colors mb-6"
        >
          <Phone className="w-5 h-5" />
          <span>Contact on WhatsApp</span>
        </button>
      )}

      <div className="space-y-2">
        <SocialLink 
          icon={Globe} 
          url={displayShop?.websiteUrl} 
          label="Visit Website" 
        />
        <SocialLink 
          icon={Facebook} 
          url={displayShop?.facebookUrl} 
          label="Facebook" 
        />
        <SocialLink 
          icon={Twitter} 
          url={displayShop?.twitterUrl} 
          label="Twitter" 
        />
        <SocialLink 
          icon={Instagram} 
          url={displayShop?.instagramUrl} 
          label="Instagram" 
        />
      </div>
    </div>
  );
};

export default ShopInfo;