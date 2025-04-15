import React from 'react'

import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'

const LibraryFormFragment = graphql(`
  fragment LibraryFormFragment on AiLibrary {
    id
    name
    description
  }
`)

export interface LibraryEditFormProps {
  library: FragmentType<typeof LibraryFormFragment>
  ownerId: string
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  disabled: boolean
}

export const LibraryForm = (props: LibraryEditFormProps): React.ReactElement => {
  const { ownerId, handleSubmit, disabled } = props
  const library = useFragment(LibraryFormFragment, props.library)
  const { t } = useTranslation()

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input type="hidden" name="ownerId" value={ownerId} />
      <input type="hidden" name="url" value="wasauchimmer" />
      <input type="hidden" name="libraryId" value={library.id || ''} />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="whitespace-nowrap">{t('libraries.nameLibrary')}:</label>
        <input
          key={library.name}
          name="name"
          type="text"
          defaultValue={library.name || ''}
          className="input input-bordered grow"
          placeholder={t('libraries.placeholders.name')}
          required
        />
      </div>
      <textarea
        key={library.description}
        name="description"
        className="textarea textarea-bordered w-full flex-grow"
        placeholder={t('libraries.placeholders.description')}
        defaultValue={library.description || ''}
      ></textarea>

      <div className="flex items-center justify-end gap-4">
        <button disabled={disabled} type="submit" className="btn btn-primary btn-sm">
          {t('actions.save')}
        </button>
      </div>
    </form>
  )
}
