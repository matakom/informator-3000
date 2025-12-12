import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Article } from '../types';
import { deleteArticle, updateArticle } from '../services/api';

interface Props {
    article: Article;
    onBack: () => void;
}

export default function ArticleDetail({ article, onBack }: Props) {
    const queryClient = useQueryClient();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    // --- MUTATIONS ---
    const deleteMutation = useMutation({
        mutationFn: deleteArticle,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['articles'] });
            onBack();
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<Article>) => updateArticle(article.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['articles'] });
            setIsEditModalOpen(false);
            onBack(); 
        }
    });

    // --- RENDER HELPERS ---
    const getCategoryGradient = (cat: string) => {
        const colors: Record<string, string> = {
            'Tech': 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
            'Sport': 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
            'Politika': 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)'
        };
        return colors[cat] || 'linear-gradient(135deg, #64748b 0%, #334155 100%)';
    };

    const formattedDate = new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'long', timeStyle: 'short'
    }).format(new Date(article.createdAt));

    return (
        <div className="article-detail">
            {/* HEADER */}
            <div className="detail-header" style={{ background: getCategoryGradient(article.category) }}>
                <div className="detail-actions">
                    <button onClick={onBack}>← Back</button>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => setIsEditModalOpen(true)}>Edit</button>
                        <button 
                            onClick={() => {
                                if(window.confirm('Delete this article?')) deleteMutation.mutate(article.id)
                            }}
                            style={{ background: 'rgba(239, 68, 68, 0.8)', borderColor: '#ef4444' }}
                        >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>

                <span className="article-tag" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                    {article.category}
                </span>

                <h1>{article.title}</h1>
                <div style={{ opacity: 0.9, fontSize: '0.9rem' }}>
                    By <strong>{article.author}</strong> • {formattedDate}
                </div>
            </div>

            {/* BODY */}
            <div className="detail-body" style={{ padding: '3rem' }}>
                {article.content}
            </div>

            {/* EDIT MODAL */}
            {isEditModalOpen && (
                <EditModal 
                    article={article} 
                    onClose={() => setIsEditModalOpen(false)} 
                    onSave={(data) => updateMutation.mutate(data)}
                    isLoading={updateMutation.isPending}
                />
            )}
        </div>
    );
}

// Interface for the sub-component
interface EditModalProps {
    article: Article;
    onClose: () => void;
    onSave: (data: Article) => void;
    isLoading: boolean;
}

function EditModal({ article, onClose, onSave, isLoading }: EditModalProps) {
    const [form, setForm] = useState<Article>({ ...article });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Edit Article</h2>
                <form onSubmit={handleSubmit}>
                    <input 
                        value={form.title} 
                        onChange={e => setForm({...form, title: e.target.value})} 
                        placeholder="Title" required 
                    />
                    <div style={{display:'flex', gap:'10px'}}>
                        <input 
                            value={form.author} 
                            onChange={e => setForm({...form, author: e.target.value})} 
                            placeholder="Author" required 
                        />
                        <select 
                            value={form.category} 
                            onChange={e => setForm({...form, category: e.target.value})}
                        >
                            <option value="Tech">Tech</option>
                            <option value="Sport">Sport</option>
                            <option value="Politika">Politika</option>
                        </select>
                    </div>
                    <textarea 
                        value={form.content} 
                        onChange={e => setForm({...form, content: e.target.value})} 
                        placeholder="Content" rows={8} required 
                    />
                    <div className="form-actions">
                        <button type="button" className="secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}