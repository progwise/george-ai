import { useEffect, useState } from 'react'

import { dateString, dateStringShort, dateTimeString, dateTimeStringShort, timeString } from '@george-ai/web-utils'

import { useTranslation } from '../i18n/use-translation-hook'

type DateFormat = 'date' | 'dateShort' | 'dateTime' | 'dateTimeShort' | 'time'

interface ClientDateProps {
  date: string | Date | null | undefined
  format?: DateFormat
  fallback?: string
  className?: string
}

/**
 * Client-only date component that avoids SSR hydration mismatches.
 * Renders a placeholder on the server and the actual formatted date on the client.
 * This ensures users see dates in their local timezone.
 */
export const ClientDate = ({ date, format = 'dateTime', fallback = '-', className }: ClientDateProps) => {
  const { language } = useTranslation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setMounted(true)
    }, 0)
    return () => clearTimeout(timeout)
  }, [])

  if (!date) {
    return <span className={className}>{fallback}</span>
  }

  // On server and initial client render, show a non-breaking space to maintain layout
  // This prevents layout shift when the actual date renders
  if (!mounted) {
    return <span className={className}>&nbsp;</span>
  }

  const dateInput = typeof date === 'string' ? date : date.toISOString()

  const formatDate = () => {
    switch (format) {
      case 'date':
        return dateString(dateInput, language)
      case 'dateShort':
        return dateStringShort(dateInput, language)
      case 'dateTime':
        return dateTimeString(dateInput, language)
      case 'dateTimeShort':
        return dateTimeStringShort(dateInput, language)
      case 'time':
        return timeString(dateInput, language)
      default:
        return dateTimeString(dateInput, language)
    }
  }

  return <span className={className}>{formatDate()}</span>
}
