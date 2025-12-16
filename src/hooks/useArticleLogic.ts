import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getArticles, checkApiHealth } from '../services/api';
import { useSocket } from './useSocket';
import { Article } from '../types';
import { useFadeColor } from './useFadeColor';

const sortNewestFirst = (list: Article[]) => {
    return [...list].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
};

export function useArticleLogic() {
    const queryClient = useQueryClient();
    
    const [notification, setNotification] = useState<Article | null>(null);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [category, setCategory] = useState('');
    const [isApiConnected, setIsApiConnected] = useState<boolean>(true);
    
    const { currentColor, triggerColorChange } = useFadeColor();

    // 1. Initial Fetch
    const { data: articles = [] } = useQuery({
        queryKey: ['articles'],
        queryFn: async () => {
            const data = await getArticles();
            setIsApiConnected(true);
            return sortNewestFirst(data);
        },
        staleTime: 1000 * 60 * 5, 
    });

    // 2. Socket Handler
    const handleSocketMessage = useCallback(async (data: unknown) => {
        // Case A: Full article object received (live update)
        if (typeof data === 'object' && data !== null && 'id' in data) {
            const incomingArticle = data as Article;
            setNotification(incomingArticle);
            
            // Manually update RQ cache so we don't have to re-fetch everything
            queryClient.setQueryData(['articles'], (oldData: Article[] | undefined) => {
                const prev = oldData || [];
                const exists = prev.find(a => a.id === incomingArticle.id);
                
                const newList = exists 
                    ? prev.map(a => a.id === incomingArticle.id ? incomingArticle : a)
                    : [incomingArticle, ...prev];
                    
                return sortNewestFirst(newList);
            });
            
            // If the user is reading this specific article, update the modal view too
            setSelectedArticle(current => 
                current && current.id === incomingArticle.id ? incomingArticle : current
            );
        } 
        // Case B: Simple signal string (create/update/delete)
        else if (typeof data === 'string') {
            const signal = data.toLowerCase();
            
            // Just invalidate and let RQ refetch
            if (signal.includes("create") || signal.includes("update") || signal.includes("delete")) {
                queryClient.invalidateQueries({ queryKey: ['articles'] });
            }

            // If it's a creation, try to grab the latest one for the toast
            if (signal.includes("create")) {
                try {
                    const latestData = await getArticles();
                    const sorted = sortNewestFirst(latestData);
                    if (sorted.length > 0) setNotification(sorted[0]); 
                } catch (e) {
                    console.error("Failed to fetch notification details", e);
                }
            }
        }
    }, [queryClient]);

    const isSocketConnected = useSocket(handleSocketMessage);

    // 3. Health Check Polling
    useEffect(() => {
        const interval = setInterval(async () => {
            const isAlive = await checkApiHealth();
            setIsApiConnected(isAlive);
        }, 10000); // Check every 10s
        return () => clearInterval(interval);
    }, []);

    const displayedArticles = useMemo(() => {
        if (!category) return articles;
        return articles.filter(a => a.category === category);
    }, [articles, category]);

    const handleBack = useCallback(() => {
        setSelectedArticle(null);
    }, []);

    return {
        displayedArticles,
        selectedArticle,
        notification,
        category,
        isApiConnected,
        isSocketConnected,
        accentColor: currentColor,
        triggerColorChange,
        setCategory,
        setNotification,
        setSelectedArticle,
        handleBack
    };
}