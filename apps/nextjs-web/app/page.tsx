import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div>
        <div>
          <Image
            src="/pope-bowler-hat.svg"
            alt="Pope Bowler Hat"
            className="dark:invert"
            width={100}
            height={100}
            priority
          />
          <h2>George AI</h2>
          <span>Liest und analysiert das Intranet - zu Ihren Diensten...</span>
        </div>
        <input
          type="text"
          placeholder="Stellen Sie Ihre Frage an das Intranet..."
        />
        <div>
          <span>ich habe folgende Informationen für Sie gefunden:</span>
          <div className="grid grid-cols-1 divide-y"></div>
          <div>
            <div>
              <h3>UrlaubsGeld</h3>
              <div className="border-2 border-indigo-600">draft</div>
              <div className="border-2 border-indigo-600">published</div>
            </div>
            <div>
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
            <span>Quelle:</span>
            <a href="http//intranet.springfield-ag.com/personal/urlaub">
              http//intranet.springfield-ag.com/personal/urlaub
            </a>
          </div>
          <div>
            <div className="border-2 border-indigo-600">Personal</div>
            <div className="border-2 border-indigo-600">Allgemeines</div>
            <div className="border-2 border-indigo-600">Urlaub</div>
          </div>
        </div>
      </div>
    </main>
  );
}
