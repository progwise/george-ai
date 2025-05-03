import { User } from '../../gql/graphql'
import { HeroEn } from './hero-en'
import { ImpressEn } from './impress-en'
import { VersionIndicator } from './version-indicator'

interface HomeEnProps {
  user: Pick<User, 'email' | 'id' | 'name'> | null
}

export const HomeEn = ({ user }: HomeEnProps) => {
  return (
    <div className="flex max-w-none flex-col gap-4">
      <HeroEn user={user} />

      <article className="prose prose-xl prose-gray mx-auto animate-fade-up animate-delay-1000">
        <h2>The Story</h2>
        In many companies, there is one – or sometimes several – indispensable person per department. Often, they are
        the ones who consolidate information, detect problems early, prepare decisions, and ensure smooth operations.
        They are the memory and connection points of the team. But then, suddenly, they’re unavailable – due to illness,
        parental leave, or retirement. Their replacement overlooks important details, can’t find the right information,
        and takes a long time to deliver comparable results – if at all.
      </article>
      <article className="prose prose-xl prose-gray mx-auto animate-fade-up animate-delay-1000">
        <h2>When people change – George remains</h2>
        <p>
          George-AI remembers what others forget. It supports key personnel, learns alongside them – and seamlessly
          passes on their knowledge to successors. That way, operations continue, even when people change. Less
          onboarding. More reliability. And, if desired: available 24/7 for everyone.
        </p>
      </article>

      <hr />
      <ImpressEn />
      <VersionIndicator />
    </div>
  )
}
