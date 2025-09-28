import { Link } from '@tanstack/react-router'

import BowlerHatIcon from '../../icons/bowler-hat-icon'
import { Impress } from './impress'
import { VersionIndicator } from './version-indicator'

export const AboutEn = () => {
  return (
    <section className="flex flex-col items-center gap-4">
      <div className="animate-fade-up flex w-full justify-between bg-gradient-to-r from-cyan-900 to-sky-700 p-4 text-white md:p-10">
        <h1 className="flex flex-col items-center gap-2 text-xl font-bold md:flex-row md:gap-8 lg:text-5xl">
          <BowlerHatIcon className="hidden h-20 w-20 lg:inline-block" />
          <span>Curious?</span>
          <a
            href="https://calendly.com/michael-vogt-progwise/30min"
            className="btn btn-ghost text-xl lg:text-5xl"
            target="_blank"
            rel="noopener noreferrer"
          >
            Schedule a meeting!
          </a>
        </h1>
        <Link to="/" className="btn btn-ghost" aria-label="Home">
          Back to homepage
        </Link>
      </div>

      <article className="prose prose-gray animate-fade-up animate-delay-200 lg:prose-xl mx-auto">
        <h2>Create and train your own assistants</h2>
        <p>
          Your AI assistant is created and trained by you. Build your own AI solution without writing a single line of
          code.
        </p>
        <ul>
          <li>
            <strong>No-Code:</strong> George is ready to use immediately. No unpredictable costs from a software
            development project.
          </li>
          <li>
            <strong>On-premise:</strong> Your data stays within your own network. 100% EU data protection compliant.
          </li>
          <li>
            <strong>Use cases:</strong> Experiment with George-AI: continuously explore and optimize your own use cases.
          </li>
          <li>
            <strong>Examples:</strong> Customer chat, employee chat, intranet search engine, contract management, HR
            chatbot, logistics, scheduling, and much more. Let your imagination run wild and{' '}
            <a href="https://calendly.com/michael-vogt-progwise/30min" rel="noopener noreferrer" target="_blank">
              book a meeting with us
            </a>
            .
          </li>
          <li>
            <strong>Updates:</strong> George is continuously evolving and follows the latest global AI developments.
            Stay on the cutting edge and develop new ideas.
          </li>
          <li>
            <strong>EU AI Act compliant:</strong> Your AI solution is continuously monitored regarding its EU AI Act
            risk level.
          </li>
        </ul>
      </article>

      <article className="prose prose-xl prose-gray animate-fade-up animate-delay-200 mx-auto">
        <h2>Features</h2>
        <p>
          George-AI offers an engaging UX, a 100% API, and full integration into your IT infrastructure and all
          applications.
        </p>
        <ul>
          <li>
            <strong>More than just a chatbot – much more:</strong> Inspired by the industry’s best. Supports multi-modal
            models for text, images, videos, graphics, maps, and more.
            <strong> Your AI should delight you and your team.</strong>
          </li>
          <li>
            <strong>AI models:</strong> You can define the best cost/benefit model per assistant and library. Use
            OpenAI, Google, Azure, or in-house models like Mistral, Anthropic, LLAMA, DeepSeek – everything open source
            offers today.
          </li>
          <li>
            <strong>Multi-modal:</strong> George-AI handles images, videos, graphics, maps, and text. Leverage the
            latest breakthroughs in the AI world.
          </li>
          <li>
            <strong>Deep learning:</strong> George-AI doesn’t just use RAG (Retrieval-Augmented Generation) but also
            fine-tuning. Based on the data in your assistants and libraries, training is automatically prepared and
            executed – continuously improving your AI.
          </li>
          <li>
            <strong>API:</strong> George-AI is fully API-based. You can integrate assistants into any application – web,
            app, desktop, or IoT.
          </li>
          <li>
            <strong>Assistants:</strong> Create and manage assistants for chat, email inboxes, phone calls, and much
            more.
          </li>
          <li>
            <strong>Libraries:</strong> Collect data manually or automatically within your organization. Assistants and
            users can access it via lightning-fast indexing.
          </li>
          <li>
            <strong>Workflows:</strong> Automate your processes with George-AI – not just with basic if/then rules.
          </li>
          <li>
            <strong>Permissions:</strong> Not all company data is meant for everyone: George respects your permission
            settings across all use cases.
          </li>
          <li>
            <strong>Reporting:</strong> Track the usage of your AI solution – for your business and for EU AI Act
            compliance.
          </li>
        </ul>
      </article>

      <article className="prose prose-lg prose-gray animate-fade-up animate-delay-200 mx-auto">
        <h2>AI Act</h2>
        <p>
          George-AI manages the classification of your use cases according to EU AI Act risk levels, enables assessment,
          and automates rule compliance.
        </p>
        <ul>
          <li>
            <strong>Automated classification</strong> into risk levels: unacceptable, high risk, limited risk, minimal
            risk.
          </li>
          <li>
            <strong>Usage reporting</strong> in accordance with the EU AI Act, based on risk level, compliant with data
            protection and labor agreements.
          </li>
          <li>
            <strong>Automatic updates</strong> of the latest laws and guidelines. We ensure every day that your use case
            stays on the right side of Brussels regulations.
          </li>
        </ul>
      </article>

      <hr />
      <Impress />
      <VersionIndicator />
    </section>
  )
}
