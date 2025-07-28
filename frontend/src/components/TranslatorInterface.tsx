import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Mic, MicOff, Volume2, VolumeX, Copy, RotateCcw, Loader2 } from 'lucide-react';
import { Language, TranslationRequest, TranslationResponse } from '../types';
import { translationApi } from '../services/api.ts';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.ts';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis.ts';
import LanguageSelector from './LanguageSelector.tsx';
import TextArea from './TextArea.tsx';

interface TranslatorInterfaceProps {
  languages: Language[];
}

const TranslatorInterface: React.FC<TranslatorInterfaceProps> = ({ languages }) => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [translationEngine, setTranslationEngine] = useState<'google' | 'openai'>('google');
  const [isTranslating, setIsTranslating] = useState(false);
  const [lastTranslation, setLastTranslation] = useState<TranslationResponse | null>(null);

  const speechRecognition = useSpeechRecognition(sourceLanguage === 'auto' ? 'en-US' : sourceLanguage);
  const speechSynthesis = useSpeechSynthesis();

  // Auto-translate when source text changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (sourceText.trim() && sourceText !== lastTranslation?.source_text) {
        handleTranslate();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [sourceText, sourceLanguage, targetLanguage, translationEngine]);

  // Update source text from speech recognition
  useEffect(() => {
    if (speechRecognition.transcript) {
      setSourceText(speechRecognition.transcript);
    }
  }, [speechRecognition.transcript]);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    try {
      const request: TranslationRequest = {
        text: sourceText,
        source_language: sourceLanguage,
        target_language: targetLanguage,
        engine: translationEngine,
      };

      const response = await translationApi.translate(request);

      if (response.success && response.data) {
        setTranslatedText(response.data.translated_text);
        setLastTranslation(response.data);
        toast.success('Translation completed!');
      } else {
        toast.error(response.error || 'Translation failed');
      }
    } catch (error) {
      toast.error('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    if (sourceLanguage === 'auto') return;

    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleClearAll = () => {
    setSourceText('');
    setTranslatedText('');
    speechRecognition.resetTranscript();
    setLastTranslation(null);
  };

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Text copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy text');
    }
  };

  const handleSpeakText = (text: string, language: string) => {
    if (text.trim()) {
      speechSynthesis.speak(text, language);
    }
  };

  const toggleVoiceRecognition = () => {
    if (speechRecognition.isListening) {
      speechRecognition.stopListening();
    } else {
      speechRecognition.startListening();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Engine Selection */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-secondary-900">Translation Engine</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setTranslationEngine('google')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${translationEngine === 'google'
                ? 'bg-primary-600 text-white'
                : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                }`}
            >
              Google Translate
            </button>
            <button
              onClick={() => setTranslationEngine('openai')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${translationEngine === 'openai'
                ? 'bg-primary-600 text-white'
                : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                }`}
            >
              OpenAI
            </button>
          </div>
        </div>
      </div>

      {/* Language Selection */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <LanguageSelector
            languages={languages}
            selectedLanguage={sourceLanguage}
            onLanguageChange={setSourceLanguage}
            label="From"
            includeAuto={true}
          />

          <div className="flex justify-center">
            <button
              onClick={handleSwapLanguages}
              disabled={sourceLanguage === 'auto'}
              className="p-3 rounded-full bg-primary-100 hover:bg-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Swap languages"
            >
              <RotateCcw className="w-5 h-5 text-primary-600" />
            </button>
          </div>

          <LanguageSelector
            languages={languages}
            selectedLanguage={targetLanguage}
            onLanguageChange={setTargetLanguage}
            label="To"
            includeAuto={false}
          />
        </div>
      </div>

      {/* Translation Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Text */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-secondary-900">Source Text</h3>
            <div className="flex space-x-2">
              {speechRecognition.isSupported && (
                <button
                  onClick={toggleVoiceRecognition}
                  className={`p-2 rounded-lg transition-colors ${speechRecognition.isListening
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                    }`}
                  title={speechRecognition.isListening ? 'Stop listening' : 'Start voice input'}
                >
                  {speechRecognition.isListening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>
              )}
              <button
                onClick={() => handleCopyText(sourceText)}
                disabled={!sourceText}
                className="p-2 rounded-lg bg-secondary-100 text-secondary-600 hover:bg-secondary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Copy text"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <TextArea
            value={sourceText}
            onChange={setSourceText}
            placeholder="Enter text to translate or use voice input..."
            className="min-h-32"
          />

          {speechRecognition.isListening && (
            <div className="mt-3 flex items-center space-x-2 text-sm text-red-600">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Listening...</span>
            </div>
          )}

          {speechRecognition.error && (
            <div className="mt-3 text-sm text-red-600">
              Voice recognition error: {speechRecognition.error}
            </div>
          )}
        </div>

        {/* Translated Text */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-secondary-900">Translation</h3>
            <div className="flex space-x-2">
              {speechSynthesis.isSupported && (
                <button
                  onClick={() => handleSpeakText(translatedText, targetLanguage)}
                  disabled={!translatedText || speechSynthesis.isSpeaking}
                  className="p-2 rounded-lg bg-primary-100 text-primary-600 hover:bg-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Read aloud"
                >
                  {speechSynthesis.isSpeaking ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
              )}
              <button
                onClick={() => handleCopyText(translatedText)}
                disabled={!translatedText}
                className="p-2 rounded-lg bg-secondary-100 text-secondary-600 hover:bg-secondary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Copy translation"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative">
            <TextArea
              value={translatedText}
              onChange={() => { }} // Read-only
              placeholder="Translation will appear here..."
              className="min-h-32"
              readOnly
            />

            {isTranslating && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <div className="flex items-center space-x-2 text-primary-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">Translating...</span>
                </div>
              </div>
            )}
          </div>

          {lastTranslation && (
            <div className="mt-3 text-xs text-secondary-500">
              Translated using {lastTranslation.translation_engine}
              {lastTranslation.confidence && (
                <span> • Confidence: {Math.round(lastTranslation.confidence * 100)}%</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleTranslate}
          disabled={!sourceText.trim() || isTranslating}
          className="btn-primary flex items-center space-x-2"
        >
          {isTranslating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span>Translate</span>
          )}
        </button>

        <button
          onClick={handleClearAll}
          className="btn-secondary"
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

export default TranslatorInterface;
