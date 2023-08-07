import { GraphQLClient } from "graphql-request";
import { WebPageSummary } from "./main.js";
import dotenv from "dotenv";
import {
  CreateWebPageSummaryDocument,
  WebPageSummaryEntityResponse,
  WebPageSummaryEntityResponseCollection,
} from "./gql/graphql.js";
import { graphql } from "./gql2";

dotenv.config();

const endpoint = "http://localhost:1337/graphql";

const client = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
  },
});

const CREATE_WEBPAGE_SUMMARY_MUTATION = graphql(`
  mutation CreateWebPageSummary(
    $data: WebPageSummaryInput!
    $locale: I18NLocaleCode!
  ) {
    createWebPageSummary(data: $data, locale: $locale) {
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
`);

const UPDATE_WEBPAGE_SUMMARY_MUTATION = graphql(`
  mutation UpdateWebPageSummary($id: ID!, $data: WebPageSummaryInput!) {
    updateWebPageSummary(id: $id, data: $data) {
      data {
        id
        attributes {
          Title
          OriginalContent
          GeneratedSummary
          GeneratedKeywords
        }
      }
    }
  }
`);

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

export const upsertWebPageSummaries = async (summary: WebPageSummary) => {
  try {
    const commonData = {
      Title: summary.title,
      OriginalContent: summary.content,
      GeneratedSummary: summary.summary,
      GeneratedKeywords: JSON.stringify(summary.keywords),
    };

    const data = {
      ...commonData,
      Url: summary.url,
      LargeLanguageModel: "gpt-3.5-turbo",
    };

    const updateData = { ...commonData };

    // Check if the WebPageSummary already exists
    const existingSummaryResponse = await client.request<{
      webPageSummaries: WebPageSummaryEntityResponseCollection;
    }>(GET_WEBPAGE_SUMMARY_BY_URL_AND_MODEL_QUERY, {
      url: summary.url,
      model: "gpt-3.5-turbo",
    });

    console.log("existingSummaryResponse: ", existingSummaryResponse);

    if (
      existingSummaryResponse.webPageSummaries.data &&
      existingSummaryResponse.webPageSummaries.data.length > 0
    ) {
      const existingSummaryId =
        existingSummaryResponse.webPageSummaries.data[0].id;
      console.log("existingSummaryId: ", existingSummaryId);

      // If it exists, update it
      if (existingSummaryId) {
        const response = await client.request(UPDATE_WEBPAGE_SUMMARY_MUTATION, {
          id: existingSummaryId,
          data: updateData,
        });
        console.log(
          "Successfully updated WebPageSummary with ID:",
          existingSummaryId
        );
      }
    } else {
      // If it doesn't exist, create it
      // const response = await client.request<{
      //   createWebPageSummary: WebPageSummaryEntityResponse;
      // }>(CREATE_WEBPAGE_SUMMARY_MUTATION, {
      //   data,
      //   locale: summary.language,
      // });
      const response = await client.request(CREATE_WEBPAGE_SUMMARY_MUTATION, {
        data,
        locale: summary.language,
      });

      console.log(
        "Successfully created WebPageSummary with ID:",
        response.createWebPageSummary?.data?.id
      );
    }
  } catch (error) {
    console.error("Failed to upsert WebPageSummary", error);
  }
};
