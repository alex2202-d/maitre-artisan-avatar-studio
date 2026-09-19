import type { ProductionAsset } from '../productionCatalog'
import AvatarActions from './AvatarActions'
import WardrobeCategories from './WardrobeCategories'
import {
  wardrobeCategories,
  type WardrobeCategoryId,
} from './wardrobeCatalog'

export default function WardrobePanel({
  selected,
  activeCategory,
  expanded,
  onToggleExpanded,
  onSelectCategory,
  onReset,
  onRandomize,
  onSave,
}: {
  selected: ProductionAsset
  activeCategory: WardrobeCategoryId
  expanded: boolean
  onToggleExpanded: () => void
  onSelectCategory: (id: WardrobeCategoryId) => void
  onReset: () => void
  onRandomize: () => void
  onSave: () => void
}) {
  return (
    <aside className={expanded ? 'wardrobe-shell expanded' : 'wardrobe-shell'} aria-label="Vestiaire">
      <button
        type="button"
        className="sheet-handle"
        aria-label={expanded ? 'Réduire le vestiaire' : 'Ouvrir le vestiaire'}
        onClick={onToggleExpanded}
      >
        <span />
      </button>

      <div className="mobile-category-strip">
        <WardrobeCategories
          categories={wardrobeCategories}
          activeId={activeCategory}
          onSelect={onSelectCategory}
        />
      </div>

      <div className="wardrobe-panel-content">
        <div className="wardrobe-heading">
          <div>
            <p className="eyebrow blue">VESTIAIRE V2</p>
            <h2>{selected.shortLabel}</h2>
          </div>
          <span className="ready-pill">3D</span>
        </div>

        <section className="mobile-selected-card">
          <div className="mobile-selected-preview">
            <img src={selected.previewUrl} alt="" />
          </div>
          <div>
            <span>{selected.category}</span>
            <strong>{selected.label}</strong>
            <p>{selected.description}</p>
          </div>
        </section>

        <section className="mobile-proof-row">
          <span>GLB réel</span>
          <span>{selected.kind === 'character' ? 'Riggé' : 'Module séparé'}</span>
          <span>PBR</span>
        </section>

        <AvatarActions onReset={onReset} onRandomize={onRandomize} onSave={onSave} />
      </div>
    </aside>
  )
}
