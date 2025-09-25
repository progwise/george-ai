export const SortingIcon = ({ direction }: { direction: 'asc' | 'desc' | null }) => {
  // === 'asc' ? '↑' : '↓'
  if (direction === 'asc') {
    return <span>↑</span>
  } else if (direction === 'desc') {
    return <span>↓</span>
  } else {
    return <span>⇅</span>
  }
}
