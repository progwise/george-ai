/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date string, such as 2007-12-03, compliant with the `full-date` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  Date: { input: any; output: any; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: any; output: any; }
  Decimal: { input: any; output: any; }
};

export type ChatAnswer = {
  __typename?: 'ChatAnswer';
  answer?: Maybe<Scalars['String']['output']>;
  notEnoughInformation?: Maybe<Scalars['Boolean']['output']>;
  sessionId?: Maybe<Scalars['String']['output']>;
  source?: Maybe<Scalars['String']['output']>;
};

export type Chatbot = {
  __typename?: 'Chatbot';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type ChatbotInput = {
  description: Scalars['String']['input'];
  icon: Scalars['String']['input'];
  name: Scalars['String']['input'];
  url: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  chat?: Maybe<ChatAnswer>;
  createChatbot?: Maybe<Chatbot>;
  createUser?: Maybe<User>;
  login?: Maybe<User>;
};


export type MutationChatArgs = {
  question: Scalars['String']['input'];
  retrievalFlow?: InputMaybe<RetrievalFlow>;
  sessionId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateChatbotArgs = {
  input: ChatbotInput;
  ownerName: Scalars['String']['input'];
};


export type MutationCreateUserArgs = {
  input: UserInput;
  username: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  jwtToken: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  chatbot?: Maybe<Chatbot>;
  chatbots?: Maybe<Array<Chatbot>>;
  user?: Maybe<User>;
};


export type QueryChatbotArgs = {
  id: Scalars['String']['input'];
};


export type QueryChatbotsArgs = {
  ownerId: Scalars['String']['input'];
};


export type QueryUserArgs = {
  email: Scalars['String']['input'];
};

export enum RetrievalFlow {
  OnlyLocal = 'OnlyLocal',
  OnlyWeb = 'OnlyWeb',
  Parallel = 'Parallel',
  Sequential = 'Sequential'
}

export type User = {
  __typename?: 'User';
  chatbots?: Maybe<Array<Chatbot>>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  family_name?: Maybe<Scalars['String']['output']>;
  given_name?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  lastLogin?: Maybe<Scalars['DateTime']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  username?: Maybe<Scalars['String']['output']>;
};

export type UserInput = {
  email: Scalars['String']['input'];
  family_name?: InputMaybe<Scalars['String']['input']>;
  given_name?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type LoginMutationVariables = Exact<{
  jwtToken: Scalars['String']['input'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login?: { __typename?: 'User', id?: string | null, email?: string | null, name?: string | null, given_name?: string | null, family_name?: string | null } | null };

export type ChatbotsQueryVariables = Exact<{
  ownerId: Scalars['String']['input'];
}>;


export type ChatbotsQuery = { __typename?: 'Query', chatbots?: Array<{ __typename?: 'Chatbot', id?: string | null, name?: string | null, description?: string | null, icon?: string | null }> | null };


export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jwtToken"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"jwtToken"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jwtToken"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"given_name"}},{"kind":"Field","name":{"kind":"Name","value":"family_name"}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const ChatbotsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Chatbots"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ownerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chatbots"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ownerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ownerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}}]}}]}}]} as unknown as DocumentNode<ChatbotsQuery, ChatbotsQueryVariables>;