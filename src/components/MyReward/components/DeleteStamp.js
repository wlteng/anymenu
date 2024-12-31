import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '../../../components/ui/dialog';
import { Gift, Calendar } from 'lucide-react';
import { LoadingSpinner } from '../../../components/ui/loading';

const DeleteStamp = ({ isOpen, onClose, onDelete, stamp, shop }) => {
 const [isLoading, setIsLoading] = React.useState(false);

 const handleDelete = async () => {
   try {
     setIsLoading(true);
     await onDelete(stamp.id);
     onClose();
   } catch (error) {
     console.error('Error deleting stamp:', error);
   } finally {
     setIsLoading(false);
   }
 };

 if (!stamp) return null;

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
     <DialogContent className="p-0 overflow-hidden">
       {/* Header */}
       <div className="p-6 pb-4">
         <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-red-600">
           
           Delete Stamp
         </DialogTitle>
       </div>
       
       {/* Stamp Details */}
       <div className="px-6 py-4 bg-gray-50 space-y-3">
         <div className="flex items-center gap-2 text-sm">
           <Gift className="w-4 h-4 text-gray-500" />
           <span className="text-gray-700">Reward: {shop?.reward}</span>
         </div>
         <div className="flex items-center gap-2 text-sm">
           <Calendar className="w-4 h-4 text-gray-500" />
           <span className="text-gray-700">Collected on: {formatDate(stamp.timestamp)}</span>
         </div>
       </div>

       {/* Warning Message */}
       <div className="p-6 space-y-4">
         <div className="p-4 bg-red-50 text-red-800 rounded-lg flex items-start gap-3">
           <div>
             <p className="font-medium">Are you sure you want to delete this stamp?</p>
             <p className="mt-1 text-sm text-red-600">This action cannot be undone.</p>
           </div>
         </div>

         <div className="flex justify-end gap-3">
           <button
             type="button"
             onClick={onClose}
             className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
             disabled={isLoading}
           >
             Cancel
           </button>
           <button
             type="button"
             onClick={handleDelete}
             disabled={isLoading}
             className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors disabled:opacity-50"
           >
             {isLoading && <LoadingSpinner size="w-4 h-4" />}
             Delete Stamp
           </button>
         </div>
       </div>
     </DialogContent>
   </Dialog>
 );
};

export default DeleteStamp;