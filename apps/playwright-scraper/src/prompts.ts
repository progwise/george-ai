export const prompts = {
  de: {
    summary: [
      'Gib mir eine Zusammenfassung der Angebote in maximal 300 Worten für den folgenden Textinhalt einer Website. Erwähne Ansprechpartner und Kontaktinformationen und nutze HTML-Tags wie <h3>, <p> und <ul> für eine bessere Formatierung.',
      'Nur 300 Worte, keine <h1> und <h2> verwenden.',
      'Formatiere die Antwort mit HTML-Tags, um Absätze (<p>), Überschriften (<h3>, <h4>, <h5> usw.) und Listen (<ul> oder <ol> mit <li>) einzufügen. Dies erleichtert die spätere Integration in die Website.',
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
      'Provide a summary of the offerings in a maximum of 300 words for the following website content. Mention contact persons and contact information, and use HTML tags like <h3>, <p>, and <ul> for better formatting.',
      'only 300 words, do not use <h1> and <h2>',
      'Format the answer with HTML tags to include paragraphs (<p>), headings (<h3>, <h4>, <h5> etc.), and lists (<ul> or <ol> with <li>). This will facilitate its later integration into the website.',
    ],
    keywords: [
      'Generate a list of the 10 most important META keywords for SEO from the text provided by the user. Translate all generated keywords into english!',
      'The list should contain 10 entries, sorted by importance.',
      'Each word in the list should be separated by a comma, as in this format: "Keyword1, Keyword2, Keyword3, ..., Keyword10".',
      'Make sure that all keywords in the list are in the english language! Reply only with the 10 english keywords, without any prefix.',
    ],
  },
}

export type Language = keyof typeof prompts

export const isLanguage = (language: string): language is Language =>
  Object.keys(prompts).includes(language)
