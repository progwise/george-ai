import { IconProps } from './icon-props'

export const ArrayIcon = ({ className, ...props }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#000000" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1.5 2l-.5.5v11l.5.5H4v-1H2V3h2V2H1.5zm13 12l.5-.5v-11l-.5-.5H12v1h2v10h-2v1h2.5z"
    ></path>
  </svg>
)
