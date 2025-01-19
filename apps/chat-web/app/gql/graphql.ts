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

export type AiAssistant = {
  __typename?: 'AiAssistant';
  aiAssistantType: AiAssistantType;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  ownerId: Scalars['ID']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type AiAssistantInput = {
  aiAssistantType: AiAssistantType;
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  url?: InputMaybe<Scalars['String']['input']>;
};

/** Type of the AiAssistant */
export enum AiAssistantType {
  Chatbot = 'CHATBOT',
  DocumentGenerator = 'DOCUMENT_GENERATOR'
}

export type ChatAnswer = {
  __typename?: 'ChatAnswer';
  answer?: Maybe<Scalars['String']['output']>;
  notEnoughInformation?: Maybe<Scalars['Boolean']['output']>;
  sessionId?: Maybe<Scalars['String']['output']>;
  source?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  chat?: Maybe<ChatAnswer>;
  createAiAssistant?: Maybe<AiAssistant>;
  createUser?: Maybe<User>;
  deleteAiAssistant?: Maybe<AiAssistant>;
  login?: Maybe<User>;
  updateAiAssistant?: Maybe<AiAssistant>;
};


export type MutationChatArgs = {
  question: Scalars['String']['input'];
  retrievalFlow?: InputMaybe<RetrievalFlow>;
  sessionId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateAiAssistantArgs = {
  input: AiAssistantInput;
  ownerId: Scalars['String']['input'];
};


export type MutationCreateUserArgs = {
  input: UserInput;
  username: Scalars['String']['input'];
};


export type MutationDeleteAiAssistantArgs = {
  assistantId: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  jwtToken: Scalars['String']['input'];
};


export type MutationUpdateAiAssistantArgs = {
  id: Scalars['String']['input'];
  input: AiAssistantInput;
};

export type Query = {
  __typename?: 'Query';
  aiAssistant?: Maybe<AiAssistant>;
  aiAssistants?: Maybe<Array<AiAssistant>>;
  user?: Maybe<User>;
};


export type QueryAiAssistantArgs = {
  id: Scalars['String']['input'];
};


export type QueryAiAssistantsArgs = {
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
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  family_name?: Maybe<Scalars['String']['output']>;
  given_name?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastLogin?: Maybe<Scalars['DateTime']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  username: Scalars['String']['output'];
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


export type LoginMutation = { __typename?: 'Mutation', login?: { __typename?: 'User', id: string, username: string, email: string, name?: string | null, given_name?: string | null, family_name?: string | null, createdAt: any } | null };

export type DeleteAiAssistantMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type DeleteAiAssistantMutation = { __typename?: 'Mutation', deleteAiAssistant?: { __typename?: 'AiAssistant', id: string } | null };

export type AiAssistantEditQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type AiAssistantEditQuery = { __typename?: 'Query', aiAssistant?: { __typename?: 'AiAssistant', id: string, name: string, description?: string | null, icon?: string | null, createdAt: any, ownerId: string, aiAssistantType: AiAssistantType, url?: string | null } | null };

export type ChangeAiAssistantMutationVariables = Exact<{
  id: Scalars['String']['input'];
  assistant: AiAssistantInput;
}>;


export type ChangeAiAssistantMutation = { __typename?: 'Mutation', updateAiAssistant?: { __typename?: 'AiAssistant', id: string, name: string } | null };

export type AiAssistantCardsQueryVariables = Exact<{
  ownerId: Scalars['String']['input'];
}>;


export type AiAssistantCardsQuery = { __typename?: 'Query', aiAssistants?: Array<{ __typename?: 'AiAssistant', id: string, name: string, description?: string | null, icon?: string | null, aiAssistantType: AiAssistantType, createdAt: any, ownerId: string }> | null };

export type CreateAiAssistantMutationVariables = Exact<{
  ownerId: Scalars['String']['input'];
  assistant: AiAssistantInput;
}>;


export type CreateAiAssistantMutation = { __typename?: 'Mutation', createAiAssistant?: { __typename?: 'AiAssistant', id: string, name: string } | null };


export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jwtToken"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"jwtToken"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jwtToken"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"given_name"}},{"kind":"Field","name":{"kind":"Name","value":"family_name"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const DeleteAiAssistantDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deleteAiAssistant"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteAiAssistant"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assistantId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteAiAssistantMutation, DeleteAiAssistantMutationVariables>;
export const AiAssistantEditDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"aiAssistantEdit"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"aiAssistant"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}},{"kind":"Field","name":{"kind":"Name","value":"aiAssistantType"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]} as unknown as DocumentNode<AiAssistantEditQuery, AiAssistantEditQueryVariables>;
export const ChangeAiAssistantDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"changeAiAssistant"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assistant"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AiAssistantInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateAiAssistant"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assistant"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<ChangeAiAssistantMutation, ChangeAiAssistantMutationVariables>;
export const AiAssistantCardsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"aiAssistantCards"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ownerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"aiAssistants"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ownerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ownerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"aiAssistantType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}}]}}]}}]} as unknown as DocumentNode<AiAssistantCardsQuery, AiAssistantCardsQueryVariables>;
export const CreateAiAssistantDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createAiAssistant"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ownerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assistant"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AiAssistantInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createAiAssistant"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ownerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ownerId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assistant"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<CreateAiAssistantMutation, CreateAiAssistantMutationVariables>;