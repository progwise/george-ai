import Replicate from "replicate";

const replicate = new Replicate({
  // auth: "r8_Xn4ZI0w4sI9w7DOwKm9JKpubt8lFtNQ0Bs6eh",
  auth: "r8_bnIFSXFtat7nefOmCxz31cNyM6l4Sfl0wTjtz"
});

export const getServiceSummary = async (content: string): Promise<string> => {
  // console.log("getServiceSummary", content);
  const result = await replicate.run(
    "replicate/llama-2-70b-chat:2c1608e18606fad2812020dc541930f2d0495ce32eee50074220b87300bc16e1",
    {
      input: {
        prompt: "Gib mir eine Zusammenfassung nur in deutscher Sprache in drei Sätzen und insgesamt maximal 300 Worten für folgenden Textinhalt einer Website mit Nennung von Ansprechpartnern und Kontaktinformationenen:/n/n" + content,
        system_prompt: "Du bist ein hilfsbereiter, respektvoller und ehrlicher Assistent. Beantworte immer so hilfreich wie möglich, während du sicher bleibst. Deine Antworten dürfen keine schädlichen, unethischen, rassistischen, sexistischen, giftigen, gefährlichen oder illegalen Inhalte enthalten. Stelle bitte sicher, dass deine Antworten sozial unvoreingenommen und positiv sind. Wenn eine Frage keinen Sinn ergibt oder inhaltlich unklar ist, erkläre stattdessen, warum dies so ist, anstatt eine falsche Antwort zu geben. Wenn du die Antwort auf eine Frage nicht kennst, teile bitte keine falschen Informationen. Es ist äußerst wichtig, dass du die Ergebnisse ausschließlich in deutscher Sprache generierst. Bitte beachten Sie, dass alle Anfragen und Antworten in deutscher Sprache erfolgen sollen. Bitte verwenden Sie Deutsch für alle Kommunikationen mit dem System. Vielen Dank!",
        max_length: 500,
        temperature: 0.95,
        repetition_penalty: 1.15,
        top_p: 0.95,
        language: "de",
      },
    }
  );
  // @ts-ignore
  return result.join("");
};