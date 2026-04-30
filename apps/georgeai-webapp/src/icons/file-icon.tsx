import { twMerge } from 'tailwind-merge'

import { IconProps } from './icon-props'

const svgBase = (className?: string) => ({
  width: '18px',
  height: '18px',
  viewBox: '0 0 24 24',
  className: twMerge('size-4', className),
})

const ImageIcon = ({ className }: { className?: string }) => (
  <svg {...svgBase(className)} fill="currentColor">
    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM5 19v-8l3.5 4.5L12.5 11l6.5 8H5zm12-10c-.83 0-1.5-.67-1.5-1.5S16.17 6 17 6s1.5.67 1.5 1.5S17.83 9 17 9z" />
    <path d="M0 0h24v24H0z" fill="none" />
  </svg>
)

// Document with fold + a stylised "P" to suggest PDF
const PdfIcon = ({ className }: { className?: string }) => (
  <svg {...svgBase(className)} fill="currentColor">
    <path d="M6 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z" />
    {/* "P" letterform */}
    <path d="M7 12h4.5c1.1 0 2 .9 2 2s-.9 2-2 2H8.5v2H7v-6zm1.5 1.5v1.5H11.5c.28 0 .5-.22.5-.5v-.5c0-.28-.22-.5-.5-.5H8.5z" />
  </svg>
)

// Classic markdown badge: M↓ in a rounded rectangle
const MarkdownIcon = ({ className }: { className?: string }) => (
  <svg
    {...svgBase(className)}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="6" width="20" height="14" rx="2" />
    {/* M */}
    <polyline points="5.5,16 5.5,11 8.5,14 11.5,11 11.5,16" />
    {/* Down arrow */}
    <line x1="17" y1="11" x2="17" y2="15.5" />
    <polyline points="14.5,13.5 17,16 19.5,13.5" />
  </svg>
)

// Document + horizontal lines suggesting prose/plain text
const TextIcon = ({ className }: { className?: string }) => (
  <svg {...svgBase(className)} fill="currentColor">
    <path d="M6 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z" />
    <path d="M7 13h10v1.5H7zm0 3h7v1.5H7z" />
  </svg>
)

// Document outline with </> symbol for code / structured data
const CodeFileIcon = ({ className }: { className?: string }) => (
  <svg
    {...svgBase(className)}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" />
    <polyline points="14,2 14,8 20,8" />
    {/* </> */}
    <polyline points="9,13 7,15 9,17" />
    <polyline points="15,13 17,15 15,17" />
    <line x1="13" y1="12" x2="11" y2="18" />
  </svg>
)

// Binary file: document outline with "01" binary digits
const BinaryFileIcon = ({ className }: { className?: string }) => (
  <svg
    {...svgBase(className)}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" />
    <polyline points="14,2 14,8 20,8" />
    {/* "0" digit */}
    <rect x="7" y="12" width="4" height="6" rx="1.5" />
    {/* "1" digit */}
    <line x1="14" y1="13" x2="14" y2="18" />
    <polyline points="12.5,13.8 14,12.5" />
  </svg>
)

const DefaultFileIcon = ({ className }: { className?: string }) => (
  <svg {...svgBase(className)} fill="currentColor">
    <path d="M6 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z" />
    <path d="M0 0h24v24H0z" fill="none" />
  </svg>
)

export const FileIcon = ({ className, mimeType }: IconProps & { mimeType?: string | null }) => {
  if (mimeType?.startsWith('image/')) return <ImageIcon className={className} />
  if (mimeType === 'application/pdf') return <PdfIcon className={className} />
  if (mimeType?.includes('markdown')) return <MarkdownIcon className={className} />
  if (['application/json', 'application/xml'].some((t) => mimeType?.startsWith(t)))
    return <CodeFileIcon className={className} />
  if (mimeType?.startsWith('text/')) return <TextIcon className={className} />
  if (mimeType === 'application/octet-stream') return <BinaryFileIcon className={className} />
  return <DefaultFileIcon className={className} />
}
