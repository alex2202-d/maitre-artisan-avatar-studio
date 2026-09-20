import type { AvatarConfigV2 } from './avatarConfig'
import {
  bottomOptions,
  faceOptions,
  skinTones,
  topOptions,
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
        ) : activeCategory === 'face' ? (
          <div className="mobile-face-strip" aria-label="Expressions du visage">
            {faceOptions.map((face) => (
              <button
                key={face.id}
                type="button"
                className={config.faceId === face.id ? 'mobile-face-choice active' : 'mobile-face-choice'}
                onClick={() => onUpdateConfig({ faceId: face.id })}
                aria-label={face.label}
                aria-pressed={config.faceId === face.id}
              >
                <span className={`face-glyph ${face.id}`}>
                  <i className="eye left" />
                  <i className="eye right" />
                  <i className="mouth" />
                </span>
                <small>{face.label}</small>
              </button>
            ))}
          </div>
        ) : activeCategory === 'top' ? (
          <div className="mobile-outfit-strip" aria-label="Hauts">
            {topOptions.map((item) => (
              <button
                key={item.id}
                type="button"
                className={config.outfit.topId === item.id ? 'mobile-outfit-choice active' : 'mobile-outfit-choice'}
                onClick={() => onUpdateConfig({ outfit: { ...config.outfit, topId: item.id } })}
                aria-label={item.label}
                aria-pressed={config.outfit.topId === item.id}
              >
                <span style={{ backgroundColor: item.color }} />
                <small>{item.label}</small>
              </button>
            ))}
          </div>
        ) : activeCategory === 'bottom' ? (
          <div className="mobile-outfit-strip" aria-label="Bas">
            {bottomOptions.map((item) => (
              <button
                key={item.id}
                type="button"
                className={config.outfit.bottomId === item.id ? 'mobile-outfit-choice active' : 'mobile-outfit-choice'}
                onClick={() => onUpdateConfig({ outfit: { ...config.outfit, bottomId: item.id } })}
                aria-label={item.label}
                aria-pressed={config.outfit.bottomId === item.id}
              >
                <span style={{ backgroundColor: item.color }} />
                <small>{item.label}</small>
              </button>
            ))}
          </div>
        ) : (
          <div className="mobile-dock-hint">
            <span>‹</span>
            <p>Flèches : visage, accessoires, couleurs, hauts et bas</p>
            <span>›</span>
          </div>
        )}

      </div>
    </div>
  )
}
