import { useEffect, useMemo, useState } from 'react'
import Avatar2D, { type Avatar2DConfig } from './avatar/Avatar2D'

type CategoryId = 'avatar' | 'skin' | 'outfit' | 'expression' | 'hair' | 'headwear' | 'top' | 'bottom' | 'gloves' | 'shoes' | 'accessory'
type Option = { id: string; label: string; note?: string }

const categories: Array<{ id: CategoryId; label: string; icon: string }> = [
  { id: 'avatar', label: 'Avatar', icon: '⌂' },
  { id: 'skin', label: 'Peau', icon: '●' },
  { id: 'outfit', label: 'Tenue', icon: '◆' },
  { id: 'expression', label: 'Visage', icon: '☺' },
  { id: 'hair', label: 'Coiffure', icon: '◒' },
  { id: 'headwear', label: 'Casque', icon: '⌒' },
  { id: 'top', label: 'Haut', icon: 'T' },
  { id: 'bottom', label: 'Bas', icon: 'Ⅱ' },
  { id: 'gloves', label: 'Gants', icon: '✋' },
  { id: 'shoes', label: 'Chaussures', icon: '⌁' },
  { id: 'accessory', label: 'Accessoire', icon: '▣' },
]

const skinOptions: Option[] = [
  { id: 'clair', label: 'Clair' },
  { id: 'peche', label: 'Pêche' },
  { id: 'medium', label: 'Médium' },
  { id: 'brun', label: 'Brun' },
  { id: 'fonce', label: 'Foncé' },
]
const expressionOptions: Option[] = [
  { id: 'neutral', label: 'Neutre' },
  { id: 'happy', label: 'Heureux' },
  { id: 'determined', label: 'Déterminé' },
  { id: 'surprised', label: 'Surpris' },
  { id: 'sad', label: 'Triste' },
]
const hairOptions: Option[] = [
  { id: 'none', label: 'Sans cheveux' },
  { id: 'short', label: 'Court' },
  { id: 'side', label: 'Côté' },
  { id: 'spiky', label: 'Ébouriffé' },
  { id: 'curly', label: 'Bouclé' },
  { id: 'bob', label: 'Carré' },
  { id: 'middle', label: 'Raie milieu' },
  { id: 'classic', label: 'Classique' },
  { id: 'bun', label: 'Chignon' },
]
const headwearOptions: Option[] = [
  { id: 'none', label: 'Aucun' },
  { id: 'hardhat-yellow', label: 'Casque jaune' },
  { id: 'hardhat-blue', label: 'Casque bleu' },
  { id: 'hardhat-orange', label: 'Casque orange' },
  { id: 'cap-white', label: 'Casquette blanche' },
  { id: 'cap-gray', label: 'Casquette grise' },
  { id: 'beanie', label: 'Bonnet' },
]
const topOptions: Option[] = [
  { id: 'tank-gray', label: 'Débardeur gris' },
  { id: 'tee-navy', label: 'T-shirt marine' },
  { id: 'jacket-blue', label: 'Veste bleue' },
  { id: 'jacket-olive', label: 'Veste atelier' },
  { id: 'painter-top', label: 'Haut peintre' },
  { id: 'hivis-orange', label: 'Haute visibilité' },
]
const bottomOptions: Option[] = [
  { id: 'shorts-gray', label: 'Short gris' },
  { id: 'pants-blue', label: 'Pantalon bleu' },
  { id: 'overalls-blue', label: 'Salopette bleue' },
  { id: 'cargo-olive', label: 'Cargo atelier' },
  { id: 'painter-pants', label: 'Pantalon peintre' },
  { id: 'cargo-dark', label: 'Cargo sombre' },
]
const gloveOptions: Option[] = [
  { id: 'none', label: 'Sans gants' },
  { id: 'yellow', label: 'Jaunes' },
  { id: 'black', label: 'Noirs' },
  { id: 'orange', label: 'Renforcés' },
  { id: 'white', label: 'Peintre' },
  { id: 'blue', label: 'Bleus' },
]
const shoeOptions: Option[] = [
  { id: 'bare', label: 'Pieds nus' },
  { id: 'boots-brown', label: 'Bottes marron' },
  { id: 'boots-black', label: 'Bottes noires' },
  { id: 'boots-white', label: 'Bottes blanches' },
  { id: 'boots-orange', label: 'Bottes orange' },
  { id: 'shoes-blue', label: 'Chaussures bleues' },
]
const accessoryOptions: Option[] = [
  { id: 'none', label: 'Aucun' },
  { id: 'belt-brown', label: 'Ceinture cuir' },
  { id: 'belt-electric', label: 'Électricien' },
  { id: 'belt-mechanic', label: 'Technicien' },
  { id: 'belt-painter', label: 'Peintre' },
  { id: 'harness', label: 'Harnais HV' },
  { id: 'pouch-orange', label: 'Pochette outils' },
]
const hairColorOptions: Option[] = [
  { id: 'brun', label: 'Brun' },
  { id: 'chatain', label: 'Châtain' },
  { id: 'blond', label: 'Blond' },
  { id: 'noir', label: 'Noir' },
  { id: 'cuivre', label: 'Cuivré' },
]

const outfitPresets: Array<Option & { config: Partial<Avatar2DConfig> }> = [
  { id: 'chantier', label: 'Chantier', note: 'Salopette bleue + casque jaune', config: { top: 'tee-navy', bottom: 'overalls-blue', gloves: 'yellow', shoes: 'boots-brown', headwear: 'hardhat-yellow', accessory: 'none' } },
  { id: 'electricien', label: 'Électricien', note: 'Bleu + bandes réfléchissantes', config: { top: 'jacket-blue', bottom: 'pants-blue', gloves: 'yellow', shoes: 'boots-black', headwear: 'hardhat-blue', accessory: 'belt-electric' } },
  { id: 'technicien', label: 'Technicien CVC', note: 'Atelier olive + outils', config: { top: 'jacket-olive', bottom: 'cargo-olive', gloves: 'black', shoes: 'boots-brown', headwear: 'none', accessory: 'belt-mechanic' } },
  { id: 'peintre', label: 'Peintre', note: 'Blanc + accessoires peinture', config: { top: 'painter-top', bottom: 'painter-pants', gloves: 'white', shoes: 'boots-white', headwear: 'cap-white', accessory: 'belt-painter' } },
  { id: 'voirie', label: 'Voirie', note: 'Orange haute visibilité', config: { top: 'hivis-orange', bottom: 'cargo-dark', gloves: 'orange', shoes: 'boots-orange', headwear: 'hardhat-orange', accessory: 'pouch-orange' } },
]

const defaultConfig: Avatar2DConfig = {
  skin: 'peche',
  expression: 'neutral',
  hair: 'none',
  hairColor: 'brun',
  headwear: 'hardhat-yellow',
  top: 'tee-navy',
  bottom: 'overalls-blue',
  gloves: 'yellow',
  shoes: 'boots-brown',
  accessory: 'none',
}

function getOptions(category: CategoryId): Option[] {
  if (category === 'skin') return skinOptions
  if (category === 'expression') return expressionOptions
  if (category === 'hair') return hairOptions
  if (category === 'headwear') return headwearOptions
  if (category === 'top') return topOptions
  if (category === 'bottom') return bottomOptions
  if (category === 'gloves') return gloveOptions
  if (category === 'shoes') return shoeOptions
  if (category === 'accessory') return accessoryOptions
  return []
}

function configKey(category: CategoryId): keyof Avatar2DConfig | null {
  const map: Partial<Record<CategoryId, keyof Avatar2DConfig>> = {
    skin: 'skin', expression: 'expression', hair: 'hair', headwear: 'headwear',
    top: 'top', bottom: 'bottom', gloves: 'gloves', shoes: 'shoes', accessory: 'accessory',
  }
  return map[category] ?? null
}

function MiniAvatar({ config }: { config: Avatar2DConfig }) {
  return <Avatar2D config={config} className="mini-avatar" />
}

export default function App() {
  const [config, setConfig] = useState<Avatar2DConfig>(() => {
    try {
      const raw = localStorage.getItem('maitre-artisan-avatar-2d')
      return raw ? { ...defaultConfig, ...JSON.parse(raw) } : defaultConfig
    } catch { return defaultConfig }
  })
  const [activeCategory, setActiveCategory] = useState<CategoryId>('outfit')
  const [activePreset, setActivePreset] = useState('chantier')
  const [message, setMessage] = useState('')

  useEffect(() => {
    localStorage.setItem('maitre-artisan-avatar-2d', JSON.stringify(config))
  }, [config])

  const category = categories.find((item) => item.id === activeCategory) ?? categories[0]
  const options = useMemo(() => getOptions(activeCategory), [activeCategory])

  function notify(text: string) {
    setMessage(text)
    window.setTimeout(() => setMessage(''), 1600)
  }

  function updateSlot(categoryId: CategoryId, value: string) {
    const key = configKey(categoryId)
    if (!key) return
    setConfig((current) => {
      const next = { ...current, [key]: value }
      if (categoryId === 'hair' && value !== 'none') next.headwear = 'none'
      return next
    })
    setActivePreset('custom')
  }

  function applyPreset(id: string) {
    const preset = outfitPresets.find((item) => item.id === id)
    if (!preset) return
    setConfig((current) => ({ ...current, ...preset.config }))
    setActivePreset(id)
  }

  function reset() {
    setConfig(defaultConfig)
    setActivePreset('chantier')
    setActiveCategory('outfit')
    notify('Avatar réinitialisé')
  }

  function randomize() {
    const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)]
    setConfig({
      skin: pick(skinOptions).id,
      expression: pick(expressionOptions).id,
      hair: pick(hairOptions).id,
      hairColor: pick(hairColorOptions).id,
      headwear: pick(headwearOptions).id,
      top: pick(topOptions).id,
      bottom: pick(bottomOptions).id,
      gloves: pick(gloveOptions).id,
      shoes: pick(shoeOptions).id,
      accessory: pick(accessoryOptions).id,
    })
    setActivePreset('custom')
    notify('Nouvelle combinaison')
  }

  function save() {
    localStorage.setItem('maitre-artisan-avatar-2d', JSON.stringify(config))
    notify('Avatar enregistré')
  }

  return (
    <main className="studio2d">
      <aside className="studio-nav">
        <div className="brand2d"><span className="helmet-logo">⌒</span><div><strong>Maître<br/>Artisan</strong><small>BÂTIR DE MAIN</small></div></div>
        <nav aria-label="Catégories du vestiaire">
          {categories.map((item) => (
            <button key={item.id} className={activeCategory === item.id ? 'active' : ''} onClick={() => setActiveCategory(item.id)}>
              <span>{item.icon}</span><strong>{item.label}</strong>
            </button>
          ))}
        </nav>
        <button className="settings-link" onClick={reset}>⚙ Paramètres</button>
      </aside>

      <section className="avatar-zone">
        <div className="mobile-studio-head">
          <div className="brand2d compact"><span className="helmet-logo">⌒</span><div><strong>Maître Artisan</strong><small>Vestiaire 2D</small></div></div>
          <button onClick={save}>Valider</button>
        </div>

        <div className="stage-card">
          <div className="stage-message left">Un artisan<br/>d’aujourd’hui<br/><b>bâtit un monde<br/>meilleur !</b></div>
          <div className="stage-message right">Crée.<br/>Équipe.<br/>Avance.</div>
          <Avatar2D config={config} className="main-avatar" />
          <div className="stage-actions">
            <button onClick={randomize}>◈ Avatar aléatoire</button>
            <span>Vestiaire 2D interactif</span>
          </div>
        </div>
        {message && <div className="toast2d">{message}</div>}
      </section>

      <aside className="wardrobe2d">
        <header>
          <div><h1>Vestiaire V3</h1><p>Choisis ton équipement et personnalise ton avatar.</p></div>
          <button className="validate2d" onClick={save}>✓ Valider mon avatar</button>
        </header>

        <div className="mobile-category-row">
          {categories.map((item) => (
            <button key={item.id} className={activeCategory === item.id ? 'active' : ''} onClick={() => setActiveCategory(item.id)}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </div>

        <section className="option-section">
          <div className="section-title"><div><small>PERSONNALISATION</small><h2>{category.label}</h2></div><span>{activePreset === 'custom' ? 'Personnalisé' : 'Tenue ' + activePreset}</span></div>

          {(activeCategory === 'outfit' || activeCategory === 'avatar') && (
            <div className="preset-grid">
              {outfitPresets.map((preset) => {
                const preview = { ...config, ...preset.config }
                return (
                  <button key={preset.id} className={'preset-card ' + (activePreset === preset.id ? 'active' : '')} onClick={() => applyPreset(preset.id)}>
                    <div className="preset-preview"><MiniAvatar config={preview} /></div>
                    <div><strong>{preset.label}</strong><small>{preset.note}</small></div>
                  </button>
                )
              })}
            </div>
          )}

          {activeCategory !== 'outfit' && activeCategory !== 'avatar' && (
            <div className="option-grid">
              {options.map((option) => {
                const key = configKey(activeCategory)
                const selected = key ? config[key] === option.id : false
                const preview = key ? { ...config, [key]: option.id } : config
                return (
                  <button key={option.id} className={'option-card ' + (selected ? 'active' : '')} onClick={() => updateSlot(activeCategory, option.id)} aria-label={option.label}>
                    <div className="option-preview"><MiniAvatar config={preview} /></div>
                    <strong>{option.label}</strong>
                  </button>
                )
              })}
            </div>
          )}

          {activeCategory === 'hair' && (
            <div className="hair-color-row">
              <span>Couleur</span>
              {hairColorOptions.map((item) => (
                <button key={item.id} title={item.label} aria-label={item.label} className={config.hairColor === item.id ? 'active' : ''} data-color={item.id} onClick={() => { setConfig((c) => ({ ...c, hairColor: item.id })); setActivePreset('custom') }} />
              ))}
            </div>
          )}
        </section>

        <footer className="wardrobe-footer">
          <button onClick={reset}>Réinitialiser</button>
          <button onClick={randomize}>Aléatoire</button>
          <button className="primary" onClick={save}>Valider</button>
        </footer>
      </aside>
    </main>
  )
}
