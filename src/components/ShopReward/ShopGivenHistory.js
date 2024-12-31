// UserClaiming.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { LoadingSpinner } from '../../components/ui/loading';
import { ArrowLeft, Clock, CheckCircle, XCircle, Gift } from 'lucide-react';
import Header from '../Layout/Header';
import { getShopByUsername } from '../../firebase/utils';

const ShopGivenHistory = () => {
  const { username, rewardId } = useParams();
  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shop, setShop] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadShopAndClaims();
  }, [username, rewardId]);

  // ShopGivenHistory.js
  const loadShopAndClaims = async () => {
    try {
      if (!username) {
        console.error('Username is required');
        return;
      }

      // Load shop first
      const shopData = await getShopByUsername(username);
      if (!shopData || !shopData.id) {
        console.error('Shop not found');
        navigate('/my-shops');
        return;
      }
      setShop(shopData);

      // Load all claims for this shop
      const claimsQuery = query(
        collection(db, 'claims'),
        where('shopId', '==', shopData.id),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(claimsQuery);
      setClaims(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    } catch (error) {
      console.error('Error loading claims:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <CheckCircle className="w-4 h-4" />
            <span>Completed</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full">
            <XCircle className="w-4 h-4" />
            <span>Rejected</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
            <Clock className="w-4 h-4" />
            <span>Pending</span>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="w-8 h-8" />
      </div>
    );
  }

  return (
    <>
      <Header shop={shop} pageTitle="Reward Claims" />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <button
            onClick={() => navigate(`/my-shops/${username}/rewards`)}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Rewards List
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h1 className="text-lg font-semibold">Claim Transaction History</h1>
          </div>

          <div className="divide-y">
            {claims.map(claim => (
              <div key={claim.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Gift className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{claim.rewardName}</h3>
                        {getStatusBadge(claim.status)}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Customer: {claim.customerEmail}
                      </p>
                      <p className="text-sm text-gray-500">
                        Claimed: {formatDate(claim.createdAt)}
                      </p>
                      {claim.processedAt && (
                        <p className="text-sm text-gray-500">
                          Processed: {formatDate(claim.processedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {claim.worth && (
                    <div className="text-blue-600 font-medium">
                      {claim.currencySymbol}{claim.worth}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {claims.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No claims found for this reward
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopGivenHistory;