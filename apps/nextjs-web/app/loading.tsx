import { Spinner } from './components/spinner'

export default function Loading() {
  return (
    <div className="flex justify-center">
      <Spinner size={'medium'} />
    </div>
  )
}
