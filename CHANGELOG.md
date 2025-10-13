# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

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
