import Loading from '@/app/loading'
import React from 'react'
import { CombinedError } from 'urql'

interface ModalFormProps {
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  data: boolean
  fetching: boolean
  error: CombinedError | undefined
  title: string
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  formReference: React.RefObject<HTMLFormElement>
}

export const ModalForm = ({
  handleSubmit,
  data,
  fetching,
  error,
  title,
  setIsModalOpen,
  formReference,
}: ModalFormProps) => {
  return (
    <form
      ref={formReference}
      onSubmit={handleSubmit}
      onClick={(event) => event.stopPropagation()}
      className="relative w-full max-w-2xl max-h-full"
    >
      <div className="relative bg-white rounded-md shadow ">
        <h3 className="font-bold text-lg p-4 border-b">{title}</h3>
        <div className="p-6 h-64">
          <div className="flex h-full items-center justify-center">
            {!fetching && !data && !error && (
              <textarea
                name="proposalSummary"
                className="border rounded-md p-2 w-full h-full resize-none"
                placeholder="Enter your proposal"
              />
            )}
            {fetching && <Loading />}
            {data && <span>Proposal successfully created</span>}
            {error && <span>An error has occurred: {error.message}</span>}
          </div>
        </div>
        <div className="flex gap-4 items-center justify-end p-4 border-t">
          <button
            type="submit"
            disabled={fetching || data || !!error}
            className="text-white bg-blue-500 hover:bg-blue-800 font-medium rounded-md text-sm px-4 py-2 disabled:opacity-50 disabled:bg-blue-500 disabled:cursor-not-allowed"
          >
            Submit
          </button>
          <button
            onClick={() => {
              setIsModalOpen(false)
            }}
            className="bg-white hover:bg-slate-300 rounded-md border text-sm font-medium px-4 py-2 "
          >
            {fetching || data || error ? 'Close' : 'Cancel'}
          </button>
        </div>
      </div>
    </form>
  )
}
