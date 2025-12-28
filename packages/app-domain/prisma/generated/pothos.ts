/* eslint-disable */
import type { Prisma, User, UserProfile, Workspace, WorkspaceMember, WorkspaceInvitation, AiServiceProvider, AiAssistant, AiAssistantBaseCase, AiAssistantEUActAnswers, AiLibrary, AiLibraryUsage, AiLibraryFile, AiContentProcessingTask, AiContentExtractionSubTask, AiLibraryCrawler, AiLibraryCrawlerRun, AiLibraryCrawlerCronJob, AiLibraryUpdate, AiList, AiListSource, AiListItem, AiListField, AiListFieldContext, AiListItemCache, AiEnrichmentTask, AiConversation, AiConversationParticipant, AiConversationMessage, AiConversationInvitation, ApiKey, AiLanguageModel, AiModelUsage, AiConnectorTypeWorkspace, AiConnector, AiAutomation, AiAutomationItem, AiAutomationItemExecution, AiAutomationBatch } from "/workspaces/george-ai/packages/app-domain/prisma/generated/client.js";
export default interface PrismaTypes {
    User: {
        Name: "User";
        Shape: User;
        Include: Prisma.UserInclude;
        Select: Prisma.UserSelect;
        OrderBy: Prisma.UserOrderByWithRelationInput;
        WhereUnique: Prisma.UserWhereUniqueInput;
        Where: Prisma.UserWhereInput;
        Create: {};
        Update: {};
        RelationName: "assistants" | "conversations" | "conversationInvitation" | "conversationParticipations" | "libraries" | "crawlerRuns" | "lists" | "modelUsageLogs" | "apiKeys" | "profile" | "defaultWorkspace" | "workspaceMemberships" | "workspaceInvitations";
        ListRelations: "assistants" | "conversations" | "conversationInvitation" | "conversationParticipations" | "libraries" | "crawlerRuns" | "lists" | "modelUsageLogs" | "apiKeys" | "workspaceMemberships" | "workspaceInvitations";
        Relations: {
            assistants: {
                Shape: AiAssistant[];
                Name: "AiAssistant";
                Nullable: false;
            };
            conversations: {
                Shape: AiConversation[];
                Name: "AiConversation";
                Nullable: false;
            };
            conversationInvitation: {
                Shape: AiConversationInvitation[];
                Name: "AiConversationInvitation";
                Nullable: false;
            };
            conversationParticipations: {
                Shape: AiConversationParticipant[];
                Name: "AiConversationParticipant";
                Nullable: false;
            };
            libraries: {
                Shape: AiLibrary[];
                Name: "AiLibrary";
                Nullable: false;
            };
            crawlerRuns: {
                Shape: AiLibraryCrawlerRun[];
                Name: "AiLibraryCrawlerRun";
                Nullable: false;
            };
            lists: {
                Shape: AiList[];
                Name: "AiList";
                Nullable: false;
            };
            modelUsageLogs: {
                Shape: AiModelUsage[];
                Name: "AiModelUsage";
                Nullable: false;
            };
            apiKeys: {
                Shape: ApiKey[];
                Name: "ApiKey";
                Nullable: false;
            };
            profile: {
                Shape: UserProfile | null;
                Name: "UserProfile";
                Nullable: true;
            };
            defaultWorkspace: {
                Shape: Workspace;
                Name: "Workspace";
                Nullable: false;
            };
            workspaceMemberships: {
                Shape: WorkspaceMember[];
                Name: "WorkspaceMember";
                Nullable: false;
            };
            workspaceInvitations: {
                Shape: WorkspaceInvitation[];
                Name: "WorkspaceInvitation";
                Nullable: false;
            };
        };
    };
    UserProfile: {
        Name: "UserProfile";
        Shape: UserProfile;
        Include: Prisma.UserProfileInclude;
        Select: Prisma.UserProfileSelect;
        OrderBy: Prisma.UserProfileOrderByWithRelationInput;
        WhereUnique: Prisma.UserProfileWhereUniqueInput;
        Where: Prisma.UserProfileWhereInput;
        Create: {};
        Update: {};
        RelationName: "user";
        ListRelations: never;
        Relations: {
            user: {
                Shape: User;
                Name: "User";
                Nullable: false;
            };
        };
    };
    Workspace: {
        Name: "Workspace";
        Shape: Workspace;
        Include: Prisma.WorkspaceInclude;
        Select: Prisma.WorkspaceSelect;
        OrderBy: Prisma.WorkspaceOrderByWithRelationInput;
        WhereUnique: Prisma.WorkspaceWhereUniqueInput;
        Where: Prisma.WorkspaceWhereInput;
        Create: {};
        Update: {};
        RelationName: "aiProviders" | "languageModels" | "libraries" | "assistants" | "lists" | "conversations" | "members" | "invitations" | "defaultForUsers" | "connectorTypes" | "connectors" | "automations";
        ListRelations: "aiProviders" | "languageModels" | "libraries" | "assistants" | "lists" | "conversations" | "members" | "invitations" | "defaultForUsers" | "connectorTypes" | "connectors" | "automations";
        Relations: {
            aiProviders: {
                Shape: AiServiceProvider[];
                Name: "AiServiceProvider";
                Nullable: false;
            };
            languageModels: {
                Shape: AiLanguageModel[];
                Name: "AiLanguageModel";
                Nullable: false;
            };
            libraries: {
                Shape: AiLibrary[];
                Name: "AiLibrary";
                Nullable: false;
            };
            assistants: {
                Shape: AiAssistant[];
                Name: "AiAssistant";
                Nullable: false;
            };
            lists: {
                Shape: AiList[];
                Name: "AiList";
                Nullable: false;
            };
            conversations: {
                Shape: AiConversation[];
                Name: "AiConversation";
                Nullable: false;
            };
            members: {
                Shape: WorkspaceMember[];
                Name: "WorkspaceMember";
                Nullable: false;
            };
            invitations: {
                Shape: WorkspaceInvitation[];
                Name: "WorkspaceInvitation";
                Nullable: false;
            };
            defaultForUsers: {
                Shape: User[];
                Name: "User";
                Nullable: false;
            };
            connectorTypes: {
                Shape: AiConnectorTypeWorkspace[];
                Name: "AiConnectorTypeWorkspace";
                Nullable: false;
            };
            connectors: {
                Shape: AiConnector[];
                Name: "AiConnector";
                Nullable: false;
            };
            automations: {
                Shape: AiAutomation[];
                Name: "AiAutomation";
                Nullable: false;
            };
        };
    };
    WorkspaceMember: {
        Name: "WorkspaceMember";
        Shape: WorkspaceMember;
        Include: Prisma.WorkspaceMemberInclude;
        Select: Prisma.WorkspaceMemberSelect;
        OrderBy: Prisma.WorkspaceMemberOrderByWithRelationInput;
        WhereUnique: Prisma.WorkspaceMemberWhereUniqueInput;
        Where: Prisma.WorkspaceMemberWhereInput;
        Create: {};
        Update: {};
        RelationName: "workspace" | "user";
        ListRelations: never;
        Relations: {
            workspace: {
                Shape: Workspace;
                Name: "Workspace";
                Nullable: false;
            };
            user: {
                Shape: User;
                Name: "User";
                Nullable: false;
            };
        };
    };
    WorkspaceInvitation: {
        Name: "WorkspaceInvitation";
        Shape: WorkspaceInvitation;
        Include: Prisma.WorkspaceInvitationInclude;
        Select: Prisma.WorkspaceInvitationSelect;
        OrderBy: Prisma.WorkspaceInvitationOrderByWithRelationInput;
        WhereUnique: Prisma.WorkspaceInvitationWhereUniqueInput;
        Where: Prisma.WorkspaceInvitationWhereInput;
        Create: {};
        Update: {};
        RelationName: "workspace" | "inviter";
        ListRelations: never;
        Relations: {
            workspace: {
                Shape: Workspace;
                Name: "Workspace";
                Nullable: false;
            };
            inviter: {
                Shape: User;
                Name: "User";
                Nullable: false;
            };
        };
    };
    AiServiceProvider: {
        Name: "AiServiceProvider";
        Shape: AiServiceProvider;
        Include: Prisma.AiServiceProviderInclude;
        Select: Prisma.AiServiceProviderSelect;
        OrderBy: Prisma.AiServiceProviderOrderByWithRelationInput;
        WhereUnique: Prisma.AiServiceProviderWhereUniqueInput;
        Where: Prisma.AiServiceProviderWhereInput;
        Create: {};
        Update: {};
        RelationName: "workspace";
        ListRelations: never;
        Relations: {
            workspace: {
                Shape: Workspace;
                Name: "Workspace";
                Nullable: false;
            };
        };
    };
    AiAssistant: {
        Name: "AiAssistant";
        Shape: AiAssistant;
        Include: Prisma.AiAssistantInclude;
        Select: Prisma.AiAssistantSelect;
        OrderBy: Prisma.AiAssistantOrderByWithRelationInput;
        WhereUnique: Prisma.AiAssistantWhereUniqueInput;
        Where: Prisma.AiAssistantWhereInput;
        Create: {};
        Update: {};
        RelationName: "languageModel" | "owner" | "workspace" | "baseCases" | "euActAnswers" | "conversationParticipations" | "usages" | "modelUsageLogs";
        ListRelations: "baseCases" | "euActAnswers" | "conversationParticipations" | "usages" | "modelUsageLogs";
        Relations: {
            languageModel: {
                Shape: AiLanguageModel | null;
                Name: "AiLanguageModel";
                Nullable: true;
            };
            owner: {
                Shape: User;
                Name: "User";
                Nullable: false;
            };
            workspace: {
                Shape: Workspace;
                Name: "Workspace";
                Nullable: false;
            };
            baseCases: {
                Shape: AiAssistantBaseCase[];
                Name: "AiAssistantBaseCase";
                Nullable: false;
            };
            euActAnswers: {
                Shape: AiAssistantEUActAnswers[];
                Name: "AiAssistantEUActAnswers";
                Nullable: false;
            };
            conversationParticipations: {
                Shape: AiConversationParticipant[];
                Name: "AiConversationParticipant";
                Nullable: false;
            };
            usages: {
                Shape: AiLibraryUsage[];
                Name: "AiLibraryUsage";
                Nullable: false;
            };
            modelUsageLogs: {
                Shape: AiModelUsage[];
                Name: "AiModelUsage";
                Nullable: false;
            };
        };
    };
    AiAssistantBaseCase: {
        Name: "AiAssistantBaseCase";
        Shape: AiAssistantBaseCase;
        Include: Prisma.AiAssistantBaseCaseInclude;
        Select: Prisma.AiAssistantBaseCaseSelect;
        OrderBy: Prisma.AiAssistantBaseCaseOrderByWithRelationInput;
        WhereUnique: Prisma.AiAssistantBaseCaseWhereUniqueInput;
        Where: Prisma.AiAssistantBaseCaseWhereInput;
        Create: {};
        Update: {};
        RelationName: "assistant";
        ListRelations: never;
        Relations: {
            assistant: {
                Shape: AiAssistant;
                Name: "AiAssistant";
                Nullable: false;
            };
        };
    };
    AiAssistantEUActAnswers: {
        Name: "AiAssistantEUActAnswers";
        Shape: AiAssistantEUActAnswers;
        Include: Prisma.AiAssistantEUActAnswersInclude;
        Select: Prisma.AiAssistantEUActAnswersSelect;
        OrderBy: Prisma.AiAssistantEUActAnswersOrderByWithRelationInput;
        WhereUnique: Prisma.AiAssistantEUActAnswersWhereUniqueInput;
        Where: Prisma.AiAssistantEUActAnswersWhereInput;
        Create: {};
        Update: {};
        RelationName: "assistant";
        ListRelations: never;
        Relations: {
            assistant: {
                Shape: AiAssistant;
                Name: "AiAssistant";
                Nullable: false;
            };
        };
    };
    AiLibrary: {
        Name: "AiLibrary";
        Shape: AiLibrary;
        Include: Prisma.AiLibraryInclude;
        Select: Prisma.AiLibrarySelect;
        OrderBy: Prisma.AiLibraryOrderByWithRelationInput;
        WhereUnique: Prisma.AiLibraryWhereUniqueInput;
        Where: Prisma.AiLibraryWhereInput;
        Create: {};
        Update: {};
        RelationName: "contentExtractionTasks" | "embeddingModel" | "ocrModel" | "extractionModel" | "owner" | "workspace" | "crawlers" | "files" | "updates" | "usages" | "listSources" | "modelUsageLogs" | "apiKeys";
        ListRelations: "contentExtractionTasks" | "crawlers" | "files" | "updates" | "usages" | "listSources" | "modelUsageLogs" | "apiKeys";
        Relations: {
            contentExtractionTasks: {
                Shape: AiContentProcessingTask[];
                Name: "AiContentProcessingTask";
                Nullable: false;
            };
            embeddingModel: {
                Shape: AiLanguageModel | null;
                Name: "AiLanguageModel";
                Nullable: true;
            };
            ocrModel: {
                Shape: AiLanguageModel | null;
                Name: "AiLanguageModel";
                Nullable: true;
            };
            extractionModel: {
                Shape: AiLanguageModel | null;
                Name: "AiLanguageModel";
                Nullable: true;
            };
            owner: {
                Shape: User;
                Name: "User";
                Nullable: false;
            };
            workspace: {
                Shape: Workspace;
                Name: "Workspace";
                Nullable: false;
            };
            crawlers: {
                Shape: AiLibraryCrawler[];
                Name: "AiLibraryCrawler";
                Nullable: false;
            };
            files: {
                Shape: AiLibraryFile[];
                Name: "AiLibraryFile";
                Nullable: false;
            };
            updates: {
                Shape: AiLibraryUpdate[];
                Name: "AiLibraryUpdate";
                Nullable: false;
            };
            usages: {
                Shape: AiLibraryUsage[];
                Name: "AiLibraryUsage";
                Nullable: false;
            };
            listSources: {
                Shape: AiListSource[];
                Name: "AiListSource";
                Nullable: false;
            };
            modelUsageLogs: {
                Shape: AiModelUsage[];
                Name: "AiModelUsage";
                Nullable: false;
            };
            apiKeys: {
                Shape: ApiKey[];
                Name: "ApiKey";
                Nullable: false;
            };
        };
    };
    AiLibraryUsage: {
        Name: "AiLibraryUsage";
        Shape: AiLibraryUsage;
        Include: Prisma.AiLibraryUsageInclude;
        Select: Prisma.AiLibraryUsageSelect;
        OrderBy: Prisma.AiLibraryUsageOrderByWithRelationInput;
        WhereUnique: Prisma.AiLibraryUsageWhereUniqueInput;
        Where: Prisma.AiLibraryUsageWhereInput;
        Create: {};
        Update: {};
        RelationName: "assistant" | "library";
        ListRelations: never;
        Relations: {
            assistant: {
                Shape: AiAssistant;
                Name: "AiAssistant";
                Nullable: false;
            };
            library: {
                Shape: AiLibrary;
                Name: "AiLibrary";
                Nullable: false;
            };
        };
    };
    AiLibraryFile: {
        Name: "AiLibraryFile";
        Shape: AiLibraryFile;
        Include: Prisma.AiLibraryFileInclude;
        Select: Prisma.AiLibraryFileSelect;
        OrderBy: Prisma.AiLibraryFileOrderByWithRelationInput;
        WhereUnique: Prisma.AiLibraryFileWhereUniqueInput;
        Where: Prisma.AiLibraryFileWhereInput;
        Create: {};
        Update: {};
        RelationName: "contentExtractionTasks" | "crawledByCrawler" | "library" | "updates" | "listItems";
        ListRelations: "contentExtractionTasks" | "updates" | "listItems";
        Relations: {
            contentExtractionTasks: {
                Shape: AiContentProcessingTask[];
                Name: "AiContentProcessingTask";
                Nullable: false;
            };
            crawledByCrawler: {
                Shape: AiLibraryCrawler | null;
                Name: "AiLibraryCrawler";
                Nullable: true;
            };
            library: {
                Shape: AiLibrary;
                Name: "AiLibrary";
                Nullable: false;
            };
            updates: {
                Shape: AiLibraryUpdate[];
                Name: "AiLibraryUpdate";
                Nullable: false;
            };
            listItems: {
                Shape: AiListItem[];
                Name: "AiListItem";
                Nullable: false;
            };
        };
    };
    AiContentProcessingTask: {
        Name: "AiContentProcessingTask";
        Shape: AiContentProcessingTask;
        Include: Prisma.AiContentProcessingTaskInclude;
        Select: Prisma.AiContentProcessingTaskSelect;
        OrderBy: Prisma.AiContentProcessingTaskOrderByWithRelationInput;
        WhereUnique: Prisma.AiContentProcessingTaskWhereUniqueInput;
        Where: Prisma.AiContentProcessingTaskWhereInput;
        Create: {};
        Update: {};
        RelationName: "embeddingModel" | "extractionSubTasks" | "file" | "library";
        ListRelations: "extractionSubTasks";
        Relations: {
            embeddingModel: {
                Shape: AiLanguageModel | null;
                Name: "AiLanguageModel";
                Nullable: true;
            };
            extractionSubTasks: {
                Shape: AiContentExtractionSubTask[];
                Name: "AiContentExtractionSubTask";
                Nullable: false;
            };
            file: {
                Shape: AiLibraryFile;
                Name: "AiLibraryFile";
                Nullable: false;
            };
            library: {
                Shape: AiLibrary;
                Name: "AiLibrary";
                Nullable: false;
            };
        };
    };
    AiContentExtractionSubTask: {
        Name: "AiContentExtractionSubTask";
        Shape: AiContentExtractionSubTask;
        Include: Prisma.AiContentExtractionSubTaskInclude;
        Select: Prisma.AiContentExtractionSubTaskSelect;
        OrderBy: Prisma.AiContentExtractionSubTaskOrderByWithRelationInput;
        WhereUnique: Prisma.AiContentExtractionSubTaskWhereUniqueInput;
        Where: Prisma.AiContentExtractionSubTaskWhereInput;
        Create: {};
        Update: {};
        RelationName: "contentProcessingTask";
        ListRelations: never;
        Relations: {
            contentProcessingTask: {
                Shape: AiContentProcessingTask;
                Name: "AiContentProcessingTask";
                Nullable: false;
            };
        };
    };
    AiLibraryCrawler: {
        Name: "AiLibraryCrawler";
        Shape: AiLibraryCrawler;
        Include: Prisma.AiLibraryCrawlerInclude;
        Select: Prisma.AiLibraryCrawlerSelect;
        OrderBy: Prisma.AiLibraryCrawlerOrderByWithRelationInput;
        WhereUnique: Prisma.AiLibraryCrawlerWhereUniqueInput;
        Where: Prisma.AiLibraryCrawlerWhereInput;
        Create: {};
        Update: {};
        RelationName: "library" | "cronJob" | "runs" | "files";
        ListRelations: "runs" | "files";
        Relations: {
            library: {
                Shape: AiLibrary;
                Name: "AiLibrary";
                Nullable: false;
            };
            cronJob: {
                Shape: AiLibraryCrawlerCronJob | null;
                Name: "AiLibraryCrawlerCronJob";
                Nullable: true;
            };
            runs: {
                Shape: AiLibraryCrawlerRun[];
                Name: "AiLibraryCrawlerRun";
                Nullable: false;
            };
            files: {
                Shape: AiLibraryFile[];
                Name: "AiLibraryFile";
                Nullable: false;
            };
        };
    };
    AiLibraryCrawlerRun: {
        Name: "AiLibraryCrawlerRun";
        Shape: AiLibraryCrawlerRun;
        Include: Prisma.AiLibraryCrawlerRunInclude;
        Select: Prisma.AiLibraryCrawlerRunSelect;
        OrderBy: Prisma.AiLibraryCrawlerRunOrderByWithRelationInput;
        WhereUnique: Prisma.AiLibraryCrawlerRunWhereUniqueInput;
        Where: Prisma.AiLibraryCrawlerRunWhereInput;
        Create: {};
        Update: {};
        RelationName: "crawler" | "runBy" | "updates";
        ListRelations: "updates";
        Relations: {
            crawler: {
                Shape: AiLibraryCrawler;
                Name: "AiLibraryCrawler";
                Nullable: false;
            };
            runBy: {
                Shape: User | null;
                Name: "User";
                Nullable: true;
            };
            updates: {
                Shape: AiLibraryUpdate[];
                Name: "AiLibraryUpdate";
                Nullable: false;
            };
        };
    };
    AiLibraryCrawlerCronJob: {
        Name: "AiLibraryCrawlerCronJob";
        Shape: AiLibraryCrawlerCronJob;
        Include: Prisma.AiLibraryCrawlerCronJobInclude;
        Select: Prisma.AiLibraryCrawlerCronJobSelect;
        OrderBy: Prisma.AiLibraryCrawlerCronJobOrderByWithRelationInput;
        WhereUnique: Prisma.AiLibraryCrawlerCronJobWhereUniqueInput;
        Where: Prisma.AiLibraryCrawlerCronJobWhereInput;
        Create: {};
        Update: {};
        RelationName: "crawler";
        ListRelations: never;
        Relations: {
            crawler: {
                Shape: AiLibraryCrawler;
                Name: "AiLibraryCrawler";
                Nullable: false;
            };
        };
    };
    AiLibraryUpdate: {
        Name: "AiLibraryUpdate";
        Shape: AiLibraryUpdate;
        Include: Prisma.AiLibraryUpdateInclude;
        Select: Prisma.AiLibraryUpdateSelect;
        OrderBy: Prisma.AiLibraryUpdateOrderByWithRelationInput;
        WhereUnique: Prisma.AiLibraryUpdateWhereUniqueInput;
        Where: Prisma.AiLibraryUpdateWhereInput;
        Create: {};
        Update: {};
        RelationName: "crawlerRun" | "file" | "library";
        ListRelations: never;
        Relations: {
            crawlerRun: {
                Shape: AiLibraryCrawlerRun | null;
                Name: "AiLibraryCrawlerRun";
                Nullable: true;
            };
            file: {
                Shape: AiLibraryFile | null;
                Name: "AiLibraryFile";
                Nullable: true;
            };
            library: {
                Shape: AiLibrary;
                Name: "AiLibrary";
                Nullable: false;
            };
        };
    };
    AiList: {
        Name: "AiList";
        Shape: AiList;
        Include: Prisma.AiListInclude;
        Select: Prisma.AiListSelect;
        OrderBy: Prisma.AiListOrderByWithRelationInput;
        WhereUnique: Prisma.AiListWhereUniqueInput;
        Where: Prisma.AiListWhereInput;
        Create: {};
        Update: {};
        RelationName: "enrichmentTasks" | "owner" | "workspace" | "fields" | "sources" | "items" | "modelUsageLogs" | "automations";
        ListRelations: "enrichmentTasks" | "fields" | "sources" | "items" | "modelUsageLogs" | "automations";
        Relations: {
            enrichmentTasks: {
                Shape: AiEnrichmentTask[];
                Name: "AiEnrichmentTask";
                Nullable: false;
            };
            owner: {
                Shape: User;
                Name: "User";
                Nullable: false;
            };
            workspace: {
                Shape: Workspace;
                Name: "Workspace";
                Nullable: false;
            };
            fields: {
                Shape: AiListField[];
                Name: "AiListField";
                Nullable: false;
            };
            sources: {
                Shape: AiListSource[];
                Name: "AiListSource";
                Nullable: false;
            };
            items: {
                Shape: AiListItem[];
                Name: "AiListItem";
                Nullable: false;
            };
            modelUsageLogs: {
                Shape: AiModelUsage[];
                Name: "AiModelUsage";
                Nullable: false;
            };
            automations: {
                Shape: AiAutomation[];
                Name: "AiAutomation";
                Nullable: false;
            };
        };
    };
    AiListSource: {
        Name: "AiListSource";
        Shape: AiListSource;
        Include: Prisma.AiListSourceInclude;
        Select: Prisma.AiListSourceSelect;
        OrderBy: Prisma.AiListSourceOrderByWithRelationInput;
        WhereUnique: Prisma.AiListSourceWhereUniqueInput;
        Where: Prisma.AiListSourceWhereInput;
        Create: {};
        Update: {};
        RelationName: "library" | "list" | "items";
        ListRelations: "items";
        Relations: {
            library: {
                Shape: AiLibrary | null;
                Name: "AiLibrary";
                Nullable: true;
            };
            list: {
                Shape: AiList;
                Name: "AiList";
                Nullable: false;
            };
            items: {
                Shape: AiListItem[];
                Name: "AiListItem";
                Nullable: false;
            };
        };
    };
    AiListItem: {
        Name: "AiListItem";
        Shape: AiListItem;
        Include: Prisma.AiListItemInclude;
        Select: Prisma.AiListItemSelect;
        OrderBy: Prisma.AiListItemOrderByWithRelationInput;
        WhereUnique: Prisma.AiListItemWhereUniqueInput;
        Where: Prisma.AiListItemWhereInput;
        Create: {};
        Update: {};
        RelationName: "list" | "source" | "sourceFile" | "cache" | "enrichmentTasks" | "automationItems";
        ListRelations: "cache" | "enrichmentTasks" | "automationItems";
        Relations: {
            list: {
                Shape: AiList;
                Name: "AiList";
                Nullable: false;
            };
            source: {
                Shape: AiListSource;
                Name: "AiListSource";
                Nullable: false;
            };
            sourceFile: {
                Shape: AiLibraryFile;
                Name: "AiLibraryFile";
                Nullable: false;
            };
            cache: {
                Shape: AiListItemCache[];
                Name: "AiListItemCache";
                Nullable: false;
            };
            enrichmentTasks: {
                Shape: AiEnrichmentTask[];
                Name: "AiEnrichmentTask";
                Nullable: false;
            };
            automationItems: {
                Shape: AiAutomationItem[];
                Name: "AiAutomationItem";
                Nullable: false;
            };
        };
    };
    AiListField: {
        Name: "AiListField";
        Shape: AiListField;
        Include: Prisma.AiListFieldInclude;
        Select: Prisma.AiListFieldSelect;
        OrderBy: Prisma.AiListFieldOrderByWithRelationInput;
        WhereUnique: Prisma.AiListFieldWhereUniqueInput;
        Where: Prisma.AiListFieldWhereInput;
        Create: {};
        Update: {};
        RelationName: "enrichmentTasks" | "languageModel" | "list" | "usedAsContext" | "context" | "cachedValues";
        ListRelations: "enrichmentTasks" | "usedAsContext" | "context" | "cachedValues";
        Relations: {
            enrichmentTasks: {
                Shape: AiEnrichmentTask[];
                Name: "AiEnrichmentTask";
                Nullable: false;
            };
            languageModel: {
                Shape: AiLanguageModel | null;
                Name: "AiLanguageModel";
                Nullable: true;
            };
            list: {
                Shape: AiList;
                Name: "AiList";
                Nullable: false;
            };
            usedAsContext: {
                Shape: AiListFieldContext[];
                Name: "AiListFieldContext";
                Nullable: false;
            };
            context: {
                Shape: AiListFieldContext[];
                Name: "AiListFieldContext";
                Nullable: false;
            };
            cachedValues: {
                Shape: AiListItemCache[];
                Name: "AiListItemCache";
                Nullable: false;
            };
        };
    };
    AiListFieldContext: {
        Name: "AiListFieldContext";
        Shape: AiListFieldContext;
        Include: Prisma.AiListFieldContextInclude;
        Select: Prisma.AiListFieldContextSelect;
        OrderBy: Prisma.AiListFieldContextOrderByWithRelationInput;
        WhereUnique: Prisma.AiListFieldContextWhereUniqueInput;
        Where: Prisma.AiListFieldContextWhereInput;
        Create: {};
        Update: {};
        RelationName: "contextField" | "field";
        ListRelations: never;
        Relations: {
            contextField: {
                Shape: AiListField | null;
                Name: "AiListField";
                Nullable: true;
            };
            field: {
                Shape: AiListField;
                Name: "AiListField";
                Nullable: false;
            };
        };
    };
    AiListItemCache: {
        Name: "AiListItemCache";
        Shape: AiListItemCache;
        Include: Prisma.AiListItemCacheInclude;
        Select: Prisma.AiListItemCacheSelect;
        OrderBy: Prisma.AiListItemCacheOrderByWithRelationInput;
        WhereUnique: Prisma.AiListItemCacheWhereUniqueInput;
        Where: Prisma.AiListItemCacheWhereInput;
        Create: {};
        Update: {};
        RelationName: "field" | "item";
        ListRelations: never;
        Relations: {
            field: {
                Shape: AiListField;
                Name: "AiListField";
                Nullable: false;
            };
            item: {
                Shape: AiListItem;
                Name: "AiListItem";
                Nullable: false;
            };
        };
    };
    AiEnrichmentTask: {
        Name: "AiEnrichmentTask";
        Shape: AiEnrichmentTask;
        Include: Prisma.AiEnrichmentTaskInclude;
        Select: Prisma.AiEnrichmentTaskSelect;
        OrderBy: Prisma.AiEnrichmentTaskOrderByWithRelationInput;
        WhereUnique: Prisma.AiEnrichmentTaskWhereUniqueInput;
        Where: Prisma.AiEnrichmentTaskWhereInput;
        Create: {};
        Update: {};
        RelationName: "field" | "item" | "list";
        ListRelations: never;
        Relations: {
            field: {
                Shape: AiListField;
                Name: "AiListField";
                Nullable: false;
            };
            item: {
                Shape: AiListItem;
                Name: "AiListItem";
                Nullable: false;
            };
            list: {
                Shape: AiList;
                Name: "AiList";
                Nullable: false;
            };
        };
    };
    AiConversation: {
        Name: "AiConversation";
        Shape: AiConversation;
        Include: Prisma.AiConversationInclude;
        Select: Prisma.AiConversationSelect;
        OrderBy: Prisma.AiConversationOrderByWithRelationInput;
        WhereUnique: Prisma.AiConversationWhereUniqueInput;
        Where: Prisma.AiConversationWhereInput;
        Create: {};
        Update: {};
        RelationName: "owner" | "workspace" | "conversationInvitations" | "messages" | "participants";
        ListRelations: "conversationInvitations" | "messages" | "participants";
        Relations: {
            owner: {
                Shape: User;
                Name: "User";
                Nullable: false;
            };
            workspace: {
                Shape: Workspace;
                Name: "Workspace";
                Nullable: false;
            };
            conversationInvitations: {
                Shape: AiConversationInvitation[];
                Name: "AiConversationInvitation";
                Nullable: false;
            };
            messages: {
                Shape: AiConversationMessage[];
                Name: "AiConversationMessage";
                Nullable: false;
            };
            participants: {
                Shape: AiConversationParticipant[];
                Name: "AiConversationParticipant";
                Nullable: false;
            };
        };
    };
    AiConversationParticipant: {
        Name: "AiConversationParticipant";
        Shape: AiConversationParticipant;
        Include: Prisma.AiConversationParticipantInclude;
        Select: Prisma.AiConversationParticipantSelect;
        OrderBy: Prisma.AiConversationParticipantOrderByWithRelationInput;
        WhereUnique: Prisma.AiConversationParticipantWhereUniqueInput;
        Where: Prisma.AiConversationParticipantWhereInput;
        Create: {};
        Update: {};
        RelationName: "conversationMessage" | "assistant" | "conversation" | "user";
        ListRelations: "conversationMessage";
        Relations: {
            conversationMessage: {
                Shape: AiConversationMessage[];
                Name: "AiConversationMessage";
                Nullable: false;
            };
            assistant: {
                Shape: AiAssistant | null;
                Name: "AiAssistant";
                Nullable: true;
            };
            conversation: {
                Shape: AiConversation;
                Name: "AiConversation";
                Nullable: false;
            };
            user: {
                Shape: User | null;
                Name: "User";
                Nullable: true;
            };
        };
    };
    AiConversationMessage: {
        Name: "AiConversationMessage";
        Shape: AiConversationMessage;
        Include: Prisma.AiConversationMessageInclude;
        Select: Prisma.AiConversationMessageSelect;
        OrderBy: Prisma.AiConversationMessageOrderByWithRelationInput;
        WhereUnique: Prisma.AiConversationMessageWhereUniqueInput;
        Where: Prisma.AiConversationMessageWhereInput;
        Create: {};
        Update: {};
        RelationName: "conversation" | "sender";
        ListRelations: never;
        Relations: {
            conversation: {
                Shape: AiConversation;
                Name: "AiConversation";
                Nullable: false;
            };
            sender: {
                Shape: AiConversationParticipant;
                Name: "AiConversationParticipant";
                Nullable: false;
            };
        };
    };
    AiConversationInvitation: {
        Name: "AiConversationInvitation";
        Shape: AiConversationInvitation;
        Include: Prisma.AiConversationInvitationInclude;
        Select: Prisma.AiConversationInvitationSelect;
        OrderBy: Prisma.AiConversationInvitationOrderByWithRelationInput;
        WhereUnique: Prisma.AiConversationInvitationWhereUniqueInput;
        Where: Prisma.AiConversationInvitationWhereInput;
        Create: {};
        Update: {};
        RelationName: "conversation" | "inviter";
        ListRelations: never;
        Relations: {
            conversation: {
                Shape: AiConversation;
                Name: "AiConversation";
                Nullable: false;
            };
            inviter: {
                Shape: User;
                Name: "User";
                Nullable: false;
            };
        };
    };
    ApiKey: {
        Name: "ApiKey";
        Shape: ApiKey;
        Include: Prisma.ApiKeyInclude;
        Select: Prisma.ApiKeySelect;
        OrderBy: Prisma.ApiKeyOrderByWithRelationInput;
        WhereUnique: Prisma.ApiKeyWhereUniqueInput;
        Where: Prisma.ApiKeyWhereInput;
        Create: {};
        Update: {};
        RelationName: "library" | "user";
        ListRelations: never;
        Relations: {
            library: {
                Shape: AiLibrary;
                Name: "AiLibrary";
                Nullable: false;
            };
            user: {
                Shape: User;
                Name: "User";
                Nullable: false;
            };
        };
    };
    AiLanguageModel: {
        Name: "AiLanguageModel";
        Shape: AiLanguageModel;
        Include: Prisma.AiLanguageModelInclude;
        Select: Prisma.AiLanguageModelSelect;
        OrderBy: Prisma.AiLanguageModelOrderByWithRelationInput;
        WhereUnique: Prisma.AiLanguageModelWhereUniqueInput;
        Where: Prisma.AiLanguageModelWhereInput;
        Create: {};
        Update: {};
        RelationName: "workspace" | "assistantsUsing" | "librariesUsingForEmbedding" | "librariesUsingForOcr" | "librariesUsingForExtraction" | "listFieldsUsing" | "contentProcessingTasks" | "usageLogs";
        ListRelations: "assistantsUsing" | "librariesUsingForEmbedding" | "librariesUsingForOcr" | "librariesUsingForExtraction" | "listFieldsUsing" | "contentProcessingTasks" | "usageLogs";
        Relations: {
            workspace: {
                Shape: Workspace;
                Name: "Workspace";
                Nullable: false;
            };
            assistantsUsing: {
                Shape: AiAssistant[];
                Name: "AiAssistant";
                Nullable: false;
            };
            librariesUsingForEmbedding: {
                Shape: AiLibrary[];
                Name: "AiLibrary";
                Nullable: false;
            };
            librariesUsingForOcr: {
                Shape: AiLibrary[];
                Name: "AiLibrary";
                Nullable: false;
            };
            librariesUsingForExtraction: {
                Shape: AiLibrary[];
                Name: "AiLibrary";
                Nullable: false;
            };
            listFieldsUsing: {
                Shape: AiListField[];
                Name: "AiListField";
                Nullable: false;
            };
            contentProcessingTasks: {
                Shape: AiContentProcessingTask[];
                Name: "AiContentProcessingTask";
                Nullable: false;
            };
            usageLogs: {
                Shape: AiModelUsage[];
                Name: "AiModelUsage";
                Nullable: false;
            };
        };
    };
    AiModelUsage: {
        Name: "AiModelUsage";
        Shape: AiModelUsage;
        Include: Prisma.AiModelUsageInclude;
        Select: Prisma.AiModelUsageSelect;
        OrderBy: Prisma.AiModelUsageOrderByWithRelationInput;
        WhereUnique: Prisma.AiModelUsageWhereUniqueInput;
        Where: Prisma.AiModelUsageWhereInput;
        Create: {};
        Update: {};
        RelationName: "assistant" | "library" | "list" | "model" | "user";
        ListRelations: never;
        Relations: {
            assistant: {
                Shape: AiAssistant | null;
                Name: "AiAssistant";
                Nullable: true;
            };
            library: {
                Shape: AiLibrary | null;
                Name: "AiLibrary";
                Nullable: true;
            };
            list: {
                Shape: AiList | null;
                Name: "AiList";
                Nullable: true;
            };
            model: {
                Shape: AiLanguageModel;
                Name: "AiLanguageModel";
                Nullable: false;
            };
            user: {
                Shape: User | null;
                Name: "User";
                Nullable: true;
            };
        };
    };
    AiConnectorTypeWorkspace: {
        Name: "AiConnectorTypeWorkspace";
        Shape: AiConnectorTypeWorkspace;
        Include: Prisma.AiConnectorTypeWorkspaceInclude;
        Select: Prisma.AiConnectorTypeWorkspaceSelect;
        OrderBy: Prisma.AiConnectorTypeWorkspaceOrderByWithRelationInput;
        WhereUnique: Prisma.AiConnectorTypeWorkspaceWhereUniqueInput;
        Where: Prisma.AiConnectorTypeWorkspaceWhereInput;
        Create: {};
        Update: {};
        RelationName: "workspace";
        ListRelations: never;
        Relations: {
            workspace: {
                Shape: Workspace;
                Name: "Workspace";
                Nullable: false;
            };
        };
    };
    AiConnector: {
        Name: "AiConnector";
        Shape: AiConnector;
        Include: Prisma.AiConnectorInclude;
        Select: Prisma.AiConnectorSelect;
        OrderBy: Prisma.AiConnectorOrderByWithRelationInput;
        WhereUnique: Prisma.AiConnectorWhereUniqueInput;
        Where: Prisma.AiConnectorWhereInput;
        Create: {};
        Update: {};
        RelationName: "workspace" | "automations";
        ListRelations: "automations";
        Relations: {
            workspace: {
                Shape: Workspace;
                Name: "Workspace";
                Nullable: false;
            };
            automations: {
                Shape: AiAutomation[];
                Name: "AiAutomation";
                Nullable: false;
            };
        };
    };
    AiAutomation: {
        Name: "AiAutomation";
        Shape: AiAutomation;
        Include: Prisma.AiAutomationInclude;
        Select: Prisma.AiAutomationSelect;
        OrderBy: Prisma.AiAutomationOrderByWithRelationInput;
        WhereUnique: Prisma.AiAutomationWhereUniqueInput;
        Where: Prisma.AiAutomationWhereInput;
        Create: {};
        Update: {};
        RelationName: "workspace" | "list" | "connector" | "items" | "batches";
        ListRelations: "items" | "batches";
        Relations: {
            workspace: {
                Shape: Workspace;
                Name: "Workspace";
                Nullable: false;
            };
            list: {
                Shape: AiList;
                Name: "AiList";
                Nullable: false;
            };
            connector: {
                Shape: AiConnector;
                Name: "AiConnector";
                Nullable: false;
            };
            items: {
                Shape: AiAutomationItem[];
                Name: "AiAutomationItem";
                Nullable: false;
            };
            batches: {
                Shape: AiAutomationBatch[];
                Name: "AiAutomationBatch";
                Nullable: false;
            };
        };
    };
    AiAutomationItem: {
        Name: "AiAutomationItem";
        Shape: AiAutomationItem;
        Include: Prisma.AiAutomationItemInclude;
        Select: Prisma.AiAutomationItemSelect;
        OrderBy: Prisma.AiAutomationItemOrderByWithRelationInput;
        WhereUnique: Prisma.AiAutomationItemWhereUniqueInput;
        Where: Prisma.AiAutomationItemWhereInput;
        Create: {};
        Update: {};
        RelationName: "automation" | "listItem" | "executions";
        ListRelations: "executions";
        Relations: {
            automation: {
                Shape: AiAutomation;
                Name: "AiAutomation";
                Nullable: false;
            };
            listItem: {
                Shape: AiListItem;
                Name: "AiListItem";
                Nullable: false;
            };
            executions: {
                Shape: AiAutomationItemExecution[];
                Name: "AiAutomationItemExecution";
                Nullable: false;
            };
        };
    };
    AiAutomationItemExecution: {
        Name: "AiAutomationItemExecution";
        Shape: AiAutomationItemExecution;
        Include: Prisma.AiAutomationItemExecutionInclude;
        Select: Prisma.AiAutomationItemExecutionSelect;
        OrderBy: Prisma.AiAutomationItemExecutionOrderByWithRelationInput;
        WhereUnique: Prisma.AiAutomationItemExecutionWhereUniqueInput;
        Where: Prisma.AiAutomationItemExecutionWhereInput;
        Create: {};
        Update: {};
        RelationName: "automationItem" | "batch";
        ListRelations: never;
        Relations: {
            automationItem: {
                Shape: AiAutomationItem;
                Name: "AiAutomationItem";
                Nullable: false;
            };
            batch: {
                Shape: AiAutomationBatch | null;
                Name: "AiAutomationBatch";
                Nullable: true;
            };
        };
    };
    AiAutomationBatch: {
        Name: "AiAutomationBatch";
        Shape: AiAutomationBatch;
        Include: Prisma.AiAutomationBatchInclude;
        Select: Prisma.AiAutomationBatchSelect;
        OrderBy: Prisma.AiAutomationBatchOrderByWithRelationInput;
        WhereUnique: Prisma.AiAutomationBatchWhereUniqueInput;
        Where: Prisma.AiAutomationBatchWhereInput;
        Create: {};
        Update: {};
        RelationName: "automation" | "executions";
        ListRelations: "executions";
        Relations: {
            automation: {
                Shape: AiAutomation;
                Name: "AiAutomation";
                Nullable: false;
            };
            executions: {
                Shape: AiAutomationItemExecution[];
                Name: "AiAutomationItemExecution";
                Nullable: false;
            };
        };
    };
}