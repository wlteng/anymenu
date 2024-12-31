import React, { useState, useEffect } from 'react';
import { 
 Dialog, 
 DialogContent, 
 DialogTitle,
 DialogDescription 
} from '../../components/ui/dialog';
import { LoadingSpinner } from '../../components/ui/loading';
import { Clock, CheckCircle, XCircle, Gift } from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const UserClaimHistoryModal = ({ isOpen, onClose, customerEmail }) => {
  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && customerEmail) {
      loadClaims();
    }
    return () => {
      setClaims([]);
    };
  }, [isOpen, customerEmail]);

  // Replace this loadClaims function with the new one
  const loadClaims = async () => {
    try {
      if (!customerEmail) return;
      
      setIsLoading(true);
      const claimsQuery = query(
        collection(db, 'claims'),
        where('customerEmail', '==', customerEmail),
        where('status', 'in', ['pending', 'completed', 'rejected']), // Add all possible statuses
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(claimsQuery);
      const claimsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setClaims(claimsData);
    } catch (error) {
      console.error('Error loading claims:', error);
    } finally {
      setIsLoading(false);
    }
  };

 const getStatusIcon = (status) => {
   switch (status) {
     case 'completed':
       return <CheckCircle className="w-5 h-5 text-green-500" />;
     case 'rejected':
       return <XCircle className="w-5 h-5 text-red-500" />;
     default:
       return <Clock className="w-5 h-5 text-yellow-500" />;
   }
 };

 const getStatusText = (status) => {
   switch (status) {
     case 'completed':
       return 'Completed';
     case 'rejected':
       return 'Rejected';
     default:
       return 'Pending';
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
   <Dialog open={isOpen} onOpenChange={onClose}>
     <DialogContent className="p-6 overflow-hidden max-h-[80vh] overflow-y-auto">
       <div className="mb-6">
         <DialogTitle className="text-xl font-semibold">
           Claim History
         </DialogTitle>
         <DialogDescription className="sr-only">
           View claim history and status
         </DialogDescription>
       </div>

       {isLoading ? (
         <div className="flex justify-center py-8">
           <LoadingSpinner size="w-8 h-8" />
         </div>
       ) : (
         <div className="space-y-4">
           {claims.length > 0 ? (
             claims.map(claim => (
               <div 
                 key={claim.id} 
                 className="p-4 bg-gray-50 rounded-lg shadow-sm"
               >
                 <div className="flex items-start justify-between">
                   <div>
                     <div className="flex items-center gap-2 mb-2">
                       <Gift className="w-5 h-5 text-blue-600" />
                       <h3 className="font-medium">{claim.rewardName}</h3>
                     </div>
                     <p className="text-sm text-gray-500">
                       From: {claim.shopName}
                     </p>
                     <p className="text-sm text-gray-500">
                       Claimed on: {formatDate(claim.createdAt)}
                     </p>
                     {claim.processedAt && (
                       <p className="text-sm text-gray-500">
                         Processed: {formatDate(claim.processedAt)}
                       </p>
                     )}
                     {claim.worth && (
                       <p className="text-sm text-blue-600 mt-1">
                         Worth: {claim.currencySymbol}{claim.worth}
                       </p>
                     )}
                     {claim.rejectionReason && claim.status === 'rejected' && (
                       <p className="text-sm text-red-600 mt-1">
                         Reason: {claim.rejectionReason}
                       </p>
                     )}
                   </div>
                   <div className="flex items-center gap-2">
                     {getStatusIcon(claim.status)}
                     <span className={`text-sm ${
                       claim.status === 'completed' ? 'text-green-600' :
                       claim.status === 'rejected' ? 'text-red-600' :
                       'text-yellow-600'
                     }`}>
                       {getStatusText(claim.status)}
                     </span>
                   </div>
                 </div>
               </div>
             ))
           ) : (
             <div className="text-center py-8 text-gray-500">
               No claim history found
             </div>
           )}
         </div>
       )}
     </DialogContent>
   </Dialog>
 );
};

export default UserClaimHistoryModal;