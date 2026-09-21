import { useEffect, useMemo, useState } from 'react'
import Avatar2D, { type AvatarPresetId } from './avatar/Avatar2D'
import {
  MOOD_LABELS,
  type MoodId,
  type MoodTradeId,
} from './gallery/mood-images'
import type { ExtraMoodTradeId } from './gallery/mood-images-extra'
import type { VoirieMoodTradeId } from './gallery/mood-images-voirie'

type AvatarCard = {
  id: AvatarPresetId
  label: string
  trade: string
  description: string
  tag: string
  moodsReady: boolean
}

const avatars: AvatarCard[] = [
  {
    id: 'chantier',
    label: 'Chantier',
    trade: 'Bâtiment',
    description: 'Casque jaune · salopette bleue · gants de chantier',
    tag: 'Polyvalent',
    moodsReady: true,
  },
  {
    id: 'electricien',
    label: 'Électricien',
    trade: 'Électricité',
    description: 'Tenue bleue · bandes réfléchissantes · outils métier',
    tag: 'Élec',
    moodsReady: true,
  },
  {
    id: 'technicien',
    label: 'Technicien CVC',
    trade: 'Climatisation',
    description: 'Tenue atelier kaki · chaussures de sécurité · outils',
    tag: 'CVC',
    moodsReady: true,
  },
  {
    id: 'peintre',
    label: 'Peintre',
    trade: 'Finition',
    description: 'Tenue blanche · accessoires peinture · chaussures claires',
    tag: 'Peinture',
    moodsReady: true,
  },
  {
    id: 'voirie',
    label: 'Voirie',
    trade: 'Travaux publics',
    description: 'Haute visibilité orange · casque · tenue extérieure',
    tag: 'TP',
    moodsReady: true,
  },
]

const moods: MoodId[] = ['neutre', 'heureux', 'determine', 'surpris', 'inquiet']

function readSavedPreset(): AvatarPresetId {
  const saved = localStorage.getItem('maitre-artisan-avatar-gallery-preset')
  return avatars.some((avatar) => avatar.id === saved)
    ? (saved as AvatarPresetId)
    : 'chantier'
}

function readSavedMood(): MoodId {
  const saved = localStorage.getItem('maitre-artisan-avatar-gallery-mood')
  return moods.includes(saved as MoodId) ? (saved as MoodId) : 'neutre'
}

type MoodReadyTradeId = MoodTradeId | ExtraMoodTradeId | VoirieMoodTradeId

function isMoodTrade(id: AvatarPresetId): id is MoodReadyTradeId {
  return (
    id === 'chantier' ||
    id === 'electricien' ||
    id === 'technicien' ||
    id === 'peintre' ||
    id === 'voirie'
  )
}

export default function App() {
  const [selectedId, setSelectedId] = useState<AvatarPresetId>(() => readSavedPreset())
  const [selectedMood, setSelectedMood] = useState<MoodId>(() => readSavedMood())
  const [message, setMessage] = useState('')

  const selected = useMemo(
    () => avatars.find((avatar) => avatar.id === selectedId) ?? avatars[0],
    [selectedId],
  )

  const effectiveMood: MoodId = selected.moodsReady ? selectedMood : 'neutre'

  useEffect(() => {
    localStorage.setItem('maitre-artisan-avatar-gallery-preset', selectedId)
  }, [selectedId])

  useEffect(() => {
    localStorage.setItem('maitre-artisan-avatar-gallery-mood', selectedMood)
  }, [selectedMood])

  function notify(text: string) {
    setMessage(text)
    window.setTimeout(() => setMessage(''), 1500)
  }

  function chooseAvatar(id: AvatarPresetId) {
    setSelectedId(id)
    if (!isMoodTrade(id)) setSelectedMood('neutre')
  }

  function randomize() {
    const ready = avatars.filter((avatar) => avatar.moodsReady)
    const next = ready[Math.floor(Math.random() * ready.length)] ?? avatars[0]
    const mood = moods[Math.floor(Math.random() * moods.length)] ?? 'neutre'
    setSelectedId(next.id)
    setSelectedMood(mood)
    notify('Nouvelle combinaison sélectionnée')
  }

  function save() {
    localStorage.setItem('maitre-artisan-avatar-gallery-preset', selectedId)
    localStorage.setItem('maitre-artisan-avatar-gallery-mood', effectiveMood)
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
          Les humeurs sont des rendus complets, sans collage.
        </p>

        <div className="gallery-version">GALERIE V2 · HUMEURS</div>
      </aside>

      <section className="gallery-stage">
        <div className="gallery-stage-card">
          <div className="gallery-stage-copy left">
            Un artisan<br/>d’aujourd’hui<br/><b>bâtit un monde<br/>meilleur !</b>
          </div>
          <div className="gallery-stage-copy right">
            Choisis.<br/>Exprime.<br/>Avance.
          </div>

          <Avatar2D
            preset={selected.id}
            mood={effectiveMood}
            className="gallery-main-avatar"
          />

          <div className="gallery-stage-meta">
            <div>
              <span>{selected.trade}</span>
              <strong>{selected.label} · {MOOD_LABELS[effectiveMood]}</strong>
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
            <p>Choisis d’abord le métier, puis l’humeur. Chaque combinaison est une image complète.</p>
          </div>
          <button onClick={save} className="gallery-save">✓ Valider</button>
        </header>

        <section className="gallery-section">
          <div className="gallery-section-title">
            <div>
              <small>1 · PERSONNAGE</small>
              <h2>Métier</h2>
            </div>
            <span>{selected.label}</span>
          </div>

          <div className="gallery-grid">
            {avatars.map((avatar) => (
              <button
                key={avatar.id}
                className={`gallery-card ${selected.id === avatar.id ? 'active' : ''}`}
                onClick={() => chooseAvatar(avatar.id)}
              >
                <div className="gallery-card-preview">
                  <Avatar2D preset={avatar.id} mood="neutre" className="gallery-card-avatar" />
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
        </section>

        <section className="mood-section">
          <div className="gallery-section-title">
            <div>
              <small>2 · EXPRESSION</small>
              <h2>Humeur</h2>
            </div>
            <span>{MOOD_LABELS[effectiveMood]}</span>
          </div>

          {selected.moodsReady ? (
            <div className="mood-grid">
              {moods.map((mood) => (
                <button
                  key={mood}
                  className={`mood-card ${effectiveMood === mood ? 'active' : ''}`}
                  onClick={() => setSelectedMood(mood)}
                >
                  <Avatar2D preset={selected.id} mood={mood} className="mood-avatar" />
                  <strong>{MOOD_LABELS[mood]}</strong>
                </button>
              ))}
            </div>
          ) : (
            <div className="mood-coming">
              Les 5 humeurs de <b>{selected.label}</b> sont la prochaine série à produire.
              Le personnage reste en version neutre pour l’instant.
            </div>
          )}
        </section>

        <footer className="gallery-footer">
          <button onClick={() => { setSelectedId('chantier'); setSelectedMood('neutre') }}>Réinitialiser</button>
          <button onClick={randomize}>Aléatoire</button>
          <button onClick={save} className="primary">Valider</button>
        </footer>
      </aside>
    </main>
  )
}
