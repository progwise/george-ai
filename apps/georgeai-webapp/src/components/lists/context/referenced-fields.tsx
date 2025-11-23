import { graphql } from '../../../gql'
import { FieldModal_ListFragment, ReferencedFields_FieldReferencesFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'

graphql(`
  fragment ReferencedFields_FieldReferences on AiListFieldContext {
    id
    contextFieldId
    contextField {
      id
      name
      type
      sourceType
    }
  }
`)

interface ReferencedFieldsProps {
  list: FieldModal_ListFragment
  fieldId: string
  fieldReferences: ReferencedFields_FieldReferencesFragment[]
}

export const ReferencedFields = ({ list, fieldId, fieldReferences }: ReferencedFieldsProps) => {
  const { t } = useTranslation()

  if (list.fields?.length === 0) {
    return (
      <div className="text-base-content/50 py-4 text-center text-sm">{t('lists.contextSources.noFieldsAvailable')}</div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-base-content/60 text-sm">{t('lists.contextSources.referencedFieldsHelp')}</p>

      {/* Checkboxes for all available fields */}
      <div className="space-y-1">
        {(list.fields || [])
          .filter((field) => field.id !== fieldId) // ← Add this line
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((referencedField) => (
            <label
              key={`contextFieldReference_${fieldId}_${referencedField.id}`}
              className="hover:bg-base-200 flex cursor-pointer items-center gap-2 rounded p-2"
            >
              <input
                type="checkbox"
                name={`contextFieldReference_${referencedField.id}`}
                value={referencedField.id}
                className="checkbox checkbox-sm"
                defaultChecked={fieldReferences.some((ref) => ref.contextFieldId === referencedField.id)}
              />
              <span className="flex-1 text-sm">{referencedField.name}</span>
              <span className="badge badge-sm badge-ghost">{t(`lists.fields.types.${referencedField.type}`)}</span>
              <span className="badge badge-sm badge-outline">
                {referencedField.sourceType === 'file_property'
                  ? t('lists.fields.fileProperty')
                  : t('lists.fields.computed')}
              </span>
            </label>
          ))}
      </div>
    </div>
  )
}
