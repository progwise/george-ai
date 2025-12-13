import { twMerge } from 'tailwind-merge'

interface FileMarkdownViewerProps {
  markdown: string
  className?: string
  isLoading?: boolean
  progress?: number
}

export const FileMarkdownViewer = ({
  markdown,
  className,
  isLoading = false,
  progress = 0,
}: FileMarkdownViewerProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="loading loading-lg loading-spinner"></div>
        <div className="text-sm">Loading markdown... {progress > 0 && `${Math.round(progress)}%`}</div>
        {progress > 0 && <progress className="progress w-56 progress-primary" value={progress} max="100"></progress>}
      </div>
    )
  }

  return (
    <pre className={twMerge('whitespace-pre-wrap wrap-break-word font-mono text-sm', className)}>
      <code>{markdown}</code>
    </pre>
  )
}
