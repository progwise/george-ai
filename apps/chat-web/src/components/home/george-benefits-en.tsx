import React from 'react'
import { twMerge } from 'tailwind-merge'

const GeorgeBenefitsEn: React.FC = () => {
  const grunde = [
    {
      title: 'GDPR & AI Act Compliance',
      desc: 'George-AI runs entirely on-premise – no data leaves the organization. Ideal for data protection and legal certainty.',
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      title: 'Full Data Sovereignty & Transparency',
      desc: 'All data, prompts, and results remain fully traceable within the organization – 100% control and accountability.',
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      title: 'Ready-to-use Functionality',
      desc: 'George-AI offers ready-made modules like chatbots, search, and workflows – no need for months of development.',
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M21 13.255A8.38 8.38 0 0 1 12.875 21C7.89 21 4 17.522 4 13.25c0-2.042.793-3.89 2.1-5.26" />
          <path d="M16 3h5v5" />
          <path d="M4 4 21 21" />
        </svg>
      ),
    },
    {
      title: 'Predictable Costs',
      desc: 'No usage-based fees. No surprises. Simple licensing model with support included.',
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 8c-4.418 0-8 1.79-8 4s3.582 4 8 4 8-1.79 8-4-3.582-4-8-4z" />
          <path d="M12 12c-4.418 0-8 1.79-8 4s3.582 4 8 4 8-1.79 8-4-3.582-4-8-4z" />
        </svg>
      ),
    },
    {
      title: 'Building Internal AI Expertise',
      desc: 'With George-AI, companies can build internal AI know-how in a practical and verifiable way. Mandatory starting 2025!',
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9 12h6" />
          <path d="M12 9v6" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
    },
    {
      title: 'No-Code: Build Your Own GPTs',
      desc: 'Assistants and libraries can be configured without technical knowledge – flexible and ready to use.',
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M4 4h16v16H4z" />
          <path d="M8 2v20" />
          <path d="M16 2v20" />
        </svg>
      ),
    },
    {
      title: 'Documentation & Auditability',
      desc: 'George-AI automatically documents processes, sources, and results – fully auditable in line with the AI Act.',
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M4 4h16v16H4z" />
          <path d="M4 10h16" />
          <path d="M10 4v16" />
        </svg>
      ),
    },
    {
      title: 'Designed for Regulated Sectors',
      desc: 'Whether in healthcare, government, or finance – George-AI is ready for high-risk AI scenarios.',
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8" />
          <path d="M12 8v8" />
        </svg>
      ),
    },
    {
      title: 'Integrates Seamlessly',
      desc: 'Connects to network drives, SharePoint, databases, and more – ready to use without custom development.',
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M4 4h16v4H4z" />
          <path d="M4 10h16v4H4z" />
          <path d="M4 16h16v4H4z" />
        </svg>
      ),
    },
    {
      title: 'Community & Support Included',
      desc: '24/7 Discord support, monthly user calls, and strong partners – George-AI is not a one-off project.',
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
  ]

  const colorSchemes = [
    {
      card: 'bg-fuchsia-100 border-fuchsia-300',
      iconBg: 'bg-fuchsia-200 text-fuchsia-700',
      title: 'text-fuchsia-800',
      text: 'text-slate-800',
    },
    {
      card: 'bg-amber-100 border-amber-300',
      iconBg: 'bg-amber-200 text-amber-700',
      title: 'text-amber-800',
      text: 'text-slate-800',
    },
    {
      card: 'bg-lime-100 border-lime-300',
      iconBg: 'bg-lime-200 text-lime-700',
      title: 'text-lime-800',
      text: 'text-slate-800',
    },
    {
      card: 'bg-cyan-100 border-cyan-300',
      iconBg: 'bg-cyan-200 text-cyan-700',
      title: 'text-cyan-800',
      text: 'text-slate-800',
    },
    {
      card: 'bg-rose-100 border-rose-300',
      iconBg: 'bg-rose-200 text-rose-700',
      title: 'text-rose-800',
      text: 'text-slate-800',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 p-3 font-sans md:grid-cols-2 xl:grid-cols-3">
      {grunde.map((grund, idx) => {
        const scheme = colorSchemes[idx % 5]
        return (
          <div key={grund.title} className={twMerge(`card border shadow-lg transition hover:shadow-xl`, scheme.card)}>
            <div className="card-body">
              <div className="flex items-center gap-4">
                <div className={twMerge(`rounded-xl p-2`, scheme.iconBg)}>{grund.icon}</div>
                <h2 className={twMerge(`text-lg font-semibold tracking-tight`, scheme.title)}>{grund.title}</h2>
              </div>
              <p className={twMerge(`text-sm leading-relaxed`, scheme.text)}>{grund.desc}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default GeorgeBenefitsEn
