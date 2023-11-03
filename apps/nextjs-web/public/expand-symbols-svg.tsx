export const ExpandSymbolsSvg = ({
  isExpand,
  className = '',
}: {
  isExpand: boolean
  className: string
}) => {
  return (
    <svg
      className={`fill-current ${className} ${
        isExpand ? 'group-hover:scale-y-75' : 'group-hover:scale-y-125'
      }`}
      width="24"
      height="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4 22.0131V20.0131H20V22.0131H4ZM12 19.0131L8 15.0131L9.4 13.6131L11 15.1631V8.86309L9.4 10.4131L8 9.01309L12 5.01309L16 9.01309L14.6 10.4131L13 8.86309V15.1631L14.6 13.6131L16 15.0131L12 19.0131ZM4 4.01309V2.01309H20V4.01309H4Z" />
    </svg>
  )
}
