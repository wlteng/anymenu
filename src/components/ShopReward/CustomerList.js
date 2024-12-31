import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  updateDoc,
  doc, 
  serverTimestamp,
  getDoc 
} from 'firebase/firestore';
import { LoadingSpinner } from '../ui/loading';
import { Search, ArrowLeft } from 'lucide-react';
import { getShopByUsername } from '../../firebase/utils';
import Header from '../Layout/Header';
import UserClaimHistoryModal from './UserClaimHistoryModal';
import { useToast } from '../../contexts/ToastContext';

const CustomerList = () => {
  const { username, rewardId } = useParams();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [shop, setShop] = useState(null);
  const [showClaimHistory, setShowClaimHistory] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    const loadShopAndCustomers = async () => {
      try {
        setIsLoading(true);
        // Load shop data
        const shopData = await getShopByUsername(username);
        if (!shopData) {
          navigate('/my-shops');
          return;
        }
        setShop(shopData);

        // First get the reward details to verify shopId
        const rewardDoc = await getDoc(doc(db, 'rewards', rewardId));
        if (!rewardDoc.exists()) {
          throw new Error('Reward not found');
        }
        const rewardData = rewardDoc.data();

        // Load all stamps for this reward with shopId filter
        const stampsQuery = query(
          collection(db, 'stamps'),
          where('shopId', '==', shopData.id),
          where('rewardId', '==', rewardId),
          where('status', 'in', ['active', 'used']),
          orderBy('timestamp', 'desc')
        );
        const stampsSnapshot = await getDocs(stampsQuery);

        // Group stamps by user email
        const customerMap = new Map();
        
        for (const doc of stampsSnapshot.docs) {
          const stamp = doc.data();
          const email = stamp.email;

          if (!customerMap.has(email)) {
            // Get claims for this user with exactly 2 required filters per security rules
            const claimsQuery = query(
              collection(db, 'claims'),
              where('status', '==', 'pending'),  // Single status filter
              where('rewardId', '==', rewardId),
              where('shopId', '==', shopData.id)
            );
            const claimsSnapshot = await getDocs(claimsQuery);
            const customerClaims = claimsSnapshot.docs
              .map(doc => ({
                id: doc.id,
                ...doc.data()
              }))
              .filter(claim => claim.customerEmail === email);

            customerMap.set(email, {
              email,
              name: email.split('@')[0],
              photoURL: '',
              stamps: [],
              claims: customerClaims
            });
          }

          customerMap.get(email).stamps.push({
            id: doc.id,
            ...stamp
          });
        }

        setCustomers(Array.from(customerMap.values()));

        // Load pending claims with required filters
        const pendingClaimsQuery = query(
          collection(db, 'claims'),
          where('status', '==', 'pending'),
          where('rewardId', '==', rewardId),
          where('shopId', '==', shopData.id)
        );
        
        const pendingClaimsSnapshot = await getDocs(pendingClaimsQuery);
        setClaims(pendingClaimsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));

      } catch (error) {
        console.error('Error loading data:', error);
        showToast({
          title: 'Error',
          description: 'Failed to load customer data',
          type: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadShopAndCustomers();
  }, [username, rewardId]);

  const handleClaim = async (claimId, newStatus) => {
    try {
      // Get the claim data first
      const claimDoc = await getDoc(doc(db, 'claims', claimId));
      const claimData = claimDoc.data();

      if (!claimData) {
        throw new Error('Claim not found');
      }

      // Update claim status
      await updateDoc(doc(db, 'claims', claimId), {
        status: newStatus,
        processedAt: serverTimestamp()
      });

      // If approved, update stamps status to 'used'
      if (newStatus === 'completed' && claimData.stamps) {
        await Promise.all(
          claimData.stamps.map(stamp => 
            updateDoc(doc(db, 'stamps', stamp.id), {
              status: 'used',
              usedAt: serverTimestamp()
            })
          )
        );
      }
      
      showToast({
        title: 'Success',
        description: `Claim ${newStatus === 'completed' ? 'approved' : 'rejected'} successfully`,
        type: 'success'
      });

      // Refresh data
      const updatedClaims = claims.filter(claim => claim.id !== claimId);
      setClaims(updatedClaims);
      
    } catch (error) {
      console.error('Error updating claim:', error);
      showToast({
        title: 'Error',
        description: 'Failed to update claim status',
        type: 'error'
      });
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
    <div>
      <Header shop={shop} pageTitle="Customer List" />
      
      <div className="p-4 border-b">
        <button
          onClick={() => navigate(`/my-shops/${username}/rewards`)}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Rewards
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Pending Claims Section */}
        {claims.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Pending Claims</h3>
            <div className="space-y-3">
              {claims.map(claim => (
                <div key={claim.id} className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{claim.rewardName}</p>
                      <p className="text-sm text-gray-600">
                        Customer: {claim.customerEmail}
                      </p>
                      <p className="text-sm text-gray-600">
                        Claimed on: {formatDate(claim.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleClaim(claim.id, 'completed')}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleClaim(claim.id, 'rejected')}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer List */}
        <div className="bg-white rounded-lg shadow">
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

          <div className="divide-y">
            {filteredCustomers.map(customer => (
              <div key={customer.email} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-lg text-gray-600">
                        {customer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
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
                      Last visit: {formatDate(customer.stamps[0]?.timestamp)}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setShowClaimHistory(true);
                      }}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Claim History
                    </button>
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
      </div>

      <UserClaimHistoryModal
        isOpen={showClaimHistory}
        onClose={() => {
          setShowClaimHistory(false);
          setSelectedCustomer(null);
        }}
        customerEmail={selectedCustomer?.email}
      />
    </div>
  );
};

export default CustomerList;