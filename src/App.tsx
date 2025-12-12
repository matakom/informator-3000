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

  // 1. DETERMINISTIC FETCHING
  // This replaces the manual useEffect and useState for articles.
  // It will only fetch once, even if the component renders 10 times.
  const { data: articles = [] } = useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      const data = await getArticles();
      setIsApiConnected(true);
      return sortNewestFirst(data);
    }
  });

  // 2. SOCKET UPDATES CACHE DIRECTLY
  const handleSocketMessage = useCallback((data: any) => {
    if (typeof data === 'object' && data.id) {
      const incomingArticle = data as Article;
      setNotification(incomingArticle);

      // Manually update the cache without refetching from server (Instant)
      queryClient.setQueryData(['articles'], (oldData: Article[] | undefined) => {
        const prev = oldData || [];
        const exists = prev.find(a => a.id === incomingArticle.id);
        let newList;
        if (exists) {
          newList = prev.map(a => a.id === incomingArticle.id ? incomingArticle : a);
        } else {
          newList = [incomingArticle, ...prev];
        }
        return sortNewestFirst(newList);
      });

      // Update detail view if open
      setSelectedArticle(current => {
        if (current && current.id === incomingArticle.id) return incomingArticle;
        return current;
      });
    } else {
      // If we get a generic signal, mark cache as dirty.
      // React Query will re-fetch automatically in the background.
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    }
  }, [queryClient]);

  const isSocketConnected = useSocket(handleSocketMessage);

  // 3. Background Health Check (UI Only)
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

      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingBottom: '2rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', zIndex: 10 }}>
          <img src="/logo/full.png" alt="logo" height={80} />
        </div>
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', zIndex: 5 }}>
          <Clock />
        </div>
        <div className="status" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.8rem',
          zIndex: 10, background: 'rgba(255,255,255,0.8)', paddingLeft: '10px'
        }}>
          <span>
            REST API: {isApiConnected ? 
              <span style={{ color: 'green', fontWeight: 'bold' }}>● Online</span> : 
              <span style={{ color: 'red', fontWeight: 'bold' }}>● Offline</span>}
          </span>
          <span>
            Real-time: {isSocketConnected ? 
              <span style={{ color: 'green', fontWeight: 'bold' }}>● Live</span> : 
              <span style={{ color: 'orange', fontWeight: 'bold' }}>● Reconnecting...</span>}
          </span>
        </div>
      </header>

      <main>
        {selectedArticle ? (
          <ArticleDetail
            article={selectedArticle}
            onBack={() => { 
                setSelectedArticle(null); 
                // Optional: ensure list is fresh when returning
                queryClient.invalidateQueries({ queryKey: ['articles'] });
            }}
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
                  onClick={(article) => setSelectedArticle(article)}
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