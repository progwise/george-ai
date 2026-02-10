import { Link } from '@tanstack/react-router'

import { graphql } from '../../../gql'
import { LibraryQueryResult_FileChunkFragment } from '../../../gql/graphql'
import { FormattedMarkdown } from '../../formatted-markdown'

graphql(`
  fragment LibraryQueryResult_FileChunk on FileChunk {
    id
    libraryId
    fileId
    filename
    extractionMethod
    chunk
    fragment
    content
  }
`)

export interface LibraryQueryParams {
  libraryId: string
  offset: number
  hits: Array<LibraryQueryResult_FileChunkFragment>
  searchTerm: string
  hitCount: number
}

export const LibraryQueryResult = ({ libraryId, hits, offset, searchTerm, hitCount }: LibraryQueryParams) => {
  return (
    <article className="justify-center">
      <ul className="list w-full rounded-box bg-base-100 shadow-md">
        <li className="pl-4 text-xs tracking-wide opacity-60">
          {hitCount} matches for your search term: &quot;{searchTerm}&quot;
        </li>
        {hits.map((hit, index) => (
          <li key={hit.id} className="list-row w-full">
            <div>
              <span>{index + 1 + offset}</span>
            </div>
            <div>
              <div>
                <Link to="/libraries/$libraryId/files/$fileId" params={{ libraryId, fileId: hit.fileId }}>
                  <FormattedMarkdown markdown={hit.content} className="text-sm font-semibold" />{' '}
                </Link>
              </div>
            </div>
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
