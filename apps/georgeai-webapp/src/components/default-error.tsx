import { ErrorComponentProps } from '@tanstack/react-router'
import { useState } from 'react'

import { logger } from '../common'
import ErrorIcon from '../icons/error-icon'

export function DefaultError(props: ErrorComponentProps) {
  const { error, reset, info } = props
  const [showDetails, setShowDetails] = useState(false)

  logger.error('Error caught in DefaultError component', { error, info })

  const errorMessage = error instanceof Error ? error.message : String(error)

  return (
    <div className="flex items-center justify-center bg-base-200 p-4">
      <div className="w-full rounded-lg bg-base-100 p-6 shadow-xl">
        <div className="mb-4 flex items-start gap-4">
          <ErrorIcon className="size-8 text-error" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-error">Oops! Something went wrong</h1>
            <p className="mt-2 text-base-content/70">An unexpected error occurred while loading this page.</p>
          </div>
        </div>

        <div className="mb-4 rounded-md bg-error/10 p-4">
          <p className="font-semibold text-error">Error message:</p>
          <p className="mt-1 text-sm">{errorMessage || 'Unknown error'}</p>
        </div>

        <div className="mb-4">
          <button type="button" onClick={() => setShowDetails(!showDetails)} className="btn btn-outline btn-sm">
            {showDetails ? 'Hide' : 'Show'} technical details
          </button>
        </div>

        {showDetails && (
          <div className="mb-4 max-h-96 overflow-auto rounded-md bg-base-200 p-4">
            <p className="mb-2 text-sm font-semibold">Stack trace:</p>
            <pre className="text-xs">
              <code>{error instanceof Error ? error.stack : 'No stack trace available'}</code>
            </pre>
          </div>
        )}

        <div className="flex gap-2">
          <button type="button" onClick={() => reset()} className="btn btn-primary">
            Reload page
          </button>
          <button type="button" onClick={() => window.history.back()} className="btn btn-outline">
            Go back
          </button>
        </div>
      </div>
    </div>
  )
}
