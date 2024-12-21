import React, { useState } from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Dialog, DialogContent } from '../ui/dialog';
import { shopTypes, getShopTypeIcon } from '../../data/general';
import { Check, ChevronRight } from 'lucide-react';

const ShopTypeDialog = ({ formData, setFormData }) => {
  const [selectedTypeForDetails, setSelectedTypeForDetails] = useState(null);

  const handleTypeSelect = (e, type) => {
    e.stopPropagation();
    setFormData(prev => ({ ...prev, shopType: type.value }));
  };

  const renderShopType = (type) => {
    const IconComponent = getShopTypeIcon(type.icon);
    const isSelected = formData.shopType === type.value;

    return (
      <div
        key={type.value}
        className="w-full p-4 border rounded-xl bg-white"
      >
        <div className="flex items-start justify-between">
          {/* Icon and Title */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-100 rounded-lg">
              <IconComponent className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {type.label}
              </h3>
              <button
                onClick={() => setSelectedTypeForDetails(type)}
                className="mt-1 text-sm text-blue-600 hover:text-blue-700 flex items-center"
              >
                More details
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>

          {/* Checkbox */}
          <div 
            className="p-2 cursor-pointer"
            onClick={(e) => handleTypeSelect(e, type)}
          >
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${
              isSelected 
                ? 'border-blue-500 bg-blue-500' 
                : 'border-gray-300'
            }`}>
              {isSelected && <Check className="w-4 h-4 text-white" />}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Choose Shop Type</DialogTitle>
        <DialogDescription>
          Select the type of business you want to create.
        </DialogDescription>
      </DialogHeader>

      <div className="mt-6 space-y-4">
        {shopTypes.map(renderShopType)}
      </div>

      {/* Details Dialog */}
      <Dialog open={!!selectedTypeForDetails} onOpenChange={() => setSelectedTypeForDetails(null)}>
        <DialogContent>
          <DialogHeader>
            {selectedTypeForDetails && (
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  {React.createElement(getShopTypeIcon(selectedTypeForDetails.icon), { 
                    size: 24,
                    className: "text-gray-600"
                  })}
                </div>
                <DialogTitle>
                  {selectedTypeForDetails?.label}
                </DialogTitle>
              </div>
            )}
          </DialogHeader>

          {selectedTypeForDetails && (
            <div className="space-y-6">
              <p className="text-gray-600">
                {selectedTypeForDetails.description}
              </p>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Features</h4>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  {selectedTypeForDetails.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <Check className="w-4 h-4 text-blue-500 mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setSelectedTypeForDetails(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShopTypeDialog;