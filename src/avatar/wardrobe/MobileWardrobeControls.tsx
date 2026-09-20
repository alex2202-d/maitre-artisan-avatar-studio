import type { AvatarConfigV3 } from './avatarConfig'
import {
  accessoryOptions,
  bottomOptions,
  faceOptions,
  gloveOptions,
  hairOptions,
  headwearOptions,
  outfitPresets,
  shoeOptions,
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
  config: AvatarConfigV3
  onPreviousCategory: () => void
  onNextCategory: () => void
  onUpdateConfig: (patch: Partial<AvatarConfigV3>) => void
  onReset: () => void
  onSave: () => void
}) {
  const category = wardrobeCategories.find((item) => item.id === activeCategory) ?? wardrobeCategories[0]

  const colorStrip = (
    items: readonly { id: string; label: string; color: string }[],
    selectedId: string | null,
    apply: (id: string) => void,
  ) => (
    <div className="mobile-outfit-strip">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={selectedId === item.id ? 'mobile-outfit-choice active' : 'mobile-outfit-choice'}
          onClick={() => apply(item.id)}
          aria-label={item.label}
          aria-pressed={selectedId === item.id}
        >
          <span style={{ backgroundColor: item.color }} />
          <small>{item.label}</small>
        </button>
      ))}
    </div>
  )

  let options

  if (activeCategory === 'skin') {
    options = (
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
            <span style={{ backgroundColor: tone.color }} /><small>{tone.label}</small>
          </button>
        ))}
      </div>
    )
  } else if (activeCategory === 'outfit') {
    options = (
      <div className="mobile-outfit-strip" aria-label="Tenues métier">
        {outfitPresets.map((item) => (
          <button
            key={item.id}
            type="button"
            className={config.outfitPresetId === item.id ? 'mobile-outfit-choice active' : 'mobile-outfit-choice'}
            onClick={() => onUpdateConfig({ outfitPresetId: item.id })}
            aria-label={item.label}
            aria-pressed={config.outfitPresetId === item.id}
          ><small>{item.label}</small></button>
        ))}
      </div>
    )
  } else if (activeCategory === 'face') {
    options = (
      <div className="mobile-face-strip" aria-label="Visages 3D">
        {faceOptions.map((face) => (
          <button
            key={face.id}
            type="button"
            className={config.faceId === face.id ? 'mobile-face-choice active' : 'mobile-face-choice'}
            onClick={() => onUpdateConfig({ faceId: face.id })}
            aria-label={face.label}
            aria-pressed={config.faceId === face.id}
          ><span className="face-glyph face-classic"><i className="eye left" /><i className="eye right" /><i className="mouth" /></span><small>{face.label}</small></button>
        ))}
      </div>
    )
  } else if (activeCategory === 'hair') {
    options = (
      <div className="mobile-outfit-strip" aria-label="Coiffures">
        {hairOptions.map((item) => (
          <button
            key={item.id}
            type="button"
            className={config.hairStyleId === item.id ? 'mobile-outfit-choice active' : 'mobile-outfit-choice'}
            onClick={() => onUpdateConfig({ hairStyleId: item.id, outfit: { ...config.outfit, headwearId: item.id === 'hair-none' ? config.outfit.headwearId : 'helmet-none' } })}
            aria-label={item.label}
            aria-pressed={config.hairStyleId === item.id}
          ><small>{item.label}</small></button>
        ))}
      </div>
    )
  } else if (activeCategory === 'headwear') {
    options = colorStrip(headwearOptions, config.outfit.headwearId, (id) => onUpdateConfig({ outfit: { ...config.outfit, headwearId: id } }))
  } else if (activeCategory === 'top') {
    options = colorStrip(topOptions, config.outfit.topId, (id) => onUpdateConfig({ outfit: { ...config.outfit, topId: id } }))
  } else if (activeCategory === 'bottom') {
    options = colorStrip(bottomOptions, config.outfit.bottomId, (id) => onUpdateConfig({ outfit: { ...config.outfit, bottomId: id } }))
  } else if (activeCategory === 'gloves') {
    options = colorStrip(gloveOptions, config.outfit.glovesId, (id) => onUpdateConfig({ outfit: { ...config.outfit, glovesId: id } }))
  } else if (activeCategory === 'shoes') {
    options = colorStrip(shoeOptions, config.outfit.shoesId, (id) => onUpdateConfig({ outfit: { ...config.outfit, shoesId: id } }))
  } else if (activeCategory === 'accessory') {
    options = (
      <div className="mobile-outfit-strip" aria-label="Accessoires">
        {accessoryOptions.map((item) => (
          <button
            key={item.id}
            type="button"
            className={config.outfit.accessoryId === item.id ? 'mobile-outfit-choice active' : 'mobile-outfit-choice'}
            onClick={() => onUpdateConfig({ outfit: { ...config.outfit, accessoryId: item.id } })}
            aria-label={item.label}
            aria-pressed={config.outfit.accessoryId === item.id}
          ><small>{item.label}</small></button>
        ))}
      </div>
    )
  } else {
    options = <div className="mobile-dock-hint"><span>‹</span><p>Tous les slots du vestiaire sont actifs</p><span>›</span></div>
  }

  return (
    <div className="mobile-wardrobe-ui" aria-label="Vestiaire mobile">
      <button type="button" className="mobile-side-arrow mobile-side-arrow-left" onClick={onPreviousCategory} aria-label="Catégorie précédente">‹</button>
      <button type="button" className="mobile-side-arrow mobile-side-arrow-right" onClick={onNextCategory} aria-label="Catégorie suivante">›</button>
      <div className="mobile-wardrobe-dock">
        <div className="mobile-dock-topline">
          <button type="button" className="mobile-dock-action" onClick={onReset}>Réinitialiser</button>
          <div className="mobile-current-category"><span>{category.icon}</span><div><small>VESTIAIRE</small><strong>{category.label}</strong></div></div>
          <button type="button" className="mobile-dock-action primary" onClick={onSave}>Valider</button>
        </div>
        {options}
      </div>
    </div>
  )
}
