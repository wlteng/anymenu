import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getUserShops } from '../../../firebase/utils';
import { LoadingSpinner } from '../../../components/ui/loading';

const MAX_SHOPS = 3; // Maximum number of recent shops to show

const RecentShops = () => {
  const { user } = useAuth();
  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadShops = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const userShops = await getUserShops(user.uid);
        // Take only the first MAX_SHOPS shops
        setShops(userShops.slice(0, MAX_SHOPS));
      } catch (error) {
        console.error('Error loading shops:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadShops();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <LoadingSpinner size="w-6 h-6" />
      </div>
    );
  }

  if (shops.length === 0) {
    return null;
  }

  return (
    <div className="p-4 border-b">
      <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Recent Visits
      </h3>
      <div className="space-y-3">
        {shops.map((shop) => (
          <div 
            key={shop.id} 
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => window.open(`/${shop.username}`, '_blank')}
          >
            {shop.squareLogo ? (
              <img 
                src={shop.squareLogo} 
                alt={shop.name}
                className="w-12 h-12 object-cover rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-xl text-gray-500">{shop.name.charAt(0)}</span>
              </div>
            )}
            <div>
              <div className="font-medium">{shop.name}</div>
              <div className="text-sm text-gray-500">anymenu.info/{shop.username}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentShops;