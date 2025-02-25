import { useEffect, useRef } from 'react'
import { convertMdToHtml } from './conversation/markdown-converter'
import { twMerge } from 'tailwind-merge'

export const FormattedMarkdown = ({
  id,
  markdown,
  className,
}: {
  id?: string
  markdown: string | undefined | null
  className?: string
}) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element || !markdown?.length) return
    element.innerHTML = convertMdToHtml(markdown)
  }, [ref, markdown])

  return (
    <div
      ref={ref}
      id={id}
      className={twMerge(
        'prose marker:text-base-100 [&_*]:text-base-content',
        className,
      )}
    ></div>
  )
}
