import { useState, useMemo, useCallback, useEffect } from 'react'; // Added useCallback
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

  const { data: articles = [] } = useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      const data = await getArticles();
      setIsApiConnected(true);
      return sortNewestFirst(data);
    }
  });

  const handleSocketMessage = useCallback((data: unknown) => {
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
      setSelectedArticle(current => current && current.id === incomingArticle.id ? incomingArticle : current);
    } else {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    }
  }, [queryClient]);

  const isSocketConnected = useSocket(handleSocketMessage);

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

  // --- OPTIMIZATION: Stable Handler ---
  // If we don't do this, a new function is created every render, breaking memoization
  const handleCardClick = useCallback((article: Article) => {
    setSelectedArticle(article);
  }, []);

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
                  onClick={handleCardClick} // Use the stable function here
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