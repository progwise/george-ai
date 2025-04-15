// Component for each compliance area with checkbox
interface ComplianceAreaProps {
  id: string
  title: string
  description: string
  isSelected: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const ComplianceArea = ({ id, title, description, isSelected, onChange }: ComplianceAreaProps) => {
  return (
    <div
      key={id}
      className={`rounded-lg border p-3 ${isSelected ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}`}
    >
      <label className="flex cursor-pointer items-start">
        <div className="mt-0.5 flex h-5 items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
        <div className="ml-3">
          <span className={`text-sm font-medium ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>{title}</span>
          <p className={`mt-1 text-xs ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>{description}</p>
        </div>
      </label>
    </div>
  )
}
