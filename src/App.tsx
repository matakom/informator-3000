import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import './App.css';
import { getArticles, checkApiHealth } from './services/api';
import { useSocket } from './hooks/useSocket';
import { Article } from './types';

import NotificationToast from './components/NotificationToast';
import CategoryFilter from './components/CategoryFilter';
import ArticleCard from './components/ArticleCard';
import AddArticleForm from './components/AddArticleForm';
import ArticleDetail from './components/ArticleDetail';
import Clock from './components/Clock';

const sortNewestFirst = (list: Article[]) => {
  return [...list].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

function App() {
  const queryClient = useQueryClient();
  const [notification, setNotification] = useState<Article | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [category, setCategory] = useState('');
  const [isApiConnected, setIsApiConnected] = useState<boolean>(true);

  // 1. Fetch Data
  const { data: articles = [] } = useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      const data = await getArticles();
      setIsApiConnected(true);
      return sortNewestFirst(data);
    },
    // Optional: Keep data fresh longer to avoid random refetches on window focus
    staleTime: 1000 * 60 * 5, 
  });

  // 2. Stable Handlers
  const handleCardClick = useCallback((article: Article) => {
    setSelectedArticle(article);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedArticle(null);
    // Note: We intentionally do NOT invalidate queries here to prevent flash
  }, []);

  const handleSocketMessage = useCallback((data: unknown) => {
    // SCENARIO 1: We got a full Article object (Update Cache)
    if (typeof data === 'object' && data !== null && 'id' in data) {
      const incomingArticle = data as Article;
      setNotification(incomingArticle);
      
      queryClient.setQueryData(['articles'], (oldData: Article[] | undefined) => {
        const prev = oldData || [];
        const exists = prev.find(a => a.id === incomingArticle.id);
        const newList = exists 
          ? prev.map(a => a.id === incomingArticle.id ? incomingArticle : a)
          : [incomingArticle, ...prev];
        return sortNewestFirst(newList);
      });
      
      // Update detail view if user is reading that specific article
      setSelectedArticle(current => 
        current && current.id === incomingArticle.id ? incomingArticle : current
      );
    } 
    // SCENARIO 2: We got a specific text signal (Refetch)
    else if (typeof data === 'string' && (data.includes("create") || data.includes("update") || data.includes("delete"))) {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    }
    // SCENARIO 3: Generic pings/heartbeats -> DO NOTHING (Fixes constant re-render)
  }, [queryClient]);

  const isSocketConnected = useSocket(handleSocketMessage);

  // 3. Health Check
  useEffect(() => {
    const interval = setInterval(async () => {
      const isAlive = await checkApiHealth();
      setIsApiConnected(isAlive);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const displayedArticles = useMemo(() => {
    if (!category) return articles;
    return articles.filter(a => a.category === category);
  }, [articles, category]);

  return (
    <div className="container">
      <NotificationToast message={notification} onClose={() => setNotification(null)} />

      <header className="app-header">
        
        {/* LEFT: Logo */}
        <div className="header-left">
          <img src="/logo/full.png" alt="logo" height={60} style={{ display: 'block' }} />
        </div>

        {/* CENTER: Clock */}
        <div className="header-center">
          <Clock />
        </div>

        {/* RIGHT: Status */}
        <div className="header-right">
          <span>
            REST API: {isApiConnected ? 
              <span style={{ color: '#10b981', fontWeight: 'bold' }}>● Online</span> : 
              <span style={{ color: '#ef4444', fontWeight: 'bold' }}>● Offline</span>}
          </span>
          <span>
            Real-time: {isSocketConnected ? 
              <span style={{ color: '#10b981', fontWeight: 'bold' }}>● Live</span> : 
              <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>● Connecting...</span>}
          </span>
        </div>
      </header>

      <main>
        {selectedArticle ? (
          <ArticleDetail
            article={selectedArticle}
            onBack={handleBack}
          />
        ) : (
          <>
            <div className="controls-area">
              <CategoryFilter currentCategory={category} onSelectCategory={setCategory} />
              <AddArticleForm isConnected={isApiConnected} />
            </div>

            <div className="article-list">
              {displayedArticles.length === 0 && (
                <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#999' }}>
                  No articles found.
                </p>
              )}
              {displayedArticles.map((art) => (
                <ArticleCard
                  key={art.id}
                  article={art}
                  onClick={handleCardClick}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;