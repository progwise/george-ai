import Image from 'next/image'

export const Header = () => {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/pope-bowler-hat.svg"
        alt="Pope Bowler Hat"
        width={100}
        height={100}
      />
      <div className="flex flex-col">
        <h1 className="font-bold text-xl">George AI</h1>
        <span>Liest und analysiert das Intranet - zu Ihren Diensten...</span>
      </div>
    </div>
  )
}
