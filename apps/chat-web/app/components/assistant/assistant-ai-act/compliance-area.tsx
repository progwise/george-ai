import { FragmentType, graphql, useFragment } from '../../../gql'
import { useTranslation } from '../../../i18n/use-translation-hook'

const ComplianceArea_Fragment = graphql(`
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
  area: FragmentType<typeof ComplianceArea_Fragment>
  selected: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const ComplianceArea = (props: ComplianceAreaProps) => {
  const { language } = useTranslation()
  const area = useFragment(ComplianceArea_Fragment, props.area)
  const { title, description, mandatory } = area
  return (
    <div className={`rounded-lg border p-3 ${mandatory && 'bg-info/20 border-info'}`}>
      <label className="flex cursor-pointer items-center gap-3">
        <input
          disabled={mandatory}
          type="checkbox"
          checked={mandatory}
          onChange={props.onChange}
          className="checkbox checkbox-sm"
        />
        <div>
          <span className="text-sm font-medium">{title[language]}</span>
          <p className="mt-1 text-xs">{description[language]}</p>
        </div>
      </label>
    </div>
  )
}
