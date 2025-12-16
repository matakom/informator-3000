import { useState, memo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createArticle } from '../services/api';

interface Props {
    isConnected: boolean;
}

function AddArticleForm({ isConnected }: Props) {
    const queryClient = useQueryClient();
    
    // UI state
    const [isOpen, setIsOpen] = useState(false);
    
    // Form state - resetting this to default when the modal closes or succeeds
    const [formData, setFormData] = useState({
        title: '', 
        author: '', 
        content: '', 
        category: 'Tech'
    });

    // -- Server Interaction --

    const mutation = useMutation({
        mutationFn: createArticle,
        onSuccess: (isSuccess) => {
            if (isSuccess) {
                // Clear the cache to show the new item immediately
                queryClient.invalidateQueries({ queryKey: ['articles'] });
                setIsOpen(false);
                // Reset form so next time it opens, it's clean
                setFormData({ title: '', author: '', content: '', category: 'Tech' });
            } else {
                // Basic error handling for now
                alert("Failed to create");
            }
        }
    });

    // -- Handlers --

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    // -- Styles --
    
    const gridStyle: React.CSSProperties = { 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '1rem' 
    };

    // -- Render --

    // If modal isn't open, just show the trigger button
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

                    <div style={gridStyle}>
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

// ------------------------------------------------------------------
// Memoization Logic
// ------------------------------------------------------------------

function arePropsEqual(prev: Props, next: Props) {
    // Only re-render if the connection status changes
    return prev.isConnected === next.isConnected;
}

export default memo(AddArticleForm, arePropsEqual);