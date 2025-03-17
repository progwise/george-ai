import { FragmentType, graphql, useFragment } from '../../gql'

const AssistantIcon_AssistantFragment = graphql(`
  fragment AssistantIcon_assistantFragment on AiAssistant {
    id
    name
    updatedAt
    iconUrl
  }
`)

interface AssistantIconProps {
  assistant: FragmentType<typeof AssistantIcon_AssistantFragment>
  className?: string
}

export const AssistantIcon = (props: AssistantIconProps): React.ReactElement => {
  const assistant = useFragment(AssistantIcon_AssistantFragment, props.assistant)
  console.log(assistant)
  return (
    <div className={props.className}>
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
