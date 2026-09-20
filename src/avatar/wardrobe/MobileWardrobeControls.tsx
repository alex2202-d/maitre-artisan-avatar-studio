import type { AvatarConfigV3 } from './avatarConfig'
import {
  faceOptions,
  outfitPresets,
  skinTones,
  sourceAssetsForCategory,
  wardrobeCategories,
  type WardrobeCategoryId,
} from './wardrobeCatalog'

export default function MobileWardrobeControls({
  activeCategory,
  config,
  onPreviousCategory,
  onNextCategory,
  onUpdateConfig,
  onReset,
  onSave,
}: {
  activeCategory: WardrobeCategoryId
  config: AvatarConfigV3
  onPreviousCategory: () => void
  onNextCategory: () => void
  onUpdateConfig: (patch: Partial<AvatarConfigV3>) => void
  onReset: () => void
  onSave: () => void
}) {
  const category = wardrobeCategories.find((item) => item.id === activeCategory) ?? wardrobeCategories[0]
  const sourceAssets = sourceAssetsForCategory(activeCategory)
  const sourceOnly = sourceAssets.some((asset) => asset.status === 'source-only')

  return (
    <div className="mobile-wardrobe-ui" aria-label="Vestiaire mobile">
      <button
        type="button"
        className="mobile-side-arrow mobile-side-arrow-left"
        onClick={onPreviousCategory}
        aria-label="Catégorie précédente"
      >
        ‹
      </button>

      <button
        type="button"
        className="mobile-side-arrow mobile-side-arrow-right"
        onClick={onNextCategory}
        aria-label="Catégorie suivante"
      >
        ›
      </button>

      <div className="mobile-wardrobe-dock">
        <div className="mobile-dock-topline">
          <button type="button" className="mobile-dock-action" onClick={onReset}>
            Réinitialiser
          </button>

          <div className="mobile-current-category">
            <span>{category.icon}</span>
            <div>
              <small>VESTIAIRE</small>
              <strong>{category.label}</strong>
            </div>
          </div>

          <button type="button" className="mobile-dock-action primary" onClick={onSave}>
            Valider
          </button>
        </div>

        {activeCategory === 'skin' ? (
          <div className="mobile-skin-strip" aria-label="Teintes de peau">
            {skinTones.map((tone) => (
              <button
                key={tone.id}
                type="button"
                className={config.skinToneId === tone.id ? 'mobile-skin-swatch active' : 'mobile-skin-swatch'}
                onClick={() => onUpdateConfig({ skinToneId: tone.id })}
                aria-label={tone.label}
                aria-pressed={config.skinToneId === tone.id}
              >
                <span style={{ backgroundColor: tone.color }} />
                <small>{tone.label}</small>
              </button>
            ))}
          </div>
        ) : activeCategory === 'outfit' ? (
          <div className="mobile-outfit-strip" aria-label="Tenues métier">
            {outfitPresets.map((item) => (
              <button
                key={item.id}
                type="button"
                className={config.outfitPresetId === item.id ? 'mobile-outfit-choice active' : 'mobile-outfit-choice'}
                onClick={() => onUpdateConfig({ outfitPresetId: item.id })}
                aria-label={item.label}
                aria-pressed={config.outfitPresetId === item.id}
              >
                <small>{item.label}</small>
              </button>
            ))}
          </div>
        ) : activeCategory === 'face' ? (
          <div className="mobile-face-strip" aria-label="Visages 3D">
            {faceOptions.map((face) => (
              <button
                key={face.id}
                type="button"
                className="mobile-face-choice active"
                onClick={() => onUpdateConfig({ faceId: face.id })}
                aria-label={face.label}
                aria-pressed="true"
              >
                <span className="face-glyph face-classic">
                  <i className="eye left" />
                  <i className="eye right" />
                  <i className="mouth" />
                </span>
                <small>{face.label}</small>
              </button>
            ))}
          </div>
        ) : (
          <div className="mobile-dock-hint">
            <span>‹</span>
            <p>
              {sourceOnly
                ? 'GLB séparé détecté · activation après raccordement propre au rig'
                : 'Flèches : peau, tenue, visage et futurs slots 3D'}
            </p>
            <span>›</span>
          </div>
        )}
      </div>
    </div>
  )
}
