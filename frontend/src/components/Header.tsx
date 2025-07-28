import React from 'react';
import { Globe, Languages } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-secondary-200">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">Voice Translator</h1>
              <p className="text-sm text-secondary-600">Translate text and speech in real-time</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-secondary-600">
            <Languages className="w-5 h-5" />
            <span className="text-sm font-medium">Multi-language Support</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
