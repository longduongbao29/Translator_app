import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { translationApi } from '../services/api.ts';
import { TranslationResponse } from '../types';

const HistoryPage: React.FC = () => {
    const { user } = useAuth();
    const [translations, setTranslations] = useState<TranslationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const limit = 10;

    useEffect(() => {
        fetchHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const fetchHistory = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const skip = page * limit;
            const result = await translationApi.getHistory(skip, limit);

            if (result.success && result.data) {
                if (result.data.length < limit) {
                    setHasMore(false);
                }

                if (page === 0) {
                    setTranslations(result.data || []);
                } else {
                    setTranslations(prev => [...prev, ...(result.data || [])]);
                }
            } else {
                setError(result.error || 'Failed to fetch history');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        setPage(prev => prev + 1);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    if (!user) {
        return (
            <div className="flex justify-center items-center h-full">
                <p>Vui lòng đăng nhập để xem trang này</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Lịch sử dịch</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {translations.length === 0 && !loading ? (
                <div className="bg-white shadow rounded-lg p-6 text-center">
                    <p>Bạn chưa có lịch sử dịch nào.</p>
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Văn bản gốc</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bản dịch</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngôn ngữ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {translations.map((translation, index) => (
                                <tr key={translation.id || index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="truncate max-w-xs">{translation.source_text}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="truncate max-w-xs">{translation.translated_text}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div>{translation.source_language} → {translation.target_language}</div>
                                        <div className="text-xs text-gray-500">{translation.translation_engine}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(translation.created_at)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {loading && (
                        <div className="px-6 py-4 text-center">
                            <div className="spinner"></div>
                            <p className="mt-2">Đang tải...</p>
                        </div>
                    )}

                    {hasMore && !loading && (
                        <div className="px-6 py-4 text-center">
                            <button
                                onClick={handleLoadMore}
                                className="bg-primary-500 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Tải thêm
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HistoryPage;
