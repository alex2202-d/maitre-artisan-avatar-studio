import type { AvatarConfigV3 } from './avatarConfig'
import type { ProductionAsset } from '../productionCatalog'
import AvatarActions from './AvatarActions'
import WardrobeCategories from './WardrobeCategories'
import {
  faceOptions,
  outfitPresets,
  skinTones,
  sourceAssetsForCategory,
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
  config: AvatarConfigV3
  onToggleExpanded: () => void
  onSelectCategory: (id: WardrobeCategoryId) => void
  onUpdateConfig: (patch: Partial<AvatarConfigV3>) => void
  onReset: () => void
  onRandomize: () => void
  onSave: () => void
}) {
  const skinMode = activeCategory === 'skin'
  const outfitMode = activeCategory === 'outfit'
  const faceMode = activeCategory === 'face'
  const characterMode = activeCategory === 'character'
  const sourceAssets = sourceAssetsForCategory(activeCategory)

  const heading =
    skinMode
      ? 'Teinte de peau'
      : outfitMode
        ? 'Tenue métier'
        : faceMode
          ? 'Visage'
          : characterMode
            ? selected.shortLabel
            : wardrobeCategories.find((item) => item.id === activeCategory)?.label ?? selected.shortLabel

  const badge =
    skinMode
      ? '5 GLB'
      : outfitMode
        ? '4 TENUES'
        : faceMode
          ? '100 % 3D'
          : sourceAssets.some((asset) => asset.status === 'source-only')
            ? 'SOURCE 3D'
            : 'SLOT'

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
            <p className="eyebrow blue">VESTIAIRE V3</p>
            <h2>{heading}</h2>
          </div>
          <span className="ready-pill">{badge}</span>
        </div>

        {skinMode ? (
          <section className="personalization-card">
            <p>Chaque teinte charge un vrai GLB riggé. Aucune recoloration du visage par filtre.</p>
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
            <p>Ces quatre choix sont déjà de vrais personnages GLB riggés et alignés.</p>
            <div className="outfit-grid" role="list" aria-label="Tenues métier">
              {outfitPresets.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={config.outfitPresetId === item.id ? 'outfit-choice active' : 'outfit-choice'}
                  onClick={() => onUpdateConfig({ outfitPresetId: item.id })}
                  aria-label={item.label}
                  aria-pressed={config.outfitPresetId === item.id}
                >
                  <span className="outfit-copy">
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : faceMode ? (
          <section className="personalization-card">
            <p>Le visage affiché appartient au mesh 3D. Les anciennes expressions en overlay ont été retirées.</p>
            <div className="face-choice-grid" role="list" aria-label="Visages 3D">
              {faceOptions.map((face) => (
                <button
                  key={face.id}
                  type="button"
                  className="face-choice active"
                  onClick={() => onUpdateConfig({ faceId: face.id })}
                  aria-label={face.label}
                  aria-pressed="true"
                >
                  <span className="face-glyph face-classic">
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
        ) : characterMode ? (
          <>
            <section className="mobile-selected-card">
              <div className="mobile-selected-preview">
                <img src={selected.previewUrl} alt="" />
              </div>
              <div>
                <span>{selected.category}</span>
                <strong>{selected.label}</strong>
                <p>Base riggée propre. Le runtime ne dessine plus rien par-dessus le visage.</p>
              </div>
            </section>
            <section className="mobile-proof-row">
              <span>GLB réel</span>
              <span>Riggé</span>
              <span>Sans overlay</span>
            </section>
          </>
        ) : (
          <section className="personalization-card">
            {sourceAssets.length ? (
              <>
                <p>
                  Les GLB séparés sont bien présents dans le projet. Ils ne sont pas superposés au corps fusionné :
                  ils seront activés uniquement après raccordement au rig / base neutre.
                </p>
                <div className="outfit-grid" role="list" aria-label={heading}>
                  {sourceAssets.map((asset) => (
                    <div key={asset.id} className="outfit-choice" role="listitem">
                      {asset.previewUrl ? (
                        <span className="mobile-selected-preview">
                          <img src={asset.previewUrl} alt="" />
                        </span>
                      ) : null}
                      <span className="outfit-copy">
                        <strong>{asset.label}</strong>
                        <small>{asset.description}</small>
                        <small>
                          {asset.status === 'ready' ? 'Prêt' : 'GLB source présent · activation bloquée tant que le rig n’est pas propre'}
                        </small>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p>Aucun asset 3D n’est encore validé pour ce slot.</p>
            )}
          </section>
        )}

        <AvatarActions onReset={onReset} onRandomize={onRandomize} onSave={onSave} />
      </div>
    </aside>
  )
}
