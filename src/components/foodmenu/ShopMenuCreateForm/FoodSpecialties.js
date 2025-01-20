import React from 'react';
import * as Icons from 'lucide-react';

export const FoodSpecialties = ({ specialties, selectedSpecialties, onChange }) => {
  const renderSpecialtyTag = (specialty) => {
    const Icon = Icons[specialty.icon];
    const isActive = selectedSpecialties[specialty.property];

    return (
      <label 
        key={specialty.id} 
        className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50"
      >
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => onChange(specialty.property, e.target.checked)}
          className="hidden"
        />
        <div className={`p-2 rounded-full ${isActive ? specialty.bgColor : 'bg-gray-100'}`}>
          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
        </div>
        <span className="text-sm">{specialty.label}</span>
      </label>
    );
  };

  return (
    <div className="flex gap-4">
      {specialties.map(renderSpecialtyTag)}
    </div>
  );
};

export default FoodSpecialties;