interface JsonModalProps {
  title: string
  data: string
  ref?: React.Ref<HTMLDialogElement>
}

export const JsonModal = ({ title, data, ref }: JsonModalProps) => {
  const jsonData = JSON.parse(data)
  return (
    <dialog ref={ref} className="modal">
      <div className="modal-box max-w-4xl">
        <h3 className="mb-4 text-lg font-bold">{title}</h3>
        <div className="bg-base-200 rounded-lg p-4">
          <pre className="overflow-x-auto whitespace-pre-wrap text-xs">{JSON.stringify(jsonData, null, 2)}</pre>
        </div>
        <div className="modal-action">
          <form method="dialog">
            <button type="submit" className="btn">
              Close
            </button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit">close</button>
      </form>
    </dialog>
  )
}
