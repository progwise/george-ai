import { HeroDe } from './hero-de'
import { ImpressDe } from './impress-de'
import { VersionIndicator } from './version-indicator'

export const HomeDe = () => {
  return (
    <div className="flex max-w-none flex-col gap-4">
      <HeroDe />

      <article className="animate-fade-up animate-delay-1000 prose prose-xl prose-gray mx-auto">
        <h2>Die Story</h2>
        In vielen Unternehmen gibt es diese eine oder mehrere unverzichtbare Personen pro Abteilung – oft jene, die
        Informationen zusammenführen, Probleme früh erkennen, Entscheidungen vorbereiten und für reibungslose Abläufe
        sorgen. Sie sind das Gedächtnis und die Verbindungspunkte des Teams. Doch dann fallen sie plötzlich aus – durch
        Krankheit, Elternzeit oder Ruhestand. Ihre Vertretung übersieht wichtige Details, findet Informationen nicht und
        braucht lange, um vergleichbare Ergebnisse zu liefern – wenn überhaupt.
      </article>
      <article className="animate-fade-up animate-delay-1000 prose prose-xl prose-gray mx-auto">
        <h2>Wenn Köpfe wechseln – George bleibt</h2>
        <p>
          George-AI speichert, was andere vergessen. Er begleitet Schlüsselpersonen, lernt mit – und gibt ihr Wissen
          nahtlos an Nachfolger:innen weiter. So läuft der Laden weiter, auch wenn Köpfe wechseln. Weniger Einarbeitung.
          Mehr Verlässlichkeit. Und auf Wunsch: 24/7 für alle ansprechbar.
        </p>
      </article>
      <hr />
      <ImpressDe />
      <VersionIndicator />
    </div>
  )
}
