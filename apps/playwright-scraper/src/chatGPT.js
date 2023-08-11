import { Configuration, OpenAIApi } from "openai";
import dotenv from 'dotenv';
dotenv.config();
console.log(process.env['OPENAI_API_KEY']);
console.log(process.env['OPENAI_API_ORG']);
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_API_ORG,
});
const openai = new OpenAIApi(configuration);
export const getServiceSummary = async (content) => {
    try {
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "Gib mir eine Zusammenfassung der Angebite in maximal 300 worten für folgenden Textinhalt einer Website mit Nennung von Ansprechpartnern und Kontaktinformationenen.",
                },
                {
                    role: "system",
                    content: "Formatiere die Antwort.",
                },
                { role: "user", content },
            ],
        });
        const responseAsString = response.data.choices.at(0)?.message?.content;
        return responseAsString;
    }
    catch (e) {
        // @ts-ignore
        console.error('error using chatGPT');
        console.log(JSON.stringify(e, undefined, 2));
    }
};
export const getKeywords = async (content) => {
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: "Erzeuge eine List, die die wichtigsten META Keywords für SEO für den Text, die der User sendet, enthält.",
            },
            {
                role: "system",
                content: "Die Liste muss 10 Einträge haben. Sortiert nach der Wichtigkeit.",
            },
            {
                role: "system",
                content: "Die List soll folgendes Format haben: 'Keyword1, Keyword2, Keyword3, ..., Keyword10'.",
            },
            {
                role: "system",
                content: "Antworte nur mit den Keywords, ohne ein Prefix.",
            },
            { role: "user", content },
        ],
    });
    const responseAsString = response.data.choices.at(0)?.message?.content;
    const keywords = responseAsString
        ?.split(",")
        .map((keyword) => keyword.trim());
    return keywords;
};
