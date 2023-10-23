'use client'

import { graphql } from '@/src/gql'
import { useRef, useState } from 'react'
import { useMutation } from 'urql'
import { ModalForm } from './suggest-modal-form'

export const SuggestModal = ({
  title,
  summaryId,
}: {
  title: string
  summaryId: string
}) => {
  const formReference = useRef<HTMLFormElement | null>(null)
  const [textValue, setTextValue] = useState('')
  const [{ data, fetching, error }, createProposalSummary] = useMutation(
    graphql(`
      mutation CreateProposalSummary(
        $proposalSummary: String!
        $summaryId: String!
      ) {
        createProposalSummary(
          data: { proposalSummary: $proposalSummary, summaryId: $summaryId }
        ) {
          id
        }
      }
    `),
  )

  const [showErrorToast, setShowErrorToast] = useState(!!data)
  const [showSuccessToast, setShowSuccessToast] = useState(!!error)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formReference.current) {
      return
    }
    const formData = new FormData(formReference.current)
    const proposalSummary = formData.get('proposalSummary')
    if (typeof proposalSummary !== 'string') {
      return
    }

    await createProposalSummary({
      proposalSummary,
      summaryId,
    })
  }

  return (
    <div className="flex justify-center">
      <button
        className="btn btn-outline btn-accent btn-sm"
        onClick={() => {
          const modal = document.querySelector(`#modal_${summaryId}`)
          if (modal instanceof HTMLDialogElement) {
            modal.showModal()
          }
        }}
      >
        Suggest proposal
      </button>
      <dialog id={`modal_${summaryId}`} className="modal modal-xl shadow-xl">
        <div className="modal-box max-w-2xl p-0">
          <ModalForm
            key={`modalForm_${summaryId}`}
            handleSubmit={handleSubmit}
            fetching={fetching}
            title={title}
            formReference={formReference}
            summaryId={summaryId}
            textValue={textValue}
            setTextValue={setTextValue}
          />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setTextValue('')}>close</button>
        </form>
        <div className="toast toast-top toast-end">
          {showSuccessToast && (
            <div className="alert alert-success animate-bounce">
              <svg
                fill="currentColor"
                width="14"
                height="14"
                viewBox="0 0 11 11"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5.38548 5.51159L8.19948 2.69484C8.24913 2.64495 8.27697 2.57742 8.27693 2.50704C8.27688 2.43666 8.24894 2.36916 8.19923 2.31934C8.09973 2.22034 7.92448 2.21984 7.82398 2.31984L5.01073 5.13659L2.19648 2.31909C2.09648 2.22034 1.92123 2.22084 1.82173 2.31959C1.79704 2.34419 1.77748 2.37346 1.76422 2.40569C1.75096 2.43793 1.74425 2.47248 1.74448 2.50734C1.74448 2.57834 1.77198 2.64484 1.82173 2.69409L4.63573 5.51134L1.82198 8.32884C1.77233 8.37881 1.74452 8.44643 1.74466 8.51687C1.7448 8.58731 1.77288 8.65482 1.82273 8.70459C1.87098 8.75234 1.93923 8.77984 2.00973 8.77984H2.01123C2.08198 8.77959 2.15023 8.75184 2.19748 8.70359L5.01073 5.88684L7.82498 8.70434C7.87473 8.75384 7.94123 8.78134 8.01173 8.78134C8.04659 8.78144 8.08113 8.77465 8.11336 8.76135C8.14558 8.74805 8.17486 8.72852 8.19951 8.70387C8.22416 8.67922 8.2437 8.64994 8.25699 8.61771C8.27029 8.58549 8.27708 8.55095 8.27698 8.51609C8.27698 8.44534 8.24948 8.37859 8.19948 8.32934L5.38548 5.51159Z" />
              </svg>
              <span>Proposal successfully created</span>
            </div>
          )}
          {showErrorToast && (
            <div className="alert alert-error animate-bounce">
              <span>An error has occurred: {error?.message}</span>
            </div>
          )}
        </div>
      </dialog>
    </div>
  )
}
