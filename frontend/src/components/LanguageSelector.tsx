import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Language } from '../types';

interface LanguageSelectorProps {
  languages: Language[];
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  label: string;
  includeAuto?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  languages,
  selectedLanguage,
  onLanguageChange,
  label,
  includeAuto = false,
}) => {
  const getLanguageName = (code: string) => {
    if (code === 'auto') return 'Auto-detect';
    const language = languages.find(lang => lang.code === code);
    return language ? language.name : code;
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-secondary-700">
        {label}
      </label>
      <div className="relative">
        <select
          value={selectedLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="input-field appearance-none pr-10 cursor-pointer"
        >
          {includeAuto && (
            <option value="auto">Auto-detect</option>
          )}
          {languages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.name} ({language.native_name})
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400 pointer-events-none" />
      </div>
      <div className="text-xs text-secondary-500">
        Selected: {getLanguageName(selectedLanguage)}
      </div>
    </div>
  );
};

export default LanguageSelector;
