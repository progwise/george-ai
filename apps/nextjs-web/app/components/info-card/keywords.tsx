export const Keywords = ({ keywords }: { keywords: string[] }) => (
  <div className="flex items-end justify-between gap-2">
    <div className="flex flex-wrap gap-2">
      {keywords.map((keyword, index) => (
        <div
          key={index}
          className="border border-black rounded-md px-6 bg-slate-100"
        >
          {keyword}
        </div>
      ))}
    </div>
    <button className="border border-black rounded-md px-6 text-xl bg-slate-100 hover:bg-slate-300">
      Details...
    </button>
  </div>
)
