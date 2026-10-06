# Contributing to WireTune

Thank you for your interest in contributing to **WireTune**! We welcome bug reports, documentation enhancements, feature proposals, and pull requests from the open-source community.

---

## 🎯 Guiding Principles

Before submitting contributions, please keep WireTune's strict design principles in mind:

1. **Zero Telemetry & 100% Offline**: WireTune never collects, tracks, or transmits user data. No external network requests, analytics, crash report beacons, or third-party tracking scripts will ever be accepted.
2. **Safe By Default**: Never apply blind or hazardous changes. Never disable Windows Defender, firewall rules, or core security mitigations. Every property modification must be verified against driver capabilities and backed up locally before application.
3. **Ultra-Lightweight & Minimalist**: We avoid bloated dependencies, heavy background services, and unnecessary frameworks. Prefer native operating system APIs and zero external runtime dependencies.
4. **Transparency & Reversibility**: Every action must be honest, documented, and completely reversible with a single click.

---

## 🛠️ Development Workflow

### Step 1: Fork & Clone

```bash
git clone https://github.com/allynIT/WireTune.git
cd WireTune
```

### Step 2: Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or for bug fixes:
git checkout -b fix/issue-description
```

### Step 3: Local Environment & Testing

WireTune requires:
- Windows 10 or Windows 11 (x64)
- Node.js 18.0.0 or higher
- PowerShell 5.1+

Run WireTune locally:
```bash
# Start development server and desktop launcher
npm start

# Or start the lightweight background server directly
npm run serve
```

Run the automated test suite:
```bash
npm test
```

### Step 4: Code Standards

- **Architecture**: Keep code cleanly separated in `/src/core`, `/src/network`, `/src/optimization`, `/src/backup`, `/src/localization`, `/src/platform`, `/src/diagnostics`, `/src/ui`.
- **Property Metadata**: When adding new network properties, update `src/optimization/property-meta.js` with honest technical explanations (what it does, why it is recommended, benefits, downsides, driver dependency).
- **Localization**: Keep translations synced using `node scripts/generate-locales.js`.
- **No Secrets or Personal Paths**: Never include hardcoded local machine paths, usernames, credentials, or private debug logs.

### Step 5: Commit & Pull Request

- Write concise, descriptive commit messages following Conventional Commits (e.g., `feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
- Open a Pull Request on GitHub against `master`.
- Fill out the provided Pull Request template with details on changes and test results.

---

## 📋 Reporting Bugs & Feature Requests

Please use our GitHub Issue templates:
- **[Bug Report](https://github.com/allynIT/WireTune/issues/new?template=bug_report.yml)**: Include WireTune version, Windows version, network adapter model, driver version, reproduction steps, expected behavior, and actual behavior.
- **[Feature Request](https://github.com/allynIT/WireTune/issues/new?template=feature_request.yml)**: Explain the problem, proposed solution, and how it aligns with WireTune's safety and privacy principles.
