export const LoadingSpinner = ({ isLoading, message }: { isLoading?: boolean; message?: string }) => {
  if (isLoading) {
    return (
      <div
        className="fixed left-0 top-0 z-50 flex h-full w-full cursor-wait justify-center bg-gray-300 bg-opacity-45"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="loading loading-ring w-24 bg-green-700"></div>
        <span>{message}</span>
      </div>
    )
  }
}
