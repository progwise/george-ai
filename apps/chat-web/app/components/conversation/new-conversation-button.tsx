import { useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { AssistantBaseFragment, UserFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { PlusIcon } from '../../icons/plus-icon'
import { NewConversationDialog } from './new-conversation-dialog'

interface NewConversationButtonProps {
  availableAssistants: AssistantBaseFragment[]
  users: UserFragment[]
  userId: string
  className?: string
}

export const NewConversationButton = ({
  availableAssistants,
  users,
  userId,
  className,
}: NewConversationButtonProps) => {
  const { t } = useTranslation()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <button type="button" className={twMerge('btn btn-primary', className)} onClick={() => setModalOpen(true)}>
        <PlusIcon />
        {t('actions.new')}
      </button>

      <NewConversationDialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        allAssistants={availableAssistants}
        allUsers={users}
        userId={userId}
      />
    </>
  )
}
