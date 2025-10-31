import { graphql } from '../../../gql'
import { ComplianceArea_ComplianceFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'

graphql(`
  fragment ComplianceArea_Compliance on AiActComplianceArea {
    title {
      de
      en
    }
    description {
      de
      en
    }
    mandatory
  }
`)

interface ComplianceAreaProps {
  area: ComplianceArea_ComplianceFragment
}

export const ComplianceArea = ({ area }: ComplianceAreaProps) => {
  const { language } = useTranslation()
  const { title, description, mandatory } = area
  return (
    <div className={`rounded-lg border p-3 ${mandatory && 'bg-info/20 border-info'}`}>
      <label className="flex cursor-pointer items-center gap-3">
        <input type="checkbox" checked={mandatory} className="checkbox checkbox-sm" />
        <div>
          <span className="text-sm font-medium">{title[language]}</span>
          <p className="mt-1 text-xs">{description[language]}</p>
        </div>
      </label>
    </div>
  )
}
