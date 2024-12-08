// components/Layout/Menu.js
import React, { useState } from 'react';
import { Menu as MenuIcon, X, Layout } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../../components/ui/dialog";

const Menu = ({ onTemplateChange, currentTemplate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [formData, setFormData] = useState({
    shopName: '',
    username: '',
    countries: [],
    cities: [],
    categories: [],
    signatureIcons: [],
    template: currentTemplate || 'template1'
  });

  const templates = [
      {
        id: 'template1',
        name: 'Single Column',
        description: 'List layout with full-width items',
        color: 'bg-blue-50 border-blue-600'
      },
      {
        id: 'template2',
        name: 'Two Columns',
        description: 'Gallery layout with two columns',
        color: 'bg-blue-50 border-blue-600'
      },
      {
        id: 'template3',
        name: 'Three Columns',
        description: 'Compact grid with three columns on all screens',
        color: 'bg-blue-50 border-blue-600'
      }
    ];

    const handleTemplateChange = (template) => {
      setFormData({ ...formData, template });
      if (onTemplateChange) {
        onTemplateChange(template);
      }
      setIsOpen(false);
    };

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <MenuIcon className="w-6 h-6" />
      </button>

      {/* Sliding Menu */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } z-50`}>
        {/* Menu Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Menu</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="hover:bg-gray-100 p-1 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Content */}
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-auto">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">
              Create Menu
            </h1>
            <p className="text-xs text-gray-500 mb-8">FOR FREE</p>

            {/* Create Menu Button */}
            <button
              onClick={() => {
                setShowSetup(true);
                setIsOpen(false);
              }}
              className="w-full bg-blue-600 text-white rounded-lg py-3 mb-4 hover:bg-blue-700 transition-colors"
            >
              Create Your Menu
            </button>

            {/* Google Sign In */}
            <button className="flex items-center justify-center gap-2 w-full border rounded-lg py-3 hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" 
                  fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" 
                  fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" 
                  fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" 
                  fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Template Selection Section */}
          <div className="border-t mt-4">
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Menu Layout</h3>
              <div className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateChange(template.id)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      formData.template === template.id
                        ? template.color
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        formData.template === template.id
                          ? 'border-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {formData.template === template.id && (
                          <div className="w-3 h-3 rounded-full bg-blue-600" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Menu;