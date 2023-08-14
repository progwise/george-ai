import { CgSpinner } from 'react-icons/cg'

export enum Size {
  small = 30,
  medium = 60,
  large = 90,
}

interface SpinnerProperties {
  size?: keyof typeof Size
}

export const Spinner = ({ size }: SpinnerProperties): JSX.Element => {
  return (
    <CgSpinner
      size={size ? Size[size] : Size.small}
      className="inline animate-spin dark:text-blue-600"
      role="progressbar"
    />
  )
}
