// components/Layout/Header.js
import React from 'react';
import { Bell } from 'lucide-react';
import Menu from './Menu';

const Header = ({ onTemplateChange, currentTemplate }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="flex justify-between items-center px-4 py-2">
        <Menu onTemplateChange={onTemplateChange} currentTemplate={currentTemplate} />
        <span className="text-xl font-bold text-blue-600">SuperMenu</span>
        <Bell className="w-6 h-6 cursor-pointer" />
      </div>
    </header>
  );
};

export default Header;