import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '../../../components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { LoadingSpinner } from '../../../components/ui/loading';

const DeleteStamp = ({ isOpen, onClose, onDelete, stamp }) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>Delete Stamp</DialogTitle>
        
        <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Are you sure you want to delete this stamp?</p>
            <p className="mt-1 text-sm text-red-600">This action cannot be undone.</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700"
          >
            {isLoading && <LoadingSpinner size="w-4 h-4" />}
            Delete Stamp
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteStamp;