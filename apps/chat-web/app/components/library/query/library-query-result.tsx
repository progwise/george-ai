import { FormattedMarkdown } from '../../formatted-markdown'

export interface LibraryQueryParams {
  offset: number
  hits: Array<{
    id: string
    docId: string
    pageContent: string
    docName: string
    docPath: string
    originUri: string
    highlights: Array<{ field: string; snippet?: string | null }>
  }>
  searchTerm: string
  hitCount: number
}

export const LibraryQueryResult = ({ hits, offset, searchTerm, hitCount }: LibraryQueryParams) => {
  return (
    <article className="panel justify-center">
      <ul className="list bg-base-100 rounded-box shadow-md">
        <li className="pl-4 text-xs tracking-wide opacity-60">
          {hitCount} matches for your search term: &quot;{searchTerm}&quot;
        </li>
        {hits.map((hit, index) => (
          <li key={hit.id} className="list-row">
            <div>
              <span>{index + 1 + offset}</span>
            </div>
            <div>
              <div>
                {(() => {
                  const highlight = hit.highlights.find((h) => h.field === 'docName')
                  const text = highlight?.snippet || hit.docName
                  return <FormattedMarkdown markdown={text} className="text-sm font-semibold" />
                })()}
              </div>
              <div className="text-xs font-semibold opacity-60">
                {hit.originUri ? (
                  <a href={hit.originUri} target="_blank">
                    {hit.originUri}
                  </a>
                ) : (
                  'Source not available'
                )}
              </div>
            </div>
            <p className="list-col-wrap text-xs">
              {(() => {
                const highlight = hit.highlights.find((h) => h.field === 'text')
                const text = highlight?.snippet ? `...${highlight?.snippet}...` : hit.pageContent
                return <FormattedMarkdown markdown={text} className="text-xs font-normal" />
              })()}
            </p>
            <button type="button" className="btn btn-square btn-ghost">
              <svg className="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor">
                  <path d="M6 3L20 12 6 21 6 3z"></path>
                </g>
              </svg>
            </button>
            <button type="button" className="btn btn-square btn-ghost">
              <svg className="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                </g>
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </article>
  )
}
