# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [unreleased]

### Changed

- Webcrawler: Updated all Python dependencies to latest versions - crawl4ai now uses official PyPI release (0.7.6), FastAPI updated to 0.121.0
- Marketing website: Mobile responsiveness and accessibility improvements across all pages
- Documentation: Updated file naming conventions and corrected inconsistencies

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
