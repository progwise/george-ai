export const prompts = {
  de: {
    summary: [
      'Gib mir eine Zusammenfassung der Angebote in maximal 300 Worten für folgenden Textinhalt einer Website mit Nennung von Ansprechpartnern und Kontaktinformationenen, in Deutsch.',
      'Formatiere die Antwort.',
    ],
    keywords: [
      'Erzeuge eine Liste, die die wichtigsten META Keywords für SEO für den Text, die der User sendet, enthält, in Deutsch.',
      'Die Liste sollte 10 Einträge enthalten, sortiert nach Wichtigkeit.',
      'Die Liste sollte im Format sein: "Keyword1, Keyword2, Keyword3, ..., Keyword10".',
      'Antworte nur mit den 10 Keywords, ohne jeglichen Präfix.',
    ],
  },
  en: {
    summary: [
      'Provide a summary of the offerings in a maximum of 300 words for the following website content, mentioning the contact persons and contact information, in english.',
      'Format the answer.',
    ],
    keywords: [
      'Generate a list containing the most important META keywords for SEO from the text the user provides, in english.',
      'The list should contain 10 entries, sorted by importance.',
      'The list should be in the format: "Keyword1, Keyword2, Keyword3, ..., Keyword10".',
      'Reply only with the 10 keywords, without any prefix.',
    ],
  },
}
