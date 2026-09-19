import { useMemo, useState } from 'react'
import AvatarScene from './avatar/AvatarScene'
import {
  outfit01,
  outfit01Assets,
  productionAssets,
  productionCharacter,
  type ProductionAsset,
} from './avatar/productionCatalog'

function AssetCard({
  asset,
  active,
  onSelect,
}: {
  asset: ProductionAsset
  active: boolean
  onSelect: (asset: ProductionAsset) => void
}) {
  return (
    <button className={active ? 'asset-card active' : 'asset-card'} onClick={() => onSelect(asset)}>
      <div className="asset-thumb">
        <img src={asset.previewUrl} alt="" loading="lazy" />
      </div>
      <div className="asset-card-copy">
        <span>{asset.category}</span>
        <strong>{asset.shortLabel}</strong>
      </div>
      <span className="asset-state">{active ? 'VISIBLE' : '3D'}</span>
    </button>
  )
}

export default function App() {
  const [selectedId, setSelectedId] = useState(productionCharacter.id)
  const [message, setMessage] = useState('')

  const selected = useMemo(
    () => productionAssets.find((asset) => asset.id === selectedId) ?? productionCharacter,
    [selectedId],
  )

  function selectAsset(asset: ProductionAsset) {
    setSelectedId(asset.id)
  }

  function notify(text: string) {
    setMessage(text)
    window.setTimeout(() => setMessage(''), 1800)
  }

  return (
    <main className="studio-layout production-studio">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">MA</div>
          <div>
            <strong>Maître Artisan</strong>
            <span>Avatar Studio 3D</span>
          </div>
        </div>

        <div className="collection-label">TENUE 01</div>
        <nav className="studio-nav" aria-label="Éléments du vestiaire">
          {productionAssets.map((asset) => (
            <button
              key={asset.id}
              className={selected.id === asset.id ? 'nav-item active' : 'nav-item'}
              onClick={() => selectAsset(asset)}
            >
              <span className="nav-icon">{asset.icon}</span>
              <span>{asset.shortLabel}</span>
            </button>
          ))}
        </nav>

        <div className="production-badge">
          <span className="status-dot" />
          <div>
            <strong>Pack 3D installé</strong>
            <span>1 avatar · {outfit01Assets.length} modules</span>
          </div>
        </div>
      </aside>

      <section className="viewer-column">
        <header className="topbar">
          <div>
            <p className="eyebrow">PERSONNAGE PRODUCTION — V1</p>
            <h1>{selected.kind === 'character' ? 'Tenue chantier 01' : selected.label}</h1>
          </div>
          <div className="top-actions">
            {selected.kind === 'piece' && (
              <button className="toolbar-button primary" onClick={() => setSelectedId(productionCharacter.id)}>
                Voir le personnage
              </button>
            )}
            <button className="toolbar-button" onClick={() => notify('Pack 3D chargé depuis le vestiaire')}>
              ✓ Pack prêt
            </button>
          </div>
        </header>

        <div className="viewer-stage production-viewer">
          <div className="stage-copy">
            <span>Ton métier.</span>
            <span>Ton avatar.</span>
            <strong>Ta progression.</strong>
          </div>

          <AvatarScene modelUrl={selected.modelUrl} kind={selected.kind} />

          <div className="model-chip">
            <span className="status-dot" />
            <div>
              <strong>{selected.kind === 'character' ? 'PERSONNAGE RIGGÉ' : 'MODULE 3D SÉPARÉ'}</strong>
              <span>{selected.shortLabel}</span>
            </div>
          </div>

          <div className="viewer-hint">Glisse pour tourner · pince/molette pour zoomer</div>
          {message && <div className="toast">{message}</div>}
        </div>
      </section>

      <aside className="wardrobe-panel light-panel">
        <div className="wardrobe-heading">
          <div>
            <p className="eyebrow blue">VESTIAIRE PRODUCTION</p>
            <h2>{outfit01.label}</h2>
          </div>
          <span className="ready-pill">PRÊT</span>
        </div>

        <section className="hero-asset">
          <div className="hero-preview">
            <img src={selected.previewUrl} alt={'Aperçu ' + selected.label} />
          </div>
          <div className="hero-meta">
            <span>{selected.category}</span>
            <h3>{selected.label}</h3>
            <p>{selected.description}</p>
          </div>
          <div className="technical-row">
            <span>GLB réel</span>
            <span>{selected.kind === 'character' ? 'Riggé' : 'Séparé'}</span>
            <span>Texture incluse</span>
          </div>
        </section>

        <section className="wardrobe-section">
          <div className="section-heading">
            <div>
              <span>PACK 01</span>
              <h3>Première tenue</h3>
            </div>
            <strong>{outfit01Assets.length} modules</strong>
          </div>

          <div className="asset-list">
            {outfit01Assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                active={selected.id === asset.id}
                onSelect={selectAsset}
              />
            ))}
          </div>
        </section>

        <section className="outfit-proof">
          <div className="outfit-proof-title">
            <span className="status-dot" />
            <strong>Tenue complète disponible</strong>
          </div>
          <p>
            Le personnage complet utilise le modèle riggé de la tenue 01. Chaque élément de la tenue est aussi
            conservé comme asset 3D distinct dans le catalogue.
          </p>
          <button onClick={() => setSelectedId(productionCharacter.id)}>Afficher la tenue complète</button>
        </section>

        <section className="production-info">
          <span>Identifiant</span>
          <strong>{outfit01.id}</strong>
          <span>Base</span>
          <strong>avatar_workwear_rigged.glb</strong>
        </section>
      </aside>
    </main>
  )
}
