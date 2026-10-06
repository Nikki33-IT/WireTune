# Privacy Policy

**WireTune is designed from the ground up with a 100% Privacy-First, Offline-Only Architecture.**

## What We Collect
**Nothing.** WireTune does not collect, log, store, or transmit any personal data, hardware identifiers, network traffic, or telemetry.

## Key Commitments

- :white_check_mark: **No Telemetry**: There are no telemetry services, SDKs, or background pings in this codebase.
- :white_check_mark: **No Analytics**: We do not use Google Analytics, PostHog, Mixpanel, or any tracking scripts.
- :white_check_mark: **No User Accounts**: No registration, email addresses, or login credentials required.
- :white_check_mark: **No Cloud Server**: All optimization, backup, restoration, and diagnostics execute purely offline on your local machine.
- :white_check_mark: **No Advertising**: Zero ads, sponsored links, or third-party partnerships.
- :white_check_mark: **No Hidden Connections**: WireTune binds only to `127.0.0.1` locally. The built-in connection latency test pings your own local router/gateway (`192.168.x.x` / `10.x.x.x`) to evaluate physical hop quality without communicating with external web services.
- :white_check_mark: **Full Transparency**: All configuration backups are stored in plain, readable JSON in your local `/backups/` directory.

## Local Diagnostic Logs
Logs generated during execution are kept solely in system memory. If you click **Export Local Logs**, a copy is written to your local `diagnostics/` folder on your own hard drive. You maintain 100% control over whether to share those files when requesting technical support.
