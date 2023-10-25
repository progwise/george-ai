import Loading from '@/app/loading'
import { Dispatch, SetStateAction } from 'react'

interface ModalFormProps {
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  fetching: boolean
  title: string
  summaryId: string
  textValue: string
  setTextValue: Dispatch<SetStateAction<string>>
}

export const ModalForm = ({
  handleSubmit,
  fetching,
  title,
  summaryId,
  textValue,
  setTextValue,
}: ModalFormProps) => {
  return (
    <form onSubmit={handleSubmit} className="card card-bordered card-body">
      <h3 className="card-title">{title}</h3>
      <div className="divider" />
      <div className="h-60">
        <div className="flex h-full items-center justify-center">
          {!fetching && (
            <textarea
              name="proposalSummary"
              className="textarea w-full h-full resize-none"
              placeholder="Enter your proposal"
              value={textValue}
              onChange={(event) => setTextValue(event.target.value)}
            />
          )}
          {fetching && <Loading />}
        </div>
      </div>
      <div className="divider" />
      <div className="join justify-end">
        <button
          type="submit"
          disabled={fetching || !textValue}
          className={`btn join-item w-24 ${
            fetching || !textValue ? 'btn-disabled' : 'btn-accent'
          }`}
        >
          Submit
        </button>
        <button
          type="button"
          className="btn join-item w-24 btn-outline"
          onClick={() => {
            const modal = document.querySelector(`#modal_${summaryId}`)
            if (modal instanceof HTMLDialogElement) {
              modal.close()
            }
          }}
        >
          Close
        </button>
      </div>
    </form>
  )
}
