export const Link = ({ url }: { url: string }) => (
  <div>
    <span>Quelle: </span>
    <a
      className="text-blue-500 line-clamp-2"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {url}
    </a>
  </div>
)
