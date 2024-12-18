import React from 'react';
import { Upload, X, Type } from 'lucide-react';

const LogoUpload = ({ 
  label, 
  preview, 
  onPreviewRemove, 
  onUpload, 
  fullWidth = false,
  showTextOption = false,
  useTextLogo = false,
  textLogo = '',
  onTextLogoChange,
  onUseTextLogoChange
}) => {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-4">
        {label}
      </label>
      <div className="flex items-center">
        {preview ? (
          <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
            <img
              src={preview}
              alt={`${label} Preview`}
              className={`${fullWidth ? 'w-full h-32 object-contain' : 'w-32 h-32 object-cover'} rounded-lg border bg-white`}
            />
            <button
              type="button"
              onClick={onPreviewRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className={`cursor-pointer hover:bg-gray-50 border-2 border-dashed rounded-lg p-4 ${fullWidth ? 'w-full' : 'w-32'} h-32 flex flex-col items-center justify-center`}>
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Upload Image</span>
            <input
              type="file"
              onChange={onUpload}
              accept="image/*"
              className="hidden"
            />
          </label>
        )}
      </div>

      {showTextOption && (
        <>
          <div className="flex items-center gap-4 mt-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={!useTextLogo}
                onChange={() => onUseTextLogoChange(false)}
                name="logoStyle"
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>Use Header Logo</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={useTextLogo}
                onChange={() => onUseTextLogoChange(true)}
                name="logoStyle"
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>Use Text Logo</span>
            </label>
          </div>

          {useTextLogo && (
            <div className="mt-4">
              
              <div className="flex items-center gap-2">
                <Type className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={textLogo}
                  onChange={(e) => onTextLogoChange(e.target.value)}
                  className="flex-1 h-12 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter text to display"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LogoUpload;