import { GraphQLClient } from "graphql-request";
import { WebPageSummary } from "./main.js";
import dotenv from "dotenv";
import {
  Query,
  WebPageSummaryEntityResponse,
  WebPageSummaryEntityResponseCollection,
} from "./gql/graphql.js";

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

const UPDATE_WEBPAGE_SUMMARY_MUTATION = `
mutation UpdateWebPageSummary($id: ID!, $data: WebPageSummaryInput!) {
  updateWebPageSummary(id: $id, data: $data) {
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

const GET_WEBPAGE_SUMMARY_BY_URL_AND_MODEL_QUERY = `
  query GetWebPageSummary($url: String!, $model: String!) {
    webPageSummaries(
      publicationState: PREVIEW
      filters: { Url: { eq: $url }, LargeLanguageModel: { eq: $model } }
    ) {
      data {
        id
        attributes {
          Title
          Url
          LargeLanguageModel
          OriginalContent
          GeneratedSummary
          GeneratedKeywords
          updatedAt
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
        const updateData = {
          Title: summary.title,
          OriginalContent: summary.content,
          GeneratedSummary: summary.summary,
          GeneratedKeywords: JSON.stringify(summary.keywords),
        };

        // Check if the WebPageSummary already exists
        const existingSummaryResponse = await client.request<{
          webPageSummaries: WebPageSummaryEntityResponseCollection;
        }>(GET_WEBPAGE_SUMMARY_BY_URL_AND_MODEL_QUERY, {
          url: summary.url,
          model: "gpt-3.5-turbo",
        });

        console.log("existingSummaryResponse: ", existingSummaryResponse);
        // console.log(
        //   "existingSummaryResponse: ",
        //   JSON.stringify(existingSummaryResponse, null, 2)
        // );
        const existingSummaryId =
          existingSummaryResponse.webPageSummaries.data[0].id;
        console.log("existingSummaryId: ", existingSummaryId);

        if (
          existingSummaryResponse.webPageSummaries.data &&
          existingSummaryResponse.webPageSummaries.data.length > 0
        ) {
          // console.log(
          //   "existingSummaryResponse.data.length: ",
          //   existingSummaryResponse.data.length
          // );

          const existingSummaryId =
            existingSummaryResponse.webPageSummaries.data[0].id;
          console.log("existingSummaryId: ", existingSummaryId);

          // If it exists, update it
          if (existingSummaryId) {
            await client.request<{
              updateWebPageSummary: WebPageSummaryEntityResponse;
            }>(UPDATE_WEBPAGE_SUMMARY_MUTATION, {
              id: existingSummaryId,
              updateData,
            });
            console.log(
              "Successfully updated WebPageSummary with ID:",
              existingSummaryId
            );
          }
        } else {
          // If it doesn't exist, create it
          const response = await client.request<{
            createWebPageSummary: WebPageSummaryEntityResponse;
          }>(CREATE_WEBPAGE_SUMMARY_MUTATION, {
            data,
          });
          console.log(
            "Successfully created WebPageSummary with ID:",
            response.createWebPageSummary.data?.id
          );
        }
      })
    );
  } catch (error) {
    console.error("Failed to upsert WebPageSummary", error);
  }
};
