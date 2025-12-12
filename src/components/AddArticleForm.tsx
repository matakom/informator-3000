import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createArticle } from '../services/api';

interface Props {
    isConnected: boolean;
}

export default function AddArticleForm({ isConnected }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();
    
    const [formData, setFormData] = useState({
        title: '', author: '', content: '', category: 'Tech'
    });

    const mutation = useMutation({
        mutationFn: createArticle,
        onSuccess: (isSuccess) => {
            if (isSuccess) {
                queryClient.invalidateQueries({ queryKey: ['articles'] });
                setIsOpen(false);
                setFormData({ title: '', author: '', content: '', category: 'Tech' });
            } else {
                alert("Failed to create");
            }
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                disabled={!isConnected}
            >
                {isConnected ? '+ New Article' : '⚠ API Offline'}
            </button>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Publish Article</h2>
                <form onSubmit={handleSubmit}>
                    <label>Headline</label>
                    <input
                        required
                        autoFocus
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter a catchy title..."
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label>Author</label>
                            <input
                                required
                                value={formData.author}
                                onChange={e => setFormData({ ...formData, author: e.target.value })}
                                placeholder="Your name"
                            />
                        </div>
                        <div>
                            <label>Category</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="Tech">Tech</option>
                                <option value="Sport">Sport</option>
                                <option value="Politika">Politika</option>
                            </select>
                        </div>
                    </div>

                    <label>Content</label>
                    <textarea
                        required
                        rows={6}
                        value={formData.content}
                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Write your story here..."
                    />

                    <div className="form-actions">
                        <button 
                            type="button" 
                            className="secondary" 
                            onClick={() => setIsOpen(false)}
                            disabled={mutation.isPending}
                        >
                            Cancel
                        </button>
                        <button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Publishing...' : 'Publish Article'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}