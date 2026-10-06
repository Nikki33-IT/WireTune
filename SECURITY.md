# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Principles

WireTune is built strictly on the principle of **"Safe by Default"**:
- **No System Compromise**: WireTune never alters Windows Defender settings, firewall filtering, DNS resolvers, or proxy configurations.
- **Strictly Local Execution**: The internal IPC and HTTP server binds exclusively to `127.0.0.1` and denies connections from external IP addresses.
- **Capability Validation**: All hardware modifications are strictly validated against the driver's accepted enum values (`ValidDisplayValues`) prior to execution.
- **Mandatory Pre-Flight Backup**: A JSON snapshot of the existing configuration is saved before any setting is altered.
- **Error Isolation**: Individual property errors never crash or abort the rest of the optimization sequence.

## Reporting a Vulnerability

If you discover a security vulnerability in WireTune, please report it responsibly by contacting the maintainers directly through GitHub Security Advisories rather than opening a public issue. We will review and address any issues promptly.
