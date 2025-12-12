import { memo } from 'react'; // Import memo

interface Props {
  currentCategory: string;
  onSelectCategory: (cat: string) => void;
}

function CategoryFilter({ currentCategory, onSelectCategory }: Props) {
  const categories = ['Politika', 'Sport', 'Tech'];

  return (
    <div className="category-filter">
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

export default memo(CategoryFilter);