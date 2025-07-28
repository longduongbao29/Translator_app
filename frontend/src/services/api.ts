import axios from 'axios';
import { TranslationRequest, TranslationResponse, Language, LanguageDetectionResponse, ApiResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8003/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const translationApi = {
  // Translate text
  translate: async (request: TranslationRequest): Promise<ApiResponse<TranslationResponse>> => {
    try {
      const response = await api.post('/translate', request);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || error.message || 'Translation failed',
        success: false,
      };
    }
  },

  // Detect language
  detectLanguage: async (text: string): Promise<ApiResponse<LanguageDetectionResponse>> => {
    try {
      const response = await api.post('/detect-language', { text });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || error.message || 'Language detection failed',
        success: false,
      };
    }
  },

  // Get supported languages
  getLanguages: async (): Promise<ApiResponse<Language[]>> => {
    try {
      const response = await api.get('/languages');
      return {
        data: response.data.languages,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || error.message || 'Failed to fetch languages',
        success: false,
      };
    }
  },

  // Get translation history
  getHistory: async (skip = 0, limit = 100): Promise<ApiResponse<TranslationResponse[]>> => {
    try {
      const response = await api.get(`/history?skip=${skip}&limit=${limit}`);
      return {
        data: response.data.translations,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || error.message || 'Failed to fetch history',
        success: false,
      };
    }
  },
};

export default api;
