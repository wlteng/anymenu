import React from 'react';

const CreateMenuButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 transition-colors"
    >
      Create Free Menu
    </button>
  );
};

export default CreateMenuButton;