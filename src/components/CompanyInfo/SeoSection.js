import React from 'react';
import { Section, FormField, inputClasses } from './styles';

const SeoSection = ({ formData, handleChange }) => (
  <Section title="SEO Information">
    <div className="space-y-4">
      <FormField label="SEO Title">
        <input
          type="text"
          name="seoTitle"
          value={formData.seoTitle}
          onChange={handleChange}
          className={inputClasses}
          placeholder="SEO optimized title"
        />
      </FormField>

      <FormField label="SEO Description">
        <textarea
          name="seoDescription"
          value={formData.seoDescription}
          onChange={handleChange}
          rows={3}
          className={inputClasses}
          placeholder="SEO meta description"
        />
      </FormField>
    </div>
  </Section>
);

export default SeoSection;