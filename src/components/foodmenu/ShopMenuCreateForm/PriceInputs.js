import React from 'react';

export const PriceInputs = ({ regularPrice, promotionalPrice, onPriceChange }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Regular Price
        </label>
        <input
          type="number"
          name="price"
          value={regularPrice}
          onChange={(e) => onPriceChange('price', e.target.value)}
          step="0.01"
          className="w-full p-2 border rounded-lg"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Promotional Price
        </label>
        <input
          type="number"
          name="promotionalPrice"
          value={promotionalPrice}
          onChange={(e) => onPriceChange('promotionalPrice', e.target.value)}
          step="0.01"
          className="w-full p-2 border rounded-lg"
        />
      </div>
    </div>
  );
};

export default PriceInputs;