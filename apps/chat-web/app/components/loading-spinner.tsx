export const LoadingSpinner = ({ isLoading, message }: { isLoading?: boolean; message?: string }) => {
  if (!isLoading) {
    return null
  }

  return (
    <div
      className="bg-base-300/50 fixed left-0 top-0 z-50 flex h-full w-full cursor-wait items-center justify-center"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex flex-col items-center">
        <div className="loading loading-ring text-primary w-24"></div>
        {message && <div className="text-base-content mt-2">{message}</div>}
      </div>
    </div>
  )
}
