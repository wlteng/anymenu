import React from 'react';
import { Upload, X } from 'lucide-react';

export const ImageUpload = ({ imagePreview, onImageChange, onImageRemove }) => {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const processFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(file, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  return (
    <div className="flex justify-center">
      {imagePreview ? (
        <div className="relative">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-[200px] h-[200px] object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={onImageRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="relative cursor-pointer group"
        >
          <label className="cursor-pointer hover:bg-gray-50 border-2 border-dashed rounded-lg flex flex-col items-center justify-center w-[200px] h-[200px] transition-colors group-hover:border-blue-500">
            <div className="text-center p-4">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-blue-500" />
              <span className="text-sm text-gray-500 group-hover:text-blue-500">
                Drag & drop image here
              </span>
              <span className="text-xs text-gray-400 block mt-1">
                or click to browse
              </span>
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </label>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;