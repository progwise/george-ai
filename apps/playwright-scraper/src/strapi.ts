import { GraphQLClient } from "graphql-request";
import { WebPageSummary } from "./main.js";
import dotenv from "dotenv";
import { WebPageSummaryEntityResponse } from "./gql/graphql.js";

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

export const upsertWebPageSummaries = async (summaries: WebPageSummary[]) => {
  try {
    await Promise.all(
      summaries.map(async (summary) => {
        const data = {
          Title: summary.title,
          Url: summary.url,
          LargeLanguageModel: "gpt-3.5-turbo",
          OriginalContent: summary.content,
          GeneratedSummary: summary.summary,
          GeneratedKeywords: JSON.stringify(summary.keywords),
        };
        const response = await client.request<{
          createWebPageSummary: WebPageSummaryEntityResponse;
        }>(CREATE_WEBPAGE_SUMMARY_MUTATION, {
          data,
        });
        console.log(
          "Successfully created WebPageSummary with ID:",
          response.createWebPageSummary.data?.id
        );
      })
    );
  } catch (error) {
    console.error("Failed to create WebPageSummary", error);
  }
};
