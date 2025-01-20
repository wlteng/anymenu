import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export const VariantPrice = ({ variants, onChange }) => {
  const addVariant = () => {
    onChange([
      ...variants,
      { id: Date.now(), label: '', price: '', promotionalPrice: '' }
    ]);
  };

  const removeVariant = (variantId) => {
    onChange(variants.filter(v => v.id !== variantId));
  };

  const updateVariant = (variantId, field, value) => {
    onChange(
      variants.map(variant => 
        variant.id === variantId 
          ? { ...variant, [field]: value }
          : variant
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Price Variants
        </label>
        <button
          type="button"
          onClick={addVariant}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
        >
          <Plus className="w-4 h-4" />
          Add Variant
        </button>
      </div>

      {variants.length === 0 ? (
        <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
          No variants added
        </div>
      ) : (
        <div className="space-y-3">
          {variants.map((variant) => (
            <div 
              key={variant.id} 
              className="p-4 border rounded-lg space-y-3 bg-gray-50"
            >
              {/* Variant Label */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Variant Label
                </label>
                <input
                  type="text"
                  value={variant.label}
                  onChange={(e) => updateVariant(variant.id, 'label', e.target.value)}
                  placeholder="e.g., Small, Medium, Large"
                  className="w-full p-2 border rounded-lg bg-white"
                  required
                />
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Regular Price
                  </label>
                  <input
                    type="number"
                    value={variant.price}
                    onChange={(e) => updateVariant(variant.id, 'price', e.target.value)}
                    step="0.01"
                    className="w-full p-2 border rounded-lg bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Promotional Price
                  </label>
                  <input
                    type="number"
                    value={variant.promotionalPrice}
                    onChange={(e) => updateVariant(variant.id, 'promotionalPrice', e.target.value)}
                    step="0.01"
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Remove Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => removeVariant(variant.id)}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VariantPrice;