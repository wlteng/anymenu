import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import MyRewardCard from './components/MyRewardCard';
import UserQR from './components/UserQr';
import PendingRewardCard from './components/PendingRewardCard';
import { LoadingSpinner } from '../../components/ui/loading';
import { getAuth } from 'firebase/auth';
import { useToast } from '../../contexts/ToastContext';

const MyReward = () => {
  const [shops, setShops] = useState([]);
  const [pendingClaims, setPendingClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const auth = getAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (auth.currentUser?.email) {
      loadUserRewards();
      loadPendingClaims();
    }
  }, [auth.currentUser]);

  const loadPendingClaims = async () => {
    try {
      const claimsQuery = query(
        collection(db, 'claims'),
        where('customerEmail', '==', auth.currentUser.email),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );

      const claimsSnapshot = await getDocs(claimsQuery);
      const claimsData = claimsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setPendingClaims(claimsData);
    } catch (error) {
      console.error('Error loading pending claims:', error);
    }
  };

  const loadUserRewards = async () => {
    try {
      setIsLoading(true);
      
      // Query active stamps for current user
      const stampsQuery = query(
        collection(db, 'stamps'),
        where('email', '==', auth.currentUser.email),
        where('status', '==', 'active'),
        orderBy('timestamp', 'desc')
      );
      
      const stampsSnapshot = await getDocs(stampsQuery);
      
      // Group stamps by shopId and rewardId
      const shopRewardGroups = new Map();
      
      for (const stampDoc of stampsSnapshot.docs) {
        const stamp = { id: stampDoc.id, ...stampDoc.data() };
        const key = `${stamp.shopId}_${stamp.rewardId}`;
        
        if (!shopRewardGroups.has(key)) {
          shopRewardGroups.set(key, {
            shopId: stamp.shopId,
            rewardId: stamp.rewardId,
            stamps: []
          });
        }
        
        shopRewardGroups.get(key).stamps.push(stamp);
      }

      // Fetch shop and reward data for each group
      const shopsData = [];
      
      for (const [_, group] of shopRewardGroups) {
        try {
          const [shopDoc, rewardDoc] = await Promise.all([
            getDoc(doc(db, 'shops', group.shopId)),
            getDoc(doc(db, 'rewards', group.rewardId))
          ]);

          if (!shopDoc.exists() || !rewardDoc.exists()) continue;

          const shopData = shopDoc.data();
          const rewardData = rewardDoc.data();

          if (rewardData.isActive) {
            shopsData.push({
              id: group.shopId,
              rewardId: group.rewardId,
              name: shopData.name,
              username: shopData.username,
              logo: shopData.squareLogo,
              stampsRequired: rewardData.stampsRequired,
              reward: rewardData.name,
              rewardWorth: rewardData.rewardWorth,
              currencyCode: rewardData.currencyCode || shopData.currencyCode,
              currencySymbol: rewardData.currencySymbol || shopData.currencySymbol,
              language: rewardData.language || shopData.language,
              country: rewardData.country || shopData.country,
              isLifetimeReward: rewardData.isLifetimeReward,
              howToEarn: rewardData.howToEarn,
              expiryDays: rewardData.expiryDays,
              stamps: group.stamps.map(stamp => ({
                ...stamp,
                currencyCode: rewardData.currencyCode || shopData.currencyCode,
                currencySymbol: rewardData.currencySymbol || shopData.currencySymbol
              }))
            });
          }
        } catch (error) {
          console.error('Error fetching shop/reward details:', error);
        }
      }

      // Sort by most recent stamp
      shopsData.sort((a, b) => {
        const aLatest = Math.max(...a.stamps.map(s => s.timestamp?.seconds || 0));
        const bLatest = Math.max(...b.stamps.map(s => s.timestamp?.seconds || 0));
        return bLatest - aLatest;
      });

      setShops(shopsData);
    } catch (error) {
      console.error('Error loading rewards:', error);
      showToast({
        title: 'Error',
        description: 'Failed to load your rewards',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
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
    <div className="max-w-3xl mx-auto">
      <div className="p-4 space-y-6">
        <UserQR />

        {/* Pending Claims Section */}
        {pendingClaims.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Pending Rewards</h3>
            {pendingClaims.map(claim => (
              <PendingRewardCard 
                key={claim.id} 
                claim={claim} 
              />
            ))}
          </div>
        )}

        {/* Rewards List */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Your Reward Cards</h3>
          {shops.length > 0 ? (
            shops.map(shop => (
              <MyRewardCard 
                key={`${shop.id}_${shop.rewardId}`}
                shop={shop}
                onUpdate={loadUserRewards}
              />
            ))
          ) : (
            <div className="text-center py-8 bg-white rounded-xl shadow">
              <p className="text-gray-500">
                You haven't collected any stamps yet.
                Visit your favorite shops to start earning rewards!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyReward;