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
    <div key={id} className={`rounded-lg border p-3 ${isSelected && 'border-info bg-info/40'}`}>
      <label className="flex cursor-pointer gap-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onChange}
          className={`checkbox checkbox-xs self-center ${isSelected && 'checkbox-info'}`}
        />
        <div>
          <span className="text-sm font-medium">{title}</span>
          <p className="mt-1 text-xs">{description}</p>
        </div>
      </label>
    </div>
  )
}
