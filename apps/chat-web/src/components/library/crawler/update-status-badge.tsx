import { useTranslation } from '../../../i18n/use-translation-hook'

interface UpdateStatusBadgeProps {
  updateType: string | null | undefined
  count?: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showCheckmark?: boolean
  checked?: boolean
  onCheckmarkChange?: (updateType: string, checked: boolean) => void
}

export const UpdateStatusBadge = ({
  updateType,
  count,
  size = 'xs',
  showCheckmark = false,
  checked = true,
  onCheckmarkChange,
}: UpdateStatusBadgeProps) => {
  const { t } = useTranslation()

  // Map update types to badge classes (consistent colors for same types)
  const badgeClass = (() => {
    switch (updateType) {
      case 'added':
        return 'badge-success'
      case 'updated':
        return 'badge-info'
      case 'skipped':
        return 'badge-neutral'
      case 'omitted':
        return 'badge-warning'
      case 'error':
        return 'badge-error'
      default: // null, undefined, or unknown types
        return 'badge-neutral'
    }
  })()

  // Map update types to labels
  const label = (() => {
    switch (updateType) {
      case 'added':
        return t('updates.added')
      case 'updated':
        return t('updates.updated')
      case 'skipped':
        return t('updates.skipped')
      case 'omitted':
        return t('updates.omitted')
      case 'error':
        return t('labels.error')
      default:
        return updateType || t('labels.unknown')
    }
  })()

  const sizeClass = `badge-${size}`
  const actualUpdateType = updateType || 'unknown'

  if (showCheckmark && onCheckmarkChange) {
    return (
      <label className={`badge ${badgeClass} ${sizeClass} flex cursor-pointer items-center gap-1`}>
        <input
          type="checkbox"
          className="checkbox checkbox-xs"
          style={{ backgroundColor: 'white', borderColor: '#d1d5db' }}
          checked={checked}
          onChange={(e) => onCheckmarkChange(actualUpdateType, e.target.checked)}
        />
        <span>{count !== undefined ? `${label}: ${count}` : label}</span>
      </label>
    )
  }

  return (
    <span className={`badge ${badgeClass} ${sizeClass}`}>{count !== undefined ? `${label}: ${count}` : label}</span>
  )
}
