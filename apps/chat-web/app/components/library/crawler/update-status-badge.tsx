import { useTranslation } from '../../../i18n/use-translation-hook'

interface UpdateStatusBadgeProps {
  updateType: string | null | undefined
  count?: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

export const UpdateStatusBadge = ({ updateType, count, size = 'xs' }: UpdateStatusBadgeProps) => {
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

  return (
    <span className={`badge ${badgeClass} ${sizeClass}`}>{count !== undefined ? `${label}: ${count}` : label}</span>
  )
}
