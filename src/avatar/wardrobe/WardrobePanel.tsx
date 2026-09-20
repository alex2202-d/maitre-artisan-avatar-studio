import type { AvatarConfigV2 } from './avatarConfig'
import type { ProductionAsset } from '../productionCatalog'
import AvatarActions from './AvatarActions'
import WardrobeCategories from './WardrobeCategories'
import {
  bottomOptions,
  faceOptions,
  skinTones,
  topOptions,
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
  const faceMode = activeCategory === 'face'
  const topMode = activeCategory === 'top'
  const bottomMode = activeCategory === 'bottom'

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
            <h2>{skinMode ? 'Teinte de peau' : faceMode ? 'Visage' : topMode ? 'Hauts' : bottomMode ? 'Bas' : selected.shortLabel}</h2>
          </div>
          <span className="ready-pill">{skinMode ? '5 TEINTES' : faceMode ? '4 VISAGES' : topMode || bottomMode ? '4 CHOIX' : '3D'}</span>
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
        ) : faceMode ? (
          <section className="personalization-card">
            <p>Choisis une expression. Elle est appliquée directement sur le visage 3D.</p>
            <div className="face-choice-grid" role="list" aria-label="Expressions du visage">
              {faceOptions.map((face) => (
                <button
                  key={face.id}
                  type="button"
                  className={config.faceId === face.id ? 'face-choice active' : 'face-choice'}
                  onClick={() => onUpdateConfig({ faceId: face.id })}
                  aria-label={face.label}
                  aria-pressed={config.faceId === face.id}
                >
                  <span className={`face-glyph ${face.id}`}>
                    <i className="eye left" />
                    <i className="eye right" />
                    <i className="mouth" />
                  </span>
                  <span>
                    <strong>{face.label}</strong>
                    <small>{face.description}</small>
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : topMode ? (
          <section className="personalization-card">
            <p>Choisis le haut indépendamment du bas.</p>
            <div className="outfit-grid" role="list" aria-label="Hauts">
              {topOptions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={config.outfit.topId === item.id ? 'outfit-choice active' : 'outfit-choice'}
                  onClick={() => onUpdateConfig({ outfit: { ...config.outfit, topId: item.id } })}
                  aria-label={item.label}
                  aria-pressed={config.outfit.topId === item.id}
                >
                  <span className="outfit-color" style={{ backgroundColor: item.color }} />
                  <span className="outfit-copy">
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : bottomMode ? (
          <section className="personalization-card">
            <p>Choisis le bas indépendamment du haut.</p>
            <div className="outfit-grid" role="list" aria-label="Bas">
              {bottomOptions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={config.outfit.bottomId === item.id ? 'outfit-choice active' : 'outfit-choice'}
                  onClick={() => onUpdateConfig({ outfit: { ...config.outfit, bottomId: item.id } })}
                  aria-label={item.label}
                  aria-pressed={config.outfit.bottomId === item.id}
                >
                  <span className="outfit-color" style={{ backgroundColor: item.color }} />
                  <span className="outfit-copy">
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
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
