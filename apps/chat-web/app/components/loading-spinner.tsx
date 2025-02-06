export const LoadingSpinner = ({ isLoading }: { isLoading?: boolean }) => {
  if (isLoading) {
    return (
      <div
        className="fixed cursor-wait left-0 top-0 w-full h-full bg-gray-300 bg-opacity-45 z-50 flex justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="loading loading-ring w-24 bg-green-700"></div>
      </div>
    )
  }
}
