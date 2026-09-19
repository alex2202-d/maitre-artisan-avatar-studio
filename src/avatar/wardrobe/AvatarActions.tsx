export default function AvatarActions({
  onReset,
  onRandomize,
  onSave,
}: {
  onReset: () => void
  onRandomize: () => void
  onSave: () => void
}) {
  return (
    <div className="avatar-actions">
      <button type="button" className="action-secondary" onClick={onReset}>
        Réinitialiser
      </button>
      <button type="button" className="action-secondary" onClick={onRandomize}>
        Aléatoire
      </button>
      <button type="button" className="action-primary" onClick={onSave}>
        Valider mon avatar
      </button>
    </div>
  )
}
