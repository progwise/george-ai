/* eslint-disable */
import type { Prisma, User, UserProfile, Workspace, WorkspaceMember, WorkspaceInvitation, AiServiceProvider, AiAssistant, AiAssistantBaseCase, AiAssistantEUActAnswers, AiLibrary, AiLibraryUsage, AiLibraryFile, AiContentProcessingTask, AiContentExtractionSubTask, AiLibraryCrawler, AiLibraryCrawlerRun, AiLibraryCrawlerCronJob, AiLibraryUpdate, AiList, AiListSource, AiListItem, AiListField, AiListFieldContext, AiListItemCache, AiEnrichmentTask, AiConversation, AiConversationParticipant, AiConversationMessage, AiConversationInvitation, ApiKey, AiLanguageModel, AiModelUsage, AiConnectorTypeWorkspace, AiConnector, AiAutomation, AiAutomationItem, AiAutomationItemExecution, AiAutomationBatch } from "./client.js";
import type { PothosPrismaDatamodel } from "@pothos/plugin-prisma";
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
export function getDatamodel(): PothosPrismaDatamodel { return JSON.parse("{\"datamodel\":{\"models\":{\"User\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"lastLogin\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"email\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"username\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"given_name\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"family_name\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isAdmin\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"avatarUrl\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"defaultWorkspaceId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AiAssistant\",\"kind\":\"object\",\"name\":\"assistants\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiAssistantToUser\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiConversation\",\"kind\":\"object\",\"name\":\"conversations\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiConversationToUser\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiConversationInvitation\",\"kind\":\"object\",\"name\":\"conversationInvitation\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiConversationInvitationToUser\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiConversationParticipant\",\"kind\":\"object\",\"name\":\"conversationParticipations\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiConversationParticipantToUser\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiLibrary\",\"kind\":\"object\",\"name\":\"libraries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryToUser\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiLibraryCrawlerRun\",\"kind\":\"object\",\"name\":\"crawlerRuns\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryCrawlerRunToUser\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiList\",\"kind\":\"object\",\"name\":\"lists\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiListToUser\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiModelUsage\",\"kind\":\"object\",\"name\":\"modelUsageLogs\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiModelUsageToUser\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ApiKey\",\"kind\":\"object\",\"name\":\"apiKeys\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ApiKeyToUser\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"UserProfile\",\"kind\":\"object\",\"name\":\"profile\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"UserToUserProfile\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Workspace\",\"kind\":\"object\",\"name\":\"defaultWorkspace\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DefaultWorkspace\",\"relationFromFields\":[\"defaultWorkspaceId\"],\"isUpdatedAt\":false},{\"type\":\"WorkspaceMember\",\"kind\":\"object\",\"name\":\"workspaceMemberships\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"UserToWorkspaceMember\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"WorkspaceInvitation\",\"kind\":\"object\",\"name\":\"workspaceInvitations\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"UserToWorkspaceInvitation\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"UserProfile\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"expiresAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"email\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"firstName\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"lastName\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"freeMessages\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"freeStorage\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"business\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"position\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"confirmationDate\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"activationDate\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"user\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"UserToUserProfile\",\"relationFromFields\":[\"userId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Workspace\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"slug\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AiServiceProvider\",\"kind\":\"object\",\"name\":\"aiProviders\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiServiceProviderToWorkspace\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiLanguageModel\",\"kind\":\"object\",\"name\":\"languageModels\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLanguageModelToWorkspace\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiLibrary\",\"kind\":\"object\",\"name\":\"libraries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryToWorkspace\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiAssistant\",\"kind\":\"object\",\"name\":\"assistants\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiAssistantToWorkspace\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiList\",\"kind\":\"object\",\"name\":\"lists\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiListToWorkspace\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiConversation\",\"kind\":\"object\",\"name\":\"conversations\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiConversationToWorkspace\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"WorkspaceMember\",\"kind\":\"object\",\"name\":\"members\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"WorkspaceToWorkspaceMember\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"WorkspaceInvitation\",\"kind\":\"object\",\"name\":\"invitations\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"WorkspaceToWorkspaceInvitation\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"defaultForUsers\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DefaultWorkspace\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiConnectorTypeWorkspace\",\"kind\":\"object\",\"name\":\"connectorTypes\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiConnectorTypeWorkspaceToWorkspace\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiConnector\",\"kind\":\"object\",\"name\":\"connectors\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiConnectorToWorkspace\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiAutomation\",\"kind\":\"object\",\"name\":\"automations\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiAutomationToWorkspace\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"WorkspaceMember\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"workspaceId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"role\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Workspace\",\"kind\":\"object\",\"name\":\"workspace\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"WorkspaceToWorkspaceMember\",\"relationFromFields\":[\"workspaceId\"],\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"user\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"UserToWorkspaceMember\",\"relationFromFields\":[\"userId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"workspaceId\",\"userId\"]}]},\"WorkspaceInvitation\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"workspaceId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"email\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"inviterId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"expiresAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"acceptedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Workspace\",\"kind\":\"object\",\"name\":\"workspace\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"WorkspaceToWorkspaceInvitation\",\"relationFromFields\":[\"workspaceId\"],\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"inviter\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"UserToWorkspaceInvitation\",\"relationFromFields\":[\"inviterId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"workspaceId\",\"email\"]}]},\"AiServiceProvider\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"workspaceId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"provider\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"enabled\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"baseUrl\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"apiKey\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"vramGb\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"createdBy\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"updatedBy\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Workspace\",\"kind\":\"object\",\"name\":\"workspace\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiServiceProviderToWorkspace\",\"relationFromFields\":[\"workspaceId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"workspaceId\",\"provider\",\"name\"]}]},\"AiAssistant\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"description\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"url\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"ownerId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"workspaceId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"iconUrl\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"languageModelId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AiLanguageModel\",\"kind\":\"object\",\"name\":\"languageModel\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"LanguageModel\",\"relationFromFields\":[\"languageModelId\"],\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"owner\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiAssistantToUser\",\"relationFromFields\":[\"ownerId\"],\"isUpdatedAt\":false},{\"type\":\"Workspace\",\"kind\":\"object\",\"name\":\"workspace\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiAssistantToWorkspace\",\"relationFromFields\":[\"workspaceId\"],\"isUpdatedAt\":false},{\"type\":\"AiAssistantBaseCase\",\"kind\":\"object\",\"name\":\"baseCases\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiAssistantToAiAssistantBaseCase\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiAssistantEUActAnswers\",\"kind\":\"object\",\"name\":\"euActAnswers\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiAssistantToAiAssistantEUActAnswers\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiConversationParticipant\",\"kind\":\"object\",\"name\":\"conversationParticipations\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiAssistantToAiConversationParticipant\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiLibraryUsage\",\"kind\":\"object\",\"name\":\"usages\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiAssistantToAiLibraryUsage\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiModelUsage\",\"kind\":\"object\",\"name\":\"modelUsageLogs\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiAssistantToAiModelUsage\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"AiAssistantBaseCase\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"sequence\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"assistantId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"condition\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"instruction\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AiAssistant\",\"kind\":\"object\",\"name\":\"assistant\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiAssistantToAiAssistantBaseCase\",\"relationFromFields\":[\"assistantId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"AiAssistantEUActAnswers\":{\"fields\":[{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"assistantId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"questionId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"answer\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"notes\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AiAssistant\",\"kind\":\"object\",\"name\":\"assistant\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiAssistantToAiAssistantEUActAnswers\",\"relationFromFields\":[\"assistantId\"],\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"assistantId\",\"questionId\"]},\"uniqueIndexes\":[]},\"AiLibrary\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"description\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"url\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"apiToken\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"lastProcessed\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"ownerId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"workspaceId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isPublic\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"fileConverterOptions\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"embeddingTimeoutMs\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"autoProcessCrawledFiles\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"embeddingModelId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"ocrModelId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"extractionModelId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AiContentProcessingTask\",\"kind\":\"object\",\"name\":\"contentExtractionTasks\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiContentProcessingTaskToAiLibrary\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiLanguageModel\",\"kind\":\"object\",\"name\":\"embeddingModel\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"EmbeddingModel\",\"relationFromFields\":[\"embeddingModelId\"],\"isUpdatedAt\":false},{\"type\":\"AiLanguageModel\",\"kind\":\"object\",\"name\":\"ocrModel\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OcrModel\",\"relationFromFields\":[\"ocrModelId\"],\"isUpdatedAt\":false},{\"type\":\"AiLanguageModel\",\"kind\":\"object\",\"name\":\"extractionModel\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ExtractionModel\",\"relationFromFields\":[\"extractionModelId\"],\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"owner\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryToUser\",\"relationFromFields\":[\"ownerId\"],\"isUpdatedAt\":false},{\"type\":\"Workspace\",\"kind\":\"object\",\"name\":\"workspace\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryToWorkspace\",\"relationFromFields\":[\"workspaceId\"],\"isUpdatedAt\":false},{\"type\":\"AiLibraryCrawler\",\"kind\":\"object\",\"name\":\"crawlers\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryToAiLibraryCrawler\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiLibraryFile\",\"kind\":\"object\",\"name\":\"files\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryToAiLibraryFile\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiLibraryUpdate\",\"kind\":\"object\",\"name\":\"updates\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryToAiLibraryUpdate\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiLibraryUsage\",\"kind\":\"object\",\"name\":\"usages\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryToAiLibraryUsage\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiListSource\",\"kind\":\"object\",\"name\":\"listSources\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryToAiListSource\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiModelUsage\",\"kind\":\"object\",\"name\":\"modelUsageLogs\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryToAiModelUsage\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ApiKey\",\"kind\":\"object\",\"name\":\"apiKeys\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryToApiKey\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"AiLibraryUsage\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"assistantId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"libraryId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"usedFor\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AiAssistant\",\"kind\":\"object\",\"name\":\"assistant\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiAssistantToAiLibraryUsage\",\"relationFromFields\":[\"assistantId\"],\"isUpdatedAt\":false},{\"type\":\"AiLibrary\",\"kind\":\"object\",\"name\":\"library\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryToAiLibraryUsage\",\"relationFromFields\":[\"libraryId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"assistantId\",\"libraryId\"]}]},\"AiLibraryFile\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"libraryId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"originUri\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"mimeType\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"size\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"uploadedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"dropError\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"crawledByCrawlerId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"docPath\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"originFileHash\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"originModificationDate\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"archivedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AiContentProcessingTask\",\"kind\":\"object\",\"name\":\"contentExtractionTasks\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiContentProcessingTaskToAiLibraryFile\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiLibraryCrawler\",\"kind\":\"object\",\"name\":\"crawledByCrawler\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryCrawlerToAiLibraryFile\",\"relationFromFields\":[\"crawledByCrawlerId\"],\"isUpdatedAt\":false},{\"type\":\"AiLibrary\",\"kind\":\"object\",\"name\":\"library\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryToAiLibraryFile\",\"relationFromFields\":[\"libraryId\"],\"isUpdatedAt\":false},{\"type\":\"AiLibraryUpdate\",\"kind\":\"object\",\"name\":\"updates\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryFileToAiLibraryUpdate\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiListItem\",\"kind\":\"object\",\"name\":\"listItems\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryFileToAiListItem\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"crawledByCrawlerId\",\"originUri\"]}]},\"AiContentProcessingTask\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"fileId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"libraryId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"timeoutMs\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"embeddingModelId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"extractionOptions\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"processingStartedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"processingFinishedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"processingFailedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"processingTimeout\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"extractionStartedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"extractionFinishedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"extractionFailedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"extractionTimeout\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"embeddingStartedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"embeddingFinishedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"embeddingFailedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"embeddingTimeout\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"chunksCount\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"chunksSize\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"metadata\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"processingCancelled\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AiLanguageModel\",\"kind\":\"object\",\"name\":\"embeddingModel\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ContentProcessingEmbeddingModel\",\"relationFromFields\":[\"embeddingModelId\"],\"isUpdatedAt\":false},{\"type\":\"AiContentExtractionSubTask\",\"kind\":\"object\",\"name\":\"extractionSubTasks\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiContentExtractionSubTaskToAiContentProcessingTask\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiLibraryFile\",\"kind\":\"object\",\"name\":\"file\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiContentProcessingTaskToAiLibraryFile\",\"relationFromFields\":[\"fileId\"],\"isUpdatedAt\":false},{\"type\":\"AiLibrary\",\"kind\":\"object\",\"name\":\"library\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiContentProcessingTaskToAiLibrary\",\"relationFromFields\":[\"libraryId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"AiContentExtractionSubTask\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"startedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"finishedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"failedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"contentProcessingTaskId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"extractionMethod\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"markdownFileName\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AiContentProcessingTask\",\"kind\":\"object\",\"name\":\"contentProcessingTask\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiContentExtractionSubTaskToAiContentProcessingTask\",\"relationFromFields\":[\"contentProcessingTaskId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"AiLibraryCrawler\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"uri\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"libraryId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"lastRun\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"maxDepth\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"maxPages\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"uriType\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"allowedMimeTypes\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"excludePatterns\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"includePatterns\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"maxFileSize\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"minFileSize\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Json\",\"kind\":\"scalar\",\"name\":\"crawlerConfig\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AiLibrary\",\"kind\":\"object\",\"name\":\"library\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryToAiLibraryCrawler\",\"relationFromFields\":[\"libraryId\"],\"isUpdatedAt\":false},{\"type\":\"AiLibraryCrawlerCronJob\",\"kind\":\"object\",\"name\":\"cronJob\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryCrawlerToAiLibraryCrawlerCronJob\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiLibraryCrawlerRun\",\"kind\":\"object\",\"name\":\"runs\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryCrawlerToAiLibraryCrawlerRun\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiLibraryFile\",\"kind\":\"object\",\"name\":\"files\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryCrawlerToAiLibraryFile\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"AiLibraryCrawlerRun\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"crawlerId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"startedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"endedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"success\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"runByUserId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"runByCronJob\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"errorMessage\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"stoppedByUser\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AiLibraryCrawler\",\"kind\":\"object\",\"name\":\"crawler\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryCrawlerToAiLibraryCrawlerRun\",\"relationFromFields\":[\"crawlerId\"],\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"runBy\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryCrawlerRunToUser\",\"relationFromFields\":[\"runByUserId\"],\"isUpdatedAt\":false},{\"type\":\"AiLibraryUpdate\",\"kind\":\"object\",\"name\":\"updates\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryCrawlerRunToAiLibraryUpdate\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"AiLibraryCrawlerCronJob\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"active\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"hour\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"minute\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"monday\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"tuesday\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"wednesday\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"thursday\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"friday\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"saturday\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"sunday\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"crawlerId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"AiLibraryCrawler\",\"kind\":\"object\",\"name\":\"crawler\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryCrawlerToAiLibraryCrawlerCronJob\",\"relationFromFields\":[\"crawlerId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"AiLibraryUpdate\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"libraryId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"fileId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"crawlerRunId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"message\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"fileName\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"filePath\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"fileSize\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"filterType\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"filterValue\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"updateType\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AiLibraryCrawlerRun\",\"kind\":\"object\",\"name\":\"crawlerRun\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryCrawlerRunToAiLibraryUpdate\",\"relationFromFields\":[\"crawlerRunId\"],\"isUpdatedAt\":false},{\"type\":\"AiLibraryFile\",\"kind\":\"object\",\"name\":\"file\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryFileToAiLibraryUpdate\",\"relationFromFields\":[\"fileId\"],\"isUpdatedAt\":false},{\"type\":\"AiLibrary\",\"kind\":\"object\",\"name\":\"library\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryToAiLibraryUpdate\",\"relationFromFields\":[\"libraryId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"AiList\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"ownerId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"workspaceId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"AiEnrichmentTask\",\"kind\":\"object\",\"name\":\"enrichmentTasks\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiEnrichmentTaskToAiList\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"owner\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiListToUser\",\"relationFromFields\":[\"ownerId\"],\"isUpdatedAt\":false},{\"type\":\"Workspace\",\"kind\":\"object\",\"name\":\"workspace\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiListToWorkspace\",\"relationFromFields\":[\"workspaceId\"],\"isUpdatedAt\":false},{\"type\":\"AiListField\",\"kind\":\"object\",\"name\":\"fields\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiListToAiListField\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiListSource\",\"kind\":\"object\",\"name\":\"sources\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiListToAiListSource\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiListItem\",\"kind\":\"object\",\"name\":\"items\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiListToAiListItem\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiModelUsage\",\"kind\":\"object\",\"name\":\"modelUsageLogs\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiListToAiModelUsage\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiAutomation\",\"kind\":\"object\",\"name\":\"automations\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiAutomationToAiList\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"AiListSource\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"listId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"libraryId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AiLibrary\",\"kind\":\"object\",\"name\":\"library\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryToAiListSource\",\"relationFromFields\":[\"libraryId\"],\"isUpdatedAt\":false},{\"type\":\"AiList\",\"kind\":\"object\",\"name\":\"list\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiListToAiListSource\",\"relationFromFields\":[\"listId\"],\"isUpdatedAt\":false},{\"type\":\"AiListItem\",\"kind\":\"object\",\"name\":\"items\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiListItemToAiListSource\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"AiListItem\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"listId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"sourceId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"sourceFileId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"extractionIndex\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"itemName\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Json\",\"kind\":\"scalar\",\"name\":\"metadata\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AiList\",\"kind\":\"object\",\"name\":\"list\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiListToAiListItem\",\"relationFromFields\":[\"listId\"],\"isUpdatedAt\":false},{\"type\":\"AiListSource\",\"kind\":\"object\",\"name\":\"source\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiListItemToAiListSource\",\"relationFromFields\":[\"sourceId\"],\"isUpdatedAt\":false},{\"type\":\"AiLibraryFile\",\"kind\":\"object\",\"name\":\"sourceFile\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryFileToAiListItem\",\"relationFromFields\":[\"sourceFileId\"],\"isUpdatedAt\":false},{\"type\":\"AiListItemCache\",\"kind\":\"object\",\"name\":\"cache\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiListItemToAiListItemCache\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiEnrichmentTask\",\"kind\":\"object\",\"name\":\"enrichmentTasks\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiEnrichmentTaskToAiListItem\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiAutomationItem\",\"kind\":\"object\",\"name\":\"automationItems\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiAutomationItemToAiListItem\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"sourceId\",\"sourceFileId\",\"extractionIndex\"]}]},\"AiListField\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"listId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"type\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"order\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"sourceType\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"fileProperty\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"prompt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"failureTerms\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"languageModelId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AiEnrichmentTask\",\"kind\":\"object\",\"name\":\"enrichmentTasks\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiEnrichmentTaskToAiListField\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiLanguageModel\",\"kind\":\"object\",\"name\":\"languageModel\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ListFieldLanguageModel\",\"relationFromFields\":[\"languageModelId\"],\"isUpdatedAt\":false},{\"type\":\"AiList\",\"kind\":\"object\",\"name\":\"list\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiListToAiListField\",\"relationFromFields\":[\"listId\"],\"isUpdatedAt\":false},{\"type\":\"AiListFieldContext\",\"kind\":\"object\",\"name\":\"usedAsContext\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"contextFieldId\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiListFieldContext\",\"kind\":\"object\",\"name\":\"context\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"fieldId\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiListItemCache\",\"kind\":\"object\",\"name\":\"cachedValues\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiListFieldToAiListItemCache\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"AiListFieldContext\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"fieldId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AiListFieldContextType\",\"kind\":\"enum\",\"name\":\"contextType\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"contextFieldId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Json\",\"kind\":\"scalar\",\"name\":\"contextQuery\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"maxContentTokens\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AiListField\",\"kind\":\"object\",\"name\":\"contextField\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"contextFieldId\",\"relationFromFields\":[\"contextFieldId\"],\"isUpdatedAt\":false},{\"type\":\"AiListField\",\"kind\":\"object\",\"name\":\"field\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"fieldId\",\"relationFromFields\":[\"fieldId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"fieldId\",\"contextFieldId\"]}]},\"AiListItemCache\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"itemId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"fieldId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"valueString\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Float\",\"kind\":\"scalar\",\"name\":\"valueNumber\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"valueDate\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"valueBoolean\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"enrichmentErrorMessage\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"failedEnrichmentValue\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AiListField\",\"kind\":\"object\",\"name\":\"field\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiListFieldToAiListItemCache\",\"relationFromFields\":[\"fieldId\"],\"isUpdatedAt\":false},{\"type\":\"AiListItem\",\"kind\":\"object\",\"name\":\"item\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiListItemToAiListItemCache\",\"relationFromFields\":[\"itemId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"itemId\",\"fieldId\"]}]},\"AiEnrichmentTask\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"listId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"fieldId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"itemId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"priority\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"requestedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"startedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"completedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"error\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"metadata\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AiListField\",\"kind\":\"object\",\"name\":\"field\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiEnrichmentTaskToAiListField\",\"relationFromFields\":[\"fieldId\"],\"isUpdatedAt\":false},{\"type\":\"AiListItem\",\"kind\":\"object\",\"name\":\"item\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiEnrichmentTaskToAiListItem\",\"relationFromFields\":[\"itemId\"],\"isUpdatedAt\":false},{\"type\":\"AiList\",\"kind\":\"object\",\"name\":\"list\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiEnrichmentTaskToAiList\",\"relationFromFields\":[\"listId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"listId\",\"fieldId\",\"itemId\"]}]},\"AiConversation\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"ownerId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"workspaceId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"owner\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiConversationToUser\",\"relationFromFields\":[\"ownerId\"],\"isUpdatedAt\":false},{\"type\":\"Workspace\",\"kind\":\"object\",\"name\":\"workspace\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiConversationToWorkspace\",\"relationFromFields\":[\"workspaceId\"],\"isUpdatedAt\":false},{\"type\":\"AiConversationInvitation\",\"kind\":\"object\",\"name\":\"conversationInvitations\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiConversationToAiConversationInvitation\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiConversationMessage\",\"kind\":\"object\",\"name\":\"messages\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiConversationToAiConversationMessage\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiConversationParticipant\",\"kind\":\"object\",\"name\":\"participants\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiConversationToAiConversationParticipant\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"AiConversationParticipant\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"conversationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"assistantId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AiConversationMessage\",\"kind\":\"object\",\"name\":\"conversationMessage\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiConversationMessageToAiConversationParticipant\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiAssistant\",\"kind\":\"object\",\"name\":\"assistant\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiAssistantToAiConversationParticipant\",\"relationFromFields\":[\"assistantId\"],\"isUpdatedAt\":false},{\"type\":\"AiConversation\",\"kind\":\"object\",\"name\":\"conversation\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiConversationToAiConversationParticipant\",\"relationFromFields\":[\"conversationId\"],\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"user\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiConversationParticipantToUser\",\"relationFromFields\":[\"userId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"AiConversationMessage\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"sequenceNumber\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"senderId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"content\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"source\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"conversationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"hidden\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AiConversation\",\"kind\":\"object\",\"name\":\"conversation\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiConversationToAiConversationMessage\",\"relationFromFields\":[\"conversationId\"],\"isUpdatedAt\":false},{\"type\":\"AiConversationParticipant\",\"kind\":\"object\",\"name\":\"sender\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiConversationMessageToAiConversationParticipant\",\"relationFromFields\":[\"senderId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"AiConversationInvitation\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"email\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"inviterId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"confirmedByEmail\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"confirmationDate\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"conversationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"date\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"allowDifferentEmailAddress\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"allowMultipleParticipants\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isUsed\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"AiConversation\",\"kind\":\"object\",\"name\":\"conversation\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiConversationToAiConversationInvitation\",\"relationFromFields\":[\"conversationId\"],\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"inviter\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiConversationInvitationToUser\",\"relationFromFields\":[\"inviterId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"ApiKey\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"keyHash\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"libraryId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"lastUsedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AiLibrary\",\"kind\":\"object\",\"name\":\"library\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryToApiKey\",\"relationFromFields\":[\"libraryId\"],\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"user\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ApiKeyToUser\",\"relationFromFields\":[\"userId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"AiLanguageModel\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"workspaceId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"provider\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"canDoEmbedding\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"canDoChatCompletion\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"canDoVision\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"canDoFunctionCalling\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"enabled\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"adminNotes\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"lastUsedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Workspace\",\"kind\":\"object\",\"name\":\"workspace\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLanguageModelToWorkspace\",\"relationFromFields\":[\"workspaceId\"],\"isUpdatedAt\":false},{\"type\":\"AiAssistant\",\"kind\":\"object\",\"name\":\"assistantsUsing\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"LanguageModel\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiLibrary\",\"kind\":\"object\",\"name\":\"librariesUsingForEmbedding\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"EmbeddingModel\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiLibrary\",\"kind\":\"object\",\"name\":\"librariesUsingForOcr\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OcrModel\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiLibrary\",\"kind\":\"object\",\"name\":\"librariesUsingForExtraction\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ExtractionModel\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiListField\",\"kind\":\"object\",\"name\":\"listFieldsUsing\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ListFieldLanguageModel\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiContentProcessingTask\",\"kind\":\"object\",\"name\":\"contentProcessingTasks\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ContentProcessingEmbeddingModel\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiModelUsage\",\"kind\":\"object\",\"name\":\"usageLogs\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLanguageModelToAiModelUsage\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"workspaceId\",\"provider\",\"name\"]}]},\"AiModelUsage\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"modelId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"libraryId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"assistantId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"listId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"usageType\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"tokensInput\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"tokensOutput\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"requestCount\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"durationMs\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AiAssistant\",\"kind\":\"object\",\"name\":\"assistant\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiAssistantToAiModelUsage\",\"relationFromFields\":[\"assistantId\"],\"isUpdatedAt\":false},{\"type\":\"AiLibrary\",\"kind\":\"object\",\"name\":\"library\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLibraryToAiModelUsage\",\"relationFromFields\":[\"libraryId\"],\"isUpdatedAt\":false},{\"type\":\"AiList\",\"kind\":\"object\",\"name\":\"list\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiListToAiModelUsage\",\"relationFromFields\":[\"listId\"],\"isUpdatedAt\":false},{\"type\":\"AiLanguageModel\",\"kind\":\"object\",\"name\":\"model\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiLanguageModelToAiModelUsage\",\"relationFromFields\":[\"modelId\"],\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"user\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiModelUsageToUser\",\"relationFromFields\":[\"userId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"AiConnectorTypeWorkspace\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"workspaceId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"connectorType\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Workspace\",\"kind\":\"object\",\"name\":\"workspace\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiConnectorTypeWorkspaceToWorkspace\",\"relationFromFields\":[\"workspaceId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"workspaceId\",\"connectorType\"]}]},\"AiConnector\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"workspaceId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"connectorType\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"baseUrl\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Json\",\"kind\":\"scalar\",\"name\":\"config\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isConnected\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"lastTestedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"lastError\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Workspace\",\"kind\":\"object\",\"name\":\"workspace\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiConnectorToWorkspace\",\"relationFromFields\":[\"workspaceId\"],\"isUpdatedAt\":false},{\"type\":\"AiAutomation\",\"kind\":\"object\",\"name\":\"automations\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiAutomationToAiConnector\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"AiAutomation\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"workspaceId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"listId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"connectorId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"connectorAction\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Json\",\"kind\":\"scalar\",\"name\":\"connectorActionConfig\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Json\",\"kind\":\"scalar\",\"name\":\"filter\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"schedule\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"executeOnEnrichment\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Workspace\",\"kind\":\"object\",\"name\":\"workspace\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiAutomationToWorkspace\",\"relationFromFields\":[\"workspaceId\"],\"isUpdatedAt\":false},{\"type\":\"AiList\",\"kind\":\"object\",\"name\":\"list\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiAutomationToAiList\",\"relationFromFields\":[\"listId\"],\"isUpdatedAt\":false},{\"type\":\"AiConnector\",\"kind\":\"object\",\"name\":\"connector\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiAutomationToAiConnector\",\"relationFromFields\":[\"connectorId\"],\"isUpdatedAt\":false},{\"type\":\"AiAutomationItem\",\"kind\":\"object\",\"name\":\"items\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiAutomationToAiAutomationItem\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AiAutomationBatch\",\"kind\":\"object\",\"name\":\"batches\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiAutomationToAiAutomationBatch\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"AiAutomationItem\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"automationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"listItemId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"inScope\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AutomationItemStatus\",\"kind\":\"enum\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AiAutomation\",\"kind\":\"object\",\"name\":\"automation\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiAutomationToAiAutomationItem\",\"relationFromFields\":[\"automationId\"],\"isUpdatedAt\":false},{\"type\":\"AiListItem\",\"kind\":\"object\",\"name\":\"listItem\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiAutomationItemToAiListItem\",\"relationFromFields\":[\"listItemId\"],\"isUpdatedAt\":false},{\"type\":\"AiAutomationItemExecution\",\"kind\":\"object\",\"name\":\"executions\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiAutomationItemToAiAutomationItemExecution\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"automationId\",\"listItemId\"]}]},\"AiAutomationItemExecution\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"automationItemId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"batchId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AutomationItemStatus\",\"kind\":\"enum\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Json\",\"kind\":\"scalar\",\"name\":\"input\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Json\",\"kind\":\"scalar\",\"name\":\"output\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"startedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"finishedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AiAutomationItem\",\"kind\":\"object\",\"name\":\"automationItem\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiAutomationItemToAiAutomationItemExecution\",\"relationFromFields\":[\"automationItemId\"],\"isUpdatedAt\":false},{\"type\":\"AiAutomationBatch\",\"kind\":\"object\",\"name\":\"batch\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiAutomationBatchToAiAutomationItemExecution\",\"relationFromFields\":[\"batchId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"AiAutomationBatch\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"automationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BatchStatus\",\"kind\":\"enum\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"TriggerType\",\"kind\":\"enum\",\"name\":\"triggeredBy\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"itemsTotal\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"itemsProcessed\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"itemsSuccess\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"itemsWarning\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"itemsFailed\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"itemsSkipped\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"startedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"finishedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AiAutomation\",\"kind\":\"object\",\"name\":\"automation\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiAutomationToAiAutomationBatch\",\"relationFromFields\":[\"automationId\"],\"isUpdatedAt\":false},{\"type\":\"AiAutomationItemExecution\",\"kind\":\"object\",\"name\":\"executions\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AiAutomationBatchToAiAutomationItemExecution\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]}}}}"); }