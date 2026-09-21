import { useEffect, useMemo, useState } from 'react'
import Avatar2D, { type AvatarPresetId } from './avatar/Avatar2D'

type AvatarCard = {
  id: AvatarPresetId
  label: string
  trade: string
  description: string
  tag: string
}

const avatars: AvatarCard[] = [
  {
    id: 'chantier',
    label: 'Chantier',
    trade: 'Bâtiment',
    description: 'Casque jaune · salopette bleue · gants de chantier',
    tag: 'Polyvalent',
  },
  {
    id: 'electricien',
    label: 'Électricien',
    trade: 'Électricité',
    description: 'Tenue bleue · casque bleu · équipement métier',
    tag: 'Élec',
  },
  {
    id: 'technicien',
    label: 'Technicien CVC',
    trade: 'Climatisation',
    description: 'Tenue atelier kaki · chaussures de sécurité · outils',
    tag: 'CVC',
  },
  {
    id: 'peintre',
    label: 'Peintre',
    trade: 'Finition',
    description: 'Tenue blanche · accessoires peinture · chaussures claires',
    tag: 'Peinture',
  },
  {
    id: 'voirie',
    label: 'Voirie',
    trade: 'Travaux publics',
    description: 'Haute visibilité orange · casque · tenue extérieure',
    tag: 'TP',
  },
]

function readSaved(): AvatarPresetId {
  const saved = localStorage.getItem('maitre-artisan-avatar-gallery-preset')
  return avatars.some((avatar) => avatar.id === saved)
    ? (saved as AvatarPresetId)
    : 'chantier'
}

export default function App() {
  const [selectedId, setSelectedId] = useState<AvatarPresetId>(() => readSaved())
  const [message, setMessage] = useState('')
  const selected = useMemo(
    () => avatars.find((avatar) => avatar.id === selectedId) ?? avatars[0],
    [selectedId],
  )

  useEffect(() => {
    localStorage.setItem('maitre-artisan-avatar-gallery-preset', selectedId)
  }, [selectedId])

  function notify(text: string) {
    setMessage(text)
    window.setTimeout(() => setMessage(''), 1500)
  }

  function randomize() {
    const others = avatars.filter((avatar) => avatar.id !== selectedId)
    const next = others[Math.floor(Math.random() * others.length)] ?? avatars[0]
    setSelectedId(next.id)
    notify('Nouvel avatar sélectionné')
  }

  function save() {
    localStorage.setItem('maitre-artisan-avatar-gallery-preset', selectedId)
    notify('Avatar enregistré')
  }

  return (
    <main className="gallery-shell">
      <aside className="gallery-nav">
        <div className="gallery-brand">
          <span className="gallery-logo">⌒</span>
          <div>
            <strong>Maître<br/>Artisan</strong>
            <small>AVATAR STUDIO</small>
          </div>
        </div>

        <div className="gallery-nav-active">
          <span>◆</span>
          <strong>Galerie</strong>
        </div>

        <p className="gallery-nav-copy">
          Personnages complets uniquement.<br/>
          Aucun vêtement, cheveu ou accessoire n’est collé par-dessus.
        </p>

        <div className="gallery-version">GALERIE V1 · 5 AVATARS</div>
      </aside>

      <section className="gallery-stage">
        <div className="gallery-stage-card">
          <div className="gallery-stage-copy left">
            Un artisan<br/>d’aujourd’hui<br/><b>bâtit un monde<br/>meilleur !</b>
          </div>
          <div className="gallery-stage-copy right">
            Crée.<br/>Choisis.<br/>Avance.
          </div>

          <Avatar2D preset={selected.id} className="gallery-main-avatar" />

          <div className="gallery-stage-meta">
            <div>
              <span>{selected.trade}</span>
              <strong>{selected.label}</strong>
              <small>{selected.description}</small>
            </div>
            <button onClick={randomize}>◈ Avatar aléatoire</button>
          </div>
        </div>
        {message && <div className="gallery-toast">{message}</div>}
      </section>

      <aside className="gallery-panel">
        <header className="gallery-header">
          <div>
            <small>VESTIAIRE</small>
            <h1>Galerie de personnages</h1>
            <p>Choisis un avatar complet. Le grand aperçu est exactement le même rendu que la carte.</p>
          </div>
          <button onClick={save} className="gallery-save">✓ Valider</button>
        </header>

        <div className="gallery-grid">
          {avatars.map((avatar) => (
            <button
              key={avatar.id}
              className={`gallery-card ${selected.id === avatar.id ? 'active' : ''}`}
              onClick={() => setSelectedId(avatar.id)}
            >
              <div className="gallery-card-preview">
                <Avatar2D preset={avatar.id} className="gallery-card-avatar" />
              </div>
              <div className="gallery-card-copy">
                <span>{avatar.tag}</span>
                <strong>{avatar.label}</strong>
                <small>{avatar.description}</small>
              </div>
              {selected.id === avatar.id && <b className="gallery-check">✓</b>}
            </button>
          ))}
        </div>

        <div className="gallery-next">
          <strong>Suite du vestiaire</strong>
          <p>
            Les prochaines variantes seront produites comme nouveaux personnages complets :
            autres vêtements, coiffures, carnations et humeurs, sans revenir au système de collage.
          </p>
        </div>

        <footer className="gallery-footer">
          <button onClick={() => setSelectedId('chantier')}>Réinitialiser</button>
          <button onClick={randomize}>Aléatoire</button>
          <button onClick={save} className="primary">Valider</button>
        </footer>
      </aside>
    </main>
  )
}
