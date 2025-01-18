import React, { useState, useEffect } from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { LoadingSpinner } from '../../../components/ui/loading';
import { getUserRecentVisits, getShopById } from '../../../firebase/utils';

const RecentShops = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentVisits, setRecentVisits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadRecentVisits = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const visits = await getUserRecentVisits(user.uid);
        
        // Use Map to ensure uniqueness by shopId and get latest visit
        const uniqueVisitsMap = new Map();
        for (const visit of visits) {
          if (!uniqueVisitsMap.has(visit.shopId) || 
              uniqueVisitsMap.get(visit.shopId).visitedAt.seconds < visit.visitedAt.seconds) {
            // Get fresh shop data to ensure latest logo and info
            const shopData = await getShopById(visit.shopId);
            if (shopData) {
              uniqueVisitsMap.set(visit.shopId, {
                ...visit,
                shopLogo: shopData.squareLogo, // Use latest logo from shop data
                shopName: shopData.name,       // Use latest name from shop data
                shopUsername: shopData.username // Use latest username from shop data
              });
            }
          }
        }

        const uniqueVisits = Array.from(uniqueVisitsMap.values())
          .sort((a, b) => b.visitedAt.seconds - a.visitedAt.seconds)
          .slice(0, 3); // Show only 3 most recent

        setRecentVisits(uniqueVisits);
      } catch (error) {
        console.error('Error loading recent visits:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecentVisits();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <LoadingSpinner size="w-6 h-6" />
      </div>
    );
  }

  if (recentVisits.length === 0) return null;

  const formatVisitTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `Today at ${hours}:${minutes}`;
    } else if (diffInHours < 48) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `Yesterday at ${hours}:${minutes}`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="p-4 border-b">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <h3 className="text-sm font-medium text-gray-900">Recent Visits</h3>
        </div>
        <button 
          onClick={() => navigate('/recent-visits')}
          className="flex items-center text-sm text-blue-600 hover:text-blue-700"
        >
          View all
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      <div className="space-y-3">
        {recentVisits.map((visit) => (
          <div 
            key={visit.shopId} 
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => window.open(`/${visit.shopUsername}`, '_blank')}
          >
            {visit.shopLogo ? (
              <img 
                src={visit.shopLogo}
                alt={visit.shopName}
                className="w-12 h-12 object-cover rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/img/logo/applogo.png';
                }}
              />
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-xl text-gray-500">{visit.shopName?.charAt(0)}</span>
              </div>
            )}
            <div>
              <div className="font-medium truncate max-w-[180px]" title={visit.shopName}>
                {visit.shopName}
              </div>
              {visit.visitedAt && (
                <div className="text-xs text-gray-400">
                  {formatVisitTime(visit.visitedAt.seconds)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentShops;