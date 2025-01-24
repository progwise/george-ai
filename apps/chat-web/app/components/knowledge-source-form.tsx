import React from 'react'
import { AiKnowledgeSource, User } from '../gql/graphql'

export interface KnowledgeSourceEditFormProps {
  knowledgeSource: AiKnowledgeSource
  owner: User
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  disabled: boolean
}

export const KnowledgeSourceForm = ({
  knowledgeSource,
  owner,
  handleSubmit,
  disabled,
}: KnowledgeSourceEditFormProps): React.ReactElement => {
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input type="hidden" name="ownerId" value={owner.id} />
      <input type="hidden" name="url" value="wasauchimmer" />
      <input
        type="hidden"
        name="knowledgeSourceId"
        value={knowledgeSource.id || ''}
      />

      <label className="input input-bordered flex items-center gap-2">
        Name your Knowledge Source:
        <input
          key={knowledgeSource.name}
          name="name"
          type="text"
          defaultValue={knowledgeSource.name || ''}
          className="grow"
          placeholder="Ancient Library of Alexandria"
        />
      </label>
      <textarea
        key={knowledgeSource.description}
        name="description"
        className="textarea textarea-bordered flex-grow w-full"
        placeholder="The Alexandrian Library was one of the largest and most significant libraries of the ancient world."
        defaultValue={knowledgeSource.description || ''}
      ></textarea>
      <div className="flex gap-2">
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text pr-4">Google Drive</span>
            <input
              key={knowledgeSource.aiKnowledgeSourceType}
              type="radio"
              name="aiKnowledgeSourceType"
              value="GOOGLE_DRIVE"
              className="radio checked:bg-green-500"
              defaultChecked={
                knowledgeSource.aiKnowledgeSourceType === 'GOOGLE_DRIVE'
              }
            />
          </label>
        </div>
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text pr-4">Pocketbase</span>
            <input
              key={knowledgeSource.aiKnowledgeSourceType}
              type="radio"
              name="aiKnowledgeSourceType"
              value="DOCUMENT_GENERATOR"
              className="radio checked:bg-blue-500"
              defaultChecked={
                knowledgeSource.aiKnowledgeSourceType === 'POCKETBASE'
              }
            />
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-4 items-center">
        <button
          disabled={disabled}
          type="submit"
          className="btn btn-primary btn-sm"
        >
          Save
        </button>
      </div>
    </form>
  )
}
