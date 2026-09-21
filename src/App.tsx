import { useEffect, useMemo, useState } from 'react'
import Avatar2D, { type Avatar2DConfig } from './avatar/Avatar2D'

type PresetId = 'chantier' | 'electricien' | 'technicien' | 'peintre' | 'voirie'

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

const outfitPresets: Array<{
  id: PresetId
  label: string
  note: string
  config: Partial<Avatar2DConfig>
}> = [
  {
    id: 'chantier',
    label: 'Chantier',
    note: 'Salopette bleue + casque jaune',
    config: {
      top: 'tee-navy',
      bottom: 'overalls-blue',
      gloves: 'yellow',
      shoes: 'boots-brown',
      headwear: 'hardhat-yellow',
      accessory: 'none',
    },
  },
  {
    id: 'electricien',
    label: 'Électricien',
    note: 'Bleu + bandes réfléchissantes',
    config: {
      top: 'jacket-blue',
      bottom: 'pants-blue',
      gloves: 'yellow',
      shoes: 'boots-black',
      headwear: 'hardhat-blue',
      accessory: 'belt-electric',
    },
  },
  {
    id: 'technicien',
    label: 'Technicien CVC',
    note: 'Atelier olive + outils',
    config: {
      top: 'jacket-olive',
      bottom: 'cargo-olive',
      gloves: 'black',
      shoes: 'boots-brown',
      headwear: 'none',
      accessory: 'belt-mechanic',
    },
  },
  {
    id: 'peintre',
    label: 'Peintre',
    note: 'Blanc + accessoires peinture',
    config: {
      top: 'painter-top',
      bottom: 'painter-pants',
      gloves: 'white',
      shoes: 'boots-white',
      headwear: 'cap-white',
      accessory: 'belt-painter',
    },
  },
  {
    id: 'voirie',
    label: 'Voirie',
    note: 'Orange haute visibilité',
    config: {
      top: 'hivis-orange',
      bottom: 'cargo-dark',
      gloves: 'orange',
      shoes: 'boots-orange',
      headwear: 'hardhat-orange',
      accessory: 'pouch-orange',
    },
  },
]

function readSavedPreset(): PresetId {
  const value = localStorage.getItem('maitre-artisan-avatar-gallery-preset')
  return outfitPresets.some((preset) => preset.id === value)
    ? (value as PresetId)
    : 'chantier'
}

export default function App() {
  const [activePreset, setActivePreset] = useState<PresetId>(() => readSavedPreset())
  const [message, setMessage] = useState('')

  const selectedPreset = useMemo(
    () => outfitPresets.find((preset) => preset.id === activePreset) ?? outfitPresets[0],
    [activePreset],
  )

  const selectedConfig = useMemo(
    () => ({ ...defaultConfig, ...selectedPreset.config }),
    [selectedPreset],
  )

  useEffect(() => {
    localStorage.setItem('maitre-artisan-avatar-gallery-preset', activePreset)
  }, [activePreset])

  function notify(text: string) {
    setMessage(text)
    window.setTimeout(() => setMessage(''), 1600)
  }

  function choosePreset(id: PresetId) {
    setActivePreset(id)
  }

  function randomize() {
    const choices = outfitPresets.filter((preset) => preset.id !== activePreset)
    const next = choices[Math.floor(Math.random() * choices.length)] ?? outfitPresets[0]
    setActivePreset(next.id)
    notify('Nouvel avatar sélectionné')
  }

  function reset() {
    setActivePreset('chantier')
    notify('Galerie réinitialisée')
  }

  function save() {
    localStorage.setItem('maitre-artisan-avatar-gallery-preset', activePreset)
    notify('Avatar enregistré')
  }

  return (
    <main className="studio2d">
      <aside className="studio-nav">
        <div className="brand2d">
          <span className="helmet-logo">⌒</span>
          <div>
            <strong>Maître<br/>Artisan</strong>
            <small>BÂTIR DE MAIN</small>
          </div>
        </div>

        <nav aria-label="Galerie des avatars">
          <button className="active">
            <span>◆</span>
            <strong>Galerie</strong>
          </button>
        </nav>

        <div style={{ marginTop: 14, padding: '0 14px', color: '#9fb5d2', fontSize: 11, lineHeight: 1.45 }}>
          Les avatars sont désormais des rendus complets : aucun collage de vêtements ou de coiffures.
        </div>

        <button className="settings-link" onClick={reset}>↺ Réinitialiser</button>
      </aside>

      <section className="avatar-zone">
        <div className="mobile-studio-head">
          <div className="brand2d compact">
            <span className="helmet-logo">⌒</span>
            <div>
              <strong>Maître Artisan</strong>
              <small>Galerie avatars</small>
            </div>
          </div>
          <button onClick={save}>Valider</button>
        </div>

        <div className="stage-card">
          <div className="stage-message left">
            Un artisan<br/>d’aujourd’hui<br/><b>bâtit un monde<br/>meilleur !</b>
          </div>
          <div className="stage-message right">Crée.<br/>Équipe.<br/>Avance.</div>

          <Avatar2D
            config={selectedConfig}
            preset={activePreset}
            className="main-avatar"
          />

          <div className="stage-actions">
            <button onClick={randomize}>◈ Avatar aléatoire</button>
            <span>Avatar complet · sans collage</span>
          </div>
        </div>

        {message && <div className="toast2d">{message}</div>}
      </section>

      <aside className="wardrobe2d">
        <header>
          <div>
            <h1>Galerie d’avatars</h1>
            <p>Choisis un personnage complet. Le rendu affiché est exactement celui de la carte.</p>
          </div>
          <button className="validate2d" onClick={save}>✓ Valider mon avatar</button>
        </header>

        <section className="option-section">
          <div className="section-title">
            <div>
              <small>PERSONNAGES COMPLETS</small>
              <h2>Choisis ton avatar</h2>
            </div>
            <span>{selectedPreset.label}</span>
          </div>

          <div className="preset-grid">
            {outfitPresets.map((preset) => {
              const preview = { ...defaultConfig, ...preset.config }
              return (
                <button
                  key={preset.id}
                  className={'preset-card ' + (activePreset === preset.id ? 'active' : '')}
                  onClick={() => choosePreset(preset.id)}
                >
                  <div className="preset-preview">
                    <Avatar2D
                      config={preview}
                      preset={preset.id}
                      className="mini-avatar"
                    />
                  </div>
                  <div>
                    <strong>{preset.label}</strong>
                    <small>{preset.note}</small>
                  </div>
                </button>
              )
            })}
          </div>

          <div style={{
            marginTop: 18,
            padding: 14,
            border: '1px solid #e2e8f1',
            borderRadius: 14,
            background: '#f8fbff',
            color: '#60728c',
            fontSize: 11,
            lineHeight: 1.5,
          }}>
            Les prochaines coiffures, couleurs de peau et variantes seront ajoutées comme <b>nouveaux personnages complets</b>, pas comme des calques superposés.
          </div>
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
