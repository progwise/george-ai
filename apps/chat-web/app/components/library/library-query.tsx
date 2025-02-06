export interface LibraryQueryParams {
  aiLibraryId: string
}

export const LibraryQuery = ({ aiLibraryId }: LibraryQueryParams) => {
  return (
    <article className="panel shadow-md">
      <h3>Query the Library {aiLibraryId}</h3>
    </article>
  )
}
