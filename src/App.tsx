import { useEffect, useState } from 'react'
import AvatarScene from './avatar/AvatarScene'
import {
  defaultAvatarConfig,
  type AvatarConfig,
  type TopStyle,
} from './avatar/types'

const STORAGE_KEY = 'maitre-artisan-avatar-studio:v1'

function loadConfig(): AvatarConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...defaultAvatarConfig, ...JSON.parse(raw) } : defaultAvatarConfig
  } catch {
    return defaultAvatarConfig
  }
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="color-field">
      <span>{label}</span>
      <span className="color-control">
        <input
          aria-label={label}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <code>{value.toUpperCase()}</code>
      </span>
    </label>
  )
}

export default function App() {
  const [config, setConfig] = useState<AvatarConfig>(loadConfig)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  }, [config])

  function update<K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]) {
    setConfig((current) => ({ ...current, [key]: value }))
  }

  const randomize = () => {
    const tops: TopStyle[] = ['tee', 'hoodie', 'work-jacket']
    const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)]
    const colors = ['#B83A3A', '#D56B28', '#D1A72C', '#2D6B62', '#345B88', '#4E445F', '#353A40']
    const skins = ['#F1C39A', '#D7A06F', '#B9784D', '#8D573B', '#5F382B']

    setConfig((current) => ({
      ...current,
      skinColor: pick(skins),
      topStyle: pick(tops),
      topColor: pick(colors),
      pantsColor: pick(colors),
      beanie: Math.random() > 0.45,
      beanieColor: pick(colors),
    }))
  }

  const copyJson = async () => {
    const serialized = JSON.stringify(config, null, 2)
    try {
      await navigator.clipboard.writeText(serialized)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      window.prompt('Copie cette configuration JSON :', serialized)
    }
  }

  return (
    <main className="studio-shell">
      <section className="viewer-panel">
        <header className="viewer-header">
          <div>
            <p className="eyebrow">MAÎTRE ARTISAN</p>
            <h1>Avatar Studio 3D</h1>
          </div>
          <span className="status-pill">Prototype indépendant</span>
        </header>

        <div className="viewer-stage">
          <AvatarScene config={config} />
          <div className="viewer-hint">Glisse pour tourner · pince/molette pour zoomer</div>
        </div>
      </section>

      <aside className="wardrobe-panel">
        <div className="wardrobe-heading">
          <div>
            <p className="eyebrow">PERSONNAGE ÉTALON</p>
            <h2>Vestiaire</h2>
          </div>
          <button className="ghost-button" onClick={randomize}>Aléatoire</button>
        </div>

        <section className="control-section">
          <h3>Haut</h3>
          <div className="segmented-grid">
            {([
              ['tee', 'T-shirt'],
              ['hoodie', 'Sweat'],
              ['work-jacket', 'Veste chantier'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                className={config.topStyle === value ? 'choice active' : 'choice'}
                onClick={() => update('topStyle', value)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="control-section">
          <h3>Couleurs</h3>
          <div className="color-list">
            <ColorField label="Peau" value={config.skinColor} onChange={(value) => update('skinColor', value)} />
            <ColorField label="Haut" value={config.topColor} onChange={(value) => update('topColor', value)} />
            <ColorField label="Pantalon" value={config.pantsColor} onChange={(value) => update('pantsColor', value)} />
            <ColorField label="Chaussures" value={config.shoeColor} onChange={(value) => update('shoeColor', value)} />
          </div>
        </section>

        <section className="control-section">
          <div className="section-row">
            <div>
              <h3>Bonnet</h3>
              <p className="muted">Premier accessoire 3D interchangeable.</p>
            </div>
            <button
              className={config.beanie ? 'toggle active' : 'toggle'}
              aria-pressed={config.beanie}
              onClick={() => update('beanie', !config.beanie)}
            >
              {config.beanie ? 'ON' : 'OFF'}
            </button>
          </div>
          {config.beanie && (
            <ColorField label="Couleur bonnet" value={config.beanieColor} onChange={(value) => update('beanieColor', value)} />
          )}
        </section>

        <section className="control-section technical-card">
          <div>
            <h3>Configuration prête pour V2</h3>
            <p className="muted">Chaque choix est sauvegardé localement et sérialisable en JSON.</p>
          </div>
          <div className="action-row">
            <button className="primary-button" onClick={copyJson}>{copied ? 'JSON copié' : 'Copier le JSON'}</button>
            <button className="ghost-button" onClick={() => setConfig(defaultAvatarConfig)}>Réinitialiser</button>
          </div>
        </section>
      </aside>
    </main>
  )
}
