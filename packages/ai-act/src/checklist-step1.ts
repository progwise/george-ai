import { AiActChecklistStep } from './checklist'

export const getDefaultBasicSystemInfo = (assistantId: string): AiActChecklistStep => {
  console.log('Get default basic system info for assistant', assistantId)
  return {
    id: 'aiActBasicSystemInfo',
    title: {
      de: 'EU AI Act - Schritt 1: Grundlegende Systeminformationen',
      en: 'EU AI Act - Step 1: Basic System Information',
    },
    hint: {
      de: 'Dieser erste Schritt hilft dabei, die Anwendbarkeit des EU AI Acts zu bestimmen und eine vorläufige Risikoeinschätzung vorzunehmen. Die Antworten dienen als Grundlage für die detaillierte Compliance-Prüfung.',
      en: 'This first step helps to determine the applicability of the EU AI Act and to make a preliminary risk assessment. The answers serve as a basis for the detailed compliance review.',
    },
    questions: [
      {
        id: 'systemType',
        title: {
          de: 'Basiert Ihr System auf maschinellem Lernen oder regelbasierter Automatisierung?',
          en: 'Is your system based on machine learning or rule-based automation?',
        },
        hint: {
          de: 'Systeme mit maschinellem Lernen nutzen Daten zur Selbstoptimierung, regelbasierte Systeme folgen vordefinierten Logiken',
          en: 'Machine learning systems use data for self-optimization, rule-based systems follow predefined logics',
        },
        options: [
          {
            id: 'ML',
            title: { de: 'Maschinelles Lernen', en: 'Machine Learning' },
            risk: { points: 2, description: { de: 'ML-basiertes System', en: 'ML-based system' } },
          },
          { id: 'RB', title: { de: 'Regelbasierte Systeme', en: 'Rule-Based Systems' } },
          {
            id: 'Both',
            title: { de: 'Beides', en: 'Both' },
            risk: { points: 2, description: { de: 'ML-basiertes System', en: 'ML-based system' } },
          },
        ],
        value: null,
        notes: null,
      },
      {
        id: 'operationMode',
        title: {
          de: 'Arbeitet Ihr System autonom oder unterstützt es Menschen bei Entscheidungen?',
          en: 'Does your system operate autonomously or assist humans in decision-making?',
        },
        hint: {
          de: 'Autonome Systeme treffen Entscheidungen ohne menschlichen Eingriff, assistierende Systeme unterstützen menschliche Entscheider',
          en: 'Autonomous systems make decisions without human intervention, assisting systems support human decision-makers',
        },
        options: [
          {
            id: 'Autonomous',
            title: { de: 'Autonom', en: 'Autonomous' },
            risk: { points: 3, description: { de: 'Autonomes System', en: 'Autonomous system' } },
          },
          { id: 'Assisting', title: { de: 'Unterstützend', en: 'Assisting' } },
        ],
        value: null,
        notes: null,
      },
      {
        id: 'syntheticContent',
        title: {
          de: 'Erzeugt es synthetische Inhalte (Text, Bild, Video, Code)?',
          en: 'Does it generate synthetic content (text, image, video, code)?',
        },
        hint: {
          de: 'Synthetische Inhalte sind Inhalte, die von einem KI-System erstellt wurden und nicht auf realen Daten basieren.',
          en: 'Synthetic content is content created by an AI system and not based on real data.',
        },
        options: [
          {
            id: 'Yes',
            title: { de: 'Ja', en: 'Yes' },
            risk: { points: 2, description: { de: 'Erzeugt synthetische Inhalte', en: 'Generates synthetic content' } },
          },
          { id: 'No', title: { de: 'Nein', en: 'No' } },
        ],
        value: null,
        notes: null,
      },
      {
        id: 'gpaiModel',
        title: {
          de: 'Handelt es sich um ein General Purpose AI-Modell (GPAI)?',
          en: 'Is it a General Purpose AI model (GPAI)?',
        },
        hint: {
          de: 'GPAI-Modelle können für verschiedene Aufgaben eingesetzt werden und haben vielfältige Anwendungsmöglichkeiten (z.B. ChatGPT, Gemini, DALL-E)',
          en: 'GPAI models can be used for various tasks and have diverse applications (e.g. ChatGPT, Gemini, DALL-E)',
        },
        options: [
          {
            id: 'Yes',
            title: { de: 'Ja', en: 'Yes' },
            risk: { points: 2, description: { de: 'GPAI-Modell', en: 'GPAI model' } },
          },
          { id: 'No', title: { de: 'Nein', en: 'No' } },
          {
            id: 'Unsure',
            title: { de: 'Unsicher', en: 'Unsure' },
            risk: { points: 2, description: { de: 'GPAI-Modell', en: 'GPAI model' } },
          },
        ],
        value: null,
        notes: null,
      },
      {
        id: 'euOperation',
        title: {
          de: 'Wird das System innerhalb der EU betrieben oder hat es Auswirkungen auf Personen in der EU?',
          en: 'Is the system operated within the EU or does it affect people in the EU?',
        },
        hint: {
          de: 'Der EU AI Act ist anwendbar, wenn das System in der EU eingesetzt wird oder Auswirkungen auf in der EU befindliche Personen hat.',
          en: 'The EU AI Act applies if the system is used in the EU or affects people located in the EU.',
        },
        options: [
          {
            id: 'Yes',
            title: { de: 'Ja', en: 'Yes' },
            risk: { points: 1, description: { de: 'EU-Betrieb', en: 'EU operation' } },
          },
          {
            id: 'No',
            title: { de: 'Nein', en: 'No' },
            risk: { points: 0, description: { de: 'Kein EU-Betrieb', en: 'No EU operation' } },
          },
        ],
        value: null,
        notes: null,
      },
    ],
    riskIndicator: {
      level: 'undetermined' as const,
      description: {
        de: 'Keine Antworten gesammelt',
        en: 'No answers collected',
      },
      factors: [],
    },
    navigation: {
      title: {
        de: 'Nächste Schritte',
        en: 'Next Steps',
      },
      hint: {
        de: `Basierend auf Ihren Antworten sollten Sie folgende Maßnahmen in Betracht ziehen:
Basis-Compliance-Maßnahmen umsetzen
Transparenzanforderungen prüfen
System regelmäßig neu bewerten`,
        en: `Based on your answers, you should consider the following actions:
Implement basic compliance measures
Check transparency requirements
Regularly reassess the system`,
      },
    },
  }
}
