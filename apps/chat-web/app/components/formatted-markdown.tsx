import { useEffect, useRef } from 'react'
import { convertMdToHtml } from './conversation/markdown-converter'

export const FormattedMarkdown = ({
  id,
  markdown,
}: {
  id: string
  markdown: string | undefined | null
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
      className="prose marker:text-base-100 [&_*]:text-base-content"
    ></div>
  )
}
