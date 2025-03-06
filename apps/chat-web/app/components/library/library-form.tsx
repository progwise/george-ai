import React from 'react'

import { AiLibrary } from '../../gql/graphql'

export interface LibraryEditFormProps {
  library: AiLibrary
  ownerId: string
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  disabled: boolean
}

export const LibraryForm = ({
  library,
  ownerId,
  handleSubmit,
  disabled,
}: LibraryEditFormProps): React.ReactElement => {
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input type="hidden" name="ownerId" value={ownerId} />
      <input type="hidden" name="url" value="wasauchimmer" />
      <input type="hidden" name="libraryId" value={library.id || ''} />

      <label className="input input-bordered flex items-center gap-2">
        Name your Library:
        <input
          key={library.name}
          name="name"
          type="text"
          defaultValue={library.name || ''}
          className="grow"
          placeholder="Ancient Library of Alexandria"
          required
        />
      </label>
      <textarea
        key={library.description}
        name="description"
        className="textarea textarea-bordered flex-grow w-full"
        placeholder="The Alexandrian Library was one of the largest and most significant libraries of the ancient world."
        defaultValue={library.description || ''}
      ></textarea>
      <div className="flex gap-2">
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text pr-4">Google Drive</span>
            <input
              key={library.libraryType}
              type="radio"
              name="libraryType"
              value="GOOGLE_DRIVE"
              className="radio checked:bg-green-500"
              defaultChecked={library.libraryType === 'GOOGLE_DRIVE'}
            />
          </label>
        </div>
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text pr-4">Pocketbase</span>
            <input
              key={library.libraryType}
              type="radio"
              name="libraryType"
              value="DOCUMENT_GENERATOR"
              className="radio checked:bg-blue-500"
              defaultChecked={library.libraryType === 'POCKETBASE'}
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
