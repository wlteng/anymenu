import React from 'react';
import { Section, FormField, inputClasses } from './styles';
import { Upload, X } from 'lucide-react';

const SocialPreviewSection = ({ formData, handleChange, handleOGImageChange, setFormData }) => (
  <Section title="Social Media Preview">
    <div className="space-y-4">
      <FormField label="Open Graph Title">
        <input
          type="text"
          name="ogTitle"
          value={formData.ogTitle}
          onChange={handleChange}
          className={inputClasses}
          placeholder="Title for social media sharing"
        />
      </FormField>

      <FormField label="Open Graph Description">
        <textarea
          name="ogDescription"
          value={formData.ogDescription}
          onChange={handleChange}
          rows={3}
          className={inputClasses}
          placeholder="Description for social media sharing"
        />
      </FormField>

      <FormField label="Open Graph Image">
        <div className="flex justify-center">
          {formData.ogImagePreview ? (
            <div className="relative">
              <img
                src={formData.ogImagePreview}
                alt="Preview"
                className="w-[300px] object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  ogImageFile: null,
                  ogImagePreview: null,
                  ogImage: null
                }))}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="cursor-pointer hover:bg-gray-50 border-2 border-dashed rounded-lg flex items-center justify-center w-[300px] h-[150px]">
              <div className="text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                <span className="text-sm text-gray-500 mt-2 block">Upload Image</span>
                <input
                  type="file"
                  onChange={handleOGImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </label>
          )}
        </div>
      </FormField>
    </div>
  </Section>
);

export default SocialPreviewSection;