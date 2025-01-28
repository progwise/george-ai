export interface KnowledgeSourceQueryParams {
  knowledgeSourceId: string
}

export const KnowledgeSourceQuery = ({
  knowledgeSourceId,
}: KnowledgeSourceQueryParams) => {
  return (
    <article className="panel shadow-md">
      <h3>Query the Library {knowledgeSourceId}</h3>
    </article>
  )
}
