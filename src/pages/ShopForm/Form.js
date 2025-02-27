import React from 'react';
import { Check, X } from 'lucide-react';
import { LoadingSpinner } from '../../components/ui/loading';
import { availableCategories, currencyList, shopTypes } from '../../data/general';
import LogoUpload from './LogoUpload';

const templates = [
  { id: 'template1', name: '1 Column', description: 'Classic single column design' },
  { id: 'template2', name: '2 Column', description: 'Medium size images (5 columns on desktop)' },
  { id: 'template3', name: '3 Column', description: 'Small size images (8 columns on desktop)' }
];

const Form = ({
  formData,
  setFormData,
  usernameStatus,
  handleUsernameChange,
  handleLogoChange,
  handleSave,
  isLoading,
  onCancel
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedData = {
      ...formData,
      showItemCodes: formData.showItemCodes ?? false,
      textLogo: formData.textLogo || '',
      useTextLogo: formData.useTextLogo || false,
      defaultTemplate: formData.defaultTemplate || 'template1',
      categories: formData.categories || [],
      shopType: formData.shopType || 'Restaurant',
    };

    handleSave(e, updatedData);
  };

  const handleCountryChange = (selectedCurrencyCode) => {
    const selectedCurrency = currencyList.find(c => c.code === selectedCurrencyCode);
    if (selectedCurrency) {
      setFormData(prev => ({
        ...prev,
        currencyCode: selectedCurrency.code,
        currencySymbol: selectedCurrency.symbol,
        language: selectedCurrency.language,
        country: selectedCurrency.country
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* App Logo (Square) */}
      <LogoUpload
        label="App Logo"
        preview={formData.squareLogoPreview}
        onPreviewRemove={() => setFormData(prev => ({
          ...prev,
          squareLogoFile: null,
          squareLogoPreview: null
        }))}
        onUpload={handleLogoChange('square')}
      />

      {/* Header Logo (Rectangle) */}
      <LogoUpload
        label="Header Logo"
        preview={formData.rectangleLogoPreview}
        onPreviewRemove={() => setFormData(prev => ({
          ...prev,
          rectangleLogoFile: null,
          rectangleLogoPreview: null
        }))}
        onUpload={handleLogoChange('rectangle')}
        fullWidth
        showTextOption={true}
        useTextLogo={formData.useTextLogo}
        textLogo={formData.textLogo}
        onTextLogoChange={(value) => setFormData(prev => ({ ...prev, textLogo: value }))}
        onUseTextLogoChange={(value) => setFormData(prev => ({ ...prev, useTextLogo: value }))}
      />

      {/* Basic Information */}
      <div>
        {/* Shop Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shop Type
          </label>
          <div className="relative">
            <select
              value={formData.shopType || 'Restaurant'}
              onChange={(e) => setFormData(prev => ({ ...prev, shopType: e.target.value }))}
              className="w-full h-12 px-4 pr-10 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
              required
            >
              {shopTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Shop Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shop Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        {/* Username */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <div className="relative">
            <div className="flex h-12">
              <span className="inline-flex items-center px-4 rounded-l-lg border border-gray-300 bg-gray-50 text-gray-500 text-sm whitespace-nowrap">
                anymenu.info/
              </span>
              <input
                type="text"
                value={formData.username}
                onChange={handleUsernameChange}
                className={`flex-1 min-w-0 px-4 rounded-r-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                  usernameStatus.message 
                    ? usernameStatus.isAvailable 
                      ? 'border-green-500' 
                      : 'border-red-500'
                    : ''
                }`}
                required
              />
            </div>
            {usernameStatus.isChecking ? (
              <LoadingSpinner className="absolute right-3 top-1/2 -translate-y-1/2" />
            ) : usernameStatus.message && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameStatus.isAvailable ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
              </div>
            )}
          </div>
          {usernameStatus.message && (
            <p className={`mt-1 text-sm ${
              usernameStatus.isAvailable ? 'text-green-600' : 'text-red-600'
            }`}>
              {usernameStatus.message}
            </p>
          )}
        </div>

        {/* Currency Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency & Country
          </label>
          <div className="relative">
            <select
              value={formData.currencyCode}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full h-12 px-4 pr-10 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
            >
              {currencyList.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.country} ({currency.symbol} {currency.code})
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Categories
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availableCategories.map(category => (
              <button
                type="button"
                key={category.value}
                onClick={() => {
                  const newCategories = formData.categories?.includes(category.value)
                    ? formData.categories.filter(c => c !== category.value)
                    : [...(formData.categories || []), category.value];
                  setFormData(prev => ({ ...prev, categories: newCategories }));
                }}
                className={`p-3 border rounded-lg text-left transition-colors hover:bg-gray-50 ${
                  formData.categories?.includes(category.value) 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Menu Settings</h3>
        
        {/* Item Code Toggle */}
        <div className="mb-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.showItemCodes ?? false}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                showItemCodes: e.target.checked 
              }))}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Show item codes in menu</span>
          </label>
        </div>

        {/* Default Menu Template */}
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Default Menu Template
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template) => (
            <label
              key={template.id}
              className={`relative flex flex-col p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                formData.defaultTemplate === template.id ? 'border-blue-500 bg-blue-50' : ''
              }`}
            >
              <input
                type="radio"
                name="template"
                value={template.id}
                checked={formData.defaultTemplate === template.id}
                onChange={(e) => setFormData(prev => ({ ...prev, defaultTemplate: e.target.value }))}
                className="hidden"
              />
              <span className="font-medium">{template.name}</span>
              <span className="text-sm text-gray-500">{template.description}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !usernameStatus.isAvailable}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          {isLoading && <LoadingSpinner />}
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default Form;