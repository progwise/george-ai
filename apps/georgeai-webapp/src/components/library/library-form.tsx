import React from 'react'

import { graphql } from '../../gql'
import { AiLibraryForm_LibraryFragment, CurrentUserFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { ReprocessIcon } from '../../icons/reprocess-icon'
import { SaveIcon } from '../../icons/save-icon'
import { Input } from '../form/input'
import { ApiKeysCard } from './api-keys-card'
import { getLibraryUpdateFormSchema } from './server-functions/update-library'
import { useLibraryActions } from './use-library-actions'

graphql(`
  fragment AiLibraryForm_Library on AiLibrary {
    id
    name
    filesCount
    description
  }
`)

export interface LibraryEditFormProps {
  user: CurrentUserFragment
  library: AiLibraryForm_LibraryFragment
}

export const LibraryForm = ({ user, library }: LibraryEditFormProps): React.ReactElement => {
  const { t, language } = useTranslation()
  const formRef = React.useRef<HTMLFormElement>(null)

  const { updateLibrary, isPending } = useLibraryActions(library.id)

  const schema = React.useMemo(() => getLibraryUpdateFormSchema(language), [language])

  const fieldProps = {
    schema,
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    updateLibrary(formData)
  }

  const handleReset = () => {
    if (formRef.current) {
      // Reset form to original library values
      formRef.current.reset()
    }
  }

  return (
    <div className="grid size-full grid-rows-[auto_1fr] gap-2">
      <div className="flex justify-end">
        <ul className="menu flex-nowrap menu-xs rounded-box bg-base-200 shadow-lg md:menu-horizontal">
          <li>
            <button type="submit" form={library.id} disabled={isPending}>
              <SaveIcon className="size-5" />
              {t('actions.save')}
            </button>
          </li>
          <li>
            <button type="button" onClick={handleReset}>
              <ReprocessIcon className="size-5" />
              {t('actions.cancel')}
            </button>
          </li>
        </ul>
      </div>
      <div className="overflow-auto">
        <form id={library.id} ref={formRef} onSubmit={(e) => handleSubmit(e)} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={library.id} />

          {/* Basic Information Card */}
          <div className="card border border-base-300 bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="card-title text-base-content/80">{t('labels.basicInformation')}</h2>
              <div className="space-y-4">
                {/* Library Name */}
                <Input
                  name="name"
                  type="text"
                  label={t('labels.name')}
                  value={library.name}
                  className="col-span-2"
                  required
                  {...fieldProps}
                />

                <Input
                  name="description"
                  type="textarea"
                  label={t('labels.description')}
                  value={library.description || ''}
                  className="col-span-2"
                  {...fieldProps}
                />
              </div>
            </div>
          </div>

          {/* File Processing Options Card */}
        </form>

        <div className="card mt-4 border border-base-300 bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title text-base-content/80">{t('apiKeys.title')}</h2>
            {/* API Keys Management should move to workspaces */}
            <ApiKeysCard user={user} />
          </div>
        </div>
      </div>
    </div>
  )
}
