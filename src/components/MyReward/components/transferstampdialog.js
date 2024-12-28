import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../../../components/ui/dialog';
import { LoadingSpinner } from '../../../components/ui/loading';
import { Mail, Calendar, Store, AlertTriangle } from 'lucide-react';

const TransferStampDialog = ({ isOpen, onClose, onTransfer, stamp }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic email validation
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await onTransfer(stamp.id, email);
      onClose();
    } catch (error) {
      setError('Failed to transfer stamp. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!stamp) return null;

  const daysUntilExpiry = Math.ceil(
    (stamp.expiryDate - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const isExpiringSoon = daysUntilExpiry <= 60 && daysUntilExpiry > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Transfer Stamp</DialogTitle>
        
        {/* Stamp Details */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Store className="w-4 h-4" />
            <span>Collected from: {stamp.shopName}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Collected on: {new Date(stamp.timestamp).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Expires on: {new Date(stamp.expiryDate).toLocaleDateString()}</span>
          </div>

          {isExpiringSoon && (
            <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
              <AlertTriangle className="w-4 h-4" />
              <span>This stamp will expire in {daysUntilExpiry} days</span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-4">
            Enter the email address of the person you want to transfer this stamp to.
            Once transferred, you won't be able to use this stamp anymore.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="recipient@example.com"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </p>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !email}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading && <LoadingSpinner />}
                Transfer Stamp
              </button>
            </div>
          </form>
        </div>

        <div className="mt-4 text-xs text-gray-400">
          Note: The recipient will receive an email notification and will need to have an account to claim the stamp.
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransferStampDialog;