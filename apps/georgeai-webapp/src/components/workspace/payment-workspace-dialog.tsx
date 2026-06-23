import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { CurrentUserFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { DialogForm } from '../dialog-form'
import { getWorkspacePaymentStatusQueryOptions } from './queries/get-workspace-payment-status'
import { useWorkspace } from './use-workspace'

interface PaymentWorkspaceDialogProps {
  user: CurrentUserFragment
  ref: React.RefObject<HTMLDialogElement | null>
}

export const PaymentWorkspaceDialog = ({ user, ref }: PaymentWorkspaceDialogProps) => {
  const { t } = useTranslation()
  const { currentWorkspace, isPending, isLoading } = useWorkspace(user)

  const { data: paymentStatus } = useQuery(getWorkspacePaymentStatusQueryOptions(currentWorkspace?.id))

  const canPayWorkspace = useMemo(() => {
    if (!currentWorkspace) return false
    return !paymentStatus?.isPaid
  }, [currentWorkspace, paymentStatus])

  if (!currentWorkspace) return null

  const handleCheckout = () => {
    const { hostname, port } = window.location
    const domain = port === '3001' ? `http://${hostname}:4321` : window.location.origin
    window.location.href = `${domain}/pricing?workspaceId=${currentWorkspace.id}`
  }

  return (
    <DialogForm
      ref={ref}
      title={
        canPayWorkspace
          ? `${t('workspace.paymentTitle', { workspaceName: currentWorkspace.name })}`
          : `${t('workspace.paidTitle')} ${currentWorkspace.name}`
      }
      description={
        canPayWorkspace
          ? t('workspace.paymentDescription')
          : t('workspace.validUntil', {
              subscriptionType: t(`workspace.subscription.${paymentStatus?.subscriptionType}`),
              validUntil: paymentStatus?.validUntil
                ? new Date(paymentStatus.validUntil).toLocaleDateString('de-DE')
                : '—',
            })
      }
      onSubmit={canPayWorkspace ? () => handleCheckout() : () => {}}
      submitButtonText={canPayWorkspace ? t('workspace.pricing') : undefined}
      disabledSubmit={isPending || isLoading}
      buttonOptions={canPayWorkspace ? 'cancelAndConfirm' : 'onlyClose'}
    />
  )
}
