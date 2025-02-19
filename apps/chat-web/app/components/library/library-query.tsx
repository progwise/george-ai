export interface LibraryQueryParams {
  libraryId: string
}

export const LibraryQuery = ({ libraryId }: LibraryQueryParams) => {
  return (
    <article className="panel shadow-md">
      <h3>Query the Library {libraryId}</h3>
    </article>
  )
}
