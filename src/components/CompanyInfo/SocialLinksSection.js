import React from 'react';
import { Section, FormField, inputClasses } from './styles';
import { Globe, Facebook, Twitter, Instagram } from 'lucide-react';

const SocialLink = ({ icon: Icon, name, value, onChange, placeholder }) => (
  <div className="flex items-center">
    <Icon className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
    <input
      type="url"
      name={name}
      value={value}
      onChange={onChange}
      className={inputClasses}
      placeholder={placeholder}
    />
  </div>
);

const SocialLinksSection = ({ formData, handleChange }) => (
  <Section title="Social Media & Website Links">
    <div className="space-y-4">
      <SocialLink
        icon={Globe}
        name="websiteUrl"
        value={formData.websiteUrl}
        onChange={handleChange}
        placeholder="Website URL"
      />
      
      <SocialLink
        icon={Facebook}
        name="facebookUrl"
        value={formData.facebookUrl}
        onChange={handleChange}
        placeholder="Facebook URL"
      />

      <SocialLink
        icon={Twitter}
        name="twitterUrl"
        value={formData.twitterUrl}
        onChange={handleChange}
        placeholder="Twitter URL"
      />

      <SocialLink
        icon={Instagram}
        name="instagramUrl"
        value={formData.instagramUrl}
        onChange={handleChange}
        placeholder="Instagram URL"
      />
    </div>
  </Section>
);

export default SocialLinksSection;