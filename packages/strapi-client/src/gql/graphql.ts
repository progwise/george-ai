/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>
}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>
}
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never }
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never
    }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string }
  String: { input: string; output: string }
  Boolean: { input: boolean; output: boolean }
  Int: { input: number; output: number }
  Float: { input: number; output: number }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: any; output: any }
  /** A string used to identify an i18n locale */
  I18NLocaleCode: { input: any; output: any }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any }
  /** The `Upload` scalar type represents a file upload. */
  Upload: { input: any; output: any }
}

export type BooleanFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>
  between?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>
  contains?: InputMaybe<Scalars['Boolean']['input']>
  containsi?: InputMaybe<Scalars['Boolean']['input']>
  endsWith?: InputMaybe<Scalars['Boolean']['input']>
  eq?: InputMaybe<Scalars['Boolean']['input']>
  eqi?: InputMaybe<Scalars['Boolean']['input']>
  gt?: InputMaybe<Scalars['Boolean']['input']>
  gte?: InputMaybe<Scalars['Boolean']['input']>
  in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>
  lt?: InputMaybe<Scalars['Boolean']['input']>
  lte?: InputMaybe<Scalars['Boolean']['input']>
  ne?: InputMaybe<Scalars['Boolean']['input']>
  nei?: InputMaybe<Scalars['Boolean']['input']>
  not?: InputMaybe<BooleanFilterInput>
  notContains?: InputMaybe<Scalars['Boolean']['input']>
  notContainsi?: InputMaybe<Scalars['Boolean']['input']>
  notIn?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>
  notNull?: InputMaybe<Scalars['Boolean']['input']>
  null?: InputMaybe<Scalars['Boolean']['input']>
  or?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>
  startsWith?: InputMaybe<Scalars['Boolean']['input']>
}

export type ComponentConfigurationScrapeEntryPoint = {
  __typename?: 'ComponentConfigurationScrapeEntryPoint'
  depth?: Maybe<Scalars['Int']['output']>
  id: Scalars['ID']['output']
  prompts?: Maybe<PromptRelationResponseCollection>
  startUrl: Scalars['String']['output']
}

export type ComponentConfigurationScrapeEntryPointPromptsArgs = {
  filters?: InputMaybe<PromptFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type ComponentConfigurationScrapeEntryPointFiltersInput = {
  and?: InputMaybe<
    Array<InputMaybe<ComponentConfigurationScrapeEntryPointFiltersInput>>
  >
  depth?: InputMaybe<IntFilterInput>
  not?: InputMaybe<ComponentConfigurationScrapeEntryPointFiltersInput>
  or?: InputMaybe<
    Array<InputMaybe<ComponentConfigurationScrapeEntryPointFiltersInput>>
  >
  prompts?: InputMaybe<PromptFiltersInput>
  startUrl?: InputMaybe<StringFilterInput>
}

export type ComponentConfigurationScrapeEntryPointInput = {
  depth?: InputMaybe<Scalars['Int']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  prompts?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  startUrl?: InputMaybe<Scalars['String']['input']>
}

export type DateTimeFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>
  between?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>
  contains?: InputMaybe<Scalars['DateTime']['input']>
  containsi?: InputMaybe<Scalars['DateTime']['input']>
  endsWith?: InputMaybe<Scalars['DateTime']['input']>
  eq?: InputMaybe<Scalars['DateTime']['input']>
  eqi?: InputMaybe<Scalars['DateTime']['input']>
  gt?: InputMaybe<Scalars['DateTime']['input']>
  gte?: InputMaybe<Scalars['DateTime']['input']>
  in?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>
  lt?: InputMaybe<Scalars['DateTime']['input']>
  lte?: InputMaybe<Scalars['DateTime']['input']>
  ne?: InputMaybe<Scalars['DateTime']['input']>
  nei?: InputMaybe<Scalars['DateTime']['input']>
  not?: InputMaybe<DateTimeFilterInput>
  notContains?: InputMaybe<Scalars['DateTime']['input']>
  notContainsi?: InputMaybe<Scalars['DateTime']['input']>
  notIn?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>
  notNull?: InputMaybe<Scalars['Boolean']['input']>
  null?: InputMaybe<Scalars['Boolean']['input']>
  or?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>
  startsWith?: InputMaybe<Scalars['DateTime']['input']>
}

export enum Enum_Summaryfeedback_Voting {
  Down = 'down',
  Up = 'up',
}

export type FileInfoInput = {
  alternativeText?: InputMaybe<Scalars['String']['input']>
  caption?: InputMaybe<Scalars['String']['input']>
  name?: InputMaybe<Scalars['String']['input']>
}

export type FloatFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  between?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  contains?: InputMaybe<Scalars['Float']['input']>
  containsi?: InputMaybe<Scalars['Float']['input']>
  endsWith?: InputMaybe<Scalars['Float']['input']>
  eq?: InputMaybe<Scalars['Float']['input']>
  eqi?: InputMaybe<Scalars['Float']['input']>
  gt?: InputMaybe<Scalars['Float']['input']>
  gte?: InputMaybe<Scalars['Float']['input']>
  in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  lt?: InputMaybe<Scalars['Float']['input']>
  lte?: InputMaybe<Scalars['Float']['input']>
  ne?: InputMaybe<Scalars['Float']['input']>
  nei?: InputMaybe<Scalars['Float']['input']>
  not?: InputMaybe<FloatFilterInput>
  notContains?: InputMaybe<Scalars['Float']['input']>
  notContainsi?: InputMaybe<Scalars['Float']['input']>
  notIn?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  notNull?: InputMaybe<Scalars['Boolean']['input']>
  null?: InputMaybe<Scalars['Boolean']['input']>
  or?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  startsWith?: InputMaybe<Scalars['Float']['input']>
}

export type GenericMorph =
  | ComponentConfigurationScrapeEntryPoint
  | I18NLocale
  | Prompt
  | ProposalForSummary
  | ScrapedWebPage
  | ScraperConfiguration
  | SummaryFeedback
  | UploadFile
  | UploadFolder
  | UsersPermissionsPermission
  | UsersPermissionsRole
  | UsersPermissionsUser
  | WebPageSummary

export type I18NLocale = {
  __typename?: 'I18NLocale'
  code?: Maybe<Scalars['String']['output']>
  createdAt?: Maybe<Scalars['DateTime']['output']>
  name?: Maybe<Scalars['String']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type I18NLocaleEntity = {
  __typename?: 'I18NLocaleEntity'
  attributes?: Maybe<I18NLocale>
  id?: Maybe<Scalars['ID']['output']>
}

export type I18NLocaleEntityResponse = {
  __typename?: 'I18NLocaleEntityResponse'
  data?: Maybe<I18NLocaleEntity>
}

export type I18NLocaleEntityResponseCollection = {
  __typename?: 'I18NLocaleEntityResponseCollection'
  data: Array<I18NLocaleEntity>
  meta: ResponseCollectionMeta
}

export type I18NLocaleFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<I18NLocaleFiltersInput>>>
  code?: InputMaybe<StringFilterInput>
  createdAt?: InputMaybe<DateTimeFilterInput>
  id?: InputMaybe<IdFilterInput>
  name?: InputMaybe<StringFilterInput>
  not?: InputMaybe<I18NLocaleFiltersInput>
  or?: InputMaybe<Array<InputMaybe<I18NLocaleFiltersInput>>>
  updatedAt?: InputMaybe<DateTimeFilterInput>
}

export type IdFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  between?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  contains?: InputMaybe<Scalars['ID']['input']>
  containsi?: InputMaybe<Scalars['ID']['input']>
  endsWith?: InputMaybe<Scalars['ID']['input']>
  eq?: InputMaybe<Scalars['ID']['input']>
  eqi?: InputMaybe<Scalars['ID']['input']>
  gt?: InputMaybe<Scalars['ID']['input']>
  gte?: InputMaybe<Scalars['ID']['input']>
  in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  lt?: InputMaybe<Scalars['ID']['input']>
  lte?: InputMaybe<Scalars['ID']['input']>
  ne?: InputMaybe<Scalars['ID']['input']>
  nei?: InputMaybe<Scalars['ID']['input']>
  not?: InputMaybe<IdFilterInput>
  notContains?: InputMaybe<Scalars['ID']['input']>
  notContainsi?: InputMaybe<Scalars['ID']['input']>
  notIn?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  notNull?: InputMaybe<Scalars['Boolean']['input']>
  null?: InputMaybe<Scalars['Boolean']['input']>
  or?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  startsWith?: InputMaybe<Scalars['ID']['input']>
}

export type IntFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  between?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  contains?: InputMaybe<Scalars['Int']['input']>
  containsi?: InputMaybe<Scalars['Int']['input']>
  endsWith?: InputMaybe<Scalars['Int']['input']>
  eq?: InputMaybe<Scalars['Int']['input']>
  eqi?: InputMaybe<Scalars['Int']['input']>
  gt?: InputMaybe<Scalars['Int']['input']>
  gte?: InputMaybe<Scalars['Int']['input']>
  in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  lt?: InputMaybe<Scalars['Int']['input']>
  lte?: InputMaybe<Scalars['Int']['input']>
  ne?: InputMaybe<Scalars['Int']['input']>
  nei?: InputMaybe<Scalars['Int']['input']>
  not?: InputMaybe<IntFilterInput>
  notContains?: InputMaybe<Scalars['Int']['input']>
  notContainsi?: InputMaybe<Scalars['Int']['input']>
  notIn?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  notNull?: InputMaybe<Scalars['Boolean']['input']>
  null?: InputMaybe<Scalars['Boolean']['input']>
  or?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  startsWith?: InputMaybe<Scalars['Int']['input']>
}

export type JsonFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>
  between?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>
  contains?: InputMaybe<Scalars['JSON']['input']>
  containsi?: InputMaybe<Scalars['JSON']['input']>
  endsWith?: InputMaybe<Scalars['JSON']['input']>
  eq?: InputMaybe<Scalars['JSON']['input']>
  eqi?: InputMaybe<Scalars['JSON']['input']>
  gt?: InputMaybe<Scalars['JSON']['input']>
  gte?: InputMaybe<Scalars['JSON']['input']>
  in?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>
  lt?: InputMaybe<Scalars['JSON']['input']>
  lte?: InputMaybe<Scalars['JSON']['input']>
  ne?: InputMaybe<Scalars['JSON']['input']>
  nei?: InputMaybe<Scalars['JSON']['input']>
  not?: InputMaybe<JsonFilterInput>
  notContains?: InputMaybe<Scalars['JSON']['input']>
  notContainsi?: InputMaybe<Scalars['JSON']['input']>
  notIn?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>
  notNull?: InputMaybe<Scalars['Boolean']['input']>
  null?: InputMaybe<Scalars['Boolean']['input']>
  or?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>
  startsWith?: InputMaybe<Scalars['JSON']['input']>
}

export type Mutation = {
  __typename?: 'Mutation'
  /** Change user password. Confirm with the current password. */
  changePassword?: Maybe<UsersPermissionsLoginPayload>
  createPrompt?: Maybe<PromptEntityResponse>
  createPromptLocalization?: Maybe<PromptEntityResponse>
  createProposalForSummary?: Maybe<ProposalForSummaryEntityResponse>
  createScrapedWebPage?: Maybe<ScrapedWebPageEntityResponse>
  createSummaryFeedback?: Maybe<SummaryFeedbackEntityResponse>
  createUploadFile?: Maybe<UploadFileEntityResponse>
  createUploadFolder?: Maybe<UploadFolderEntityResponse>
  /** Create a new role */
  createUsersPermissionsRole?: Maybe<UsersPermissionsCreateRolePayload>
  /** Create a new user */
  createUsersPermissionsUser: UsersPermissionsUserEntityResponse
  createWebPageSummary?: Maybe<WebPageSummaryEntityResponse>
  createWebPageSummaryLocalization?: Maybe<WebPageSummaryEntityResponse>
  deletePrompt?: Maybe<PromptEntityResponse>
  deleteProposalForSummary?: Maybe<ProposalForSummaryEntityResponse>
  deleteScrapedWebPage?: Maybe<ScrapedWebPageEntityResponse>
  deleteScraperConfiguration?: Maybe<ScraperConfigurationEntityResponse>
  deleteSummaryFeedback?: Maybe<SummaryFeedbackEntityResponse>
  deleteUploadFile?: Maybe<UploadFileEntityResponse>
  deleteUploadFolder?: Maybe<UploadFolderEntityResponse>
  /** Delete an existing role */
  deleteUsersPermissionsRole?: Maybe<UsersPermissionsDeleteRolePayload>
  /** Delete an existing user */
  deleteUsersPermissionsUser: UsersPermissionsUserEntityResponse
  deleteWebPageSummary?: Maybe<WebPageSummaryEntityResponse>
  /** Confirm an email users email address */
  emailConfirmation?: Maybe<UsersPermissionsLoginPayload>
  /** Request a reset password token */
  forgotPassword?: Maybe<UsersPermissionsPasswordPayload>
  login: UsersPermissionsLoginPayload
  multipleUpload: Array<Maybe<UploadFileEntityResponse>>
  /** Register a user */
  register: UsersPermissionsLoginPayload
  removeFile?: Maybe<UploadFileEntityResponse>
  /** Reset user password. Confirm with a code (resetToken from forgotPassword) */
  resetPassword?: Maybe<UsersPermissionsLoginPayload>
  updateFileInfo: UploadFileEntityResponse
  updatePrompt?: Maybe<PromptEntityResponse>
  updateProposalForSummary?: Maybe<ProposalForSummaryEntityResponse>
  updateScrapedWebPage?: Maybe<ScrapedWebPageEntityResponse>
  updateScraperConfiguration?: Maybe<ScraperConfigurationEntityResponse>
  updateSummaryFeedback?: Maybe<SummaryFeedbackEntityResponse>
  updateUploadFile?: Maybe<UploadFileEntityResponse>
  updateUploadFolder?: Maybe<UploadFolderEntityResponse>
  /** Update an existing role */
  updateUsersPermissionsRole?: Maybe<UsersPermissionsUpdateRolePayload>
  /** Update an existing user */
  updateUsersPermissionsUser: UsersPermissionsUserEntityResponse
  updateWebPageSummary?: Maybe<WebPageSummaryEntityResponse>
  upload: UploadFileEntityResponse
}

export type MutationChangePasswordArgs = {
  currentPassword: Scalars['String']['input']
  password: Scalars['String']['input']
  passwordConfirmation: Scalars['String']['input']
}

export type MutationCreatePromptArgs = {
  data: PromptInput
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>
}

export type MutationCreatePromptLocalizationArgs = {
  data?: InputMaybe<PromptInput>
  id?: InputMaybe<Scalars['ID']['input']>
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>
}

export type MutationCreateProposalForSummaryArgs = {
  data: ProposalForSummaryInput
}

export type MutationCreateScrapedWebPageArgs = {
  data: ScrapedWebPageInput
}

export type MutationCreateSummaryFeedbackArgs = {
  data: SummaryFeedbackInput
}

export type MutationCreateUploadFileArgs = {
  data: UploadFileInput
}

export type MutationCreateUploadFolderArgs = {
  data: UploadFolderInput
}

export type MutationCreateUsersPermissionsRoleArgs = {
  data: UsersPermissionsRoleInput
}

export type MutationCreateUsersPermissionsUserArgs = {
  data: UsersPermissionsUserInput
}

export type MutationCreateWebPageSummaryArgs = {
  data: WebPageSummaryInput
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>
}

export type MutationCreateWebPageSummaryLocalizationArgs = {
  data?: InputMaybe<WebPageSummaryInput>
  id?: InputMaybe<Scalars['ID']['input']>
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>
}

export type MutationDeletePromptArgs = {
  id: Scalars['ID']['input']
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>
}

export type MutationDeleteProposalForSummaryArgs = {
  id: Scalars['ID']['input']
}

export type MutationDeleteScrapedWebPageArgs = {
  id: Scalars['ID']['input']
}

export type MutationDeleteSummaryFeedbackArgs = {
  id: Scalars['ID']['input']
}

export type MutationDeleteUploadFileArgs = {
  id: Scalars['ID']['input']
}

export type MutationDeleteUploadFolderArgs = {
  id: Scalars['ID']['input']
}

export type MutationDeleteUsersPermissionsRoleArgs = {
  id: Scalars['ID']['input']
}

export type MutationDeleteUsersPermissionsUserArgs = {
  id: Scalars['ID']['input']
}

export type MutationDeleteWebPageSummaryArgs = {
  id: Scalars['ID']['input']
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>
}

export type MutationEmailConfirmationArgs = {
  confirmation: Scalars['String']['input']
}

export type MutationForgotPasswordArgs = {
  email: Scalars['String']['input']
}

export type MutationLoginArgs = {
  input: UsersPermissionsLoginInput
}

export type MutationMultipleUploadArgs = {
  field?: InputMaybe<Scalars['String']['input']>
  files: Array<InputMaybe<Scalars['Upload']['input']>>
  ref?: InputMaybe<Scalars['String']['input']>
  refId?: InputMaybe<Scalars['ID']['input']>
}

export type MutationRegisterArgs = {
  input: UsersPermissionsRegisterInput
}

export type MutationRemoveFileArgs = {
  id: Scalars['ID']['input']
}

export type MutationResetPasswordArgs = {
  code: Scalars['String']['input']
  password: Scalars['String']['input']
  passwordConfirmation: Scalars['String']['input']
}

export type MutationUpdateFileInfoArgs = {
  id: Scalars['ID']['input']
  info?: InputMaybe<FileInfoInput>
}

export type MutationUpdatePromptArgs = {
  data: PromptInput
  id: Scalars['ID']['input']
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>
}

export type MutationUpdateProposalForSummaryArgs = {
  data: ProposalForSummaryInput
  id: Scalars['ID']['input']
}

export type MutationUpdateScrapedWebPageArgs = {
  data: ScrapedWebPageInput
  id: Scalars['ID']['input']
}

export type MutationUpdateScraperConfigurationArgs = {
  data: ScraperConfigurationInput
}

export type MutationUpdateSummaryFeedbackArgs = {
  data: SummaryFeedbackInput
  id: Scalars['ID']['input']
}

export type MutationUpdateUploadFileArgs = {
  data: UploadFileInput
  id: Scalars['ID']['input']
}

export type MutationUpdateUploadFolderArgs = {
  data: UploadFolderInput
  id: Scalars['ID']['input']
}

export type MutationUpdateUsersPermissionsRoleArgs = {
  data: UsersPermissionsRoleInput
  id: Scalars['ID']['input']
}

export type MutationUpdateUsersPermissionsUserArgs = {
  data: UsersPermissionsUserInput
  id: Scalars['ID']['input']
}

export type MutationUpdateWebPageSummaryArgs = {
  data: WebPageSummaryInput
  id: Scalars['ID']['input']
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>
}

export type MutationUploadArgs = {
  field?: InputMaybe<Scalars['String']['input']>
  file: Scalars['Upload']['input']
  info?: InputMaybe<FileInfoInput>
  ref?: InputMaybe<Scalars['String']['input']>
  refId?: InputMaybe<Scalars['ID']['input']>
}

export type Pagination = {
  __typename?: 'Pagination'
  page: Scalars['Int']['output']
  pageCount: Scalars['Int']['output']
  pageSize: Scalars['Int']['output']
  total: Scalars['Int']['output']
}

export type PaginationArg = {
  limit?: InputMaybe<Scalars['Int']['input']>
  page?: InputMaybe<Scalars['Int']['input']>
  pageSize?: InputMaybe<Scalars['Int']['input']>
  start?: InputMaybe<Scalars['Int']['input']>
}

export type Prompt = {
  __typename?: 'Prompt'
  createdAt?: Maybe<Scalars['DateTime']['output']>
  isDefaultPrompt: Scalars['Boolean']['output']
  keywordPrompt?: Maybe<Scalars['String']['output']>
  llm?: Maybe<Scalars['String']['output']>
  locale?: Maybe<Scalars['String']['output']>
  localizations?: Maybe<PromptRelationResponseCollection>
  summaryPrompt?: Maybe<Scalars['String']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type PromptLocalizationsArgs = {
  filters?: InputMaybe<PromptFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type PromptEntity = {
  __typename?: 'PromptEntity'
  attributes?: Maybe<Prompt>
  id?: Maybe<Scalars['ID']['output']>
}

export type PromptEntityResponse = {
  __typename?: 'PromptEntityResponse'
  data?: Maybe<PromptEntity>
}

export type PromptEntityResponseCollection = {
  __typename?: 'PromptEntityResponseCollection'
  data: Array<PromptEntity>
  meta: ResponseCollectionMeta
}

export type PromptFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<PromptFiltersInput>>>
  createdAt?: InputMaybe<DateTimeFilterInput>
  id?: InputMaybe<IdFilterInput>
  isDefaultPrompt?: InputMaybe<BooleanFilterInput>
  keywordPrompt?: InputMaybe<StringFilterInput>
  llm?: InputMaybe<StringFilterInput>
  locale?: InputMaybe<StringFilterInput>
  localizations?: InputMaybe<PromptFiltersInput>
  not?: InputMaybe<PromptFiltersInput>
  or?: InputMaybe<Array<InputMaybe<PromptFiltersInput>>>
  summaryPrompt?: InputMaybe<StringFilterInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
}

export type PromptInput = {
  isDefaultPrompt?: InputMaybe<Scalars['Boolean']['input']>
  keywordPrompt?: InputMaybe<Scalars['String']['input']>
  llm?: InputMaybe<Scalars['String']['input']>
  summaryPrompt?: InputMaybe<Scalars['String']['input']>
}

export type PromptRelationResponseCollection = {
  __typename?: 'PromptRelationResponseCollection'
  data: Array<PromptEntity>
}

export type ProposalForSummary = {
  __typename?: 'ProposalForSummary'
  createdAt?: Maybe<Scalars['DateTime']['output']>
  proposalSummary?: Maybe<Scalars['String']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  web_page_summary?: Maybe<WebPageSummaryEntityResponse>
}

export type ProposalForSummaryEntity = {
  __typename?: 'ProposalForSummaryEntity'
  attributes?: Maybe<ProposalForSummary>
  id?: Maybe<Scalars['ID']['output']>
}

export type ProposalForSummaryEntityResponse = {
  __typename?: 'ProposalForSummaryEntityResponse'
  data?: Maybe<ProposalForSummaryEntity>
}

export type ProposalForSummaryEntityResponseCollection = {
  __typename?: 'ProposalForSummaryEntityResponseCollection'
  data: Array<ProposalForSummaryEntity>
  meta: ResponseCollectionMeta
}

export type ProposalForSummaryFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ProposalForSummaryFiltersInput>>>
  createdAt?: InputMaybe<DateTimeFilterInput>
  id?: InputMaybe<IdFilterInput>
  not?: InputMaybe<ProposalForSummaryFiltersInput>
  or?: InputMaybe<Array<InputMaybe<ProposalForSummaryFiltersInput>>>
  proposalSummary?: InputMaybe<StringFilterInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
  web_page_summary?: InputMaybe<WebPageSummaryFiltersInput>
}

export type ProposalForSummaryInput = {
  proposalSummary?: InputMaybe<Scalars['String']['input']>
  web_page_summary?: InputMaybe<Scalars['ID']['input']>
}

export type ProposalForSummaryRelationResponseCollection = {
  __typename?: 'ProposalForSummaryRelationResponseCollection'
  data: Array<ProposalForSummaryEntity>
}

export enum PublicationState {
  Live = 'LIVE',
  Preview = 'PREVIEW',
}

export type Query = {
  __typename?: 'Query'
  i18NLocale?: Maybe<I18NLocaleEntityResponse>
  i18NLocales?: Maybe<I18NLocaleEntityResponseCollection>
  me?: Maybe<UsersPermissionsMe>
  prompt?: Maybe<PromptEntityResponse>
  prompts?: Maybe<PromptEntityResponseCollection>
  proposalForSummaries?: Maybe<ProposalForSummaryEntityResponseCollection>
  proposalForSummary?: Maybe<ProposalForSummaryEntityResponse>
  scrapedWebPage?: Maybe<ScrapedWebPageEntityResponse>
  scrapedWebPages?: Maybe<ScrapedWebPageEntityResponseCollection>
  scraperConfiguration?: Maybe<ScraperConfigurationEntityResponse>
  summaryFeedback?: Maybe<SummaryFeedbackEntityResponse>
  summaryFeedbacks?: Maybe<SummaryFeedbackEntityResponseCollection>
  uploadFile?: Maybe<UploadFileEntityResponse>
  uploadFiles?: Maybe<UploadFileEntityResponseCollection>
  uploadFolder?: Maybe<UploadFolderEntityResponse>
  uploadFolders?: Maybe<UploadFolderEntityResponseCollection>
  usersPermissionsRole?: Maybe<UsersPermissionsRoleEntityResponse>
  usersPermissionsRoles?: Maybe<UsersPermissionsRoleEntityResponseCollection>
  usersPermissionsUser?: Maybe<UsersPermissionsUserEntityResponse>
  usersPermissionsUsers?: Maybe<UsersPermissionsUserEntityResponseCollection>
  webPageSummaries?: Maybe<WebPageSummaryEntityResponseCollection>
  webPageSummary?: Maybe<WebPageSummaryEntityResponse>
}

export type QueryI18NLocaleArgs = {
  id?: InputMaybe<Scalars['ID']['input']>
}

export type QueryI18NLocalesArgs = {
  filters?: InputMaybe<I18NLocaleFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryPromptArgs = {
  id?: InputMaybe<Scalars['ID']['input']>
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>
}

export type QueryPromptsArgs = {
  filters?: InputMaybe<PromptFiltersInput>
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryProposalForSummariesArgs = {
  filters?: InputMaybe<ProposalForSummaryFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryProposalForSummaryArgs = {
  id?: InputMaybe<Scalars['ID']['input']>
}

export type QueryScrapedWebPageArgs = {
  id?: InputMaybe<Scalars['ID']['input']>
}

export type QueryScrapedWebPagesArgs = {
  filters?: InputMaybe<ScrapedWebPageFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QuerySummaryFeedbackArgs = {
  id?: InputMaybe<Scalars['ID']['input']>
}

export type QuerySummaryFeedbacksArgs = {
  filters?: InputMaybe<SummaryFeedbackFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryUploadFileArgs = {
  id?: InputMaybe<Scalars['ID']['input']>
}

export type QueryUploadFilesArgs = {
  filters?: InputMaybe<UploadFileFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryUploadFolderArgs = {
  id?: InputMaybe<Scalars['ID']['input']>
}

export type QueryUploadFoldersArgs = {
  filters?: InputMaybe<UploadFolderFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryUsersPermissionsRoleArgs = {
  id?: InputMaybe<Scalars['ID']['input']>
}

export type QueryUsersPermissionsRolesArgs = {
  filters?: InputMaybe<UsersPermissionsRoleFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryUsersPermissionsUserArgs = {
  id?: InputMaybe<Scalars['ID']['input']>
}

export type QueryUsersPermissionsUsersArgs = {
  filters?: InputMaybe<UsersPermissionsUserFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryWebPageSummariesArgs = {
  filters?: InputMaybe<WebPageSummaryFiltersInput>
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>
  pagination?: InputMaybe<PaginationArg>
  publicationState?: InputMaybe<PublicationState>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type QueryWebPageSummaryArgs = {
  id?: InputMaybe<Scalars['ID']['input']>
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>
}

export type ResponseCollectionMeta = {
  __typename?: 'ResponseCollectionMeta'
  pagination: Pagination
}

export type ScrapedWebPage = {
  __typename?: 'ScrapedWebPage'
  createdAt?: Maybe<Scalars['DateTime']['output']>
  originalContent?: Maybe<Scalars['String']['output']>
  prompts?: Maybe<PromptRelationResponseCollection>
  title?: Maybe<Scalars['String']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  url?: Maybe<Scalars['String']['output']>
  web_page_summaries?: Maybe<WebPageSummaryRelationResponseCollection>
}

export type ScrapedWebPagePromptsArgs = {
  filters?: InputMaybe<PromptFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type ScrapedWebPageWeb_Page_SummariesArgs = {
  filters?: InputMaybe<WebPageSummaryFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  publicationState?: InputMaybe<PublicationState>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type ScrapedWebPageEntity = {
  __typename?: 'ScrapedWebPageEntity'
  attributes?: Maybe<ScrapedWebPage>
  id?: Maybe<Scalars['ID']['output']>
}

export type ScrapedWebPageEntityResponse = {
  __typename?: 'ScrapedWebPageEntityResponse'
  data?: Maybe<ScrapedWebPageEntity>
}

export type ScrapedWebPageEntityResponseCollection = {
  __typename?: 'ScrapedWebPageEntityResponseCollection'
  data: Array<ScrapedWebPageEntity>
  meta: ResponseCollectionMeta
}

export type ScrapedWebPageFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ScrapedWebPageFiltersInput>>>
  createdAt?: InputMaybe<DateTimeFilterInput>
  id?: InputMaybe<IdFilterInput>
  not?: InputMaybe<ScrapedWebPageFiltersInput>
  or?: InputMaybe<Array<InputMaybe<ScrapedWebPageFiltersInput>>>
  originalContent?: InputMaybe<StringFilterInput>
  prompts?: InputMaybe<PromptFiltersInput>
  title?: InputMaybe<StringFilterInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
  url?: InputMaybe<StringFilterInput>
  web_page_summaries?: InputMaybe<WebPageSummaryFiltersInput>
}

export type ScrapedWebPageInput = {
  originalContent?: InputMaybe<Scalars['String']['input']>
  prompts?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  title?: InputMaybe<Scalars['String']['input']>
  url?: InputMaybe<Scalars['String']['input']>
  web_page_summaries?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
}

export type ScraperConfiguration = {
  __typename?: 'ScraperConfiguration'
  createdAt?: Maybe<Scalars['DateTime']['output']>
  entryPoints?: Maybe<Array<Maybe<ComponentConfigurationScrapeEntryPoint>>>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type ScraperConfigurationEntryPointsArgs = {
  filters?: InputMaybe<ComponentConfigurationScrapeEntryPointFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type ScraperConfigurationEntity = {
  __typename?: 'ScraperConfigurationEntity'
  attributes?: Maybe<ScraperConfiguration>
  id?: Maybe<Scalars['ID']['output']>
}

export type ScraperConfigurationEntityResponse = {
  __typename?: 'ScraperConfigurationEntityResponse'
  data?: Maybe<ScraperConfigurationEntity>
}

export type ScraperConfigurationInput = {
  entryPoints?: InputMaybe<
    Array<InputMaybe<ComponentConfigurationScrapeEntryPointInput>>
  >
}

export type StringFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  between?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  contains?: InputMaybe<Scalars['String']['input']>
  containsi?: InputMaybe<Scalars['String']['input']>
  endsWith?: InputMaybe<Scalars['String']['input']>
  eq?: InputMaybe<Scalars['String']['input']>
  eqi?: InputMaybe<Scalars['String']['input']>
  gt?: InputMaybe<Scalars['String']['input']>
  gte?: InputMaybe<Scalars['String']['input']>
  in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  lt?: InputMaybe<Scalars['String']['input']>
  lte?: InputMaybe<Scalars['String']['input']>
  ne?: InputMaybe<Scalars['String']['input']>
  nei?: InputMaybe<Scalars['String']['input']>
  not?: InputMaybe<StringFilterInput>
  notContains?: InputMaybe<Scalars['String']['input']>
  notContainsi?: InputMaybe<Scalars['String']['input']>
  notIn?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  notNull?: InputMaybe<Scalars['Boolean']['input']>
  null?: InputMaybe<Scalars['Boolean']['input']>
  or?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  startsWith?: InputMaybe<Scalars['String']['input']>
}

export type SummaryFeedback = {
  __typename?: 'SummaryFeedback'
  createdAt?: Maybe<Scalars['DateTime']['output']>
  query?: Maybe<Scalars['String']['output']>
  selectedSummaryIndex?: Maybe<Scalars['Int']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  voting?: Maybe<Enum_Summaryfeedback_Voting>
  web_page_summary?: Maybe<WebPageSummaryEntityResponse>
}

export type SummaryFeedbackEntity = {
  __typename?: 'SummaryFeedbackEntity'
  attributes?: Maybe<SummaryFeedback>
  id?: Maybe<Scalars['ID']['output']>
}

export type SummaryFeedbackEntityResponse = {
  __typename?: 'SummaryFeedbackEntityResponse'
  data?: Maybe<SummaryFeedbackEntity>
}

export type SummaryFeedbackEntityResponseCollection = {
  __typename?: 'SummaryFeedbackEntityResponseCollection'
  data: Array<SummaryFeedbackEntity>
  meta: ResponseCollectionMeta
}

export type SummaryFeedbackFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<SummaryFeedbackFiltersInput>>>
  createdAt?: InputMaybe<DateTimeFilterInput>
  id?: InputMaybe<IdFilterInput>
  not?: InputMaybe<SummaryFeedbackFiltersInput>
  or?: InputMaybe<Array<InputMaybe<SummaryFeedbackFiltersInput>>>
  query?: InputMaybe<StringFilterInput>
  selectedSummaryIndex?: InputMaybe<IntFilterInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
  voting?: InputMaybe<StringFilterInput>
  web_page_summary?: InputMaybe<WebPageSummaryFiltersInput>
}

export type SummaryFeedbackInput = {
  query?: InputMaybe<Scalars['String']['input']>
  selectedSummaryIndex?: InputMaybe<Scalars['Int']['input']>
  voting?: InputMaybe<Enum_Summaryfeedback_Voting>
  web_page_summary?: InputMaybe<Scalars['ID']['input']>
}

export type SummaryFeedbackRelationResponseCollection = {
  __typename?: 'SummaryFeedbackRelationResponseCollection'
  data: Array<SummaryFeedbackEntity>
}

export type UploadFile = {
  __typename?: 'UploadFile'
  alternativeText?: Maybe<Scalars['String']['output']>
  caption?: Maybe<Scalars['String']['output']>
  createdAt?: Maybe<Scalars['DateTime']['output']>
  ext?: Maybe<Scalars['String']['output']>
  formats?: Maybe<Scalars['JSON']['output']>
  hash: Scalars['String']['output']
  height?: Maybe<Scalars['Int']['output']>
  mime: Scalars['String']['output']
  name: Scalars['String']['output']
  previewUrl?: Maybe<Scalars['String']['output']>
  provider: Scalars['String']['output']
  provider_metadata?: Maybe<Scalars['JSON']['output']>
  related?: Maybe<Array<Maybe<GenericMorph>>>
  size: Scalars['Float']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  url: Scalars['String']['output']
  width?: Maybe<Scalars['Int']['output']>
}

export type UploadFileEntity = {
  __typename?: 'UploadFileEntity'
  attributes?: Maybe<UploadFile>
  id?: Maybe<Scalars['ID']['output']>
}

export type UploadFileEntityResponse = {
  __typename?: 'UploadFileEntityResponse'
  data?: Maybe<UploadFileEntity>
}

export type UploadFileEntityResponseCollection = {
  __typename?: 'UploadFileEntityResponseCollection'
  data: Array<UploadFileEntity>
  meta: ResponseCollectionMeta
}

export type UploadFileFiltersInput = {
  alternativeText?: InputMaybe<StringFilterInput>
  and?: InputMaybe<Array<InputMaybe<UploadFileFiltersInput>>>
  caption?: InputMaybe<StringFilterInput>
  createdAt?: InputMaybe<DateTimeFilterInput>
  ext?: InputMaybe<StringFilterInput>
  folder?: InputMaybe<UploadFolderFiltersInput>
  folderPath?: InputMaybe<StringFilterInput>
  formats?: InputMaybe<JsonFilterInput>
  hash?: InputMaybe<StringFilterInput>
  height?: InputMaybe<IntFilterInput>
  id?: InputMaybe<IdFilterInput>
  mime?: InputMaybe<StringFilterInput>
  name?: InputMaybe<StringFilterInput>
  not?: InputMaybe<UploadFileFiltersInput>
  or?: InputMaybe<Array<InputMaybe<UploadFileFiltersInput>>>
  previewUrl?: InputMaybe<StringFilterInput>
  provider?: InputMaybe<StringFilterInput>
  provider_metadata?: InputMaybe<JsonFilterInput>
  size?: InputMaybe<FloatFilterInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
  url?: InputMaybe<StringFilterInput>
  width?: InputMaybe<IntFilterInput>
}

export type UploadFileInput = {
  alternativeText?: InputMaybe<Scalars['String']['input']>
  caption?: InputMaybe<Scalars['String']['input']>
  ext?: InputMaybe<Scalars['String']['input']>
  folder?: InputMaybe<Scalars['ID']['input']>
  folderPath?: InputMaybe<Scalars['String']['input']>
  formats?: InputMaybe<Scalars['JSON']['input']>
  hash?: InputMaybe<Scalars['String']['input']>
  height?: InputMaybe<Scalars['Int']['input']>
  mime?: InputMaybe<Scalars['String']['input']>
  name?: InputMaybe<Scalars['String']['input']>
  previewUrl?: InputMaybe<Scalars['String']['input']>
  provider?: InputMaybe<Scalars['String']['input']>
  provider_metadata?: InputMaybe<Scalars['JSON']['input']>
  size?: InputMaybe<Scalars['Float']['input']>
  url?: InputMaybe<Scalars['String']['input']>
  width?: InputMaybe<Scalars['Int']['input']>
}

export type UploadFileRelationResponseCollection = {
  __typename?: 'UploadFileRelationResponseCollection'
  data: Array<UploadFileEntity>
}

export type UploadFolder = {
  __typename?: 'UploadFolder'
  children?: Maybe<UploadFolderRelationResponseCollection>
  createdAt?: Maybe<Scalars['DateTime']['output']>
  files?: Maybe<UploadFileRelationResponseCollection>
  name: Scalars['String']['output']
  parent?: Maybe<UploadFolderEntityResponse>
  path: Scalars['String']['output']
  pathId: Scalars['Int']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type UploadFolderChildrenArgs = {
  filters?: InputMaybe<UploadFolderFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type UploadFolderFilesArgs = {
  filters?: InputMaybe<UploadFileFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type UploadFolderEntity = {
  __typename?: 'UploadFolderEntity'
  attributes?: Maybe<UploadFolder>
  id?: Maybe<Scalars['ID']['output']>
}

export type UploadFolderEntityResponse = {
  __typename?: 'UploadFolderEntityResponse'
  data?: Maybe<UploadFolderEntity>
}

export type UploadFolderEntityResponseCollection = {
  __typename?: 'UploadFolderEntityResponseCollection'
  data: Array<UploadFolderEntity>
  meta: ResponseCollectionMeta
}

export type UploadFolderFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<UploadFolderFiltersInput>>>
  children?: InputMaybe<UploadFolderFiltersInput>
  createdAt?: InputMaybe<DateTimeFilterInput>
  files?: InputMaybe<UploadFileFiltersInput>
  id?: InputMaybe<IdFilterInput>
  name?: InputMaybe<StringFilterInput>
  not?: InputMaybe<UploadFolderFiltersInput>
  or?: InputMaybe<Array<InputMaybe<UploadFolderFiltersInput>>>
  parent?: InputMaybe<UploadFolderFiltersInput>
  path?: InputMaybe<StringFilterInput>
  pathId?: InputMaybe<IntFilterInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
}

export type UploadFolderInput = {
  children?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  files?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  name?: InputMaybe<Scalars['String']['input']>
  parent?: InputMaybe<Scalars['ID']['input']>
  path?: InputMaybe<Scalars['String']['input']>
  pathId?: InputMaybe<Scalars['Int']['input']>
}

export type UploadFolderRelationResponseCollection = {
  __typename?: 'UploadFolderRelationResponseCollection'
  data: Array<UploadFolderEntity>
}

export type UsersPermissionsCreateRolePayload = {
  __typename?: 'UsersPermissionsCreateRolePayload'
  ok: Scalars['Boolean']['output']
}

export type UsersPermissionsDeleteRolePayload = {
  __typename?: 'UsersPermissionsDeleteRolePayload'
  ok: Scalars['Boolean']['output']
}

export type UsersPermissionsLoginInput = {
  identifier: Scalars['String']['input']
  password: Scalars['String']['input']
  provider?: Scalars['String']['input']
}

export type UsersPermissionsLoginPayload = {
  __typename?: 'UsersPermissionsLoginPayload'
  jwt?: Maybe<Scalars['String']['output']>
  user: UsersPermissionsMe
}

export type UsersPermissionsMe = {
  __typename?: 'UsersPermissionsMe'
  blocked?: Maybe<Scalars['Boolean']['output']>
  confirmed?: Maybe<Scalars['Boolean']['output']>
  email?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  role?: Maybe<UsersPermissionsMeRole>
  username: Scalars['String']['output']
}

export type UsersPermissionsMeRole = {
  __typename?: 'UsersPermissionsMeRole'
  description?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  name: Scalars['String']['output']
  type?: Maybe<Scalars['String']['output']>
}

export type UsersPermissionsPasswordPayload = {
  __typename?: 'UsersPermissionsPasswordPayload'
  ok: Scalars['Boolean']['output']
}

export type UsersPermissionsPermission = {
  __typename?: 'UsersPermissionsPermission'
  action: Scalars['String']['output']
  createdAt?: Maybe<Scalars['DateTime']['output']>
  role?: Maybe<UsersPermissionsRoleEntityResponse>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type UsersPermissionsPermissionEntity = {
  __typename?: 'UsersPermissionsPermissionEntity'
  attributes?: Maybe<UsersPermissionsPermission>
  id?: Maybe<Scalars['ID']['output']>
}

export type UsersPermissionsPermissionFiltersInput = {
  action?: InputMaybe<StringFilterInput>
  and?: InputMaybe<Array<InputMaybe<UsersPermissionsPermissionFiltersInput>>>
  createdAt?: InputMaybe<DateTimeFilterInput>
  id?: InputMaybe<IdFilterInput>
  not?: InputMaybe<UsersPermissionsPermissionFiltersInput>
  or?: InputMaybe<Array<InputMaybe<UsersPermissionsPermissionFiltersInput>>>
  role?: InputMaybe<UsersPermissionsRoleFiltersInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
}

export type UsersPermissionsPermissionRelationResponseCollection = {
  __typename?: 'UsersPermissionsPermissionRelationResponseCollection'
  data: Array<UsersPermissionsPermissionEntity>
}

export type UsersPermissionsRegisterInput = {
  email: Scalars['String']['input']
  password: Scalars['String']['input']
  username: Scalars['String']['input']
}

export type UsersPermissionsRole = {
  __typename?: 'UsersPermissionsRole'
  createdAt?: Maybe<Scalars['DateTime']['output']>
  description?: Maybe<Scalars['String']['output']>
  name: Scalars['String']['output']
  permissions?: Maybe<UsersPermissionsPermissionRelationResponseCollection>
  type?: Maybe<Scalars['String']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  users?: Maybe<UsersPermissionsUserRelationResponseCollection>
}

export type UsersPermissionsRolePermissionsArgs = {
  filters?: InputMaybe<UsersPermissionsPermissionFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type UsersPermissionsRoleUsersArgs = {
  filters?: InputMaybe<UsersPermissionsUserFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type UsersPermissionsRoleEntity = {
  __typename?: 'UsersPermissionsRoleEntity'
  attributes?: Maybe<UsersPermissionsRole>
  id?: Maybe<Scalars['ID']['output']>
}

export type UsersPermissionsRoleEntityResponse = {
  __typename?: 'UsersPermissionsRoleEntityResponse'
  data?: Maybe<UsersPermissionsRoleEntity>
}

export type UsersPermissionsRoleEntityResponseCollection = {
  __typename?: 'UsersPermissionsRoleEntityResponseCollection'
  data: Array<UsersPermissionsRoleEntity>
  meta: ResponseCollectionMeta
}

export type UsersPermissionsRoleFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<UsersPermissionsRoleFiltersInput>>>
  createdAt?: InputMaybe<DateTimeFilterInput>
  description?: InputMaybe<StringFilterInput>
  id?: InputMaybe<IdFilterInput>
  name?: InputMaybe<StringFilterInput>
  not?: InputMaybe<UsersPermissionsRoleFiltersInput>
  or?: InputMaybe<Array<InputMaybe<UsersPermissionsRoleFiltersInput>>>
  permissions?: InputMaybe<UsersPermissionsPermissionFiltersInput>
  type?: InputMaybe<StringFilterInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
  users?: InputMaybe<UsersPermissionsUserFiltersInput>
}

export type UsersPermissionsRoleInput = {
  description?: InputMaybe<Scalars['String']['input']>
  name?: InputMaybe<Scalars['String']['input']>
  permissions?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  type?: InputMaybe<Scalars['String']['input']>
  users?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
}

export type UsersPermissionsUpdateRolePayload = {
  __typename?: 'UsersPermissionsUpdateRolePayload'
  ok: Scalars['Boolean']['output']
}

export type UsersPermissionsUser = {
  __typename?: 'UsersPermissionsUser'
  blocked?: Maybe<Scalars['Boolean']['output']>
  confirmed?: Maybe<Scalars['Boolean']['output']>
  createdAt?: Maybe<Scalars['DateTime']['output']>
  email: Scalars['String']['output']
  provider?: Maybe<Scalars['String']['output']>
  role?: Maybe<UsersPermissionsRoleEntityResponse>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  username: Scalars['String']['output']
}

export type UsersPermissionsUserEntity = {
  __typename?: 'UsersPermissionsUserEntity'
  attributes?: Maybe<UsersPermissionsUser>
  id?: Maybe<Scalars['ID']['output']>
}

export type UsersPermissionsUserEntityResponse = {
  __typename?: 'UsersPermissionsUserEntityResponse'
  data?: Maybe<UsersPermissionsUserEntity>
}

export type UsersPermissionsUserEntityResponseCollection = {
  __typename?: 'UsersPermissionsUserEntityResponseCollection'
  data: Array<UsersPermissionsUserEntity>
  meta: ResponseCollectionMeta
}

export type UsersPermissionsUserFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<UsersPermissionsUserFiltersInput>>>
  blocked?: InputMaybe<BooleanFilterInput>
  confirmationToken?: InputMaybe<StringFilterInput>
  confirmed?: InputMaybe<BooleanFilterInput>
  createdAt?: InputMaybe<DateTimeFilterInput>
  email?: InputMaybe<StringFilterInput>
  id?: InputMaybe<IdFilterInput>
  not?: InputMaybe<UsersPermissionsUserFiltersInput>
  or?: InputMaybe<Array<InputMaybe<UsersPermissionsUserFiltersInput>>>
  password?: InputMaybe<StringFilterInput>
  provider?: InputMaybe<StringFilterInput>
  resetPasswordToken?: InputMaybe<StringFilterInput>
  role?: InputMaybe<UsersPermissionsRoleFiltersInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
  username?: InputMaybe<StringFilterInput>
}

export type UsersPermissionsUserInput = {
  blocked?: InputMaybe<Scalars['Boolean']['input']>
  confirmationToken?: InputMaybe<Scalars['String']['input']>
  confirmed?: InputMaybe<Scalars['Boolean']['input']>
  email?: InputMaybe<Scalars['String']['input']>
  password?: InputMaybe<Scalars['String']['input']>
  provider?: InputMaybe<Scalars['String']['input']>
  resetPasswordToken?: InputMaybe<Scalars['String']['input']>
  role?: InputMaybe<Scalars['ID']['input']>
  username?: InputMaybe<Scalars['String']['input']>
}

export type UsersPermissionsUserRelationResponseCollection = {
  __typename?: 'UsersPermissionsUserRelationResponseCollection'
  data: Array<UsersPermissionsUserEntity>
}

export type WebPageSummary = {
  __typename?: 'WebPageSummary'
  createdAt?: Maybe<Scalars['DateTime']['output']>
  keywords?: Maybe<Scalars['String']['output']>
  largeLanguageModel?: Maybe<Scalars['String']['output']>
  lastScrapeUpdate?: Maybe<Scalars['DateTime']['output']>
  locale?: Maybe<Scalars['String']['output']>
  localizations?: Maybe<WebPageSummaryRelationResponseCollection>
  proposal_for_summaries?: Maybe<ProposalForSummaryRelationResponseCollection>
  publishedAt?: Maybe<Scalars['DateTime']['output']>
  scraped_web_page?: Maybe<ScrapedWebPageEntityResponse>
  summary?: Maybe<Scalars['String']['output']>
  summary_feedbacks?: Maybe<SummaryFeedbackRelationResponseCollection>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type WebPageSummaryLocalizationsArgs = {
  filters?: InputMaybe<WebPageSummaryFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  publicationState?: InputMaybe<PublicationState>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type WebPageSummaryProposal_For_SummariesArgs = {
  filters?: InputMaybe<ProposalForSummaryFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type WebPageSummarySummary_FeedbacksArgs = {
  filters?: InputMaybe<SummaryFeedbackFiltersInput>
  pagination?: InputMaybe<PaginationArg>
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
}

export type WebPageSummaryEntity = {
  __typename?: 'WebPageSummaryEntity'
  attributes?: Maybe<WebPageSummary>
  id?: Maybe<Scalars['ID']['output']>
}

export type WebPageSummaryEntityResponse = {
  __typename?: 'WebPageSummaryEntityResponse'
  data?: Maybe<WebPageSummaryEntity>
}

export type WebPageSummaryEntityResponseCollection = {
  __typename?: 'WebPageSummaryEntityResponseCollection'
  data: Array<WebPageSummaryEntity>
  meta: ResponseCollectionMeta
}

export type WebPageSummaryFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<WebPageSummaryFiltersInput>>>
  createdAt?: InputMaybe<DateTimeFilterInput>
  id?: InputMaybe<IdFilterInput>
  keywords?: InputMaybe<StringFilterInput>
  largeLanguageModel?: InputMaybe<StringFilterInput>
  lastScrapeUpdate?: InputMaybe<DateTimeFilterInput>
  locale?: InputMaybe<StringFilterInput>
  localizations?: InputMaybe<WebPageSummaryFiltersInput>
  not?: InputMaybe<WebPageSummaryFiltersInput>
  or?: InputMaybe<Array<InputMaybe<WebPageSummaryFiltersInput>>>
  proposal_for_summaries?: InputMaybe<ProposalForSummaryFiltersInput>
  publishedAt?: InputMaybe<DateTimeFilterInput>
  scraped_web_page?: InputMaybe<ScrapedWebPageFiltersInput>
  summary?: InputMaybe<StringFilterInput>
  summary_feedbacks?: InputMaybe<SummaryFeedbackFiltersInput>
  updatedAt?: InputMaybe<DateTimeFilterInput>
}

export type WebPageSummaryInput = {
  keywords?: InputMaybe<Scalars['String']['input']>
  largeLanguageModel?: InputMaybe<Scalars['String']['input']>
  lastScrapeUpdate?: InputMaybe<Scalars['DateTime']['input']>
  proposal_for_summaries?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>
  scraped_web_page?: InputMaybe<Scalars['ID']['input']>
  summary?: InputMaybe<Scalars['String']['input']>
  summary_feedbacks?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
}

export type WebPageSummaryRelationResponseCollection = {
  __typename?: 'WebPageSummaryRelationResponseCollection'
  data: Array<WebPageSummaryEntity>
}

export type GetAllLocalesQueryVariables = Exact<{ [key: string]: never }>

export type GetAllLocalesQuery = {
  __typename?: 'Query'
  i18NLocales?: {
    __typename?: 'I18NLocaleEntityResponseCollection'
    data: Array<{
      __typename?: 'I18NLocaleEntity'
      id?: string | null
      attributes?: { __typename?: 'I18NLocale'; code?: string | null } | null
    }>
  } | null
}

export type GetScraperConfigurationQueryVariables = Exact<{
  [key: string]: never
}>

export type GetScraperConfigurationQuery = {
  __typename?: 'Query'
  scraperConfiguration?: {
    __typename?: 'ScraperConfigurationEntityResponse'
    data?: {
      __typename?: 'ScraperConfigurationEntity'
      attributes?: {
        __typename?: 'ScraperConfiguration'
        entryPoints?: Array<{
          __typename?: 'ComponentConfigurationScrapeEntryPoint'
          startUrl: string
          depth?: number | null
          prompts?: {
            __typename?: 'PromptRelationResponseCollection'
            data: Array<{ __typename?: 'PromptEntity'; id?: string | null }>
          } | null
        } | null> | null
      } | null
    } | null
  } | null
}

export type CreateSummaryFeedbackMutationVariables = Exact<{
  input: SummaryFeedbackInput
}>

export type CreateSummaryFeedbackMutation = {
  __typename?: 'Mutation'
  createSummaryFeedback?: {
    __typename?: 'SummaryFeedbackEntityResponse'
    data?: {
      __typename?: 'SummaryFeedbackEntity'
      id?: string | null
      attributes?: {
        __typename?: 'SummaryFeedback'
        selectedSummaryIndex?: number | null
        query?: string | null
        voting?: Enum_Summaryfeedback_Voting | null
        web_page_summary?: {
          __typename?: 'WebPageSummaryEntityResponse'
          data?: {
            __typename?: 'WebPageSummaryEntity'
            id?: string | null
          } | null
        } | null
      } | null
    } | null
  } | null
}

export type CreatePromptMutationVariables = Exact<{
  locale: Scalars['I18NLocaleCode']['input']
  summaryPrompt: Scalars['String']['input']
  keywordPrompt: Scalars['String']['input']
  llm: Scalars['String']['input']
}>

export type CreatePromptMutation = {
  __typename?: 'Mutation'
  createPrompt?: {
    __typename?: 'PromptEntityResponse'
    data?: { __typename?: 'PromptEntity'; id?: string | null } | null
  } | null
}

export type DeletePromptMutationVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type DeletePromptMutation = {
  __typename?: 'Mutation'
  deletePrompt?: {
    __typename?: 'PromptEntityResponse'
    data?: { __typename?: 'PromptEntity'; id?: string | null } | null
  } | null
}

export type GetDefaultPromptsQueryVariables = Exact<{ [key: string]: never }>

export type GetDefaultPromptsQuery = {
  __typename?: 'Query'
  prompts?: {
    __typename?: 'PromptEntityResponseCollection'
    data: Array<{ __typename?: 'PromptEntity'; id?: string | null }>
  } | null
}

export type CreateProposalForSummaryMutationVariables = Exact<{
  proposalSummary: Scalars['String']['input']
  summaryId: Scalars['ID']['input']
}>

export type CreateProposalForSummaryMutation = {
  __typename?: 'Mutation'
  createProposalForSummary?: {
    __typename?: 'ProposalForSummaryEntityResponse'
    data?: {
      __typename?: 'ProposalForSummaryEntity'
      id?: string | null
      attributes?: {
        __typename?: 'ProposalForSummary'
        proposalSummary?: string | null
        web_page_summary?: {
          __typename?: 'WebPageSummaryEntityResponse'
          data?: {
            __typename?: 'WebPageSummaryEntity'
            id?: string | null
          } | null
        } | null
      } | null
    } | null
  } | null
}

export type CreateScrapedWebPageMutationVariables = Exact<{
  data: ScrapedWebPageInput
}>

export type CreateScrapedWebPageMutation = {
  __typename?: 'Mutation'
  createScrapedWebPage?: {
    __typename?: 'ScrapedWebPageEntityResponse'
    data?: { __typename?: 'ScrapedWebPageEntity'; id?: string | null } | null
  } | null
}

export type GetAllScrapedWebPagesQueryVariables = Exact<{
  [key: string]: never
}>

export type GetAllScrapedWebPagesQuery = {
  __typename?: 'Query'
  scrapedWebPages?: {
    __typename?: 'ScrapedWebPageEntityResponseCollection'
    data: Array<{
      __typename?: 'ScrapedWebPageEntity'
      id?: string | null
      attributes?: {
        __typename?: 'ScrapedWebPage'
        originalContent?: string | null
        url?: string | null
        prompts?: {
          __typename?: 'PromptRelationResponseCollection'
          data: Array<{
            __typename?: 'PromptEntity'
            attributes?: {
              __typename?: 'Prompt'
              summaryPrompt?: string | null
              keywordPrompt?: string | null
              llm?: string | null
              locale?: string | null
            } | null
          }>
        } | null
      } | null
    }>
  } | null
}

export type GetScrapedWebPagesByUrlQueryVariables = Exact<{
  url: Scalars['String']['input']
}>

export type GetScrapedWebPagesByUrlQuery = {
  __typename?: 'Query'
  scrapedWebPages?: {
    __typename?: 'ScrapedWebPageEntityResponseCollection'
    data: Array<{
      __typename?: 'ScrapedWebPageEntity'
      id?: string | null
      attributes?: {
        __typename?: 'ScrapedWebPage'
        originalContent?: string | null
      } | null
    }>
  } | null
}

export type UpdateScrapedWebPageMutationVariables = Exact<{
  id: Scalars['ID']['input']
  data: ScrapedWebPageInput
}>

export type UpdateScrapedWebPageMutation = {
  __typename?: 'Mutation'
  updateScrapedWebPage?: {
    __typename?: 'ScrapedWebPageEntityResponse'
    data?: { __typename?: 'ScrapedWebPageEntity'; id?: string | null } | null
  } | null
}

export type CreateWebPageSummaryMutationVariables = Exact<{
  data: WebPageSummaryInput
  locale: Scalars['I18NLocaleCode']['input']
}>

export type CreateWebPageSummaryMutation = {
  __typename?: 'Mutation'
  createWebPageSummary?: {
    __typename?: 'WebPageSummaryEntityResponse'
    data?: {
      __typename?: 'WebPageSummaryEntity'
      id?: string | null
      attributes?: {
        __typename?: 'WebPageSummary'
        keywords?: string | null
        summary?: string | null
        largeLanguageModel?: string | null
        scraped_web_page?: {
          __typename?: 'ScrapedWebPageEntityResponse'
          data?: {
            __typename?: 'ScrapedWebPageEntity'
            id?: string | null
          } | null
        } | null
      } | null
    } | null
  } | null
}

export type GetOutdatedWebPageSummariesQueryVariables = Exact<{
  [key: string]: never
}>

export type GetOutdatedWebPageSummariesQuery = {
  __typename?: 'Query'
  webPageSummaries?: {
    __typename?: 'WebPageSummaryEntityResponseCollection'
    data: Array<{
      __typename?: 'WebPageSummaryEntity'
      id?: string | null
      attributes?: {
        __typename?: 'WebPageSummary'
        lastScrapeUpdate?: any | null
        locale?: string | null
        scraped_web_page?: {
          __typename?: 'ScrapedWebPageEntityResponse'
          data?: {
            __typename?: 'ScrapedWebPageEntity'
            id?: string | null
            attributes?: {
              __typename?: 'ScrapedWebPage'
              updatedAt?: any | null
              originalContent?: string | null
              prompts?: {
                __typename?: 'PromptRelationResponseCollection'
                data: Array<{
                  __typename?: 'PromptEntity'
                  attributes?: {
                    __typename?: 'Prompt'
                    summaryPrompt?: string | null
                    keywordPrompt?: string | null
                    llm?: string | null
                    locale?: string | null
                  } | null
                }>
              } | null
            } | null
          } | null
        } | null
      } | null
    }>
  } | null
}

export type GetWebPageSummariesQueryVariables = Exact<{ [key: string]: never }>

export type GetWebPageSummariesQuery = {
  __typename?: 'Query'
  webPageSummaries?: {
    __typename?: 'WebPageSummaryEntityResponseCollection'
    data: Array<{
      __typename?: 'WebPageSummaryEntity'
      id?: string | null
      attributes?: {
        __typename?: 'WebPageSummary'
        lastScrapeUpdate?: any | null
        locale?: string | null
        keywords?: string | null
        summary?: string | null
        largeLanguageModel?: string | null
        publishedAt?: any | null
        summary_feedbacks?: {
          __typename?: 'SummaryFeedbackRelationResponseCollection'
          data: Array<{
            __typename?: 'SummaryFeedbackEntity'
            attributes?: {
              __typename?: 'SummaryFeedback'
              createdAt?: any | null
              voting?: Enum_Summaryfeedback_Voting | null
            } | null
          }>
        } | null
        scraped_web_page?: {
          __typename?: 'ScrapedWebPageEntityResponse'
          data?: {
            __typename?: 'ScrapedWebPageEntity'
            attributes?: {
              __typename?: 'ScrapedWebPage'
              title?: string | null
              url?: string | null
              originalContent?: string | null
            } | null
          } | null
        } | null
      } | null
    }>
  } | null
}

export type GetWebPageSummariesByLanguageModelAndUrlQueryVariables = Exact<{
  languageModel: Scalars['String']['input']
  url: Scalars['String']['input']
  locale: Scalars['String']['input']
}>

export type GetWebPageSummariesByLanguageModelAndUrlQuery = {
  __typename?: 'Query'
  webPageSummaries?: {
    __typename?: 'WebPageSummaryEntityResponseCollection'
    data: Array<{ __typename?: 'WebPageSummaryEntity'; id?: string | null }>
  } | null
}

export type UpdateWebPageSummaryMutationVariables = Exact<{
  id: Scalars['ID']['input']
  data: WebPageSummaryInput
}>

export type UpdateWebPageSummaryMutation = {
  __typename?: 'Mutation'
  updateWebPageSummary?: {
    __typename?: 'WebPageSummaryEntityResponse'
    data?: {
      __typename?: 'WebPageSummaryEntity'
      id?: string | null
      attributes?: {
        __typename?: 'WebPageSummary'
        locale?: string | null
        keywords?: string | null
        summary?: string | null
        largeLanguageModel?: string | null
        scraped_web_page?: {
          __typename?: 'ScrapedWebPageEntityResponse'
          data?: {
            __typename?: 'ScrapedWebPageEntity'
            id?: string | null
          } | null
        } | null
      } | null
    } | null
  } | null
}

export const GetAllLocalesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetAllLocales' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'i18NLocales' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'data' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'attributes' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'code' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetAllLocalesQuery, GetAllLocalesQueryVariables>
export const GetScraperConfigurationDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetScraperConfiguration' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'scraperConfiguration' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'data' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'attributes' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'entryPoints' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'startUrl' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'depth' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'prompts' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'data' },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'id',
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetScraperConfigurationQuery,
  GetScraperConfigurationQueryVariables
>
export const CreateSummaryFeedbackDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateSummaryFeedback' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'SummaryFeedbackInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createSummaryFeedback' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'data' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'attributes' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'selectedSummaryIndex',
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'query' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'voting' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'web_page_summary' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'data' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateSummaryFeedbackMutation,
  CreateSummaryFeedbackMutationVariables
>
export const CreatePromptDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreatePrompt' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'locale' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'I18NLocaleCode' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'summaryPrompt' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'keywordPrompt' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'llm' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createPrompt' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'locale' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'summaryPrompt' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'summaryPrompt' },
                      },
                    },
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'keywordPrompt' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'keywordPrompt' },
                      },
                    },
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'llm' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'llm' },
                      },
                    },
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'isDefaultPrompt' },
                      value: { kind: 'BooleanValue', value: true },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'data' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreatePromptMutation,
  CreatePromptMutationVariables
>
export const DeletePromptDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeletePrompt' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deletePrompt' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'data' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeletePromptMutation,
  DeletePromptMutationVariables
>
export const GetDefaultPromptsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetDefaultPrompts' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'prompts' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: { kind: 'StringValue', value: 'all', block: false },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filters' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'isDefaultPrompt' },
                      value: {
                        kind: 'ObjectValue',
                        fields: [
                          {
                            kind: 'ObjectField',
                            name: { kind: 'Name', value: 'eq' },
                            value: { kind: 'BooleanValue', value: true },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'data' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetDefaultPromptsQuery,
  GetDefaultPromptsQueryVariables
>
export const CreateProposalForSummaryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateProposalForSummary' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'proposalSummary' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'summaryId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createProposalForSummary' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'proposalSummary' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'proposalSummary' },
                      },
                    },
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'web_page_summary' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'summaryId' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'data' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'attributes' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'proposalSummary' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'web_page_summary' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'data' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateProposalForSummaryMutation,
  CreateProposalForSummaryMutationVariables
>
export const CreateScrapedWebPageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateScrapedWebPage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'ScrapedWebPageInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createScrapedWebPage' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'data' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateScrapedWebPageMutation,
  CreateScrapedWebPageMutationVariables
>
export const GetAllScrapedWebPagesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetAllScrapedWebPages' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'scrapedWebPages' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'data' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'attributes' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'originalContent' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'url' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'prompts' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'data' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'attributes',
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'summaryPrompt',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'keywordPrompt',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'llm',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'locale',
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetAllScrapedWebPagesQuery,
  GetAllScrapedWebPagesQueryVariables
>
export const GetScrapedWebPagesByUrlDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetScrapedWebPagesByUrl' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'url' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'scrapedWebPages' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filters' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'url' },
                      value: {
                        kind: 'ObjectValue',
                        fields: [
                          {
                            kind: 'ObjectField',
                            name: { kind: 'Name', value: 'eq' },
                            value: {
                              kind: 'Variable',
                              name: { kind: 'Name', value: 'url' },
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'data' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'attributes' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'originalContent' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetScrapedWebPagesByUrlQuery,
  GetScrapedWebPagesByUrlQueryVariables
>
export const UpdateScrapedWebPageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateScrapedWebPage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'ScrapedWebPageInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateScrapedWebPage' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'data' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateScrapedWebPageMutation,
  UpdateScrapedWebPageMutationVariables
>
export const CreateWebPageSummaryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateWebPageSummary' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'WebPageSummaryInput' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'locale' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'I18NLocaleCode' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createWebPageSummary' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'locale' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'data' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'attributes' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'keywords' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'summary' },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'largeLanguageModel',
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'scraped_web_page' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'data' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateWebPageSummaryMutation,
  CreateWebPageSummaryMutationVariables
>
export const GetOutdatedWebPageSummariesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetOutdatedWebPageSummaries' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'webPageSummaries' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'publicationState' },
                value: { kind: 'EnumValue', value: 'PREVIEW' },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: { kind: 'StringValue', value: 'all', block: false },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'data' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'attributes' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'lastScrapeUpdate' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'locale' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'scraped_web_page' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'data' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'attributes',
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'updatedAt',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'originalContent',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'prompts',
                                                },
                                                selectionSet: {
                                                  kind: 'SelectionSet',
                                                  selections: [
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value: 'data',
                                                      },
                                                      selectionSet: {
                                                        kind: 'SelectionSet',
                                                        selections: [
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value:
                                                                'attributes',
                                                            },
                                                            selectionSet: {
                                                              kind: 'SelectionSet',
                                                              selections: [
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'summaryPrompt',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'keywordPrompt',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'llm',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'locale',
                                                                  },
                                                                },
                                                              ],
                                                            },
                                                          },
                                                        ],
                                                      },
                                                    },
                                                  ],
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetOutdatedWebPageSummariesQuery,
  GetOutdatedWebPageSummariesQueryVariables
>
export const GetWebPageSummariesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetWebPageSummaries' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'webPageSummaries' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'publicationState' },
                value: { kind: 'EnumValue', value: 'PREVIEW' },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: { kind: 'StringValue', value: 'all', block: false },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'data' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'attributes' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'lastScrapeUpdate' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'locale' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'keywords' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'summary' },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'largeLanguageModel',
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'publishedAt' },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'summary_feedbacks',
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'data' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'attributes',
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'createdAt',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'voting',
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'scraped_web_page' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'data' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'attributes',
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'title',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'url',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'originalContent',
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetWebPageSummariesQuery,
  GetWebPageSummariesQueryVariables
>
export const GetWebPageSummariesByLanguageModelAndUrlDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetWebPageSummariesByLanguageModelAndUrl' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'languageModel' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'url' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'locale' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'webPageSummaries' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'publicationState' },
                value: { kind: 'EnumValue', value: 'PREVIEW' },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: { kind: 'StringValue', value: 'all', block: false },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filters' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'largeLanguageModel' },
                      value: {
                        kind: 'ObjectValue',
                        fields: [
                          {
                            kind: 'ObjectField',
                            name: { kind: 'Name', value: 'eq' },
                            value: {
                              kind: 'Variable',
                              name: { kind: 'Name', value: 'languageModel' },
                            },
                          },
                        ],
                      },
                    },
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'scraped_web_page' },
                      value: {
                        kind: 'ObjectValue',
                        fields: [
                          {
                            kind: 'ObjectField',
                            name: { kind: 'Name', value: 'url' },
                            value: {
                              kind: 'ObjectValue',
                              fields: [
                                {
                                  kind: 'ObjectField',
                                  name: { kind: 'Name', value: 'eq' },
                                  value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'url' },
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    },
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'locale' },
                      value: {
                        kind: 'ObjectValue',
                        fields: [
                          {
                            kind: 'ObjectField',
                            name: { kind: 'Name', value: 'eq' },
                            value: {
                              kind: 'Variable',
                              name: { kind: 'Name', value: 'locale' },
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'data' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetWebPageSummariesByLanguageModelAndUrlQuery,
  GetWebPageSummariesByLanguageModelAndUrlQueryVariables
>
export const UpdateWebPageSummaryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateWebPageSummary' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'WebPageSummaryInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateWebPageSummary' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'data' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'attributes' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'locale' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'keywords' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'summary' },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'largeLanguageModel',
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'scraped_web_page' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'data' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateWebPageSummaryMutation,
  UpdateWebPageSummaryMutationVariables
>
