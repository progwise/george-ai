import { ImpressDe } from './impress-de'

export const HomeDe = () => {
  return (
    <div className="prose prose-lg mt-10 flex max-w-none flex-col gap-4">
      <h1 className="mb-0 text-center">Ihre KI. Ihre Daten. Ihre Regeln.</h1>
      <ul className="menu menu-horizontal justify-center rounded-box">
        <li>
          <a href="#features">Features</a>
        </li>
        <li>
          <a href="#ai-act">AI-Act</a>
        </li>
        <li>
          <a href="#impressum">Impressum</a>
        </li>
      </ul>
      <article className="flex flex-col gap-4 sm:flex-row">
        <div>
          <h2>Erstellen und trainieren Sie Ihre eigene Verwaltungs-KI.</h2>
          <p>Ihr KI-Assistent wird von Ihnen selbst erstellt und trainiert. Entwickeln Sie Ihre eigene KI-Lösung</p>
          <div className="flex flex-col gap-4 lg:flex-row">
            <ul>
              <li>
                <strong>No-Code:</strong> George kann direkt eingesetzt werden. Kein Softwareentwicklungsprojekt mit
                unabsehbaren Folgekosten.
              </li>
              <li>
                <strong>On-premise:</strong> Ihre Daten bleiben in Ihrem Netzwerk. 100% EU Datenschutzkonform.
              </li>
              <li>
                <strong>Use-Cases:</strong> Experimentieren Sie mit George-Ai: Forschen und optimieren Sie laufend Ihre
                eigenen Einsatzzwecke KI.
              </li>
              <li>
                <strong>Beispiele:</strong> Kundenbetreuung, Intranet-Indizierung, Vertragsmanagement, HR-Chatbot,
                Logistik, Terminplanung und vieles mehr. Lassen Sie Ihrer Fantasie freien lauf und vereinbaren einen
                Termin mit uns.
              </li>
              <li>
                <strong>EU-KI-Act-konform:</strong> Ihre KI-Lösung laufend bzgl. des EU-KI-Act Risk-Levels eingestuft
                und
              </li>
            </ul>

            <div className="mx-auto my-0 max-h-fit max-w-fit overflow-hidden rounded-3xl border">
              <img src="george-portrait.png" alt="Portrait von George" className="m-0 object-scale-down p-0" />
            </div>
          </div>
        </div>
      </article>

      <div className="">
        <a id="features" href="#" className="float-right text-sm">
          Top
        </a>
        <article className="flex flex-col gap-4 sm:flex-row">
          <div>
            <h2>Features</h2>
            <p>
              George-Ai liefert eine spannende UX, eine 100% API und ist vollständig in Ihre IT-Landschaft und in alle
              Anwendungen integrierbar.
            </p>
            <div className="mx-auto my-0 max-h-fit max-w-fit overflow-hidden rounded-3xl border">
              <img src="george-features.png" alt="Features von George" className="m-0 max-h-96 p-0" />
            </div>
            <div className="">
              <ul>
                <li>
                  <strong>Mehr als ein Chatbot - viel mehr:</strong> nach den großen Vorbildern in der Industrie.
                  Unterstützt multi-modale Modelle für Text, Bilder, Videos, Grafiken, Landkarten und vieles mehr.
                </li>
                <li>
                  <strong>Public & Private Sprachmodelle:</strong> Kann für jeden Assistenten und für jede Bibliothek
                  nach Kosten/Nutzen individuell festgelegt werden. Nutzen Sie OpenAI, Google, Azure oder eben In-House
                  Mistral, Anthropic, LLAMA, DeepSeek: Alles was Open-Source aktuell liefert
                </li>
                <li>
                  <strong>Assistenten:</strong> Erstellen und verwalten Sie Assistenten zum Chat, für Email-Eingänge,
                  Anrufe und vieles mehr
                </li>
                <li>
                  <strong>Bibliotheken:</strong> Sammeln Sie ihre Daten manuell oder automatisiert im Unternehmen. Nicht
                  nur Assistenten können darauf zugreifen, auch ein Zugriff direkt durch Benutzer ist möglich mittels
                  blitzschneller Indizierung
                </li>
                <li>
                  <strong>Workflows:</strong> Automatisieren Sie Ihre Prozesse mit George-Ai. Workflow nicht nur mittels
                  Wenn/Dann.
                </li>
                <li>
                  <strong>Berechtigungen:</strong> Nicht alle Daten im Unternehmen sind für jedermann bestimmt: George
                  berücksichtigt Ihre Berechtigungen Use-Case übergreifend.
                </li>
              </ul>
            </div>
          </div>
        </article>
      </div>
      <div className="">
        <a id="ai-act" href="#" className="float-right text-sm">
          Top
        </a>
        <article className="flex flex-col gap-4 sm:flex-row">
          <div>
            <h2 className="flex justify-between">AI-Act</h2>
            <p>
              George-Ai kümmert sich um die Einordnung Ihrer Use-Cases in EU-KI-Act Risk-Levels, ermöglich das Assesment
              und automatisierte die Einhaltung notwendiger Regeln.
            </p>
            <div>
              <ul>
                <li>
                  <strong>Automatisierte Einordnung</strong> in die Risk-Levels unacceptable, high risk, limited risk,
                  minimal risk
                </li>
                <li>
                  <strong>Reporting der Nutzung</strong> gemäß EU-KI-Act je nach Risk-Level unter Einhaltung des
                  Datenschutzes und von Betriebsratsvereinbarungen.
                </li>
              </ul>
            </div>
            <div className="mx-auto my-0 max-h-fit max-w-fit overflow-hidden rounded-3xl border">
              <img src="ai-act.png" alt="AI-Act" className="m-0 max-h-96 p-0" />
            </div>
          </div>
        </article>
      </div>
      <div className="mt-52">
        <hr />
        <a id="impressum" href="#" className="float-right text-sm">
          Top
        </a>
        <ImpressDe />
      </div>
    </div>
  )
}
