export const Keywords = ({ keywords }: { keywords: string[] }) => (
  <div className="flex flex-wrap gap-2">
    {keywords.map(
      (keyword, index) =>
        keyword && (
          <div
            key={`${keyword}_${index}`}
            className="border border-black rounded-md text-xs px-4 bg-slate-100"
          >
            {keyword}
          </div>
        ),
    )}
  </div>
)
