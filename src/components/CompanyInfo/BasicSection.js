import React from 'react';
import { Section, FormField, inputClasses } from './styles';
import { Phone } from 'lucide-react';

const BasicSection = ({ formData, handleChange }) => (
  <Section title="Basic Information">
    <div className="space-y-4">
      <FormField label="Company Description">
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className={inputClasses}
          placeholder="Describe your company..."
        />
      </FormField>

      <FormField label="WhatsApp Number">
        <div className="flex items-center">
          <Phone className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
          <input
            type="tel"
            name="whatsappNumber"
            value={formData.whatsappNumber}
            onChange={handleChange}
            className={inputClasses}
            placeholder="60125448277"
          />
        </div>
      </FormField>

      <FormField label="Keywords (comma separated)">
        <input
          type="text"
          name="keywords"
          value={formData.keywords}
          onChange={handleChange}
          className={inputClasses}
          placeholder="restaurant, food, cuisine"
        />
      </FormField>
    </div>
  </Section>
);

export default BasicSection;