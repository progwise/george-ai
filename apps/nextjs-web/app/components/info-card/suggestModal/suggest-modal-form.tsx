'use client'

import Loading from '@/app/loading'
import { Dispatch, SetStateAction, useState } from 'react'

interface ModalFormProps {
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  fetching: boolean
  title: string
  formReference: React.RefObject<HTMLFormElement>
  summaryId: string
  textValue: string
  setTextValue: Dispatch<SetStateAction<string>>
}

export const ModalForm = ({
  handleSubmit,
  fetching,
  title,
  formReference,
  summaryId,
  textValue,
  setTextValue,
}: ModalFormProps) => {
  return (
    <>
      <form
        ref={formReference}
        onSubmit={handleSubmit}
        className="relative w-full max-h-full"
      >
        <div className="relative bg-white rounded-md shadow">
          <h3 className="font-bold text-lg p-4 border-b">{title}</h3>
          <div className="p-6 h-64">
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
          <div className="flex join justify-end p-4 border-t">
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
              className="btn join-item  w-24 btn-outline"
              onClick={() => {
                setTextValue('')
                const modal = document.querySelector(`#modal_${summaryId}`)
                if (modal instanceof HTMLDialogElement) {
                  modal.close()
                }
              }}
            >
              Close
            </button>
          </div>
        </div>
      </form>
    </>
  )
}
