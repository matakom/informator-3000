import { memo } from 'react'; 
import { Article } from '../types';

interface Props {
    article: Article;
    onClick: (article: Article) => void;
}

function ArticleCard({ article, onClick }: Props) {
    const { title, author, category, createdAt, content } = article;

    // formatting the date for the UK locale
    const dateString = new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'short',
        timeStyle: 'medium'
    }).format(new Date(createdAt));

    // create a preview snippet, capping it at 120 chars
    const snippet = content.length > 120 
        ? content.substring(0, 120) + '...' 
        : content;

    // extracting this style object keeps the return statement un-cluttered
    const footerStyle: React.CSSProperties = {
        marginTop: 'auto',
        paddingTop: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    };

    return (
        <div className="article-card" onClick={() => onClick(article)}>
            <div className="article-meta">
                <span className="article-tag">{category}</span>
                <span>{dateString}</span>
            </div>

            <h3>{title}</h3>
            <p className="article-content">{snippet}</p>

            <div style={footerStyle}>
                <span style={{ fontSize: '0.9em', color: '#999' }}>
                    By {author}
                </span>
                <span style={{ color: 'var(--primary)', fontSize: '0.9em', fontWeight: 600 }}>
                    Read more →
                </span>
            </div>
        </div>
    );
}

// ------------------------------------------------------------------
// Memoization Logic
// ------------------------------------------------------------------

function arePropsEqual(prevProps: Props, nextProps: Props) {
    // We only re-render if the core data has changed.
    // Note: We check 'updatedAt' specifically because that changes
    // whenever the content changes on the backend.
    return (
        prevProps.article.id === nextProps.article.id &&
        prevProps.article.updatedAt === nextProps.article.updatedAt &&
        prevProps.article.title === nextProps.article.title &&
        prevProps.onClick === nextProps.onClick
    );
}

export default memo(ArticleCard, arePropsEqual);