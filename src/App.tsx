import { useEffect, useMemo, useState } from 'react'
import AvatarScene from './avatar/AvatarScene'
import {
  expressionOptions,
  garmentPalette,
  hairOptions,
  headwearOptions,
  headwearPalette,
  morphologyOptions,
  pantsOptions,
  shoeOptions,
  skinPalette,
  topOptions,
} from './avatar/catalog'
import { loadAvatarConfig, saveAvatarConfig, serializeAvatarConfig } from './avatar/config'
import { defaultAvatarConfig, type AvatarConfig } from './avatar/types'

type SectionId = 'body' | 'face' | 'hair' | 'tops' | 'pants' | 'shoes' | 'headwear' | 'accessories' | 'colors'

const sections: { id: SectionId; label: string; icon: string }[] = [
  { id: 'body', label: 'Corps', icon: '●' },
  { id: 'face', label: 'Visage', icon: '◉' },
  { id: 'hair', label: 'Cheveux', icon: '✦' },
  { id: 'tops', label: 'Hauts', icon: '▣' },
  { id: 'pants', label: 'Pantalons', icon: '▥' },
  { id: 'shoes', label: 'Chaussures', icon: '◒' },
  { id: 'headwear', label: 'Couvre-chefs', icon: '⌒' },
  { id: 'accessories', label: 'Accessoires', icon: '✚' },
  { id: 'colors', label: 'Couleurs', icon: '●' },
]

function OptionGrid<T extends string>({
  options,
  value,
  onChange,
  compact = false,
}: {
  options: { id: T; label: string }[]
  value: T
  onChange: (value: T) => void
  compact?: boolean
}) {
  return (
    <div className={compact ? 'option-grid compact' : 'option-grid'}>
      {options.map((option) => (
        <button
          key={option.id}
          className={value === option.id ? 'option-card active' : 'option-card'}
          onClick={() => onChange(option.id)}
        >
          <span className="option-preview" aria-hidden="true" />
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  )
}

function Palette({ value, colors, onChange }: { value: string; colors: string[]; onChange: (color: string) => void }) {
  return (
    <div className="palette-row">
      {colors.map((color) => (
        <button
          key={color}
          aria-label={`Couleur ${color}`}
          className={value.toUpperCase() === color.toUpperCase() ? 'swatch active' : 'swatch'}
          style={{ background: color }}
          onClick={() => onChange(color)}
        />
      ))}
      <label className="custom-color" title="Couleur personnalisée">
        +
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} />
      </label>
    </div>
  )
}

export default function App() {
  const [config, setConfig] = useState<AvatarConfig>(loadAvatarConfig)
  const [activeSection, setActiveSection] = useState<SectionId>('body')
  const [message, setMessage] = useState('')

  useEffect(() => {
    saveAvatarConfig(config)
  }, [config])

  const serialized = useMemo(() => serializeAvatarConfig(config), [config])

  function update<K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]) {
    setConfig((current) => ({ ...current, [key]: value }))
  }

  function notify(text: string) {
    setMessage(text)
    window.setTimeout(() => setMessage(''), 1500)
  }

  const randomize = () => {
    const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)]
    setConfig((current) => ({
      ...current,
      morphology: pick(morphologyOptions).id,
      skinColor: pick(skinPalette),
      expression: pick(expressionOptions).id,
      hairStyle: pick(hairOptions).id,
      hairColor: pick(garmentPalette),
      topStyle: pick(topOptions).id,
      topColor: pick(garmentPalette),
      pantsStyle: pick(pantsOptions).id,
      pantsColor: pick(garmentPalette),
      shoeStyle: pick(shoeOptions).id,
      shoeColor: pick(['#211F20', '#352C29', '#4B382C', '#1E2835']),
      headwear: pick(headwearOptions).id,
      headwearColor: pick(headwearPalette),
      gloves: Math.random() > 0.45,
      toolbelt: Math.random() > 0.25,
    }))
    notify('Personnage aléatoire généré')
  }

  const exportJson = async () => {
    try {
      await navigator.clipboard.writeText(serialized)
      notify('Configuration JSON copiée')
    } catch {
      window.prompt('Copie cette configuration JSON :', serialized)
    }
  }

  const downloadJson = () => {
    const blob = new Blob([serialized], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'maitre-artisan-avatar.json'
    anchor.click()
    URL.revokeObjectURL(url)
    notify('Configuration exportée')
  }

  return (
    <main className="studio-layout">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">MA</div>
          <div>
            <strong>Maître Artisan</strong>
            <span>Avatar Studio 3D</span>
          </div>
        </div>

        <nav className="studio-nav" aria-label="Catégories du vestiaire">
          {sections.map((section) => (
            <button
              key={section.id}
              className={activeSection === section.id ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="nav-icon">{section.icon}</span>
              <span>{section.label}</span>
            </button>
          ))}
        </nav>

        <button className="random-button" onClick={randomize}>↻ Personnage aléatoire</button>
      </aside>

      <section className="viewer-column">
        <header className="topbar">
          <div>
            <p className="eyebrow">PERSONNAGE ÉTALON — GATE 0</p>
            <h1>Vestiaire 3D modulaire</h1>
          </div>
          <div className="top-actions">
            <button className="toolbar-button" onClick={() => notify('Sauvegardé automatiquement')}>▣ Sauvegarder</button>
            <button className="toolbar-button" onClick={downloadJson}>⇧ Exporter</button>
          </div>
        </header>

        <div className="viewer-stage premium">
          <div className="stage-copy">
            <span>Ton métier.</span>
            <span>Ton avatar.</span>
            <strong>Ta progression.</strong>
          </div>
          <AvatarScene config={config} />
          <div className="viewer-hint">Glisse pour tourner · pince/molette pour zoomer</div>
          {message && <div className="toast">{message}</div>}
        </div>
      </section>

      <aside className="wardrobe-panel light-panel">
        <div className="wardrobe-heading">
          <div>
            <p className="eyebrow blue">CONFIGURATION RÉELLE</p>
            <h2>{sections.find((section) => section.id === activeSection)?.label}</h2>
          </div>
          <button className="small-reset" onClick={() => setConfig(defaultAvatarConfig)}>Reset</button>
        </div>

        {activeSection === 'body' && (
          <>
            <section className="control-section first">
              <h3>Morphologie</h3>
              <OptionGrid options={morphologyOptions} value={config.morphology} onChange={(value) => update('morphology', value)} />
            </section>
            <section className="control-section">
              <h3>Teinte de peau</h3>
              <Palette value={config.skinColor} colors={skinPalette} onChange={(color) => update('skinColor', color)} />
            </section>
          </>
        )}

        {activeSection === 'face' && (
          <section className="control-section first">
            <h3>Expression</h3>
            <OptionGrid options={expressionOptions} value={config.expression} onChange={(value) => update('expression', value)} compact />
          </section>
        )}

        {activeSection === 'hair' && (
          <>
            <section className="control-section first">
              <h3>Coiffure</h3>
              <OptionGrid options={hairOptions} value={config.hairStyle} onChange={(value) => update('hairStyle', value)} />
            </section>
            <section className="control-section">
              <h3>Couleur des cheveux</h3>
              <Palette value={config.hairColor} colors={['#221B18', '#4A3023', '#7B5130', '#B27A45', '#D4B276', '#151619']} onChange={(color) => update('hairColor', color)} />
            </section>
          </>
        )}

        {activeSection === 'tops' && (
          <>
            <section className="control-section first">
              <h3>Haut</h3>
              <OptionGrid options={topOptions} value={config.topStyle} onChange={(value) => update('topStyle', value)} />
            </section>
            <section className="control-section">
              <h3>Couleur</h3>
              <Palette value={config.topColor} colors={garmentPalette} onChange={(color) => update('topColor', color)} />
            </section>
          </>
        )}

        {activeSection === 'pants' && (
          <>
            <section className="control-section first">
              <h3>Pantalon</h3>
              <OptionGrid options={pantsOptions} value={config.pantsStyle} onChange={(value) => update('pantsStyle', value)} />
            </section>
            <section className="control-section">
              <h3>Couleur</h3>
              <Palette value={config.pantsColor} colors={garmentPalette} onChange={(color) => update('pantsColor', color)} />
            </section>
          </>
        )}

        {activeSection === 'shoes' && (
          <>
            <section className="control-section first">
              <h3>Chaussures</h3>
              <OptionGrid options={shoeOptions} value={config.shoeStyle} onChange={(value) => update('shoeStyle', value)} />
            </section>
            <section className="control-section">
              <h3>Couleur</h3>
              <Palette value={config.shoeColor} colors={['#17191C', '#352C29', '#554035', '#253143', '#E8E6E0']} onChange={(color) => update('shoeColor', color)} />
            </section>
          </>
        )}

        {activeSection === 'headwear' && (
          <>
            <section className="control-section first">
              <h3>Couvre-chef</h3>
              <OptionGrid options={headwearOptions} value={config.headwear} onChange={(value) => update('headwear', value)} />
            </section>
            {config.headwear !== 'none' && (
              <section className="control-section">
                <h3>Couleur</h3>
                <Palette value={config.headwearColor} colors={headwearPalette} onChange={(color) => update('headwearColor', color)} />
              </section>
            )}
          </>
        )}

        {activeSection === 'accessories' && (
          <section className="control-section first accessory-list">
            <button className={config.gloves ? 'accessory-toggle active' : 'accessory-toggle'} onClick={() => update('gloves', !config.gloves)}>
              <span>Gants de chantier</span><strong>{config.gloves ? 'ON' : 'OFF'}</strong>
            </button>
            <button className={config.toolbelt ? 'accessory-toggle active' : 'accessory-toggle'} onClick={() => update('toolbelt', !config.toolbelt)}>
              <span>Ceinture à outils</span><strong>{config.toolbelt ? 'ON' : 'OFF'}</strong>
            </button>
            {config.gloves && (
              <div className="inline-palette">
                <span>Couleur des gants</span>
                <Palette value={config.gloveColor} colors={['#E5A923', '#D35A42', '#202733', '#ECEAE5']} onChange={(color) => update('gloveColor', color)} />
              </div>
            )}
          </section>
        )}

        {activeSection === 'colors' && (
          <section className="control-section first color-stack">
            <div><h3>Peau</h3><Palette value={config.skinColor} colors={skinPalette} onChange={(color) => update('skinColor', color)} /></div>
            <div><h3>Haut</h3><Palette value={config.topColor} colors={garmentPalette} onChange={(color) => update('topColor', color)} /></div>
            <div><h3>Pantalon</h3><Palette value={config.pantsColor} colors={garmentPalette} onChange={(color) => update('pantsColor', color)} /></div>
            <div><h3>Couvre-chef</h3><Palette value={config.headwearColor} colors={headwearPalette} onChange={(color) => update('headwearColor', color)} /></div>
          </section>
        )}

        <section className="config-proof">
          <div>
            <strong>Configurable, pas figé</strong>
            <span>{config.morphology} · {config.topStyle} · {config.pantsStyle} · {config.headwear}</span>
          </div>
          <button onClick={exportJson}>Copier JSON</button>
        </section>
      </aside>
    </main>
  )
}
