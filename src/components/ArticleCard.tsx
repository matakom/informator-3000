import { memo } from 'react'; // Import memo
import { Article } from '../types';

interface Props {
    article: Article;
    onClick: (article: Article) => void;
}

function ArticleCard({ article, onClick }: Props) {
    // ... logic remains the same ...
    const { title, author, category, createdAt, content } = article;

    const dateString = new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'short',
        timeStyle: 'medium'
    }).format(new Date(createdAt));

    const snippet = content.length > 120 ? content.substring(0, 120) + '...' : content;

    return (
        <div className="article-card" onClick={() => onClick(article)}>
            <div className="article-meta">
                <span className="article-tag">{category}</span>
                <span>{dateString}</span>
            </div>

            <h3>{title}</h3>
            <p className="article-content">{snippet}</p>

            <div style={{ marginTop: 'auto', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9em', color: '#999' }}>By {author}</span>
                <span style={{ color: 'var(--primary)', fontSize: '0.9em', fontWeight: 600 }}>Read more →</span>
            </div>
        </div>
    );
}

export default memo(ArticleCard);