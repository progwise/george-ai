// Component for each compliance area with checkbox
interface ComplianceAreaProps {
  id: string
  title: string
  description: string
  isSelected: boolean
  isMandatory: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const ComplianceArea = ({ id, title, description, isSelected, onChange, isMandatory }: ComplianceAreaProps) => {
  return (
    <div key={id} className={`rounded-lg border p-3 ${isSelected && 'border-info bg-info/20'}`}>
      <label className="flex cursor-pointer items-center gap-3">
        <input
          disabled={isMandatory}
          type="checkbox"
          checked={isSelected}
          onChange={onChange}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <div>
          <span className="text-sm font-medium">{title}</span>
          <p className="mt-1 text-xs">{description}</p>
        </div>
      </label>
    </div>
  )
}
