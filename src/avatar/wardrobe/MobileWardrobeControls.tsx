import type { AvatarConfigV2 } from './avatarConfig'
import {
  outfitOptions,
  skinTones,
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
  config: AvatarConfigV2
  onPreviousCategory: () => void
  onNextCategory: () => void
  onUpdateConfig: (patch: Partial<AvatarConfigV2>) => void
  onReset: () => void
  onSave: () => void
}) {
  const category = wardrobeCategories.find((item) => item.id === activeCategory) ?? wardrobeCategories[0]

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
        ) : activeCategory === 'outfits' ? (
          <div className="mobile-outfit-strip" aria-label="Tenues métier">
            {outfitOptions.map((outfit) => (
              <button
                key={outfit.id}
                type="button"
                className={config.outfitId === outfit.id ? 'mobile-outfit-choice active' : 'mobile-outfit-choice'}
                onClick={() => onUpdateConfig({ outfitId: outfit.id })}
                aria-label={outfit.label}
                aria-pressed={config.outfitId === outfit.id}
              >
                <span style={{ backgroundColor: outfit.color }} />
                <small>{outfit.label}</small>
              </button>
            ))}
          </div>
        ) : (
          <div className="mobile-dock-hint">
            <span>‹</span>
            <p>Flèches : accessoires, couleurs et tenues</p>
            <span>›</span>
          </div>
        )}
      </div>
    </div>
  )
}
