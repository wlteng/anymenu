import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/ui/loading';
import { getUserRecentVisits, getFavoriteItems, getShopById } from '../firebase/utils';
import Menu from '../components/Layout/Menu';

// Helper function to format relative time
const getRelativeTime = (timestamp) => {
  const now = Date.now();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  const days = Math.floor(diffInSeconds / 86400);
  return `${days} ${days === 1 ? 'day' : 'days'} ago`;
};

const RecentShopsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentVisits, setRecentVisits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteCounts, setFavoriteCounts] = useState({});
  const LIMIT = 50;

  useEffect(() => {
    if (user) {
      loadRecentVisits();
      loadFavoriteCounts();
    }
  }, [user]);

  const loadFavoriteCounts = async () => {
    try {
      const favorites = await getFavoriteItems(user.uid);
      const counts = favorites.reduce((acc, favorite) => {
        const shopId = favorite.item.shopId;
        acc[shopId] = (acc[shopId] || 0) + 1;
        return acc;
      }, {});
      setFavoriteCounts(counts);
    } catch (error) {
      console.error('Error loading favorite counts:', error);
    }
  };

  const loadRecentVisits = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const visits = await getUserRecentVisits(user.uid, LIMIT);
      
      // Use Map to ensure uniqueness by shopId and get latest visit
      const uniqueVisitsMap = new Map();
      for (const visit of visits) {
        if (!uniqueVisitsMap.has(visit.shopId) || 
            uniqueVisitsMap.get(visit.shopId).visitedAt.seconds < visit.visitedAt.seconds) {
          // Get fresh shop data to ensure latest logo
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
        .sort((a, b) => b.visitedAt.seconds - a.visitedAt.seconds);

      setRecentVisits(uniqueVisits);
    } catch (error) {
      console.error('Error loading recent visits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <Menu />
          <h1 className="text-lg font-semibold">Recent Visits</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="w-8 h-8" />
          </div>
        ) : recentVisits.length > 0 ? (
          <div className="bg-white rounded-lg shadow">
            {recentVisits.map((visit) => (
              <div 
                key={visit.shopId}
                onClick={() => window.open(`/${visit.shopUsername}`, '_blank')}
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b last:border-b-0"
              >
                <div className="flex-shrink-0">
                  {visit.shopLogo ? (
                    <img 
                      src={visit.shopLogo}
                      alt={visit.shopName}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/img/logo/applogo.png';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl text-gray-500">{visit.shopName?.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate" title={visit.shopName}>
                    {visit.shopName}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    {favoriteCounts[visit.shopId] > 0 && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Heart className="w-4 h-4 mr-1 text-red-500" />
                        {favoriteCounts[visit.shopId]} favorite foods
                      </div>
                    )}
                    {visit.visitedAt && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {getRelativeTime(visit.visitedAt.seconds * 1000)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No recent visits yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentShopsPage;