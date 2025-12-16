import './App.css';
import { useArticleLogic } from './hooks/useArticleLogic';

// Components
import {MemoizedHeader} from './components/Header';
import {MemoizedNotificationToast} from './components/NotificationToast';
import CategoryFilter from './components/CategoryFilter';
import ArticleCard from './components/ArticleCard';
import AddArticleForm from './components/AddArticleForm';
import ArticleDetail from './components/ArticleDetail';
import {MemoizedColorPicker} from './components/ColorPicker'; 

function App() {
    const {
        displayedArticles,
        selectedArticle,
        notification,
        category,
        isApiConnected,
        isSocketConnected,
        accentColor,
        triggerColorChange,
        setCategory,
        setNotification,
        setSelectedArticle,
        handleBack
    } = useArticleLogic();

    return (
        <div className="container">
            <MemoizedNotificationToast 
                message={notification} 
                onClose={() => setNotification(null)}
                accentColor={accentColor} 
            />

            <MemoizedHeader
                isApiConnected={isApiConnected} 
                isSocketConnected={isSocketConnected} 
                accentColor={accentColor}
            />

            <main>
                {selectedArticle ? (
                    <ArticleDetail
                        article={selectedArticle}
                        onBack={handleBack}
                    />
                ) : (
                    <>
                        <div className="controls-area">
                            <CategoryFilter 
                                currentCategory={category} 
                                onSelectCategory={setCategory} 
                            />
                            
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {/* Pass the fading color into the picker */}
                                <MemoizedColorPicker 
                                    color={accentColor} 
                                    onColorSelect={triggerColorChange} 
                                />
                                <AddArticleForm isConnected={isApiConnected} />
                            </div>
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
                                    onClick={setSelectedArticle}
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