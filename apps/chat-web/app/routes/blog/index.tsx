import { Link, createFileRoute } from '@tanstack/react-router'

import { Impress } from '../../components/home/impress'
import { VersionIndicator } from '../../components/home/version-indicator'
import BowlerHatIcon from '../../icons/bowler-hat-icon'

export const Route = createFileRoute('/blog/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <section className="flex flex-col items-center gap-4">
      <div className="animate-fade-up flex w-full items-center justify-between bg-gradient-to-r from-cyan-900 to-sky-700 p-10 text-white">
        <h1 className="mb-4 flex items-center gap-8 text-5xl font-bold">
          <BowlerHatIcon className="inline-block h-20 w-20" />
          <span>Neugierig?</span>
        </h1>
        <Link to="/" className="btn btn-ghost" aria-label="Home">
          Zurück zur Startseite
        </Link>
      </div>
      <article className="animate-fade-up animate-delay-200 prose prose-xl prose-gray mx-auto">
        <h2>Erstellen und trainieren Sie Ihre eigenen Assistenten</h2>
        <p>
          Ihr KI-Assistent wird von Ihnen selbst erstellt und trainiert. Entwickeln Sie Ihre eigene KI-Lösung ohne eine
          Zeile Code zu schreiben.
        </p>
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
            HR-Chatbot, Logistik, Terminplanung und vieles mehr. Lassen Sie Ihrer Fantasie freien lauf und{' '}
            <a href="https://calendly.com/michael-vogt-progwise/30min" rel="noopener noreferrer" target="_blank">
              einen Termin mit uns
            </a>
            .
          </li>
          <li>
            <strong>Updates:</strong> George wird ständig weiterentwickelt und orientiert sich an den neuesten
            KI-Entwicklungen weltweit. Bleiben Sie am Ball und entickeln Sie neue Ideen am Puls der Zeit.
          </li>
          <li>
            <strong>EU-KI-Act-konform:</strong> Ihre KI-Lösung wird laufend bzgl. des EU-KI-Act Risk-Levels überwacht
          </li>
        </ul>
      </article>
      <article className="animate-fade-up animate-delay-200 prose prose-xl prose-gray mx-auto">
        <h2>Features</h2>
        <p>
          George-Ai liefert eine spannende UX, eine 100% API und ist vollständig in Ihre IT-Landschaft und in alle
          Anwendungen integrierbar.
        </p>
        <ul>
          <li>
            <strong>Mehr als ein Chatbot - viel mehr:</strong> nach den großen Vorbildern in der Industrie. Unterstützt
            multi-modale Modelle für Text, Bilder, Videos, Grafiken, Landkarten und vieles mehr.
            <strong> Ihre KI muss Ihnen und Ihren Mitarbeitern gefallen.</strong>
          </li>
          <li>
            <strong>KI-Modelle:</strong> Kann für jeden Assistenten und für jede Bibliothek nach Kosten/Nutzen
            individuell festgelegt werden. Nutzen Sie OpenAI, Google, Azure oder eben In-House Mistral, Anthropic,
            LLAMA, DeepSeek: Alles was Open-Source aktuell liefert
          </li>
          <li>
            <strong>Multi-Modal:</strong> George-Ai kann mit Bildern, Videos, Grafiken, Landkarten und Text umgehen.
            Nutzen Sie die neuesten Entwicklungen in der KI-Welt.
          </li>
          <li>
            <strong>Deep-Learning:</strong> George-Ai verwendet nicht nur RAG (Retrieval-Augmented-Generation) sondern
            setzt auf Fine-Tuning. Basierend auf der Datenlage in den Assistenten und Bibliotheken werden automatisiert
            Trainings vorbereitet und durchgeführt um Ihre Assistenten noch kompetenter zu machen. Laufend.
          </li>
          <li>
            <strong>API:</strong> George-Ai ist vollständig API-basiert. Sie können Ihre Assistenten in alle Anwendungen
            integrieren. Egal ob Web, App, Desktop oder IoT.
          </li>
          <li>
            <strong>Assistenten:</strong> Erstellen und verwalten Sie Assistenten zum Chat, für Email-Eingänge, Anrufe
            und vieles mehr
          </li>
          <li>
            <strong>Bibliotheken:</strong> Sammeln Sie ihre Daten manuell oder automatisiert im Unternehmen. Nicht nur
            Assistenten können darauf zugreifen, auch ein Zugriff direkt durch Benutzer ist möglich mittels
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
            <strong>Reporting:</strong> Erfassen Sie die Nutzung Ihrer KI-Lösung - für Ihr Unternehmen und auch für den
            EU-AI-Act.
          </li>
        </ul>
      </article>
      <article className="animate-fade-up animate-delay-200 prose prose-lg prose-gray mx-auto">
        <h2>AI-Act</h2>
        <p>
          George-Ai kümmert sich um die Einordnung Ihrer Use-Cases in EU-KI-Act Risk-Levels, ermöglich das Assesment und
          automatisierte die Einhaltung notwendiger Regeln.
        </p>
        <ul>
          <li>
            <strong>Automatisierte Einordnung</strong> in die Risk-Levels unacceptable, high risk, limited risk, minimal
            risk
          </li>
          <li>
            <strong>Reporting der Nutzung</strong> gemäß EU-KI-Act je nach Risk-Level unter Einhaltung des Datenschutzes
            und von Betriebsratsvereinbarungen.
          </li>
          <li>
            <strong>Automatische Aktualisierung</strong> der neuesten Vorschriften und Regeln. Wir kümmern uns täglich
            darum, dass Sie mit Ihrem Use-Case nicht an die Wand in Brüssel fahren.
          </li>
        </ul>
      </article>
      <hr />
      <Impress />
      <VersionIndicator />
    </section>
  )
}
