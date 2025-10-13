# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

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
