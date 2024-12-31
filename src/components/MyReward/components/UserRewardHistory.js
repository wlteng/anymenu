import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Gift, Calendar, ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from '../../../components/ui/loading';
import { useToast } from '../../../contexts/ToastContext';

const UserRewardHistory = ({ onBack }) => {
  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const auth = getAuth();
  const { showToast } = useToast();

  useEffect(() => {
    loadClaimHistory();
  }, []);

  const loadClaimHistory = async () => {
    try {
      setIsLoading(true);
      const claimsQuery = query(
        collection(db, 'claims'),
        where('customerEmail', '==', auth.currentUser.email),
        where('status', 'in', ['approved', 'completed']), // Include both approved and completed status
        orderBy('createdAt', 'desc')
      );

      const claimsSnapshot = await getDocs(claimsQuery);
      const claimsData = claimsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setClaims(claimsData);
    } catch (error) {
      console.error('Error loading claim history:', error);
      showToast({
        title: 'Error',
        description: 'Failed to load reward history',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.seconds ? 
      new Date(timestamp.seconds * 1000) : 
      new Date(timestamp);

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-30 bg-white border-b">
        <div className="flex items-center px-4 py-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-lg font-semibold ml-4">Reward History</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="w-8 h-8" />
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {claims.length > 0 ? (
              claims.map(claim => (
                <div key={claim.id} className="bg-white rounded-xl shadow p-4">
                  {/* Shop Info */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={claim.shopLogo || '/img/sample/logo-square.jpg'} 
                        alt={claim.shopName}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/img/logo/applogo.png';
                        }}
                      />
                      <div>
                        <h3 className="font-semibold">{claim.shopName}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Gift className="w-4 h-4" />
                          <span>{claim.rewardName}</span>
                          {claim.worth && (
                            <span className="flex items-center gap-1 text-blue-600">
                              ({claim.currencySymbol}{claim.worth})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Redeemed
                    </div>
                  </div>

                  {/* Claim & Redemption Dates */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Claimed on {formatDate(claim.createdAt)}</span>
                    {claim.processedAt && (
                      <>
                        <span className="mx-2">•</span>
                        <span>Processed on {formatDate(claim.processedAt)}</span>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow">
                <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No redeemed rewards yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRewardHistory;