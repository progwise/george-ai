// Export all admin event modules
export * as workspaceLifecycle from './workspace-lifecycle'

// Re-export admin setup utilities
export * from './admin-setup'

// Convenience re-exports for commonly used types
export {
  type WorkspaceCreatedEvent,
  type WorkspaceDeletedEvent,
  type WorkspaceStartupEvent,
  type WorkspaceTeardownEvent,
  type AdminEvent,
  publishWorkspaceCreated,
  publishWorkspaceDeleted,
  publishWorkspaceStartup,
  publishWorkspaceTeardown,
  subscribeWorkspaceLifecycle,
  deleteWorkspaceStream,
} from './workspace-lifecycle'
