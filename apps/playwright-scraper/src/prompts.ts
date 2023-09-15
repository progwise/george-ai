export const prompts = {
  de: {
    summary: [
      'Gib mir eine Zusammenfassung der Angebote in maximal 300 Worten für den folgenden Textinhalt einer Website, einschließlich der Nennung von Ansprechpartnern und Kontaktinformationen, in Deutsch.',
      'Formatiere die Antwort.',
    ],
    keywords: [
      'Generiere eine Liste der 10 wichtigsten META-Keywords für SEO aus dem vom Benutzer bereitgestellten Text. Übersetze alle generierten Keywords ins Deutsche!',
      'Die Liste sollte 10 Einträge enthalten, sortiert nach Wichtigkeit.',
      'Jedes Wort in der Liste soll durch ein Komma getrennt sein, wie in diesem Format: "Keyword1, Keyword2, Keyword3, ..., Keyword10".',
      'Stelle sicher, dass alle Keywords in der Liste in deutscher Sprache sind! Antworte nur mit den 10 deutschen Keywords, ohne jeglichen Präfix.',
    ],
  },
  en: {
    summary: [
      'Provide a summary of the offerings in a maximum of 300 words for the following website content, mentioning contact persons and contact information, in English.',
      'Format the answer.',
    ],
    keywords: [
      'Generate a list of the 10 most important META keywords for SEO from the text provided by the user. Translate all generated keywords into English!',
      'The list should contain 10 entries, sorted by importance.',
      'Each word in the list should be separated by a comma, as in this format: "Keyword1, Keyword2, Keyword3, ..., Keyword10".',
      'Make sure that all keywords in the list are in the English language! Reply only with the 10 English keywords, without any prefix.',
    ],
  },
}
