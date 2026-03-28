import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import { formatBytes } from '@george-ai/web-utils'

import { toastError, toastSuccess, toastWarning } from '../../../../../../components/georgeToaster'
import { useDocumentFileActions } from '../../../../../../components/library/files'
import { getFilesQueryOptions } from '../../../../../../components/library/queries'
import { DocumentFile, ExtractionMethod } from '../../../../../../gql/graphql'
import { useTranslation } from '../../../../../../i18n/use-translation-hook'
import { FileIcon } from '../../../../../../icons/file-icon'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/files/$fileId/files')({
  component: RouteComponent,
})

const GROUP_LABELS: Record<string, string> = {
  __backup__: 'Backups',
  attachments: 'Attachments',
  analysis: 'Analyses',
  [ExtractionMethod.CsvExtraction]: 'CSV Extraction',
  [ExtractionMethod.DocxExtraction]: 'DOCX Extraction',
  [ExtractionMethod.EmlExtraction]: 'EML Extraction',
  [ExtractionMethod.ExcelExtraction]: 'Excel Extraction',
  [ExtractionMethod.HtmlExtraction]: 'HTML Extraction',
  [ExtractionMethod.ImageExtraction]: 'Image Extraction',
  [ExtractionMethod.LegacyExtraction]: 'Legacy Extraction',
  [ExtractionMethod.PdfExtraction]: 'PDF Extraction',
  [ExtractionMethod.TextExtraction]: 'Text Extraction',
}

const GROUP_STYLE: Record<string, { color: string; border: string }> = {
  attachments: { color: 'text-info', border: 'border-l-info' },
  analysis: { color: 'text-secondary', border: 'border-l-secondary' },
  __backup__: { color: 'text-warning', border: 'border-l-warning' },
  [ExtractionMethod.ImageExtraction]: { color: 'text-success', border: 'border-l-success' },
}
const DEFAULT_STYLE = { color: 'text-primary', border: 'border-l-primary' }
const groupStyle = (key: string) => GROUP_STYLE[key] ?? DEFAULT_STYLE

function groupLabel(key: string): string {
  return GROUP_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function groupKey(file: DocumentFile): string | null {
  if (file.isBackup) return '__backup__'
  if (file.isAttachment) return 'attachments'
  if (file.isAnalysis) return 'analysis'
  if (file.extractionMethod) return file.extractionMethod
  return null
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days <= 3) return `${days}d ago`
  return date.toLocaleDateString(undefined, { dateStyle: 'medium' })
}

function latestModified(files: DocumentFile[]): string | null {
  return files.reduce<string | null>(
    (latest, f) => (f.modified && (!latest || f.modified > latest) ? f.modified : latest),
    null,
  )
}

const STROKE_PROPS = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '1.5',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const CrownIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" stroke="none">
    <path d="M2 19h20v2H2v-2zM3 17l3.5-9.5 4.5 4.5L12 4l1 8 4.5-4.5L21 17H3z" />
  </svg>
)

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    className={`size-4 shrink-0 transition-transform ${open ? '' : '-rotate-90'}`}
    {...STROKE_PROPS}
    strokeWidth="2"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

function GroupIcon({ groupKey: key, className }: { groupKey: string; className?: string }) {
  const props = { viewBox: '0 0 24 24', className, ...STROKE_PROPS }

  if (key === 'attachments')
    return (
      <svg {...props}>
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
      </svg>
    )

  if (key === 'analysis')
    return (
      <svg {...props}>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    )

  if (key === '__backup__')
    return (
      <svg {...props}>
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 .49-3.78" />
      </svg>
    )

  if (key === ExtractionMethod.ImageExtraction)
    return (
      <svg {...props}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    )

  if (key === ExtractionMethod.HtmlExtraction)
    return (
      <svg {...props}>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    )

  if (key === ExtractionMethod.CsvExtraction || key === ExtractionMethod.ExcelExtraction)
    return (
      <svg {...props}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="3" x2="9" y2="21" />
      </svg>
    )

  return (
    <svg {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <polyline points="9 14 12 17 15 14" />
    </svg>
  )
}

function FileMeta({ file }: { file: DocumentFile }) {
  const parts = [
    file.relativePath || null,
    file.size != null ? formatBytes(file.size) : null,
    file.modified ? timeAgo(file.modified) : null,
  ].filter(Boolean)
  return <div className="text-xs opacity-60">{parts.join(' · ')}</div>
}

function FileRow({ file }: { file: DocumentFile }) {
  const { triggerAnalysis } = useDocumentFileActions()
  const handleAnalyzeFile = () => {
    if (file.isAttachment && file.mimeType?.startsWith('image/')) {
      triggerAnalysis(
        {
          fileName: file.fileName,
          mimeType: file.mimeType || 'application/octet-stream',
          fileUri: file.fileUri,
        },
        {
          onError: (error) => {
            toastError(`Failed to trigger image analysis: ${error.message}`)
          },
          onSuccess: () => {
            toastSuccess('Image analysis triggered successfully')
          },
        },
      )
    } else {
      toastWarning('No action available for this file type')
    }
  }
  return (
    <li className="list-row">
      <div className="relative">
        <FileIcon mimeType={file.mimeType} className="size-5" />
        {file.isDocumentSourceFile && (
          <CrownIcon className="absolute -top-2 -right-2 size-3.5 text-amber-400" />
        )}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className={file.isDocumentSourceFile ? 'font-semibold text-amber-500' : ''}>{file.fileName}</span>
          {file.isManifest && <span className="badge badge-xs badge-info">metadata</span>}
        </div>
        <FileMeta file={file} />
      </div>
      <button type="button" className="btn btn-square btn-ghost" onClick={handleAnalyzeFile}>
        <svg className="size-[1.2em]" viewBox="0 0 24 24" {...STROKE_PROPS} strokeWidth="2">
          <path d="M6 3L20 12 6 21 6 3z" />
        </svg>
      </button>
      <button type="button" className="btn btn-square btn-ghost">
        <svg className="size-[1.2em]" viewBox="0 0 24 24" {...STROKE_PROPS} strokeWidth="2">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      </button>
    </li>
  )
}

function BackupGroup({ files }: { files: DocumentFile[]; workspaceId: string; libraryId: string; documentId: string }) {
  const { runs, bakFiles } = useMemo(() => {
    const map = new Map<string, DocumentFile[]>()
    const bak: DocumentFile[] = []
    for (const file of files) {
      if (file.fileName.endsWith('.bak')) {
        bak.push(file)
      } else {
        const runId = file.relativePath.replace(/^\//, '').split('/')[1]!
        if (!map.has(runId)) map.set(runId, [])
        map.get(runId)!.push(file)
      }
    }
    return {
      runs: [...map.entries()]
        .map(([runId, runFiles]) => {
          const method = (runFiles[0]?.extractionMethod as string) ?? runId
          const idx = runId.lastIndexOf('_')
          const ts = idx >= 0 ? parseInt(runId.slice(idx + 1)) || 0 : 0
          return { runId, method, timestamp: ts, files: runFiles }
        })
        .sort((a, b) => b.timestamp - a.timestamp),
      bakFiles: bak,
    }
  }, [files])

  const [openRuns, setOpenRuns] = useState<Set<string>>(() => new Set())
  const toggleRun = (id: string) =>
    setOpenRuns((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className="flex flex-col divide-y divide-base-200">
      {runs.map(({ runId, method, timestamp, files: runFiles }) => {
        const isOpen = openRuns.has(runId)
        const totalSize = runFiles.reduce((sum, f) => sum + (f.size ?? 0), 0)
        const dateLabel = timestamp
          ? new Date(timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
          : ''
        return (
          <div key={runId}>
            <div className="flex items-center gap-2 pr-2">
              <button
                type="button"
                onClick={() => toggleRun(runId)}
                className="flex flex-1 items-center gap-3 px-6 py-2 text-left transition-colors hover:bg-base-200"
              >
                <ChevronIcon open={isOpen} />
                <span className="font-medium">{groupLabel(method)} Backup</span>
                <span className="text-xs opacity-50">
                  {[dateLabel, `${runFiles.length} files`, formatBytes(totalSize)].filter(Boolean).join(' · ')}
                </span>
              </button>
            </div>
            {isOpen && (
              <ul className="list border-t border-base-200 pl-4">
                {runFiles.map((file) => (
                  <FileRow key={file.relativePath + '/' + file.fileName} file={file} />
                ))}
              </ul>
            )}
          </div>
        )
      })}
      {bakFiles.length > 0 && (
        <div>
          <div className="px-6 py-2 text-xs font-medium opacity-50">Analysis backups ({bakFiles.length})</div>
          <ul className="list border-t border-base-200 pl-4">
            {bakFiles.map((file) => (
              <FileRow key={file.relativePath + '/' + file.fileName} file={file} />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function RouteComponent() {
  const { t } = useTranslation()
  const { user } = Route.useRouteContext()
  const { fileId: documentId, libraryId } = Route.useParams()
  const { data: files } = useSuspenseQuery(getFilesQueryOptions({ libraryId, documentId }))

  const workspaceId = user.selectedWorkspaceId

  const { rootFiles, groups } = useMemo(() => {
    const root: DocumentFile[] = []
    const map = new Map<string, DocumentFile[]>()
    for (const file of files) {
      const key = groupKey(file)
      if (key === null) {
        root.push(file)
      } else {
        if (!map.has(key)) map.set(key, [])
        map.get(key)!.push(file)
      }
    }
    const TAIL = ['attachments', 'analysis', '__backup__']
    const ordered = new Map<string, DocumentFile[]>()
    ;[...map.entries()]
      .filter(([k]) => !TAIL.includes(k))
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([k, v]) => ordered.set(k, v))
    TAIL.forEach((k) => {
      if (map.has(k)) ordered.set(k, map.get(k)!)
    })
    return { rootFiles: root, groups: ordered }
  }, [files])

  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())
  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  return (
    <div className="grid size-full grid-rows-[auto_1fr] gap-2 bg-base-100">
      <div className="grid w-full grid-cols-2 items-center gap-4 pt-2">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          {t('labels.files')}
          <span className="badge badge-sm font-normal badge-neutral">{files.length}</span>
        </h2>
      </div>
      <div className="overflow-auto">
        <div className="flex flex-col gap-2">
          {rootFiles.length > 0 && (
            <ul className="list rounded-box bg-base-100 shadow-md">
              {rootFiles.map((file) => (
                <FileRow key={file.relativePath + '/' + file.fileName} file={file} />
              ))}
            </ul>
          )}
          {Array.from(groups.entries()).map(([key, groupFiles]) => {
            const isOpen = expanded.has(key)
            const { color, border } = groupStyle(key)
            const totalSize = groupFiles.reduce((sum, f) => sum + (f.size ?? 0), 0)
            const latest = latestModified(groupFiles)
            return (
              <div key={key} className={`overflow-hidden rounded-box border-l-4 bg-base-100 shadow-md ${border}`}>
                <button
                  type="button"
                  onClick={() => toggle(key)}
                  className="flex w-full items-center gap-3 bg-base-200/40 px-4 py-3 transition-colors hover:bg-base-200"
                >
                  <ChevronIcon open={isOpen} />
                  <GroupIcon groupKey={key} className={`size-5 shrink-0 ${color}`} />
                  <span className="flex-1 text-left font-semibold">{groupLabel(key)}</span>
                  <span className="text-xs opacity-50">
                    {[`${groupFiles.length} files`, formatBytes(totalSize), latest ? timeAgo(latest) : null]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </button>
                {isOpen &&
                  (key === '__backup__' ? (
                    <div className="border-t border-base-200">
                      <BackupGroup
                        files={groupFiles}
                        workspaceId={workspaceId}
                        libraryId={libraryId}
                        documentId={documentId}
                      />
                    </div>
                  ) : (
                    <ul className="list border-t border-base-200">
                      {groupFiles.map((file) => (
                        <FileRow key={file.relativePath + '/' + file.fileName} file={file} />
                      ))}
                    </ul>
                  ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
