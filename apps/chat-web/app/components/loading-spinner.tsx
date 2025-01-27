export const LoadingSpinner = ({ isLoading }: { isLoading?: boolean }) => {
  if (isLoading) {
    return <span className="loading loading-ring loading-md"></span>
  }
}
