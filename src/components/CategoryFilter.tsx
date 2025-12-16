import { memo } from 'react';

interface Props {
    currentCategory: string;
    onSelectCategory: (cat: string) => void;
}

function CategoryFilter({ currentCategory, onSelectCategory }: Props) {
    // Hardcoding these for now, but we could eventually pull them from the backend
    const categories = ['Politika', 'Sport', 'Tech'];

    return (
        <div className="category-filter">
            {/* The 'All' button is special since it clears the current selection */}
            <button
                className={currentCategory === '' ? 'active' : ''}
                onClick={() => onSelectCategory('')}
            >
                All
            </button>

            {categories.map(cat => (
                <button
                    key={cat}
                    className={currentCategory === cat ? 'active' : ''}
                    onClick={() => onSelectCategory(cat)}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
}

// ------------------------------------------------------------------
// Memoization Logic
// ------------------------------------------------------------------

function arePropsEqual(prev: Props, next: Props) {
    // Simple string comparison + reference check for the handler
    return (
        prev.currentCategory === next.currentCategory &&
        prev.onSelectCategory === next.onSelectCategory
    );
}

export default memo(CategoryFilter, arePropsEqual);