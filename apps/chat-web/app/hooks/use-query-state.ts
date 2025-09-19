import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { SetStateAction } from 'react'

export const useQueryState = <T>(key: string) => {
  const queryClient = useQueryClient()

  const { data: value } = useSuspenseQuery<T | null>({
    queryKey: [key],
    queryFn: () => null,
    staleTime: Infinity,
  })

  const setValue = (newValue: SetStateAction<T | null>) => {
    const actualValue =
      typeof newValue === 'function' ? (newValue as (prevState: T | null) => T | null)(value) : newValue

    queryClient.setQueryData([key], actualValue)
  }

  return [value, setValue] as const
}
