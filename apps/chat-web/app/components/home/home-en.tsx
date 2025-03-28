import { ImpressEn } from './impress-en'

export const HomeEn = () => {
  return (
    <div className="prose prose-lg mt-10 flex max-w-none flex-col gap-4">
      <h1 className="mb-0 text-center">Your AI. Your Data. Your Rules.</h1>
      <ul className="menu menu-horizontal justify-center rounded-box">
        <li>
          <a href="#features">Features</a>
        </li>
        <li>
          <a href="#ai-act">AI Act</a>
        </li>
        <li>
          <a href="#impressum">Imprint</a>
        </li>
      </ul>
      <article className="flex flex-col gap-4 sm:flex-row">
        <div>
          <h2>Create and train your own administrative AI.</h2>
          <p>Your AI assistant is created and trained by you. Develop your own AI solution.</p>
          <div className="flex flex-col gap-4 lg:flex-row">
            <ul>
              <li>
                <strong>No-Code:</strong> George can be used out of the box. No software development project with
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
                <strong>Examples:</strong> Customer support, intranet indexing, contract management, HR chatbot,
                logistics, appointment scheduling, and much more. Let your imagination run wild and book a meeting with
                us.
              </li>
              <li>
                <strong>EU AI Act compliant:</strong> Your AI solution is continuously classified according to the EU AI
                Act risk levels and
              </li>
            </ul>

            <div className="mx-auto my-0 max-h-fit max-w-fit overflow-hidden rounded-3xl border">
              <img src="george-portrait.png" alt="Portrait of George" className="m-0 object-scale-down p-0" />
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
              George-AI offers an exciting UX, a 100% API, and can be fully integrated into your IT landscape and all
              applications.
            </p>
            <div className="mx-auto my-0 max-h-fit max-w-fit overflow-hidden rounded-3xl border">
              <img src="george-features.png" alt="Features of George" className="m-0 max-h-96 p-0" />
            </div>
            <div className="">
              <ul>
                <li>
                  <strong>More than a chatbot – much more:</strong> modeled after the big players in the industry.
                  Supports multi-modal models for text, images, videos, graphics, maps, and more.
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
              </ul>
            </div>
            <div className="mx-auto my-0 max-h-fit max-w-fit overflow-hidden rounded-3xl border">
              <img src="ai-act.png" alt="AI Act" className="m-0 max-h-96 p-0" />
            </div>
          </div>
        </article>
      </div>
      <div className="mt-52">
        <hr />
        <a id="impressum" href="#" className="float-right text-sm">
          Top
        </a>
        <ImpressEn />
      </div>
    </div>
  )
}
