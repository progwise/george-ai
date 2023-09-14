export const prompts = {
  de: {
    summary: [
      'Gib mir eine Zusammenfassung der Angebote in maximal 300 Worten für den folgenden Textinhalt einer Website, einschließlich der Nennung von Ansprechpartnern und Kontaktinformationen, in Deutsch.',
      'Formatiere die Antwort.',
    ],
    keywords: [
      'Generiere eine Liste der 10 wichtigsten META-Keywords für SEO aus dem vom Benutzer bereitgestellten Text. Die Keywords sollten durch Kommas getrennt und in der Reihenfolge ihrer Bedeutung sortiert sein. Übersetze alle generierten Keywords ins Deutsche!',
      'Stelle sicher, dass alle Keywords in deutscher Sprache sind! Antworte nur mit den 10 deutschen Keywords, ohne jeglichen Präfix.',
    ],
  },
  en: {
    summary: [
      'Provide a summary of the offerings in a maximum of 300 words for the following website content, mentioning contact persons and contact information, in English.',
      'Format the answer.',
    ],
    keywords: [
      'Generate a list of the 10 most important META keywords for SEO from the text provided by the user. The keywords should be separated by commas and sorted in order of their importance. Translate all generated keywords into English!',
      'Make sure that all keywords are in the English language! Reply only with the 10 English keywords, without any prefix.',
    ],
  },
}
