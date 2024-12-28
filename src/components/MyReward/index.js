import React from 'react';
import RewardShopCard from './components/RewardShopCard';
import UserQR from './components/UserQr';

const MyReward = ({ userId }) => {
  // Sample shops data with various stamp states
  const sampleShops = [
    {
      id: 1,
      name: "Joe's Fish & Chips",
      logo: '/img/sample/logo-square.jpg',
      stampsRequired: 10,
      reward: "Free Fish & Chips",
      stamps: [
        {
          id: 's1',
          shopId: 1,
          userId: 'user1',
          timestamp: new Date('2024-02-01').getTime(),
          expiryDate: new Date('2025-08-01').getTime(), // Normal stamp
          fromUserId: 'shop1',
          isTransferred: false
        },
        {
          id: 's2',
          shopId: 1,
          userId: 'user1',
          timestamp: new Date('2023-11-15').getTime(),
          expiryDate: new Date('2024-05-15').getTime(), // Warning - 3 months to expire
          fromUserId: 'user2',
          isTransferred: true
        },
        {
          id: 's3',
          shopId: 1,
          userId: 'user1',
          timestamp: new Date('2023-12-20').getTime(),
          expiryDate: new Date('2024-03-20').getTime(), // Red - 1 month to expire
          fromUserId: 'user3',
          isTransferred: false
        },
        {
          id: 's4',
          shopId: 1,
          userId: 'user1',
          timestamp: new Date('2024-01-25').getTime(),
          expiryDate: new Date('2025-01-25').getTime(), // Normal
          fromUserId: 'shop1',
          isTransferred: false
        }
      ]
    },
    {
      id: 2,
      name: "Premium Coffee Club",
      logo: '/img/sample/logo-square.jpg',
      stampsRequired: 10,
      reward: "Free Premium Coffee Set",
      isLifetimeReward: true, // Special flag for never-expiring stamps
      stamps: Array(6).fill(null).map((_, index) => ({
        id: `gold-${index}`,
        shopId: 2,
        userId: 'user1',
        timestamp: new Date('2024-01-01').getTime(),
        expiryDate: null, // No expiry for gold stamps
        fromUserId: 'shop2',
        isTransferred: false,
        isGold: true
      }))
    }
  ];

  return (
    <div className="space-y-6">
      <UserQR userId={userId} />

      {/* Rewards List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold px-1">Your Reward Cards</h3>
        {sampleShops.map(shop => (
          <RewardShopCard 
            key={shop.id}
            shop={shop}
          />
        ))}
      </div>
    </div>
  );
};

export default MyReward;