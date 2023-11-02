import { graphql } from 'msw'
import { Enum_Summaryfeedback_Voting } from '../gql/graphql'

export const handlers = [
  graphql.query('GetAllLocales', (request, response, context) => {
    return response(
      context.data({
        i18NLocales: {
          data: [
            {
              id: '1',
              attributes: {
                code: 'en',
              },
            },
            {
              id: '2',
              attributes: {
                code: 'de',
              },
            },
          ],
        },
      }),
    )
  }),
  graphql.query('GetScraperConfiguration', (request, response, context) => {
    return response(
      context.data({
        scraperConfiguration: {
          data: {
            attributes: {
              entryPoints: [
                {
                  startUrl: 'http://example.com',
                  depth: 2,
                  prompts: {
                    data: [
                      {
                        id: '1',
                        attributes: {
                          summaryPrompt: 'summary',
                          keywordPrompt: 'keywords',
                          llm: 'gpt-3.5-turbo',
                          locale: 'en',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      }),
    )
  }),
  graphql.mutation('CreateSummaryFeedback', (request, response, context) => {
    const { position, query, voting, web_page_summary } =
      request.variables.input
    return response(
      context.data({
        createSummaryFeedback: {
          data: {
            id: '1',
            attributes: {
              position,
              query,
              voting,
              web_page_summary: {
                data: {
                  id: web_page_summary,
                },
              },
            },
          },
        },
      }),
    )
  }),
  graphql.mutation('DeleteSummaryFeedback', (request, response, context) => {
    const { id } = request.variables
    return response(
      context.data({
        deleteSummaryFeedback: {
          data: {
            id,
          },
        },
      }),
    )
  }),
  graphql.mutation('CreatePrompt', (request, response, context) => {
    return response(
      context.data({
        createPrompt: {
          data: {
            id: '1',
          },
        },
      }),
    )
  }),
  graphql.mutation('DeletePrompt', (request, response, context) => {
    const { id } = request.variables
    return response(
      context.data({
        deletePrompt: {
          data: {
            id,
          },
        },
      }),
    )
  }),
  graphql.query('GetDefaultPrompts', (request, response, context) => {
    return response(
      context.data({
        prompts: {
          data: [{ id: '1' }, { id: '2' }],
        },
      }),
    )
  }),
  graphql.mutation('CreateScrapedWebPage', (request, response, context) => {
    const { title, originalContent, url } = request.variables.data
    return response(
      context.data({
        createScrapedWebPage: {
          data: {
            id: '1',
            attributes: { title, url, originalContent },
          },
        },
      }),
    )
  }),
  graphql.query('GetScrapedWebPagesByUrl', (request, response, context) => {
    return response(
      context.data({
        scrapedWebPages: {
          data: [{ id: '1' }],
        },
      }),
    )
  }),
  graphql.mutation('CreateWebPageSummary', (request, response, context) => {
    const { summary, keywords, largeLanguageModel, scraped_web_page } =
      request.variables.data
    return response(
      context.data({
        createWebPageSummary: {
          data: {
            id: '1',
            attributes: {
              keywords,
              summary,
              largeLanguageModel,
              scraped_web_page: {
                data: {
                  id: scraped_web_page,
                },
              },
            },
          },
        },
      }),
    )
  }),
  graphql.query('GetWebPageSummaries', (request, response, context) => {
    return response(
      context.data({
        webPageSummaries: {
          data: [
            {
              id: '1',
              attributes: {
                updatedAt: '2023-12-01T00:00:00Z',
                locale: 'en',
                keywords: ['keyword1', 'keyword2'],
                summary: 'summary',
                largeLanguageModel: 'gpt-3.5-turbo',
                publishedAt: '2023-11-01T00:00:00Z',
                summary_feedbacks: {
                  data: [
                    {
                      attributes: {
                        createdAt: '2023-11-02T00:00:00Z',
                        voting: Enum_Summaryfeedback_Voting.Up,
                      },
                    },
                  ],
                },
                scraped_web_page: {
                  data: {
                    attributes: {
                      title: 'test-title',
                      url: 'http://test.com',
                      originalContent: 'originalContent',
                    },
                  },
                },
              },
            },
          ],
        },
      }),
    )
  }),
  graphql.query(
    'GetWebPageSummariesByLanguageModelAndUrl',
    (request, response, context) => {
      return response(
        context.data({
          webPageSummaries: {
            data: [
              {
                id: '1',
              },
            ],
          },
        }),
      )
    },
  ),
  graphql.mutation('UpdateWebPageSummary', (request, response, context) => {
    const { data, id } = request.variables
    return response(
      context.data({
        updateWebPageSummary: {
          data: {
            id,
            attributes: data,
          },
        },
      }),
    )
  }),
]
