export const CollapseSymbolsSvg = ({
  isExpand,
  className = '',
}: {
  isExpand: boolean
  className: string
}) => {
  return (
    <svg
      className={`fill-current ${className} duration-200 ${
        isExpand ? 'group-hover:scale-y-75' : 'group-hover:scale-y-125'
      }`}
      width="24"
      height="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4 12.0131H20V14.0131H4V12.0131ZM4 9.01306H20V11.0131H4V9.01306ZM16 4.01306L12 8.01306L8 4.01306H11V1.01306H13V4.01306H16ZM8 19.0131L12 15.0131L16 19.0131H13V22.0131H11V19.0131H8Z" />
    </svg>
  )
}
