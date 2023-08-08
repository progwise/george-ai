import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 ">
      <div className="max-w-3xl flex flex-col gap-5">
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
            <span>
              Liest und analysiert das Intranet - zu Ihren Diensten...
            </span>
          </div>
        </div>
        <div className="relative">
          <input
            className="border border-black rounded-lg w-full p-1 px-2"
            type="text"
            placeholder="Stellen Sie Ihre Frage an das Intranet..."
          />
          <div>
            <Image
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8"
              src="/vector.svg"
              alt="Vector"
              width={48}
              height={48}
              priority
            />
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <span className="divide-y">
            ich habe folgende Informationen für Sie gefunden:
          </span>
          <div className="my-2 border-t border-gray-300"></div>
          <div className="flex justify-between">
            <div className="flex gap-2 items-center">
              <span className="font-bold text-lg">Urlaubsgeld</span>
              <div className="border border-black rounded-md px-6">draft</div>
              <div className="border border-black rounded-md px-6">
                published
              </div>
            </div>
            <div className="flex gap-4">
              <Image
                src="/thumbs-up.svg"
                alt="Thumbs Up"
                className="dark:invert"
                width={24}
                height={24}
                priority
              />
              <Image
                src="/thumbs-down-outline.svg"
                alt="Thumbs Down outline"
                className="dark:invert"
                width={24}
                height={24}
                priority
              />
            </div>
          </div>

          <div>
            <span>
              Die Springfield AG gewährte in den vergangenen Jahren regelmäßig
              Urlaubsgeld. Einen Antrag dazu müssen Sie nicht stellen.
            </span>
          </div>
          <div>
            <span>Quelle: </span>
            <a
              className="text-blue-500"
              href="http//intranet.springfield-ag.com/personal/urlaub"
            >
              http//intranet.springfield-ag.com/personal/urlaub
            </a>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <div className="border border-black rounded-md px-6">
                Personal
              </div>
              <div className="border border-black rounded-md px-6">
                Allgemeines
              </div>
              <div className="border border-black rounded-md px-6">Urlaub</div>
            </div>
            <button className="border border-black rounded-md px-6  text-xl">
              Details...
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
