import { useMemo, useState } from 'react'
import AvatarScene from './avatar/AvatarScene'
import { productionCharacter } from './avatar/productionCatalog'
import { useAvatarConfig } from './avatar/wardrobe/useAvatarConfig'
import WardrobeCategories from './avatar/wardrobe/WardrobeCategories'
import WardrobePanel from './avatar/wardrobe/WardrobePanel'
import MobileWardrobeControls from './avatar/wardrobe/MobileWardrobeControls'
import { getOutfitModelUrl } from './avatar/wardrobe/modularCatalog'
import {
  bottomOptions,
  gloveOptions,
  hairColors,
  headwearOptions,
  shoeOptions,
  skinTones,
  topOptions,
  wardrobeAssetById,
  wardrobeCategories,
  type WardrobeCategoryId,
} from './avatar/wardrobe/wardrobeCatalog'

function colorOf<T extends readonly { id: string; color: string }[]>(
  items: T,
  id: string | null | undefined,
  fallback: string,
) {
  return items.find((item) => item.id === id)?.color ?? fallback
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState<WardrobeCategoryId>('character')
  const [selectedId, setSelectedId] = useState(productionCharacter.id)
  const [sheetExpanded, setSheetExpanded] = useState(true)
  const [message, setMessage] = useState('')
  const { config, update, reset, randomize, save } = useAvatarConfig()

  const selected = useMemo(
    () => wardrobeAssetById.get(selectedId) ?? productionCharacter,
    [selectedId],
  )

  const modelUrl = '/assets/avatar/v3/base/avatar-neutral-rigged.glb'

  const skinColor = colorOf(skinTones, config.skinToneId, '#BC7F58')
  const hairColor = colorOf(hairColors, config.hairColorId, '#201A18')
  const topColor = colorOf(topOptions, config.outfit.topId, '#1457A6')
  const bottomColor = colorOf(bottomOptions, config.outfit.bottomId, '#1457A6')
  const helmetColor = colorOf(headwearOptions, config.outfit.headwearId, '#F4C430')
  const gloveColor = colorOf(gloveOptions, config.outfit.glovesId, '#F4C430')
  const shoeColor = colorOf(shoeOptions, config.outfit.shoesId, '#8A431F')

  function selectCategory(id: WardrobeCategoryId) {
    setActiveCategory(id)
    const category = wardrobeCategories.find((item) => item.id === id)
    if (category) setSelectedId(category.assetId)
    setSheetExpanded(true)
  }

  function moveCategory(direction: -1 | 1) {
    const currentIndex = Math.max(0, wardrobeCategories.findIndex((item) => item.id === activeCategory))
    const nextIndex = (currentIndex + direction + wardrobeCategories.length) % wardrobeCategories.length
    selectCategory(wardrobeCategories[nextIndex].id)
  }

  function notify(text: string) {
    setMessage(text)
    window.setTimeout(() => setMessage(''), 1800)
  }

  function handleReset() {
    reset()
    setActiveCategory('character')
    setSelectedId(productionCharacter.id)
    notify('Avatar réinitialisé')
  }

  function handleRandomize() {
    randomize()
    setActiveCategory('character')
    setSelectedId(productionCharacter.id)
    notify('Nouvelle combinaison 3D')
  }

  function handleSave() {
    save()
    notify('Avatar enregistré')
  }

  const title = wardrobeCategories.find((item) => item.id === activeCategory)?.label ?? 'Mon avatar'

  return (
    <main className="wardrobe-app">
      <aside className="desktop-sidebar">
        <div className="brand-block">
          <div className="brand-mark">MA</div>
          <div><strong>Maître Artisan</strong><span>Avatar Studio 3D</span></div>
        </div>
        <p className="collection-label">VESTIAIRE V3</p>
        <WardrobeCategories categories={wardrobeCategories} activeId={activeCategory} onSelect={selectCategory} className="desktop-categories" />
        <div className="production-badge">
          <span className="status-dot" />
          <div><strong>Vestiaire 3D actif</strong><span>Visages · cheveux · couleurs · accessoires</span></div>
        </div>
      </aside>

      <section className="avatar-workspace">
        <header className="mobile-topbar">
          <div className="mobile-brand"><span>MA</span><div><strong>Maître Artisan</strong><small>Mon avatar</small></div></div>
          <button type="button" onClick={handleReset}>Réinitialiser</button>
        </header>

        <header className="desktop-topbar">
          <div><p className="eyebrow">AVATAR STUDIO — V3 MODULAIRE</p><h1>{title}</h1></div>
          <button className="toolbar-button primary" type="button" onClick={handleSave}>Valider mon avatar</button>
        </header>

        <div className="avatar-stage">
          <div className="stage-copy"><span>Ton métier.</span><span>Ton avatar.</span><strong>Ta progression.</strong></div>

          <AvatarScene
            modelUrl={modelUrl}
            skinColor={skinColor}
            faceId={config.faceId}
            hairStyleId={config.hairStyleId}
            hairColor={hairColor}
            topColor={topColor}
            bottomColor={bottomColor}
            helmetColor={helmetColor}
            gloveColor={gloveColor}
            shoeColor={shoeColor}
            accessoryId={config.outfit.accessoryId}
            headwearId={config.outfit.headwearId}
          />

          <div className="model-chip"><span className="status-dot" /><div><strong>PERSONNAGE 3D</strong><span>Slots actifs dans le viewer</span></div></div>
          <div className="viewer-hint">Glisse pour faire pivoter</div>

          <MobileWardrobeControls
            activeCategory={activeCategory}
            config={config}
            onPreviousCategory={() => moveCategory(-1)}
            onNextCategory={() => moveCategory(1)}
            onUpdateConfig={update}
            onReset={handleReset}
            onSave={handleSave}
          />

          {message && <div className="toast">{message}</div>}
        </div>
      </section>

      <WardrobePanel
        selected={selected}
        activeCategory={activeCategory}
        expanded={sheetExpanded}
        config={config}
        onToggleExpanded={() => setSheetExpanded((value) => !value)}
        onSelectCategory={selectCategory}
        onUpdateConfig={update}
        onReset={handleReset}
        onRandomize={handleRandomize}
        onSave={handleSave}
      />
    </main>
  )
}
