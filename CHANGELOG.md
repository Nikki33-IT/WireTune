# Changelog

All notable changes to **WireTune** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Expanded network adapter vendor recognition and capabilities matrix.
- Advanced Wi-Fi signal quality telemetry.
- Wi-Fi channel and frequency band diagnostics.

### Changed
- Improved accuracy of median-filtered latency probes.

### Fixed
- Ensured graceful fallback on adapters with restricted registry permissions.

### Security
- Verified strict local binding to `127.0.0.1` only with remote connection rejection.

---

## [1.0.0] - 2026-10-06

### Added
- **Core Optimization Engine**:
  - Intelligent hardware detection using native Windows `NetAdapter` cmdlets.
  - Capability verification against driver-supported values (`ValidDisplayValues`).
  - Safe-by-default execution pipeline: capability probe → snapshot backup → property configuration → verification.
  - Partial failure tolerance: unsupported driver properties are safely skipped without halting the overall process.
- **Optimization Profiles**:
  - `Balanced`: Recommended safe defaults for daily productivity and stability.
  - `Gaming`: Focuses on minimizing interrupt latency, disabling energy transitions, and reducing packet jitter.
  - `Streaming`: Maximizes TCP buffer window sizes and offload acceleration for sustained high throughput.
  - `Maximum Performance`: Aggressive optimization for multi-gigabit fiber and Ethernet links.
  - `Custom`: Interactive granular configuration of individual driver properties.
  - `Restore Defaults`: Reverts adapter to manufacturer/driver factory settings.
- **DNS Resolver Benchmark**:
  - Multi-server DNS latency & reliability comparison across major public providers (Cloudflare, Quad9, Google, OpenDNS, AdGuard, Mullvad).
  - Manual 1-click apply of fastest resolver without silent background modifications.
  - One-click restore to automatic DHCP configuration.
- **"Why this setting?" Transparency Tool**:
  - Contextual documentation tooltips for all advanced network properties.
  - Explains technical function, recommended values, benefits, potential trade-offs, and driver dependency.
- **Backup & Rollback System**:
  - Automated local snapshot backup prior to any modification saved in `./WireTuneData/backups/` or `./backups/`.
  - One-click `[ Undo Changes ]` and `[ Restore Previous Settings ]`.
  - Local audit history tab with individual snapshot restoration.
- **Integrated Network Benchmark**:
  - Real-time latency, jitter, bufferbloat assessment, and link speed detection.
  - Honest Before vs After comparison reporting.
  - Export capabilities in JSON, CSV, and plain text formats.
- **Portable Mode**:
  - Fully self-contained operation without requiring an installer or system registry modifications.
  - Configurable storage mode toggling between `./WireTuneData/` and system AppData.
- **UI & UX**:
  - Windows 11 Fluent Design aesthetic with dark and light theme support.
  - Responsive layout, status capsules, and micro-animations.
  - Full localization support for 30 languages with English fallback and RTL support for Arabic.
  - Administrator privileges status indicator with one-click UAC elevation.
- **Privacy & Security**:
  - 100% offline-capable, zero telemetry, zero analytics, zero external network connections.
