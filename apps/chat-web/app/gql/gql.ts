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
  '\n  mutation login($jwtToken: String!) {\n    login(jwtToken: $jwtToken) {\n      id\n      username\n      email\n      name\n      given_name\n      family_name\n      avatarUrl\n      createdAt\n      isAdmin\n    }\n  }\n': typeof types.LoginDocument
  '\n        query GetAiServiceStatus {\n          aiServiceStatus {\n            instances {\n              name\n              url\n              type\n              isOnline\n              version\n              runningModels {\n                name\n                size\n                expiresAt\n                activeRequests\n              }\n              availableModels {\n                name\n                size\n                capabilities\n                family\n                parameterSize\n              }\n              totalVram\n              usedVram\n              modelQueues {\n                modelName\n                queueLength\n                maxConcurrency\n                estimatedRequestSize\n              }\n            }\n            totalInstances\n            availableInstances\n            healthyInstances\n            totalMemory\n            totalUsedMemory\n            totalMaxConcurrency\n            totalQueueLength\n          }\n        }\n      ': typeof types.GetAiServiceStatusDocument
  '\n  query GetQueueSystemStatus {\n    queueSystemStatus {\n      ...QueueSystemStatus_ManagementPanel\n    }\n  }\n': typeof types.GetQueueSystemStatusDocument
  '\n  mutation StartQueueWorker($queueType: QueueType!) {\n    startQueueWorker(queueType: $queueType) {\n      success\n      message\n    }\n  }\n': typeof types.StartQueueWorkerDocument
  '\n  mutation StopQueueWorker($queueType: QueueType!) {\n    stopQueueWorker(queueType: $queueType) {\n      success\n      message\n    }\n  }\n': typeof types.StopQueueWorkerDocument
  '\n  mutation RetryFailedTasks($queueType: QueueType!, $libraryId: String) {\n    retryFailedTasks(queueType: $queueType, libraryId: $libraryId) {\n      success\n      message\n      affectedCount\n    }\n  }\n': typeof types.RetryFailedTasksDocument
  '\n  mutation ClearFailedTasks($queueType: QueueType!, $libraryId: String) {\n    clearFailedTasks(queueType: $queueType, libraryId: $libraryId) {\n      success\n      message\n      affectedCount\n    }\n  }\n': typeof types.ClearFailedTasksDocument
  '\n        mutation ClearTasks($queueType: QueueType!, $libraryId: String) {\n          clearPendingTasks(queueType: $queueType, libraryId: $libraryId) {\n            success\n            message\n            affectedCount\n          }\n        }\n      ': typeof types.ClearTasksDocument
  '\n  mutation CancelContentProcessingTasks($libraryId: String) {\n    cancelContentProcessingTasks(libraryId: $libraryId) {\n      success\n      message\n      affectedCount\n    }\n  }\n': typeof types.CancelContentProcessingTasksDocument
  '\n  fragment QueueSystemStatus_ManagementPanel on QueueSystemStatus {\n    allWorkersRunning\n    totalPendingTasks\n    totalProcessingTasks\n    totalFailedTasks\n    lastUpdated\n    queues {\n      queueType\n      isRunning\n      pendingTasks\n      processingTasks\n      failedTasks\n      completedTasks\n      lastProcessedAt\n    }\n  }\n': typeof types.QueueSystemStatus_ManagementPanelFragmentDoc
  '\n        mutation ensureUserProfile($userId: String!) {\n          ensureUserProfile(userId: $userId) {\n            id\n          }\n        }\n      ': typeof types.EnsureUserProfileDocument
  '\n  fragment ManagedUser on ManagedUser {\n    id\n    username\n    name\n    given_name\n    family_name\n    lastLogin\n    createdAt\n    updatedAt\n    email\n    isAdmin\n    registered\n    business\n    position\n    confirmationDate\n    activationDate\n    avatarUrl\n  }\n': typeof types.ManagedUserFragmentDoc
  '\n        query getManagedUsers($skip: Int!, $take: Int!, $filter: String, $statusFilter: String) {\n          managedUsers(skip: $skip, take: $take, filter: $filter, statusFilter: $statusFilter) {\n            skip\n            take\n            filter\n            userStatistics {\n              total\n              confirmed\n              unconfirmed\n              activated\n              unactivated\n            }\n            users {\n              ...ManagedUser\n            }\n          }\n        }\n      ': typeof types.GetManagedUsersDocument
  '\n        mutation toggleAdminStatus($userId: String!) {\n          toggleAdminStatus(userId: $userId) {\n            id\n            isAdmin\n            username\n          }\n        }\n      ': typeof types.ToggleAdminStatusDocument
  '\n  fragment AssistantSurvey_Assessment on AiActAssessment {\n    assistantId\n\n    assistantSurvey {\n      actionsTitle {\n        de\n        en\n      }\n      actions {\n        level\n        description {\n          de\n          en\n        }\n      }\n      questions {\n        id\n        ...QuestionCard_Question\n      }\n      title {\n        de\n        en\n      }\n      percentCompleted\n      hint {\n        de\n        en\n      }\n      riskIndicator {\n        description {\n          de\n          en\n        }\n        level\n      }\n    }\n  }\n': typeof types.AssistantSurvey_AssessmentFragmentDoc
  '\n        query AiActAssessmentQuery($assistantId: String!) {\n          aiActAssessment(assistantId: $assistantId) {\n            ...RiskAreasIdentification_Assessment\n            ...AssistantSurvey_Assessment\n          }\n        }\n      ': typeof types.AiActAssessmentQueryDocument
  '\n        mutation updateAssessmentQuestion($assistantId: String!, $questionId: String!, $value: String, $notes: String) {\n          updateAssessmentQuestion(assistantId: $assistantId, questionId: $questionId, value: $value, notes: $notes)\n        }\n      ': typeof types.UpdateAssessmentQuestionDocument
  '\n        mutation resetAssessmentAnswers($assistantId: String!) {\n          resetAssessmentAnswers(assistantId: $assistantId)\n        }\n      ': typeof types.ResetAssessmentAnswersDocument
  '\n  fragment ComplianceArea_Compliance on AiActComplianceArea {\n    title {\n      de\n      en\n    }\n    description {\n      de\n      en\n    }\n    mandatory\n  }\n': typeof types.ComplianceArea_ComplianceFragmentDoc
  '\n  fragment QuestionCard_Question on AiActQuestion {\n    id\n    title {\n      de\n      en\n    }\n    notes\n    value\n    hint {\n      de\n      en\n    }\n    options {\n      id\n      title {\n        de\n        en\n      }\n    }\n  }\n': typeof types.QuestionCard_QuestionFragmentDoc
  '\n  fragment RiskAreasIdentification_Assessment on AiActAssessment {\n    identifyRiskInfo {\n      title {\n        de\n        en\n      }\n      legalDisclaimer {\n        title {\n          de\n          en\n        }\n        text {\n          de\n          en\n        }\n      }\n      complianceAreas {\n        id\n        ...ComplianceArea_Compliance\n      }\n    }\n    assistantSurvey {\n      questions {\n        id\n        title {\n          de\n          en\n        }\n        notes\n        value\n        options {\n          id\n          title {\n            de\n            en\n          }\n        }\n      }\n      riskIndicator {\n        description {\n          de\n          en\n        }\n        factors {\n          de\n          en\n        }\n        level\n      }\n    }\n  }\n': typeof types.RiskAreasIdentification_AssessmentFragmentDoc
  '\n        mutation upsertAiBaseCases($assistantId: String!, $baseCases: [AiBaseCaseInputType!]!) {\n          upsertAiBaseCases(assistantId: $assistantId, baseCases: $baseCases) {\n            id\n            sequence\n            condition\n            instruction\n          }\n        }\n      ': typeof types.UpsertAiBaseCasesDocument
  '\n  fragment AssistantBasecaseForm_Assistant on AiAssistant {\n    id\n    baseCases {\n      id\n      sequence\n      condition\n      instruction\n    }\n  }\n': typeof types.AssistantBasecaseForm_AssistantFragmentDoc
  '\n        mutation deleteAiAssistant($assistantId: String!) {\n          deleteAiAssistant(assistantId: $assistantId) {\n            id\n            name\n          }\n        }\n      ': typeof types.DeleteAiAssistantDocument
  '\n  fragment AssistantForm_Assistant on AiAssistant {\n    id\n    name\n    iconUrl\n    description\n    ownerId\n    languageModel\n    updatedAt\n  }\n': typeof types.AssistantForm_AssistantFragmentDoc
  '\n        mutation updateAssistant($id: String!, $data: AiAssistantInput!) {\n          updateAiAssistant(id: $id, data: $data) {\n            id\n          }\n        }\n      ': typeof types.UpdateAssistantDocument
  '\n  fragment AssistantLibraries_Assistant on AiAssistant {\n    id\n    ownerId\n  }\n': typeof types.AssistantLibraries_AssistantFragmentDoc
  '\n  fragment AssistantLibraries_LibraryUsage on AiLibraryUsage {\n    id\n    assistantId\n    libraryId\n    usedFor\n    library {\n      id\n      name\n    }\n  }\n': typeof types.AssistantLibraries_LibraryUsageFragmentDoc
  '\n        mutation addLibraryUsage($assistantId: String!, $libraryId: String!) {\n          addLibraryUsage(assistantId: $assistantId, libraryId: $libraryId) {\n            id\n          }\n        }\n      ': typeof types.AddLibraryUsageDocument
  '\n        mutation removeLibraryUsage($assistantId: String!, $libraryId: String!) {\n          removeLibraryUsage(assistantId: $assistantId, libraryId: $libraryId) {\n            id\n          }\n        }\n      ': typeof types.RemoveLibraryUsageDocument
  '\n          mutation updateLibraryUsage($id: String!, $usedFor: String!) {\n            updateLibraryUsage(id: $id, usedFor: $usedFor) {\n              id\n            }\n          }\n        ': typeof types.UpdateLibraryUsageDocument
  '\n        mutation createAiAssistant($name: String!) {\n          createAiAssistant(name: $name) {\n            id\n            name\n          }\n        }\n      ': typeof types.CreateAiAssistantDocument
  '\n  fragment AssistantParticipantsDialogButton_Assistant on AiAssistant {\n    id\n    ownerId\n    users {\n      id\n    }\n  }\n': typeof types.AssistantParticipantsDialogButton_AssistantFragmentDoc
  '\n  fragment AssistantParticipants_Assistant on AiAssistant {\n    id\n    ownerId\n    users {\n      id\n      name\n      username\n      avatarUrl\n    }\n    ...AssistantParticipantsDialogButton_Assistant\n  }\n': typeof types.AssistantParticipants_AssistantFragmentDoc
  '\n  fragment AssistantSelector_Assistant on AiAssistant {\n    id\n    name\n  }\n': typeof types.AssistantSelector_AssistantFragmentDoc
  '\n  query aiAssistantDetails($assistantId: String!) {\n    aiAssistant(assistantId: $assistantId) {\n      ...AssistantForm_Assistant\n      ...AssistantSelector_Assistant\n      ...AssistantLibraries_Assistant\n      ...AssistantBasecaseForm_Assistant\n      ...AssistantParticipants_Assistant\n    }\n    aiLibraryUsage(assistantId: $assistantId) {\n      ...AssistantLibraries_LibraryUsage\n    }\n  }\n': typeof types.AiAssistantDetailsDocument
  '\n  fragment AssistantBase on AiAssistant {\n    id\n    name\n    description\n    iconUrl\n    updatedAt\n    ownerId\n  }\n': typeof types.AssistantBaseFragmentDoc
  '\n  query aiAssistantCards {\n    aiAssistants {\n      ...AssistantBase\n    }\n  }\n': typeof types.AiAssistantCardsDocument
  '\n  fragment ConversationForm_Conversation on AiConversation {\n    ...ConversationBase\n    assistants {\n      id\n      name\n    }\n  }\n': typeof types.ConversationForm_ConversationFragmentDoc
  '\n  fragment ConversationHistory_Conversation on AiConversation {\n    ...ConversationBase\n    messages {\n      id\n      sequenceNumber\n      content\n      source\n      createdAt\n      hidden\n      sender {\n        __typename\n        id\n        name\n        isBot\n        assistantId\n        ... on HumanParticipant {\n          user {\n            avatarUrl\n          }\n        }\n        ... on AssistantParticipant {\n          assistant {\n            iconUrl\n            updatedAt\n          }\n        }\n      }\n    }\n  }\n': typeof types.ConversationHistory_ConversationFragmentDoc
  '\n  mutation hideMessage($messageId: String!) {\n    hideMessage(messageId: $messageId) {\n      id\n      hidden\n    }\n  }\n': typeof types.HideMessageDocument
  '\n  mutation unhideMessage($messageId: String!) {\n    unhideMessage(messageId: $messageId) {\n      id\n      hidden\n    }\n  }\n': typeof types.UnhideMessageDocument
  '\n  mutation deleteMessage($messageId: String!) {\n    deleteMessage(messageId: $messageId) {\n      id\n    }\n  }\n': typeof types.DeleteMessageDocument
  '\n  fragment ConversationParticipantsDialogButton_Conversation on AiConversation {\n    ...ConversationBase\n    participants {\n      id\n      userId\n      assistantId\n    }\n  }\n': typeof types.ConversationParticipantsDialogButton_ConversationFragmentDoc
  '\n  fragment ConversationParticipantsDialogButton_Assistant on AiAssistant {\n    id\n    name\n  }\n': typeof types.ConversationParticipantsDialogButton_AssistantFragmentDoc
  '\n  fragment ConversationParticipants_Conversation on AiConversation {\n    ...ConversationBase\n    participants {\n      __typename\n      id\n      name\n      userId\n      assistantId\n      ... on HumanParticipant {\n        user {\n          avatarUrl\n          username\n        }\n      }\n      ... on AssistantParticipant {\n        assistant {\n          iconUrl\n          updatedAt\n        }\n      }\n    }\n    ...ConversationParticipantsDialogButton_Conversation\n  }\n': typeof types.ConversationParticipants_ConversationFragmentDoc
  '\n  fragment ConversationParticipants_Assistant on AiAssistant {\n    ...ConversationParticipantsDialogButton_Assistant\n  }\n': typeof types.ConversationParticipants_AssistantFragmentDoc
  '\n  fragment ConversationSelector_Conversation on AiConversation {\n    ...ConversationBase\n    owner {\n      id\n      name\n    }\n    assistants {\n      id\n      name\n    }\n  }\n': typeof types.ConversationSelector_ConversationFragmentDoc
  '\n  fragment ConversationDelete_Conversation on AiConversation {\n    ...ConversationBase\n    assistants {\n      name\n    }\n    participants {\n      id\n      userId\n    }\n  }\n': typeof types.ConversationDelete_ConversationFragmentDoc
  '\n  fragment ConversationDetail on AiConversation {\n    ...ConversationParticipants_Conversation\n    ...ConversationDelete_Conversation\n    ...ConversationHistory_Conversation\n    ...ConversationForm_Conversation\n    ...ConversationParticipantsDialogButton_Conversation\n  }\n': typeof types.ConversationDetailFragmentDoc
  '\n  query getConversation($conversationId: String!) {\n    aiConversation(conversationId: $conversationId) {\n      ...ConversationDetail\n    }\n  }\n': typeof types.GetConversationDocument
  '\n  fragment ConversationBase on AiConversation {\n    id\n    ownerId\n    createdAt\n    updatedAt\n  }\n': typeof types.ConversationBaseFragmentDoc
  '\n  query getUserConversations {\n    aiConversations {\n      id\n      ...ConversationSelector_Conversation\n    }\n  }\n': typeof types.GetUserConversationsDocument
  '\n        mutation createContactRequest($name: String!, $emailOrPhone: String!, $message: String!) {\n          createContactRequest(name: $name, emailOrPhone: $emailOrPhone, message: $message)\n        }\n      ': typeof types.CreateContactRequestDocument
  '\n      query version {\n        version\n      }\n    ': typeof types.VersionDocument
  '\n          mutation validateSharePointConnection($uri: String!, $sharepointAuth: String!) {\n            validateSharePointConnection(uri: $uri, sharepointAuth: $sharepointAuth) {\n              success\n              errorMessage\n              errorType\n            }\n          }\n        ': typeof types.ValidateSharePointConnectionDocument
  '\n        mutation createAiLibraryCrawler(\n          $libraryId: String!\n          $data: AiLibraryCrawlerInput!\n          $credentials: AiLibraryCrawlerCredentialsInput\n        ) {\n          createAiLibraryCrawler(libraryId: $libraryId, data: $data, credentials: $credentials) {\n            id\n          }\n        }\n      ': typeof types.CreateAiLibraryCrawlerDocument
  '\n  fragment CrawlerForm_Crawler on AiLibraryCrawler {\n    id\n    libraryId\n    uri\n    uriType\n    maxDepth\n    maxPages\n    includePatterns\n    excludePatterns\n    maxFileSize\n    minFileSize\n    allowedMimeTypes\n    cronJob {\n      id\n      active\n      hour\n      minute\n      monday\n      tuesday\n      wednesday\n      thursday\n      friday\n      saturday\n      sunday\n    }\n  }\n': typeof types.CrawlerForm_CrawlerFragmentDoc
  '\n  fragment CrawlerTable_LibraryCrawler on AiLibraryCrawler {\n    id\n    uri\n    uriType\n    maxDepth\n    maxPages\n    lastRun {\n      startedAt\n      success\n      errorMessage\n    }\n    cronJob {\n      cronExpression\n    }\n    filesCount\n    ...RunCrawlerButton_Crawler\n  }\n': typeof types.CrawlerTable_LibraryCrawlerFragmentDoc
  '\n        mutation deleteCrawler($id: String!) {\n          deleteAiLibraryCrawler(id: $id) {\n            id\n          }\n        }\n      ': typeof types.DeleteCrawlerDocument
  '\n        query GetCrawlerRun(\n          $libraryId: String!\n          $crawlerRunId: String!\n          $skipUpdates: Int!\n          $takeUpdates: Int!\n          $updateTypeFilter: [String!]\n        ) {\n          aiLibraryCrawlerRun(libraryId: $libraryId, crawlerRunId: $crawlerRunId) {\n            id\n            startedAt\n            endedAt\n            success\n            stoppedByUser\n            errorMessage\n            runByUserId\n            updatesCount\n            filteredUpdatesCount(updateTypeFilter: $updateTypeFilter)\n            updateStats {\n              updateType\n              count\n            }\n            updates(take: $takeUpdates, skip: $skipUpdates, updateTypeFilter: $updateTypeFilter) {\n              id\n              createdAt\n              message\n              updateType\n              filePath\n              fileName\n              fileSize\n              filterType\n              filterValue\n              file {\n                id\n                name\n                originUri\n                mimeType\n                size\n              }\n            }\n          }\n        }\n      ': typeof types.GetCrawlerRunDocument
  '\n        query GetCrawlerRuns($libraryId: String!, $crawlerId: String!, $skip: Int!, $take: Int!) {\n          aiLibraryCrawler(libraryId: $libraryId, crawlerId: $crawlerId) {\n            id\n            runs(take: $take, skip: $skip) {\n              id\n              startedAt\n              endedAt\n              success\n            }\n          }\n        }\n      ': typeof types.GetCrawlerRunsDocument
  '\n        query GetCrawler($libraryId: String!, $crawlerId: String!) {\n          aiLibraryCrawler(libraryId: $libraryId, crawlerId: $crawlerId) {\n            ...CrawlerForm_Crawler\n            id\n            libraryId\n            uri\n            uriType\n            isRunning\n            lastRun {\n              id\n              startedAt\n              endedAt\n              success\n              errorMessage\n            }\n            filesCount\n            runCount\n            maxDepth\n            maxPages\n            cronJob {\n              id\n              active\n              hour\n              minute\n              monday\n              tuesday\n              wednesday\n              thursday\n              friday\n              saturday\n              sunday\n            }\n          }\n        }\n      ': typeof types.GetCrawlerDocument
  '\n        query CrawlerTable($libraryId: String!) {\n          aiLibrary(libraryId: $libraryId) {\n            crawlers {\n              ...CrawlerTable_LibraryCrawler\n            }\n          }\n        }\n      ': typeof types.CrawlerTableDocument
  '\n  fragment RunCrawlerButton_Crawler on AiLibraryCrawler {\n    id\n    libraryId\n    isRunning\n  }\n': typeof types.RunCrawlerButton_CrawlerFragmentDoc
  '\n        mutation runCrawler($crawlerId: String!) {\n          runAiLibraryCrawler(crawlerId: $crawlerId)\n        }\n      ': typeof types.RunCrawlerDocument
  '\n        mutation stopCrawler($crawlerId: String!) {\n          stopAiLibraryCrawler(crawlerId: $crawlerId)\n        }\n      ': typeof types.StopCrawlerDocument
  '\n        mutation updateAiLibraryCrawler(\n          $id: String!\n          $data: AiLibraryCrawlerInput!\n          $credentials: AiLibraryCrawlerCredentialsInput\n        ) {\n          updateAiLibraryCrawler(id: $id, data: $data, credentials: $credentials) {\n            id\n          }\n        }\n      ': typeof types.UpdateAiLibraryCrawlerDocument
  '\n        mutation deleteLibraryFiles($libraryId: String!) {\n          deleteLibraryFiles(libraryId: $libraryId)\n        }\n      ': typeof types.DeleteLibraryFilesDocument
  '\n        mutation deleteFile($fileId: String!) {\n          deleteFile(fileId: $fileId) {\n            id\n            name\n          }\n        }\n      ': typeof types.DeleteFileDocument
  '\n        mutation deleteFiles($fileIds: [ID!]!) {\n          deleteFiles(fileIds: $fileIds)\n        }\n      ': typeof types.DeleteFilesDocument
  '\n          mutation createEmbeddingTasks($id: String!) {\n            createEmbeddingOnlyProcessingTask(fileId: $id) {\n              id\n              file {\n                name\n              }\n            }\n          }\n        ': typeof types.CreateEmbeddingTasksDocument
  '\n          mutation createExtractionTasks($id: String!) {\n            createContentProcessingTask(fileId: $id) {\n              id\n              file {\n                name\n              }\n            }\n          }\n        ': typeof types.CreateExtractionTasksDocument
  '\n        mutation dropOutdatedMarkdownFiles($fileId: String!) {\n          dropOutdatedMarkdowns(fileId: $fileId)\n        }\n      ': typeof types.DropOutdatedMarkdownFilesDocument
  '\n  mutation prepareDesktopFile($file: AiLibraryFileInput!) {\n    prepareFile(data: $file) {\n      id\n    }\n  }\n': typeof types.PrepareDesktopFileDocument
  '\n        mutation cancelFileUpload($fileId: String!) {\n          cancelFileUpload(fileId: $fileId)\n        }\n      ': typeof types.CancelFileUploadDocument
  '\n  fragment AiLibraryFileInfo_CaptionCard on AiLibraryFile {\n    ...AiLibraryFile_FileStatusLabels\n    ...AiLibraryFileInfo_Files\n    ...AiLibraryFile_InfoBox\n    id\n    libraryId\n    name\n    originUri\n  }\n': typeof types.AiLibraryFileInfo_CaptionCardFragmentDoc
  '\n  fragment AiContentProcessingTask_List on AiContentProcessingTask {\n    id\n    createdAt\n    processingStartedAt\n    processingFinishedAt\n    processingFailedAt\n    extractionStartedAt\n    extractionFinishedAt\n    extractionFailedAt\n    embeddingStartedAt\n    embeddingFinishedAt\n    embeddingFailedAt\n    chunksCount\n    chunksSize\n    embeddingModelName\n    extractionOptions\n    processingStatus\n    extractionStatus\n    embeddingStatus\n    metadata\n  }\n': typeof types.AiContentProcessingTask_ListFragmentDoc
  '\n  fragment AiLibraryFile_InfoBox on AiLibraryFile {\n    originModificationDate\n    size\n    uploadedAt\n    archivedAt\n    taskCount\n    status\n    crawler {\n      id\n      uri\n      uriType\n    }\n    lastSuccessfulExtraction {\n      id\n      createdAt\n      extractionStartedAt\n      extractionFinishedAt\n      processingStatus\n      metadata\n    }\n    lastSuccessfulEmbedding {\n      id\n      createdAt\n      embeddingStartedAt\n      embeddingFinishedAt\n      processingStatus\n      metadata\n      chunksCount\n    }\n  }\n': typeof types.AiLibraryFile_InfoBoxFragmentDoc
  '\n  fragment AiLibraryFileInfo_Files on AiLibraryFile {\n    id\n    name\n    sourceFiles {\n      fileName\n      url\n    }\n  }\n': typeof types.AiLibraryFileInfo_FilesFragmentDoc
  '\n  fragment AiLibraryFile_FileStatusLabels on AiLibraryFile {\n    id\n    isLegacyFile\n    lastSuccessfulExtraction {\n      id\n      extractionTimeMs\n      extractionFinishedAt\n      metadata\n    }\n    lastSuccessfulEmbedding {\n      id\n      embeddingTimeMs\n      embeddingFinishedAt\n      metadata\n    }\n    supportedExtractionMethods\n    isLegacyFile\n    name\n  }\n': typeof types.AiLibraryFile_FileStatusLabelsFragmentDoc
  '\n  fragment AiLibraryFile_TableItem on AiLibraryFile {\n    id\n    libraryId\n    name\n    originUri\n    mimeType\n    size\n    uploadedAt\n    dropError\n    createdAt\n    originModificationDate\n    archivedAt\n    taskCount\n    processingStatus\n    extractionStatus\n    embeddingStatus\n    lastSuccessfulEmbedding {\n      id\n      createdAt\n      processingFinishedAt\n      chunksCount\n      chunksSize\n    }\n  }\n': typeof types.AiLibraryFile_TableItemFragmentDoc
  '\n        query getFileChunks($fileId: String!, $skip: Int!, $take: Int!) {\n          aiFileChunks(fileId: $fileId, skip: $skip, take: $take) {\n            fileId\n            fileName\n            take\n            skip\n            count\n            chunks {\n              id\n              text\n              section\n              headingPath\n              chunkIndex\n              subChunkIndex\n            }\n          }\n        }\n      ': typeof types.GetFileChunksDocument
  '\n        query getFileInfo($fileId: String!) {\n          aiLibraryFile(fileId: $fileId) {\n            ...AiLibraryFileInfo_CaptionCard\n            ...AiLibraryFile_MarkdownFileSelector\n            id\n            name\n            originUri\n            docPath\n            mimeType\n            size\n            createdAt\n            updatedAt\n            archivedAt\n            originModificationDate\n            processingStatus\n            extractionStatus\n            embeddingStatus\n            latestExtractionMarkdownFileNames\n            lastUpdate {\n              id\n              createdAt\n              message\n              updateType\n            }\n          }\n        }\n      ': typeof types.GetFileInfoDocument
  '\n        query getSimilarFileChunks($fileId: String!, $term: String, $hits: Int!) {\n          aiSimilarFileChunks(fileId: $fileId, term: $term, hits: $hits) {\n            id\n            fileName\n            fileId\n            originUri\n            text\n            section\n            headingPath\n            chunkIndex\n            subChunkIndex\n            distance\n            points\n          }\n        }\n      ': typeof types.GetSimilarFileChunksDocument
  '\n        query EmbeddingsTable($libraryId: String!, $skip: Int = 0, $take: Int = 20, $showArchived: Boolean = false) {\n          aiLibraryFiles(libraryId: $libraryId, skip: $skip, take: $take, showArchived: $showArchived) {\n            libraryId\n            library {\n              name\n            }\n            take\n            skip\n            showArchived\n            count\n            archivedCount\n            files {\n              ...AiLibraryFile_TableItem\n            }\n          }\n        }\n      ': typeof types.EmbeddingsTableDocument
  '\n        query getMarkdown($fileId: String!, $markdownFileName: String) {\n          aiLibraryFile(fileId: $fileId) {\n            markdown(markdownFileName: $markdownFileName) {\n              fileName\n              content\n            }\n          }\n        }\n      ': typeof types.GetMarkdownDocument
  '\n  fragment AiLibraryFile_MarkdownFileSelector on AiLibraryFile {\n    id\n    libraryId\n    latestExtractionMarkdownFileNames\n    availableExtractionMarkdownFileNames\n  }\n': typeof types.AiLibraryFile_MarkdownFileSelectorFragmentDoc
  '\n  fragment AiLibraryBase on AiLibrary {\n    id\n    name\n    createdAt\n    updatedAt\n    owner {\n      name\n    }\n  }\n': typeof types.AiLibraryBaseFragmentDoc
  '\n  query aiLibraries {\n    aiLibraries {\n      ...AiLibraryBase\n    }\n  }\n': typeof types.AiLibrariesDocument
  '\n  query aiLibraryDetail($libraryId: String!) {\n    aiLibrary(libraryId: $libraryId) {\n      id\n      owner {\n        ...User_EntityParticipantsDialog\n      }\n      participants {\n        id\n        user {\n          ...User_EntityParticipantsDialog\n        }\n      }\n      ...AiLibraryBase\n      ...AiLibraryForm_Library\n      ...LibraryDeleteDialog_Library\n    }\n  }\n': typeof types.AiLibraryDetailDocument
  '\n          mutation prepareFile($file: AiLibraryFileInput!) {\n            prepareFile(data: $file) {\n              id\n            }\n          }\n        ': typeof types.PrepareFileDocument
  '\n          mutation processFile($fileId: String!) {\n            createContentProcessingTask(fileId: $fileId) {\n              id\n            }\n          }\n        ': typeof types.ProcessFileDocument
  '\n  mutation deleteLibraryFiles($libraryId: String!) {\n    deleteLibraryFiles(libraryId: $libraryId)\n  }\n': typeof types.DeleteLibraryFilesDocument
  '\n  mutation deleteLibrary($id: String!) {\n    deleteLibrary(id: $id)\n  }\n': typeof types.DeleteLibraryDocument
  '\n  fragment LibraryDeleteDialog_Library on AiLibrary {\n    id\n    name\n    filesCount\n  }\n': typeof types.LibraryDeleteDialog_LibraryFragmentDoc
  '\n  fragment AiLibraryForm_Library on AiLibrary {\n    id\n    name\n    embeddingTimeoutMs\n    ownerId\n    filesCount\n    description\n    embeddingModelName\n    fileConverterOptions\n  }\n': typeof types.AiLibraryForm_LibraryFragmentDoc
  '\n        mutation createLibrary($data: AiLibraryInput!) {\n          createLibrary(data: $data) {\n            id\n            name\n          }\n        }\n      ': typeof types.CreateLibraryDocument
  '\n        query queryLibraryFiles($libraryId: String!, $query: String!, $skip: Int!, $take: Int!) {\n          queryAiLibraryFiles(libraryId: $libraryId, query: $query, skip: $skip, take: $take) {\n            libraryId\n            query\n            take\n            skip\n            hitCount\n            hits {\n              pageContent\n              docName\n              docId\n              id\n              docPath\n              originUri\n              highlights {\n                field\n                snippet\n              }\n            }\n          }\n        }\n      ': typeof types.QueryLibraryFilesDocument
  '\n        query GetContentProcessingTasks(\n          $libraryId: String!\n          $fileId: String\n          $status: ProcessingStatus\n          $skip: Int\n          $take: Int\n        ) {\n          aiContentProcessingTasks(libraryId: $libraryId, fileId: $fileId, status: $status, skip: $skip, take: $take) {\n            count\n            tasks {\n              ...AiContentProcessingTask_AccordionItem\n            }\n          }\n        }\n      ': typeof types.GetContentProcessingTasksDocument
  '\n  fragment AiContentProcessingTask_AccordionItem on AiContentProcessingTask {\n    id\n    ...AiContentProcessingTask_Timeline\n    file {\n      id\n      name\n      libraryId\n      library {\n        fileConverterOptions\n      }\n    }\n    createdAt\n    timeoutMs\n    metadata\n    extractionOptions\n    extractionStatus\n    embeddingStatus\n    processingTimeMs\n    processingStatus\n    chunksCount\n    chunksSize\n    extractionSubTasks {\n      id\n      extractionMethod\n      markdownFileName\n      startedAt\n      finishedAt\n      failedAt\n    }\n  }\n': typeof types.AiContentProcessingTask_AccordionItemFragmentDoc
  '\n  fragment AiContentProcessingTask_Timeline on AiContentProcessingTask {\n    createdAt\n    processingStartedAt\n    processingFinishedAt\n    processingFailedAt\n    processingTimeout\n    extractionStartedAt\n    extractionFinishedAt\n    extractionFailedAt\n    extractionTimeMs\n    extractionTimeout\n    embeddingStartedAt\n    embeddingFinishedAt\n    embeddingFailedAt\n    embeddingTimeMs\n    embeddingTimeout\n    embeddingModelName\n    extractionSubTasks {\n      id\n      extractionMethod\n      markdownFileName\n      startedAt\n      finishedAt\n      failedAt\n    }\n  }\n': typeof types.AiContentProcessingTask_TimelineFragmentDoc
  '\n        mutation cancelProcessingTask($taskId: String!, $fileId: String!) {\n          cancelProcessingTask(taskId: $taskId, fileId: $fileId) {\n            id\n          }\n        }\n      ': typeof types.CancelProcessingTaskDocument
  '\n  mutation changeLibrary($id: String!, $data: AiLibraryInput!) {\n    updateLibrary(id: $id, data: $data) {\n      ...AiLibraryForm_Library\n    }\n  }\n': typeof types.ChangeLibraryDocument
  '\n        query libraryUpdatesList($libraryId: ID!, $crawlerId: ID, $take: Int, $skip: Int) {\n          aiLibraryUpdates(libraryId: $libraryId, crawlerId: $crawlerId, take: $take, skip: $skip) {\n            libraryId\n            library {\n              name\n            }\n            crawlerId\n            take\n            skip\n            count\n            updates {\n              ...AiLibraryUpdate_TableItem\n            }\n          }\n        }\n      ': typeof types.LibraryUpdatesListDocument
  '\n  fragment AiLibraryUpdate_TableItem on AiLibraryUpdate {\n    id\n    createdAt\n    libraryId\n    crawlerRunId\n    crawlerRun {\n      id\n      crawlerId\n      crawler {\n        id\n        uri\n        uriType\n      }\n    }\n    fileId\n    file {\n      id\n      name\n    }\n    message\n    updateType\n    filePath\n    fileName\n    fileSize\n    filterType\n    filterValue\n  }\n': typeof types.AiLibraryUpdate_TableItemFragmentDoc
  '\n        mutation updateLibraryParticipants($libraryId: String!, $userIds: [String!]!) {\n          updateLibraryParticipants(libraryId: $libraryId, userIds: $userIds) {\n            totalParticipants\n            addedParticipants\n            removedParticipants\n          }\n        }\n      ': typeof types.UpdateLibraryParticipantsDocument
  '\n        mutation removeLibraryParticipant($libraryId: String!, $participantId: String!) {\n          removeLibraryParticipant(libraryId: $libraryId, participantId: $participantId)\n        }\n      ': typeof types.RemoveLibraryParticipantDocument
  '\n  fragment ListEditForm_List on AiList {\n    id\n    name\n    ownerId\n    createdAt\n    updatedAt\n  }\n': typeof types.ListEditForm_ListFragmentDoc
  '\n  fragment FieldModal_List on AiList {\n    id\n    fields {\n      id\n      name\n      type\n      sourceType\n    }\n  }\n': typeof types.FieldModal_ListFragmentDoc
  '\n  fragment FieldModal_EditableField on AiListField {\n    id\n    name\n    type\n    prompt\n    contentQuery\n    languageModel\n    useVectorStore\n    order\n    context {\n      contextFieldId\n    }\n  }\n': typeof types.FieldModal_EditableFieldFragmentDoc
  '\n  fragment ListExport_Field on AiListField {\n    id\n    name\n    type\n    order\n    sourceType\n    fileProperty\n  }\n': typeof types.ListExport_FieldFragmentDoc
  '\n  fragment ListExport_List on AiList {\n    id\n    name\n    fields {\n      ...ListExport_Field\n    }\n  }\n': typeof types.ListExport_ListFragmentDoc
  '\n  fragment ListFieldsTableFilters_AiListField on AiListField {\n    id\n    name\n    type\n  }\n': typeof types.ListFieldsTableFilters_AiListFieldFragmentDoc
  '\n  fragment ListFieldsTableMenu_AiListField on AiListField {\n    id\n    name\n    type\n  }\n': typeof types.ListFieldsTableMenu_AiListFieldFragmentDoc
  '\n  fragment ListItemTable_Item on ListItemResult {\n    id\n    name\n    libraryId\n    libraryName\n  }\n': typeof types.ListItemTable_ItemFragmentDoc
  '\n  fragment ListFilesTable_FilesQueryResult on ListItemsQueryResult {\n    count\n    take\n    skip\n    orderBy\n    orderDirection\n    items {\n      origin {\n        ...ListItemTable_Item\n      }\n    }\n  }\n': typeof types.ListFilesTable_FilesQueryResultFragmentDoc
  '\n  fragment ListFieldsTable_Field on AiListField {\n    id\n    listId\n    name\n    type\n    order\n    sourceType\n    fileProperty\n    prompt\n    contentQuery\n    languageModel\n    useVectorStore\n    pendingItemsCount\n    processingItemsCount\n    context {\n      contextFieldId\n    }\n    ...ListFieldsTableFilters_AiListField\n    ...ListFieldsTableMenu_AiListField\n  }\n': typeof types.ListFieldsTable_FieldFragmentDoc
  '\n  fragment ListFieldsTable_List on AiList {\n    id\n    fields {\n      ...ListFieldsTable_Field\n    }\n  }\n': typeof types.ListFieldsTable_ListFragmentDoc
  '\n  fragment ListMenu_AiList on AiList {\n    id\n    name\n    ownerId\n    owner {\n      ...User_EntityParticipantsDialog\n    }\n    participants {\n      id\n      user {\n        ...User_EntityParticipantsDialog\n      }\n    }\n  }\n': typeof types.ListMenu_AiListFragmentDoc
  '\n  fragment ListMenu_AiLists on AiList {\n    id\n    name\n  }\n': typeof types.ListMenu_AiListsFragmentDoc
  '\n  fragment ListSourcesManager_List on AiList {\n    id\n    name\n    sources {\n      id\n      libraryId\n      library {\n        id\n        name\n        owner {\n          name\n        }\n      }\n    }\n  }\n': typeof types.ListSourcesManager_ListFragmentDoc
  '\n        mutation addListField($listId: String!, $data: AiListFieldInput!) {\n          addListField(listId: $listId, data: $data) {\n            id\n            name\n            type\n            order\n            sourceType\n            fileProperty\n            prompt\n            contentQuery\n            languageModel\n          }\n        }\n      ': typeof types.AddListFieldDocument
  '\n        mutation addListSource($listId: String!, $data: AiListSourceInput!) {\n          addListSource(listId: $listId, data: $data) {\n            id\n            libraryId\n            library {\n              id\n              name\n              owner {\n                name\n              }\n            }\n          }\n        }\n      ': typeof types.AddListSourceDocument
  '\n  mutation CleanEnrichments($listId: String!, $fieldId: String!) {\n    cleanListEnrichments(listId: $listId, fieldId: $fieldId) {\n      success\n      clearedItems\n      error\n    }\n  }\n': typeof types.CleanEnrichmentsDocument
  '\n        mutation createList($data: AiListInput!) {\n          createList(data: $data) {\n            id\n          }\n        }\n      ': typeof types.CreateListDocument
  '\n        mutation deleteList($id: String!) {\n          deleteList(id: $id) {\n            id\n            name\n          }\n        }\n      ': typeof types.DeleteListDocument
  '\n  query aiListFilesWithValues(\n    $listId: String!\n    $skip: Int!\n    $take: Int!\n    $orderBy: String\n    $orderDirection: String\n    $fieldIds: [String!]!\n    $filters: [AiListFilterInput!]!\n  ) {\n    aiListItems(\n      listId: $listId\n      fieldIds: $fieldIds\n      filters: $filters\n      skip: $skip\n      take: $take\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n    ) {\n      count\n      take\n      skip\n      orderBy\n      orderDirection\n      items {\n        origin {\n          id\n          type\n          name\n          libraryId\n          libraryName\n        }\n        values {\n          fieldId\n          fieldName\n          displayValue\n          enrichmentErrorMessage\n          queueStatus\n        }\n      }\n    }\n  }\n': typeof types.AiListFilesWithValuesDocument
  '\n        query getList($listId: String!) {\n          aiList(id: $listId) {\n            id\n            ...ListsBase\n            ...ListEditForm_List\n            ...ListSourcesManager_List\n            ...ListFieldsTable_List\n            ...ListMenu_AiList\n          }\n        }\n      ': typeof types.GetListDocument
  '\n  fragment ListsBase on AiList {\n    id\n    ownerId\n    createdAt\n    updatedAt\n  }\n': typeof types.ListsBaseFragmentDoc
  '\n      query getUserLists {\n        aiLists {\n          ...ListsBase\n          ...ListMenu_AiLists\n        }\n      }\n    ': typeof types.GetUserListsDocument
  '\n  query ListExportData($listId: String!, $skip: Int!, $take: Int!, $fieldIds: [String!]!) {\n    aiList(id: $listId) {\n      ...ListExport_List\n    }\n    aiListItems(\n      listId: $listId\n      fieldIds: $fieldIds\n      skip: $skip\n      take: $take\n      orderBy: "name"\n      orderDirection: "asc"\n    ) {\n      count\n      items {\n        origin {\n          id\n          name\n          libraryId\n          libraryName\n        }\n        values {\n          fieldId\n          fieldName\n          displayValue\n        }\n      }\n    }\n  }\n': typeof types.ListExportDataDocument
  '\n        mutation removeFromEnrichmentQueue($listId: String!, $fieldId: String!, $fileId: String!) {\n          removeFromEnrichmentQueue(listId: $listId, fieldId: $fieldId, fileId: $fileId) {\n            success\n            queuedItems\n            error\n          }\n        }\n      ': typeof types.RemoveFromEnrichmentQueueDocument
  '\n        mutation removeListField($id: String!) {\n          removeListField(id: $id) {\n            id\n          }\n        }\n      ': typeof types.RemoveListFieldDocument
  '\n        mutation removeListSource($id: String!) {\n          removeListSource(id: $id) {\n            id\n          }\n        }\n      ': typeof types.RemoveListSourceDocument
  '\n  mutation StartListEnrichment($listId: String!, $fieldId: String!) {\n    startListEnrichment(listId: $listId, fieldId: $fieldId) {\n      success\n      queuedItems\n      error\n    }\n  }\n': typeof types.StartListEnrichmentDocument
  '\n        mutation startSingleEnrichment($listId: String!, $fieldId: String!, $fileId: String!) {\n          startSingleEnrichment(listId: $listId, fieldId: $fieldId, fileId: $fileId) {\n            success\n            error\n          }\n        }\n      ': typeof types.StartSingleEnrichmentDocument
  '\n  mutation StopListEnrichment($listId: String!, $fieldId: String!) {\n    stopListEnrichment(listId: $listId, fieldId: $fieldId) {\n      success\n      queuedItems\n      error\n    }\n  }\n': typeof types.StopListEnrichmentDocument
  '\n        mutation updateListField($id: String!, $data: AiListFieldInput!) {\n          updateListField(id: $id, data: $data) {\n            id\n            name\n            type\n            order\n            sourceType\n            fileProperty\n            prompt\n            contentQuery\n            languageModel\n          }\n        }\n      ': typeof types.UpdateListFieldDocument
  '\n        mutation updateList($id: String!, $data: AiListInput!) {\n          updateList(id: $id, data: $data) {\n            id\n          }\n        }\n      ': typeof types.UpdateListDocument
  '\n        mutation updateListParticipants($listId: String!, $userIds: [String!]!) {\n          updateListParticipants(listId: $listId, userIds: $userIds) {\n            addedParticipants\n            removedParticipants\n            totalParticipants\n          }\n        }\n      ': typeof types.UpdateListParticipantsDocument
  '\n        mutation removeListParticipant($listId: String!, $participantId: String!) {\n          removeListParticipant(listId: $listId, participantId: $participantId)\n        }\n      ': typeof types.RemoveListParticipantDocument
  '\n      query aiChatModels {\n        aiChatModels\n      }\n    ': typeof types.AiChatModelsDocument
  '\n      query aiEmbeddingModels {\n        aiEmbeddingModels\n      }\n    ': typeof types.AiEmbeddingModelsDocument
  '\n  fragment User_EntityParticipantsDialog on User {\n    id\n    name\n    username\n    given_name\n    family_name\n    email\n    avatarUrl\n    profile {\n      position\n      business\n    }\n  }\n\n  fragment Assistant_EntityParticipantsDialog on AiAssistant {\n    id\n    name\n    description\n    iconUrl\n    ownerId\n  }\n': typeof types.User_EntityParticipantsDialogFragmentDoc
  '\n  fragment UserProfileForm_UserProfile on UserProfile {\n    id\n    userId\n    email\n    firstName\n    lastName\n    freeMessages\n    usedMessages\n    freeStorage\n    usedStorage\n    createdAt\n    updatedAt\n    confirmationDate\n    activationDate\n    expiresAt\n    business\n    position\n  }\n': typeof types.UserProfileForm_UserProfileFragmentDoc
  '\n        mutation saveUserProfile($profileId: String!, $userProfileInput: UserProfileInput!) {\n          updateUserProfile(profileId: $profileId, input: $userProfileInput) {\n            id\n          }\n        }\n      ': typeof types.SaveUserProfileDocument
  '\n  query userProfile {\n    userProfile {\n      id\n      confirmationDate\n      ...UserProfileForm_UserProfile\n    }\n  }\n': typeof types.UserProfileDocument
  '\n  mutation addAssistantParticipant($assistantId: String!, $userIds: [String!]!) {\n    addAssistantParticipants(assistantId: $assistantId, userIds: $userIds) {\n      id\n    }\n  }\n': typeof types.AddAssistantParticipantDocument
  '\n  mutation removeAssistantParticipant($assistantId: String!, $userId: String!) {\n    removeAssistantParticipant(assistantId: $assistantId, userId: $userId) {\n      id\n    }\n  }\n': typeof types.RemoveAssistantParticipantDocument
  '\n  mutation leaveAssistantParticipant($assistantId: String!) {\n    leaveAssistantParticipant(assistantId: $assistantId) {\n      id\n    }\n  }\n': typeof types.LeaveAssistantParticipantDocument
  '\n        mutation updateUserAvatar($avatarUrl: String) {\n          updateUserAvatar(avatarUrl: $avatarUrl) {\n            id\n            avatarUrl\n          }\n        }\n      ': typeof types.UpdateUserAvatarDocument
  '\n  query IntrospectionQuery {\n    __schema {\n      description\n      queryType {\n        name\n      }\n      mutationType {\n        name\n      }\n      subscriptionType {\n        name\n      }\n      types {\n        ...FullType\n      }\n      directives {\n        name\n        description\n        locations\n        args {\n          ...InputValue\n        }\n      }\n    }\n  }\n  fragment FullType on __Type {\n    kind\n    name\n    description\n    fields(includeDeprecated: true) {\n      name\n      description\n      args {\n        ...InputValue\n      }\n      type {\n        ...TypeRef\n      }\n      isDeprecated\n      deprecationReason\n    }\n    inputFields {\n      ...InputValue\n    }\n    interfaces {\n      ...TypeRef\n    }\n    enumValues(includeDeprecated: true) {\n      name\n      description\n      isDeprecated\n      deprecationReason\n    }\n    possibleTypes {\n      ...TypeRef\n    }\n  }\n  fragment InputValue on __InputValue {\n    name\n    description\n    type {\n      ...TypeRef\n    }\n    defaultValue\n  }\n  fragment TypeRef on __Type {\n    kind\n    name\n    ofType {\n      kind\n      name\n      ofType {\n        kind\n        name\n        ofType {\n          kind\n          name\n          ofType {\n            kind\n            name\n            ofType {\n              kind\n              name\n              ofType {\n                kind\n                name\n                ofType {\n                  kind\n                  name\n                  ofType {\n                    kind\n                    name\n                    ofType {\n                      kind\n                      name\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n': typeof types.IntrospectionQueryDocument
  '\n  mutation addConversationParticipant($conversationId: String!, $userIds: [String!], $assistantIds: [String!]) {\n    addConversationParticipants(conversationId: $conversationId, userIds: $userIds, assistantIds: $assistantIds) {\n      id\n    }\n  }\n': typeof types.AddConversationParticipantDocument
  '\n  mutation removeConversationParticipant($participantId: String!) {\n    removeConversationParticipant(participantId: $participantId) {\n      id\n    }\n  }\n': typeof types.RemoveConversationParticipantDocument
  '\n  mutation createConversationInvitations($conversationId: String!, $data: [ConversationInvitationInput!]!) {\n    createConversationInvitations(conversationId: $conversationId, data: $data) {\n      id\n    }\n  }\n': typeof types.CreateConversationInvitationsDocument
  '\n  mutation confirmInvitation($conversationId: String!, $invitationId: String!) {\n    confirmConversationInvitation(conversationId: $conversationId, invitationId: $invitationId) {\n      id\n    }\n  }\n': typeof types.ConfirmInvitationDocument
  '\n  mutation sendMessage($data: AiConversationMessageInput!) {\n    sendMessage(data: $data) {\n      id\n      createdAt\n    }\n  }\n': typeof types.SendMessageDocument
  '\n  mutation createConversation($data: AiConversationCreateInput!) {\n    createAiConversation(data: $data) {\n      id\n    }\n  }\n': typeof types.CreateConversationDocument
  '\n  mutation deleteConversation($conversationId: String!) {\n    deleteAiConversation(conversationId: $conversationId) {\n      id\n    }\n  }\n': typeof types.DeleteConversationDocument
  '\n        mutation deleteConversations($conversationIds: [String!]!) {\n          deleteAiConversations(conversationIds: $conversationIds)\n        }\n      ': typeof types.DeleteConversationsDocument
  '\n  mutation leaveConversation($participantId: String!) {\n    leaveAiConversation(participantId: $participantId) {\n      id\n    }\n  }\n': typeof types.LeaveConversationDocument
  '\n  fragment User on User {\n    id\n    username\n    name\n    createdAt\n    email\n    avatarUrl\n    isAdmin\n    profile {\n      firstName\n      lastName\n      business\n      position\n      confirmationDate\n      activationDate\n    }\n  }\n': typeof types.UserFragmentDoc
  '\n  query users {\n    users {\n      ...User\n    }\n  }\n': typeof types.UsersDocument
  '\n        mutation sendConfirmationMail($confirmationUrl: String!, $activationUrl: String!) {\n          sendConfirmationMail(confirmationUrl: $confirmationUrl, activationUrl: $activationUrl)\n        }\n      ': typeof types.SendConfirmationMailDocument
  '\n        mutation confirmUserProfile($profileId: String!) {\n          confirmUserProfile(profileId: $profileId) {\n            id\n          }\n        }\n      ': typeof types.ConfirmUserProfileDocument
  '\n  fragment UserProfile on UserProfile {\n    id\n    userId\n    email\n    firstName\n    lastName\n    business\n    position\n    freeMessages\n    usedMessages\n    freeStorage\n    usedStorage\n    createdAt\n    updatedAt\n    confirmationDate\n    activationDate\n    expiresAt\n  }\n': typeof types.UserProfileFragmentDoc
  '\n      query getUserProfile {\n        userProfile {\n          ...UserProfile\n        }\n      }\n    ': typeof types.GetUserProfileDocument
  '\n        mutation updateUserProfile($profileId: String!, $userProfileInput: UserProfileInput!) {\n          updateUserProfile(profileId: $profileId, input: $userProfileInput) {\n            id\n          }\n        }\n      ': typeof types.UpdateUserProfileDocument
  '\n        mutation activateUserProfile($profileId: String!) {\n          activateUserProfile(profileId: $profileId) {\n            id\n          }\n        }\n      ': typeof types.ActivateUserProfileDocument
  '\n  query adminUserById($email: String!) {\n    user(email: $email) {\n      ...User\n      profile {\n        ...UserProfileForm_UserProfile\n      }\n    }\n  }\n': typeof types.AdminUserByIdDocument
}
const documents: Documents = {
  '\n  mutation login($jwtToken: String!) {\n    login(jwtToken: $jwtToken) {\n      id\n      username\n      email\n      name\n      given_name\n      family_name\n      avatarUrl\n      createdAt\n      isAdmin\n    }\n  }\n':
    types.LoginDocument,
  '\n        query GetAiServiceStatus {\n          aiServiceStatus {\n            instances {\n              name\n              url\n              type\n              isOnline\n              version\n              runningModels {\n                name\n                size\n                expiresAt\n                activeRequests\n              }\n              availableModels {\n                name\n                size\n                capabilities\n                family\n                parameterSize\n              }\n              totalVram\n              usedVram\n              modelQueues {\n                modelName\n                queueLength\n                maxConcurrency\n                estimatedRequestSize\n              }\n            }\n            totalInstances\n            availableInstances\n            healthyInstances\n            totalMemory\n            totalUsedMemory\n            totalMaxConcurrency\n            totalQueueLength\n          }\n        }\n      ':
    types.GetAiServiceStatusDocument,
  '\n  query GetQueueSystemStatus {\n    queueSystemStatus {\n      ...QueueSystemStatus_ManagementPanel\n    }\n  }\n':
    types.GetQueueSystemStatusDocument,
  '\n  mutation StartQueueWorker($queueType: QueueType!) {\n    startQueueWorker(queueType: $queueType) {\n      success\n      message\n    }\n  }\n':
    types.StartQueueWorkerDocument,
  '\n  mutation StopQueueWorker($queueType: QueueType!) {\n    stopQueueWorker(queueType: $queueType) {\n      success\n      message\n    }\n  }\n':
    types.StopQueueWorkerDocument,
  '\n  mutation RetryFailedTasks($queueType: QueueType!, $libraryId: String) {\n    retryFailedTasks(queueType: $queueType, libraryId: $libraryId) {\n      success\n      message\n      affectedCount\n    }\n  }\n':
    types.RetryFailedTasksDocument,
  '\n  mutation ClearFailedTasks($queueType: QueueType!, $libraryId: String) {\n    clearFailedTasks(queueType: $queueType, libraryId: $libraryId) {\n      success\n      message\n      affectedCount\n    }\n  }\n':
    types.ClearFailedTasksDocument,
  '\n        mutation ClearTasks($queueType: QueueType!, $libraryId: String) {\n          clearPendingTasks(queueType: $queueType, libraryId: $libraryId) {\n            success\n            message\n            affectedCount\n          }\n        }\n      ':
    types.ClearTasksDocument,
  '\n  mutation CancelContentProcessingTasks($libraryId: String) {\n    cancelContentProcessingTasks(libraryId: $libraryId) {\n      success\n      message\n      affectedCount\n    }\n  }\n':
    types.CancelContentProcessingTasksDocument,
  '\n  fragment QueueSystemStatus_ManagementPanel on QueueSystemStatus {\n    allWorkersRunning\n    totalPendingTasks\n    totalProcessingTasks\n    totalFailedTasks\n    lastUpdated\n    queues {\n      queueType\n      isRunning\n      pendingTasks\n      processingTasks\n      failedTasks\n      completedTasks\n      lastProcessedAt\n    }\n  }\n':
    types.QueueSystemStatus_ManagementPanelFragmentDoc,
  '\n        mutation ensureUserProfile($userId: String!) {\n          ensureUserProfile(userId: $userId) {\n            id\n          }\n        }\n      ':
    types.EnsureUserProfileDocument,
  '\n  fragment ManagedUser on ManagedUser {\n    id\n    username\n    name\n    given_name\n    family_name\n    lastLogin\n    createdAt\n    updatedAt\n    email\n    isAdmin\n    registered\n    business\n    position\n    confirmationDate\n    activationDate\n    avatarUrl\n  }\n':
    types.ManagedUserFragmentDoc,
  '\n        query getManagedUsers($skip: Int!, $take: Int!, $filter: String, $statusFilter: String) {\n          managedUsers(skip: $skip, take: $take, filter: $filter, statusFilter: $statusFilter) {\n            skip\n            take\n            filter\n            userStatistics {\n              total\n              confirmed\n              unconfirmed\n              activated\n              unactivated\n            }\n            users {\n              ...ManagedUser\n            }\n          }\n        }\n      ':
    types.GetManagedUsersDocument,
  '\n        mutation toggleAdminStatus($userId: String!) {\n          toggleAdminStatus(userId: $userId) {\n            id\n            isAdmin\n            username\n          }\n        }\n      ':
    types.ToggleAdminStatusDocument,
  '\n  fragment AssistantSurvey_Assessment on AiActAssessment {\n    assistantId\n\n    assistantSurvey {\n      actionsTitle {\n        de\n        en\n      }\n      actions {\n        level\n        description {\n          de\n          en\n        }\n      }\n      questions {\n        id\n        ...QuestionCard_Question\n      }\n      title {\n        de\n        en\n      }\n      percentCompleted\n      hint {\n        de\n        en\n      }\n      riskIndicator {\n        description {\n          de\n          en\n        }\n        level\n      }\n    }\n  }\n':
    types.AssistantSurvey_AssessmentFragmentDoc,
  '\n        query AiActAssessmentQuery($assistantId: String!) {\n          aiActAssessment(assistantId: $assistantId) {\n            ...RiskAreasIdentification_Assessment\n            ...AssistantSurvey_Assessment\n          }\n        }\n      ':
    types.AiActAssessmentQueryDocument,
  '\n        mutation updateAssessmentQuestion($assistantId: String!, $questionId: String!, $value: String, $notes: String) {\n          updateAssessmentQuestion(assistantId: $assistantId, questionId: $questionId, value: $value, notes: $notes)\n        }\n      ':
    types.UpdateAssessmentQuestionDocument,
  '\n        mutation resetAssessmentAnswers($assistantId: String!) {\n          resetAssessmentAnswers(assistantId: $assistantId)\n        }\n      ':
    types.ResetAssessmentAnswersDocument,
  '\n  fragment ComplianceArea_Compliance on AiActComplianceArea {\n    title {\n      de\n      en\n    }\n    description {\n      de\n      en\n    }\n    mandatory\n  }\n':
    types.ComplianceArea_ComplianceFragmentDoc,
  '\n  fragment QuestionCard_Question on AiActQuestion {\n    id\n    title {\n      de\n      en\n    }\n    notes\n    value\n    hint {\n      de\n      en\n    }\n    options {\n      id\n      title {\n        de\n        en\n      }\n    }\n  }\n':
    types.QuestionCard_QuestionFragmentDoc,
  '\n  fragment RiskAreasIdentification_Assessment on AiActAssessment {\n    identifyRiskInfo {\n      title {\n        de\n        en\n      }\n      legalDisclaimer {\n        title {\n          de\n          en\n        }\n        text {\n          de\n          en\n        }\n      }\n      complianceAreas {\n        id\n        ...ComplianceArea_Compliance\n      }\n    }\n    assistantSurvey {\n      questions {\n        id\n        title {\n          de\n          en\n        }\n        notes\n        value\n        options {\n          id\n          title {\n            de\n            en\n          }\n        }\n      }\n      riskIndicator {\n        description {\n          de\n          en\n        }\n        factors {\n          de\n          en\n        }\n        level\n      }\n    }\n  }\n':
    types.RiskAreasIdentification_AssessmentFragmentDoc,
  '\n        mutation upsertAiBaseCases($assistantId: String!, $baseCases: [AiBaseCaseInputType!]!) {\n          upsertAiBaseCases(assistantId: $assistantId, baseCases: $baseCases) {\n            id\n            sequence\n            condition\n            instruction\n          }\n        }\n      ':
    types.UpsertAiBaseCasesDocument,
  '\n  fragment AssistantBasecaseForm_Assistant on AiAssistant {\n    id\n    baseCases {\n      id\n      sequence\n      condition\n      instruction\n    }\n  }\n':
    types.AssistantBasecaseForm_AssistantFragmentDoc,
  '\n        mutation deleteAiAssistant($assistantId: String!) {\n          deleteAiAssistant(assistantId: $assistantId) {\n            id\n            name\n          }\n        }\n      ':
    types.DeleteAiAssistantDocument,
  '\n  fragment AssistantForm_Assistant on AiAssistant {\n    id\n    name\n    iconUrl\n    description\n    ownerId\n    languageModel\n    updatedAt\n  }\n':
    types.AssistantForm_AssistantFragmentDoc,
  '\n        mutation updateAssistant($id: String!, $data: AiAssistantInput!) {\n          updateAiAssistant(id: $id, data: $data) {\n            id\n          }\n        }\n      ':
    types.UpdateAssistantDocument,
  '\n  fragment AssistantLibraries_Assistant on AiAssistant {\n    id\n    ownerId\n  }\n':
    types.AssistantLibraries_AssistantFragmentDoc,
  '\n  fragment AssistantLibraries_LibraryUsage on AiLibraryUsage {\n    id\n    assistantId\n    libraryId\n    usedFor\n    library {\n      id\n      name\n    }\n  }\n':
    types.AssistantLibraries_LibraryUsageFragmentDoc,
  '\n        mutation addLibraryUsage($assistantId: String!, $libraryId: String!) {\n          addLibraryUsage(assistantId: $assistantId, libraryId: $libraryId) {\n            id\n          }\n        }\n      ':
    types.AddLibraryUsageDocument,
  '\n        mutation removeLibraryUsage($assistantId: String!, $libraryId: String!) {\n          removeLibraryUsage(assistantId: $assistantId, libraryId: $libraryId) {\n            id\n          }\n        }\n      ':
    types.RemoveLibraryUsageDocument,
  '\n          mutation updateLibraryUsage($id: String!, $usedFor: String!) {\n            updateLibraryUsage(id: $id, usedFor: $usedFor) {\n              id\n            }\n          }\n        ':
    types.UpdateLibraryUsageDocument,
  '\n        mutation createAiAssistant($name: String!) {\n          createAiAssistant(name: $name) {\n            id\n            name\n          }\n        }\n      ':
    types.CreateAiAssistantDocument,
  '\n  fragment AssistantParticipantsDialogButton_Assistant on AiAssistant {\n    id\n    ownerId\n    users {\n      id\n    }\n  }\n':
    types.AssistantParticipantsDialogButton_AssistantFragmentDoc,
  '\n  fragment AssistantParticipants_Assistant on AiAssistant {\n    id\n    ownerId\n    users {\n      id\n      name\n      username\n      avatarUrl\n    }\n    ...AssistantParticipantsDialogButton_Assistant\n  }\n':
    types.AssistantParticipants_AssistantFragmentDoc,
  '\n  fragment AssistantSelector_Assistant on AiAssistant {\n    id\n    name\n  }\n':
    types.AssistantSelector_AssistantFragmentDoc,
  '\n  query aiAssistantDetails($assistantId: String!) {\n    aiAssistant(assistantId: $assistantId) {\n      ...AssistantForm_Assistant\n      ...AssistantSelector_Assistant\n      ...AssistantLibraries_Assistant\n      ...AssistantBasecaseForm_Assistant\n      ...AssistantParticipants_Assistant\n    }\n    aiLibraryUsage(assistantId: $assistantId) {\n      ...AssistantLibraries_LibraryUsage\n    }\n  }\n':
    types.AiAssistantDetailsDocument,
  '\n  fragment AssistantBase on AiAssistant {\n    id\n    name\n    description\n    iconUrl\n    updatedAt\n    ownerId\n  }\n':
    types.AssistantBaseFragmentDoc,
  '\n  query aiAssistantCards {\n    aiAssistants {\n      ...AssistantBase\n    }\n  }\n':
    types.AiAssistantCardsDocument,
  '\n  fragment ConversationForm_Conversation on AiConversation {\n    ...ConversationBase\n    assistants {\n      id\n      name\n    }\n  }\n':
    types.ConversationForm_ConversationFragmentDoc,
  '\n  fragment ConversationHistory_Conversation on AiConversation {\n    ...ConversationBase\n    messages {\n      id\n      sequenceNumber\n      content\n      source\n      createdAt\n      hidden\n      sender {\n        __typename\n        id\n        name\n        isBot\n        assistantId\n        ... on HumanParticipant {\n          user {\n            avatarUrl\n          }\n        }\n        ... on AssistantParticipant {\n          assistant {\n            iconUrl\n            updatedAt\n          }\n        }\n      }\n    }\n  }\n':
    types.ConversationHistory_ConversationFragmentDoc,
  '\n  mutation hideMessage($messageId: String!) {\n    hideMessage(messageId: $messageId) {\n      id\n      hidden\n    }\n  }\n':
    types.HideMessageDocument,
  '\n  mutation unhideMessage($messageId: String!) {\n    unhideMessage(messageId: $messageId) {\n      id\n      hidden\n    }\n  }\n':
    types.UnhideMessageDocument,
  '\n  mutation deleteMessage($messageId: String!) {\n    deleteMessage(messageId: $messageId) {\n      id\n    }\n  }\n':
    types.DeleteMessageDocument,
  '\n  fragment ConversationParticipantsDialogButton_Conversation on AiConversation {\n    ...ConversationBase\n    participants {\n      id\n      userId\n      assistantId\n    }\n  }\n':
    types.ConversationParticipantsDialogButton_ConversationFragmentDoc,
  '\n  fragment ConversationParticipantsDialogButton_Assistant on AiAssistant {\n    id\n    name\n  }\n':
    types.ConversationParticipantsDialogButton_AssistantFragmentDoc,
  '\n  fragment ConversationParticipants_Conversation on AiConversation {\n    ...ConversationBase\n    participants {\n      __typename\n      id\n      name\n      userId\n      assistantId\n      ... on HumanParticipant {\n        user {\n          avatarUrl\n          username\n        }\n      }\n      ... on AssistantParticipant {\n        assistant {\n          iconUrl\n          updatedAt\n        }\n      }\n    }\n    ...ConversationParticipantsDialogButton_Conversation\n  }\n':
    types.ConversationParticipants_ConversationFragmentDoc,
  '\n  fragment ConversationParticipants_Assistant on AiAssistant {\n    ...ConversationParticipantsDialogButton_Assistant\n  }\n':
    types.ConversationParticipants_AssistantFragmentDoc,
  '\n  fragment ConversationSelector_Conversation on AiConversation {\n    ...ConversationBase\n    owner {\n      id\n      name\n    }\n    assistants {\n      id\n      name\n    }\n  }\n':
    types.ConversationSelector_ConversationFragmentDoc,
  '\n  fragment ConversationDelete_Conversation on AiConversation {\n    ...ConversationBase\n    assistants {\n      name\n    }\n    participants {\n      id\n      userId\n    }\n  }\n':
    types.ConversationDelete_ConversationFragmentDoc,
  '\n  fragment ConversationDetail on AiConversation {\n    ...ConversationParticipants_Conversation\n    ...ConversationDelete_Conversation\n    ...ConversationHistory_Conversation\n    ...ConversationForm_Conversation\n    ...ConversationParticipantsDialogButton_Conversation\n  }\n':
    types.ConversationDetailFragmentDoc,
  '\n  query getConversation($conversationId: String!) {\n    aiConversation(conversationId: $conversationId) {\n      ...ConversationDetail\n    }\n  }\n':
    types.GetConversationDocument,
  '\n  fragment ConversationBase on AiConversation {\n    id\n    ownerId\n    createdAt\n    updatedAt\n  }\n':
    types.ConversationBaseFragmentDoc,
  '\n  query getUserConversations {\n    aiConversations {\n      id\n      ...ConversationSelector_Conversation\n    }\n  }\n':
    types.GetUserConversationsDocument,
  '\n        mutation createContactRequest($name: String!, $emailOrPhone: String!, $message: String!) {\n          createContactRequest(name: $name, emailOrPhone: $emailOrPhone, message: $message)\n        }\n      ':
    types.CreateContactRequestDocument,
  '\n      query version {\n        version\n      }\n    ': types.VersionDocument,
  '\n          mutation validateSharePointConnection($uri: String!, $sharepointAuth: String!) {\n            validateSharePointConnection(uri: $uri, sharepointAuth: $sharepointAuth) {\n              success\n              errorMessage\n              errorType\n            }\n          }\n        ':
    types.ValidateSharePointConnectionDocument,
  '\n        mutation createAiLibraryCrawler(\n          $libraryId: String!\n          $data: AiLibraryCrawlerInput!\n          $credentials: AiLibraryCrawlerCredentialsInput\n        ) {\n          createAiLibraryCrawler(libraryId: $libraryId, data: $data, credentials: $credentials) {\n            id\n          }\n        }\n      ':
    types.CreateAiLibraryCrawlerDocument,
  '\n  fragment CrawlerForm_Crawler on AiLibraryCrawler {\n    id\n    libraryId\n    uri\n    uriType\n    maxDepth\n    maxPages\n    includePatterns\n    excludePatterns\n    maxFileSize\n    minFileSize\n    allowedMimeTypes\n    cronJob {\n      id\n      active\n      hour\n      minute\n      monday\n      tuesday\n      wednesday\n      thursday\n      friday\n      saturday\n      sunday\n    }\n  }\n':
    types.CrawlerForm_CrawlerFragmentDoc,
  '\n  fragment CrawlerTable_LibraryCrawler on AiLibraryCrawler {\n    id\n    uri\n    uriType\n    maxDepth\n    maxPages\n    lastRun {\n      startedAt\n      success\n      errorMessage\n    }\n    cronJob {\n      cronExpression\n    }\n    filesCount\n    ...RunCrawlerButton_Crawler\n  }\n':
    types.CrawlerTable_LibraryCrawlerFragmentDoc,
  '\n        mutation deleteCrawler($id: String!) {\n          deleteAiLibraryCrawler(id: $id) {\n            id\n          }\n        }\n      ':
    types.DeleteCrawlerDocument,
  '\n        query GetCrawlerRun(\n          $libraryId: String!\n          $crawlerRunId: String!\n          $skipUpdates: Int!\n          $takeUpdates: Int!\n          $updateTypeFilter: [String!]\n        ) {\n          aiLibraryCrawlerRun(libraryId: $libraryId, crawlerRunId: $crawlerRunId) {\n            id\n            startedAt\n            endedAt\n            success\n            stoppedByUser\n            errorMessage\n            runByUserId\n            updatesCount\n            filteredUpdatesCount(updateTypeFilter: $updateTypeFilter)\n            updateStats {\n              updateType\n              count\n            }\n            updates(take: $takeUpdates, skip: $skipUpdates, updateTypeFilter: $updateTypeFilter) {\n              id\n              createdAt\n              message\n              updateType\n              filePath\n              fileName\n              fileSize\n              filterType\n              filterValue\n              file {\n                id\n                name\n                originUri\n                mimeType\n                size\n              }\n            }\n          }\n        }\n      ':
    types.GetCrawlerRunDocument,
  '\n        query GetCrawlerRuns($libraryId: String!, $crawlerId: String!, $skip: Int!, $take: Int!) {\n          aiLibraryCrawler(libraryId: $libraryId, crawlerId: $crawlerId) {\n            id\n            runs(take: $take, skip: $skip) {\n              id\n              startedAt\n              endedAt\n              success\n            }\n          }\n        }\n      ':
    types.GetCrawlerRunsDocument,
  '\n        query GetCrawler($libraryId: String!, $crawlerId: String!) {\n          aiLibraryCrawler(libraryId: $libraryId, crawlerId: $crawlerId) {\n            ...CrawlerForm_Crawler\n            id\n            libraryId\n            uri\n            uriType\n            isRunning\n            lastRun {\n              id\n              startedAt\n              endedAt\n              success\n              errorMessage\n            }\n            filesCount\n            runCount\n            maxDepth\n            maxPages\n            cronJob {\n              id\n              active\n              hour\n              minute\n              monday\n              tuesday\n              wednesday\n              thursday\n              friday\n              saturday\n              sunday\n            }\n          }\n        }\n      ':
    types.GetCrawlerDocument,
  '\n        query CrawlerTable($libraryId: String!) {\n          aiLibrary(libraryId: $libraryId) {\n            crawlers {\n              ...CrawlerTable_LibraryCrawler\n            }\n          }\n        }\n      ':
    types.CrawlerTableDocument,
  '\n  fragment RunCrawlerButton_Crawler on AiLibraryCrawler {\n    id\n    libraryId\n    isRunning\n  }\n':
    types.RunCrawlerButton_CrawlerFragmentDoc,
  '\n        mutation runCrawler($crawlerId: String!) {\n          runAiLibraryCrawler(crawlerId: $crawlerId)\n        }\n      ':
    types.RunCrawlerDocument,
  '\n        mutation stopCrawler($crawlerId: String!) {\n          stopAiLibraryCrawler(crawlerId: $crawlerId)\n        }\n      ':
    types.StopCrawlerDocument,
  '\n        mutation updateAiLibraryCrawler(\n          $id: String!\n          $data: AiLibraryCrawlerInput!\n          $credentials: AiLibraryCrawlerCredentialsInput\n        ) {\n          updateAiLibraryCrawler(id: $id, data: $data, credentials: $credentials) {\n            id\n          }\n        }\n      ':
    types.UpdateAiLibraryCrawlerDocument,
  '\n        mutation deleteLibraryFiles($libraryId: String!) {\n          deleteLibraryFiles(libraryId: $libraryId)\n        }\n      ':
    types.DeleteLibraryFilesDocument,
  '\n        mutation deleteFile($fileId: String!) {\n          deleteFile(fileId: $fileId) {\n            id\n            name\n          }\n        }\n      ':
    types.DeleteFileDocument,
  '\n        mutation deleteFiles($fileIds: [ID!]!) {\n          deleteFiles(fileIds: $fileIds)\n        }\n      ':
    types.DeleteFilesDocument,
  '\n          mutation createEmbeddingTasks($id: String!) {\n            createEmbeddingOnlyProcessingTask(fileId: $id) {\n              id\n              file {\n                name\n              }\n            }\n          }\n        ':
    types.CreateEmbeddingTasksDocument,
  '\n          mutation createExtractionTasks($id: String!) {\n            createContentProcessingTask(fileId: $id) {\n              id\n              file {\n                name\n              }\n            }\n          }\n        ':
    types.CreateExtractionTasksDocument,
  '\n        mutation dropOutdatedMarkdownFiles($fileId: String!) {\n          dropOutdatedMarkdowns(fileId: $fileId)\n        }\n      ':
    types.DropOutdatedMarkdownFilesDocument,
  '\n  mutation prepareDesktopFile($file: AiLibraryFileInput!) {\n    prepareFile(data: $file) {\n      id\n    }\n  }\n':
    types.PrepareDesktopFileDocument,
  '\n        mutation cancelFileUpload($fileId: String!) {\n          cancelFileUpload(fileId: $fileId)\n        }\n      ':
    types.CancelFileUploadDocument,
  '\n  fragment AiLibraryFileInfo_CaptionCard on AiLibraryFile {\n    ...AiLibraryFile_FileStatusLabels\n    ...AiLibraryFileInfo_Files\n    ...AiLibraryFile_InfoBox\n    id\n    libraryId\n    name\n    originUri\n  }\n':
    types.AiLibraryFileInfo_CaptionCardFragmentDoc,
  '\n  fragment AiContentProcessingTask_List on AiContentProcessingTask {\n    id\n    createdAt\n    processingStartedAt\n    processingFinishedAt\n    processingFailedAt\n    extractionStartedAt\n    extractionFinishedAt\n    extractionFailedAt\n    embeddingStartedAt\n    embeddingFinishedAt\n    embeddingFailedAt\n    chunksCount\n    chunksSize\n    embeddingModelName\n    extractionOptions\n    processingStatus\n    extractionStatus\n    embeddingStatus\n    metadata\n  }\n':
    types.AiContentProcessingTask_ListFragmentDoc,
  '\n  fragment AiLibraryFile_InfoBox on AiLibraryFile {\n    originModificationDate\n    size\n    uploadedAt\n    archivedAt\n    taskCount\n    status\n    crawler {\n      id\n      uri\n      uriType\n    }\n    lastSuccessfulExtraction {\n      id\n      createdAt\n      extractionStartedAt\n      extractionFinishedAt\n      processingStatus\n      metadata\n    }\n    lastSuccessfulEmbedding {\n      id\n      createdAt\n      embeddingStartedAt\n      embeddingFinishedAt\n      processingStatus\n      metadata\n      chunksCount\n    }\n  }\n':
    types.AiLibraryFile_InfoBoxFragmentDoc,
  '\n  fragment AiLibraryFileInfo_Files on AiLibraryFile {\n    id\n    name\n    sourceFiles {\n      fileName\n      url\n    }\n  }\n':
    types.AiLibraryFileInfo_FilesFragmentDoc,
  '\n  fragment AiLibraryFile_FileStatusLabels on AiLibraryFile {\n    id\n    isLegacyFile\n    lastSuccessfulExtraction {\n      id\n      extractionTimeMs\n      extractionFinishedAt\n      metadata\n    }\n    lastSuccessfulEmbedding {\n      id\n      embeddingTimeMs\n      embeddingFinishedAt\n      metadata\n    }\n    supportedExtractionMethods\n    isLegacyFile\n    name\n  }\n':
    types.AiLibraryFile_FileStatusLabelsFragmentDoc,
  '\n  fragment AiLibraryFile_TableItem on AiLibraryFile {\n    id\n    libraryId\n    name\n    originUri\n    mimeType\n    size\n    uploadedAt\n    dropError\n    createdAt\n    originModificationDate\n    archivedAt\n    taskCount\n    processingStatus\n    extractionStatus\n    embeddingStatus\n    lastSuccessfulEmbedding {\n      id\n      createdAt\n      processingFinishedAt\n      chunksCount\n      chunksSize\n    }\n  }\n':
    types.AiLibraryFile_TableItemFragmentDoc,
  '\n        query getFileChunks($fileId: String!, $skip: Int!, $take: Int!) {\n          aiFileChunks(fileId: $fileId, skip: $skip, take: $take) {\n            fileId\n            fileName\n            take\n            skip\n            count\n            chunks {\n              id\n              text\n              section\n              headingPath\n              chunkIndex\n              subChunkIndex\n            }\n          }\n        }\n      ':
    types.GetFileChunksDocument,
  '\n        query getFileInfo($fileId: String!) {\n          aiLibraryFile(fileId: $fileId) {\n            ...AiLibraryFileInfo_CaptionCard\n            ...AiLibraryFile_MarkdownFileSelector\n            id\n            name\n            originUri\n            docPath\n            mimeType\n            size\n            createdAt\n            updatedAt\n            archivedAt\n            originModificationDate\n            processingStatus\n            extractionStatus\n            embeddingStatus\n            latestExtractionMarkdownFileNames\n            lastUpdate {\n              id\n              createdAt\n              message\n              updateType\n            }\n          }\n        }\n      ':
    types.GetFileInfoDocument,
  '\n        query getSimilarFileChunks($fileId: String!, $term: String, $hits: Int!) {\n          aiSimilarFileChunks(fileId: $fileId, term: $term, hits: $hits) {\n            id\n            fileName\n            fileId\n            originUri\n            text\n            section\n            headingPath\n            chunkIndex\n            subChunkIndex\n            distance\n            points\n          }\n        }\n      ':
    types.GetSimilarFileChunksDocument,
  '\n        query EmbeddingsTable($libraryId: String!, $skip: Int = 0, $take: Int = 20, $showArchived: Boolean = false) {\n          aiLibraryFiles(libraryId: $libraryId, skip: $skip, take: $take, showArchived: $showArchived) {\n            libraryId\n            library {\n              name\n            }\n            take\n            skip\n            showArchived\n            count\n            archivedCount\n            files {\n              ...AiLibraryFile_TableItem\n            }\n          }\n        }\n      ':
    types.EmbeddingsTableDocument,
  '\n        query getMarkdown($fileId: String!, $markdownFileName: String) {\n          aiLibraryFile(fileId: $fileId) {\n            markdown(markdownFileName: $markdownFileName) {\n              fileName\n              content\n            }\n          }\n        }\n      ':
    types.GetMarkdownDocument,
  '\n  fragment AiLibraryFile_MarkdownFileSelector on AiLibraryFile {\n    id\n    libraryId\n    latestExtractionMarkdownFileNames\n    availableExtractionMarkdownFileNames\n  }\n':
    types.AiLibraryFile_MarkdownFileSelectorFragmentDoc,
  '\n  fragment AiLibraryBase on AiLibrary {\n    id\n    name\n    createdAt\n    updatedAt\n    owner {\n      name\n    }\n  }\n':
    types.AiLibraryBaseFragmentDoc,
  '\n  query aiLibraries {\n    aiLibraries {\n      ...AiLibraryBase\n    }\n  }\n': types.AiLibrariesDocument,
  '\n  query aiLibraryDetail($libraryId: String!) {\n    aiLibrary(libraryId: $libraryId) {\n      id\n      owner {\n        ...User_EntityParticipantsDialog\n      }\n      participants {\n        id\n        user {\n          ...User_EntityParticipantsDialog\n        }\n      }\n      ...AiLibraryBase\n      ...AiLibraryForm_Library\n      ...LibraryDeleteDialog_Library\n    }\n  }\n':
    types.AiLibraryDetailDocument,
  '\n          mutation prepareFile($file: AiLibraryFileInput!) {\n            prepareFile(data: $file) {\n              id\n            }\n          }\n        ':
    types.PrepareFileDocument,
  '\n          mutation processFile($fileId: String!) {\n            createContentProcessingTask(fileId: $fileId) {\n              id\n            }\n          }\n        ':
    types.ProcessFileDocument,
  '\n  mutation deleteLibraryFiles($libraryId: String!) {\n    deleteLibraryFiles(libraryId: $libraryId)\n  }\n':
    types.DeleteLibraryFilesDocument,
  '\n  mutation deleteLibrary($id: String!) {\n    deleteLibrary(id: $id)\n  }\n': types.DeleteLibraryDocument,
  '\n  fragment LibraryDeleteDialog_Library on AiLibrary {\n    id\n    name\n    filesCount\n  }\n':
    types.LibraryDeleteDialog_LibraryFragmentDoc,
  '\n  fragment AiLibraryForm_Library on AiLibrary {\n    id\n    name\n    embeddingTimeoutMs\n    ownerId\n    filesCount\n    description\n    embeddingModelName\n    fileConverterOptions\n  }\n':
    types.AiLibraryForm_LibraryFragmentDoc,
  '\n        mutation createLibrary($data: AiLibraryInput!) {\n          createLibrary(data: $data) {\n            id\n            name\n          }\n        }\n      ':
    types.CreateLibraryDocument,
  '\n        query queryLibraryFiles($libraryId: String!, $query: String!, $skip: Int!, $take: Int!) {\n          queryAiLibraryFiles(libraryId: $libraryId, query: $query, skip: $skip, take: $take) {\n            libraryId\n            query\n            take\n            skip\n            hitCount\n            hits {\n              pageContent\n              docName\n              docId\n              id\n              docPath\n              originUri\n              highlights {\n                field\n                snippet\n              }\n            }\n          }\n        }\n      ':
    types.QueryLibraryFilesDocument,
  '\n        query GetContentProcessingTasks(\n          $libraryId: String!\n          $fileId: String\n          $status: ProcessingStatus\n          $skip: Int\n          $take: Int\n        ) {\n          aiContentProcessingTasks(libraryId: $libraryId, fileId: $fileId, status: $status, skip: $skip, take: $take) {\n            count\n            tasks {\n              ...AiContentProcessingTask_AccordionItem\n            }\n          }\n        }\n      ':
    types.GetContentProcessingTasksDocument,
  '\n  fragment AiContentProcessingTask_AccordionItem on AiContentProcessingTask {\n    id\n    ...AiContentProcessingTask_Timeline\n    file {\n      id\n      name\n      libraryId\n      library {\n        fileConverterOptions\n      }\n    }\n    createdAt\n    timeoutMs\n    metadata\n    extractionOptions\n    extractionStatus\n    embeddingStatus\n    processingTimeMs\n    processingStatus\n    chunksCount\n    chunksSize\n    extractionSubTasks {\n      id\n      extractionMethod\n      markdownFileName\n      startedAt\n      finishedAt\n      failedAt\n    }\n  }\n':
    types.AiContentProcessingTask_AccordionItemFragmentDoc,
  '\n  fragment AiContentProcessingTask_Timeline on AiContentProcessingTask {\n    createdAt\n    processingStartedAt\n    processingFinishedAt\n    processingFailedAt\n    processingTimeout\n    extractionStartedAt\n    extractionFinishedAt\n    extractionFailedAt\n    extractionTimeMs\n    extractionTimeout\n    embeddingStartedAt\n    embeddingFinishedAt\n    embeddingFailedAt\n    embeddingTimeMs\n    embeddingTimeout\n    embeddingModelName\n    extractionSubTasks {\n      id\n      extractionMethod\n      markdownFileName\n      startedAt\n      finishedAt\n      failedAt\n    }\n  }\n':
    types.AiContentProcessingTask_TimelineFragmentDoc,
  '\n        mutation cancelProcessingTask($taskId: String!, $fileId: String!) {\n          cancelProcessingTask(taskId: $taskId, fileId: $fileId) {\n            id\n          }\n        }\n      ':
    types.CancelProcessingTaskDocument,
  '\n  mutation changeLibrary($id: String!, $data: AiLibraryInput!) {\n    updateLibrary(id: $id, data: $data) {\n      ...AiLibraryForm_Library\n    }\n  }\n':
    types.ChangeLibraryDocument,
  '\n        query libraryUpdatesList($libraryId: ID!, $crawlerId: ID, $take: Int, $skip: Int) {\n          aiLibraryUpdates(libraryId: $libraryId, crawlerId: $crawlerId, take: $take, skip: $skip) {\n            libraryId\n            library {\n              name\n            }\n            crawlerId\n            take\n            skip\n            count\n            updates {\n              ...AiLibraryUpdate_TableItem\n            }\n          }\n        }\n      ':
    types.LibraryUpdatesListDocument,
  '\n  fragment AiLibraryUpdate_TableItem on AiLibraryUpdate {\n    id\n    createdAt\n    libraryId\n    crawlerRunId\n    crawlerRun {\n      id\n      crawlerId\n      crawler {\n        id\n        uri\n        uriType\n      }\n    }\n    fileId\n    file {\n      id\n      name\n    }\n    message\n    updateType\n    filePath\n    fileName\n    fileSize\n    filterType\n    filterValue\n  }\n':
    types.AiLibraryUpdate_TableItemFragmentDoc,
  '\n        mutation updateLibraryParticipants($libraryId: String!, $userIds: [String!]!) {\n          updateLibraryParticipants(libraryId: $libraryId, userIds: $userIds) {\n            totalParticipants\n            addedParticipants\n            removedParticipants\n          }\n        }\n      ':
    types.UpdateLibraryParticipantsDocument,
  '\n        mutation removeLibraryParticipant($libraryId: String!, $participantId: String!) {\n          removeLibraryParticipant(libraryId: $libraryId, participantId: $participantId)\n        }\n      ':
    types.RemoveLibraryParticipantDocument,
  '\n  fragment ListEditForm_List on AiList {\n    id\n    name\n    ownerId\n    createdAt\n    updatedAt\n  }\n':
    types.ListEditForm_ListFragmentDoc,
  '\n  fragment FieldModal_List on AiList {\n    id\n    fields {\n      id\n      name\n      type\n      sourceType\n    }\n  }\n':
    types.FieldModal_ListFragmentDoc,
  '\n  fragment FieldModal_EditableField on AiListField {\n    id\n    name\n    type\n    prompt\n    contentQuery\n    languageModel\n    useVectorStore\n    order\n    context {\n      contextFieldId\n    }\n  }\n':
    types.FieldModal_EditableFieldFragmentDoc,
  '\n  fragment ListExport_Field on AiListField {\n    id\n    name\n    type\n    order\n    sourceType\n    fileProperty\n  }\n':
    types.ListExport_FieldFragmentDoc,
  '\n  fragment ListExport_List on AiList {\n    id\n    name\n    fields {\n      ...ListExport_Field\n    }\n  }\n':
    types.ListExport_ListFragmentDoc,
  '\n  fragment ListFieldsTableFilters_AiListField on AiListField {\n    id\n    name\n    type\n  }\n':
    types.ListFieldsTableFilters_AiListFieldFragmentDoc,
  '\n  fragment ListFieldsTableMenu_AiListField on AiListField {\n    id\n    name\n    type\n  }\n':
    types.ListFieldsTableMenu_AiListFieldFragmentDoc,
  '\n  fragment ListItemTable_Item on ListItemResult {\n    id\n    name\n    libraryId\n    libraryName\n  }\n':
    types.ListItemTable_ItemFragmentDoc,
  '\n  fragment ListFilesTable_FilesQueryResult on ListItemsQueryResult {\n    count\n    take\n    skip\n    orderBy\n    orderDirection\n    items {\n      origin {\n        ...ListItemTable_Item\n      }\n    }\n  }\n':
    types.ListFilesTable_FilesQueryResultFragmentDoc,
  '\n  fragment ListFieldsTable_Field on AiListField {\n    id\n    listId\n    name\n    type\n    order\n    sourceType\n    fileProperty\n    prompt\n    contentQuery\n    languageModel\n    useVectorStore\n    pendingItemsCount\n    processingItemsCount\n    context {\n      contextFieldId\n    }\n    ...ListFieldsTableFilters_AiListField\n    ...ListFieldsTableMenu_AiListField\n  }\n':
    types.ListFieldsTable_FieldFragmentDoc,
  '\n  fragment ListFieldsTable_List on AiList {\n    id\n    fields {\n      ...ListFieldsTable_Field\n    }\n  }\n':
    types.ListFieldsTable_ListFragmentDoc,
  '\n  fragment ListMenu_AiList on AiList {\n    id\n    name\n    ownerId\n    owner {\n      ...User_EntityParticipantsDialog\n    }\n    participants {\n      id\n      user {\n        ...User_EntityParticipantsDialog\n      }\n    }\n  }\n':
    types.ListMenu_AiListFragmentDoc,
  '\n  fragment ListMenu_AiLists on AiList {\n    id\n    name\n  }\n': types.ListMenu_AiListsFragmentDoc,
  '\n  fragment ListSourcesManager_List on AiList {\n    id\n    name\n    sources {\n      id\n      libraryId\n      library {\n        id\n        name\n        owner {\n          name\n        }\n      }\n    }\n  }\n':
    types.ListSourcesManager_ListFragmentDoc,
  '\n        mutation addListField($listId: String!, $data: AiListFieldInput!) {\n          addListField(listId: $listId, data: $data) {\n            id\n            name\n            type\n            order\n            sourceType\n            fileProperty\n            prompt\n            contentQuery\n            languageModel\n          }\n        }\n      ':
    types.AddListFieldDocument,
  '\n        mutation addListSource($listId: String!, $data: AiListSourceInput!) {\n          addListSource(listId: $listId, data: $data) {\n            id\n            libraryId\n            library {\n              id\n              name\n              owner {\n                name\n              }\n            }\n          }\n        }\n      ':
    types.AddListSourceDocument,
  '\n  mutation CleanEnrichments($listId: String!, $fieldId: String!) {\n    cleanListEnrichments(listId: $listId, fieldId: $fieldId) {\n      success\n      clearedItems\n      error\n    }\n  }\n':
    types.CleanEnrichmentsDocument,
  '\n        mutation createList($data: AiListInput!) {\n          createList(data: $data) {\n            id\n          }\n        }\n      ':
    types.CreateListDocument,
  '\n        mutation deleteList($id: String!) {\n          deleteList(id: $id) {\n            id\n            name\n          }\n        }\n      ':
    types.DeleteListDocument,
  '\n  query aiListFilesWithValues(\n    $listId: String!\n    $skip: Int!\n    $take: Int!\n    $orderBy: String\n    $orderDirection: String\n    $fieldIds: [String!]!\n    $filters: [AiListFilterInput!]!\n  ) {\n    aiListItems(\n      listId: $listId\n      fieldIds: $fieldIds\n      filters: $filters\n      skip: $skip\n      take: $take\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n    ) {\n      count\n      take\n      skip\n      orderBy\n      orderDirection\n      items {\n        origin {\n          id\n          type\n          name\n          libraryId\n          libraryName\n        }\n        values {\n          fieldId\n          fieldName\n          displayValue\n          enrichmentErrorMessage\n          queueStatus\n        }\n      }\n    }\n  }\n':
    types.AiListFilesWithValuesDocument,
  '\n        query getList($listId: String!) {\n          aiList(id: $listId) {\n            id\n            ...ListsBase\n            ...ListEditForm_List\n            ...ListSourcesManager_List\n            ...ListFieldsTable_List\n            ...ListMenu_AiList\n          }\n        }\n      ':
    types.GetListDocument,
  '\n  fragment ListsBase on AiList {\n    id\n    ownerId\n    createdAt\n    updatedAt\n  }\n':
    types.ListsBaseFragmentDoc,
  '\n      query getUserLists {\n        aiLists {\n          ...ListsBase\n          ...ListMenu_AiLists\n        }\n      }\n    ':
    types.GetUserListsDocument,
  '\n  query ListExportData($listId: String!, $skip: Int!, $take: Int!, $fieldIds: [String!]!) {\n    aiList(id: $listId) {\n      ...ListExport_List\n    }\n    aiListItems(\n      listId: $listId\n      fieldIds: $fieldIds\n      skip: $skip\n      take: $take\n      orderBy: "name"\n      orderDirection: "asc"\n    ) {\n      count\n      items {\n        origin {\n          id\n          name\n          libraryId\n          libraryName\n        }\n        values {\n          fieldId\n          fieldName\n          displayValue\n        }\n      }\n    }\n  }\n':
    types.ListExportDataDocument,
  '\n        mutation removeFromEnrichmentQueue($listId: String!, $fieldId: String!, $fileId: String!) {\n          removeFromEnrichmentQueue(listId: $listId, fieldId: $fieldId, fileId: $fileId) {\n            success\n            queuedItems\n            error\n          }\n        }\n      ':
    types.RemoveFromEnrichmentQueueDocument,
  '\n        mutation removeListField($id: String!) {\n          removeListField(id: $id) {\n            id\n          }\n        }\n      ':
    types.RemoveListFieldDocument,
  '\n        mutation removeListSource($id: String!) {\n          removeListSource(id: $id) {\n            id\n          }\n        }\n      ':
    types.RemoveListSourceDocument,
  '\n  mutation StartListEnrichment($listId: String!, $fieldId: String!) {\n    startListEnrichment(listId: $listId, fieldId: $fieldId) {\n      success\n      queuedItems\n      error\n    }\n  }\n':
    types.StartListEnrichmentDocument,
  '\n        mutation startSingleEnrichment($listId: String!, $fieldId: String!, $fileId: String!) {\n          startSingleEnrichment(listId: $listId, fieldId: $fieldId, fileId: $fileId) {\n            success\n            error\n          }\n        }\n      ':
    types.StartSingleEnrichmentDocument,
  '\n  mutation StopListEnrichment($listId: String!, $fieldId: String!) {\n    stopListEnrichment(listId: $listId, fieldId: $fieldId) {\n      success\n      queuedItems\n      error\n    }\n  }\n':
    types.StopListEnrichmentDocument,
  '\n        mutation updateListField($id: String!, $data: AiListFieldInput!) {\n          updateListField(id: $id, data: $data) {\n            id\n            name\n            type\n            order\n            sourceType\n            fileProperty\n            prompt\n            contentQuery\n            languageModel\n          }\n        }\n      ':
    types.UpdateListFieldDocument,
  '\n        mutation updateList($id: String!, $data: AiListInput!) {\n          updateList(id: $id, data: $data) {\n            id\n          }\n        }\n      ':
    types.UpdateListDocument,
  '\n        mutation updateListParticipants($listId: String!, $userIds: [String!]!) {\n          updateListParticipants(listId: $listId, userIds: $userIds) {\n            addedParticipants\n            removedParticipants\n            totalParticipants\n          }\n        }\n      ':
    types.UpdateListParticipantsDocument,
  '\n        mutation removeListParticipant($listId: String!, $participantId: String!) {\n          removeListParticipant(listId: $listId, participantId: $participantId)\n        }\n      ':
    types.RemoveListParticipantDocument,
  '\n      query aiChatModels {\n        aiChatModels\n      }\n    ': types.AiChatModelsDocument,
  '\n      query aiEmbeddingModels {\n        aiEmbeddingModels\n      }\n    ': types.AiEmbeddingModelsDocument,
  '\n  fragment User_EntityParticipantsDialog on User {\n    id\n    name\n    username\n    given_name\n    family_name\n    email\n    avatarUrl\n    profile {\n      position\n      business\n    }\n  }\n\n  fragment Assistant_EntityParticipantsDialog on AiAssistant {\n    id\n    name\n    description\n    iconUrl\n    ownerId\n  }\n':
    types.User_EntityParticipantsDialogFragmentDoc,
  '\n  fragment UserProfileForm_UserProfile on UserProfile {\n    id\n    userId\n    email\n    firstName\n    lastName\n    freeMessages\n    usedMessages\n    freeStorage\n    usedStorage\n    createdAt\n    updatedAt\n    confirmationDate\n    activationDate\n    expiresAt\n    business\n    position\n  }\n':
    types.UserProfileForm_UserProfileFragmentDoc,
  '\n        mutation saveUserProfile($profileId: String!, $userProfileInput: UserProfileInput!) {\n          updateUserProfile(profileId: $profileId, input: $userProfileInput) {\n            id\n          }\n        }\n      ':
    types.SaveUserProfileDocument,
  '\n  query userProfile {\n    userProfile {\n      id\n      confirmationDate\n      ...UserProfileForm_UserProfile\n    }\n  }\n':
    types.UserProfileDocument,
  '\n  mutation addAssistantParticipant($assistantId: String!, $userIds: [String!]!) {\n    addAssistantParticipants(assistantId: $assistantId, userIds: $userIds) {\n      id\n    }\n  }\n':
    types.AddAssistantParticipantDocument,
  '\n  mutation removeAssistantParticipant($assistantId: String!, $userId: String!) {\n    removeAssistantParticipant(assistantId: $assistantId, userId: $userId) {\n      id\n    }\n  }\n':
    types.RemoveAssistantParticipantDocument,
  '\n  mutation leaveAssistantParticipant($assistantId: String!) {\n    leaveAssistantParticipant(assistantId: $assistantId) {\n      id\n    }\n  }\n':
    types.LeaveAssistantParticipantDocument,
  '\n        mutation updateUserAvatar($avatarUrl: String) {\n          updateUserAvatar(avatarUrl: $avatarUrl) {\n            id\n            avatarUrl\n          }\n        }\n      ':
    types.UpdateUserAvatarDocument,
  '\n  query IntrospectionQuery {\n    __schema {\n      description\n      queryType {\n        name\n      }\n      mutationType {\n        name\n      }\n      subscriptionType {\n        name\n      }\n      types {\n        ...FullType\n      }\n      directives {\n        name\n        description\n        locations\n        args {\n          ...InputValue\n        }\n      }\n    }\n  }\n  fragment FullType on __Type {\n    kind\n    name\n    description\n    fields(includeDeprecated: true) {\n      name\n      description\n      args {\n        ...InputValue\n      }\n      type {\n        ...TypeRef\n      }\n      isDeprecated\n      deprecationReason\n    }\n    inputFields {\n      ...InputValue\n    }\n    interfaces {\n      ...TypeRef\n    }\n    enumValues(includeDeprecated: true) {\n      name\n      description\n      isDeprecated\n      deprecationReason\n    }\n    possibleTypes {\n      ...TypeRef\n    }\n  }\n  fragment InputValue on __InputValue {\n    name\n    description\n    type {\n      ...TypeRef\n    }\n    defaultValue\n  }\n  fragment TypeRef on __Type {\n    kind\n    name\n    ofType {\n      kind\n      name\n      ofType {\n        kind\n        name\n        ofType {\n          kind\n          name\n          ofType {\n            kind\n            name\n            ofType {\n              kind\n              name\n              ofType {\n                kind\n                name\n                ofType {\n                  kind\n                  name\n                  ofType {\n                    kind\n                    name\n                    ofType {\n                      kind\n                      name\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n':
    types.IntrospectionQueryDocument,
  '\n  mutation addConversationParticipant($conversationId: String!, $userIds: [String!], $assistantIds: [String!]) {\n    addConversationParticipants(conversationId: $conversationId, userIds: $userIds, assistantIds: $assistantIds) {\n      id\n    }\n  }\n':
    types.AddConversationParticipantDocument,
  '\n  mutation removeConversationParticipant($participantId: String!) {\n    removeConversationParticipant(participantId: $participantId) {\n      id\n    }\n  }\n':
    types.RemoveConversationParticipantDocument,
  '\n  mutation createConversationInvitations($conversationId: String!, $data: [ConversationInvitationInput!]!) {\n    createConversationInvitations(conversationId: $conversationId, data: $data) {\n      id\n    }\n  }\n':
    types.CreateConversationInvitationsDocument,
  '\n  mutation confirmInvitation($conversationId: String!, $invitationId: String!) {\n    confirmConversationInvitation(conversationId: $conversationId, invitationId: $invitationId) {\n      id\n    }\n  }\n':
    types.ConfirmInvitationDocument,
  '\n  mutation sendMessage($data: AiConversationMessageInput!) {\n    sendMessage(data: $data) {\n      id\n      createdAt\n    }\n  }\n':
    types.SendMessageDocument,
  '\n  mutation createConversation($data: AiConversationCreateInput!) {\n    createAiConversation(data: $data) {\n      id\n    }\n  }\n':
    types.CreateConversationDocument,
  '\n  mutation deleteConversation($conversationId: String!) {\n    deleteAiConversation(conversationId: $conversationId) {\n      id\n    }\n  }\n':
    types.DeleteConversationDocument,
  '\n        mutation deleteConversations($conversationIds: [String!]!) {\n          deleteAiConversations(conversationIds: $conversationIds)\n        }\n      ':
    types.DeleteConversationsDocument,
  '\n  mutation leaveConversation($participantId: String!) {\n    leaveAiConversation(participantId: $participantId) {\n      id\n    }\n  }\n':
    types.LeaveConversationDocument,
  '\n  fragment User on User {\n    id\n    username\n    name\n    createdAt\n    email\n    avatarUrl\n    isAdmin\n    profile {\n      firstName\n      lastName\n      business\n      position\n      confirmationDate\n      activationDate\n    }\n  }\n':
    types.UserFragmentDoc,
  '\n  query users {\n    users {\n      ...User\n    }\n  }\n': types.UsersDocument,
  '\n        mutation sendConfirmationMail($confirmationUrl: String!, $activationUrl: String!) {\n          sendConfirmationMail(confirmationUrl: $confirmationUrl, activationUrl: $activationUrl)\n        }\n      ':
    types.SendConfirmationMailDocument,
  '\n        mutation confirmUserProfile($profileId: String!) {\n          confirmUserProfile(profileId: $profileId) {\n            id\n          }\n        }\n      ':
    types.ConfirmUserProfileDocument,
  '\n  fragment UserProfile on UserProfile {\n    id\n    userId\n    email\n    firstName\n    lastName\n    business\n    position\n    freeMessages\n    usedMessages\n    freeStorage\n    usedStorage\n    createdAt\n    updatedAt\n    confirmationDate\n    activationDate\n    expiresAt\n  }\n':
    types.UserProfileFragmentDoc,
  '\n      query getUserProfile {\n        userProfile {\n          ...UserProfile\n        }\n      }\n    ':
    types.GetUserProfileDocument,
  '\n        mutation updateUserProfile($profileId: String!, $userProfileInput: UserProfileInput!) {\n          updateUserProfile(profileId: $profileId, input: $userProfileInput) {\n            id\n          }\n        }\n      ':
    types.UpdateUserProfileDocument,
  '\n        mutation activateUserProfile($profileId: String!) {\n          activateUserProfile(profileId: $profileId) {\n            id\n          }\n        }\n      ':
    types.ActivateUserProfileDocument,
  '\n  query adminUserById($email: String!) {\n    user(email: $email) {\n      ...User\n      profile {\n        ...UserProfileForm_UserProfile\n      }\n    }\n  }\n':
    types.AdminUserByIdDocument,
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
  source: '\n  mutation login($jwtToken: String!) {\n    login(jwtToken: $jwtToken) {\n      id\n      username\n      email\n      name\n      given_name\n      family_name\n      avatarUrl\n      createdAt\n      isAdmin\n    }\n  }\n',
): (typeof documents)['\n  mutation login($jwtToken: String!) {\n    login(jwtToken: $jwtToken) {\n      id\n      username\n      email\n      name\n      given_name\n      family_name\n      avatarUrl\n      createdAt\n      isAdmin\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        query GetAiServiceStatus {\n          aiServiceStatus {\n            instances {\n              name\n              url\n              type\n              isOnline\n              version\n              runningModels {\n                name\n                size\n                expiresAt\n                activeRequests\n              }\n              availableModels {\n                name\n                size\n                capabilities\n                family\n                parameterSize\n              }\n              totalVram\n              usedVram\n              modelQueues {\n                modelName\n                queueLength\n                maxConcurrency\n                estimatedRequestSize\n              }\n            }\n            totalInstances\n            availableInstances\n            healthyInstances\n            totalMemory\n            totalUsedMemory\n            totalMaxConcurrency\n            totalQueueLength\n          }\n        }\n      ',
): (typeof documents)['\n        query GetAiServiceStatus {\n          aiServiceStatus {\n            instances {\n              name\n              url\n              type\n              isOnline\n              version\n              runningModels {\n                name\n                size\n                expiresAt\n                activeRequests\n              }\n              availableModels {\n                name\n                size\n                capabilities\n                family\n                parameterSize\n              }\n              totalVram\n              usedVram\n              modelQueues {\n                modelName\n                queueLength\n                maxConcurrency\n                estimatedRequestSize\n              }\n            }\n            totalInstances\n            availableInstances\n            healthyInstances\n            totalMemory\n            totalUsedMemory\n            totalMaxConcurrency\n            totalQueueLength\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetQueueSystemStatus {\n    queueSystemStatus {\n      ...QueueSystemStatus_ManagementPanel\n    }\n  }\n',
): (typeof documents)['\n  query GetQueueSystemStatus {\n    queueSystemStatus {\n      ...QueueSystemStatus_ManagementPanel\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation StartQueueWorker($queueType: QueueType!) {\n    startQueueWorker(queueType: $queueType) {\n      success\n      message\n    }\n  }\n',
): (typeof documents)['\n  mutation StartQueueWorker($queueType: QueueType!) {\n    startQueueWorker(queueType: $queueType) {\n      success\n      message\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation StopQueueWorker($queueType: QueueType!) {\n    stopQueueWorker(queueType: $queueType) {\n      success\n      message\n    }\n  }\n',
): (typeof documents)['\n  mutation StopQueueWorker($queueType: QueueType!) {\n    stopQueueWorker(queueType: $queueType) {\n      success\n      message\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation RetryFailedTasks($queueType: QueueType!, $libraryId: String) {\n    retryFailedTasks(queueType: $queueType, libraryId: $libraryId) {\n      success\n      message\n      affectedCount\n    }\n  }\n',
): (typeof documents)['\n  mutation RetryFailedTasks($queueType: QueueType!, $libraryId: String) {\n    retryFailedTasks(queueType: $queueType, libraryId: $libraryId) {\n      success\n      message\n      affectedCount\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation ClearFailedTasks($queueType: QueueType!, $libraryId: String) {\n    clearFailedTasks(queueType: $queueType, libraryId: $libraryId) {\n      success\n      message\n      affectedCount\n    }\n  }\n',
): (typeof documents)['\n  mutation ClearFailedTasks($queueType: QueueType!, $libraryId: String) {\n    clearFailedTasks(queueType: $queueType, libraryId: $libraryId) {\n      success\n      message\n      affectedCount\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation ClearTasks($queueType: QueueType!, $libraryId: String) {\n          clearPendingTasks(queueType: $queueType, libraryId: $libraryId) {\n            success\n            message\n            affectedCount\n          }\n        }\n      ',
): (typeof documents)['\n        mutation ClearTasks($queueType: QueueType!, $libraryId: String) {\n          clearPendingTasks(queueType: $queueType, libraryId: $libraryId) {\n            success\n            message\n            affectedCount\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation CancelContentProcessingTasks($libraryId: String) {\n    cancelContentProcessingTasks(libraryId: $libraryId) {\n      success\n      message\n      affectedCount\n    }\n  }\n',
): (typeof documents)['\n  mutation CancelContentProcessingTasks($libraryId: String) {\n    cancelContentProcessingTasks(libraryId: $libraryId) {\n      success\n      message\n      affectedCount\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment QueueSystemStatus_ManagementPanel on QueueSystemStatus {\n    allWorkersRunning\n    totalPendingTasks\n    totalProcessingTasks\n    totalFailedTasks\n    lastUpdated\n    queues {\n      queueType\n      isRunning\n      pendingTasks\n      processingTasks\n      failedTasks\n      completedTasks\n      lastProcessedAt\n    }\n  }\n',
): (typeof documents)['\n  fragment QueueSystemStatus_ManagementPanel on QueueSystemStatus {\n    allWorkersRunning\n    totalPendingTasks\n    totalProcessingTasks\n    totalFailedTasks\n    lastUpdated\n    queues {\n      queueType\n      isRunning\n      pendingTasks\n      processingTasks\n      failedTasks\n      completedTasks\n      lastProcessedAt\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation ensureUserProfile($userId: String!) {\n          ensureUserProfile(userId: $userId) {\n            id\n          }\n        }\n      ',
): (typeof documents)['\n        mutation ensureUserProfile($userId: String!) {\n          ensureUserProfile(userId: $userId) {\n            id\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ManagedUser on ManagedUser {\n    id\n    username\n    name\n    given_name\n    family_name\n    lastLogin\n    createdAt\n    updatedAt\n    email\n    isAdmin\n    registered\n    business\n    position\n    confirmationDate\n    activationDate\n    avatarUrl\n  }\n',
): (typeof documents)['\n  fragment ManagedUser on ManagedUser {\n    id\n    username\n    name\n    given_name\n    family_name\n    lastLogin\n    createdAt\n    updatedAt\n    email\n    isAdmin\n    registered\n    business\n    position\n    confirmationDate\n    activationDate\n    avatarUrl\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        query getManagedUsers($skip: Int!, $take: Int!, $filter: String, $statusFilter: String) {\n          managedUsers(skip: $skip, take: $take, filter: $filter, statusFilter: $statusFilter) {\n            skip\n            take\n            filter\n            userStatistics {\n              total\n              confirmed\n              unconfirmed\n              activated\n              unactivated\n            }\n            users {\n              ...ManagedUser\n            }\n          }\n        }\n      ',
): (typeof documents)['\n        query getManagedUsers($skip: Int!, $take: Int!, $filter: String, $statusFilter: String) {\n          managedUsers(skip: $skip, take: $take, filter: $filter, statusFilter: $statusFilter) {\n            skip\n            take\n            filter\n            userStatistics {\n              total\n              confirmed\n              unconfirmed\n              activated\n              unactivated\n            }\n            users {\n              ...ManagedUser\n            }\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation toggleAdminStatus($userId: String!) {\n          toggleAdminStatus(userId: $userId) {\n            id\n            isAdmin\n            username\n          }\n        }\n      ',
): (typeof documents)['\n        mutation toggleAdminStatus($userId: String!) {\n          toggleAdminStatus(userId: $userId) {\n            id\n            isAdmin\n            username\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AssistantSurvey_Assessment on AiActAssessment {\n    assistantId\n\n    assistantSurvey {\n      actionsTitle {\n        de\n        en\n      }\n      actions {\n        level\n        description {\n          de\n          en\n        }\n      }\n      questions {\n        id\n        ...QuestionCard_Question\n      }\n      title {\n        de\n        en\n      }\n      percentCompleted\n      hint {\n        de\n        en\n      }\n      riskIndicator {\n        description {\n          de\n          en\n        }\n        level\n      }\n    }\n  }\n',
): (typeof documents)['\n  fragment AssistantSurvey_Assessment on AiActAssessment {\n    assistantId\n\n    assistantSurvey {\n      actionsTitle {\n        de\n        en\n      }\n      actions {\n        level\n        description {\n          de\n          en\n        }\n      }\n      questions {\n        id\n        ...QuestionCard_Question\n      }\n      title {\n        de\n        en\n      }\n      percentCompleted\n      hint {\n        de\n        en\n      }\n      riskIndicator {\n        description {\n          de\n          en\n        }\n        level\n      }\n    }\n  }\n']
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
  source: '\n  fragment QuestionCard_Question on AiActQuestion {\n    id\n    title {\n      de\n      en\n    }\n    notes\n    value\n    hint {\n      de\n      en\n    }\n    options {\n      id\n      title {\n        de\n        en\n      }\n    }\n  }\n',
): (typeof documents)['\n  fragment QuestionCard_Question on AiActQuestion {\n    id\n    title {\n      de\n      en\n    }\n    notes\n    value\n    hint {\n      de\n      en\n    }\n    options {\n      id\n      title {\n        de\n        en\n      }\n    }\n  }\n']
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
  source: '\n        mutation deleteAiAssistant($assistantId: String!) {\n          deleteAiAssistant(assistantId: $assistantId) {\n            id\n            name\n          }\n        }\n      ',
): (typeof documents)['\n        mutation deleteAiAssistant($assistantId: String!) {\n          deleteAiAssistant(assistantId: $assistantId) {\n            id\n            name\n          }\n        }\n      ']
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
  source: '\n  fragment AssistantLibraries_Assistant on AiAssistant {\n    id\n    ownerId\n  }\n',
): (typeof documents)['\n  fragment AssistantLibraries_Assistant on AiAssistant {\n    id\n    ownerId\n  }\n']
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
  source: '\n        mutation createAiAssistant($name: String!) {\n          createAiAssistant(name: $name) {\n            id\n            name\n          }\n        }\n      ',
): (typeof documents)['\n        mutation createAiAssistant($name: String!) {\n          createAiAssistant(name: $name) {\n            id\n            name\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AssistantParticipantsDialogButton_Assistant on AiAssistant {\n    id\n    ownerId\n    users {\n      id\n    }\n  }\n',
): (typeof documents)['\n  fragment AssistantParticipantsDialogButton_Assistant on AiAssistant {\n    id\n    ownerId\n    users {\n      id\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AssistantParticipants_Assistant on AiAssistant {\n    id\n    ownerId\n    users {\n      id\n      name\n      username\n      avatarUrl\n    }\n    ...AssistantParticipantsDialogButton_Assistant\n  }\n',
): (typeof documents)['\n  fragment AssistantParticipants_Assistant on AiAssistant {\n    id\n    ownerId\n    users {\n      id\n      name\n      username\n      avatarUrl\n    }\n    ...AssistantParticipantsDialogButton_Assistant\n  }\n']
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
  source: '\n  query aiAssistantDetails($assistantId: String!) {\n    aiAssistant(assistantId: $assistantId) {\n      ...AssistantForm_Assistant\n      ...AssistantSelector_Assistant\n      ...AssistantLibraries_Assistant\n      ...AssistantBasecaseForm_Assistant\n      ...AssistantParticipants_Assistant\n    }\n    aiLibraryUsage(assistantId: $assistantId) {\n      ...AssistantLibraries_LibraryUsage\n    }\n  }\n',
): (typeof documents)['\n  query aiAssistantDetails($assistantId: String!) {\n    aiAssistant(assistantId: $assistantId) {\n      ...AssistantForm_Assistant\n      ...AssistantSelector_Assistant\n      ...AssistantLibraries_Assistant\n      ...AssistantBasecaseForm_Assistant\n      ...AssistantParticipants_Assistant\n    }\n    aiLibraryUsage(assistantId: $assistantId) {\n      ...AssistantLibraries_LibraryUsage\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AssistantBase on AiAssistant {\n    id\n    name\n    description\n    iconUrl\n    updatedAt\n    ownerId\n  }\n',
): (typeof documents)['\n  fragment AssistantBase on AiAssistant {\n    id\n    name\n    description\n    iconUrl\n    updatedAt\n    ownerId\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query aiAssistantCards {\n    aiAssistants {\n      ...AssistantBase\n    }\n  }\n',
): (typeof documents)['\n  query aiAssistantCards {\n    aiAssistants {\n      ...AssistantBase\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ConversationForm_Conversation on AiConversation {\n    ...ConversationBase\n    assistants {\n      id\n      name\n    }\n  }\n',
): (typeof documents)['\n  fragment ConversationForm_Conversation on AiConversation {\n    ...ConversationBase\n    assistants {\n      id\n      name\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ConversationHistory_Conversation on AiConversation {\n    ...ConversationBase\n    messages {\n      id\n      sequenceNumber\n      content\n      source\n      createdAt\n      hidden\n      sender {\n        __typename\n        id\n        name\n        isBot\n        assistantId\n        ... on HumanParticipant {\n          user {\n            avatarUrl\n          }\n        }\n        ... on AssistantParticipant {\n          assistant {\n            iconUrl\n            updatedAt\n          }\n        }\n      }\n    }\n  }\n',
): (typeof documents)['\n  fragment ConversationHistory_Conversation on AiConversation {\n    ...ConversationBase\n    messages {\n      id\n      sequenceNumber\n      content\n      source\n      createdAt\n      hidden\n      sender {\n        __typename\n        id\n        name\n        isBot\n        assistantId\n        ... on HumanParticipant {\n          user {\n            avatarUrl\n          }\n        }\n        ... on AssistantParticipant {\n          assistant {\n            iconUrl\n            updatedAt\n          }\n        }\n      }\n    }\n  }\n']
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
  source: '\n  mutation deleteMessage($messageId: String!) {\n    deleteMessage(messageId: $messageId) {\n      id\n    }\n  }\n',
): (typeof documents)['\n  mutation deleteMessage($messageId: String!) {\n    deleteMessage(messageId: $messageId) {\n      id\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ConversationParticipantsDialogButton_Conversation on AiConversation {\n    ...ConversationBase\n    participants {\n      id\n      userId\n      assistantId\n    }\n  }\n',
): (typeof documents)['\n  fragment ConversationParticipantsDialogButton_Conversation on AiConversation {\n    ...ConversationBase\n    participants {\n      id\n      userId\n      assistantId\n    }\n  }\n']
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
  source: '\n  fragment ConversationParticipants_Conversation on AiConversation {\n    ...ConversationBase\n    participants {\n      __typename\n      id\n      name\n      userId\n      assistantId\n      ... on HumanParticipant {\n        user {\n          avatarUrl\n          username\n        }\n      }\n      ... on AssistantParticipant {\n        assistant {\n          iconUrl\n          updatedAt\n        }\n      }\n    }\n    ...ConversationParticipantsDialogButton_Conversation\n  }\n',
): (typeof documents)['\n  fragment ConversationParticipants_Conversation on AiConversation {\n    ...ConversationBase\n    participants {\n      __typename\n      id\n      name\n      userId\n      assistantId\n      ... on HumanParticipant {\n        user {\n          avatarUrl\n          username\n        }\n      }\n      ... on AssistantParticipant {\n        assistant {\n          iconUrl\n          updatedAt\n        }\n      }\n    }\n    ...ConversationParticipantsDialogButton_Conversation\n  }\n']
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
  source: '\n  fragment ConversationSelector_Conversation on AiConversation {\n    ...ConversationBase\n    owner {\n      id\n      name\n    }\n    assistants {\n      id\n      name\n    }\n  }\n',
): (typeof documents)['\n  fragment ConversationSelector_Conversation on AiConversation {\n    ...ConversationBase\n    owner {\n      id\n      name\n    }\n    assistants {\n      id\n      name\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ConversationDelete_Conversation on AiConversation {\n    ...ConversationBase\n    assistants {\n      name\n    }\n    participants {\n      id\n      userId\n    }\n  }\n',
): (typeof documents)['\n  fragment ConversationDelete_Conversation on AiConversation {\n    ...ConversationBase\n    assistants {\n      name\n    }\n    participants {\n      id\n      userId\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ConversationDetail on AiConversation {\n    ...ConversationParticipants_Conversation\n    ...ConversationDelete_Conversation\n    ...ConversationHistory_Conversation\n    ...ConversationForm_Conversation\n    ...ConversationParticipantsDialogButton_Conversation\n  }\n',
): (typeof documents)['\n  fragment ConversationDetail on AiConversation {\n    ...ConversationParticipants_Conversation\n    ...ConversationDelete_Conversation\n    ...ConversationHistory_Conversation\n    ...ConversationForm_Conversation\n    ...ConversationParticipantsDialogButton_Conversation\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getConversation($conversationId: String!) {\n    aiConversation(conversationId: $conversationId) {\n      ...ConversationDetail\n    }\n  }\n',
): (typeof documents)['\n  query getConversation($conversationId: String!) {\n    aiConversation(conversationId: $conversationId) {\n      ...ConversationDetail\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ConversationBase on AiConversation {\n    id\n    ownerId\n    createdAt\n    updatedAt\n  }\n',
): (typeof documents)['\n  fragment ConversationBase on AiConversation {\n    id\n    ownerId\n    createdAt\n    updatedAt\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getUserConversations {\n    aiConversations {\n      id\n      ...ConversationSelector_Conversation\n    }\n  }\n',
): (typeof documents)['\n  query getUserConversations {\n    aiConversations {\n      id\n      ...ConversationSelector_Conversation\n    }\n  }\n']
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
  source: '\n          mutation validateSharePointConnection($uri: String!, $sharepointAuth: String!) {\n            validateSharePointConnection(uri: $uri, sharepointAuth: $sharepointAuth) {\n              success\n              errorMessage\n              errorType\n            }\n          }\n        ',
): (typeof documents)['\n          mutation validateSharePointConnection($uri: String!, $sharepointAuth: String!) {\n            validateSharePointConnection(uri: $uri, sharepointAuth: $sharepointAuth) {\n              success\n              errorMessage\n              errorType\n            }\n          }\n        ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation createAiLibraryCrawler(\n          $libraryId: String!\n          $data: AiLibraryCrawlerInput!\n          $credentials: AiLibraryCrawlerCredentialsInput\n        ) {\n          createAiLibraryCrawler(libraryId: $libraryId, data: $data, credentials: $credentials) {\n            id\n          }\n        }\n      ',
): (typeof documents)['\n        mutation createAiLibraryCrawler(\n          $libraryId: String!\n          $data: AiLibraryCrawlerInput!\n          $credentials: AiLibraryCrawlerCredentialsInput\n        ) {\n          createAiLibraryCrawler(libraryId: $libraryId, data: $data, credentials: $credentials) {\n            id\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment CrawlerForm_Crawler on AiLibraryCrawler {\n    id\n    libraryId\n    uri\n    uriType\n    maxDepth\n    maxPages\n    includePatterns\n    excludePatterns\n    maxFileSize\n    minFileSize\n    allowedMimeTypes\n    cronJob {\n      id\n      active\n      hour\n      minute\n      monday\n      tuesday\n      wednesday\n      thursday\n      friday\n      saturday\n      sunday\n    }\n  }\n',
): (typeof documents)['\n  fragment CrawlerForm_Crawler on AiLibraryCrawler {\n    id\n    libraryId\n    uri\n    uriType\n    maxDepth\n    maxPages\n    includePatterns\n    excludePatterns\n    maxFileSize\n    minFileSize\n    allowedMimeTypes\n    cronJob {\n      id\n      active\n      hour\n      minute\n      monday\n      tuesday\n      wednesday\n      thursday\n      friday\n      saturday\n      sunday\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment CrawlerTable_LibraryCrawler on AiLibraryCrawler {\n    id\n    uri\n    uriType\n    maxDepth\n    maxPages\n    lastRun {\n      startedAt\n      success\n      errorMessage\n    }\n    cronJob {\n      cronExpression\n    }\n    filesCount\n    ...RunCrawlerButton_Crawler\n  }\n',
): (typeof documents)['\n  fragment CrawlerTable_LibraryCrawler on AiLibraryCrawler {\n    id\n    uri\n    uriType\n    maxDepth\n    maxPages\n    lastRun {\n      startedAt\n      success\n      errorMessage\n    }\n    cronJob {\n      cronExpression\n    }\n    filesCount\n    ...RunCrawlerButton_Crawler\n  }\n']
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
  source: '\n        query GetCrawlerRun(\n          $libraryId: String!\n          $crawlerRunId: String!\n          $skipUpdates: Int!\n          $takeUpdates: Int!\n          $updateTypeFilter: [String!]\n        ) {\n          aiLibraryCrawlerRun(libraryId: $libraryId, crawlerRunId: $crawlerRunId) {\n            id\n            startedAt\n            endedAt\n            success\n            stoppedByUser\n            errorMessage\n            runByUserId\n            updatesCount\n            filteredUpdatesCount(updateTypeFilter: $updateTypeFilter)\n            updateStats {\n              updateType\n              count\n            }\n            updates(take: $takeUpdates, skip: $skipUpdates, updateTypeFilter: $updateTypeFilter) {\n              id\n              createdAt\n              message\n              updateType\n              filePath\n              fileName\n              fileSize\n              filterType\n              filterValue\n              file {\n                id\n                name\n                originUri\n                mimeType\n                size\n              }\n            }\n          }\n        }\n      ',
): (typeof documents)['\n        query GetCrawlerRun(\n          $libraryId: String!\n          $crawlerRunId: String!\n          $skipUpdates: Int!\n          $takeUpdates: Int!\n          $updateTypeFilter: [String!]\n        ) {\n          aiLibraryCrawlerRun(libraryId: $libraryId, crawlerRunId: $crawlerRunId) {\n            id\n            startedAt\n            endedAt\n            success\n            stoppedByUser\n            errorMessage\n            runByUserId\n            updatesCount\n            filteredUpdatesCount(updateTypeFilter: $updateTypeFilter)\n            updateStats {\n              updateType\n              count\n            }\n            updates(take: $takeUpdates, skip: $skipUpdates, updateTypeFilter: $updateTypeFilter) {\n              id\n              createdAt\n              message\n              updateType\n              filePath\n              fileName\n              fileSize\n              filterType\n              filterValue\n              file {\n                id\n                name\n                originUri\n                mimeType\n                size\n              }\n            }\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        query GetCrawlerRuns($libraryId: String!, $crawlerId: String!, $skip: Int!, $take: Int!) {\n          aiLibraryCrawler(libraryId: $libraryId, crawlerId: $crawlerId) {\n            id\n            runs(take: $take, skip: $skip) {\n              id\n              startedAt\n              endedAt\n              success\n            }\n          }\n        }\n      ',
): (typeof documents)['\n        query GetCrawlerRuns($libraryId: String!, $crawlerId: String!, $skip: Int!, $take: Int!) {\n          aiLibraryCrawler(libraryId: $libraryId, crawlerId: $crawlerId) {\n            id\n            runs(take: $take, skip: $skip) {\n              id\n              startedAt\n              endedAt\n              success\n            }\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        query GetCrawler($libraryId: String!, $crawlerId: String!) {\n          aiLibraryCrawler(libraryId: $libraryId, crawlerId: $crawlerId) {\n            ...CrawlerForm_Crawler\n            id\n            libraryId\n            uri\n            uriType\n            isRunning\n            lastRun {\n              id\n              startedAt\n              endedAt\n              success\n              errorMessage\n            }\n            filesCount\n            runCount\n            maxDepth\n            maxPages\n            cronJob {\n              id\n              active\n              hour\n              minute\n              monday\n              tuesday\n              wednesday\n              thursday\n              friday\n              saturday\n              sunday\n            }\n          }\n        }\n      ',
): (typeof documents)['\n        query GetCrawler($libraryId: String!, $crawlerId: String!) {\n          aiLibraryCrawler(libraryId: $libraryId, crawlerId: $crawlerId) {\n            ...CrawlerForm_Crawler\n            id\n            libraryId\n            uri\n            uriType\n            isRunning\n            lastRun {\n              id\n              startedAt\n              endedAt\n              success\n              errorMessage\n            }\n            filesCount\n            runCount\n            maxDepth\n            maxPages\n            cronJob {\n              id\n              active\n              hour\n              minute\n              monday\n              tuesday\n              wednesday\n              thursday\n              friday\n              saturday\n              sunday\n            }\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        query CrawlerTable($libraryId: String!) {\n          aiLibrary(libraryId: $libraryId) {\n            crawlers {\n              ...CrawlerTable_LibraryCrawler\n            }\n          }\n        }\n      ',
): (typeof documents)['\n        query CrawlerTable($libraryId: String!) {\n          aiLibrary(libraryId: $libraryId) {\n            crawlers {\n              ...CrawlerTable_LibraryCrawler\n            }\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment RunCrawlerButton_Crawler on AiLibraryCrawler {\n    id\n    libraryId\n    isRunning\n  }\n',
): (typeof documents)['\n  fragment RunCrawlerButton_Crawler on AiLibraryCrawler {\n    id\n    libraryId\n    isRunning\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation runCrawler($crawlerId: String!) {\n          runAiLibraryCrawler(crawlerId: $crawlerId)\n        }\n      ',
): (typeof documents)['\n        mutation runCrawler($crawlerId: String!) {\n          runAiLibraryCrawler(crawlerId: $crawlerId)\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation stopCrawler($crawlerId: String!) {\n          stopAiLibraryCrawler(crawlerId: $crawlerId)\n        }\n      ',
): (typeof documents)['\n        mutation stopCrawler($crawlerId: String!) {\n          stopAiLibraryCrawler(crawlerId: $crawlerId)\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation updateAiLibraryCrawler(\n          $id: String!\n          $data: AiLibraryCrawlerInput!\n          $credentials: AiLibraryCrawlerCredentialsInput\n        ) {\n          updateAiLibraryCrawler(id: $id, data: $data, credentials: $credentials) {\n            id\n          }\n        }\n      ',
): (typeof documents)['\n        mutation updateAiLibraryCrawler(\n          $id: String!\n          $data: AiLibraryCrawlerInput!\n          $credentials: AiLibraryCrawlerCredentialsInput\n        ) {\n          updateAiLibraryCrawler(id: $id, data: $data, credentials: $credentials) {\n            id\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation deleteLibraryFiles($libraryId: String!) {\n          deleteLibraryFiles(libraryId: $libraryId)\n        }\n      ',
): (typeof documents)['\n        mutation deleteLibraryFiles($libraryId: String!) {\n          deleteLibraryFiles(libraryId: $libraryId)\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation deleteFile($fileId: String!) {\n          deleteFile(fileId: $fileId) {\n            id\n            name\n          }\n        }\n      ',
): (typeof documents)['\n        mutation deleteFile($fileId: String!) {\n          deleteFile(fileId: $fileId) {\n            id\n            name\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation deleteFiles($fileIds: [ID!]!) {\n          deleteFiles(fileIds: $fileIds)\n        }\n      ',
): (typeof documents)['\n        mutation deleteFiles($fileIds: [ID!]!) {\n          deleteFiles(fileIds: $fileIds)\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n          mutation createEmbeddingTasks($id: String!) {\n            createEmbeddingOnlyProcessingTask(fileId: $id) {\n              id\n              file {\n                name\n              }\n            }\n          }\n        ',
): (typeof documents)['\n          mutation createEmbeddingTasks($id: String!) {\n            createEmbeddingOnlyProcessingTask(fileId: $id) {\n              id\n              file {\n                name\n              }\n            }\n          }\n        ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n          mutation createExtractionTasks($id: String!) {\n            createContentProcessingTask(fileId: $id) {\n              id\n              file {\n                name\n              }\n            }\n          }\n        ',
): (typeof documents)['\n          mutation createExtractionTasks($id: String!) {\n            createContentProcessingTask(fileId: $id) {\n              id\n              file {\n                name\n              }\n            }\n          }\n        ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation dropOutdatedMarkdownFiles($fileId: String!) {\n          dropOutdatedMarkdowns(fileId: $fileId)\n        }\n      ',
): (typeof documents)['\n        mutation dropOutdatedMarkdownFiles($fileId: String!) {\n          dropOutdatedMarkdowns(fileId: $fileId)\n        }\n      ']
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
  source: '\n  fragment AiLibraryFileInfo_CaptionCard on AiLibraryFile {\n    ...AiLibraryFile_FileStatusLabels\n    ...AiLibraryFileInfo_Files\n    ...AiLibraryFile_InfoBox\n    id\n    libraryId\n    name\n    originUri\n  }\n',
): (typeof documents)['\n  fragment AiLibraryFileInfo_CaptionCard on AiLibraryFile {\n    ...AiLibraryFile_FileStatusLabels\n    ...AiLibraryFileInfo_Files\n    ...AiLibraryFile_InfoBox\n    id\n    libraryId\n    name\n    originUri\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AiContentProcessingTask_List on AiContentProcessingTask {\n    id\n    createdAt\n    processingStartedAt\n    processingFinishedAt\n    processingFailedAt\n    extractionStartedAt\n    extractionFinishedAt\n    extractionFailedAt\n    embeddingStartedAt\n    embeddingFinishedAt\n    embeddingFailedAt\n    chunksCount\n    chunksSize\n    embeddingModelName\n    extractionOptions\n    processingStatus\n    extractionStatus\n    embeddingStatus\n    metadata\n  }\n',
): (typeof documents)['\n  fragment AiContentProcessingTask_List on AiContentProcessingTask {\n    id\n    createdAt\n    processingStartedAt\n    processingFinishedAt\n    processingFailedAt\n    extractionStartedAt\n    extractionFinishedAt\n    extractionFailedAt\n    embeddingStartedAt\n    embeddingFinishedAt\n    embeddingFailedAt\n    chunksCount\n    chunksSize\n    embeddingModelName\n    extractionOptions\n    processingStatus\n    extractionStatus\n    embeddingStatus\n    metadata\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AiLibraryFile_InfoBox on AiLibraryFile {\n    originModificationDate\n    size\n    uploadedAt\n    archivedAt\n    taskCount\n    status\n    crawler {\n      id\n      uri\n      uriType\n    }\n    lastSuccessfulExtraction {\n      id\n      createdAt\n      extractionStartedAt\n      extractionFinishedAt\n      processingStatus\n      metadata\n    }\n    lastSuccessfulEmbedding {\n      id\n      createdAt\n      embeddingStartedAt\n      embeddingFinishedAt\n      processingStatus\n      metadata\n      chunksCount\n    }\n  }\n',
): (typeof documents)['\n  fragment AiLibraryFile_InfoBox on AiLibraryFile {\n    originModificationDate\n    size\n    uploadedAt\n    archivedAt\n    taskCount\n    status\n    crawler {\n      id\n      uri\n      uriType\n    }\n    lastSuccessfulExtraction {\n      id\n      createdAt\n      extractionStartedAt\n      extractionFinishedAt\n      processingStatus\n      metadata\n    }\n    lastSuccessfulEmbedding {\n      id\n      createdAt\n      embeddingStartedAt\n      embeddingFinishedAt\n      processingStatus\n      metadata\n      chunksCount\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AiLibraryFileInfo_Files on AiLibraryFile {\n    id\n    name\n    sourceFiles {\n      fileName\n      url\n    }\n  }\n',
): (typeof documents)['\n  fragment AiLibraryFileInfo_Files on AiLibraryFile {\n    id\n    name\n    sourceFiles {\n      fileName\n      url\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AiLibraryFile_FileStatusLabels on AiLibraryFile {\n    id\n    isLegacyFile\n    lastSuccessfulExtraction {\n      id\n      extractionTimeMs\n      extractionFinishedAt\n      metadata\n    }\n    lastSuccessfulEmbedding {\n      id\n      embeddingTimeMs\n      embeddingFinishedAt\n      metadata\n    }\n    supportedExtractionMethods\n    isLegacyFile\n    name\n  }\n',
): (typeof documents)['\n  fragment AiLibraryFile_FileStatusLabels on AiLibraryFile {\n    id\n    isLegacyFile\n    lastSuccessfulExtraction {\n      id\n      extractionTimeMs\n      extractionFinishedAt\n      metadata\n    }\n    lastSuccessfulEmbedding {\n      id\n      embeddingTimeMs\n      embeddingFinishedAt\n      metadata\n    }\n    supportedExtractionMethods\n    isLegacyFile\n    name\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AiLibraryFile_TableItem on AiLibraryFile {\n    id\n    libraryId\n    name\n    originUri\n    mimeType\n    size\n    uploadedAt\n    dropError\n    createdAt\n    originModificationDate\n    archivedAt\n    taskCount\n    processingStatus\n    extractionStatus\n    embeddingStatus\n    lastSuccessfulEmbedding {\n      id\n      createdAt\n      processingFinishedAt\n      chunksCount\n      chunksSize\n    }\n  }\n',
): (typeof documents)['\n  fragment AiLibraryFile_TableItem on AiLibraryFile {\n    id\n    libraryId\n    name\n    originUri\n    mimeType\n    size\n    uploadedAt\n    dropError\n    createdAt\n    originModificationDate\n    archivedAt\n    taskCount\n    processingStatus\n    extractionStatus\n    embeddingStatus\n    lastSuccessfulEmbedding {\n      id\n      createdAt\n      processingFinishedAt\n      chunksCount\n      chunksSize\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        query getFileChunks($fileId: String!, $skip: Int!, $take: Int!) {\n          aiFileChunks(fileId: $fileId, skip: $skip, take: $take) {\n            fileId\n            fileName\n            take\n            skip\n            count\n            chunks {\n              id\n              text\n              section\n              headingPath\n              chunkIndex\n              subChunkIndex\n            }\n          }\n        }\n      ',
): (typeof documents)['\n        query getFileChunks($fileId: String!, $skip: Int!, $take: Int!) {\n          aiFileChunks(fileId: $fileId, skip: $skip, take: $take) {\n            fileId\n            fileName\n            take\n            skip\n            count\n            chunks {\n              id\n              text\n              section\n              headingPath\n              chunkIndex\n              subChunkIndex\n            }\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        query getFileInfo($fileId: String!) {\n          aiLibraryFile(fileId: $fileId) {\n            ...AiLibraryFileInfo_CaptionCard\n            ...AiLibraryFile_MarkdownFileSelector\n            id\n            name\n            originUri\n            docPath\n            mimeType\n            size\n            createdAt\n            updatedAt\n            archivedAt\n            originModificationDate\n            processingStatus\n            extractionStatus\n            embeddingStatus\n            latestExtractionMarkdownFileNames\n            lastUpdate {\n              id\n              createdAt\n              message\n              updateType\n            }\n          }\n        }\n      ',
): (typeof documents)['\n        query getFileInfo($fileId: String!) {\n          aiLibraryFile(fileId: $fileId) {\n            ...AiLibraryFileInfo_CaptionCard\n            ...AiLibraryFile_MarkdownFileSelector\n            id\n            name\n            originUri\n            docPath\n            mimeType\n            size\n            createdAt\n            updatedAt\n            archivedAt\n            originModificationDate\n            processingStatus\n            extractionStatus\n            embeddingStatus\n            latestExtractionMarkdownFileNames\n            lastUpdate {\n              id\n              createdAt\n              message\n              updateType\n            }\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        query getSimilarFileChunks($fileId: String!, $term: String, $hits: Int!) {\n          aiSimilarFileChunks(fileId: $fileId, term: $term, hits: $hits) {\n            id\n            fileName\n            fileId\n            originUri\n            text\n            section\n            headingPath\n            chunkIndex\n            subChunkIndex\n            distance\n            points\n          }\n        }\n      ',
): (typeof documents)['\n        query getSimilarFileChunks($fileId: String!, $term: String, $hits: Int!) {\n          aiSimilarFileChunks(fileId: $fileId, term: $term, hits: $hits) {\n            id\n            fileName\n            fileId\n            originUri\n            text\n            section\n            headingPath\n            chunkIndex\n            subChunkIndex\n            distance\n            points\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        query EmbeddingsTable($libraryId: String!, $skip: Int = 0, $take: Int = 20, $showArchived: Boolean = false) {\n          aiLibraryFiles(libraryId: $libraryId, skip: $skip, take: $take, showArchived: $showArchived) {\n            libraryId\n            library {\n              name\n            }\n            take\n            skip\n            showArchived\n            count\n            archivedCount\n            files {\n              ...AiLibraryFile_TableItem\n            }\n          }\n        }\n      ',
): (typeof documents)['\n        query EmbeddingsTable($libraryId: String!, $skip: Int = 0, $take: Int = 20, $showArchived: Boolean = false) {\n          aiLibraryFiles(libraryId: $libraryId, skip: $skip, take: $take, showArchived: $showArchived) {\n            libraryId\n            library {\n              name\n            }\n            take\n            skip\n            showArchived\n            count\n            archivedCount\n            files {\n              ...AiLibraryFile_TableItem\n            }\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        query getMarkdown($fileId: String!, $markdownFileName: String) {\n          aiLibraryFile(fileId: $fileId) {\n            markdown(markdownFileName: $markdownFileName) {\n              fileName\n              content\n            }\n          }\n        }\n      ',
): (typeof documents)['\n        query getMarkdown($fileId: String!, $markdownFileName: String) {\n          aiLibraryFile(fileId: $fileId) {\n            markdown(markdownFileName: $markdownFileName) {\n              fileName\n              content\n            }\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AiLibraryFile_MarkdownFileSelector on AiLibraryFile {\n    id\n    libraryId\n    latestExtractionMarkdownFileNames\n    availableExtractionMarkdownFileNames\n  }\n',
): (typeof documents)['\n  fragment AiLibraryFile_MarkdownFileSelector on AiLibraryFile {\n    id\n    libraryId\n    latestExtractionMarkdownFileNames\n    availableExtractionMarkdownFileNames\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AiLibraryBase on AiLibrary {\n    id\n    name\n    createdAt\n    updatedAt\n    owner {\n      name\n    }\n  }\n',
): (typeof documents)['\n  fragment AiLibraryBase on AiLibrary {\n    id\n    name\n    createdAt\n    updatedAt\n    owner {\n      name\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query aiLibraries {\n    aiLibraries {\n      ...AiLibraryBase\n    }\n  }\n',
): (typeof documents)['\n  query aiLibraries {\n    aiLibraries {\n      ...AiLibraryBase\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query aiLibraryDetail($libraryId: String!) {\n    aiLibrary(libraryId: $libraryId) {\n      id\n      owner {\n        ...User_EntityParticipantsDialog\n      }\n      participants {\n        id\n        user {\n          ...User_EntityParticipantsDialog\n        }\n      }\n      ...AiLibraryBase\n      ...AiLibraryForm_Library\n      ...LibraryDeleteDialog_Library\n    }\n  }\n',
): (typeof documents)['\n  query aiLibraryDetail($libraryId: String!) {\n    aiLibrary(libraryId: $libraryId) {\n      id\n      owner {\n        ...User_EntityParticipantsDialog\n      }\n      participants {\n        id\n        user {\n          ...User_EntityParticipantsDialog\n        }\n      }\n      ...AiLibraryBase\n      ...AiLibraryForm_Library\n      ...LibraryDeleteDialog_Library\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n          mutation prepareFile($file: AiLibraryFileInput!) {\n            prepareFile(data: $file) {\n              id\n            }\n          }\n        ',
): (typeof documents)['\n          mutation prepareFile($file: AiLibraryFileInput!) {\n            prepareFile(data: $file) {\n              id\n            }\n          }\n        ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n          mutation processFile($fileId: String!) {\n            createContentProcessingTask(fileId: $fileId) {\n              id\n            }\n          }\n        ',
): (typeof documents)['\n          mutation processFile($fileId: String!) {\n            createContentProcessingTask(fileId: $fileId) {\n              id\n            }\n          }\n        ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation deleteLibraryFiles($libraryId: String!) {\n    deleteLibraryFiles(libraryId: $libraryId)\n  }\n',
): (typeof documents)['\n  mutation deleteLibraryFiles($libraryId: String!) {\n    deleteLibraryFiles(libraryId: $libraryId)\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation deleteLibrary($id: String!) {\n    deleteLibrary(id: $id)\n  }\n',
): (typeof documents)['\n  mutation deleteLibrary($id: String!) {\n    deleteLibrary(id: $id)\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment LibraryDeleteDialog_Library on AiLibrary {\n    id\n    name\n    filesCount\n  }\n',
): (typeof documents)['\n  fragment LibraryDeleteDialog_Library on AiLibrary {\n    id\n    name\n    filesCount\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AiLibraryForm_Library on AiLibrary {\n    id\n    name\n    embeddingTimeoutMs\n    ownerId\n    filesCount\n    description\n    embeddingModelName\n    fileConverterOptions\n  }\n',
): (typeof documents)['\n  fragment AiLibraryForm_Library on AiLibrary {\n    id\n    name\n    embeddingTimeoutMs\n    ownerId\n    filesCount\n    description\n    embeddingModelName\n    fileConverterOptions\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation createLibrary($data: AiLibraryInput!) {\n          createLibrary(data: $data) {\n            id\n            name\n          }\n        }\n      ',
): (typeof documents)['\n        mutation createLibrary($data: AiLibraryInput!) {\n          createLibrary(data: $data) {\n            id\n            name\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        query queryLibraryFiles($libraryId: String!, $query: String!, $skip: Int!, $take: Int!) {\n          queryAiLibraryFiles(libraryId: $libraryId, query: $query, skip: $skip, take: $take) {\n            libraryId\n            query\n            take\n            skip\n            hitCount\n            hits {\n              pageContent\n              docName\n              docId\n              id\n              docPath\n              originUri\n              highlights {\n                field\n                snippet\n              }\n            }\n          }\n        }\n      ',
): (typeof documents)['\n        query queryLibraryFiles($libraryId: String!, $query: String!, $skip: Int!, $take: Int!) {\n          queryAiLibraryFiles(libraryId: $libraryId, query: $query, skip: $skip, take: $take) {\n            libraryId\n            query\n            take\n            skip\n            hitCount\n            hits {\n              pageContent\n              docName\n              docId\n              id\n              docPath\n              originUri\n              highlights {\n                field\n                snippet\n              }\n            }\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        query GetContentProcessingTasks(\n          $libraryId: String!\n          $fileId: String\n          $status: ProcessingStatus\n          $skip: Int\n          $take: Int\n        ) {\n          aiContentProcessingTasks(libraryId: $libraryId, fileId: $fileId, status: $status, skip: $skip, take: $take) {\n            count\n            tasks {\n              ...AiContentProcessingTask_AccordionItem\n            }\n          }\n        }\n      ',
): (typeof documents)['\n        query GetContentProcessingTasks(\n          $libraryId: String!\n          $fileId: String\n          $status: ProcessingStatus\n          $skip: Int\n          $take: Int\n        ) {\n          aiContentProcessingTasks(libraryId: $libraryId, fileId: $fileId, status: $status, skip: $skip, take: $take) {\n            count\n            tasks {\n              ...AiContentProcessingTask_AccordionItem\n            }\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AiContentProcessingTask_AccordionItem on AiContentProcessingTask {\n    id\n    ...AiContentProcessingTask_Timeline\n    file {\n      id\n      name\n      libraryId\n      library {\n        fileConverterOptions\n      }\n    }\n    createdAt\n    timeoutMs\n    metadata\n    extractionOptions\n    extractionStatus\n    embeddingStatus\n    processingTimeMs\n    processingStatus\n    chunksCount\n    chunksSize\n    extractionSubTasks {\n      id\n      extractionMethod\n      markdownFileName\n      startedAt\n      finishedAt\n      failedAt\n    }\n  }\n',
): (typeof documents)['\n  fragment AiContentProcessingTask_AccordionItem on AiContentProcessingTask {\n    id\n    ...AiContentProcessingTask_Timeline\n    file {\n      id\n      name\n      libraryId\n      library {\n        fileConverterOptions\n      }\n    }\n    createdAt\n    timeoutMs\n    metadata\n    extractionOptions\n    extractionStatus\n    embeddingStatus\n    processingTimeMs\n    processingStatus\n    chunksCount\n    chunksSize\n    extractionSubTasks {\n      id\n      extractionMethod\n      markdownFileName\n      startedAt\n      finishedAt\n      failedAt\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AiContentProcessingTask_Timeline on AiContentProcessingTask {\n    createdAt\n    processingStartedAt\n    processingFinishedAt\n    processingFailedAt\n    processingTimeout\n    extractionStartedAt\n    extractionFinishedAt\n    extractionFailedAt\n    extractionTimeMs\n    extractionTimeout\n    embeddingStartedAt\n    embeddingFinishedAt\n    embeddingFailedAt\n    embeddingTimeMs\n    embeddingTimeout\n    embeddingModelName\n    extractionSubTasks {\n      id\n      extractionMethod\n      markdownFileName\n      startedAt\n      finishedAt\n      failedAt\n    }\n  }\n',
): (typeof documents)['\n  fragment AiContentProcessingTask_Timeline on AiContentProcessingTask {\n    createdAt\n    processingStartedAt\n    processingFinishedAt\n    processingFailedAt\n    processingTimeout\n    extractionStartedAt\n    extractionFinishedAt\n    extractionFailedAt\n    extractionTimeMs\n    extractionTimeout\n    embeddingStartedAt\n    embeddingFinishedAt\n    embeddingFailedAt\n    embeddingTimeMs\n    embeddingTimeout\n    embeddingModelName\n    extractionSubTasks {\n      id\n      extractionMethod\n      markdownFileName\n      startedAt\n      finishedAt\n      failedAt\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation cancelProcessingTask($taskId: String!, $fileId: String!) {\n          cancelProcessingTask(taskId: $taskId, fileId: $fileId) {\n            id\n          }\n        }\n      ',
): (typeof documents)['\n        mutation cancelProcessingTask($taskId: String!, $fileId: String!) {\n          cancelProcessingTask(taskId: $taskId, fileId: $fileId) {\n            id\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation changeLibrary($id: String!, $data: AiLibraryInput!) {\n    updateLibrary(id: $id, data: $data) {\n      ...AiLibraryForm_Library\n    }\n  }\n',
): (typeof documents)['\n  mutation changeLibrary($id: String!, $data: AiLibraryInput!) {\n    updateLibrary(id: $id, data: $data) {\n      ...AiLibraryForm_Library\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        query libraryUpdatesList($libraryId: ID!, $crawlerId: ID, $take: Int, $skip: Int) {\n          aiLibraryUpdates(libraryId: $libraryId, crawlerId: $crawlerId, take: $take, skip: $skip) {\n            libraryId\n            library {\n              name\n            }\n            crawlerId\n            take\n            skip\n            count\n            updates {\n              ...AiLibraryUpdate_TableItem\n            }\n          }\n        }\n      ',
): (typeof documents)['\n        query libraryUpdatesList($libraryId: ID!, $crawlerId: ID, $take: Int, $skip: Int) {\n          aiLibraryUpdates(libraryId: $libraryId, crawlerId: $crawlerId, take: $take, skip: $skip) {\n            libraryId\n            library {\n              name\n            }\n            crawlerId\n            take\n            skip\n            count\n            updates {\n              ...AiLibraryUpdate_TableItem\n            }\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment AiLibraryUpdate_TableItem on AiLibraryUpdate {\n    id\n    createdAt\n    libraryId\n    crawlerRunId\n    crawlerRun {\n      id\n      crawlerId\n      crawler {\n        id\n        uri\n        uriType\n      }\n    }\n    fileId\n    file {\n      id\n      name\n    }\n    message\n    updateType\n    filePath\n    fileName\n    fileSize\n    filterType\n    filterValue\n  }\n',
): (typeof documents)['\n  fragment AiLibraryUpdate_TableItem on AiLibraryUpdate {\n    id\n    createdAt\n    libraryId\n    crawlerRunId\n    crawlerRun {\n      id\n      crawlerId\n      crawler {\n        id\n        uri\n        uriType\n      }\n    }\n    fileId\n    file {\n      id\n      name\n    }\n    message\n    updateType\n    filePath\n    fileName\n    fileSize\n    filterType\n    filterValue\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation updateLibraryParticipants($libraryId: String!, $userIds: [String!]!) {\n          updateLibraryParticipants(libraryId: $libraryId, userIds: $userIds) {\n            totalParticipants\n            addedParticipants\n            removedParticipants\n          }\n        }\n      ',
): (typeof documents)['\n        mutation updateLibraryParticipants($libraryId: String!, $userIds: [String!]!) {\n          updateLibraryParticipants(libraryId: $libraryId, userIds: $userIds) {\n            totalParticipants\n            addedParticipants\n            removedParticipants\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation removeLibraryParticipant($libraryId: String!, $participantId: String!) {\n          removeLibraryParticipant(libraryId: $libraryId, participantId: $participantId)\n        }\n      ',
): (typeof documents)['\n        mutation removeLibraryParticipant($libraryId: String!, $participantId: String!) {\n          removeLibraryParticipant(libraryId: $libraryId, participantId: $participantId)\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ListEditForm_List on AiList {\n    id\n    name\n    ownerId\n    createdAt\n    updatedAt\n  }\n',
): (typeof documents)['\n  fragment ListEditForm_List on AiList {\n    id\n    name\n    ownerId\n    createdAt\n    updatedAt\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment FieldModal_List on AiList {\n    id\n    fields {\n      id\n      name\n      type\n      sourceType\n    }\n  }\n',
): (typeof documents)['\n  fragment FieldModal_List on AiList {\n    id\n    fields {\n      id\n      name\n      type\n      sourceType\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment FieldModal_EditableField on AiListField {\n    id\n    name\n    type\n    prompt\n    contentQuery\n    languageModel\n    useVectorStore\n    order\n    context {\n      contextFieldId\n    }\n  }\n',
): (typeof documents)['\n  fragment FieldModal_EditableField on AiListField {\n    id\n    name\n    type\n    prompt\n    contentQuery\n    languageModel\n    useVectorStore\n    order\n    context {\n      contextFieldId\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ListExport_Field on AiListField {\n    id\n    name\n    type\n    order\n    sourceType\n    fileProperty\n  }\n',
): (typeof documents)['\n  fragment ListExport_Field on AiListField {\n    id\n    name\n    type\n    order\n    sourceType\n    fileProperty\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ListExport_List on AiList {\n    id\n    name\n    fields {\n      ...ListExport_Field\n    }\n  }\n',
): (typeof documents)['\n  fragment ListExport_List on AiList {\n    id\n    name\n    fields {\n      ...ListExport_Field\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ListFieldsTableFilters_AiListField on AiListField {\n    id\n    name\n    type\n  }\n',
): (typeof documents)['\n  fragment ListFieldsTableFilters_AiListField on AiListField {\n    id\n    name\n    type\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ListFieldsTableMenu_AiListField on AiListField {\n    id\n    name\n    type\n  }\n',
): (typeof documents)['\n  fragment ListFieldsTableMenu_AiListField on AiListField {\n    id\n    name\n    type\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ListItemTable_Item on ListItemResult {\n    id\n    name\n    libraryId\n    libraryName\n  }\n',
): (typeof documents)['\n  fragment ListItemTable_Item on ListItemResult {\n    id\n    name\n    libraryId\n    libraryName\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ListFilesTable_FilesQueryResult on ListItemsQueryResult {\n    count\n    take\n    skip\n    orderBy\n    orderDirection\n    items {\n      origin {\n        ...ListItemTable_Item\n      }\n    }\n  }\n',
): (typeof documents)['\n  fragment ListFilesTable_FilesQueryResult on ListItemsQueryResult {\n    count\n    take\n    skip\n    orderBy\n    orderDirection\n    items {\n      origin {\n        ...ListItemTable_Item\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ListFieldsTable_Field on AiListField {\n    id\n    listId\n    name\n    type\n    order\n    sourceType\n    fileProperty\n    prompt\n    contentQuery\n    languageModel\n    useVectorStore\n    pendingItemsCount\n    processingItemsCount\n    context {\n      contextFieldId\n    }\n    ...ListFieldsTableFilters_AiListField\n    ...ListFieldsTableMenu_AiListField\n  }\n',
): (typeof documents)['\n  fragment ListFieldsTable_Field on AiListField {\n    id\n    listId\n    name\n    type\n    order\n    sourceType\n    fileProperty\n    prompt\n    contentQuery\n    languageModel\n    useVectorStore\n    pendingItemsCount\n    processingItemsCount\n    context {\n      contextFieldId\n    }\n    ...ListFieldsTableFilters_AiListField\n    ...ListFieldsTableMenu_AiListField\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ListFieldsTable_List on AiList {\n    id\n    fields {\n      ...ListFieldsTable_Field\n    }\n  }\n',
): (typeof documents)['\n  fragment ListFieldsTable_List on AiList {\n    id\n    fields {\n      ...ListFieldsTable_Field\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ListMenu_AiList on AiList {\n    id\n    name\n    ownerId\n    owner {\n      ...User_EntityParticipantsDialog\n    }\n    participants {\n      id\n      user {\n        ...User_EntityParticipantsDialog\n      }\n    }\n  }\n',
): (typeof documents)['\n  fragment ListMenu_AiList on AiList {\n    id\n    name\n    ownerId\n    owner {\n      ...User_EntityParticipantsDialog\n    }\n    participants {\n      id\n      user {\n        ...User_EntityParticipantsDialog\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ListMenu_AiLists on AiList {\n    id\n    name\n  }\n',
): (typeof documents)['\n  fragment ListMenu_AiLists on AiList {\n    id\n    name\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ListSourcesManager_List on AiList {\n    id\n    name\n    sources {\n      id\n      libraryId\n      library {\n        id\n        name\n        owner {\n          name\n        }\n      }\n    }\n  }\n',
): (typeof documents)['\n  fragment ListSourcesManager_List on AiList {\n    id\n    name\n    sources {\n      id\n      libraryId\n      library {\n        id\n        name\n        owner {\n          name\n        }\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation addListField($listId: String!, $data: AiListFieldInput!) {\n          addListField(listId: $listId, data: $data) {\n            id\n            name\n            type\n            order\n            sourceType\n            fileProperty\n            prompt\n            contentQuery\n            languageModel\n          }\n        }\n      ',
): (typeof documents)['\n        mutation addListField($listId: String!, $data: AiListFieldInput!) {\n          addListField(listId: $listId, data: $data) {\n            id\n            name\n            type\n            order\n            sourceType\n            fileProperty\n            prompt\n            contentQuery\n            languageModel\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation addListSource($listId: String!, $data: AiListSourceInput!) {\n          addListSource(listId: $listId, data: $data) {\n            id\n            libraryId\n            library {\n              id\n              name\n              owner {\n                name\n              }\n            }\n          }\n        }\n      ',
): (typeof documents)['\n        mutation addListSource($listId: String!, $data: AiListSourceInput!) {\n          addListSource(listId: $listId, data: $data) {\n            id\n            libraryId\n            library {\n              id\n              name\n              owner {\n                name\n              }\n            }\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation CleanEnrichments($listId: String!, $fieldId: String!) {\n    cleanListEnrichments(listId: $listId, fieldId: $fieldId) {\n      success\n      clearedItems\n      error\n    }\n  }\n',
): (typeof documents)['\n  mutation CleanEnrichments($listId: String!, $fieldId: String!) {\n    cleanListEnrichments(listId: $listId, fieldId: $fieldId) {\n      success\n      clearedItems\n      error\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation createList($data: AiListInput!) {\n          createList(data: $data) {\n            id\n          }\n        }\n      ',
): (typeof documents)['\n        mutation createList($data: AiListInput!) {\n          createList(data: $data) {\n            id\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation deleteList($id: String!) {\n          deleteList(id: $id) {\n            id\n            name\n          }\n        }\n      ',
): (typeof documents)['\n        mutation deleteList($id: String!) {\n          deleteList(id: $id) {\n            id\n            name\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query aiListFilesWithValues(\n    $listId: String!\n    $skip: Int!\n    $take: Int!\n    $orderBy: String\n    $orderDirection: String\n    $fieldIds: [String!]!\n    $filters: [AiListFilterInput!]!\n  ) {\n    aiListItems(\n      listId: $listId\n      fieldIds: $fieldIds\n      filters: $filters\n      skip: $skip\n      take: $take\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n    ) {\n      count\n      take\n      skip\n      orderBy\n      orderDirection\n      items {\n        origin {\n          id\n          type\n          name\n          libraryId\n          libraryName\n        }\n        values {\n          fieldId\n          fieldName\n          displayValue\n          enrichmentErrorMessage\n          queueStatus\n        }\n      }\n    }\n  }\n',
): (typeof documents)['\n  query aiListFilesWithValues(\n    $listId: String!\n    $skip: Int!\n    $take: Int!\n    $orderBy: String\n    $orderDirection: String\n    $fieldIds: [String!]!\n    $filters: [AiListFilterInput!]!\n  ) {\n    aiListItems(\n      listId: $listId\n      fieldIds: $fieldIds\n      filters: $filters\n      skip: $skip\n      take: $take\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n    ) {\n      count\n      take\n      skip\n      orderBy\n      orderDirection\n      items {\n        origin {\n          id\n          type\n          name\n          libraryId\n          libraryName\n        }\n        values {\n          fieldId\n          fieldName\n          displayValue\n          enrichmentErrorMessage\n          queueStatus\n        }\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        query getList($listId: String!) {\n          aiList(id: $listId) {\n            id\n            ...ListsBase\n            ...ListEditForm_List\n            ...ListSourcesManager_List\n            ...ListFieldsTable_List\n            ...ListMenu_AiList\n          }\n        }\n      ',
): (typeof documents)['\n        query getList($listId: String!) {\n          aiList(id: $listId) {\n            id\n            ...ListsBase\n            ...ListEditForm_List\n            ...ListSourcesManager_List\n            ...ListFieldsTable_List\n            ...ListMenu_AiList\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment ListsBase on AiList {\n    id\n    ownerId\n    createdAt\n    updatedAt\n  }\n',
): (typeof documents)['\n  fragment ListsBase on AiList {\n    id\n    ownerId\n    createdAt\n    updatedAt\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n      query getUserLists {\n        aiLists {\n          ...ListsBase\n          ...ListMenu_AiLists\n        }\n      }\n    ',
): (typeof documents)['\n      query getUserLists {\n        aiLists {\n          ...ListsBase\n          ...ListMenu_AiLists\n        }\n      }\n    ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query ListExportData($listId: String!, $skip: Int!, $take: Int!, $fieldIds: [String!]!) {\n    aiList(id: $listId) {\n      ...ListExport_List\n    }\n    aiListItems(\n      listId: $listId\n      fieldIds: $fieldIds\n      skip: $skip\n      take: $take\n      orderBy: "name"\n      orderDirection: "asc"\n    ) {\n      count\n      items {\n        origin {\n          id\n          name\n          libraryId\n          libraryName\n        }\n        values {\n          fieldId\n          fieldName\n          displayValue\n        }\n      }\n    }\n  }\n',
): (typeof documents)['\n  query ListExportData($listId: String!, $skip: Int!, $take: Int!, $fieldIds: [String!]!) {\n    aiList(id: $listId) {\n      ...ListExport_List\n    }\n    aiListItems(\n      listId: $listId\n      fieldIds: $fieldIds\n      skip: $skip\n      take: $take\n      orderBy: "name"\n      orderDirection: "asc"\n    ) {\n      count\n      items {\n        origin {\n          id\n          name\n          libraryId\n          libraryName\n        }\n        values {\n          fieldId\n          fieldName\n          displayValue\n        }\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation removeFromEnrichmentQueue($listId: String!, $fieldId: String!, $fileId: String!) {\n          removeFromEnrichmentQueue(listId: $listId, fieldId: $fieldId, fileId: $fileId) {\n            success\n            queuedItems\n            error\n          }\n        }\n      ',
): (typeof documents)['\n        mutation removeFromEnrichmentQueue($listId: String!, $fieldId: String!, $fileId: String!) {\n          removeFromEnrichmentQueue(listId: $listId, fieldId: $fieldId, fileId: $fileId) {\n            success\n            queuedItems\n            error\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation removeListField($id: String!) {\n          removeListField(id: $id) {\n            id\n          }\n        }\n      ',
): (typeof documents)['\n        mutation removeListField($id: String!) {\n          removeListField(id: $id) {\n            id\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation removeListSource($id: String!) {\n          removeListSource(id: $id) {\n            id\n          }\n        }\n      ',
): (typeof documents)['\n        mutation removeListSource($id: String!) {\n          removeListSource(id: $id) {\n            id\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation StartListEnrichment($listId: String!, $fieldId: String!) {\n    startListEnrichment(listId: $listId, fieldId: $fieldId) {\n      success\n      queuedItems\n      error\n    }\n  }\n',
): (typeof documents)['\n  mutation StartListEnrichment($listId: String!, $fieldId: String!) {\n    startListEnrichment(listId: $listId, fieldId: $fieldId) {\n      success\n      queuedItems\n      error\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation startSingleEnrichment($listId: String!, $fieldId: String!, $fileId: String!) {\n          startSingleEnrichment(listId: $listId, fieldId: $fieldId, fileId: $fileId) {\n            success\n            error\n          }\n        }\n      ',
): (typeof documents)['\n        mutation startSingleEnrichment($listId: String!, $fieldId: String!, $fileId: String!) {\n          startSingleEnrichment(listId: $listId, fieldId: $fieldId, fileId: $fileId) {\n            success\n            error\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation StopListEnrichment($listId: String!, $fieldId: String!) {\n    stopListEnrichment(listId: $listId, fieldId: $fieldId) {\n      success\n      queuedItems\n      error\n    }\n  }\n',
): (typeof documents)['\n  mutation StopListEnrichment($listId: String!, $fieldId: String!) {\n    stopListEnrichment(listId: $listId, fieldId: $fieldId) {\n      success\n      queuedItems\n      error\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation updateListField($id: String!, $data: AiListFieldInput!) {\n          updateListField(id: $id, data: $data) {\n            id\n            name\n            type\n            order\n            sourceType\n            fileProperty\n            prompt\n            contentQuery\n            languageModel\n          }\n        }\n      ',
): (typeof documents)['\n        mutation updateListField($id: String!, $data: AiListFieldInput!) {\n          updateListField(id: $id, data: $data) {\n            id\n            name\n            type\n            order\n            sourceType\n            fileProperty\n            prompt\n            contentQuery\n            languageModel\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation updateList($id: String!, $data: AiListInput!) {\n          updateList(id: $id, data: $data) {\n            id\n          }\n        }\n      ',
): (typeof documents)['\n        mutation updateList($id: String!, $data: AiListInput!) {\n          updateList(id: $id, data: $data) {\n            id\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation updateListParticipants($listId: String!, $userIds: [String!]!) {\n          updateListParticipants(listId: $listId, userIds: $userIds) {\n            addedParticipants\n            removedParticipants\n            totalParticipants\n          }\n        }\n      ',
): (typeof documents)['\n        mutation updateListParticipants($listId: String!, $userIds: [String!]!) {\n          updateListParticipants(listId: $listId, userIds: $userIds) {\n            addedParticipants\n            removedParticipants\n            totalParticipants\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation removeListParticipant($listId: String!, $participantId: String!) {\n          removeListParticipant(listId: $listId, participantId: $participantId)\n        }\n      ',
): (typeof documents)['\n        mutation removeListParticipant($listId: String!, $participantId: String!) {\n          removeListParticipant(listId: $listId, participantId: $participantId)\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n      query aiChatModels {\n        aiChatModels\n      }\n    ',
): (typeof documents)['\n      query aiChatModels {\n        aiChatModels\n      }\n    ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n      query aiEmbeddingModels {\n        aiEmbeddingModels\n      }\n    ',
): (typeof documents)['\n      query aiEmbeddingModels {\n        aiEmbeddingModels\n      }\n    ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment User_EntityParticipantsDialog on User {\n    id\n    name\n    username\n    given_name\n    family_name\n    email\n    avatarUrl\n    profile {\n      position\n      business\n    }\n  }\n\n  fragment Assistant_EntityParticipantsDialog on AiAssistant {\n    id\n    name\n    description\n    iconUrl\n    ownerId\n  }\n',
): (typeof documents)['\n  fragment User_EntityParticipantsDialog on User {\n    id\n    name\n    username\n    given_name\n    family_name\n    email\n    avatarUrl\n    profile {\n      position\n      business\n    }\n  }\n\n  fragment Assistant_EntityParticipantsDialog on AiAssistant {\n    id\n    name\n    description\n    iconUrl\n    ownerId\n  }\n']
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
  source: '\n        mutation saveUserProfile($profileId: String!, $userProfileInput: UserProfileInput!) {\n          updateUserProfile(profileId: $profileId, input: $userProfileInput) {\n            id\n          }\n        }\n      ',
): (typeof documents)['\n        mutation saveUserProfile($profileId: String!, $userProfileInput: UserProfileInput!) {\n          updateUserProfile(profileId: $profileId, input: $userProfileInput) {\n            id\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query userProfile {\n    userProfile {\n      id\n      confirmationDate\n      ...UserProfileForm_UserProfile\n    }\n  }\n',
): (typeof documents)['\n  query userProfile {\n    userProfile {\n      id\n      confirmationDate\n      ...UserProfileForm_UserProfile\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation addAssistantParticipant($assistantId: String!, $userIds: [String!]!) {\n    addAssistantParticipants(assistantId: $assistantId, userIds: $userIds) {\n      id\n    }\n  }\n',
): (typeof documents)['\n  mutation addAssistantParticipant($assistantId: String!, $userIds: [String!]!) {\n    addAssistantParticipants(assistantId: $assistantId, userIds: $userIds) {\n      id\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation removeAssistantParticipant($assistantId: String!, $userId: String!) {\n    removeAssistantParticipant(assistantId: $assistantId, userId: $userId) {\n      id\n    }\n  }\n',
): (typeof documents)['\n  mutation removeAssistantParticipant($assistantId: String!, $userId: String!) {\n    removeAssistantParticipant(assistantId: $assistantId, userId: $userId) {\n      id\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation leaveAssistantParticipant($assistantId: String!) {\n    leaveAssistantParticipant(assistantId: $assistantId) {\n      id\n    }\n  }\n',
): (typeof documents)['\n  mutation leaveAssistantParticipant($assistantId: String!) {\n    leaveAssistantParticipant(assistantId: $assistantId) {\n      id\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation updateUserAvatar($avatarUrl: String) {\n          updateUserAvatar(avatarUrl: $avatarUrl) {\n            id\n            avatarUrl\n          }\n        }\n      ',
): (typeof documents)['\n        mutation updateUserAvatar($avatarUrl: String) {\n          updateUserAvatar(avatarUrl: $avatarUrl) {\n            id\n            avatarUrl\n          }\n        }\n      ']
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
  source: '\n  mutation removeConversationParticipant($participantId: String!) {\n    removeConversationParticipant(participantId: $participantId) {\n      id\n    }\n  }\n',
): (typeof documents)['\n  mutation removeConversationParticipant($participantId: String!) {\n    removeConversationParticipant(participantId: $participantId) {\n      id\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation createConversationInvitations($conversationId: String!, $data: [ConversationInvitationInput!]!) {\n    createConversationInvitations(conversationId: $conversationId, data: $data) {\n      id\n    }\n  }\n',
): (typeof documents)['\n  mutation createConversationInvitations($conversationId: String!, $data: [ConversationInvitationInput!]!) {\n    createConversationInvitations(conversationId: $conversationId, data: $data) {\n      id\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation confirmInvitation($conversationId: String!, $invitationId: String!) {\n    confirmConversationInvitation(conversationId: $conversationId, invitationId: $invitationId) {\n      id\n    }\n  }\n',
): (typeof documents)['\n  mutation confirmInvitation($conversationId: String!, $invitationId: String!) {\n    confirmConversationInvitation(conversationId: $conversationId, invitationId: $invitationId) {\n      id\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation sendMessage($data: AiConversationMessageInput!) {\n    sendMessage(data: $data) {\n      id\n      createdAt\n    }\n  }\n',
): (typeof documents)['\n  mutation sendMessage($data: AiConversationMessageInput!) {\n    sendMessage(data: $data) {\n      id\n      createdAt\n    }\n  }\n']
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
  source: '\n        mutation deleteConversations($conversationIds: [String!]!) {\n          deleteAiConversations(conversationIds: $conversationIds)\n        }\n      ',
): (typeof documents)['\n        mutation deleteConversations($conversationIds: [String!]!) {\n          deleteAiConversations(conversationIds: $conversationIds)\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation leaveConversation($participantId: String!) {\n    leaveAiConversation(participantId: $participantId) {\n      id\n    }\n  }\n',
): (typeof documents)['\n  mutation leaveConversation($participantId: String!) {\n    leaveAiConversation(participantId: $participantId) {\n      id\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment User on User {\n    id\n    username\n    name\n    createdAt\n    email\n    avatarUrl\n    isAdmin\n    profile {\n      firstName\n      lastName\n      business\n      position\n      confirmationDate\n      activationDate\n    }\n  }\n',
): (typeof documents)['\n  fragment User on User {\n    id\n    username\n    name\n    createdAt\n    email\n    avatarUrl\n    isAdmin\n    profile {\n      firstName\n      lastName\n      business\n      position\n      confirmationDate\n      activationDate\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query users {\n    users {\n      ...User\n    }\n  }\n',
): (typeof documents)['\n  query users {\n    users {\n      ...User\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation sendConfirmationMail($confirmationUrl: String!, $activationUrl: String!) {\n          sendConfirmationMail(confirmationUrl: $confirmationUrl, activationUrl: $activationUrl)\n        }\n      ',
): (typeof documents)['\n        mutation sendConfirmationMail($confirmationUrl: String!, $activationUrl: String!) {\n          sendConfirmationMail(confirmationUrl: $confirmationUrl, activationUrl: $activationUrl)\n        }\n      ']
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
  source: '\n  fragment UserProfile on UserProfile {\n    id\n    userId\n    email\n    firstName\n    lastName\n    business\n    position\n    freeMessages\n    usedMessages\n    freeStorage\n    usedStorage\n    createdAt\n    updatedAt\n    confirmationDate\n    activationDate\n    expiresAt\n  }\n',
): (typeof documents)['\n  fragment UserProfile on UserProfile {\n    id\n    userId\n    email\n    firstName\n    lastName\n    business\n    position\n    freeMessages\n    usedMessages\n    freeStorage\n    usedStorage\n    createdAt\n    updatedAt\n    confirmationDate\n    activationDate\n    expiresAt\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n      query getUserProfile {\n        userProfile {\n          ...UserProfile\n        }\n      }\n    ',
): (typeof documents)['\n      query getUserProfile {\n        userProfile {\n          ...UserProfile\n        }\n      }\n    ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation updateUserProfile($profileId: String!, $userProfileInput: UserProfileInput!) {\n          updateUserProfile(profileId: $profileId, input: $userProfileInput) {\n            id\n          }\n        }\n      ',
): (typeof documents)['\n        mutation updateUserProfile($profileId: String!, $userProfileInput: UserProfileInput!) {\n          updateUserProfile(profileId: $profileId, input: $userProfileInput) {\n            id\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        mutation activateUserProfile($profileId: String!) {\n          activateUserProfile(profileId: $profileId) {\n            id\n          }\n        }\n      ',
): (typeof documents)['\n        mutation activateUserProfile($profileId: String!) {\n          activateUserProfile(profileId: $profileId) {\n            id\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query adminUserById($email: String!) {\n    user(email: $email) {\n      ...User\n      profile {\n        ...UserProfileForm_UserProfile\n      }\n    }\n  }\n',
): (typeof documents)['\n  query adminUserById($email: String!) {\n    user(email: $email) {\n      ...User\n      profile {\n        ...UserProfileForm_UserProfile\n      }\n    }\n  }\n']

export function graphql(source: string) {
  return (documents as any)[source] ?? {}
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never
