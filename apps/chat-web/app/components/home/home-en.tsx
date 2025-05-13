import { Hero } from './hero'
import { ImpressEn } from './impress-en'
import { VersionIndicator } from './version-indicator'

export const HomeEn = () => {
  return (
    <>
      <Hero />

      <div className="bg-base-200 -mx-body px-body flex flex-col gap-6 py-16">
        <article className="prose prose-gray animate-fade-up animate-delay-1000 md:prose-xl mx-auto">
          <h2>The Story</h2>
          <p>
            In many companies, there is one – or sometimes several – indispensable person per department. Often, they
            are the ones who consolidate information, detect problems early, prepare decisions, and ensure smooth
            operations. They are the memory and connection points of the team. But then, suddenly, they’re unavailable –
            due to illness, parental leave, or retirement. Their replacement overlooks important details, can’t find the
            right information, and takes a long time to deliver comparable results – if at all.
          </p>
        </article>
        <article className="prose prose-gray animate-fade-up animate-delay-1000 md:prose-xl mx-auto">
          <h3>When people change – George remains</h3>
          <p>
            George-AI remembers what others forget. It supports key personnel, learns alongside them – and seamlessly
            passes on their knowledge to successors. That way, operations continue, even when people change. Less
            onboarding. More reliability. And, if desired: available 24/7 for everyone.
          </p>
        </article>
      </div>

      <div className="mx-auto py-16">
        <ImpressEn />
        <VersionIndicator />
      </div>
    </>
  )
}
