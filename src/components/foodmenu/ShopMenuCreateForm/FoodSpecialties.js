// FoodSpecialties.js
import React from 'react';
import * as Icons from 'lucide-react';

export const FoodSpecialties = ({ specialties, selectedSpecialties, allergyNote: externalAllergyNote, onChange }) => {
  const handleSpecialtyClick = (specialty, checked) => {
    onChange(specialty.property, checked);
    if (specialty.id === 'allergy' && !checked) {
      onChange('allergyNote', '');
    }
  };

  const handleNoteChange = (e) => {
    onChange('allergyNote', e.target.value);
  };

  const getBorderColorClass = (specialty, isActive) => {
    if (!isActive) return 'border-gray-200';
    switch(specialty.id) {
      case 'chefRecommended': return 'border-yellow-500';
      case 'spicy': return 'border-red-500';
      case 'popular': return 'border-purple-500';
      case 'allergy': return 'border-blue-500';
      default: return 'border-gray-200';
    }
  };

  const renderSpecialtyTag = (specialty) => {
    const Icon = Icons[specialty.icon];
    const isActive = selectedSpecialties[specialty.property];

    return (
      <div key={specialty.id} className="flex flex-col">
        <label 
          className={`
            inline-flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50
            ${getBorderColorClass(specialty, isActive)}
            transition-colors duration-200
          `}
        >
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => handleSpecialtyClick(specialty, e.target.checked)}
            className="hidden"
          />
          <div className={`p-2 rounded-full ${isActive ? specialty.bgColor : 'bg-gray-100'}`}>
            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
          </div>
          <span className="text-sm whitespace-nowrap">{specialty.label}</span>
        </label>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {specialties.map(specialty => renderSpecialtyTag(specialty))}
      </div>
      
      {/* Allergy Note Field */}
      {selectedSpecialties.hasAllergens && (
        <div className="w-full space-y-2 mt-2">
          <div className="text-sm text-gray-600">
            Please list any allergens present in this dish (e.g., nuts, dairy, shellfish)
          </div>
          <input
            type="text"
            value={externalAllergyNote || ''}
            onChange={handleNoteChange}
            placeholder="Enter allergy details..."
            className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}
    </div>
  );
};

export default FoodSpecialties;