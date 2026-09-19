import type { AvatarConfigV2 } from './avatarConfig'
import type { ProductionAsset } from '../productionCatalog'
import AvatarActions from './AvatarActions'
import WardrobeCategories from './WardrobeCategories'
import {
  outfitOptions,
  skinTones,
  wardrobeCategories,
  type WardrobeCategoryId,
} from './wardrobeCatalog'

export default function WardrobePanel({
  selected,
  activeCategory,
  expanded,
  config,
  onToggleExpanded,
  onSelectCategory,
  onUpdateConfig,
  onReset,
  onRandomize,
  onSave,
}: {
  selected: ProductionAsset
  activeCategory: WardrobeCategoryId
  expanded: boolean
  config: AvatarConfigV2
  onToggleExpanded: () => void
  onSelectCategory: (id: WardrobeCategoryId) => void
  onUpdateConfig: (patch: Partial<AvatarConfigV2>) => void
  onReset: () => void
  onRandomize: () => void
  onSave: () => void
}) {
  const skinMode = activeCategory === 'skin'
  const outfitMode = activeCategory === 'outfits'

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
            <h2>{skinMode ? 'Teinte de peau' : outfitMode ? 'Tenues métier' : selected.shortLabel}</h2>
          </div>
          <span className="ready-pill">{skinMode ? '5 TEINTES' : outfitMode ? '4 TENUES' : '3D'}</span>
        </div>

        {skinMode ? (
          <section className="personalization-card">
            <p>Choisis la teinte de peau de ton avatar.</p>
            <div className="skin-tone-grid" role="list" aria-label="Teintes de peau">
              {skinTones.map((tone) => (
                <button
                  key={tone.id}
                  type="button"
                  className={config.skinToneId === tone.id ? 'skin-tone active' : 'skin-tone'}
                  onClick={() => onUpdateConfig({ skinToneId: tone.id })}
                  aria-label={tone.label}
                  aria-pressed={config.skinToneId === tone.id}
                >
                  <span style={{ backgroundColor: tone.color }} />
                  <strong>{tone.label}</strong>
                </button>
              ))}
            </div>
          </section>
        ) : outfitMode ? (
          <section className="personalization-card">
            <p>Choisis une tenue complète. Le modèle 3D change immédiatement sans quitter le vestiaire.</p>
            <div className="outfit-grid" role="list" aria-label="Tenues métier">
              {outfitOptions.map((outfit) => (
                <button
                  key={outfit.id}
                  type="button"
                  className={config.outfitId === outfit.id ? 'outfit-choice active' : 'outfit-choice'}
                  onClick={() => onUpdateConfig({ outfitId: outfit.id })}
                  aria-label={outfit.label}
                  aria-pressed={config.outfitId === outfit.id}
                >
                  <span className="outfit-color" style={{ backgroundColor: outfit.color }} />
                  <span className="outfit-copy">
                    <strong>{outfit.label}</strong>
                    <small>{outfit.description}</small>
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : (
          <>
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
          </>
        )}

        <AvatarActions onReset={onReset} onRandomize={onRandomize} onSave={onSave} />
      </div>
    </aside>
  )
}
