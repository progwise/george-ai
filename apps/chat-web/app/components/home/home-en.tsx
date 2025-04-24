import GeorgeBenefitsEn from './george-benefits-en'
import { ImpressEn } from './impress-en'
import { VersionIndicator } from './version-indicator'

export const HomeEn = () => {
  return (
    <div className="prose prose-lg mt-10 flex max-w-none flex-col gap-4">
      <h1 className="m-0 p-0 text-center">Your AI. Your Data. Your Rules.</h1>
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
            Imprint
          </a>
        </li>
      </ul>
      <article className="flex flex-col gap-4 sm:flex-row">
        <div>
          <h2>Create and train your own administrative AI.</h2>
          <p>
            Your AI assistant is created and trained by you. Develop your own AI solution without writing a single line
            of code.
          </p>
          <div className="flex flex-col gap-4 lg:flex-row">
            <ul>
              <li>
                <strong>No-Code:</strong> George can be used directly. No software development project with
                unpredictable follow-up costs.
              </li>
              <li>
                <strong>On-premise:</strong> Your data stays within your network. 100% EU data protection compliant.
              </li>
              <li>
                <strong>Use Cases:</strong> Experiment with George-AI: Continuously explore and optimize your own AI use
                cases.
              </li>
              <li>
                <strong>Examples:</strong> Customer support, employee chat, intranet search engine, contract management,
                HR chatbot, logistics, appointment scheduling, and much more. Let your imagination run wild and book a
                meeting with us.
              </li>
              <li>
                <strong>Updates:</strong> George is constantly being developed and follows the latest AI developments
                worldwide. Stay on top and develop new ideas at the pulse of time.
              </li>
              <li>
                <strong>EU AI Act compliant:</strong> Your AI solution is continuously surveyed according to the EU AI
                Act risc levels
              </li>
            </ul>

            <div className="mx-auto my-0 max-h-fit max-w-fit overflow-hidden rounded-3xl border">
              <img src="george-portrait.webp" alt="Portrait of George" className="m-0 object-scale-down p-0" />
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
              George-AI offers an exciting UX, a 100% API, and can be fully integrated into your IT landscape and all
              applications.
            </p>
            <div className="mx-auto my-0 max-h-fit max-w-fit overflow-hidden rounded-3xl border">
              <img src="george-features.webp" alt="Features of George" className="m-0 max-h-96 p-0" />
            </div>
            <div>
              <ul>
                <li>
                  <strong>More than a chatbot – much more:</strong> modeled after the big players in the industry.
                  Supports multi-modal models for text, images, videos, graphics, maps, and more.
                  <strong> Your AI must please you and your employees.</strong>
                </li>
                <li>
                  <strong>Public & private language models:</strong> Can be individually selected per assistant and
                  library based on cost/benefit. Use OpenAI, Google, Azure, or in-house Mistral, Anthropic, LLAMA,
                  DeepSeek: Everything current open-source has to offer.
                </li>
                <li>
                  <strong>Assistants:</strong> Create and manage assistants for chat, email inboxes, phone calls, and
                  more.
                </li>
                <li>
                  <strong>Libraries:</strong> Collect your data manually or automatically within your organization. Not
                  only assistants can access them – direct user access is also possible via lightning-fast indexing.
                </li>
                <li>
                  <strong>Workflows:</strong> Automate your processes with George-AI. Workflows not just based on
                  if/then logic.
                </li>
                <li>
                  <strong>Permissions:</strong> Not all company data is meant for everyone: George respects your access
                  rights across all use cases.
                </li>
                <li>
                  <strong>Reporting:</strong> Track the usage of your AI solution - for your company and for the EU AI
                  Act.
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
            <h2 className="flex justify-between">AI Act</h2>
            <p>
              George-AI takes care of classifying your use cases into EU AI Act risk levels, enables assessments, and
              automates compliance with required rules.
            </p>
            <div>
              <ul>
                <li>
                  <strong>Automated classification</strong> into risk levels: unacceptable, high risk, limited risk,
                  minimal risk.
                </li>
                <li>
                  <strong>Usage reporting</strong> according to the EU AI Act, depending on risk level, in compliance
                  with data protection and works council agreements.
                </li>
                <li>
                  <strong>Automatic updates</strong> of the latest regulations and rules. We take care daily that you
                  don't hit a wall in Brussels with your use case.
                </li>
              </ul>
            </div>
            <div className="mx-auto my-0 max-h-fit max-w-fit overflow-hidden rounded-3xl border">
              <img src="ai-act.webp" alt="AI Act" className="m-0 max-h-96 p-0" />
            </div>
          </div>
        </article>
      </div>
      <GeorgeBenefitsEn />
      <div className="mt-52">
        <hr />
        <a id="impressum" href="#" className="float-right text-sm">
          Top
        </a>
        <ImpressEn />
        <VersionIndicator />
      </div>
    </div>
  )
}
