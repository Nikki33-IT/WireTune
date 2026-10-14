<div align="center">

# ⚡ WireTune

### *High-Performance Windows Network Latency Tuner & Driver Optimizer*

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Windows_10%20%2F%2011-0078D6?style=for-the-badge&logo=windows&logoColor=white" alt="Windows" />
  <img src="https://img.shields.io/badge/Stack-JavaScript%20%2F%20Node%20%2F%20WinAPI-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JS" />
  <img src="https://img.shields.io/badge/Privacy-100%25_Offline-00C853?style=for-the-badge&logo=shield" alt="Privacy" />
  <img src="https://img.shields.io/badge/Tests-15%20Passed-brightgreen?style=for-the-badge" alt="Tests" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT License" />
  <img src="https://img.shields.io/badge/Author-Nikki-purple?style=for-the-badge" alt="Nikki" />
</p>

<p align="center">
  <b>Minimize packet jitter • Hardware-aware NDIS driver tuning • 1-Click snapshot recovery • Zero telemetry</b>
</p>

<p align="center">
  <a href="#-watch-wiretune-in-action">Demo</a> •
  <a href="#-key-capabilities">Key Capabilities</a> •
  <a href="#-wiretune-vs-traditional-tweakers">Comparison</a> •
  <a href="#-optimization-profiles">Profiles</a> •
  <a href="#-driver-properties-deep-dive">Driver Deep Dive</a> •
  <a href="#-dns-benchmark-center">DNS Benchmark</a> •
  <a href="#-how-it-works-architecture">Architecture</a> •
  <a href="#-privacy-by-design">Privacy</a> •
  <a href="#-quick-start--installation">Installation</a> •
  <a href="#-faq">FAQ</a>
</p>

</div>

---

## 🎥 Watch WireTune in Action

<div align="center">
  <img src="docs/images/wiretune-preview.gif" alt="WireTune Preview" width="860" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);" />
  <br /><br />
  <p>
    <em>Ultra-fast, hardware-aware network parameter tuning with verified driver safety, instant undo, and zero telemetry.</em>
  </p>
</div>

---

## 🖥️ Hero Dashboard

<div align="center">
  <img src="docs/images/wiretune-dashboard.png" alt="WireTune Dashboard" width="100%" style="border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);" />
</div>

---

## ✨ WireTune at a Glance

WireTune empowers you to fine-tune your network adapter's low-level driver properties safely, transparently, and reversibly.

| Optimization Engine | Adapter Intelligence |
| :---: | :---: |
| ![Optimization Engine](docs/images/wiretune-optimization.png) | ![Adapter Details](docs/images/wiretune-adapter.png) |
| *Selective driver property tuning with contextual "Why this setting?" explanations.* | *Physical network card selector with live link negotiation, MAC status, and media state.* |

| Network Benchmark Center | DNS Resolver Benchmark |
| :---: | :---: |
| ![Benchmark Center](docs/images/wiretune-benchmark.png) | ![DNS Benchmark](docs/images/wiretune-dns.png) |
| *Real-time ping, jitter, and link speed testing with honest Before vs After comparisons.* | *Direct latency probes across top public resolvers with 1-click manual apply.* |

| Hardware Diagnostics | Adapter Custom Profiles |
| :---: | :---: |
| ![Diagnostics](docs/images/wiretune-diagnostics.png) | ![Profiles](docs/images/wiretune-profiles.png) |
| *6-point connection health verification and raw hardware/driver NDIS telemetry.* | *Tailored presets for Gaming, Streaming, Balanced, and Multi-Gigabit Performance.* |

| Application Settings | Elevated Dark Mode Experience |
| :---: | :---: |
| ![Settings](docs/images/wiretune-settings.png) | ![Elevated Dark Mode](docs/images/wiretune-dark-mode.png) |
| *Comprehensive preferences: Theme, 30 Languages, Reduced Motion, and Portable storage mode.* | *Multi-step animated pre-flight backup snapshot and verified optimization progress.* |

---

## 🎯 Key Capabilities

- 🚀 **Hardware-Aware NDIS & TCP/IP Tuning**: Fine-tunes hardware properties (Interrupt Moderation, RSS, EEE, Rx/Tx Descriptors, Hardware Offloading) directly through official Windows NetAdapter APIs.
- 🎮 **Dedicated Optimization Profiles**:
  - **Competitive Gaming**: Minimizes packet jitter and input delay, disables energy-saving power drops, lowers CPU interrupt intervals.
  - **Streaming & Content Creation**: Boosts sustained throughput, expands TCP window sizes, stabilizes queue pacing.
  - **Balanced / Default**: Safe, stable everyday performance with optimal energy efficiency.
  - **Maximum Performance**: Aggressive queue sizing and MTU framing for multi-gigabit (2.5G / 10G) networks.
  - **Custom Profile Manager**: Build, label, save, export, and import your own configuration presets.
- 🧪 **Honest Before / After Network Benchmark**: Measures true round-trip ping, jitter variation, packet stability, and negotiated link speed without artificial inflation.
- 🌐 **DNS Benchmark Center**: Direct UDP latency and reliability testing across major public resolvers (Cloudflare, Quad9, Google, AdGuard, OpenDNS, Mullvad) with 1-click manual apply or reset to DHCP.
- 💾 **Automated Pre-Flight Snapshots**: Before making any modification, WireTune captures an uncompressed local JSON backup of your current configuration.
- ↩ **Instant 1-Click Rollback**: Restore any previous configuration state or reset back to official manufacturer defaults at any time.
- ❓ **"Why this setting?" Transparency**: In-depth in-app technical tooltips explaining the hardware role, recommended values, benefits, and trade-offs for every property.
- 🔒 **100% Privacy & Offline Execution**: Zero telemetry, zero analytics, zero external web requests. Strictly binds to loopback `127.0.0.1`.
- 📦 **True Portable Mode**: Run completely self-contained from `./WireTuneData/` without touching `%APPDATA%` or Windows Registry.
- 🌍 **30-Language Localization**: Full dynamic real-time language switching with native Right-to-Left (RTL) support.

---

## ⚖️ WireTune vs. Traditional "Tweakers"

Most downloadable network "optimizers" and YouTube batch scripts are dangerous black boxes: they write blind registry tweaks, disable Windows Defender, corrupt firewall rules, and apply identical static settings across completely incompatible hardware.

**WireTune takes a safe, engineering-first approach:**

| Feature / Standard | ⚠️ Typical "Tweakers" & Reg Scripts | 🛡️ WireTune |
| :--- | :--- | :--- |
| **Driver Awareness** | ❌ Blind hardcoded values; breaks when driver ignores them | ✅ Probes driver enum limits (`ValidDisplayValues`) before applying |
| **Pre-Flight Backup** | ❌ None or incomplete system restore point | ✅ Automated local JSON snapshot created prior to any change |
| **Rollback Capability** | ❌ Difficult or impossible to restore exact original state | ✅ Instant 1-click rollback to snapshot or factory defaults |
| **System Security** | ❌ Disables Windows Defender, firewall, or security services | ✅ Zero tampering with Defender, firewall, proxies, or hosts file |
| **Telemetry & Privacy** | ❌ Often bundles adware, analytics, or background telemetry | ✅ 100% offline, zero telemetry, zero analytics, strictly local |
| **Batch Property Apply** | ❌ Repeated adapter disconnects for each individual property | ✅ High-performance batched PowerShell execution pipeline (1–2s) |
| **Transparency** | ❌ Opaque `.bat` / `.reg` scripts with zero documentation | ✅ "Why this setting?" tooltips explaining trade-offs and vendor quirks |
| **DNS Management** | ❌ Silently overrides DNS in the background | ✅ Transparent benchmark; manual user opt-in only with 1-click restore |
| **Hardware Scope** | ❌ Treats Intel, Realtek, Marvell, and Wi-Fi identically | ✅ Differentiates physical adapters, vendor features, and media types |

---

## 🎛️ Optimization Profiles

WireTune includes five rigorously tested profiles designed for distinct usage scenarios:

| Profile | Target Audience | Primary Focus | Key Driver Adjustments |
| :--- | :--- | :--- | :--- |
| **Balanced** | Daily Work & General Browsing | Stability & Power Efficiency | Safe vendor defaults, balanced interrupt moderation, standard descriptor buffers. |
| **Gaming** | Competitive Multiplayer (FPS/MOBA) | Lowest Latency & Minimal Jitter | Disables Energy Efficient Ethernet (EEE), minimizes interrupt moderation, optimizes RSS CPU queues. |
| **Streaming** | Streamers & Content Creators | Steady Throughput & Buffer Health | Expands TCP buffer windows, enables hardware checksum offloading, stabilizes queue pacing. |
| **Maximum Performance** | Multi-Gigabit (2.5G/10G) & High-Speed LAN | Peak Bandwidth & Descriptors | Maximizes Rx/Tx descriptors, enables jumbo frames (where supported), aggressive hardware offloading. |
| **Custom** | Power Users & Network Admins | Granular Manual Control | Toggle and tune individual driver-exposed properties with immediate validation. |

---

## 🔬 Driver Properties Deep Dive

WireTune configures the low-level properties provided by official network card drivers (Intel, Realtek, Broadcom, Marvell/Aquantia, Qualcomm):

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PHYSICAL NETWORK ADAPTER                        │
├──────────────────────────────────┬─────────────────────────────────────┤
│  ⚡ Interrupt Moderation (IM)    │  Controls packet batching to CPU   │
│  🍃 Energy Efficient Ethernet    │  Prevents sleep/wake latency drops  │
│  🔀 Receive Side Scaling (RSS)   │  Distributes network load over CPUs │
│  📦 Rx / Tx Buffer Descriptors   │  Prevents packet drops under load   │
│  🚀 Large Send Offload (LSO v2)  │  Offloads segmentation to NIC ASIC  │
│  🛡️ TCP/UDP Checksum Offload     │  Calculates checksums in hardware   │
│  🌊 Flow Control (Rx & Tx)       │  Regulates congestion & pauses      │
│  🐘 Jumbo Packet Framing         │  Increases MTU payload for gigabit  │
└──────────────────────────────────┴─────────────────────────────────────┘
```

- **Interrupt Moderation (IM)**: Regulates how frequently the network adapter interrupts the CPU to service packets. Lowering IM reduces packet response time for competitive gaming, while balanced IM reduces CPU load during sustained downloads.
- **Energy Efficient Ethernet (EEE / Green Ethernet)**: Puts physical PHY circuitry into low-power states when traffic is low. Disabling EEE prevents micro-stutters and wake-up latency spikes.
- **Receive Side Scaling (RSS)**: Distributes inbound packet processing across multiple CPU cores rather than overloading Core 0.
- **Receive & Transmit Buffers (Rx/Tx Descriptors)**: Allocates on-adapter memory buffer queues. Higher values prevent packet loss during intense burst traffic.
- **Hardware Checksum & Large Send Offload (LSO)**: Offloads packet segmentation and checksum calculation from the central processor directly onto the network card ASIC.
- **Flow Control**: Controls IEEE 802.3x pause frames. Disabling it in competitive gaming prevents queuing delays caused by switch flow control.

---

## 🌐 DNS Benchmark Center

WireTune includes an independent DNS benchmarking engine that tests round-trip response time directly to resolver IPs via UDP:

| Resolver | Primary IP | Secondary IP | Key Features |
| :--- | :--- | :--- | :--- |
| **Cloudflare** | `1.1.1.1` | `1.0.0.1` | Ultra-fast Anycast network, strict no-logs policy |
| **Quad9** | `9.9.9.9` | `149.112.112.112` | Built-in threat intelligence blocking malware and phishing |
| **Google Public DNS** | `8.8.8.8` | `8.8.4.4` | Massive worldwide capacity and reliable global routing |
| **AdGuard DNS** | `94.140.14.14` | `94.140.15.15` | Blocks ads, telemetry, and tracking servers |
| **OpenDNS (Cisco)** | `208.67.222.222` | `208.67.220.220` | Enterprise-grade availability and filtering |
| **Mullvad** | `194.242.2.2` | `194.242.2.3` | Privacy-focused, zero data logging or telemetry |

> [!IMPORTANT]
> **No Silent Overwrites**: WireTune **never** modifies your DNS settings without your explicit click. You decide whether to apply a resolver, and you can reset back to automatic DHCP at any moment.

---

## 🔄 How It Works (Architecture)

WireTune follows an atomic, safe, and hardware-verified execution pipeline:

```
┌──────────────────────────────┐
│     1. Enumerate Hardware    │  → Discovers physical adapters via NetAdapter
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│     2. Probe Driver Limits   │  → Reads properties & ValidDisplayValues
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│     3. Capture JSON Snapshot │  → Saves pre-change state to ./backups/
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│     4. Filter Targets        │  → Excludes unsupported hardware keywords
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│     5. Batched Execution     │  → Applies all settings in a single PowerShell job
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│     6. Verification Probe    │  → Re-queries driver to confirm applied values
└──────────────┬───────────────┘
               │
               ▼
       [ Success & Undo Ready ]
```

---

## 🔒 Privacy by Design

WireTune is built on the fundamental principle that system utilities should **never** monitor their users.

```
┌────────────────────────────────────────────────────────┐
│               WIRE TUNE PRIVACY GUARANTEE               │
├────────────────────────────────────────────────────────┤
│  ✓  No telemetry                                       │
│  ✓  No analytics (Google Analytics, PostHog, Mixpanel) │
│  ✓  No tracking scripts or beacons                     │
│  ✓  No advertising or sponsored links                  │
│  ✓  No account registration required                   │
│  ✓  No cloud backend or remote servers                 │
│  ✓  No hidden background data collection               │
│  ✓  No automatic crash or log uploads                  │
│  ✓  Strict local loopback binding (127.0.0.1 only)    │
│  ✓  100% offline-capable execution                     │
└────────────────────────────────────────────────────────┘
```

> Read our complete [Privacy Policy](PRIVACY.md) for full technical transparency.

---

## 🛠️ Quick Start & Installation

### Option 1: Standalone Portable (Recommended)
1. Download the latest release package from [Releases](https://github.com/Nikki/WireTune/releases).
2. Extract the archive to any folder or USB flash drive.
3. Launch `WireTune.exe` (or right-click `WireTune-Admin.bat` and select **Run as administrator**).

### Option 2: Run from Source (Node.js)

#### Prerequisites
- **Windows 10** (Build 1903+) or **Windows 11** (64-bit)
- **Node.js 18.0+**
- **PowerShell 5.1+**
- *(Optional for C# desktop wrapper)*: **.NET 8.0 SDK**

#### Steps
```bash
# 1. Clone the repository
git clone https://github.com/Nikki/WireTune.git
cd WireTune

# 2. Run automated test suite (15 unit tests)
npm test

# 3. Start WireTune in desktop mode
npm start

# (Optional) Build standalone WireTune.exe (.NET 8 WebView2 wrapper)
npm run build:exe
```

---

## 📖 Step-by-Step Usage Guide

1. **Launch WireTune**: Start the app. Click **Restart as Administrator** if prompted to enable hardware writes.
2. **Select Adapter**: Pick your physical Ethernet or Wi-Fi network card from the top dropdown.
3. **Choose Profile**: Select an optimization preset (`Gaming`, `Balanced`, `Streaming`, `Maximum Performance`) or choose `Custom`.
4. **Run Baseline Benchmark**: Open the **Benchmark** tab and click **Run Benchmark** to record your pre-optimization latency and jitter.
5. **Inspect Properties**: View the **Adapter Details** tab. Click **"Why this setting?"** on any property to see technical explanations.
6. **Apply Optimization**: Click **Optimize Now**. WireTune automatically creates a local snapshot backup before applying changes.
7. **Review Audit Report**: Check the **Audit History** tab to inspect exactly what parameters were modified.
8. **Run Post-Benchmark**: Re-test your connection to compare Before vs After metrics.
9. **Instant Rollback**: If desired, click **Restore Snapshot** or **Restore Factory Defaults** with a single click.

---

## 🌍 Internationalization & Languages

WireTune includes built-in localization across **30 languages**:

<div align="center">

| | | | | |
| :---: | :---: | :---: | :---: | :---: |
| 🇬🇧 English (`en`) | 🇵🇱 Polish (`pl`) | 🇩🇪 German (`de`) | 🇫🇷 French (`fr`) | 🇪🇸 Spanish (`es`) |
| 🇮🇹 Italian (`it`) | 🇵🇹 Portuguese (`pt`) | 🇳🇱 Dutch (`nl`) | 🇷🇺 Russian (`ru`) | 🇺🇦 Ukrainian (`uk`) |
| 🇨🇳 Chinese Simp (`zh`) | 🇹🇼 Chinese Trad (`zh-TW`) | 🇯🇵 Japanese (`ja`) | 🇰🇷 Korean (`ko`) | 🇸🇦 Arabic (`ar` - RTL) |
| 🇹🇷 Turkish (`tr`) | 🇻🇳 Vietnamese (`vi`) | 🇹🇭 Thai (`th`) | 🇮🇩 Indonesian (`id`) | 🇨🇿 Czech (`cs`) |
| 🇸🇰 Slovak (`sk`) | 🇭🇺 Hungarian (`hu`) | 🇷🇴 Romanian (`ro`) | 🇧🇬 Bulgarian (`bg`) | 🇬🇷 Greek (`el`) |
| 🇸🇪 Swedish (`sv`) | 🇩🇰 Danish (`da`) | 🇳🇴 Norwegian (`no`) | 🇫🇮 Finnish (`fi`) | 🇮🇳 Hindi (`hi`) |

</div>

---

## ❓ Frequently Asked Questions (FAQ)

<details>
<summary><strong>Does WireTune guarantee lower ping or faster internet download speeds?</strong></summary>
<br />
<strong>No software can break the laws of physics:</strong> your physical distance to the game server, your ISP routing, and local line quality dictate baseline ping. WireTune eliminates local bottlenecks in the Windows network stack and network card driver: preventing PHY sleep transitions, eliminating micro-stutters, stabilizing buffer pacing, and minimizing CPU interrupt latency. WireTune provides honest, uninflated measurements.
</details>

<details>
<summary><strong>Does WireTune collect or transmit any of my data?</strong></summary>
<br />
<strong>No.</strong> WireTune has no telemetry, no tracking scripts, no external server infrastructure, and no analytics. It runs 100% locally and binds strictly to <code>127.0.0.1</code>. Read our <a href="PRIVACY.md">Privacy Policy</a> for more details.
</details>

<details>
<summary><strong>Can I undo changes made by WireTune?</strong></summary>
<br />
<strong>Yes.</strong> WireTune creates an uncompressed local JSON backup snapshot before applying any change. You can roll back to any prior state or restore original factory defaults with a single click.
</details>

<details>
<summary><strong>Does WireTune replace my network adapter driver?</strong></summary>
<br />
<strong>No.</strong> WireTune configures the official driver properties provided by your hardware vendor (Intel, Realtek, Marvell, etc.) via official Windows NetAdapter interfaces. It does not install third-party drivers or custom kernel extensions.
</details>

<details>
<summary><strong>Why does my network connection briefly drop during optimization?</strong></summary>
<br />
When certain advanced driver properties (like interrupt moderation or RSS queues) are altered, the Windows network stack briefly re-initializes the physical NIC interface (typically taking 1–2 seconds). This is standard Windows driver behavior.
</details>

<details>
<summary><strong>Why does WireTune require Administrator privileges?</strong></summary>
<br />
Standard Windows users are restricted from altering hardware driver configuration and network adapter settings. Administrator privileges are required only when applying optimizations or restoring backups. WireTune can run in read-only preview mode without elevation.
</details>

---

## 🔧 Troubleshooting

| Issue | Potential Cause | Solution |
| :--- | :--- | :--- |
| **Adapter not detected** | Adapter disabled or generic driver in use | Verify adapter is enabled in Windows Device Manager and official manufacturer drivers are installed. |
| **Setting unavailable** | Driver does not expose this capability | Basic or generic drivers omit certain properties (e.g., RSS, EEE). WireTune automatically hides or skips unsupported settings. |
| **Optimization failed** | Missing administrator rights | Launch WireTune as administrator using `WireTune-Admin.bat` or click **Restart as Administrator** in the app. |
| **Connection re-negotiation** | Expected driver reload | Applying advanced driver parameters triggers a brief 1–2 second re-negotiation. This is expected and normal. |

---

## 🗺️ Roadmap

WireTune is under active continuous development.

### 📌 v1.x — Foundation
- [x] Hardware adapter detection via Windows NetAdapter subsystem
- [x] Optimization profiles (`Balanced`, `Gaming`, `Streaming`, `Maximum Performance`)
- [x] Automated pre-flight local JSON backups and rollback system
- [x] Integrated Before / After Network Benchmark Center
- [x] DNS Resolver Benchmark with 1-click manual apply
- [x] Custom Adapter Profiles manager (create, save, export)
- [x] Contextual "Why this setting?" technical explanations
- [x] 100% Offline, Zero Telemetry architecture
- [x] Portable Mode with self-contained `./WireTuneData/` storage
- [x] Multi-language localization across 30 languages
- [x] Windows 11 Fluent Design UI with Dark & Light mode
- [x] Batched single-job PowerShell execution for lightning-fast application

### 🚀 v2.x — Advanced Optimization
- [~] Expanded vendor-specific property mappings (Intel Killer, Realtek Gaming, Marvell AQtion)
- [~] Advanced driver capability detection and hardware limitation heuristics
- [ ] Smarter per-adapter profile recommendation engine based on link type
- [ ] Per-adapter profiles with automatic switching on network change
- [ ] Multi-point configuration rollback history with side-by-side diffing
- [ ] Automatic post-apply configuration verification and health check
- [ ] A/B profile performance testing mode
- [ ] More detailed network diagnostics (DPC latency indicators, packet drop counters)
- [ ] Enhanced benchmark accuracy with multi-pass median filtering

### 🧠 v3.x — Network Intelligence
- [ ] Intelligent physical link quality analysis
- [ ] Network bufferbloat and queue depth analyzer
- [ ] Wi-Fi quality and signal-to-noise ratio (SNR) diagnostics
- [ ] Wi-Fi channel crowding and frequency band analysis
- [ ] Comprehensive Connection Health Score
- [ ] Custom benchmark endpoint profiles and local iperf3 integration
- [ ] Exportable diagnostic audit reports in PDF and Markdown

---

## 🤝 Contributing

Contributions from the community are warmly welcome! Please review our [Contributing Guidelines](CONTRIBUTING.md) to get started:

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 🔒 Security & Privacy

For details on our security practices or to report a vulnerability responsibly, please consult our [Security Policy](SECURITY.md) and [Privacy Policy](PRIVACY.md).

---

## 📄 License

WireTune is open-source software licensed under the **[MIT License](LICENSE)**.

---

<div align="center">

Engineered with passion by **[Nikki](https://github.com/Nikki)** ⚡  
*WireTune • Safe, Fast & Transparent Network Optimization*

</div>
