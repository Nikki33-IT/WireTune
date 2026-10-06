/**
 * Rich property metadata dictionary for network adapter properties.
 * Explains: What it does, why WireTune recommends it, potential benefits,
 * potential trade-offs/downsides, and driver/hardware compatibility.
 * Strictly honest technical facts — no false guarantees or marketing hype.
 */

const PROPERTY_METADATA = {
  '*InterruptModeration': {
    friendlyName: 'Interrupt Moderation',
    category: 'advanced',
    safety: 'Safe',
    whatItDoes: 'Interrupt Moderation instructs the network controller to batch multiple incoming packets together and signal the CPU with a single hardware interrupt, instead of interrupting the CPU for each individual packet received.',
    whyRecommended: 'In latency-critical profiles (Gaming, Max Performance), disabling interrupt moderation allows the operating system kernel to process packets immediately upon arrival at the network interface card, minimizing packet queuing delay. In Balanced and Streaming profiles, enabling moderation reduces CPU interrupt storms and preserves CPU headroom for media encoding and applications.',
    benefits: 'Disabling reduces microsecond-level packet delivery jitter and queuing delay. Enabling lowers CPU utilization during sustained high-throughput transfers.',
    downsides: 'Disabling slightly raises CPU interrupt overhead (typically 1-3% CPU usage on modern multi-core processors under heavy download load). Older dual-core or quad-core systems may experience higher CPU load.',
    hardwareNotes: 'Supported by Intel Gigabit/2.5G/10G adapters (I219, I225, I226), Realtek Gaming Ethernet (RTL8125, RTL8111), and high-end Wi-Fi 6/6E/7 chipsets. Drivers may name it "Interrupt Moderation Rate" with values like Off, Low, Medium, High.',
    recommended: {
      gaming: 'Disabled',
      streaming: 'Enabled',
      balanced: 'Enabled',
      maxperf: 'Disabled'
    }
  },

  '*FlowControl': {
    friendlyName: 'Flow Control (IEEE 802.3x)',
    category: 'advanced',
    safety: 'Safe',
    whatItDoes: 'Flow Control allows receiving network devices to transmit IEEE 802.3x PAUSE frames to upstream switches or routers when their local receive buffers approach capacity, temporarily halting outbound transmission.',
    whyRecommended: 'On standard consumer internet lines, PAUSE frames frequently introduce artificial packet queuing and latency micro-stutters during real-time online multiplayer or voice communications. WireTune recommends disabling Flow Control for gaming to maintain steady packet flow.',
    benefits: 'Disabling prevents unexpected PAUSE frames from stalling outbound packet queues. Enabling protects against buffer overflow drops on heavily overloaded local networks.',
    downsides: 'On congested enterprise LAN networks with slow switches or simultaneous multi-device saturations, disabling Flow Control may lead to dropped frames if buffers overflow, causing TCP retransmissions.',
    hardwareNotes: 'Universally supported across Ethernet adapters. Some consumer switches do not honor pause frames regardless of adapter settings.',
    recommended: {
      gaming: 'Disabled',
      streaming: 'Rx & Tx Enabled',
      balanced: 'Rx & Tx Enabled',
      maxperf: 'Disabled'
    }
  },

  '*ReceiveBuffers': {
    friendlyName: 'Receive Buffers (Rx Descriptor Count)',
    category: 'buffers',
    safety: 'Safe',
    whatItDoes: 'Receive Buffers determine the number of memory descriptors allocated in system RAM for incoming packets waiting to be processed by the network driver and operating system network stack.',
    whyRecommended: 'WireTune recommends increasing buffer depth to 1024 or 2048 descriptors (depending on profile). Standard default values (often 256 or 512) can quickly exhaust during sudden bandwidth bursts or multi-gigabit downloads, resulting in packet drops at the driver level.',
    benefits: 'Prevents dropped packets and TCP window collapses during high-throughput downloads, streaming, and background file transfers.',
    downsides: 'Consumes slightly more dedicated system memory (approximately 2 MB to 4 MB of kernel non-paged pool per network adapter).',
    hardwareNotes: 'Driver maximum limits vary: Intel adapters typically support up to 2048 or 4096; Realtek adapters usually allow up to 512 or 1024; Wi-Fi controllers manage internal buffer pools dynamically.',
    recommended: {
      gaming: '1024',
      streaming: '2048',
      balanced: '1024',
      maxperf: '2048'
    }
  },

  '*TransmitBuffers': {
    friendlyName: 'Transmit Buffers (Tx Descriptor Count)',
    category: 'buffers',
    safety: 'Safe',
    whatItDoes: 'Transmit Buffers allocate system memory for outbound network packets queued by the operating system before physical serialization onto the network medium.',
    whyRecommended: 'Sufficient transmit buffers prevent outbound queue stalls when uploading large files, broadcasting live video streams, or sending rapid bursts of UDP game telemetry.',
    benefits: 'Ensures smooth outbound throughput and eliminates driver-level outbound packet drops during heavy upload operations.',
    downsides: 'Minor kernel memory allocation (~2 MB per adapter). On severely congested uplinks with bufferbloat, excessively deep outbound queues can marginally increase queue residency time.',
    hardwareNotes: 'Standard Ethernet controllers support between 256 and 2048 descriptors. Automatically clamped by the driver to the nearest supported hardware value.',
    recommended: {
      gaming: '1024',
      streaming: '2048',
      balanced: '1024',
      maxperf: '2048'
    }
  },

  '*EEE': {
    friendlyName: 'Energy-Efficient Ethernet (IEEE 802.3az)',
    category: 'power',
    safety: 'Safe',
    whatItDoes: 'Energy-Efficient Ethernet (EEE) puts the physical Ethernet transceiver (PHY) into a low-power idle sleep state whenever no active packet transmission is occurring on the cable.',
    whyRecommended: 'Transitioning the physical PHY transceiver back from low-power idle to full active signaling requires 10 to 30 microseconds of wake-up transition time (Tw_sys). WireTune recommends disabling EEE to maintain full-power active signaling 100% of the time, eliminating wake-up latency spikes.',
    benefits: 'Removes physical PHY wake-up latency, prevents micro-disconnects on sensitive switch ports, and stabilizes round-trip packet timing.',
    downsides: 'Slightly higher idle electrical power draw at the network card (typically 0.2W to 0.5W, negligible on desktop PCs).',
    hardwareNotes: 'Requires both the network adapter and the connected router/switch port to support IEEE 802.3az. Incompatible firmware on certain routers can cause random 1-second link drops when EEE is enabled.',
    recommended: {
      gaming: 'Disabled',
      streaming: 'Disabled',
      balanced: 'Disabled',
      maxperf: 'Disabled'
    }
  },

  'AdvancedEEE': {
    friendlyName: 'Advanced Energy-Efficient Ethernet',
    category: 'power',
    safety: 'Safe',
    whatItDoes: 'An extended manufacturer-specific low-power PHY state utilized on modern Realtek and Intel multi-gigabit controllers (2.5 GbE / 5 GbE).',
    whyRecommended: 'Disabling ensures high-speed multi-gigabit PHY transceivers do not renegotiate clock signals or sleep during brief idle intervals between gaming packets or audio streams.',
    benefits: 'Consistent multi-gigabit physical link stability with zero sleep-state transitions.',
    downsides: 'Negligible power consumption increase (<0.2W).',
    hardwareNotes: 'Predominantly found on Realtek RTL8125/RTL8126 family and newer Intel 2.5G controllers.',
    recommended: {
      gaming: 'Disabled',
      streaming: 'Disabled',
      balanced: 'Disabled',
      maxperf: 'Disabled'
    }
  },

  'EnableGreenEthernet': {
    friendlyName: 'Green Ethernet (Cable Length Detection)',
    category: 'power',
    safety: 'Safe',
    whatItDoes: 'Measures cable impedance and reduces transceiver signal transmission voltage when an Ethernet cable is shorter than standard lengths (e.g., under 10 meters).',
    whyRecommended: 'Reducing transmitter voltage can weaken signal margins on cables routed near power cords or electrical interference. Disabling ensures the transceiver always drives full standard voltage for clean signal integrity.',
    benefits: 'Maximum electrical signal integrity and noise resilience along the entire cable run.',
    downsides: 'Negligible heat increase at the Ethernet controller (less than 1°C difference).',
    hardwareNotes: 'Proprietary feature commonly present on Realtek and Atheros Gigabit chipsets.',
    recommended: {
      gaming: 'Disabled',
      streaming: 'Disabled',
      balanced: 'Disabled',
      maxperf: 'Disabled'
    }
  },

  'PowerSavingMode': {
    friendlyName: 'Power Saving Mode / Link Power Management',
    category: 'power',
    safety: 'Safe',
    whatItDoes: 'Allows the network controller to drop into lower power D-states when Windows detects low network utilization.',
    whyRecommended: 'Prevents PCIe link and adapter internal clocks from scaling down, ensuring instant packet dispatch without hardware clock resumption delays.',
    benefits: 'Consistent sub-millisecond response time from the hardware controller.',
    downsides: 'Desktop will not shave fractions of a watt at idle.',
    hardwareNotes: 'Found across Intel, Realtek, and Broadcom controller drivers.',
    recommended: {
      gaming: 'Disabled',
      streaming: 'Disabled',
      balanced: 'Disabled',
      maxperf: 'Disabled'
    }
  },

  'GigaLite': {
    friendlyName: 'Gigabit Lite',
    category: 'power',
    safety: 'Safe',
    whatItDoes: 'Downgrades link speed from 1000 Mbps to 500 Mbps when electrical cable quality fluctuates or to conserve switch power.',
    whyRecommended: 'Disabling stops unexpected link speed reductions, keeping your network connection operating at true negotiated Gigabit speed.',
    benefits: 'Prevents silent half-rate throughput caps on Gigabit connections.',
    downsides: 'If an Ethernet cable is severely degraded, pinched, or damaged, disabling GigaLite may result in link disconnection rather than throttling down.',
    hardwareNotes: 'Specific to Realtek Gigabit Ethernet controllers.',
    recommended: {
      gaming: 'Disabled',
      streaming: 'Disabled',
      balanced: 'Disabled',
      maxperf: 'Disabled'
    }
  },

  '*RSS': {
    friendlyName: 'Receive Side Scaling (RSS)',
    category: 'advanced',
    safety: 'Safe',
    whatItDoes: 'Receive Side Scaling enables network packet receive processing to be distributed across multiple CPU cores via hardware hash functions, rather than bottlenecking all network traffic on CPU Core 0.',
    whyRecommended: 'Essential for modern multi-core PCs and multi-gigabit internet connections. Without RSS, a single CPU core can peg at 100% load during heavy downloads while other cores remain idle.',
    benefits: 'Prevents single-core CPU bottlenecks, improves packet throughput, and maintains UI/game smoothness under high network load.',
    downsides: 'Virtually none on modern PCs. Minor inter-core cache migration overhead on systems with 10+ year old single-channel memory.',
    hardwareNotes: 'Supported by almost all modern PCI Express Ethernet and Wi-Fi adapters. Windows requires RSS to be enabled in both the driver and the TCP stack (`netsh int tcp set global rss=enabled`).',
    recommended: {
      gaming: 'Enabled',
      streaming: 'Enabled',
      balanced: 'Enabled',
      maxperf: 'Enabled'
    }
  },

  '*RscIPv4': {
    friendlyName: 'Receive Segment Coalescing (IPv4)',
    category: 'advanced',
    safety: 'Moderate',
    whatItDoes: 'Receive Segment Coalescing (RSC) combines consecutive incoming TCP segments of a single flow into larger segments inside the network card hardware before passing them up to the operating system kernel.',
    whyRecommended: 'RSC lowers CPU utilization for large file downloads, but waiting to coalesce segments introduces microsecond packet delays that can destabilize tick rates in competitive gaming. WireTune disables RSC for Gaming and enables it for Streaming/Balanced.',
    benefits: 'Reduces CPU overhead on multi-gigabit download transfers when enabled. Eliminates segment coalescing queuing jitter when disabled.',
    downsides: 'Disabling slightly raises CPU overhead during sustained multi-gigabit downloads (>1 Gbps).',
    hardwareNotes: 'Hardware feature found in Intel I210/I219/I225/I226 and Realtek 2.5G adapters. Has separate IPv4 and IPv6 toggles.',
    recommended: {
      gaming: 'Disabled',
      streaming: 'Enabled',
      balanced: 'Enabled',
      maxperf: 'Enabled'
    }
  },

  '*RscIPv6': {
    friendlyName: 'Receive Segment Coalescing (IPv6)',
    category: 'advanced',
    safety: 'Moderate',
    whatItDoes: 'Hardware segment coalescing for incoming IPv6 network flows.',
    whyRecommended: 'Same principles as IPv4: disabled for minimal gaming jitter; enabled for maximum streaming throughput efficiency.',
    benefits: 'Protects CPU cycles during massive IPv6 data transfers when enabled; optimizes real-time packet cadence when disabled.',
    downsides: 'Marginal CPU load increase for large IPv6 file downloads when disabled.',
    hardwareNotes: 'Follows adapter driver RSC IPv4 support.',
    recommended: {
      gaming: 'Disabled',
      streaming: 'Enabled',
      balanced: 'Enabled',
      maxperf: 'Enabled'
    }
  },

  '*LsoV2IPv4': {
    friendlyName: 'Large Send Offload v2 (IPv4)',
    category: 'offloads',
    safety: 'Moderate',
    whatItDoes: 'Large Send Offload (LSO) allows the OS TCP/IP stack to build giant TCP packets (up to 64 KB) and offloads the task of segmenting them into MTU-sized Ethernet frames to the network card silicon.',
    whyRecommended: 'While LSO reduces CPU load during massive uploads, certain router firmwares and software firewalls can mishandle segmentation offloads, causing packet retransmissions and jitter bursts. WireTune recommends disabling LSO for Gaming and enabling it for high-throughput Streaming.',
    benefits: 'Disabling avoids outbound driver queuing delays and eliminates router segmentation bugs. Enabling frees CPU cycles for heavy uploads and broadcasting.',
    downsides: 'Disabling increases CPU utilization during outbound data uploads.',
    hardwareNotes: 'Commonly supported on modern Ethernet adapters. Some older virtual adapters or VPN taps have buggy LSO implementations.',
    recommended: {
      gaming: 'Disabled',
      streaming: 'Enabled',
      balanced: 'Enabled',
      maxperf: 'Enabled'
    }
  },

  '*LsoV2IPv6': {
    friendlyName: 'Large Send Offload v2 (IPv6)',
    category: 'offloads',
    safety: 'Moderate',
    whatItDoes: 'Hardware segmentation offload for outbound IPv6 network traffic.',
    whyRecommended: 'Ensures uniform packet delivery behavior across IPv6 connections.',
    benefits: 'Prevents segmentation anomalies when disabled; optimizes CPU usage during heavy outbound transfers when enabled.',
    downsides: 'Slightly higher CPU utilization during IPv6 uploads when disabled.',
    hardwareNotes: 'Standard feature on modern NIC drivers.',
    recommended: {
      gaming: 'Disabled',
      streaming: 'Enabled',
      balanced: 'Enabled',
      maxperf: 'Enabled'
    }
  },

  '*IPChecksumOffloadIPv4': {
    friendlyName: 'IPv4 Checksum Offload',
    category: 'offloads',
    safety: 'Safe',
    whatItDoes: 'Instructs the network adapter silicon to calculate and verify IPv4 packet header checksums directly on the card rather than computing them in CPU software.',
    whyRecommended: 'Dedicated silicon performs checksum calculation at wire speed with zero CPU overhead and zero latency penalty. Recommended enabled across all profiles.',
    benefits: 'Completely free hardware acceleration, lower CPU usage, zero latency cost.',
    downsides: 'None on modern hardware. Extremely rare bug in 15+ year old legacy NICs.',
    hardwareNotes: 'Universally supported by all modern network adapters.',
    recommended: {
      gaming: 'Rx & Tx Enabled',
      streaming: 'Rx & Tx Enabled',
      balanced: 'Rx & Tx Enabled',
      maxperf: 'Rx & Tx Enabled'
    }
  },

  '*TCPChecksumOffloadIPv4': {
    friendlyName: 'TCP Checksum Offload (IPv4)',
    category: 'offloads',
    safety: 'Safe',
    whatItDoes: 'Hardware silicon validates and generates TCP checksums for inbound and outbound packets.',
    whyRecommended: 'Hardware checksum verification is instant and frees CPU registers for your active applications.',
    benefits: 'Accelerates TCP processing and reduces CPU execution load.',
    downsides: 'None on functioning hardware.',
    hardwareNotes: 'Standard feature across all Ethernet and Wi-Fi drivers.',
    recommended: {
      gaming: 'Rx & Tx Enabled',
      streaming: 'Rx & Tx Enabled',
      balanced: 'Rx & Tx Enabled',
      maxperf: 'Rx & Tx Enabled'
    }
  },

  '*UDPChecksumOffloadIPv4': {
    friendlyName: 'UDP Checksum Offload (IPv4)',
    category: 'offloads',
    safety: 'Safe',
    whatItDoes: 'Hardware silicon calculates and checks UDP checksums for real-time traffic (games, voice chat, video calls, DNS).',
    whyRecommended: 'UDP is the primary transport protocol for low-latency online gaming and VoIP. Offloading checksum calculations to dedicated hardware silicon accelerates UDP packet handling.',
    benefits: 'Reduces CPU overhead for real-time multiplayer games, Discord, and streaming.',
    downsides: 'None on modern hardware.',
    hardwareNotes: 'Supported across all modern network controllers.',
    recommended: {
      gaming: 'Rx & Tx Enabled',
      streaming: 'Rx & Tx Enabled',
      balanced: 'Rx & Tx Enabled',
      maxperf: 'Rx & Tx Enabled'
    }
  },

  '*JumboPacket': {
    friendlyName: 'Jumbo Frames / Jumbo Packet',
    category: 'advanced',
    safety: 'Advanced',
    whatItDoes: 'Increases Ethernet maximum transmission unit (MTU) frame payload size from the standard 1500 bytes up to 9000 bytes (9K).',
    whyRecommended: 'Standard consumer internet providers and home routers strictly require standard 1500-byte MTU frames. Enabling Jumbo Frames on internet-facing adapters causes severe packet fragmentation and broken web connectivity. WireTune strictly recommends Disabled (1500 MTU) for general internet use.',
    benefits: 'High throughput for direct local NAS storage transfers over dedicated 10G LANs supporting 9K frames.',
    downsides: 'Enabling on standard internet connections causes packet drops, broken websites, and inability to load HTTPS services.',
    hardwareNotes: 'Requires end-to-end switch, router, and target device support to function without fragmentation.',
    recommended: {
      gaming: 'Disabled',
      streaming: 'Disabled',
      balanced: 'Disabled',
      maxperf: 'Disabled'
    }
  },

  '*SpeedDuplex': {
    friendlyName: 'Speed & Duplex',
    category: 'advanced',
    safety: 'Safe',
    whatItDoes: 'Controls the physical link negotiation protocol (Auto Negotiation vs Forced 1.0 Gbps / 2.5 Gbps Full Duplex).',
    whyRecommended: 'Auto Negotiation is the official IEEE standard and negotiates the optimal supported speed with your switch or router. Manually forcing a speed without matching switch configuration can disable link negotiation and drop the link completely.',
    benefits: 'Auto Negotiation ensures maximum compatibility with all routers, switches, and patch cables.',
    downsides: 'Forcing an incompatible speed setting will cause complete loss of network connectivity.',
    hardwareNotes: 'Standard across all Ethernet adapters.',
    recommended: {
      gaming: 'Auto Negotiation',
      streaming: 'Auto Negotiation',
      balanced: 'Auto Negotiation',
      maxperf: 'Auto Negotiation'
    }
  }
};

function getPropertyMeta(nameOrKeyword) {
  let found = null;
  if (PROPERTY_METADATA[nameOrKeyword]) {
    found = PROPERTY_METADATA[nameOrKeyword];
  } else {
    // Keyword match
    for (const [key, meta] of Object.entries(PROPERTY_METADATA)) {
      if (nameOrKeyword.toLowerCase().includes(key.replace('*', '').toLowerCase()) ||
          nameOrKeyword.toLowerCase().includes(meta.friendlyName.toLowerCase())) {
        found = meta;
        break;
      }
    }
  }

  if (!found) {
    found = {
      friendlyName: nameOrKeyword,
      category: 'advanced',
      safety: 'Safe',
      whatItDoes: 'Hardware driver advanced property for network adapter configuration.',
      whyRecommended: 'WireTune manages this property based on manufacturer default guidelines.',
      benefits: 'Adjusts manufacturer-specific hardware behavior.',
      downsides: 'Varies by network controller hardware implementation.',
      hardwareNotes: 'Specific to this adapter driver and chipset model.',
      recommended: {
        gaming: null,
        streaming: null,
        balanced: null,
        maxperf: null
      }
    };
  }

  return {
    ...found,
    impact: found.impact || found.benefits || 'Hardware parameter adjustment.',
    downside: found.downside || found.downsides || 'Hardware dependent.'
  };
}

module.exports = {
  PROPERTY_METADATA,
  getPropertyMeta
};
