import { GraphQLClient } from "graphql-request";
import { WebPageSummary } from "./main.js";
import dotenv from "dotenv";

dotenv.config();

const endpoint = "http://localhost:1337/graphql";

const client = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
  },
});

const CREATE_WEBPAGE_SUMMARY_MUTATION = `
mutation CreateWebPageSummary($data: WebPageSummaryInput!) {
  createWebPageSummary(data: $data) {
    data {
      id
      attributes {
        Title
        Url
        LargeLanguageModel
        OriginalContent
        GeneratedSummary
        GeneratedKeywords
      }
    }
  }
}
`;

interface WebPageSummaryAttributes {
  Title: string;
  Url: string;
  LargeLanguageModel: string;
  OriginalContent: string;
  GeneratedSummary: string;
  GeneratedKeywords: string;
}

interface WebPageSummaryData {
  id: string;
  attributes: WebPageSummaryAttributes;
}

interface WebPageSummaryResponse {
  createWebPageSummary: {
    data: WebPageSummaryData;
  };
}

export const upsertWebPageSummary = async (results: WebPageSummary[]) => {
  try {
    await Promise.all(
      results.map(async (result) => {
        const data = {
          Title: result.title,
          Url: result.url,
          LargeLanguageModel: "gpt-3.5-turbo",
          OriginalContent: result.content,
          GeneratedSummary: result.summary,
          GeneratedKeywords: JSON.stringify(result.keywords),
        };
        const response = await client.request<WebPageSummaryResponse>(
          CREATE_WEBPAGE_SUMMARY_MUTATION,
          {
            data,
          }
        );
        console.log(
          "Successfully created ScrapTest with ID:",
          response.createWebPageSummary.data.id
        );
      })
    );
  } catch (error) {
    console.error("Failed to create ScrapTest", error);
  }
};
