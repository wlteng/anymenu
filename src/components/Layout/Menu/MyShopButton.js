import React from 'react';
import { Store, ChevronRight } from 'lucide-react';

const MyShopButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Store className="w-5 h-5" />
        <span className="font-medium">My Shops</span>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </button>
  );
};

export default MyShopButton;