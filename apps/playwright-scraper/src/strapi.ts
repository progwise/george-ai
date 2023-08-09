import { GraphQLClient } from "graphql-request";
import { WebPageSummary } from "./main.js";
import dotenv from "dotenv";
import { graphql } from "./gql";

const AI_MODEL = "gpt-3.5-turbo";
dotenv.config();

const endpoint = "http://localhost:1337/graphql";
const client = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
  },
});

const CREATE_SCRAPE_WEBPAGE_MUTATION = graphql(`
  mutation CreateScrapedWebPage(
    $data: ScrapedWebPageInput!
    $locale: I18NLocaleCode!
  ) {
    createScrapedWebPage(data: $data, locale: $locale) {
      data {
        id
        attributes {
          Title
          Url
          OriginalContent
          WebPageSummary {
            id
            LargeLanguageModel
            GeneratedKeywords
            GeneratedSummary
          }
        }
      }
    }
  }
`);

const UPDATE_SCRAPE_WEBPAGE_MUTATION = graphql(`
  mutation UpdateScrapedWebPage($id: ID!, $data: ScrapedWebPageInput!) {
    updateScrapedWebPage(id: $id, data: $data) {
      data {
        id
        attributes {
          WebPageSummary {
            id
            LargeLanguageModel
            GeneratedKeywords
            GeneratedSummary
          }
        }
      }
    }
  }
`);

const GET_SCRAPE_WEBPAGE_BY_URL_QUERY = graphql(`
  query GetScrapedWebPageByUrl($url: String!) {
    scrapedWebPages(
      publicationState: PREVIEW
      locale: "all"
      filters: { Url: { eq: $url } }
    ) {
      data {
        id
        attributes {
          Url
          WebPageSummary {
            id
            LargeLanguageModel
            GeneratedSummary
            GeneratedKeywords
          }
        }
      }
    }
  }
`);

// This function creates a new WebPageSummary entry
async function createWebPageSummary(data: any, locale: string): Promise<void> {
  const response = await client.request(CREATE_SCRAPE_WEBPAGE_MUTATION, {
    data,
    locale,
  });
  console.log(
    "Successfully created ScrapedWebPage with ID:",
    response.createScrapedWebPage?.data?.id
  );
}

// This function retrieves an existing WebPageSummary entry based on the URL
async function getExistingWebPageSummaryByUrl(url: string): Promise<any> {
  const { scrapedWebPages } = await client.request(
    GET_SCRAPE_WEBPAGE_BY_URL_QUERY,
    { url }
  );
  return scrapedWebPages?.data.at(0);
}

async function updateMatchingWebPageSummary(
  existingSummary: any,
  updatedWebPageSummaries: any[]
): Promise<void> {
  await client.request(UPDATE_SCRAPE_WEBPAGE_MUTATION, {
    id: existingSummary.id,
    data: { WebPageSummary: updatedWebPageSummaries },
  });
  console.log(
    "Successfully updated ScrapedWebPage with ID:",
    existingSummary.id
  );
}

// Adds a new WebPageSummary entry when no matching AI model is found
async function addNewWebPageSummaryToExisting(
  existingSummary: any,
  data: any
): Promise<void> {
  await client.request(UPDATE_SCRAPE_WEBPAGE_MUTATION, {
    id: existingSummary.id,
    data: {
      ...data,
      WebPageSummary: [
        ...(existingSummary.attributes?.WebPageSummary ?? []),
        data.WebPageSummary[0],
      ],
    },
  });
  console.log(
    "Added new WebPageSummary entry to existing WebPage with ID:",
    existingSummary.id
  );
}

// This function updates an existing WebPageSummary entry
async function updateWebPageSummary(
  existingSummary: any,
  data: any
): Promise<void> {
  const updatedWebPageSummaries =
    existingSummary.attributes?.WebPageSummary?.map((entry: any) => {
      if (entry?.LargeLanguageModel === AI_MODEL) {
        return {
          ...entry,
          ...data.WebPageSummary[0],
        };
      }
      return entry;
    });

  if (
    updatedWebPageSummaries?.some(
      (entry: any) => entry?.LargeLanguageModel === AI_MODEL
    )
  ) {
    await updateMatchingWebPageSummary(
      existingSummary,
      updatedWebPageSummaries
    );
  } else {
    await addNewWebPageSummaryToExisting(existingSummary, data);
  }
}

export const upsertScrapedWebPage = async (
  summary: WebPageSummary
): Promise<void> => {
  try {
    const webPageSummary = {
      GeneratedSummary: summary.summary,
      GeneratedKeywords: JSON.stringify(summary.keywords),
      LargeLanguageModel: AI_MODEL,
    };

    const data = {
      Title: summary.title,
      OriginalContent: summary.content,
      Url: summary.url,
      WebPageSummary: [webPageSummary],
    };

    // Fetch existing WebPageSummary by URL
    const existingSummary = await getExistingWebPageSummaryByUrl(summary.url);

    if (!existingSummary?.id) {
      await createWebPageSummary(data, summary.language);
    } else {
      await updateWebPageSummary(existingSummary, data);
    }
  } catch (error) {
    console.error("Failed to upsert ScrapedWebPage", error);
  }
};
