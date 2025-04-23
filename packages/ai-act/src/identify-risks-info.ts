import { AiActString } from './translated-string'

export interface AiActLegalDisclaimer {
  title: AiActString
  text: AiActString
}

export interface AiActComplianceArea {
  id: string
  title: AiActString
  description: AiActString
}
export interface AiActIdentifyRisks {
  title: AiActString
  legalDisclaimer: AiActLegalDisclaimer
  complianceAreas: Array<AiActComplianceArea>
}

export const getDefaultIdentifyRisks = (): AiActIdentifyRisks => {
  return {
    title: {
      de: 'EU AI Act - Schritt 2: Identifikation relevanter Risikobereiche',
      en: 'EU AI Act - Step 2: Identify Relevant Risk Areas',
    },
    legalDisclaimer: {
      title: {
        de: 'Rechtlicher Hinweis',
        en: 'Legal Disclaimer',
      },
      text: {
        de: 'Diese Analyse dient nur zu Informationszwecken und stellt keine rechtliche Beratung dar. Für eine umfassende rechtliche Beurteilung Ihres KI-Systems gemäß dem EU AI Act sollten Sie qualifizierte Rechtsberatung in Anspruch nehmen.',
        en: 'This analysis is for informational purposes only and does not constitute legal advice. For a comprehensive legal assessment of your AI system under the EU AI Act, you should seek qualified legal counsel.',
      },
    },
    complianceAreas: [
      {
        id: 'transparency',
        title: {
          de: 'Transparenz & Kennzeichnung',
          en: 'Transparency & Labeling',
        },
        description: {
          de: 'Informationspflichten gegenüber Nutzern, Kennzeichnung von KI-generierten Inhalten',
          en: 'Information obligations towards users, labeling of AI-generated content',
        },
      },
      {
        id: 'dataQuality',
        title: {
          de: 'Datenqualität & Training',
          en: 'Data Quality & Training',
        },
        description: {
          de: 'Qualität, Repräsentativität und Governance der Trainingsdaten',
          en: 'Quality, representativeness, and governance of training data',
        },
      },
      {
        id: 'documentation',
        title: {
          de: 'Dokumentation & Technische Robustheit',
          en: 'Documentation & Technical Robustness',
        },
        description: {
          de: 'Technische Dokumentation, Risikomanagementsystem, Protokollierung',
          en: 'Technical documentation, risk management system, logging',
        },
      },
      {
        id: 'governance',
        title: {
          de: 'Governance & Qualitätsmanagement',
          en: 'Governance & Quality Management',
        },
        description: {
          de: 'Verantwortlichkeiten, Compliance-Management, Meldepflichten',
          en: 'Responsibilities, compliance management, reporting obligations',
        },
      },
      {
        id: 'humanOversight',
        title: {
          de: 'Menschliche Aufsicht',
          en: 'Human Oversight',
        },
        description: {
          de: 'Mechanismen zur menschlichen Überwachung und Intervention',
          en: 'Mechanisms for human oversight and intervention',
        },
      },
      {
        id: 'security',
        title: {
          de: 'Cybersicherheit & Resilienz',
          en: 'Cybersecurity & Resilience',
        },
        description: {
          de: 'Schutzmaßnahmen gegen Manipulation und unbefugten Zugriff',
          en: 'Protection against manipulation and unauthorized access',
        },
      },
      {
        id: 'fundamentalRights',
        title: {
          de: 'Grundrechte & Nicht-Diskriminierung',
          en: 'Fundamental Rights & Non-Discrimination',
        },
        description: {
          de: 'Vermeidung von Diskriminierung und Schutz der Grundrechte',
          en: 'Avoidance of discrimination and protection of fundamental rights',
        },
      },
      {
        id: 'specificRequirements',
        title: {
          de: 'Spezifische Anforderungen',
          en: 'Specific Requirements',
        },
        description: {
          de: 'Besondere Anforderungen für GPAI-Modelle oder sektorale Anwendungen',
          en: 'Specific requirements for GPAI models or sectoral applications',
        },
      },
    ],
  }
}
