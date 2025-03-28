import GeorgeBenefitsDe from './george-benefits-de'
import { ImpressDe } from './impress-de'

export const HomeDe = () => {
  return (
    <div className="prose prose-lg mt-10 flex max-w-none flex-col gap-4">
      <h1 className="m-0 p-0 text-center">Ihre KI. Ihre Daten. Ihre Regeln.</h1>
      <ul className="menu menu-horizontal justify-center rounded-box">
        <li>
          <a className="btn btn-sm" href="#features">
            Features
          </a>
        </li>
        <li>
          <a className="btn btn-sm" href="#ai-act">
            AI-Act
          </a>
        </li>
        <li>
          <a className="btn btn-sm" href="#impressum">
            Impressum
          </a>
        </li>
      </ul>
      <article className="flex flex-col gap-4 sm:flex-row">
        <div>
          <h2>Erstellen und trainieren Sie Ihre eigene Verwaltungs-KI.</h2>
          <p>
            Ihr KI-Assistent wird von Ihnen selbst erstellt und trainiert. Entwickeln Sie Ihre eigene KI-Lösung ohne
            eine Zeile Code zu schreiben.
          </p>
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
                eigenen Anwendungsfälle.
              </li>
              <li>
                <strong>Beispiele:</strong> Kundenchat, Mitarbeiterchat, Intranet-Suchmaschine, Vertragsmanagement,
                HR-Chatbot, Logistik, Terminplanung und vieles mehr. Lassen Sie Ihrer Fantasie freien lauf und
                vereinbaren einen Termin mit uns.
              </li>
              <li>
                <strong>Updates:</strong> George wird ständig weiterentwickelt und orientiert sich an den neuesten
                KI-Entwicklungen weltweit. Bleiben Sie am Ball und entickeln Sie neue Ideen am Puls der Zeit.
              </li>
              <li>
                <strong>EU-KI-Act-konform:</strong> Ihre KI-Lösung wird laufend bzgl. des EU-KI-Act Risk-Levels
                überwacht
              </li>
            </ul>

            <div className="mx-auto my-0 max-h-fit max-w-fit overflow-hidden rounded-3xl border">
              <img src="george-portrait.webp" alt="Portrait von George" className="m-0 object-scale-down p-0" />
            </div>
          </div>
        </div>
      </article>

      <div>
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
              <img src="george-features.webp" alt="Features von George" className="m-0 max-h-96 p-0" />
            </div>
            <div>
              <ul>
                <li>
                  <strong>Mehr als ein Chatbot - viel mehr:</strong> nach den großen Vorbildern in der Industrie.
                  Unterstützt multi-modale Modelle für Text, Bilder, Videos, Grafiken, Landkarten und vieles mehr.
                  <strong> Ihre KI muss Ihnen und Ihren Mitarbeitern gefallen.</strong>
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
                <li>
                  <strong>Reporting:</strong> Erfassen Sie die Nutzung Ihrer KI-Lösung - für Ihr Unternehmen und auch
                  für den EU-AI-Act.
                </li>
              </ul>
            </div>
          </div>
        </article>
      </div>
      <div>
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
                <li>
                  <strong>Automatische Aktualisierung</strong> der neuesten Vorschriften und Regeln. Wir kümmern uns
                  täglich darum, dass Sie mit Ihrem Use-Case nicht an die Wand in Brüssel fahren.
                </li>
              </ul>
            </div>
            <div className="mx-auto my-0 max-h-fit max-w-fit overflow-hidden rounded-3xl border">
              <img src="ai-act.webp" alt="AI-Act" className="m-0 max-h-96 p-0" />
            </div>
          </div>
        </article>
      </div>
      <GeorgeBenefitsDe />
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
