import { PublicationState, isStringArray } from '../index.js'

export enum FeedbackVoting {
  Down = 'down',
  Up = 'up',
}

export interface WebPageSummaryResult {
  id?: string
  locale?: string
  keywords?: string
  summary?: string
  largeLanguageModel?: string
  scraped_web_page?: {
    title?: string
    url?: string
    originalContent?: string
  }
  publishedAt?: Date
  updatedAt?: Date
  summary_feedbacks?: Array<{
    createdAt?: Date
    id?: string
    voting?: FeedbackVoting
  }>
}

export const transformLifecycleWebPageSummary = (
  webPageSummaryResult: WebPageSummaryResult,
  popularity: number,
) => {
  const parsedKeywords =
    webPageSummaryResult.keywords && JSON.parse(webPageSummaryResult.keywords)

  return {
    id: webPageSummaryResult.id?.toString() ?? '',
    language: webPageSummaryResult.locale ?? '',
    keywords: isStringArray(parsedKeywords) ? parsedKeywords : [],
    summary: webPageSummaryResult.summary ?? '',
    largeLanguageModel: webPageSummaryResult.largeLanguageModel ?? '',
    title: webPageSummaryResult.scraped_web_page?.title ?? '',
    url: webPageSummaryResult.scraped_web_page?.url ?? '',
    originalContent:
      webPageSummaryResult.scraped_web_page?.originalContent ?? '',
    publicationState: webPageSummaryResult.publishedAt
      ? PublicationState.Published
      : PublicationState.Draft,
    popularity,
  }
}
