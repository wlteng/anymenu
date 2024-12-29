import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { LoadingSpinner } from '../ui/loading';
import { Search } from 'lucide-react';
import { getShopByUsername } from '../../firebase/utils';
import Header from '../Layout/Header';

const CustomerList = () => {
  const { username, rewardId } = useParams();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [shop, setShop] = useState(null);

  useEffect(() => {
    loadShopAndCustomers();
  }, [username, rewardId]);

  const loadShopAndCustomers = async () => {
    try {
      setIsLoading(true);
      // Load shop first
      const shopData = await getShopByUsername(username);
      if (!shopData) {
        navigate('/my-shops');
        return;
      }
      setShop(shopData);

      // Now load customers
      const stampsQuery = query(
        collection(db, 'stamps'),
        where('shopId', '==', shopData.id),
        where('rewardId', '==', rewardId),
        orderBy('timestamp', 'desc')
      );
      const stampsSnapshot = await getDocs(stampsQuery);

      // Group stamps by user
      const customerMap = new Map();
      
      for (const doc of stampsSnapshot.docs) {
        const stamp = doc.data();
        const userId = stamp.userId;

        if (!customerMap.has(userId)) {
          // Get user details from users collection
          const userDoc = await getDocs(
            query(collection(db, 'users'), where('uid', '==', userId))
          );
          const userData = userDoc.docs[0]?.data() || {};

          customerMap.set(userId, {
            userId,
            name: userData.name || 'Unknown User',
            email: userData.email || '',
            photoURL: userData.photoURL || '',
            stamps: []
          });
        }

        customerMap.get(userId).stamps.push({
          id: doc.id,
          ...stamp
        });
      }

      setCustomers(Array.from(customerMap.values()));
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customers..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="divide-y">
        {filteredCustomers.map(customer => (
          <div key={customer.userId} className="p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {customer.photoURL ? (
                  <img 
                    src={customer.photoURL}
                    alt={customer.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-lg text-gray-600">
                      {customer.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{customer.name}</h3>
                  <p className="text-sm text-gray-500">{customer.email}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-medium text-blue-600">
                  {customer.stamps.length} stamps
                </div>
                <div className="text-sm text-gray-500">
                  Last visit: {new Date(customer.stamps[0]?.timestamp?.seconds * 1000).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {filteredCustomers.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No customers found
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerList;