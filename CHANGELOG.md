# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [unreleased]

## [2024-12-22]

### Added

- **CSV/Spreadsheet File Splitting** - Automatically splits large CSV/Excel files into individual rows. Search finds exactly what you need, even in files with 700K+ rows.
- **Dynamic Enrichment Contexts** - Use {{FieldName}} in prompts to reference other fields, fetch from web APIs, or search your libraries. Build complex data enrichment workflows without code.
- **Automations** - Complete the cycle: Load data → Enrich with AI → Write back to external systems. Configure once, run automatically or on schedule.
- **Shopware 6 Connector** - Turn PDF catalogs into live Shopware products. Automatic product creation and updates with field mapping UI.
- **Enrichment Details** - Click any list cell to see how it was extracted, view token usage, inspect errors, and retry failed extractions.
- **Google Drive Upload** - Modern file picker with search, batch selection, and automatic Google Docs to PDF conversion.
- **Large File Support** - Upload and process 100MB+ files without memory issues. Automatic chunking with smart pagination.
- **SMB Network Shares** - Direct SMB2 protocol support for Windows file shares. No mounting required, works in Docker.

## [2025-11-21]

### Added

- **Workspace Multi-Tenancy** - Complete workspace isolation for teams and organizations
  - Multiple workspaces per user with role-based access control (Owner, Admin, Member)
  - Workspace switcher in top navigation for seamless context switching
  - All resources (libraries, assistants, lists) automatically scoped to current workspace
  - Data isolation ensures no cross-workspace access
- **Workspace-Scoped AI Providers** - AI provider configuration isolated per workspace
  - Each workspace can configure its own Ollama and OpenAI providers
  - Provider cache with 60-second TTL for optimal performance
  - Automatic cache invalidation on provider changes
  - Admin UI at `/admin/ai-services` for provider management per workspace
- **Workspace-Filtered Model Selection** - Model dropdowns automatically filtered by workspace
  - Users only see models from providers configured in their current workspace
  - Real-time updates when switching between workspaces
  - Applies to all model selections (embedding, language, OCR models)
  - Zero configuration required - filtering happens automatically
- **Secure API Key Management** - Provider credentials never exposed to frontend
  - API key masking with hints (e.g., `sk-...xy`)
  - Connection testing without re-entering credentials
  - Conditional updates preserve existing keys
- **Provider Connection Testing** - Test Ollama and OpenAI connections before saving
  - Real-time validation of base URLs and API keys
  - Clear error messages for troubleshooting
  - Uses stored credentials for testing existing providers
- **Default Workspace Migration** - Smooth upgrade path for existing installations
  - All existing data migrated to "Shared" workspace
  - First admin user becomes workspace owner
  - Zero downtime migration with rollback safety
- **Comprehensive E2E Testing** - Workspace functionality fully tested
  - Workspace switcher tests verify context switching and data isolation
  - Model filtering tests verify workspace-scoped model availability
  - Automated test setup with provider/model discovery
- **API Crawler Package** - New `@george-ai/api-crawler` for REST/GraphQL API integration
  - Multiple authentication methods: `none`, `apiKey`, `oauth2`, `basic`, `bearer`
  - Multiple pagination strategies: `offset`, `page`, `cursor`, `none`
  - Streaming architecture for memory-efficient crawling
  - Auto-extraction of titles from common field names (no configuration needed)
  - Pre-configured templates for Shopware 6 and Weclapp ERP
  - Configurable logging system with LOG_LEVEL support
  - Async transformation functions for filename and markdown generation
  - Complete UI integration with JSON configuration editor
- **formatJson Helper** - New utility in `@george-ai/web-utils` for pretty-printing JSON

### Changed

### Fixed

## [2025-11-16]

### Added

- **Multi-Provider AI Support** - George AI now supports multiple AI providers simultaneously (Ollama, OpenAI, with Anthropic and Azure coming soon)
- **Database-Driven Model Management** - All AI models stored in database with auto-detected capabilities (embedding, chat, vision, function calling)
- **Admin UI for AI Models** - Full CRUD interface at `/admin/ai-models` for managing models across all providers
- **Model Discovery & Sync** - Automatic discovery of available models from all configured providers with one-click sync
- **Optional AI Providers** - All providers are now optional - run with Ollama only, OpenAI only, both, or neither (graceful degradation)
- **OpenAI Integration** - Complete OpenAI support including chat completions, embeddings, and vision models
- **Enhanced Model Selection** - New model selection component with real-time search, pagination, and provider icons
- **AI Model Statistics** - Per-provider statistics dashboard showing model counts, capabilities, and usage metrics
- **Usage Tracking Foundation** - Token and request tracking for billing and analytics (foundation for future cost monitoring)
- **Interactive Capability Badges** - Clickable badges in admin UI to filter models by capability (embedding, chat, vision, functions)
- Changelog viewer page with formatted markdown display - access from settings dropdown for better readability
- Automated end-to-end testing infrastructure with content-based Docker image caching (15x faster CI)
- CODEOWNERS file for critical repository files to ensure proper review

### Changed

- **AI Service Architecture** - Restructured ai-service-client into provider-specific modules (ollama/, openai/) for better extensibility
- **Model References** - Libraries, assistants, and list fields now reference models via foreign keys instead of string names
- **Embedding Model Migration** - Content processing tasks now snapshot the embedding model used (preserves historical accuracy)
- **Multi-Instance Ollama** - Existing multi-instance Ollama implementation preserved with no regressions
- **LangChain v1.0** - Updated to LangChain v1.0 with all breaking changes resolved
- **File Converter Options** - Simplified structure with OCR model now managed via database relation
- **GraphQL Schema** - Enhanced with model filtering, capability queries, and provider-specific statistics
- Webcrawler: Updated all Python dependencies to latest versions - crawl4ai now uses official PyPI release (0.7.6), FastAPI updated to 0.121.0
- Marketing website: Mobile responsiveness and accessibility improvements across all pages
- Documentation: Updated file naming conventions and corrected inconsistencies
- CI/CD: Docker images only published to GitHub Container Registry after all tests pass
- Dependency updates: Vite upgraded from 6.3.6 to 7.1.12

### Fixed

- **Enrichment Queue Worker** - Fixed broken concurrency control (now correctly counts running tasks)
- **Enrichment Race Condition** - Fixed race condition in status updates using atomic updateMany operations
- **OpenAI Streaming** - Added `stream_options: { include_usage: true }` for proper token tracking in chat streams
- **Model Classifier** - Enhanced to detect GPT-5, GPT-4.x, and modern OpenAI model patterns
- **Capability Detection** - Improved auto-detection for vision and function-calling capabilities
- CHANGELOG.md now correctly included in Docker builds (was broken symlink)
- Queue and AI service status now visible to all users with proper access control
- Ollama tests properly skipped when environment variables are missing
- Docker build lockfile issues resolved

### Breaking Changes

- **Database Migration Required** - Run `pnpm prisma migrate deploy` to create new AI model tables
- **Environment Variables** - OpenAI support adds optional `OPENAI_API_KEY` and `OPENAI_BASE_URL`
- **GraphQL Schema** - Model selection queries now return structured objects instead of string names (codegen required)

### Migration Notes

- Existing Ollama models are automatically migrated to database on first sync
- Libraries, assistants, and list fields preserve NULL model references (no forced defaults)
- Multi-instance Ollama configurations continue to work without changes
- After deployment, admins should visit `/admin/ai-models` and click "Sync Models" to populate the database

## [2025-10-22]

### Added

- New dashboard at home page with overview of your workspace - see libraries, lists, conversations, and assistants at a glance
- System status cards showing task queue progress and AI service health
- Tabbed dashboard interface for quick access to all your items
- Documentation link in settings dropdown - access setup guides and technical documentation
- Library and conversation sorting - items now sorted by most recently updated first
- Library file sorting - sort files by creation date or name (ascending/descending) in API and UI
- n8n AI Agent workflow template - prototype RAG patterns with George AI tools before implementing in chat
- Manual bulk import mode for Gmail n8n workflow - import up to 10 recent emails at once for testing

### Changed

- Login page now shows welcome screen for unauthenticated users
- Marketing content moved to dedicated marketing website (george-ai.net)
- Streamlined interface focused on core productivity features

### Fixed

- Missing "New Library" button on libraries list page now visible
- Gmail n8n workflow data access issues that could cause processing failures
- New libraries now redirect to settings page after creation

## [2025-10-20]

### Added

- Email ingestion via n8n workflows - automatically ingest emails from Gmail, IMAP, or Exchange into libraries
- API key authentication for libraries - generate secure keys for external integrations without sharing user credentials
- Email file converter (.eml) - converts email messages to searchable markdown with full metadata preservation
- Automatic duplicate detection for emails - prevents re-processing of emails already in the library
- Support for email attachments - each attachment is stored as a separate file alongside the email body
- n8n workflow template for Gmail integration with complete setup documentation

## [2025-10-14]

### Added

- Bulk task management for content extraction - create missing tasks or drop pending tasks in one action
- Status filtering for extraction tasks - filter by pending, extracting, embedding, completed, or failed
- Auto-process crawled files setting - automatically create extraction tasks for previously skipped files
- Task statistics in the UI - real-time counts showing files without chunks and task status breakdown
- Individual task cancellation - cancel specific processing tasks that are stuck or no longer needed

### Changed

- Destructive actions now show confirmation dialogs to prevent accidental deletions
- Operation buttons show loading spinners and disable during processing
- Library settings now include option to control automatic processing of crawled files

## [2025-10-13]

### Added

- Real-time status updates for running crawlers with automatic refresh
- Run and stop controls directly in the crawlers menu for quick access
- Status badges showing crawler run states at a glance
- Sticky table headers and columns for better navigation in crawler views

### Changed

- Crawler forms now use horizontal space more efficiently with improved layout
- Dialog scrolling improved - only content scrolls while headers and buttons stay visible
- Action buttons in crawler tables now show as icons with tooltips for cleaner interface
- Upgraded authentication system (Keycloak) for improved stability

### Fixed

- File uploads functionality restored and working correctly
- Files table display issues resolved

## [2025-10-09]

### Added

- Status count badges showing enrichment progress at a glance
- New actions for individual cells: Clear enrichment, Stop pending enrichment
- Better error display distinguishing between technical errors (red) and missing values (yellow)

### Changed

- Lists now load 20x faster, especially with many enrichment fields
- Status colors are now consistent throughout the application
- Enrichment updates are now more reliable with automatic refresh

### Fixed

- Statistics page performance significantly improved
- Queue status now correctly shows only for the specific field being enriched
