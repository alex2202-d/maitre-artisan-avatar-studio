import { useMemo, useState } from 'react'
import AvatarScene from './avatar/AvatarScene'
import { productionCharacter } from './avatar/productionCatalog'
import { useAvatarConfig } from './avatar/wardrobe/useAvatarConfig'
import WardrobeCategories from './avatar/wardrobe/WardrobeCategories'
import WardrobePanel from './avatar/wardrobe/WardrobePanel'
import MobileWardrobeControls from './avatar/wardrobe/MobileWardrobeControls'
import {
  wardrobeAssetById,
  wardrobeCategories,
  type WardrobeCategoryId,
} from './avatar/wardrobe/wardrobeCatalog'

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

  function selectCategory(id: WardrobeCategoryId) {
    setActiveCategory(id)
    const category = wardrobeCategories.find((item) => item.id === id)
    if (category) setSelectedId(category.assetId)
    setSheetExpanded(true)
  }

  function moveCategory(direction: -1 | 1) {
    const currentIndex = Math.max(
      0,
      wardrobeCategories.findIndex((item) => item.id === activeCategory),
    )
    const nextIndex =
      (currentIndex + direction + wardrobeCategories.length) % wardrobeCategories.length
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
    notify('Nouvelle combinaison')
  }

  function handleSave() {
    save()
    notify('Avatar enregistré')
  }

  return (
    <main className="wardrobe-app">
      <aside className="desktop-sidebar">
        <div className="brand-block">
          <div className="brand-mark">MA</div>
          <div>
            <strong>Maître Artisan</strong>
            <span>Avatar Studio 3D</span>
          </div>
        </div>

        <p className="collection-label">VESTIAIRE V2</p>
        <WardrobeCategories
          categories={wardrobeCategories}
          activeId={activeCategory}
          onSelect={selectCategory}
          className="desktop-categories"
        />

        <div className="production-badge">
          <span className="status-dot" />
          <div>
            <strong>Pack final installé</strong>
            <span>Avatar · peau · 5 modules 3D</span>
          </div>
        </div>
      </aside>

      <section className="avatar-workspace">
        <header className="mobile-topbar">
          <div className="mobile-brand">
            <span>MA</span>
            <div>
              <strong>Maître Artisan</strong>
              <small>Mon avatar</small>
            </div>
          </div>
          <button type="button" onClick={handleReset}>Réinitialiser</button>
        </header>

        <header className="desktop-topbar">
          <div>
            <p className="eyebrow">AVATAR STUDIO — V2</p>
            <h1>{activeCategory === 'skin' ? 'Teinte de peau' : selected.kind === 'character' ? 'Mon avatar' : selected.label}</h1>
          </div>
          <button className="toolbar-button primary" type="button" onClick={handleSave}>
            Valider mon avatar
          </button>
        </header>

        <div className="avatar-stage">
          <div className="stage-copy">
            <span>Ton métier.</span>
            <span>Ton avatar.</span>
            <strong>Ta progression.</strong>
          </div>

          <AvatarScene
            modelUrl={productionCharacter.modelUrl}
            kind="character"
            skinToneId={config.skinToneId}
          />

          <div className="model-chip">
            <span className="status-dot" />
            <div>
              <strong>PERSONNAGE RIGGÉ</strong>
              <span>{activeCategory === 'skin' ? 'Teinte personnalisée' : 'Aperçu sur avatar'}</span>
            </div>
          </div>

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
