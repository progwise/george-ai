import { CombinedError } from 'urql'

interface ModalToastProps {
  showSuccessToast: boolean
  showErrorToast: boolean
  error: CombinedError | undefined
}

export const ModalToast = ({
  showSuccessToast,
  showErrorToast,
  error,
}: ModalToastProps) => {
  return (
    <div className="toast toast-center toast-middle">
      {showSuccessToast && (
        <div className="alert alert-success animate-bounce">
          <span>Proposal successfully created</span>
        </div>
      )}
      {showErrorToast && (
        <div className="alert alert-error animate-bounce">
          <span>An error has occurred: {error?.message}</span>
        </div>
      )}
    </div>
  )
}
