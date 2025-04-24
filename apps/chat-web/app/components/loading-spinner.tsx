export const LoadingSpinner = ({ isLoading, message }: { isLoading?: boolean; message?: string }) => {
  if (!isLoading) {
    return null
  }

  return (
    <div
      className="fixed left-0 top-0 z-50 flex h-full w-full cursor-wait items-center justify-center bg-base-300/50"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex flex-col items-center">
        <div className="loading loading-ring w-24 text-primary"></div>
        {message && <div className="mt-2 text-base-content">{message}</div>}
      </div>
    </div>
  )
}
