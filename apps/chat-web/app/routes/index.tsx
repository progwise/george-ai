import { createFileRoute } from '@tanstack/react-router'

const Home = () => {
  return (
    <div className="flex flex-row gap-4">
      <article className="prose prose-xl my-auto">
        <h1>Your AI. Your Data. Your Rules.</h1>
        <p>
          Meet George-AI: a custom-trained AI assistant tailored to your
          business needs. Create unique content, handle customer interactions,
          and streamline workflows — all powered by your own data sources and
          fully compliant with European data protection standards.
        </p>
        <button type="button" className="btn btn-primary">
          Start Training Your AI
        </button>
      </article>
      <img
        src="george-portrait.jpg"
        alt="George AI"
        className="max-w-96 block object-scale-down"
      />
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: Home,
})
