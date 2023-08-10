import Image from 'next/image'

export const Header = () => {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/pope-bowler-hat.svg"
        alt="Pope Bowler Hat"
        className="dark:invert"
        width={100}
        height={100}
        priority
      />
      <div className="flex flex-col">
        <span className="font-bold text-xl">George AI</span>
        <span>Liest und analysiert das Intranet - zu Ihren Diensten...</span>
      </div>
    </div>
  )
}
