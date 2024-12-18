import React from 'react';
import { Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RecentShops = ({ shops }) => {
  const navigate = useNavigate();

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
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer"
            onClick={() => window.open(`/${shop.username}`, '_blank')}
          >
            {shop.squareLogo ? (
              <img 
                src={shop.squareLogo} 
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
  );
};

export default RecentShops;