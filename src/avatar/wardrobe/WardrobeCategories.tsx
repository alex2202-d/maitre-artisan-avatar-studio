import type { WardrobeCategory, WardrobeCategoryId } from './wardrobeCatalog'

export default function WardrobeCategories({
  categories,
  activeId,
  onSelect,
  className = '',
}: {
  categories: WardrobeCategory[]
  activeId: WardrobeCategoryId
  onSelect: (id: WardrobeCategoryId) => void
  className?: string
}) {
  return (
    <nav className={`wardrobe-categories ${className}`} aria-label="Catégories du vestiaire">
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          className={activeId === category.id ? 'wardrobe-category active' : 'wardrobe-category'}
          onClick={() => onSelect(category.id)}
        >
          <span aria-hidden="true">{category.icon}</span>
          <strong>{category.label}</strong>
        </button>
      ))}
    </nav>
  )
}
