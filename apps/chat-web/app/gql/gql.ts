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
  '\n  mutation login($jwtToken: String!) {\n    login(jwtToken: $jwtToken) {\n      id\n      username\n      email\n      name\n      given_name\n      family_name\n      createdAt\n      isAdmin\n    }\n  }\n': typeof types.LoginDocument
  '\n  fragment AssistantSurvey_Assessment on AiActAssessment {\n    assistantId\n\n    assistantSurvey {\n      actionsTitle {\n        de\n        en\n      }\n      actions {\n        level\n        description {\n          de\n          en\n        }\n      }\n      questions {\n        id\n        ...QuestionCard_question\n      }\n      title {\n        de\n        en\n      }\n      percentCompleted\n      hint {\n        de\n        en\n      }\n      riskIndicator {\n        description {\n          de\n          en\n        }\n        level\n      }\n    }\n  }\n': typeof types.AssistantSurvey_AssessmentFragmentDoc
  '\n        query AiActAssessmentQuery($assistantId: String!) {\n          aiActAssessment(assistantId: $assistantId) {\n            ...RiskAreasIdentification_Assessment\n            ...AssistantSurvey_Assessment\n          }\n        }\n      ': typeof types.AiActAssessmentQueryDocument
  '\n        mutation updateAssessmentQuestion($assistantId: String!, $questionId: String!, $value: String, $notes: String) {\n          updateAssessmentQuestion(assistantId: $assistantId, questionId: $questionId, value: $value, notes: $notes)\n        }\n      ': typeof types.UpdateAssessmentQuestionDocument
  '\n        mutation resetAssessmentAnswers($assistantId: String!) {\n          resetAssessmentAnswers(assistantId: $assistantId)\n        }\n      ': typeof types.ResetAssessmentAnswersDocument
  '\n  fragment ComplianceArea_Compliance on AiActComplianceArea {\n    title {\n      de\n      en\n    }\n    description {\n      de\n      en\n    }\n    mandatory\n  }\n': typeof types.ComplianceArea_ComplianceFragmentDoc
  '\n  fragment QuestionCard_question on AiActQuestion {\n    id\n    title {\n      de\n      en\n    }\n    notes\n    value\n    hint {\n      de\n      en\n    }\n    options {\n      id\n      title {\n        de\n        en\n      }\n    }\n  }\n': typeof types.QuestionCard_QuestionFragmentDoc
  '\n  fragment RiskAreasIdentification_Assessment on AiActAssessment {\n    identifyRiskInfo {\n      title {\n        de\n        en\n      }\n      legalDisclaimer {\n        title {\n          de\n          en\n        }\n        text {\n          de\n          en\n        }\n      }\n      complianceAreas {\n        id\n        ...ComplianceArea_Compliance\n      }\n    }\n    assistantSurvey {\n      questions {\n        id\n        title {\n          de\n          en\n        }\n        notes\n        value\n        options {\n          id\n          title {\n            de\n            en\n          }\n        }\n      }\n      riskIndicator {\n        description {\n          de\n          en\n        }\n        factors {\n          de\n          en\n        }\n        level\n      }\n    }\n  }\n': typeof types.RiskAreasIdentification_AssessmentFragmentDoc
  '\n        mutation upsertAiBaseCases($assistantId: String!, $baseCases: [AiBaseCaseInputType!]!) {\n          upsertAiBaseCases(assistantId: $assistantId, baseCases: $baseCases) {\n            id\n            sequence\n            condition\n            instruction\n          }\n        }\n      ': typeof types.UpsertAiBaseCasesDocument
  '\n  fragment AssistantBasecaseForm_Assistant on AiAssistant {\n    id\n    baseCases {\n      id\n      sequence\n      condition\n      instruction\n    }\n  }\n': typeof types.AssistantBasecaseForm_AssistantFragmentDoc
  '\n  fragment AssistantCard_Assistant on AiAssistant {\n    id\n    name\n    description\n    iconUrl\n    ...AssistantDelete_Assistant\n  }\n': typeof types.AssistantCard_AssistantFragmentDoc
  '\n        mutation deleteAiAssistant($assistantId: String!) {\n          deleteAiAssistant(assistantId: $assistantId) {\n            id\n            name\n          }\n        }\n      ': typeof types.DeleteAiAssistantDocument
  '\n  fragment AssistantDelete_Assistant on AiAssistant {\n    id\n    name\n  }\n': typeof types.AssistantDelete_AssistantFragmentDoc
  '\n  fragment AssistantForm_Assistant on AiAssistant {\n    id\n    name\n    iconUrl\n    description\n    ownerId\n    languageModel\n    updatedAt\n  }\n': typeof types.AssistantForm_AssistantFragmentDoc
  '\n        mutation updateAssistant($id: String!, $data: AiAssistantInput!) {\n          updateAiAssistant(id: $id, data: $data) {\n            id\n          }\n        }\n      ': typeof types.UpdateAssistantDocument
  '\n  fragment AssistantIcon_assistantFragment on AiAssistant {\n    id\n    name\n    updatedAt\n    iconUrl\n  }\n': typeof types.AssistantIcon_AssistantFragmentFragmentDoc
  '\n  fragment AssistantLibraries_Assistant on AiAssistant {\n    id\n    ownerId\n  }\n': typeof types.AssistantLibraries_AssistantFragmentDoc
  '\n  fragment AssistantLibraries_Library on AiLibrary {\n    id\n    name\n  }\n': typeof types.AssistantLibraries_LibraryFragmentDoc
  '\n  fragment AssistantLibraries_LibraryUsage on AiLibraryUsage {\n    id\n    assistantId\n    libraryId\n    usedFor\n    library {\n      id\n      name\n    }\n  }\n': typeof types.AssistantLibraries_LibraryUsageFragmentDoc
  '\n        mutation addLibraryUsage($assistantId: String!, $libraryId: String!) {\n          addLibraryUsage(assistantId: $assistantId, libraryId: $libraryId) {\n            id\n          }\n        }\n      ': typeof types.AddLibraryUsageDocument
  '\n        mutation removeLibraryUsage($assistantId: String!, $libraryId: String!) {\n          removeLibraryUsage(assistantId: $assistantId, libraryId: $libraryId) {\n            id\n          }\n        }\n      ': typeof types.RemoveLibraryUsageDocument
  '\n          mutation updateLibraryUsage($id: String!, $usedFor: String!) {\n            updateLibraryUsage(id: $id, usedFor: $usedFor) {\n              id\n            }\n          }\n        ': typeof types.UpdateLibraryUsageDocument
  '\n        mutation createAiAssistant($ownerId: String!, $name: String!) {\n          createAiAssistant(ownerId: $ownerId, name: $name) {\n            id\n            name\n          }\n        }\n      ': typeof types.CreateAiAssistantDocument
  '\n  fragment AssistantParticipantsDialogButton_Assistant on AiAssistant {\n    id\n    ownerId\n    participants {\n      id\n    }\n  }\n': typeof types.AssistantParticipantsDialogButton_AssistantFragmentDoc
  '\n  fragment AssistantParticipants_Assistant on AiAssistant {\n    id\n    ownerId\n    participants {\n      id\n      name\n      username\n    }\n    ...AssistantParticipantsDialogButton_Assistant\n  }\n': typeof types.AssistantParticipants_AssistantFragmentDoc
  '\n  fragment AssistantSelector_Assistant on AiAssistant {\n    id\n    name\n  }\n': typeof types.AssistantSelector_AssistantFragmentDoc
  '\n  fragment ConversationForm_Conversation on AiConversation {\n    id\n    assistants {\n      id\n      name\n    }\n  }\n': typeof types.ConversationForm_ConversationFragmentDoc
  '\n  fragment ConversationHistory_Conversation on AiConversation {\n    id\n    messages {\n      id\n      sequenceNumber\n      content\n      source\n      createdAt\n      hidden\n      sender {\n        id\n        name\n        isBot\n        assistantId\n      }\n    }\n  }\n': typeof types.ConversationHistory_ConversationFragmentDoc
  '\n  mutation hideMessage($messageId: String!) {\n    hideMessage(messageId: $messageId) {\n      id\n      hidden\n    }\n  }\n': typeof types.HideMessageDocument
  '\n  mutation unhideMessage($messageId: String!) {\n    unhideMessage(messageId: $messageId) {\n      id\n      hidden\n    }\n  }\n': typeof types.UnhideMessageDocument
  '\n  fragment ConversationParticipantsDialogButton_Conversation on AiConversation {\n    id\n    ownerId\n    participants {\n      id\n      userId\n      assistantId\n    }\n  }\n': typeof types.ConversationParticipantsDialogButton_ConversationFragmentDoc
  '\n  fragment ConversationParticipantsDialogButton_Assistant on AiAssistant {\n    id\n    name\n  }\n': typeof types.ConversationParticipantsDialogButton_AssistantFragmentDoc
  '\n  fragment ConversationParticipants_Conversation on AiConversation {\n    id\n    ownerId\n    participants {\n      id\n      name\n      userId\n      assistantId\n    }\n    ...ConversationParticipantsDialogButton_Conversation\n  }\n': typeof types.ConversationParticipants_ConversationFragmentDoc
  '\n  fragment ConversationParticipants_Assistant on AiAssistant {\n    ...ConversationParticipantsDialogButton_Assistant\n  }\n': typeof types.ConversationParticipants_AssistantFragmentDoc
  '\n  fragment ConversationSelector_Conversation on AiConversation {\n    id\n    createdAt\n    owner {\n      id\n      name\n    }\n    assistants {\n      id\n      name\n    }\n  }\n': typeof types.ConversationSelector_ConversationFragmentDoc
  '\n  fragment ConversationDelete_Conversation on AiConversation {\n    id\n    ownerId\n    createdAt\n    assistants {\n      name\n    }\n    participants {\n      id\n      userId\n    }\n  }\n': typeof types.ConversationDelete_ConversationFragmentDoc
  '\n  fragment NewConversationSelector_Assistant on AiAssistant {\n    ...ConversationParticipantsDialogButton_Assistant\n  }\n': typeof types.NewConversationSelector_AssistantFragmentDoc
  '\n        mutation createContactRequest($name: String!, $emailOrPhone: String!, $message: String!) {\n          createContactRequest(name: $name, emailOrPhone: $emailOrPhone, message: $message)\n        }\n      ': typeof types.CreateContactRequestDocument
  '\n      query version {\n        version\n      }\n    ': typeof types.VersionDocument
  '\n        mutation createAiLibraryCrawler($libraryId: String!, $data: AiLibraryCrawlerInput!) {\n          createAiLibraryCrawler(libraryId: $libraryId, data: $data) {\n            id\n          }\n        }\n      ': typeof types.CreateAiLibraryCrawlerDocument
  '\n  fragment CrawlerTable_Library on AiLibrary {\n    crawlers {\n      id\n      url\n      maxDepth\n      maxPages\n      lastRun\n      cronJob {\n        cronExpression\n      }\n      filesCount\n      ...RunCrawlerButton_Crawler\n      ...UpdateCrawlerButton_Crawler\n    }\n  }\n': typeof types.CrawlerTable_LibraryFragmentDoc
  '\n        mutation deleteCrawler($id: String!) {\n          deleteAiLibraryCrawler(id: $id) {\n            id\n          }\n        }\n      ': typeof types.DeleteCrawlerDocument
  '\n        query CrawlerTable($libraryId: String!) {\n          aiLibrary(id: $libraryId) {\n            ...CrawlerTable_Library\n          }\n        }\n      ': typeof types.CrawlerTableDocument
  '\n  fragment RunCrawlerButton_Crawler on AiLibraryCrawler {\n    id\n    isRunning\n  }\n': typeof types.RunCrawlerButton_CrawlerFragmentDoc
  '\n        mutation runCrawler($crawlerId: String!, $userId: String!) {\n          runAiLibraryCrawler(crawlerId: $crawlerId, userId: $userId) {\n            id\n            lastRun\n          }\n        }\n      ': typeof types.RunCrawlerDocument
  '\n  fragment UpdateCrawlerButton_Crawler on AiLibraryCrawler {\n    id\n    url\n    maxDepth\n    maxPages\n    cronJob {\n      id\n      active\n      hour\n      minute\n      monday\n      tuesday\n      wednesday\n      thursday\n      friday\n      saturday\n      sunday\n    }\n  }\n': typeof types.UpdateCrawlerButton_CrawlerFragmentDoc
  '\n        mutation updateAiLibraryCrawler($id: String!, $data: AiLibraryCrawlerInput!) {\n          updateAiLibraryCrawler(id: $id, data: $data) {\n            id\n          }\n        }\n      ': typeof types.UpdateAiLibraryCrawlerDocument
  '\n  mutation dropFiles($libraryId: String!) {\n    dropFiles(libraryId: $libraryId) {\n      id\n      libraryId\n    }\n  }\n': typeof types.DropFilesDocument
  '\n  mutation deleteAiLibrary($id: String!) {\n    deleteAiLibrary(id: $id) {\n      id\n    }\n  }\n': typeof types.DeleteAiLibraryDocument
  '\n  fragment DeleteLibraryDialog_Library on AiLibrary {\n    id\n    name\n    ownerId\n    filesCount\n    createdAt\n    description\n    url\n  }\n': typeof types.DeleteLibraryDialog_LibraryFragmentDoc
  '\n  mutation prepareDesktopFile($file: AiLibraryFileInput!) {\n    prepareFile(data: $file) {\n      id\n    }\n  }\n': typeof types.PrepareDesktopFileDocument
  '\n        mutation cancelFileUpload($fileId: String!) {\n          cancelFileUpload(fileId: $fileId)\n        }\n      ': typeof types.CancelFileUploadDocument
  '\n          mutation dropFile($id: String!) {\n            dropFile(fileId: $id) {\n              id\n            }\n          }\n        ': typeof types.DropFileDocument
  '\n          mutation reProcessFile($id: String!) {\n            processFile(fileId: $id) {\n              id\n              chunks\n              size\n              uploadedAt\n              processedAt\n              processingErrorMessage\n            }\n          }\n        ': typeof types.ReProcessFileDocument
  '\n        query EmbeddingsTable($libraryId: String!) {\n          aiLibraryFiles(libraryId: $libraryId) {\n            id\n            name\n            originUri\n            mimeType\n            size\n            chunks\n            uploadedAt\n            processedAt\n            processingErrorMessage\n            dropError\n          }\n        }\n      ': typeof types.EmbeddingsTableDocument
  '\n  query aiLibraries($userId: String!) {\n    aiLibraries(userId: $userId) {\n      id\n      name\n      owner {\n        id\n        name\n      }\n      createdAt\n      updatedAt\n    }\n  }\n': typeof types.AiLibrariesDocument
  '\n  query aiLibraryDetails($id: String!) {\n    aiLibrary(id: $id) {\n      id\n      name\n      ...LibraryFormFragment\n      ...DeleteLibraryDialog_Library\n      ...LibraryParticipants_Library\n    }\n  }\n': typeof types.AiLibraryDetailsDocument
  '\n  mutation prepareFile($file: AiLibraryFileInput!) {\n    prepareFile(data: $file) {\n      id\n    }\n  }\n': typeof types.PrepareFileDocument
  '\n  mutation processFile($fileId: String!) {\n    processFile(fileId: $fileId) {\n      id\n      chunks\n      size\n      uploadedAt\n      processedAt\n    }\n  }\n': typeof types.ProcessFileDocument
  '\n  fragment LibraryFormFragment on AiLibrary {\n    id\n    name\n    description\n  }\n': typeof types.LibraryFormFragmentFragmentDoc
  '\n        mutation createAiLibrary($ownerId: String!, $data: AiLibraryInput!) {\n          createAiLibrary(ownerId: $ownerId, data: $data) {\n            id\n            name\n          }\n        }\n      ': typeof types.CreateAiLibraryDocument
  '\n  fragment LibraryParticipantsDialogButton_Library on AiLibrary {\n    id\n    ownerId\n    participants {\n      id\n    }\n  }\n': typeof types.LibraryParticipantsDialogButton_LibraryFragmentDoc
  '\n  fragment LibraryParticipants_Library on AiLibrary {\n    id\n    ownerId\n    participants {\n      id\n      name\n      username\n    }\n    ...LibraryParticipantsDialogButton_Library\n  }\n': typeof types.LibraryParticipants_LibraryFragmentDoc
  '\n  fragment UserProfileForm_UserProfile on UserProfile {\n    id\n    userId\n    email\n    firstName\n    lastName\n    freeMessages\n    usedMessages\n    freeStorage\n    usedStorage\n    createdAt\n    updatedAt\n    confirmationDate\n    activationDate\n    expiresAt\n    business\n    position\n  }\n': typeof types.UserProfileForm_UserProfileFragmentDoc
  '\n        mutation saveUserProfile($userId: String!, $userProfileInput: UserProfileInput!) {\n          updateUserProfile(userId: $userId, input: $userProfileInput) {\n            id\n          }\n        }\n      ': typeof types.SaveUserProfileDocument
  '\n        query aiAssistantCards($userId: String!) {\n          aiAssistants(userId: $userId) {\n            id\n            ...AssistantCard_Assistant\n          }\n        }\n      ': typeof types.AiAssistantCardsDocument
  '\n  query getUserConversations($userId: String!) {\n    aiConversations(userId: $userId) {\n      id\n      ...ConversationSelector_Conversation\n    }\n  }\n': typeof types.GetUserConversationsDocument
  '\n  query getConversation($conversationId: String!) {\n    aiConversation(conversationId: $conversationId) {\n      ...ConversationParticipants_Conversation\n      ...ConversationDelete_Conversation\n      ...ConversationHistory_Conversation\n      ...ConversationForm_Conversation\n      ...ConversationParticipantsDialogButton_Conversation\n    }\n  }\n': typeof types.GetConversationDocument
  '\n  query getAssignableAssistants($userId: String!) {\n    aiAssistants(userId: $userId) {\n      ...NewConversationSelector_Assistant\n      ...ConversationParticipants_Assistant\n      ...ConversationParticipantsDialogButton_Assistant\n    }\n  }\n': typeof types.GetAssignableAssistantsDocument
  '\n  mutation changeAiLibrary($id: String!, $data: AiLibraryInput!) {\n    updateAiLibrary(id: $id, data: $data) {\n      id\n      name\n    }\n  }\n': typeof types.ChangeAiLibraryDocument
  '\n  query userProfile($userId: String!) {\n    userProfile(userId: $userId) {\n      id\n      confirmationDate\n      ...UserProfileForm_UserProfile\n    }\n  }\n': typeof types.UserProfileDocument
  '\n  mutation createUserProfile($userId: String!) {\n    createUserProfile(userId: $userId) {\n      id\n    }\n  }\n': typeof types.CreateUserProfileDocument
  '\n  mutation removeUserProfile($userId: String!) {\n    removeUserProfile(userId: $userId) {\n      id\n    }\n  }\n': typeof types.RemoveUserProfileDocument
  '\n          query aiAssistantDetails($id: String!, $userId: String!) {\n            aiAssistant(id: $id) {\n              ...AssistantForm_Assistant\n              ...AssistantSelector_Assistant\n              ...AssistantLibraries_Assistant\n              ...AssistantBasecaseForm_Assistant\n              ...AssistantParticipants_Assistant\n            }\n            aiAssistants(userId: $userId) {\n              ...AssistantSelector_Assistant\n            }\n            aiLibraryUsage(assistantId: $id) {\n              ...AssistantLibraries_LibraryUsage\n            }\n            aiLibraries(userId: $userId) {\n              ...AssistantLibraries_Library\n            }\n          }\n        ': typeof types.AiAssistantDetailsDocument
  '\n  mutation addAssistantParticipant($assistantId: String!, $userIds: [String!]!, $currentUserId: String!) {\n    addAssistantParticipants(assistantId: $assistantId, userIds: $userIds, currentUserId: $currentUserId) {\n      id\n    }\n  }\n': typeof types.AddAssistantParticipantDocument
  '\n  mutation removeAssistantParticipant($userId: String!, $assistantId: String!, $currentUserId: String!) {\n    removeAssistantParticipant(userId: $userId, assistantId: $assistantId, currentUserId: $currentUserId) {\n      id\n    }\n  }\n': typeof types.RemoveAssistantParticipantDocument
  '\n  query IntrospectionQuery {\n    __schema {\n      description\n      queryType {\n        name\n      }\n      mutationType {\n        name\n      }\n      subscriptionType {\n        name\n      }\n      types {\n        ...FullType\n      }\n      directives {\n        name\n        description\n        locations\n        args {\n          ...InputValue\n        }\n      }\n    }\n  }\n  fragment FullType on __Type {\n    kind\n    name\n    description\n    fields(includeDeprecated: true) {\n      name\n      description\n      args {\n        ...InputValue\n      }\n      type {\n        ...TypeRef\n      }\n      isDeprecated\n      deprecationReason\n    }\n    inputFields {\n      ...InputValue\n    }\n    interfaces {\n      ...TypeRef\n    }\n    enumValues(includeDeprecated: true) {\n      name\n      description\n      isDeprecated\n      deprecationReason\n    }\n    possibleTypes {\n      ...TypeRef\n    }\n  }\n  fragment InputValue on __InputValue {\n    name\n    description\n    type {\n      ...TypeRef\n    }\n    defaultValue\n  }\n  fragment TypeRef on __Type {\n    kind\n    name\n    ofType {\n      kind\n      name\n      ofType {\n        kind\n        name\n        ofType {\n          kind\n          name\n          ofType {\n            kind\n            name\n            ofType {\n              kind\n              name\n              ofType {\n                kind\n                name\n                ofType {\n                  kind\n                  name\n                  ofType {\n                    kind\n                    name\n                    ofType {\n                      kind\n                      name\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n': typeof types.IntrospectionQueryDocument
  '\n  mutation addConversationParticipant($conversationId: String!, $userIds: [String!], $assistantIds: [String!]) {\n    addConversationParticipants(conversationId: $conversationId, userIds: $userIds, assistantIds: $assistantIds) {\n      id\n    }\n  }\n': typeof types.AddConversationParticipantDocument
  '\n  mutation removeConversationParticipant($participantId: String!) {\n    removeConversationParticipant(id: $participantId) {\n      id\n    }\n  }\n': typeof types.RemoveConversationParticipantDocument
  '\n  mutation createConversationInvitations(\n    $conversationId: String!\n    $inviterId: String!\n    $data: [ConversationInvitationInput!]!\n  ) {\n    createConversationInvitations(conversationId: $conversationId, inviterId: $inviterId, data: $data) {\n      id\n    }\n  }\n': typeof types.CreateConversationInvitationsDocument
  '\n  mutation confirmInvitation($conversationId: String!, $invitationId: String!, $userId: String!, $email: String) {\n    confirmConversationInvitation(\n      conversationId: $conversationId\n      invitationId: $invitationId\n      userId: $userId\n      email: $email\n    ) {\n      id\n    }\n  }\n': typeof types.ConfirmInvitationDocument
  '\n  mutation sendMessage($userId: String!, $data: AiConversationMessageInput!) {\n    sendMessage(userId: $userId, data: $data) {\n      id\n      createdAt\n    }\n  }\n': typeof types.SendMessageDocument
  '\n  mutation createConversation($ownerId: String!, $data: AiConversationCreateInput!) {\n    createAiConversation(ownerId: $ownerId, data: $data) {\n      id\n    }\n  }\n': typeof types.CreateConversationDocument
  '\n  mutation deleteConversation($conversationId: String!) {\n    deleteAiConversation(conversationId: $conversationId) {\n      id\n    }\n  }\n': typeof types.DeleteConversationDocument
  '\n        mutation removeConversations($conversationIds: [String!]!, $userId: String!) {\n          removeAiConversations(conversationIds: $conversationIds, userId: $userId)\n        }\n      ': typeof types.RemoveConversationsDocument
  '\n  mutation leaveConversation($participantId: String!) {\n    leaveAiConversation(id: $participantId) {\n      id\n    }\n  }\n': typeof types.LeaveConversationDocument
  '\n  mutation addLibraryParticipant($libraryId: String!, $userIds: [String!]!) {\n    addLibraryParticipants(libraryId: $libraryId, userIds: $userIds) {\n      id\n    }\n  }\n': typeof types.AddLibraryParticipantDocument
  '\n  mutation removeLibraryParticipant($userId: String!, $libraryId: String!, $currentUserId: String!) {\n    removeLibraryParticipant(userId: $userId, libraryId: $libraryId, currentUserId: $currentUserId) {\n      id\n    }\n  }\n': typeof types.RemoveLibraryParticipantDocument
  '\n  query users($userId: String!) {\n    users(userId: $userId) {\n      id\n      username\n      name\n      createdAt\n      email\n      profile {\n        firstName\n        lastName\n        business\n        position\n      }\n    }\n  }\n': typeof types.UsersDocument
  '\n        mutation sendConfirmationMail($userId: String!, $confirmationUrl: String!) {\n          sendConfirmationMail(userId: $userId, confirmationUrl: $confirmationUrl)\n        }\n      ': typeof types.SendConfirmationMailDocument
  '\n        mutation confirmUserProfile($profileId: String!) {\n          confirmUserProfile(profileId: $profileId) {\n            id\n          }\n        }\n      ': typeof types.ConfirmUserProfileDocument
  '\n        query getUserProfile($userId: String!) {\n          userProfile(userId: $userId) {\n            id\n            userId\n            email\n            firstName\n            lastName\n            business\n            position\n            freeMessages\n            usedMessages\n            freeStorage\n            usedStorage\n            createdAt\n            updatedAt\n            confirmationDate\n            activationDate\n            expiresAt\n          }\n        }\n      ': typeof types.GetUserProfileDocument
  '\n        mutation updateUserProfile($userId: String!, $userProfileInput: UserProfileInput!) {\n          updateUserProfile(userId: $userId, input: $userProfileInput) {\n            id\n          }\n        }\n      ': typeof types.UpdateUserProfileDocument
  '\n        mutation activateUserProfile($profileId: String!) {\n          activateUserProfile(profileId: $profileId) {\n            id\n          }\n        }\n      ': typeof types.ActivateUserProfileDocument
}
const documents: Documents = {
  '\n  mutation login($jwtToken: String!) {\n    login(jwtToken: $jwtToken) {\n      id\n      username\n      email\n      name\n      given_name\n      family_name\n      createdAt\n      isAdmin\n    }\n  }\n':
    types.LoginDocument,
  '\n  fragment AssistantSurvey_Assessment on AiActAssessment {\n    assistantId\n\n    assistantSurvey {\n      actionsTitle {\n        de\n        en\n      }\n      actions {\n        level\n        description {\n          de\n          en\n        }\n      }\n      questions {\n        id\n        ...QuestionCard_question\n      }\n      title {\n        de\n        en\n      }\n      percentCompleted\n      hint {\n        de\n        en\n      }\n      riskIndicator {\n        description {\n          de\n          en\n        }\n        level\n      }\n    }\n  }\n':
    types.AssistantSurvey_AssessmentFragmentDoc,
  '\n        query AiActAssessmentQuery($assistantId: String!) {\n          aiActAssessment(assistantId: $assistantId) {\n            ...RiskAreasIdentification_Assessment\n            ...AssistantSurvey_Assessment\n          }\n        }\n      ':
    types.AiActAssessmentQueryDocument,
  '\n        mutation updateAssessmentQuestion($assistantId: String!, $questionId: String!, $value: String, $notes: String) {\n          updateAssessmentQuestion(assistantId: $assistantId, questionId: $questionId, value: $value, notes: $notes)\n        }\n      ':
    types.UpdateAssessmentQuestionDocument,
  '\n        mutation resetAssessmentAnswers($assistantId: String!) {\n          resetAssessmentAnswers(assistantId: $assistantId)\n        }\n      ':
    types.ResetAssessmentAnswersDocument,
  '\n  fragment ComplianceArea_Compliance on AiActComplianceArea {\n    title {\n      de\n      en\n    }\n    description {\n      de\n      en\n    }\n    mandatory\n  }\n':
    types.ComplianceArea_ComplianceFragmentDoc,
  '\n  fragment QuestionCard_question on AiActQuestion {\n    id\n    title {\n      de\n      en\n    }\n    notes\n    value\n    hint {\n      de\n      en\n    }\n    options {\n      id\n      title {\n        de\n        en\n      }\n    }\n  }\n':
    types.QuestionCard_QuestionFragmentDoc,
  '\n  fragment RiskAreasIdentification_Assessment on AiActAssessment {\n    identifyRiskInfo {\n      title {\n        de\n        en\n      }\n      legalDisclaimer {\n        title {\n          de\n          en\n        }\n        text {\n          de\n          en\n        }\n      }\n      complianceAreas {\n        id\n        ...ComplianceArea_Compliance\n      }\n    }\n    assistantSurvey {\n      questions {\n        id\n        title {\n          de\n          en\n        }\n        notes\n        value\n        options {\n          id\n          title {\n            de\n            en\n          }\n        }\n      }\n      riskIndicator {\n        description {\n          de\n          en\n        }\n        factors {\n          de\n          en\n        }\n        level\n      }\n    }\n  }\n':
    types.RiskAreasIdentification_AssessmentFragmentDoc,
  '\n        mutation upsertAiBaseCases($assistantId: String!, $baseCases: [AiBaseCaseInputType!]!) {\n          upsertAiBaseCases(assistantId: $assistantId, baseCases: $baseCases) {\n            id\n            sequence\n            condition\n            instruction\n          }\n        }\n      ':
    types.UpsertAiBaseCasesDocument,
  '\n  fragment AssistantBasecaseForm_Assistant on AiAssistant {\n    id\n    baseCases {\n      id\n      sequence\n      condition\n      instruction\n    }\n  }\n':
    types.AssistantBasecaseForm_AssistantFragmentDoc,
  '\n  fragment AssistantCard_Assistant on AiAssistant {\n    id\n    name\n    description\n    iconUrl\n    ...AssistantDelete_Assistant\n  }\n':
    types.AssistantCard_AssistantFragmentDoc,
  '\n        mutation deleteAiAssistant($assistantId: String!) {\n          deleteAiAssistant(assistantId: $assistantId) {\n            id\n            name\n          }\n        }\n      ':
    types.DeleteAiAssistantDocument,
  '\n  fragment AssistantDelete_Assistant on AiAssistant {\n    id\n    name\n  }\n':
    types.AssistantDelete_AssistantFragmentDoc,
  '\n  fragment AssistantForm_Assistant on AiAssistant {\n    id\n    name\n    iconUrl\n    description\n    ownerId\n    languageModel\n    updatedAt\n  }\n':
    types.AssistantForm_AssistantFragmentDoc,
  '\n        mutation updateAssistant($id: String!, $data: AiAssistantInput!) {\n          updateAiAssistant(id: $id, data: $data) {\n            id\n          }\n        }\n      ':
    types.UpdateAssistantDocument,
  '\n  fragment AssistantIcon_assistantFragment on AiAssistant {\n    id\n    name\n    updatedAt\n    iconUrl\n  }\n':
    types.AssistantIcon_AssistantFragmentFragmentDoc,
  '\n  fragment AssistantLibraries_Assistant on AiAssistant {\n    id\n    ownerId\n  }\n':
    types.AssistantLibraries_AssistantFragmentDoc,
  '\n  fragment AssistantLibraries_Library on AiLibrary {\n    id\n    name\n  }\n':
    types.AssistantLibraries_LibraryFragmentDoc,
  '\n  fragment AssistantLibraries_LibraryUsage on AiLibraryUsage {\n    id\n    assistantId\n    libraryId\n    usedFor\n    library {\n      id\n      name\n    }\n  }\n':
    types.AssistantLibraries_LibraryUsageFragmentDoc,
  '\n        mutation addLibraryUsage($assistantId: String!, $libraryId: String!) {\n          addLibraryUsage(assistantId: $assistantId, libraryId: $libraryId) {\n            id\n          }\n        }\n      ':
    types.AddLibraryUsageDocument,
  '\n        mutation removeLibraryUsage($assistantId: String!, $libraryId: String!) {\n          removeLibraryUsage(assistantId: $assistantId, libraryId: $libraryId) {\n            id\n          }\n        }\n      ':
    types.RemoveLibraryUsageDocument,
  '\n          mutation updateLibraryUsage($id: String!, $usedFor: String!) {\n            updateLibraryUsage(id: $id, usedFor: $usedFor) {\n              id\n            }\n          }\n        ':
    types.UpdateLibraryUsageDocument,
  '\n        mutation createAiAssistant($ownerId: String!, $name: String!) {\n          createAiAssistant(ownerId: $ownerId, name: $name) {\n            id\n            name\n          }\n        }\n      ':
    types.CreateAiAssistantDocument,
  '\n  fragment AssistantParticipantsDialogButton_Assistant on AiAssistant {\n    id\n    ownerId\n    participants {\n      id\n    }\n  }\n':
    types.AssistantParticipantsDialogButton_AssistantFragmentDoc,
  '\n  fragment AssistantParticipants_Assistant on AiAssistant {\n    id\n    ownerId\n    participants {\n      id\n      name\n      username\n    }\n    ...AssistantParticipantsDialogButton_Assistant\n  }\n':
    types.AssistantParticipants_AssistantFragmentDoc,
  '\n  fragment AssistantSelector_Assistant on AiAssistant {\n    id\n    name\n  }\n':
    types.AssistantSelector_AssistantFragmentDoc,
  '\n  fragment ConversationForm_Conversation on AiConversation {\n    id\n    assistants {\n      id\n      name\n    }\n  }\n':
    types.ConversationForm_ConversationFragmentDoc,
  '\n  fragment ConversationHistory_Conversation on AiConversation {\n    id\n    messages {\n      id\n      sequenceNumber\n      content\n      source\n      createdAt\n      hidden\n      sender {\n        id\n        name\n        isBot\n        assistantId\n      }\n    }\n  }\n':
    types.ConversationHistory_ConversationFragmentDoc,
  '\n  mutation hideMessage($messageId: String!) {\n    hideMessage(messageId: $messageId) {\n      id\n      hidden\n    }\n  }\n':
    types.HideMessageDocument,
  '\n  mutation unhideMessage($messageId: String!) {\n    unhideMessage(messageId: $messageId) {\n      id\n      hidden\n    }\n  }\n':
    types.UnhideMessageDocument,
  '\n  fragment ConversationParticipantsDialogButton_Conversation on AiConversation {\n    id\n    ownerId\n    participants {\n      id\n      userId\n      assistantId\n    }\n  }\n':
    types.ConversationParticipantsDialogButton_ConversationFragmentDoc,
  '\n  fragment ConversationParticipantsDialogButton_Assistant on AiAssistant {\n    id\n    name\n  }\n':
    types.ConversationParticipantsDialogButton_AssistantFragmentDoc,
  '\n  fragment ConversationParticipants_Conversation on AiConversation {\n    id\n    ownerId\n    participants {\n      id\n      name\n      userId\n      assistantId\n    }\n    ...ConversationParticipantsDialogButton_Conversation\n  }\n':
    types.ConversationParticipants_ConversationFragmentDoc,
  '\n  fragment ConversationParticipants_Assistant on AiAssistant {\n    ...ConversationParticipantsDialogButton_Assistant\n  }\n':
    types.ConversationParticipants_AssistantFragmentDoc,
  '\n  fragment ConversationSelector_Conversation on AiConversation {\n    id\n    createdAt\n    owner {\n      id\n      name\n    }\n    assistants {\n      id\n      name\n    }\n  }\n':
    types.ConversationSelector_ConversationFragmentDoc,
  '\n  fragment ConversationDelete_Conversation on AiConversation {\n    id\n    ownerId\n    createdAt\n    assistants {\n      name\n    }\n    participants {\n      id\n      userId\n    }\n  }\n':
    types.ConversationDelete_ConversationFragmentDoc,
  '\n  fragment NewConversationSelector_Assistant on AiAssistant {\n    ...ConversationParticipantsDialogButton_Assistant\n  }\n':
    types.NewConversationSelector_AssistantFragmentDoc,
  '\n        mutation createContactRequest($name: String!, $emailOrPhone: String!, $message: String!) {\n          createContactRequest(name: $name, emailOrPhone: $emailOrPhone, message: $message)\n        }\n      ':
    types.CreateContactRequestDocument,
  '\n      query version {\n        version\n      }\n    ': types.VersionDocument,
  '\n        mutation createAiLibraryCrawler($libraryId: String!, $data: AiLibraryCrawlerInput!) {\n          createAiLibraryCrawler(libraryId: $libraryId, data: $data) {\n            id\n          }\n        }\n      ':
    types.CreateAiLibraryCrawlerDocument,
  '\n  fragment CrawlerTable_Library on AiLibrary {\n    crawlers {\n      id\n      url\n      maxDepth\n      maxPages\n      lastRun\n      cronJob {\n        cronExpression\n      }\n      filesCount\n      ...RunCrawlerButton_Crawler\n      ...UpdateCrawlerButton_Crawler\n    }\n  }\n':
    types.CrawlerTable_LibraryFragmentDoc,
  '\n        mutation deleteCrawler($id: String!) {\n          deleteAiLibraryCrawler(id: $id) {\n            id\n          }\n        }\n      ':
    types.DeleteCrawlerDocument,
  '\n        query CrawlerTable($libraryId: String!) {\n          aiLibrary(id: $libraryId) {\n            ...CrawlerTable_Library\n          }\n        }\n      ':
    types.CrawlerTableDocument,
  '\n  fragment RunCrawlerButton_Crawler on AiLibraryCrawler {\n    id\n    isRunning\n  }\n':
    types.RunCrawlerButton_CrawlerFragmentDoc,
  '\n        mutation runCrawler($crawlerId: String!, $userId: String!) {\n          runAiLibraryCrawler(crawlerId: $crawlerId, userId: $userId) {\n            id\n            lastRun\n          }\n        }\n      ':
    types.RunCrawlerDocument,
  '\n  fragment UpdateCrawlerButton_Crawler on AiLibraryCrawler {\n    id\n    url\n    maxDepth\n    maxPages\n    cronJob {\n      id\n      active\n      hour\n      minute\n      monday\n      tuesday\n      wednesday\n      thursday\n      friday\n      saturday\n      sunday\n    }\n  }\n':
    types.UpdateCrawlerButton_CrawlerFragmentDoc,
  '\n        mutation updateAiLibraryCrawler($id: String!, $data: AiLibraryCrawlerInput!) {\n          updateAiLibraryCrawler(id: $id, data: $data) {\n            id\n          }\n        }\n      ':
    types.UpdateAiLibraryCrawlerDocument,
  '\n  mutation dropFiles($libraryId: String!) {\n    dropFiles(libraryId: $libraryId) {\n      id\n      libraryId\n    }\n  }\n':
    types.DropFilesDocument,
  '\n  mutation deleteAiLibrary($id: String!) {\n    deleteAiLibrary(id: $id) {\n      id\n    }\n  }\n':
    types.DeleteAiLibraryDocument,
  '\n  fragment DeleteLibraryDialog_Library on AiLibrary {\n    id\n    name\n    ownerId\n    filesCount\n    createdAt\n    description\n    url\n  }\n':
    types.DeleteLibraryDialog_LibraryFragmentDoc,
  '\n  mutation prepareDesktopFile($file: AiLibraryFileInput!) {\n    prepareFile(data: $file) {\n      id\n    }\n  }\n':
    types.PrepareDesktopFileDocument,
  '\n        mutation cancelFileUpload($fileId: String!) {\n          cancelFileUpload(fileId: $fileId)\n        }\n      ':
    types.CancelFileUploadDocument,
  '\n          mutation dropFile($id: String!) {\n            dropFile(fileId: $id) {\n              id\n            }\n          }\n        ':
    types.DropFileDocument,
  '\n          mutation reProcessFile($id: String!) {\n            processFile(fileId: $id) {\n              id\n              chunks\n              size\n              uploadedAt\n              processedAt\n              processingErrorMessage\n            }\n          }\n        ':
    types.ReProcessFileDocument,
  '\n        query EmbeddingsTable($libraryId: String!) {\n          aiLibraryFiles(libraryId: $libraryId) {\n            id\n            name\n            originUri\n            mimeType\n            size\n            chunks\n            uploadedAt\n            processedAt\n            processingErrorMessage\n            dropError\n          }\n        }\n      ':
    types.EmbeddingsTableDocument,
  '\n  query aiLibraries($userId: String!) {\n    aiLibraries(userId: $userId) {\n      id\n      name\n      owner {\n        id\n        name\n      }\n      createdAt\n      updatedAt\n    }\n  }\n':
    types.AiLibrariesDocument,
  '\n  query aiLibraryDetails($id: String!) {\n    aiLibrary(id: $id) {\n      id\n      name\n      ...LibraryFormFragment\n      ...DeleteLibraryDialog_Library\n      ...LibraryParticipants_Library\n    }\n  }\n':
    types.AiLibraryDetailsDocument,
  '\n  mutation prepareFile($file: AiLibraryFileInput!) {\n    prepareFile(data: $file) {\n      id\n    }\n  }\n':
    types.PrepareFileDocument,
  '\n  mutation processFile($fileId: String!) {\n    processFile(fileId: $fileId) {\n      id\n      chunks\n      size\n      uploadedAt\n      processedAt\n    }\n  }\n':
    types.ProcessFileDocument,
  '\n  fragment LibraryFormFragment on AiLibrary {\n    id\n    name\n    description\n  }\n':
    types.LibraryFormFragmentFragmentDoc,
  '\n        mutation createAiLibrary($ownerId: String!, $data: AiLibraryInput!) {\n          createAiLibrary(ownerId: $ownerId, data: $data) {\n            id\n            name\n          }\n        }\n      ':
    types.CreateAiLibraryDocument,
  '\n  fragment LibraryParticipantsDialogButton_Library on AiLibrary {\n    id\n    ownerId\n    participants {\n      id\n    }\n  }\n':
    types.LibraryParticipantsDialogButton_LibraryFragmentDoc,
  '\n  fragment LibraryParticipants_Library on AiLibrary {\n    id\n    ownerId\n    participants {\n      id\n      name\n      username\n    }\n    ...LibraryParticipantsDialogButton_Library\n  }\n':
    types.LibraryParticipants_LibraryFragmentDoc,
  '\n  fragment UserProfileForm_UserProfile on UserProfile {\n    id\n    userId\n    email\n    firstName\n    lastName\n    freeMessages\n    usedMessages\n    freeStorage\n    usedStorage\n    createdAt\n    updatedAt\n    confirmationDate\n    activationDate\n    expiresAt\n    business\n    position\n  }\n':
    types.UserProfileForm_UserProfileFragmentDoc,
  '\n        mutation saveUserProfile($userId: String!, $userProfileInput: UserProfileInput!) {\n          updateUserProfile(userId: $userId, input: $userProfileInput) {\n            id\n          }\n        }\n      ':
    types.SaveUserProfileDocument,
  '\n        query aiAssistantCards($userId: String!) {\n          aiAssistants(userId: $userId) {\n            id\n            ...AssistantCard_Assistant\n          }\n        }\n      ':
    types.AiAssistantCardsDocument,
  '\n  query getUserConversations($userId: String!) {\n    aiConversations(userId: $userId) {\n      id\n      ...ConversationSelector_Conversation\n    }\n  }\n':
    types.GetUserConversationsDocument,
  '\n  query getConversation($conversationId: String!) {\n    aiConversation(conversationId: $conversationId) {\n      ...ConversationParticipants_Conversation\n      ...ConversationDelete_Conversation\n      ...ConversationHistory_Conversation\n      ...ConversationForm_Conversation\n      ...ConversationParticipantsDialogButton_Conversation\n    }\n  }\n':
    types.GetConversationDocument,
  '\n  query getAssignableAssistants($userId: String!) {\n    aiAssistants(userId: $userId) {\n      ...NewConversationSelector_Assistant\n      ...ConversationParticipants_Assistant\n      ...ConversationParticipantsDialogButton_Assistant\n    }\n  }\n':
    types.GetAssignableAssistantsDocument,
  '\n  mutation changeAiLibrary($id: String!, $data: AiLibraryInput!) {\n    updateAiLibrary(id: $id, data: $data) {\n      id\n      name\n    }\n  }\n':
    types.ChangeAiLibraryDocument,
  '\n  query userProfile($userId: String!) {\n    userProfile(userId: $userId) {\n      id\n      confirmationDate\n      ...UserProfileForm_UserProfile\n    }\n  }\n':
    types.UserProfileDocument,
  '\n  mutation createUserProfile($userId: String!) {\n    createUserProfile(userId: $userId) {\n      id\n    }\n  }\n':
    types.CreateUserProfileDocument,
  '\n  mutation removeUserProfile($userId: String!) {\n    removeUserProfile(userId: $userId) {\n      id\n    }\n  }\n':
    types.RemoveUserProfileDocument,
  '\n          query aiAssistantDetails($id: String!, $userId: String!) {\n            aiAssistant(id: $id) {\n              ...AssistantForm_Assistant\n              ...AssistantSelector_Assistant\n              ...AssistantLibraries_Assistant\n              ...AssistantBasecaseForm_Assistant\n              ...AssistantParticipants_Assistant\n            }\n            aiAssistants(userId: $userId) {\n              ...AssistantSelector_Assistant\n            }\n            aiLibraryUsage(assistantId: $id) {\n              ...AssistantLibraries_LibraryUsage\n            }\n            aiLibraries(userId: $userId) {\n              ...AssistantLibraries_Library\n            }\n          }\n        ':
    types.AiAssistantDetailsDocument,
  '\n  mutation addAssistantParticipant($assistantId: String!, $userIds: [String!]!, $currentUserId: String!) {\n    addAssistantParticipants(assistantId: $assistantId, userIds: $userIds, currentUserId: $currentUserId) {\n      id\n    }\n  }\n':
    types.AddAssistantParticipantDocument,
  '\n  mutation removeAssistantParticipant($userId: String!, $assistantId: String!, $currentUserId: String!) {\n    removeAssistantParticipant(userId: $userId, assistantId: $assistantId, currentUserId: $currentUserId) {\n      id\n    }\n  }\n':
    types.RemoveAssistantParticipantDocument,
  '\n  query IntrospectionQuery {\n    __schema {\n      description\n      queryType {\n        name\n      }\n      mutationType {\n        name\n      }\n      subscriptionType {\n        name\n      }\n      types {\n        ...FullType\n      }\n      directives {\n        name\n        description\n        locations\n        args {\n          ...InputValue\n        }\n      }\n    }\n  }\n  fragment FullType on __Type {\n    kind\n    name\n    description\n    fields(includeDeprecated: true) {\n      name\n      description\n      args {\n        ...InputValue\n      }\n      type {\n        ...TypeRef\n      }\n      isDeprecated\n      deprecationReason\n    }\n    inputFields {\n      ...InputValue\n    }\n    interfaces {\n      ...TypeRef\n    }\n    enumValues(includeDeprecated: true) {\n      name\n      description\n      isDeprecated\n      deprecationReason\n    }\n    possibleTypes {\n      ...TypeRef\n    }\n  }\n  fragment InputValue on __InputValue {\n    name\n    description\n    type {\n      ...TypeRef\n    }\n    defaultValue\n  }\n  fragment TypeRef on __Type {\n    kind\n    name\n    ofType {\n      kind\n      name\n      ofType {\n        kind\n        name\n        ofType {\n          kind\n          name\n          ofType {\n            kind\n            name\n            ofType {\n              kind\n              name\n              ofType {\n                kind\n                name\n                ofType {\n                  kind\n                  name\n                  ofType {\n                    kind\n                    name\n                    ofType {\n                      kind\n                      name\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n':
    types.IntrospectionQueryDocument,
  '\n  mutation addConversationParticipant($conversationId: String!, $userIds: [String!], $assistantIds: [String!]) {\n    addConversationParticipants(conversationId: $conversationId, userIds: $userIds, assistantIds: $assistantIds) {\n      id\n    }\n  }\n':
    types.AddConversationParticipantDocument,
  '\n  mutation removeConversationParticipant($participantId: String!) {\n    removeConversationParticipant(id: $participantId) {\n      id\n    }\n  }\n':
    types.RemoveConversationParticipantDocument,
  '\n  mutation createConversationInvitations(\n    $conversationId: String!\n    $inviterId: String!\n    $data: [ConversationInvitationInput!]!\n  ) {\n    createConversationInvitations(conversationId: $conversationId, inviterId: $inviterId, data: $data) {\n      id\n    }\n  }\n':
    types.CreateConversationInvitationsDocument,
  '\n  mutation confirmInvitation($conversationId: String!, $invitationId: String!, $userId: String!, $email: String) {\n    confirmConversationInvitation(\n      conversationId: $conversationId\n      invitationId: $invitationId\n      userId: $userId\n      email: $email\n    ) {\n      id\n    }\n  }\n':
    types.ConfirmInvitationDocument,
  '\n  mutation sendMessage($userId: String!, $data: AiConversationMessageInput!) {\n    sendMessage(userId: $userId, data: $data) {\n      id\n      createdAt\n    }\n  }\n':
    types.SendMessageDocument,
  '\n  mutation createConversation($ownerId: String!, $data: AiConversationCreateInput!) {\n    createAiConversation(ownerId: $ownerId, data: $data) {\n      id\n    }\n  }\n':
    types.CreateConversationDocument,
  '\n  mutation deleteConversation($conversationId: String!) {\n    deleteAiConversation(conversationId: $conversationId) {\n      id\n    }\n  }\n':
    types.DeleteConversationDocument,
  '\n        mutation removeConversations($conversationIds: [String!]!, $userId: String!) {\n          removeAiConversations(conversationIds: $conversationIds, userId: $userId)\n        }\n      ':
    types.RemoveConversationsDocument,
  '\n  mutation leaveConversation($participantId: String!) {\n    leaveAiConversation(id: $participantId) {\n      id\n    }\n  }\n':
    types.LeaveConversationDocument,
  '\n  mutation addLibraryParticipant($libraryId: String!, $userIds: [String!]!) {\n    addLibraryParticipants(libraryId: $libraryId, userIds: $userIds) {\n      id\n    }\n  }\n':
    types.AddLibraryParticipantDocument,
  '\n  mutation removeLibraryParticipant($userId: String!, $libraryId: String!, $currentUserId: String!) {\n    removeLibraryParticipant(userId: $userId, libraryId: $libraryId, currentUserId: $currentUserId) {\n      id\n    }\n  }\n':
    types.RemoveLibraryParticipantDocument,
  '\n  query users($userId: String!) {\n    users(userId: $userId) {\n      id\n      username\n      name\n      createdAt\n      email\n      profile {\n        firstName\n        lastName\n        business\n        position\n      }\n    }\n  }\n':
    types.UsersDocument,
  '\n        mutation sendConfirmationMail($userId: String!, $confirmationUrl: String!) {\n          sendConfirmationMail(userId: $userId, confirmationUrl: $confirmationUrl)\n        }\n      ':
    types.SendConfirmationMailDocument,
  '\n        mutation confirmUserProfile($profileId: String!) {\n          confirmUserProfile(profileId: $profileId) {\n            id\n          }\n        }\n      ':
    types.ConfirmUserProfileDocument,
  '\n        query getUserProfile($userId: String!) {\n          userProfile(userId: $userId) {\n            id\n            userId\n            email\n            firstName\n            lastName\n            business\n            position\n            freeMessages\n            usedMessages\n            freeStorage\n            usedStorage\n            createdAt\n            updatedAt\n            confirmationDate\n            activationDate\n            expiresAt\n          }\n        }\n      ':
    types.GetUserProfileDocument,
  '\n        mutation updateUserProfile($userId: String!, $userProfileInput: UserProfileInput!) {\n          updateUserProfile(userId: $userId, input: $userProfileInput) {\n            id\n          }\n        }\n      ':
    types.UpdateUserProfileDocument,
  '\n        mutation activateUserProfile($profileId: String!) {\n          activateUserProfile(profileId: $profileId) {\n            id\n          }\n        }\n      ':
    types.ActivateUserProfileDocument,
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
  source: '\n  mutation login($jwtToken: String!) {\n    login(jwtToken: $jwtToken) {\n      id\n      username\n      email\n      name\n      given_name\n      family_name\n      createdAt\n      isAdmin\n    }\n  }\n',
): (typeof documents)['\n  mutation login($jwtToken: String!) {\n    login(jwtToken: $jwtToken) {\n      id\n      username\n      email\n      name\n      given_name\n      family_name\n      createdAt\n      isAdmin\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AssistantSurvey_Assessment on AiActAssessment {\n    assistantId\n\n    assistantSurvey {\n      actionsTitle {\n        de\n        en\n      }\n      actions {\n        level\n        description {\n          de\n          en\n        }\n      }\n      questions {\n        id\n        ...QuestionCard_question\n      }\n      title {\n        de\n        en\n      }\n      percentCompleted\n      hint {\n        de\n        en\n      }\n      riskIndicator {\n        description {\n          de\n          en\n        }\n        level\n      }\n    }\n  }\n',
): (typeof documents)['\n  fragment AssistantSurvey_Assessment on AiActAssessment {\n    assistantId\n\n    assistantSurvey {\n      actionsTitle {\n        de\n        en\n      }\n      actions {\n        level\n        description {\n          de\n          en\n        }\n      }\n      questions {\n        id\n        ...QuestionCard_question\n      }\n      title {\n        de\n        en\n      }\n      percentCompleted\n      hint {\n        de\n        en\n      }\n      riskIndicator {\n        description {\n          de\n          en\n        }\n        level\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        query AiActAssessmentQuery($assistantId: String!) {\n          aiActAssessment(assistantId: $assistantId) {\n            ...RiskAreasIdentification_Assessment\n            ...AssistantSurvey_Assessment\n          }\n        }\n      ',
): (typeof documents)['\n        query AiActAssessmentQuery($assistantId: String!) {\n          aiActAssessment(assistantId: $assistantId) {\n            ...RiskAreasIdentification_Assessment\n            ...AssistantSurvey_Assessment\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation updateAssessmentQuestion($assistantId: String!, $questionId: String!, $value: String, $notes: String) {\n          updateAssessmentQuestion(assistantId: $assistantId, questionId: $questionId, value: $value, notes: $notes)\n        }\n      ',
): (typeof documents)['\n        mutation updateAssessmentQuestion($assistantId: String!, $questionId: String!, $value: String, $notes: String) {\n          updateAssessmentQuestion(assistantId: $assistantId, questionId: $questionId, value: $value, notes: $notes)\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation resetAssessmentAnswers($assistantId: String!) {\n          resetAssessmentAnswers(assistantId: $assistantId)\n        }\n      ',
): (typeof documents)['\n        mutation resetAssessmentAnswers($assistantId: String!) {\n          resetAssessmentAnswers(assistantId: $assistantId)\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ComplianceArea_Compliance on AiActComplianceArea {\n    title {\n      de\n      en\n    }\n    description {\n      de\n      en\n    }\n    mandatory\n  }\n',
): (typeof documents)['\n  fragment ComplianceArea_Compliance on AiActComplianceArea {\n    title {\n      de\n      en\n    }\n    description {\n      de\n      en\n    }\n    mandatory\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment QuestionCard_question on AiActQuestion {\n    id\n    title {\n      de\n      en\n    }\n    notes\n    value\n    hint {\n      de\n      en\n    }\n    options {\n      id\n      title {\n        de\n        en\n      }\n    }\n  }\n',
): (typeof documents)['\n  fragment QuestionCard_question on AiActQuestion {\n    id\n    title {\n      de\n      en\n    }\n    notes\n    value\n    hint {\n      de\n      en\n    }\n    options {\n      id\n      title {\n        de\n        en\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment RiskAreasIdentification_Assessment on AiActAssessment {\n    identifyRiskInfo {\n      title {\n        de\n        en\n      }\n      legalDisclaimer {\n        title {\n          de\n          en\n        }\n        text {\n          de\n          en\n        }\n      }\n      complianceAreas {\n        id\n        ...ComplianceArea_Compliance\n      }\n    }\n    assistantSurvey {\n      questions {\n        id\n        title {\n          de\n          en\n        }\n        notes\n        value\n        options {\n          id\n          title {\n            de\n            en\n          }\n        }\n      }\n      riskIndicator {\n        description {\n          de\n          en\n        }\n        factors {\n          de\n          en\n        }\n        level\n      }\n    }\n  }\n',
): (typeof documents)['\n  fragment RiskAreasIdentification_Assessment on AiActAssessment {\n    identifyRiskInfo {\n      title {\n        de\n        en\n      }\n      legalDisclaimer {\n        title {\n          de\n          en\n        }\n        text {\n          de\n          en\n        }\n      }\n      complianceAreas {\n        id\n        ...ComplianceArea_Compliance\n      }\n    }\n    assistantSurvey {\n      questions {\n        id\n        title {\n          de\n          en\n        }\n        notes\n        value\n        options {\n          id\n          title {\n            de\n            en\n          }\n        }\n      }\n      riskIndicator {\n        description {\n          de\n          en\n        }\n        factors {\n          de\n          en\n        }\n        level\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation upsertAiBaseCases($assistantId: String!, $baseCases: [AiBaseCaseInputType!]!) {\n          upsertAiBaseCases(assistantId: $assistantId, baseCases: $baseCases) {\n            id\n            sequence\n            condition\n            instruction\n          }\n        }\n      ',
): (typeof documents)['\n        mutation upsertAiBaseCases($assistantId: String!, $baseCases: [AiBaseCaseInputType!]!) {\n          upsertAiBaseCases(assistantId: $assistantId, baseCases: $baseCases) {\n            id\n            sequence\n            condition\n            instruction\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AssistantBasecaseForm_Assistant on AiAssistant {\n    id\n    baseCases {\n      id\n      sequence\n      condition\n      instruction\n    }\n  }\n',
): (typeof documents)['\n  fragment AssistantBasecaseForm_Assistant on AiAssistant {\n    id\n    baseCases {\n      id\n      sequence\n      condition\n      instruction\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AssistantCard_Assistant on AiAssistant {\n    id\n    name\n    description\n    iconUrl\n    ...AssistantDelete_Assistant\n  }\n',
): (typeof documents)['\n  fragment AssistantCard_Assistant on AiAssistant {\n    id\n    name\n    description\n    iconUrl\n    ...AssistantDelete_Assistant\n  }\n']
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
  source: '\n  fragment AssistantDelete_Assistant on AiAssistant {\n    id\n    name\n  }\n',
): (typeof documents)['\n  fragment AssistantDelete_Assistant on AiAssistant {\n    id\n    name\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AssistantForm_Assistant on AiAssistant {\n    id\n    name\n    iconUrl\n    description\n    ownerId\n    languageModel\n    updatedAt\n  }\n',
): (typeof documents)['\n  fragment AssistantForm_Assistant on AiAssistant {\n    id\n    name\n    iconUrl\n    description\n    ownerId\n    languageModel\n    updatedAt\n  }\n']
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
  source: '\n  fragment AssistantIcon_assistantFragment on AiAssistant {\n    id\n    name\n    updatedAt\n    iconUrl\n  }\n',
): (typeof documents)['\n  fragment AssistantIcon_assistantFragment on AiAssistant {\n    id\n    name\n    updatedAt\n    iconUrl\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AssistantLibraries_Assistant on AiAssistant {\n    id\n    ownerId\n  }\n',
): (typeof documents)['\n  fragment AssistantLibraries_Assistant on AiAssistant {\n    id\n    ownerId\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AssistantLibraries_Library on AiLibrary {\n    id\n    name\n  }\n',
): (typeof documents)['\n  fragment AssistantLibraries_Library on AiLibrary {\n    id\n    name\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AssistantLibraries_LibraryUsage on AiLibraryUsage {\n    id\n    assistantId\n    libraryId\n    usedFor\n    library {\n      id\n      name\n    }\n  }\n',
): (typeof documents)['\n  fragment AssistantLibraries_LibraryUsage on AiLibraryUsage {\n    id\n    assistantId\n    libraryId\n    usedFor\n    library {\n      id\n      name\n    }\n  }\n']
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
  source: '\n  fragment AssistantParticipantsDialogButton_Assistant on AiAssistant {\n    id\n    ownerId\n    participants {\n      id\n    }\n  }\n',
): (typeof documents)['\n  fragment AssistantParticipantsDialogButton_Assistant on AiAssistant {\n    id\n    ownerId\n    participants {\n      id\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AssistantParticipants_Assistant on AiAssistant {\n    id\n    ownerId\n    participants {\n      id\n      name\n      username\n    }\n    ...AssistantParticipantsDialogButton_Assistant\n  }\n',
): (typeof documents)['\n  fragment AssistantParticipants_Assistant on AiAssistant {\n    id\n    ownerId\n    participants {\n      id\n      name\n      username\n    }\n    ...AssistantParticipantsDialogButton_Assistant\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AssistantSelector_Assistant on AiAssistant {\n    id\n    name\n  }\n',
): (typeof documents)['\n  fragment AssistantSelector_Assistant on AiAssistant {\n    id\n    name\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ConversationForm_Conversation on AiConversation {\n    id\n    assistants {\n      id\n      name\n    }\n  }\n',
): (typeof documents)['\n  fragment ConversationForm_Conversation on AiConversation {\n    id\n    assistants {\n      id\n      name\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ConversationHistory_Conversation on AiConversation {\n    id\n    messages {\n      id\n      sequenceNumber\n      content\n      source\n      createdAt\n      hidden\n      sender {\n        id\n        name\n        isBot\n        assistantId\n      }\n    }\n  }\n',
): (typeof documents)['\n  fragment ConversationHistory_Conversation on AiConversation {\n    id\n    messages {\n      id\n      sequenceNumber\n      content\n      source\n      createdAt\n      hidden\n      sender {\n        id\n        name\n        isBot\n        assistantId\n      }\n    }\n  }\n']
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
  source: '\n  fragment ConversationParticipantsDialogButton_Conversation on AiConversation {\n    id\n    ownerId\n    participants {\n      id\n      userId\n      assistantId\n    }\n  }\n',
): (typeof documents)['\n  fragment ConversationParticipantsDialogButton_Conversation on AiConversation {\n    id\n    ownerId\n    participants {\n      id\n      userId\n      assistantId\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ConversationParticipantsDialogButton_Assistant on AiAssistant {\n    id\n    name\n  }\n',
): (typeof documents)['\n  fragment ConversationParticipantsDialogButton_Assistant on AiAssistant {\n    id\n    name\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ConversationParticipants_Conversation on AiConversation {\n    id\n    ownerId\n    participants {\n      id\n      name\n      userId\n      assistantId\n    }\n    ...ConversationParticipantsDialogButton_Conversation\n  }\n',
): (typeof documents)['\n  fragment ConversationParticipants_Conversation on AiConversation {\n    id\n    ownerId\n    participants {\n      id\n      name\n      userId\n      assistantId\n    }\n    ...ConversationParticipantsDialogButton_Conversation\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ConversationParticipants_Assistant on AiAssistant {\n    ...ConversationParticipantsDialogButton_Assistant\n  }\n',
): (typeof documents)['\n  fragment ConversationParticipants_Assistant on AiAssistant {\n    ...ConversationParticipantsDialogButton_Assistant\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ConversationSelector_Conversation on AiConversation {\n    id\n    createdAt\n    owner {\n      id\n      name\n    }\n    assistants {\n      id\n      name\n    }\n  }\n',
): (typeof documents)['\n  fragment ConversationSelector_Conversation on AiConversation {\n    id\n    createdAt\n    owner {\n      id\n      name\n    }\n    assistants {\n      id\n      name\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ConversationDelete_Conversation on AiConversation {\n    id\n    ownerId\n    createdAt\n    assistants {\n      name\n    }\n    participants {\n      id\n      userId\n    }\n  }\n',
): (typeof documents)['\n  fragment ConversationDelete_Conversation on AiConversation {\n    id\n    ownerId\n    createdAt\n    assistants {\n      name\n    }\n    participants {\n      id\n      userId\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment NewConversationSelector_Assistant on AiAssistant {\n    ...ConversationParticipantsDialogButton_Assistant\n  }\n',
): (typeof documents)['\n  fragment NewConversationSelector_Assistant on AiAssistant {\n    ...ConversationParticipantsDialogButton_Assistant\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation createContactRequest($name: String!, $emailOrPhone: String!, $message: String!) {\n          createContactRequest(name: $name, emailOrPhone: $emailOrPhone, message: $message)\n        }\n      ',
): (typeof documents)['\n        mutation createContactRequest($name: String!, $emailOrPhone: String!, $message: String!) {\n          createContactRequest(name: $name, emailOrPhone: $emailOrPhone, message: $message)\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n      query version {\n        version\n      }\n    ',
): (typeof documents)['\n      query version {\n        version\n      }\n    ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation createAiLibraryCrawler($libraryId: String!, $data: AiLibraryCrawlerInput!) {\n          createAiLibraryCrawler(libraryId: $libraryId, data: $data) {\n            id\n          }\n        }\n      ',
): (typeof documents)['\n        mutation createAiLibraryCrawler($libraryId: String!, $data: AiLibraryCrawlerInput!) {\n          createAiLibraryCrawler(libraryId: $libraryId, data: $data) {\n            id\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment CrawlerTable_Library on AiLibrary {\n    crawlers {\n      id\n      url\n      maxDepth\n      maxPages\n      lastRun\n      cronJob {\n        cronExpression\n      }\n      filesCount\n      ...RunCrawlerButton_Crawler\n      ...UpdateCrawlerButton_Crawler\n    }\n  }\n',
): (typeof documents)['\n  fragment CrawlerTable_Library on AiLibrary {\n    crawlers {\n      id\n      url\n      maxDepth\n      maxPages\n      lastRun\n      cronJob {\n        cronExpression\n      }\n      filesCount\n      ...RunCrawlerButton_Crawler\n      ...UpdateCrawlerButton_Crawler\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation deleteCrawler($id: String!) {\n          deleteAiLibraryCrawler(id: $id) {\n            id\n          }\n        }\n      ',
): (typeof documents)['\n        mutation deleteCrawler($id: String!) {\n          deleteAiLibraryCrawler(id: $id) {\n            id\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        query CrawlerTable($libraryId: String!) {\n          aiLibrary(id: $libraryId) {\n            ...CrawlerTable_Library\n          }\n        }\n      ',
): (typeof documents)['\n        query CrawlerTable($libraryId: String!) {\n          aiLibrary(id: $libraryId) {\n            ...CrawlerTable_Library\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment RunCrawlerButton_Crawler on AiLibraryCrawler {\n    id\n    isRunning\n  }\n',
): (typeof documents)['\n  fragment RunCrawlerButton_Crawler on AiLibraryCrawler {\n    id\n    isRunning\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation runCrawler($crawlerId: String!, $userId: String!) {\n          runAiLibraryCrawler(crawlerId: $crawlerId, userId: $userId) {\n            id\n            lastRun\n          }\n        }\n      ',
): (typeof documents)['\n        mutation runCrawler($crawlerId: String!, $userId: String!) {\n          runAiLibraryCrawler(crawlerId: $crawlerId, userId: $userId) {\n            id\n            lastRun\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment UpdateCrawlerButton_Crawler on AiLibraryCrawler {\n    id\n    url\n    maxDepth\n    maxPages\n    cronJob {\n      id\n      active\n      hour\n      minute\n      monday\n      tuesday\n      wednesday\n      thursday\n      friday\n      saturday\n      sunday\n    }\n  }\n',
): (typeof documents)['\n  fragment UpdateCrawlerButton_Crawler on AiLibraryCrawler {\n    id\n    url\n    maxDepth\n    maxPages\n    cronJob {\n      id\n      active\n      hour\n      minute\n      monday\n      tuesday\n      wednesday\n      thursday\n      friday\n      saturday\n      sunday\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation updateAiLibraryCrawler($id: String!, $data: AiLibraryCrawlerInput!) {\n          updateAiLibraryCrawler(id: $id, data: $data) {\n            id\n          }\n        }\n      ',
): (typeof documents)['\n        mutation updateAiLibraryCrawler($id: String!, $data: AiLibraryCrawlerInput!) {\n          updateAiLibraryCrawler(id: $id, data: $data) {\n            id\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation dropFiles($libraryId: String!) {\n    dropFiles(libraryId: $libraryId) {\n      id\n      libraryId\n    }\n  }\n',
): (typeof documents)['\n  mutation dropFiles($libraryId: String!) {\n    dropFiles(libraryId: $libraryId) {\n      id\n      libraryId\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation deleteAiLibrary($id: String!) {\n    deleteAiLibrary(id: $id) {\n      id\n    }\n  }\n',
): (typeof documents)['\n  mutation deleteAiLibrary($id: String!) {\n    deleteAiLibrary(id: $id) {\n      id\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment DeleteLibraryDialog_Library on AiLibrary {\n    id\n    name\n    ownerId\n    filesCount\n    createdAt\n    description\n    url\n  }\n',
): (typeof documents)['\n  fragment DeleteLibraryDialog_Library on AiLibrary {\n    id\n    name\n    ownerId\n    filesCount\n    createdAt\n    description\n    url\n  }\n']
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
  source: '\n        mutation cancelFileUpload($fileId: String!) {\n          cancelFileUpload(fileId: $fileId)\n        }\n      ',
): (typeof documents)['\n        mutation cancelFileUpload($fileId: String!) {\n          cancelFileUpload(fileId: $fileId)\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n          mutation dropFile($id: String!) {\n            dropFile(fileId: $id) {\n              id\n            }\n          }\n        ',
): (typeof documents)['\n          mutation dropFile($id: String!) {\n            dropFile(fileId: $id) {\n              id\n            }\n          }\n        ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n          mutation reProcessFile($id: String!) {\n            processFile(fileId: $id) {\n              id\n              chunks\n              size\n              uploadedAt\n              processedAt\n              processingErrorMessage\n            }\n          }\n        ',
): (typeof documents)['\n          mutation reProcessFile($id: String!) {\n            processFile(fileId: $id) {\n              id\n              chunks\n              size\n              uploadedAt\n              processedAt\n              processingErrorMessage\n            }\n          }\n        ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        query EmbeddingsTable($libraryId: String!) {\n          aiLibraryFiles(libraryId: $libraryId) {\n            id\n            name\n            originUri\n            mimeType\n            size\n            chunks\n            uploadedAt\n            processedAt\n            processingErrorMessage\n            dropError\n          }\n        }\n      ',
): (typeof documents)['\n        query EmbeddingsTable($libraryId: String!) {\n          aiLibraryFiles(libraryId: $libraryId) {\n            id\n            name\n            originUri\n            mimeType\n            size\n            chunks\n            uploadedAt\n            processedAt\n            processingErrorMessage\n            dropError\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query aiLibraries($userId: String!) {\n    aiLibraries(userId: $userId) {\n      id\n      name\n      owner {\n        id\n        name\n      }\n      createdAt\n      updatedAt\n    }\n  }\n',
): (typeof documents)['\n  query aiLibraries($userId: String!) {\n    aiLibraries(userId: $userId) {\n      id\n      name\n      owner {\n        id\n        name\n      }\n      createdAt\n      updatedAt\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query aiLibraryDetails($id: String!) {\n    aiLibrary(id: $id) {\n      id\n      name\n      ...LibraryFormFragment\n      ...DeleteLibraryDialog_Library\n      ...LibraryParticipants_Library\n    }\n  }\n',
): (typeof documents)['\n  query aiLibraryDetails($id: String!) {\n    aiLibrary(id: $id) {\n      id\n      name\n      ...LibraryFormFragment\n      ...DeleteLibraryDialog_Library\n      ...LibraryParticipants_Library\n    }\n  }\n']
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
  source: '\n  fragment LibraryFormFragment on AiLibrary {\n    id\n    name\n    description\n  }\n',
): (typeof documents)['\n  fragment LibraryFormFragment on AiLibrary {\n    id\n    name\n    description\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation createAiLibrary($ownerId: String!, $data: AiLibraryInput!) {\n          createAiLibrary(ownerId: $ownerId, data: $data) {\n            id\n            name\n          }\n        }\n      ',
): (typeof documents)['\n        mutation createAiLibrary($ownerId: String!, $data: AiLibraryInput!) {\n          createAiLibrary(ownerId: $ownerId, data: $data) {\n            id\n            name\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment LibraryParticipantsDialogButton_Library on AiLibrary {\n    id\n    ownerId\n    participants {\n      id\n    }\n  }\n',
): (typeof documents)['\n  fragment LibraryParticipantsDialogButton_Library on AiLibrary {\n    id\n    ownerId\n    participants {\n      id\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment LibraryParticipants_Library on AiLibrary {\n    id\n    ownerId\n    participants {\n      id\n      name\n      username\n    }\n    ...LibraryParticipantsDialogButton_Library\n  }\n',
): (typeof documents)['\n  fragment LibraryParticipants_Library on AiLibrary {\n    id\n    ownerId\n    participants {\n      id\n      name\n      username\n    }\n    ...LibraryParticipantsDialogButton_Library\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment UserProfileForm_UserProfile on UserProfile {\n    id\n    userId\n    email\n    firstName\n    lastName\n    freeMessages\n    usedMessages\n    freeStorage\n    usedStorage\n    createdAt\n    updatedAt\n    confirmationDate\n    activationDate\n    expiresAt\n    business\n    position\n  }\n',
): (typeof documents)['\n  fragment UserProfileForm_UserProfile on UserProfile {\n    id\n    userId\n    email\n    firstName\n    lastName\n    freeMessages\n    usedMessages\n    freeStorage\n    usedStorage\n    createdAt\n    updatedAt\n    confirmationDate\n    activationDate\n    expiresAt\n    business\n    position\n  }\n']
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
  source: '\n        query aiAssistantCards($userId: String!) {\n          aiAssistants(userId: $userId) {\n            id\n            ...AssistantCard_Assistant\n          }\n        }\n      ',
): (typeof documents)['\n        query aiAssistantCards($userId: String!) {\n          aiAssistants(userId: $userId) {\n            id\n            ...AssistantCard_Assistant\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getUserConversations($userId: String!) {\n    aiConversations(userId: $userId) {\n      id\n      ...ConversationSelector_Conversation\n    }\n  }\n',
): (typeof documents)['\n  query getUserConversations($userId: String!) {\n    aiConversations(userId: $userId) {\n      id\n      ...ConversationSelector_Conversation\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getConversation($conversationId: String!) {\n    aiConversation(conversationId: $conversationId) {\n      ...ConversationParticipants_Conversation\n      ...ConversationDelete_Conversation\n      ...ConversationHistory_Conversation\n      ...ConversationForm_Conversation\n      ...ConversationParticipantsDialogButton_Conversation\n    }\n  }\n',
): (typeof documents)['\n  query getConversation($conversationId: String!) {\n    aiConversation(conversationId: $conversationId) {\n      ...ConversationParticipants_Conversation\n      ...ConversationDelete_Conversation\n      ...ConversationHistory_Conversation\n      ...ConversationForm_Conversation\n      ...ConversationParticipantsDialogButton_Conversation\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getAssignableAssistants($userId: String!) {\n    aiAssistants(userId: $userId) {\n      ...NewConversationSelector_Assistant\n      ...ConversationParticipants_Assistant\n      ...ConversationParticipantsDialogButton_Assistant\n    }\n  }\n',
): (typeof documents)['\n  query getAssignableAssistants($userId: String!) {\n    aiAssistants(userId: $userId) {\n      ...NewConversationSelector_Assistant\n      ...ConversationParticipants_Assistant\n      ...ConversationParticipantsDialogButton_Assistant\n    }\n  }\n']
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
  source: '\n  query userProfile($userId: String!) {\n    userProfile(userId: $userId) {\n      id\n      confirmationDate\n      ...UserProfileForm_UserProfile\n    }\n  }\n',
): (typeof documents)['\n  query userProfile($userId: String!) {\n    userProfile(userId: $userId) {\n      id\n      confirmationDate\n      ...UserProfileForm_UserProfile\n    }\n  }\n']
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
  source: '\n          query aiAssistantDetails($id: String!, $userId: String!) {\n            aiAssistant(id: $id) {\n              ...AssistantForm_Assistant\n              ...AssistantSelector_Assistant\n              ...AssistantLibraries_Assistant\n              ...AssistantBasecaseForm_Assistant\n              ...AssistantParticipants_Assistant\n            }\n            aiAssistants(userId: $userId) {\n              ...AssistantSelector_Assistant\n            }\n            aiLibraryUsage(assistantId: $id) {\n              ...AssistantLibraries_LibraryUsage\n            }\n            aiLibraries(userId: $userId) {\n              ...AssistantLibraries_Library\n            }\n          }\n        ',
): (typeof documents)['\n          query aiAssistantDetails($id: String!, $userId: String!) {\n            aiAssistant(id: $id) {\n              ...AssistantForm_Assistant\n              ...AssistantSelector_Assistant\n              ...AssistantLibraries_Assistant\n              ...AssistantBasecaseForm_Assistant\n              ...AssistantParticipants_Assistant\n            }\n            aiAssistants(userId: $userId) {\n              ...AssistantSelector_Assistant\n            }\n            aiLibraryUsage(assistantId: $id) {\n              ...AssistantLibraries_LibraryUsage\n            }\n            aiLibraries(userId: $userId) {\n              ...AssistantLibraries_Library\n            }\n          }\n        ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation addAssistantParticipant($assistantId: String!, $userIds: [String!]!, $currentUserId: String!) {\n    addAssistantParticipants(assistantId: $assistantId, userIds: $userIds, currentUserId: $currentUserId) {\n      id\n    }\n  }\n',
): (typeof documents)['\n  mutation addAssistantParticipant($assistantId: String!, $userIds: [String!]!, $currentUserId: String!) {\n    addAssistantParticipants(assistantId: $assistantId, userIds: $userIds, currentUserId: $currentUserId) {\n      id\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation removeAssistantParticipant($userId: String!, $assistantId: String!, $currentUserId: String!) {\n    removeAssistantParticipant(userId: $userId, assistantId: $assistantId, currentUserId: $currentUserId) {\n      id\n    }\n  }\n',
): (typeof documents)['\n  mutation removeAssistantParticipant($userId: String!, $assistantId: String!, $currentUserId: String!) {\n    removeAssistantParticipant(userId: $userId, assistantId: $assistantId, currentUserId: $currentUserId) {\n      id\n    }\n  }\n']
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
  source: '\n  mutation addConversationParticipant($conversationId: String!, $userIds: [String!], $assistantIds: [String!]) {\n    addConversationParticipants(conversationId: $conversationId, userIds: $userIds, assistantIds: $assistantIds) {\n      id\n    }\n  }\n',
): (typeof documents)['\n  mutation addConversationParticipant($conversationId: String!, $userIds: [String!], $assistantIds: [String!]) {\n    addConversationParticipants(conversationId: $conversationId, userIds: $userIds, assistantIds: $assistantIds) {\n      id\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation removeConversationParticipant($participantId: String!) {\n    removeConversationParticipant(id: $participantId) {\n      id\n    }\n  }\n',
): (typeof documents)['\n  mutation removeConversationParticipant($participantId: String!) {\n    removeConversationParticipant(id: $participantId) {\n      id\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation createConversationInvitations(\n    $conversationId: String!\n    $inviterId: String!\n    $data: [ConversationInvitationInput!]!\n  ) {\n    createConversationInvitations(conversationId: $conversationId, inviterId: $inviterId, data: $data) {\n      id\n    }\n  }\n',
): (typeof documents)['\n  mutation createConversationInvitations(\n    $conversationId: String!\n    $inviterId: String!\n    $data: [ConversationInvitationInput!]!\n  ) {\n    createConversationInvitations(conversationId: $conversationId, inviterId: $inviterId, data: $data) {\n      id\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation confirmInvitation($conversationId: String!, $invitationId: String!, $userId: String!, $email: String) {\n    confirmConversationInvitation(\n      conversationId: $conversationId\n      invitationId: $invitationId\n      userId: $userId\n      email: $email\n    ) {\n      id\n    }\n  }\n',
): (typeof documents)['\n  mutation confirmInvitation($conversationId: String!, $invitationId: String!, $userId: String!, $email: String) {\n    confirmConversationInvitation(\n      conversationId: $conversationId\n      invitationId: $invitationId\n      userId: $userId\n      email: $email\n    ) {\n      id\n    }\n  }\n']
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
  source: '\n  mutation createConversation($ownerId: String!, $data: AiConversationCreateInput!) {\n    createAiConversation(ownerId: $ownerId, data: $data) {\n      id\n    }\n  }\n',
): (typeof documents)['\n  mutation createConversation($ownerId: String!, $data: AiConversationCreateInput!) {\n    createAiConversation(ownerId: $ownerId, data: $data) {\n      id\n    }\n  }\n']
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
  source: '\n        mutation removeConversations($conversationIds: [String!]!, $userId: String!) {\n          removeAiConversations(conversationIds: $conversationIds, userId: $userId)\n        }\n      ',
): (typeof documents)['\n        mutation removeConversations($conversationIds: [String!]!, $userId: String!) {\n          removeAiConversations(conversationIds: $conversationIds, userId: $userId)\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation leaveConversation($participantId: String!) {\n    leaveAiConversation(id: $participantId) {\n      id\n    }\n  }\n',
): (typeof documents)['\n  mutation leaveConversation($participantId: String!) {\n    leaveAiConversation(id: $participantId) {\n      id\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation addLibraryParticipant($libraryId: String!, $userIds: [String!]!) {\n    addLibraryParticipants(libraryId: $libraryId, userIds: $userIds) {\n      id\n    }\n  }\n',
): (typeof documents)['\n  mutation addLibraryParticipant($libraryId: String!, $userIds: [String!]!) {\n    addLibraryParticipants(libraryId: $libraryId, userIds: $userIds) {\n      id\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation removeLibraryParticipant($userId: String!, $libraryId: String!, $currentUserId: String!) {\n    removeLibraryParticipant(userId: $userId, libraryId: $libraryId, currentUserId: $currentUserId) {\n      id\n    }\n  }\n',
): (typeof documents)['\n  mutation removeLibraryParticipant($userId: String!, $libraryId: String!, $currentUserId: String!) {\n    removeLibraryParticipant(userId: $userId, libraryId: $libraryId, currentUserId: $currentUserId) {\n      id\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query users($userId: String!) {\n    users(userId: $userId) {\n      id\n      username\n      name\n      createdAt\n      email\n      profile {\n        firstName\n        lastName\n        business\n        position\n      }\n    }\n  }\n',
): (typeof documents)['\n  query users($userId: String!) {\n    users(userId: $userId) {\n      id\n      username\n      name\n      createdAt\n      email\n      profile {\n        firstName\n        lastName\n        business\n        position\n      }\n    }\n  }\n']
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
  source: '\n        query getUserProfile($userId: String!) {\n          userProfile(userId: $userId) {\n            id\n            userId\n            email\n            firstName\n            lastName\n            business\n            position\n            freeMessages\n            usedMessages\n            freeStorage\n            usedStorage\n            createdAt\n            updatedAt\n            confirmationDate\n            activationDate\n            expiresAt\n          }\n        }\n      ',
): (typeof documents)['\n        query getUserProfile($userId: String!) {\n          userProfile(userId: $userId) {\n            id\n            userId\n            email\n            firstName\n            lastName\n            business\n            position\n            freeMessages\n            usedMessages\n            freeStorage\n            usedStorage\n            createdAt\n            updatedAt\n            confirmationDate\n            activationDate\n            expiresAt\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation updateUserProfile($userId: String!, $userProfileInput: UserProfileInput!) {\n          updateUserProfile(userId: $userId, input: $userProfileInput) {\n            id\n          }\n        }\n      ',
): (typeof documents)['\n        mutation updateUserProfile($userId: String!, $userProfileInput: UserProfileInput!) {\n          updateUserProfile(userId: $userId, input: $userProfileInput) {\n            id\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation activateUserProfile($profileId: String!) {\n          activateUserProfile(profileId: $profileId) {\n            id\n          }\n        }\n      ',
): (typeof documents)['\n        mutation activateUserProfile($profileId: String!) {\n          activateUserProfile(profileId: $profileId) {\n            id\n          }\n        }\n      ']

export function graphql(source: string) {
  return (documents as any)[source] ?? {}
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never
