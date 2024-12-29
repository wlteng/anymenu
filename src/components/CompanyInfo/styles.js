import React from 'react';

// Section component provides consistent styling for each major section
export const Section = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
    <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
    {children}
  </div>
);

// FormField component provides consistent layout for form inputs
export const FormField = ({ label, children, className = "", optional = false }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {optional && <span className="text-gray-400 text-sm ml-1">(Optional)</span>}
    </label>
    {children}
  </div>
);

// Common input styles for text inputs and textareas
export const inputClasses = "w-full p-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400";

// Input wrapper for icons + input combinations
export const InputWithIcon = ({ icon: Icon, children }) => (
  <div className="relative flex items-center">
    <Icon className="w-5 h-5 text-gray-400 absolute left-3" />
    <div className="flex-1 ml-10">
      {children}
    </div>
  </div>
);

// Button styles
export const buttonClasses = {
  primary: "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50",
  secondary: "px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors",
  danger: "px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
};

// File upload area component
export const FileUploadArea = ({ onUpload, children }) => (
  <label className="cursor-pointer hover:bg-gray-50 border-2 border-dashed rounded-lg flex items-center justify-center w-full h-40 transition-colors">
    <div className="text-center">
      {children}
      <input
        type="file"
        onChange={onUpload}
        accept="image/*"
        className="hidden"
      />
    </div>
  </label>
);

// Layout utilities
export const containerClasses = "max-w-3xl mx-auto px-6";
export const sectionSpacing = "space-y-4";
export const flexBetween = "flex items-center justify-between";
export const flexCenter = "flex items-center";
export const flexGap = "gap-4";

// Common image styles
export const imagePreviewClasses = "w-full h-full object-cover rounded-lg";

// Form grid layouts
export const formGridClasses = {
  twoColumns: "grid grid-cols-1 md:grid-cols-2 gap-4",
  threeColumns: "grid grid-cols-1 md:grid-cols-3 gap-4"
};

// Toast position classes for consistent positioning
export const toastPositionClasses = "fixed bottom-4 right-4";

// Helper for conditional classes
export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};