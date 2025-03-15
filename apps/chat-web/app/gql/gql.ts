/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'

import * as types from './graphql'

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
  '\n  mutation login($jwtToken: String!) {\n    login(jwtToken: $jwtToken) {\n      id\n      username\n      email\n      name\n      given_name\n      family_name\n      createdAt\n    }\n  }\n': typeof types.LoginDocument
  '\n        mutation upsertAiBaseCases($assistantId: String!, $baseCases: [AiBaseCaseInputType!]!) {\n          upsertAiBaseCases(assistantId: $assistantId, baseCases: $baseCases) {\n            id\n            sequence\n            description\n          }\n        }\n      ': typeof types.UpsertAiBaseCasesDocument
  '\n  fragment AssistantBasecaseForm_assistantFragment on AiAssistant {\n    id\n    baseCases {\n      id\n      sequence\n      description\n    }\n  }\n': typeof types.AssistantBasecaseForm_AssistantFragmentFragmentDoc
  '\n  fragment AssistantCard_assistantFragment on AiAssistant {\n    id\n    name\n    description\n    iconUrl\n    ...AssistantDelete_assistantFragment\n  }\n': typeof types.AssistantCard_AssistantFragmentFragmentDoc
  '\n        mutation deleteAiAssistant($assistantId: String!) {\n          deleteAiAssistant(assistantId: $assistantId) {\n            id\n            name\n          }\n        }\n      ': typeof types.DeleteAiAssistantDocument
  '\n  fragment AssistantDelete_assistantFragment on AiAssistant {\n    id\n    name\n  }\n': typeof types.AssistantDelete_AssistantFragmentFragmentDoc
  '\n  fragment AssistantForm_assistant on AiAssistant {\n    id\n    name\n    iconUrl\n    description\n    ownerId\n    languageModelId\n    languageModel {\n      id\n      name\n    }\n    llmTemperature\n    baseCases {\n      id\n      sequence\n      description\n    }\n  }\n': typeof types.AssistantForm_AssistantFragmentDoc
  '\n  fragment AssistantForm_languageModel on AiLanguageModel {\n    id\n    name\n  }\n': typeof types.AssistantForm_LanguageModelFragmentDoc
  '\n        mutation updateAssistant($id: String!, $data: AiAssistantInput!) {\n          updateAiAssistant(id: $id, data: $data) {\n            id\n          }\n        }\n      ': typeof types.UpdateAssistantDocument
  '\n  fragment AssistantForLibrariesFragment on AiAssistant {\n    id\n  }\n': typeof types.AssistantForLibrariesFragmentFragmentDoc
  '\n  fragment AssistantLibrariesFragment on AiLibrary {\n    id\n    name\n  }\n': typeof types.AssistantLibrariesFragmentFragmentDoc
  '\n  fragment AssistantLibrariesUsageFragment on AiLibraryUsage {\n    id\n    assistantId\n    libraryId\n    usedFor\n    library {\n      id\n      name\n    }\n  }\n': typeof types.AssistantLibrariesUsageFragmentFragmentDoc
  '\n        mutation addLibraryUsage($assistantId: String!, $libraryId: String!) {\n          addLibraryUsage(assistantId: $assistantId, libraryId: $libraryId) {\n            id\n          }\n        }\n      ': typeof types.AddLibraryUsageDocument
  '\n        mutation removeLibraryUsage($assistantId: String!, $libraryId: String!) {\n          removeLibraryUsage(assistantId: $assistantId, libraryId: $libraryId) {\n            id\n          }\n        }\n      ': typeof types.RemoveLibraryUsageDocument
  '\n          mutation updateLibraryUsage($id: String!, $usedFor: String!) {\n            updateLibraryUsage(id: $id, usedFor: $usedFor) {\n              id\n            }\n          }\n        ': typeof types.UpdateLibraryUsageDocument
  '\n        mutation createAiAssistant($ownerId: String!, $name: String!) {\n          createAiAssistant(ownerId: $ownerId, name: $name) {\n            id\n            name\n          }\n        }\n      ': typeof types.CreateAiAssistantDocument
  '\n  fragment AssistantSelector_assistant on AiAssistant {\n    id\n    name\n  }\n': typeof types.AssistantSelector_AssistantFragmentDoc
  '\n  fragment ConversationForm_conversation on AiConversation {\n    id\n    assistants {\n      id\n      name\n    }\n  }\n': typeof types.ConversationForm_ConversationFragmentDoc
  '\n  fragment ConversationHistory_conversation on AiConversation {\n    id\n    messages {\n      id\n      sequenceNumber\n      content\n      source\n      createdAt\n      hidden\n      sender {\n        id\n        name\n        isBot\n        assistantId\n      }\n    }\n  }\n': typeof types.ConversationHistory_ConversationFragmentDoc
  '\n  mutation hideMessage($messageId: String!) {\n    hideMessage(messageId: $messageId) {\n      id\n      hidden\n    }\n  }\n': typeof types.HideMessageDocument
  '\n  mutation unhideMessage($messageId: String!) {\n    unhideMessage(messageId: $messageId) {\n      id\n      hidden\n    }\n  }\n': typeof types.UnhideMessageDocument
  '\n  fragment ConversationParticipants_conversation on AiConversation {\n    id\n    participants {\n      id\n      name\n      userId\n      assistantId\n    }\n  }\n': typeof types.ConversationParticipants_ConversationFragmentDoc
  '\n  fragment ConversationParticipants_HumanParticipationCandidates on User {\n    id\n    name\n    username\n  }\n': typeof types.ConversationParticipants_HumanParticipationCandidatesFragmentDoc
  '\n  fragment ConversationParticipants_AssistantParticipationCandidates on AiAssistant {\n    id\n    name\n  }\n': typeof types.ConversationParticipants_AssistantParticipationCandidatesFragmentDoc
  '\n  fragment ConversationSelector_conversations on AiConversation {\n    id\n    createdAt\n    assistants {\n      id\n      name\n    }\n  }\n': typeof types.ConversationSelector_ConversationsFragmentDoc
  '\n  fragment ConversationDelete_conversation on AiConversation {\n    id\n    createdAt\n    assistants {\n      name\n    }\n  }\n': typeof types.ConversationDelete_ConversationFragmentDoc
  '\n  fragment ConversationNew_HumanParticipationCandidates on User {\n    id\n    name\n    username\n  }\n': typeof types.ConversationNew_HumanParticipationCandidatesFragmentDoc
  '\n  fragment ConversationNew_AssistantParticipationCandidates on AiAssistant {\n    id\n    name\n  }\n': typeof types.ConversationNew_AssistantParticipationCandidatesFragmentDoc
  '\n  mutation prepareDesktopFile($file: AiLibraryFileInput!) {\n    prepareFile(data: $file) {\n      id\n    }\n  }\n': typeof types.PrepareDesktopFileDocument
  '\n  mutation clearEmbeddings($libraryId: String!) {\n    clearEmbeddedFiles(libraryId: $libraryId)\n  }\n': typeof types.ClearEmbeddingsDocument
  '\n  mutation dropFile($id: String!) {\n    dropFile(fileId: $id) {\n      id\n    }\n  }\n': typeof types.DropFileDocument
  '\n  mutation reProcessFile($id: String!) {\n    processFile(fileId: $id) {\n      id\n      chunks\n      size\n      uploadedAt\n      processedAt\n    }\n  }\n': typeof types.ReProcessFileDocument
  '\n  query EmbeddingsTable($libraryId: String!) {\n    aiLibraryFiles(libraryId: $libraryId) {\n      id\n      name\n      originUri\n      mimeType\n      size\n      chunks\n      uploadedAt\n      processedAt\n    }\n  }\n': typeof types.EmbeddingsTableDocument
  '\n  mutation prepareFile($file: AiLibraryFileInput!) {\n    prepareFile(data: $file) {\n      id\n    }\n  }\n': typeof types.PrepareFileDocument
  '\n  mutation processFile($fileId: String!) {\n    processFile(fileId: $fileId) {\n      id\n      chunks\n      size\n      uploadedAt\n      processedAt\n    }\n  }\n': typeof types.ProcessFileDocument
  '\n  fragment UserProfileForm_userProfile on UserProfile {\n    id\n    userId\n    email\n    firstName\n    lastName\n    freeMessages\n    usedMessages\n    freeStorage\n    usedStorage\n    createdAt\n    updatedAt\n    confirmationDate\n    expiresAt\n    business\n    position\n  }\n': typeof types.UserProfileForm_UserProfileFragmentDoc
  '\n        mutation saveUserProfile($userId: String!, $userProfileInput: UserProfileInput!) {\n          updateUserProfile(userId: $userId, input: $userProfileInput) {\n            id\n          }\n        }\n      ': typeof types.SaveUserProfileDocument
  '\n          query aiAssistantDetails($id: String!, $ownerId: String!) {\n            aiAssistant(id: $id) {\n              ...AssistantForm_assistant\n              ...AssistantSelector_assistant\n              ...AssistantForLibrariesFragment\n              ...AssistantBasecaseForm_assistantFragment\n            }\n            aiAssistants(ownerId: $ownerId) {\n              ...AssistantSelector_assistant\n            }\n            aiLibraryUsage(assistantId: $id) {\n              ...AssistantLibrariesUsageFragment\n            }\n            aiLibraries(ownerId: $ownerId) {\n              ...AssistantLibrariesFragment\n            }\n            aiLanguageModels {\n              ...AssistantForm_languageModel\n            }\n          }\n        ': typeof types.AiAssistantDetailsDocument
  '\n        query aiAssistantCards($ownerId: String!) {\n          aiAssistants(ownerId: $ownerId) {\n            id\n            ...AssistantCard_assistantFragment\n          }\n        }\n      ': typeof types.AiAssistantCardsDocument
  '\n  query getUserConversations($userId: String!) {\n    aiConversations(userId: $userId) {\n      id\n      ...ConversationSelector_conversations\n    }\n  }\n': typeof types.GetUserConversationsDocument
  '\n  query getConversation($conversationId: String!) {\n    aiConversation(conversationId: $conversationId) {\n      ...ConversationForm_conversation\n      ...ConversationParticipants_conversation\n      ...ConversationDelete_conversation\n      ...ConversationHistory_conversation\n    }\n  }\n': typeof types.GetConversationDocument
  '\n  query getAssignableUsers($userId: String!) {\n    myConversationUsers(userId: $userId) {\n      ...ConversationNew_HumanParticipationCandidates\n      ...ConversationParticipants_HumanParticipationCandidates\n    }\n  }\n': typeof types.GetAssignableUsersDocument
  '\n  query getAssignableAssistants($ownerId: String!) {\n    aiAssistants(ownerId: $ownerId) {\n      ...ConversationNew_AssistantParticipationCandidates\n      ...ConversationParticipants_AssistantParticipationCandidates\n    }\n  }\n': typeof types.GetAssignableAssistantsDocument
  '\n  query aiLibraryEdit($id: String!, $ownerId: String!) {\n    aiLibrary(id: $id) {\n      id\n      name\n      description\n      createdAt\n      ownerId\n      url\n    }\n    aiLibraries(ownerId: $ownerId) {\n      id\n      name\n    }\n  }\n': typeof types.AiLibraryEditDocument
  '\n  mutation changeAiLibrary($id: String!, $data: AiLibraryInput!) {\n    updateAiLibrary(id: $id, data: $data) {\n      id\n      name\n    }\n  }\n': typeof types.ChangeAiLibraryDocument
  '\n  query aiLibraries($ownerId: String!) {\n    aiLibraries(ownerId: $ownerId) {\n      id\n      name\n      owner {\n        id\n        name\n      }\n      createdAt\n      updatedAt\n    }\n  }\n': typeof types.AiLibrariesDocument
  '\n  mutation createAiLibrary($ownerId: String!, $data: AiLibraryInput!) {\n    createAiLibrary(ownerId: $ownerId, data: $data) {\n      id\n      name\n    }\n  }\n': typeof types.CreateAiLibraryDocument
  '\n  query userProfile($userId: String!) {\n    userProfile(userId: $userId) {\n      id\n      ...UserProfileForm_userProfile\n    }\n  }\n': typeof types.UserProfileDocument
  '\n  mutation createUserProfile($userId: String!) {\n    createUserProfile(userId: $userId) {\n      id\n    }\n  }\n': typeof types.CreateUserProfileDocument
  '\n  mutation removeUserProfile($userId: String!) {\n    removeUserProfile(userId: $userId) {\n      id\n    }\n  }\n': typeof types.RemoveUserProfileDocument
  '\n  query IntrospectionQuery {\n    __schema {\n      description\n      queryType {\n        name\n      }\n      mutationType {\n        name\n      }\n      subscriptionType {\n        name\n      }\n      types {\n        ...FullType\n      }\n      directives {\n        name\n        description\n        locations\n        args {\n          ...InputValue\n        }\n      }\n    }\n  }\n  fragment FullType on __Type {\n    kind\n    name\n    description\n    fields(includeDeprecated: true) {\n      name\n      description\n      args {\n        ...InputValue\n      }\n      type {\n        ...TypeRef\n      }\n      isDeprecated\n      deprecationReason\n    }\n    inputFields {\n      ...InputValue\n    }\n    interfaces {\n      ...TypeRef\n    }\n    enumValues(includeDeprecated: true) {\n      name\n      description\n      isDeprecated\n      deprecationReason\n    }\n    possibleTypes {\n      ...TypeRef\n    }\n  }\n  fragment InputValue on __InputValue {\n    name\n    description\n    type {\n      ...TypeRef\n    }\n    defaultValue\n  }\n  fragment TypeRef on __Type {\n    kind\n    name\n    ofType {\n      kind\n      name\n      ofType {\n        kind\n        name\n        ofType {\n          kind\n          name\n          ofType {\n            kind\n            name\n            ofType {\n              kind\n              name\n              ofType {\n                kind\n                name\n                ofType {\n                  kind\n                  name\n                  ofType {\n                    kind\n                    name\n                    ofType {\n                      kind\n                      name\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n': typeof types.IntrospectionQueryDocument
  '\n  mutation sendMessage($userId: String!, $data: AiConversationMessageInput!) {\n    sendMessage(userId: $userId, data: $data) {\n      id\n      createdAt\n    }\n  }\n': typeof types.SendMessageDocument
  '\n  mutation createConversation($data: AiConversationCreateInput!) {\n    createAiConversation(data: $data) {\n      id\n    }\n  }\n': typeof types.CreateConversationDocument
  '\n  mutation deleteConversation($conversationId: String!) {\n    deleteAiConversation(conversationId: $conversationId) {\n      id\n    }\n  }\n': typeof types.DeleteConversationDocument
  '\n  mutation addParticipant($conversationId: String!, $userIds: [String!], $assistantIds: [String!]) {\n    addConversationParticipants(conversationId: $conversationId, userIds: $userIds, assistantIds: $assistantIds) {\n      id\n    }\n  }\n': typeof types.AddParticipantDocument
  '\n  mutation removeParticipant($participantId: String!) {\n    removeConversationParticipant(id: $participantId) {\n      id\n    }\n  }\n': typeof types.RemoveParticipantDocument
  '\n  query myConversationUsers($userId: String!) {\n    myConversationUsers(userId: $userId) {\n      id\n      username\n      name\n      createdAt\n      email\n    }\n  }\n': typeof types.MyConversationUsersDocument
  '\n        mutation sendConfirmationMail($userId: String!, $confirmationUrl: String!) {\n          sendConfirmationMail(userId: $userId, confirmationUrl: $confirmationUrl)\n        }\n      ': typeof types.SendConfirmationMailDocument
  '\n        mutation confirmUserProfile($profileId: String!) {\n          confirmUserProfile(profileId: $profileId) {\n            id\n          }\n        }\n      ': typeof types.ConfirmUserProfileDocument
  '\n        query getUserProfile($userId: String!) {\n          userProfile(userId: $userId) {\n            id\n            email\n            firstName\n            lastName\n            business\n            position\n            freeMessages\n            usedMessages\n            freeStorage\n            usedStorage\n          }\n        }\n      ': typeof types.GetUserProfileDocument
}
const documents: Documents = {
  '\n  mutation login($jwtToken: String!) {\n    login(jwtToken: $jwtToken) {\n      id\n      username\n      email\n      name\n      given_name\n      family_name\n      createdAt\n    }\n  }\n':
    types.LoginDocument,
  '\n        mutation upsertAiBaseCases($assistantId: String!, $baseCases: [AiBaseCaseInputType!]!) {\n          upsertAiBaseCases(assistantId: $assistantId, baseCases: $baseCases) {\n            id\n            sequence\n            description\n          }\n        }\n      ':
    types.UpsertAiBaseCasesDocument,
  '\n  fragment AssistantBasecaseForm_assistantFragment on AiAssistant {\n    id\n    baseCases {\n      id\n      sequence\n      description\n    }\n  }\n':
    types.AssistantBasecaseForm_AssistantFragmentFragmentDoc,
  '\n  fragment AssistantCard_assistantFragment on AiAssistant {\n    id\n    name\n    description\n    iconUrl\n    ...AssistantDelete_assistantFragment\n  }\n':
    types.AssistantCard_AssistantFragmentFragmentDoc,
  '\n        mutation deleteAiAssistant($assistantId: String!) {\n          deleteAiAssistant(assistantId: $assistantId) {\n            id\n            name\n          }\n        }\n      ':
    types.DeleteAiAssistantDocument,
  '\n  fragment AssistantDelete_assistantFragment on AiAssistant {\n    id\n    name\n  }\n':
    types.AssistantDelete_AssistantFragmentFragmentDoc,
  '\n  fragment AssistantForm_assistant on AiAssistant {\n    id\n    name\n    iconUrl\n    description\n    ownerId\n    languageModelId\n    languageModel {\n      id\n      name\n    }\n    llmTemperature\n    baseCases {\n      id\n      sequence\n      description\n    }\n  }\n':
    types.AssistantForm_AssistantFragmentDoc,
  '\n  fragment AssistantForm_languageModel on AiLanguageModel {\n    id\n    name\n  }\n':
    types.AssistantForm_LanguageModelFragmentDoc,
  '\n        mutation updateAssistant($id: String!, $data: AiAssistantInput!) {\n          updateAiAssistant(id: $id, data: $data) {\n            id\n          }\n        }\n      ':
    types.UpdateAssistantDocument,
  '\n  fragment AssistantForLibrariesFragment on AiAssistant {\n    id\n  }\n':
    types.AssistantForLibrariesFragmentFragmentDoc,
  '\n  fragment AssistantLibrariesFragment on AiLibrary {\n    id\n    name\n  }\n':
    types.AssistantLibrariesFragmentFragmentDoc,
  '\n  fragment AssistantLibrariesUsageFragment on AiLibraryUsage {\n    id\n    assistantId\n    libraryId\n    usedFor\n    library {\n      id\n      name\n    }\n  }\n':
    types.AssistantLibrariesUsageFragmentFragmentDoc,
  '\n        mutation addLibraryUsage($assistantId: String!, $libraryId: String!) {\n          addLibraryUsage(assistantId: $assistantId, libraryId: $libraryId) {\n            id\n          }\n        }\n      ':
    types.AddLibraryUsageDocument,
  '\n        mutation removeLibraryUsage($assistantId: String!, $libraryId: String!) {\n          removeLibraryUsage(assistantId: $assistantId, libraryId: $libraryId) {\n            id\n          }\n        }\n      ':
    types.RemoveLibraryUsageDocument,
  '\n          mutation updateLibraryUsage($id: String!, $usedFor: String!) {\n            updateLibraryUsage(id: $id, usedFor: $usedFor) {\n              id\n            }\n          }\n        ':
    types.UpdateLibraryUsageDocument,
  '\n        mutation createAiAssistant($ownerId: String!, $name: String!) {\n          createAiAssistant(ownerId: $ownerId, name: $name) {\n            id\n            name\n          }\n        }\n      ':
    types.CreateAiAssistantDocument,
  '\n  fragment AssistantSelector_assistant on AiAssistant {\n    id\n    name\n  }\n':
    types.AssistantSelector_AssistantFragmentDoc,
  '\n  fragment ConversationForm_conversation on AiConversation {\n    id\n    assistants {\n      id\n      name\n    }\n  }\n':
    types.ConversationForm_ConversationFragmentDoc,
  '\n  fragment ConversationHistory_conversation on AiConversation {\n    id\n    messages {\n      id\n      sequenceNumber\n      content\n      source\n      createdAt\n      hidden\n      sender {\n        id\n        name\n        isBot\n        assistantId\n      }\n    }\n  }\n':
    types.ConversationHistory_ConversationFragmentDoc,
  '\n  mutation hideMessage($messageId: String!) {\n    hideMessage(messageId: $messageId) {\n      id\n      hidden\n    }\n  }\n':
    types.HideMessageDocument,
  '\n  mutation unhideMessage($messageId: String!) {\n    unhideMessage(messageId: $messageId) {\n      id\n      hidden\n    }\n  }\n':
    types.UnhideMessageDocument,
  '\n  fragment ConversationParticipants_conversation on AiConversation {\n    id\n    participants {\n      id\n      name\n      userId\n      assistantId\n    }\n  }\n':
    types.ConversationParticipants_ConversationFragmentDoc,
  '\n  fragment ConversationParticipants_HumanParticipationCandidates on User {\n    id\n    name\n    username\n  }\n':
    types.ConversationParticipants_HumanParticipationCandidatesFragmentDoc,
  '\n  fragment ConversationParticipants_AssistantParticipationCandidates on AiAssistant {\n    id\n    name\n  }\n':
    types.ConversationParticipants_AssistantParticipationCandidatesFragmentDoc,
  '\n  fragment ConversationSelector_conversations on AiConversation {\n    id\n    createdAt\n    assistants {\n      id\n      name\n    }\n  }\n':
    types.ConversationSelector_ConversationsFragmentDoc,
  '\n  fragment ConversationDelete_conversation on AiConversation {\n    id\n    createdAt\n    assistants {\n      name\n    }\n  }\n':
    types.ConversationDelete_ConversationFragmentDoc,
  '\n  fragment ConversationNew_HumanParticipationCandidates on User {\n    id\n    name\n    username\n  }\n':
    types.ConversationNew_HumanParticipationCandidatesFragmentDoc,
  '\n  fragment ConversationNew_AssistantParticipationCandidates on AiAssistant {\n    id\n    name\n  }\n':
    types.ConversationNew_AssistantParticipationCandidatesFragmentDoc,
  '\n  mutation prepareDesktopFile($file: AiLibraryFileInput!) {\n    prepareFile(data: $file) {\n      id\n    }\n  }\n':
    types.PrepareDesktopFileDocument,
  '\n  mutation clearEmbeddings($libraryId: String!) {\n    clearEmbeddedFiles(libraryId: $libraryId)\n  }\n':
    types.ClearEmbeddingsDocument,
  '\n  mutation dropFile($id: String!) {\n    dropFile(fileId: $id) {\n      id\n    }\n  }\n': types.DropFileDocument,
  '\n  mutation reProcessFile($id: String!) {\n    processFile(fileId: $id) {\n      id\n      chunks\n      size\n      uploadedAt\n      processedAt\n    }\n  }\n':
    types.ReProcessFileDocument,
  '\n  query EmbeddingsTable($libraryId: String!) {\n    aiLibraryFiles(libraryId: $libraryId) {\n      id\n      name\n      originUri\n      mimeType\n      size\n      chunks\n      uploadedAt\n      processedAt\n    }\n  }\n':
    types.EmbeddingsTableDocument,
  '\n  mutation prepareFile($file: AiLibraryFileInput!) {\n    prepareFile(data: $file) {\n      id\n    }\n  }\n':
    types.PrepareFileDocument,
  '\n  mutation processFile($fileId: String!) {\n    processFile(fileId: $fileId) {\n      id\n      chunks\n      size\n      uploadedAt\n      processedAt\n    }\n  }\n':
    types.ProcessFileDocument,
  '\n  fragment UserProfileForm_userProfile on UserProfile {\n    id\n    userId\n    email\n    firstName\n    lastName\n    freeMessages\n    usedMessages\n    freeStorage\n    usedStorage\n    createdAt\n    updatedAt\n    confirmationDate\n    expiresAt\n    business\n    position\n  }\n':
    types.UserProfileForm_UserProfileFragmentDoc,
  '\n        mutation saveUserProfile($userId: String!, $userProfileInput: UserProfileInput!) {\n          updateUserProfile(userId: $userId, input: $userProfileInput) {\n            id\n          }\n        }\n      ':
    types.SaveUserProfileDocument,
  '\n          query aiAssistantDetails($id: String!, $ownerId: String!) {\n            aiAssistant(id: $id) {\n              ...AssistantForm_assistant\n              ...AssistantSelector_assistant\n              ...AssistantForLibrariesFragment\n              ...AssistantBasecaseForm_assistantFragment\n            }\n            aiAssistants(ownerId: $ownerId) {\n              ...AssistantSelector_assistant\n            }\n            aiLibraryUsage(assistantId: $id) {\n              ...AssistantLibrariesUsageFragment\n            }\n            aiLibraries(ownerId: $ownerId) {\n              ...AssistantLibrariesFragment\n            }\n            aiLanguageModels {\n              ...AssistantForm_languageModel\n            }\n          }\n        ':
    types.AiAssistantDetailsDocument,
  '\n        query aiAssistantCards($ownerId: String!) {\n          aiAssistants(ownerId: $ownerId) {\n            id\n            ...AssistantCard_assistantFragment\n          }\n        }\n      ':
    types.AiAssistantCardsDocument,
  '\n  query getUserConversations($userId: String!) {\n    aiConversations(userId: $userId) {\n      id\n      ...ConversationSelector_conversations\n    }\n  }\n':
    types.GetUserConversationsDocument,
  '\n  query getConversation($conversationId: String!) {\n    aiConversation(conversationId: $conversationId) {\n      ...ConversationForm_conversation\n      ...ConversationParticipants_conversation\n      ...ConversationDelete_conversation\n      ...ConversationHistory_conversation\n    }\n  }\n':
    types.GetConversationDocument,
  '\n  query getAssignableUsers($userId: String!) {\n    myConversationUsers(userId: $userId) {\n      ...ConversationNew_HumanParticipationCandidates\n      ...ConversationParticipants_HumanParticipationCandidates\n    }\n  }\n':
    types.GetAssignableUsersDocument,
  '\n  query getAssignableAssistants($ownerId: String!) {\n    aiAssistants(ownerId: $ownerId) {\n      ...ConversationNew_AssistantParticipationCandidates\n      ...ConversationParticipants_AssistantParticipationCandidates\n    }\n  }\n':
    types.GetAssignableAssistantsDocument,
  '\n  query aiLibraryEdit($id: String!, $ownerId: String!) {\n    aiLibrary(id: $id) {\n      id\n      name\n      description\n      createdAt\n      ownerId\n      url\n    }\n    aiLibraries(ownerId: $ownerId) {\n      id\n      name\n    }\n  }\n':
    types.AiLibraryEditDocument,
  '\n  mutation changeAiLibrary($id: String!, $data: AiLibraryInput!) {\n    updateAiLibrary(id: $id, data: $data) {\n      id\n      name\n    }\n  }\n':
    types.ChangeAiLibraryDocument,
  '\n  query aiLibraries($ownerId: String!) {\n    aiLibraries(ownerId: $ownerId) {\n      id\n      name\n      owner {\n        id\n        name\n      }\n      createdAt\n      updatedAt\n    }\n  }\n':
    types.AiLibrariesDocument,
  '\n  mutation createAiLibrary($ownerId: String!, $data: AiLibraryInput!) {\n    createAiLibrary(ownerId: $ownerId, data: $data) {\n      id\n      name\n    }\n  }\n':
    types.CreateAiLibraryDocument,
  '\n  query userProfile($userId: String!) {\n    userProfile(userId: $userId) {\n      id\n      ...UserProfileForm_userProfile\n    }\n  }\n':
    types.UserProfileDocument,
  '\n  mutation createUserProfile($userId: String!) {\n    createUserProfile(userId: $userId) {\n      id\n    }\n  }\n':
    types.CreateUserProfileDocument,
  '\n  mutation removeUserProfile($userId: String!) {\n    removeUserProfile(userId: $userId) {\n      id\n    }\n  }\n':
    types.RemoveUserProfileDocument,
  '\n  query IntrospectionQuery {\n    __schema {\n      description\n      queryType {\n        name\n      }\n      mutationType {\n        name\n      }\n      subscriptionType {\n        name\n      }\n      types {\n        ...FullType\n      }\n      directives {\n        name\n        description\n        locations\n        args {\n          ...InputValue\n        }\n      }\n    }\n  }\n  fragment FullType on __Type {\n    kind\n    name\n    description\n    fields(includeDeprecated: true) {\n      name\n      description\n      args {\n        ...InputValue\n      }\n      type {\n        ...TypeRef\n      }\n      isDeprecated\n      deprecationReason\n    }\n    inputFields {\n      ...InputValue\n    }\n    interfaces {\n      ...TypeRef\n    }\n    enumValues(includeDeprecated: true) {\n      name\n      description\n      isDeprecated\n      deprecationReason\n    }\n    possibleTypes {\n      ...TypeRef\n    }\n  }\n  fragment InputValue on __InputValue {\n    name\n    description\n    type {\n      ...TypeRef\n    }\n    defaultValue\n  }\n  fragment TypeRef on __Type {\n    kind\n    name\n    ofType {\n      kind\n      name\n      ofType {\n        kind\n        name\n        ofType {\n          kind\n          name\n          ofType {\n            kind\n            name\n            ofType {\n              kind\n              name\n              ofType {\n                kind\n                name\n                ofType {\n                  kind\n                  name\n                  ofType {\n                    kind\n                    name\n                    ofType {\n                      kind\n                      name\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n':
    types.IntrospectionQueryDocument,
  '\n  mutation sendMessage($userId: String!, $data: AiConversationMessageInput!) {\n    sendMessage(userId: $userId, data: $data) {\n      id\n      createdAt\n    }\n  }\n':
    types.SendMessageDocument,
  '\n  mutation createConversation($data: AiConversationCreateInput!) {\n    createAiConversation(data: $data) {\n      id\n    }\n  }\n':
    types.CreateConversationDocument,
  '\n  mutation deleteConversation($conversationId: String!) {\n    deleteAiConversation(conversationId: $conversationId) {\n      id\n    }\n  }\n':
    types.DeleteConversationDocument,
  '\n  mutation addParticipant($conversationId: String!, $userIds: [String!], $assistantIds: [String!]) {\n    addConversationParticipants(conversationId: $conversationId, userIds: $userIds, assistantIds: $assistantIds) {\n      id\n    }\n  }\n':
    types.AddParticipantDocument,
  '\n  mutation removeParticipant($participantId: String!) {\n    removeConversationParticipant(id: $participantId) {\n      id\n    }\n  }\n':
    types.RemoveParticipantDocument,
  '\n  query myConversationUsers($userId: String!) {\n    myConversationUsers(userId: $userId) {\n      id\n      username\n      name\n      createdAt\n      email\n    }\n  }\n':
    types.MyConversationUsersDocument,
  '\n        mutation sendConfirmationMail($userId: String!, $confirmationUrl: String!) {\n          sendConfirmationMail(userId: $userId, confirmationUrl: $confirmationUrl)\n        }\n      ':
    types.SendConfirmationMailDocument,
  '\n        mutation confirmUserProfile($profileId: String!) {\n          confirmUserProfile(profileId: $profileId) {\n            id\n          }\n        }\n      ':
    types.ConfirmUserProfileDocument,
  '\n        query getUserProfile($userId: String!) {\n          userProfile(userId: $userId) {\n            id\n            email\n            firstName\n            lastName\n            business\n            position\n            freeMessages\n            usedMessages\n            freeStorage\n            usedStorage\n          }\n        }\n      ':
    types.GetUserProfileDocument,
}

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation login($jwtToken: String!) {\n    login(jwtToken: $jwtToken) {\n      id\n      username\n      email\n      name\n      given_name\n      family_name\n      createdAt\n    }\n  }\n',
): (typeof documents)['\n  mutation login($jwtToken: String!) {\n    login(jwtToken: $jwtToken) {\n      id\n      username\n      email\n      name\n      given_name\n      family_name\n      createdAt\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation upsertAiBaseCases($assistantId: String!, $baseCases: [AiBaseCaseInputType!]!) {\n          upsertAiBaseCases(assistantId: $assistantId, baseCases: $baseCases) {\n            id\n            sequence\n            description\n          }\n        }\n      ',
): (typeof documents)['\n        mutation upsertAiBaseCases($assistantId: String!, $baseCases: [AiBaseCaseInputType!]!) {\n          upsertAiBaseCases(assistantId: $assistantId, baseCases: $baseCases) {\n            id\n            sequence\n            description\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AssistantBasecaseForm_assistantFragment on AiAssistant {\n    id\n    baseCases {\n      id\n      sequence\n      description\n    }\n  }\n',
): (typeof documents)['\n  fragment AssistantBasecaseForm_assistantFragment on AiAssistant {\n    id\n    baseCases {\n      id\n      sequence\n      description\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AssistantCard_assistantFragment on AiAssistant {\n    id\n    name\n    description\n    iconUrl\n    ...AssistantDelete_assistantFragment\n  }\n',
): (typeof documents)['\n  fragment AssistantCard_assistantFragment on AiAssistant {\n    id\n    name\n    description\n    iconUrl\n    ...AssistantDelete_assistantFragment\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation deleteAiAssistant($assistantId: String!) {\n          deleteAiAssistant(assistantId: $assistantId) {\n            id\n            name\n          }\n        }\n      ',
): (typeof documents)['\n        mutation deleteAiAssistant($assistantId: String!) {\n          deleteAiAssistant(assistantId: $assistantId) {\n            id\n            name\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AssistantDelete_assistantFragment on AiAssistant {\n    id\n    name\n  }\n',
): (typeof documents)['\n  fragment AssistantDelete_assistantFragment on AiAssistant {\n    id\n    name\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AssistantForm_assistant on AiAssistant {\n    id\n    name\n    iconUrl\n    description\n    ownerId\n    languageModelId\n    languageModel {\n      id\n      name\n    }\n    llmTemperature\n    baseCases {\n      id\n      sequence\n      description\n    }\n  }\n',
): (typeof documents)['\n  fragment AssistantForm_assistant on AiAssistant {\n    id\n    name\n    iconUrl\n    description\n    ownerId\n    languageModelId\n    languageModel {\n      id\n      name\n    }\n    llmTemperature\n    baseCases {\n      id\n      sequence\n      description\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AssistantForm_languageModel on AiLanguageModel {\n    id\n    name\n  }\n',
): (typeof documents)['\n  fragment AssistantForm_languageModel on AiLanguageModel {\n    id\n    name\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation updateAssistant($id: String!, $data: AiAssistantInput!) {\n          updateAiAssistant(id: $id, data: $data) {\n            id\n          }\n        }\n      ',
): (typeof documents)['\n        mutation updateAssistant($id: String!, $data: AiAssistantInput!) {\n          updateAiAssistant(id: $id, data: $data) {\n            id\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AssistantForLibrariesFragment on AiAssistant {\n    id\n  }\n',
): (typeof documents)['\n  fragment AssistantForLibrariesFragment on AiAssistant {\n    id\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AssistantLibrariesFragment on AiLibrary {\n    id\n    name\n  }\n',
): (typeof documents)['\n  fragment AssistantLibrariesFragment on AiLibrary {\n    id\n    name\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AssistantLibrariesUsageFragment on AiLibraryUsage {\n    id\n    assistantId\n    libraryId\n    usedFor\n    library {\n      id\n      name\n    }\n  }\n',
): (typeof documents)['\n  fragment AssistantLibrariesUsageFragment on AiLibraryUsage {\n    id\n    assistantId\n    libraryId\n    usedFor\n    library {\n      id\n      name\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation addLibraryUsage($assistantId: String!, $libraryId: String!) {\n          addLibraryUsage(assistantId: $assistantId, libraryId: $libraryId) {\n            id\n          }\n        }\n      ',
): (typeof documents)['\n        mutation addLibraryUsage($assistantId: String!, $libraryId: String!) {\n          addLibraryUsage(assistantId: $assistantId, libraryId: $libraryId) {\n            id\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation removeLibraryUsage($assistantId: String!, $libraryId: String!) {\n          removeLibraryUsage(assistantId: $assistantId, libraryId: $libraryId) {\n            id\n          }\n        }\n      ',
): (typeof documents)['\n        mutation removeLibraryUsage($assistantId: String!, $libraryId: String!) {\n          removeLibraryUsage(assistantId: $assistantId, libraryId: $libraryId) {\n            id\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n          mutation updateLibraryUsage($id: String!, $usedFor: String!) {\n            updateLibraryUsage(id: $id, usedFor: $usedFor) {\n              id\n            }\n          }\n        ',
): (typeof documents)['\n          mutation updateLibraryUsage($id: String!, $usedFor: String!) {\n            updateLibraryUsage(id: $id, usedFor: $usedFor) {\n              id\n            }\n          }\n        ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation createAiAssistant($ownerId: String!, $name: String!) {\n          createAiAssistant(ownerId: $ownerId, name: $name) {\n            id\n            name\n          }\n        }\n      ',
): (typeof documents)['\n        mutation createAiAssistant($ownerId: String!, $name: String!) {\n          createAiAssistant(ownerId: $ownerId, name: $name) {\n            id\n            name\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AssistantSelector_assistant on AiAssistant {\n    id\n    name\n  }\n',
): (typeof documents)['\n  fragment AssistantSelector_assistant on AiAssistant {\n    id\n    name\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ConversationForm_conversation on AiConversation {\n    id\n    assistants {\n      id\n      name\n    }\n  }\n',
): (typeof documents)['\n  fragment ConversationForm_conversation on AiConversation {\n    id\n    assistants {\n      id\n      name\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ConversationHistory_conversation on AiConversation {\n    id\n    messages {\n      id\n      sequenceNumber\n      content\n      source\n      createdAt\n      hidden\n      sender {\n        id\n        name\n        isBot\n        assistantId\n      }\n    }\n  }\n',
): (typeof documents)['\n  fragment ConversationHistory_conversation on AiConversation {\n    id\n    messages {\n      id\n      sequenceNumber\n      content\n      source\n      createdAt\n      hidden\n      sender {\n        id\n        name\n        isBot\n        assistantId\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation hideMessage($messageId: String!) {\n    hideMessage(messageId: $messageId) {\n      id\n      hidden\n    }\n  }\n',
): (typeof documents)['\n  mutation hideMessage($messageId: String!) {\n    hideMessage(messageId: $messageId) {\n      id\n      hidden\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation unhideMessage($messageId: String!) {\n    unhideMessage(messageId: $messageId) {\n      id\n      hidden\n    }\n  }\n',
): (typeof documents)['\n  mutation unhideMessage($messageId: String!) {\n    unhideMessage(messageId: $messageId) {\n      id\n      hidden\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ConversationParticipants_conversation on AiConversation {\n    id\n    participants {\n      id\n      name\n      userId\n      assistantId\n    }\n  }\n',
): (typeof documents)['\n  fragment ConversationParticipants_conversation on AiConversation {\n    id\n    participants {\n      id\n      name\n      userId\n      assistantId\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ConversationParticipants_HumanParticipationCandidates on User {\n    id\n    name\n    username\n  }\n',
): (typeof documents)['\n  fragment ConversationParticipants_HumanParticipationCandidates on User {\n    id\n    name\n    username\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ConversationParticipants_AssistantParticipationCandidates on AiAssistant {\n    id\n    name\n  }\n',
): (typeof documents)['\n  fragment ConversationParticipants_AssistantParticipationCandidates on AiAssistant {\n    id\n    name\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ConversationSelector_conversations on AiConversation {\n    id\n    createdAt\n    assistants {\n      id\n      name\n    }\n  }\n',
): (typeof documents)['\n  fragment ConversationSelector_conversations on AiConversation {\n    id\n    createdAt\n    assistants {\n      id\n      name\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ConversationDelete_conversation on AiConversation {\n    id\n    createdAt\n    assistants {\n      name\n    }\n  }\n',
): (typeof documents)['\n  fragment ConversationDelete_conversation on AiConversation {\n    id\n    createdAt\n    assistants {\n      name\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ConversationNew_HumanParticipationCandidates on User {\n    id\n    name\n    username\n  }\n',
): (typeof documents)['\n  fragment ConversationNew_HumanParticipationCandidates on User {\n    id\n    name\n    username\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ConversationNew_AssistantParticipationCandidates on AiAssistant {\n    id\n    name\n  }\n',
): (typeof documents)['\n  fragment ConversationNew_AssistantParticipationCandidates on AiAssistant {\n    id\n    name\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation prepareDesktopFile($file: AiLibraryFileInput!) {\n    prepareFile(data: $file) {\n      id\n    }\n  }\n',
): (typeof documents)['\n  mutation prepareDesktopFile($file: AiLibraryFileInput!) {\n    prepareFile(data: $file) {\n      id\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation clearEmbeddings($libraryId: String!) {\n    clearEmbeddedFiles(libraryId: $libraryId)\n  }\n',
): (typeof documents)['\n  mutation clearEmbeddings($libraryId: String!) {\n    clearEmbeddedFiles(libraryId: $libraryId)\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation dropFile($id: String!) {\n    dropFile(fileId: $id) {\n      id\n    }\n  }\n',
): (typeof documents)['\n  mutation dropFile($id: String!) {\n    dropFile(fileId: $id) {\n      id\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation reProcessFile($id: String!) {\n    processFile(fileId: $id) {\n      id\n      chunks\n      size\n      uploadedAt\n      processedAt\n    }\n  }\n',
): (typeof documents)['\n  mutation reProcessFile($id: String!) {\n    processFile(fileId: $id) {\n      id\n      chunks\n      size\n      uploadedAt\n      processedAt\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query EmbeddingsTable($libraryId: String!) {\n    aiLibraryFiles(libraryId: $libraryId) {\n      id\n      name\n      originUri\n      mimeType\n      size\n      chunks\n      uploadedAt\n      processedAt\n    }\n  }\n',
): (typeof documents)['\n  query EmbeddingsTable($libraryId: String!) {\n    aiLibraryFiles(libraryId: $libraryId) {\n      id\n      name\n      originUri\n      mimeType\n      size\n      chunks\n      uploadedAt\n      processedAt\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation prepareFile($file: AiLibraryFileInput!) {\n    prepareFile(data: $file) {\n      id\n    }\n  }\n',
): (typeof documents)['\n  mutation prepareFile($file: AiLibraryFileInput!) {\n    prepareFile(data: $file) {\n      id\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation processFile($fileId: String!) {\n    processFile(fileId: $fileId) {\n      id\n      chunks\n      size\n      uploadedAt\n      processedAt\n    }\n  }\n',
): (typeof documents)['\n  mutation processFile($fileId: String!) {\n    processFile(fileId: $fileId) {\n      id\n      chunks\n      size\n      uploadedAt\n      processedAt\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment UserProfileForm_userProfile on UserProfile {\n    id\n    userId\n    email\n    firstName\n    lastName\n    freeMessages\n    usedMessages\n    freeStorage\n    usedStorage\n    createdAt\n    updatedAt\n    confirmationDate\n    expiresAt\n    business\n    position\n  }\n',
): (typeof documents)['\n  fragment UserProfileForm_userProfile on UserProfile {\n    id\n    userId\n    email\n    firstName\n    lastName\n    freeMessages\n    usedMessages\n    freeStorage\n    usedStorage\n    createdAt\n    updatedAt\n    confirmationDate\n    expiresAt\n    business\n    position\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation saveUserProfile($userId: String!, $userProfileInput: UserProfileInput!) {\n          updateUserProfile(userId: $userId, input: $userProfileInput) {\n            id\n          }\n        }\n      ',
): (typeof documents)['\n        mutation saveUserProfile($userId: String!, $userProfileInput: UserProfileInput!) {\n          updateUserProfile(userId: $userId, input: $userProfileInput) {\n            id\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n          query aiAssistantDetails($id: String!, $ownerId: String!) {\n            aiAssistant(id: $id) {\n              ...AssistantForm_assistant\n              ...AssistantSelector_assistant\n              ...AssistantForLibrariesFragment\n              ...AssistantBasecaseForm_assistantFragment\n            }\n            aiAssistants(ownerId: $ownerId) {\n              ...AssistantSelector_assistant\n            }\n            aiLibraryUsage(assistantId: $id) {\n              ...AssistantLibrariesUsageFragment\n            }\n            aiLibraries(ownerId: $ownerId) {\n              ...AssistantLibrariesFragment\n            }\n            aiLanguageModels {\n              ...AssistantForm_languageModel\n            }\n          }\n        ',
): (typeof documents)['\n          query aiAssistantDetails($id: String!, $ownerId: String!) {\n            aiAssistant(id: $id) {\n              ...AssistantForm_assistant\n              ...AssistantSelector_assistant\n              ...AssistantForLibrariesFragment\n              ...AssistantBasecaseForm_assistantFragment\n            }\n            aiAssistants(ownerId: $ownerId) {\n              ...AssistantSelector_assistant\n            }\n            aiLibraryUsage(assistantId: $id) {\n              ...AssistantLibrariesUsageFragment\n            }\n            aiLibraries(ownerId: $ownerId) {\n              ...AssistantLibrariesFragment\n            }\n            aiLanguageModels {\n              ...AssistantForm_languageModel\n            }\n          }\n        ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        query aiAssistantCards($ownerId: String!) {\n          aiAssistants(ownerId: $ownerId) {\n            id\n            ...AssistantCard_assistantFragment\n          }\n        }\n      ',
): (typeof documents)['\n        query aiAssistantCards($ownerId: String!) {\n          aiAssistants(ownerId: $ownerId) {\n            id\n            ...AssistantCard_assistantFragment\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getUserConversations($userId: String!) {\n    aiConversations(userId: $userId) {\n      id\n      ...ConversationSelector_conversations\n    }\n  }\n',
): (typeof documents)['\n  query getUserConversations($userId: String!) {\n    aiConversations(userId: $userId) {\n      id\n      ...ConversationSelector_conversations\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getConversation($conversationId: String!) {\n    aiConversation(conversationId: $conversationId) {\n      ...ConversationForm_conversation\n      ...ConversationParticipants_conversation\n      ...ConversationDelete_conversation\n      ...ConversationHistory_conversation\n    }\n  }\n',
): (typeof documents)['\n  query getConversation($conversationId: String!) {\n    aiConversation(conversationId: $conversationId) {\n      ...ConversationForm_conversation\n      ...ConversationParticipants_conversation\n      ...ConversationDelete_conversation\n      ...ConversationHistory_conversation\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getAssignableUsers($userId: String!) {\n    myConversationUsers(userId: $userId) {\n      ...ConversationNew_HumanParticipationCandidates\n      ...ConversationParticipants_HumanParticipationCandidates\n    }\n  }\n',
): (typeof documents)['\n  query getAssignableUsers($userId: String!) {\n    myConversationUsers(userId: $userId) {\n      ...ConversationNew_HumanParticipationCandidates\n      ...ConversationParticipants_HumanParticipationCandidates\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getAssignableAssistants($ownerId: String!) {\n    aiAssistants(ownerId: $ownerId) {\n      ...ConversationNew_AssistantParticipationCandidates\n      ...ConversationParticipants_AssistantParticipationCandidates\n    }\n  }\n',
): (typeof documents)['\n  query getAssignableAssistants($ownerId: String!) {\n    aiAssistants(ownerId: $ownerId) {\n      ...ConversationNew_AssistantParticipationCandidates\n      ...ConversationParticipants_AssistantParticipationCandidates\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query aiLibraryEdit($id: String!, $ownerId: String!) {\n    aiLibrary(id: $id) {\n      id\n      name\n      description\n      createdAt\n      ownerId\n      url\n    }\n    aiLibraries(ownerId: $ownerId) {\n      id\n      name\n    }\n  }\n',
): (typeof documents)['\n  query aiLibraryEdit($id: String!, $ownerId: String!) {\n    aiLibrary(id: $id) {\n      id\n      name\n      description\n      createdAt\n      ownerId\n      url\n    }\n    aiLibraries(ownerId: $ownerId) {\n      id\n      name\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation changeAiLibrary($id: String!, $data: AiLibraryInput!) {\n    updateAiLibrary(id: $id, data: $data) {\n      id\n      name\n    }\n  }\n',
): (typeof documents)['\n  mutation changeAiLibrary($id: String!, $data: AiLibraryInput!) {\n    updateAiLibrary(id: $id, data: $data) {\n      id\n      name\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query aiLibraries($ownerId: String!) {\n    aiLibraries(ownerId: $ownerId) {\n      id\n      name\n      owner {\n        id\n        name\n      }\n      createdAt\n      updatedAt\n    }\n  }\n',
): (typeof documents)['\n  query aiLibraries($ownerId: String!) {\n    aiLibraries(ownerId: $ownerId) {\n      id\n      name\n      owner {\n        id\n        name\n      }\n      createdAt\n      updatedAt\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation createAiLibrary($ownerId: String!, $data: AiLibraryInput!) {\n    createAiLibrary(ownerId: $ownerId, data: $data) {\n      id\n      name\n    }\n  }\n',
): (typeof documents)['\n  mutation createAiLibrary($ownerId: String!, $data: AiLibraryInput!) {\n    createAiLibrary(ownerId: $ownerId, data: $data) {\n      id\n      name\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query userProfile($userId: String!) {\n    userProfile(userId: $userId) {\n      id\n      ...UserProfileForm_userProfile\n    }\n  }\n',
): (typeof documents)['\n  query userProfile($userId: String!) {\n    userProfile(userId: $userId) {\n      id\n      ...UserProfileForm_userProfile\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation createUserProfile($userId: String!) {\n    createUserProfile(userId: $userId) {\n      id\n    }\n  }\n',
): (typeof documents)['\n  mutation createUserProfile($userId: String!) {\n    createUserProfile(userId: $userId) {\n      id\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation removeUserProfile($userId: String!) {\n    removeUserProfile(userId: $userId) {\n      id\n    }\n  }\n',
): (typeof documents)['\n  mutation removeUserProfile($userId: String!) {\n    removeUserProfile(userId: $userId) {\n      id\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query IntrospectionQuery {\n    __schema {\n      description\n      queryType {\n        name\n      }\n      mutationType {\n        name\n      }\n      subscriptionType {\n        name\n      }\n      types {\n        ...FullType\n      }\n      directives {\n        name\n        description\n        locations\n        args {\n          ...InputValue\n        }\n      }\n    }\n  }\n  fragment FullType on __Type {\n    kind\n    name\n    description\n    fields(includeDeprecated: true) {\n      name\n      description\n      args {\n        ...InputValue\n      }\n      type {\n        ...TypeRef\n      }\n      isDeprecated\n      deprecationReason\n    }\n    inputFields {\n      ...InputValue\n    }\n    interfaces {\n      ...TypeRef\n    }\n    enumValues(includeDeprecated: true) {\n      name\n      description\n      isDeprecated\n      deprecationReason\n    }\n    possibleTypes {\n      ...TypeRef\n    }\n  }\n  fragment InputValue on __InputValue {\n    name\n    description\n    type {\n      ...TypeRef\n    }\n    defaultValue\n  }\n  fragment TypeRef on __Type {\n    kind\n    name\n    ofType {\n      kind\n      name\n      ofType {\n        kind\n        name\n        ofType {\n          kind\n          name\n          ofType {\n            kind\n            name\n            ofType {\n              kind\n              name\n              ofType {\n                kind\n                name\n                ofType {\n                  kind\n                  name\n                  ofType {\n                    kind\n                    name\n                    ofType {\n                      kind\n                      name\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n',
): (typeof documents)['\n  query IntrospectionQuery {\n    __schema {\n      description\n      queryType {\n        name\n      }\n      mutationType {\n        name\n      }\n      subscriptionType {\n        name\n      }\n      types {\n        ...FullType\n      }\n      directives {\n        name\n        description\n        locations\n        args {\n          ...InputValue\n        }\n      }\n    }\n  }\n  fragment FullType on __Type {\n    kind\n    name\n    description\n    fields(includeDeprecated: true) {\n      name\n      description\n      args {\n        ...InputValue\n      }\n      type {\n        ...TypeRef\n      }\n      isDeprecated\n      deprecationReason\n    }\n    inputFields {\n      ...InputValue\n    }\n    interfaces {\n      ...TypeRef\n    }\n    enumValues(includeDeprecated: true) {\n      name\n      description\n      isDeprecated\n      deprecationReason\n    }\n    possibleTypes {\n      ...TypeRef\n    }\n  }\n  fragment InputValue on __InputValue {\n    name\n    description\n    type {\n      ...TypeRef\n    }\n    defaultValue\n  }\n  fragment TypeRef on __Type {\n    kind\n    name\n    ofType {\n      kind\n      name\n      ofType {\n        kind\n        name\n        ofType {\n          kind\n          name\n          ofType {\n            kind\n            name\n            ofType {\n              kind\n              name\n              ofType {\n                kind\n                name\n                ofType {\n                  kind\n                  name\n                  ofType {\n                    kind\n                    name\n                    ofType {\n                      kind\n                      name\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation sendMessage($userId: String!, $data: AiConversationMessageInput!) {\n    sendMessage(userId: $userId, data: $data) {\n      id\n      createdAt\n    }\n  }\n',
): (typeof documents)['\n  mutation sendMessage($userId: String!, $data: AiConversationMessageInput!) {\n    sendMessage(userId: $userId, data: $data) {\n      id\n      createdAt\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation createConversation($data: AiConversationCreateInput!) {\n    createAiConversation(data: $data) {\n      id\n    }\n  }\n',
): (typeof documents)['\n  mutation createConversation($data: AiConversationCreateInput!) {\n    createAiConversation(data: $data) {\n      id\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation deleteConversation($conversationId: String!) {\n    deleteAiConversation(conversationId: $conversationId) {\n      id\n    }\n  }\n',
): (typeof documents)['\n  mutation deleteConversation($conversationId: String!) {\n    deleteAiConversation(conversationId: $conversationId) {\n      id\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation addParticipant($conversationId: String!, $userIds: [String!], $assistantIds: [String!]) {\n    addConversationParticipants(conversationId: $conversationId, userIds: $userIds, assistantIds: $assistantIds) {\n      id\n    }\n  }\n',
): (typeof documents)['\n  mutation addParticipant($conversationId: String!, $userIds: [String!], $assistantIds: [String!]) {\n    addConversationParticipants(conversationId: $conversationId, userIds: $userIds, assistantIds: $assistantIds) {\n      id\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation removeParticipant($participantId: String!) {\n    removeConversationParticipant(id: $participantId) {\n      id\n    }\n  }\n',
): (typeof documents)['\n  mutation removeParticipant($participantId: String!) {\n    removeConversationParticipant(id: $participantId) {\n      id\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query myConversationUsers($userId: String!) {\n    myConversationUsers(userId: $userId) {\n      id\n      username\n      name\n      createdAt\n      email\n    }\n  }\n',
): (typeof documents)['\n  query myConversationUsers($userId: String!) {\n    myConversationUsers(userId: $userId) {\n      id\n      username\n      name\n      createdAt\n      email\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation sendConfirmationMail($userId: String!, $confirmationUrl: String!) {\n          sendConfirmationMail(userId: $userId, confirmationUrl: $confirmationUrl)\n        }\n      ',
): (typeof documents)['\n        mutation sendConfirmationMail($userId: String!, $confirmationUrl: String!) {\n          sendConfirmationMail(userId: $userId, confirmationUrl: $confirmationUrl)\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation confirmUserProfile($profileId: String!) {\n          confirmUserProfile(profileId: $profileId) {\n            id\n          }\n        }\n      ',
): (typeof documents)['\n        mutation confirmUserProfile($profileId: String!) {\n          confirmUserProfile(profileId: $profileId) {\n            id\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        query getUserProfile($userId: String!) {\n          userProfile(userId: $userId) {\n            id\n            email\n            firstName\n            lastName\n            business\n            position\n            freeMessages\n            usedMessages\n            freeStorage\n            usedStorage\n          }\n        }\n      ',
): (typeof documents)['\n        query getUserProfile($userId: String!) {\n          userProfile(userId: $userId) {\n            id\n            email\n            firstName\n            lastName\n            business\n            position\n            freeMessages\n            usedMessages\n            freeStorage\n            usedStorage\n          }\n        }\n      ']

export function graphql(source: string) {
  return (documents as any)[source] ?? {}
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never
