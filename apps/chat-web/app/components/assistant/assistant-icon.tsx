import { AssistantBaseFragment } from '../../gql/graphql'

interface AssistantIconProps {
  assistant: AssistantBaseFragment
  className?: string
}

export const AssistantIcon = ({ assistant, className }: AssistantIconProps): React.ReactElement => {
  return (
    <div className={className}>
      <img
        className="h-full w-full object-cover"
        src={assistant.iconUrl + '&updated=' + assistant.updatedAt}
        alt={assistant.name}
        onError={(event) => {
          event.currentTarget.hidden = true
        }}
      />
    </div>
  )
}
