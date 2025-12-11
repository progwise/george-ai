import { useState } from 'react'

import { useTranslation } from '../../i18n/use-translation-hook'

interface StackedDataQualityBarProps {
  data: {
    enriched: number
    missing: number
    notProcessed: number
    total: number
  }
  variant: 'summary' | 'compact'
}

export const StackedDataQualityBar = ({ data, variant }: StackedDataQualityBarProps) => {
  const { t } = useTranslation()
  const [showTooltip, setShowTooltip] = useState(false)

  // Handle edge case: no items
  if (data.total === 0) {
    return (
      <div className="text-base-content/50 text-sm">{variant === 'summary' ? t('lists.statistics.noData') : '—'}</div>
    )
  }

  // Calculate percentages
  const enrichedPct = (data.enriched / data.total) * 100
  const missingPct = (data.missing / data.total) * 100
  const notProcessedPct = (data.notProcessed / data.total) * 100

  const height = variant === 'summary' ? 'h-10' : 'h-6'
  const fontSize = variant === 'summary' ? 'text-sm' : 'text-xs'

  return (
    <div className="cursor-pointer">
      {/* Stacked Bar */}
      <div
        className={`relative flex w-full overflow-hidden rounded-lg ${height}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Enriched segment */}
        {enrichedPct > 0 && (
          <div className="bg-success relative flex items-center justify-center" style={{ width: `${enrichedPct}%` }}>
            {enrichedPct >= 1 && (
              <span className={`text-success-content font-semibold ${fontSize}`}>
                {variant === 'summary' ? `${data.enriched} (${enrichedPct.toFixed(0)}%)` : `${enrichedPct.toFixed(0)}%`}
              </span>
            )}
          </div>
        )}

        {/* Missing segment */}
        {missingPct > 0 && (
          <div className="bg-warning relative flex items-center justify-center" style={{ width: `${missingPct}%` }}>
            {missingPct >= 1 && (
              <span className={`text-warning-content text-nowrap font-semibold ${fontSize}`}>
                {variant === 'summary' ? `${data.missing} (${missingPct.toFixed(0)}%)` : `${missingPct.toFixed(0)}%`}
              </span>
            )}
          </div>
        )}

        {/* Not Processed segment */}
        {notProcessedPct > 0 && (
          <div
            className="bg-base-content/30 relative flex items-center justify-center"
            style={{ width: `${notProcessedPct}%` }}
          >
            {notProcessedPct >= 1 && (
              <span className={`text-base-content/70 text-nowrap font-semibold ${fontSize}`}>
                {variant === 'summary'
                  ? `${data.notProcessed} (${notProcessedPct.toFixed(0)}%)`
                  : `${notProcessedPct.toFixed(0)}%`}
              </span>
            )}
          </div>
        )}

        {/* Tooltip */}
        {showTooltip && (
          <div className="bg-base-100 border-base-300 absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 rounded-lg border p-3 shadow-lg">
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="bg-success h-3 w-3 rounded" />
                <span>
                  {t('lists.statistics.chartEnriched')}: {data.enriched} ({enrichedPct.toFixed(1)}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-warning h-3 w-3 rounded" />
                <span>
                  {t('lists.statistics.chartMissing')}: {data.missing} ({missingPct.toFixed(1)}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-base-content/30 h-3 w-3 rounded" />
                <span>
                  {t('lists.statistics.chartNotProcessed')}: {data.notProcessed} ({notProcessedPct.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend for summary variant */}
      {variant === 'summary' && (
        <div className="mt-2 flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="bg-success h-3 w-3 rounded" />
            <span>{`${enrichedPct.toFixed(1)}% ${t('lists.statistics.chartEnriched')}`}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-warning h-3 w-3 rounded" />
            <span>{`${missingPct.toFixed(1)}% ${t('lists.statistics.chartMissing')}`}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-gray-400" />
            <span>{`${notProcessedPct.toFixed(1)}% ${t('lists.statistics.chartNotProcessed')}`}</span>
          </div>
        </div>
      )}
    </div>
  )
}
