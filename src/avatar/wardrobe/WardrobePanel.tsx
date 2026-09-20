import type { AvatarConfigV3 } from './avatarConfig'
import type { ProductionAsset } from '../productionCatalog'
import AvatarActions from './AvatarActions'
import WardrobeCategories from './WardrobeCategories'
import {
  accessoryOptions,
  bottomOptions,
  faceOptions,
  gloveOptions,
  hairColors,
  hairOptions,
  headwearOptions,
  outfitPresets,
  shoeOptions,
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
  config: AvatarConfigV3
  onToggleExpanded: () => void
  onSelectCategory: (id: WardrobeCategoryId) => void
  onUpdateConfig: (patch: Partial<AvatarConfigV3>) => void
  onReset: () => void
  onRandomize: () => void
  onSave: () => void
}) {
  const heading = wardrobeCategories.find((item) => item.id === activeCategory)?.label ?? selected.shortLabel

  const renderColorOptions = (
    items: readonly { id: string; label: string; color: string }[],
    selectedId: string | null,
    apply: (id: string) => void,
    label: string,
  ) => (
    <section className="personalization-card">
      <p>{label}</p>
      <div className="outfit-grid" role="list">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={selectedId === item.id ? 'outfit-choice active' : 'outfit-choice'}
            onClick={() => apply(item.id)}
            aria-label={item.label}
            aria-pressed={selectedId === item.id}
          >
            <span className="outfit-color" style={{ backgroundColor: item.color }} />
            <span className="outfit-copy"><strong>{item.label}</strong><small>Variation 3D appliquée au personnage.</small></span>
          </button>
        ))}
      </div>
    </section>
  )

  let content

  if (activeCategory === 'skin') {
    content = (
      <section className="personalization-card">
        <p>Choisis la teinte de peau.</p>
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
    )
  } else if (activeCategory === 'outfit') {
    content = (
      <section className="personalization-card">
        <p>Choisis une base métier riggée.</p>
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
              <span className="outfit-copy"><strong>{item.label}</strong><small>{item.description}</small></span>
            </button>
          ))}
        </div>
      </section>
    )
  } else if (activeCategory === 'face') {
    content = (
      <section className="personalization-card">
        <p>Quatre visages construits en géométrie 3D : aucun filtre ou calque 2D.</p>
        <div className="face-choice-grid" role="list" aria-label="Visages 3D">
          {faceOptions.map((face) => (
            <button
              key={face.id}
              type="button"
              className={config.faceId === face.id ? 'face-choice active' : 'face-choice'}
              onClick={() => onUpdateConfig({ faceId: face.id })}
              aria-label={face.label}
              aria-pressed={config.faceId === face.id}
            >
              <span className="face-glyph face-classic">
                <i className="eye left" /><i className="eye right" /><i className="mouth" />
              </span>
              <span><strong>{face.label}</strong><small>{face.description}</small></span>
            </button>
          ))}
        </div>
      </section>
    )
  } else if (activeCategory === 'hair') {
    content = (
      <>
        <section className="personalization-card">
          <p>Choisis une coupe 3D.</p>
          <div className="outfit-grid" role="list" aria-label="Coiffures">
            {hairOptions.map((item) => (
              <button
                key={item.id}
                type="button"
                className={config.hairStyleId === item.id ? 'outfit-choice active' : 'outfit-choice'}
                onClick={() => onUpdateConfig({ hairStyleId: item.id })}
                aria-label={item.label}
                aria-pressed={config.hairStyleId === item.id}
              >
                <span className="outfit-copy"><strong>{item.label}</strong><small>{item.description}</small></span>
              </button>
            ))}
          </div>
        </section>
        <section className="personalization-card">
          <p>Couleur des cheveux.</p>
          <div className="skin-tone-grid" role="list" aria-label="Couleurs de cheveux">
            {hairColors.map((tone) => (
              <button
                key={tone.id}
                type="button"
                className={config.hairColorId === tone.id ? 'skin-tone active' : 'skin-tone'}
                onClick={() => onUpdateConfig({ hairColorId: tone.id })}
                aria-label={tone.label}
                aria-pressed={config.hairColorId === tone.id}
              >
                <span style={{ backgroundColor: tone.color }} /><strong>{tone.label}</strong>
              </button>
            ))}
          </div>
        </section>
      </>
    )
  } else if (activeCategory === 'headwear') {
    content = renderColorOptions(
      headwearOptions,
      config.outfit.headwearId,
      (id) => onUpdateConfig({ outfit: { ...config.outfit, headwearId: id } }),
      'Choisis la couleur du casque de chantier.',
    )
  } else if (activeCategory === 'top') {
    content = renderColorOptions(
      topOptions,
      config.outfit.topId,
      (id) => onUpdateConfig({ outfit: { ...config.outfit, topId: id } }),
      'Choisis ton haut de travail.',
    )
  } else if (activeCategory === 'bottom') {
    content = renderColorOptions(
      bottomOptions,
      config.outfit.bottomId,
      (id) => onUpdateConfig({ outfit: { ...config.outfit, bottomId: id } }),
      'Choisis ton bas de travail.',
    )
  } else if (activeCategory === 'gloves') {
    content = renderColorOptions(
      gloveOptions,
      config.outfit.glovesId,
      (id) => onUpdateConfig({ outfit: { ...config.outfit, glovesId: id } }),
      'Choisis tes gants.',
    )
  } else if (activeCategory === 'shoes') {
    content = renderColorOptions(
      shoeOptions,
      config.outfit.shoesId,
      (id) => onUpdateConfig({ outfit: { ...config.outfit, shoesId: id } }),
      'Choisis tes chaussures.',
    )
  } else if (activeCategory === 'accessory') {
    content = (
      <section className="personalization-card">
        <p>Ajoute un accessoire 3D.</p>
        <div className="outfit-grid" role="list" aria-label="Accessoires">
          {accessoryOptions.map((item) => (
            <button
              key={item.id}
              type="button"
              className={config.outfit.accessoryId === item.id ? 'outfit-choice active' : 'outfit-choice'}
              onClick={() => onUpdateConfig({ outfit: { ...config.outfit, accessoryId: item.id } })}
              aria-label={item.label}
              aria-pressed={config.outfit.accessoryId === item.id}
            >
              <span className="outfit-copy"><strong>{item.label}</strong><small>{item.description}</small></span>
            </button>
          ))}
        </div>
      </section>
    )
  } else {
    content = (
      <>
        <section className="mobile-selected-card">
          <div className="mobile-selected-preview"><img src={selected.previewUrl} alt="" /></div>
          <div><span>{selected.category}</span><strong>{selected.label}</strong><p>Tous les onglets du vestiaire disposent maintenant d’options actives.</p></div>
        </section>
        <section className="mobile-proof-row"><span>3D</span><span>Sauvegardé</span><span>Personnalisable</span></section>
      </>
    )
  }

  return (
    <aside className={expanded ? 'wardrobe-shell expanded' : 'wardrobe-shell'} aria-label="Vestiaire">
      <button type="button" className="sheet-handle" aria-label={expanded ? 'Réduire le vestiaire' : 'Ouvrir le vestiaire'} onClick={onToggleExpanded}><span /></button>
      <div className="mobile-category-strip">
        <WardrobeCategories categories={wardrobeCategories} activeId={activeCategory} onSelect={onSelectCategory} />
      </div>
      <div className="wardrobe-panel-content">
        <div className="wardrobe-heading">
          <div><p className="eyebrow blue">VESTIAIRE V3</p><h2>{heading}</h2></div>
          <span className="ready-pill">ACTIF</span>
        </div>
        {content}
        <AvatarActions onReset={onReset} onRandomize={onRandomize} onSave={onSave} />
      </div>
    </aside>
  )
}
