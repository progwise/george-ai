import { Link } from '@tanstack/react-router'
import React from 'react'

import { graphql } from '../../../gql'
import { AssistantAvatar_AiAssistantFragment } from '../../../gql/graphql'
import { Avatar } from './avatar'

graphql(`
  fragment AssistantAvatar_AiAssistant on AiAssistant {
    id
    name
    iconUrl
    __typename
  }
`)

interface AssistantAvatarProps {
  assistant: AssistantAvatar_AiAssistantFragment
  hideLink?: boolean
}

export const AssistantAvatar = ({ assistant: { id, iconUrl, name }, hideLink = false }: AssistantAvatarProps) => {
  return (
    <AssistantLink id={id} hideLink={hideLink}>
      <Avatar id={id} name={name} imageUrl={iconUrl ?? undefined} />
    </AssistantLink>
  )
}

const AssistantLink = ({ id, hideLink, children }: React.PropsWithChildren<{ hideLink: boolean; id: string }>) => {
  if (hideLink) {
    return <>{children}</>
  }

  return (
    <Link to="/assistants/$assistantId" params={{ assistantId: id }}>
      {children}
    </Link>
  )
}
