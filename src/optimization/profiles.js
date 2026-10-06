/**
 * Profile definitions for WireTune
 * Specifies desired values for properties per profile.
 */

const PROFILES = {
  balanced: {
    id: 'balanced',
    nameKey: 'profileBalanced',
    descKey: 'profileBalancedDesc',
    properties: {
      '*InterruptModeration': 'Enabled',
      '*FlowControl': 'Rx & Tx Enabled',
      '*ReceiveBuffers': '1024',
      '*TransmitBuffers': '1024',
      '*EEE': 'Disabled',
      'AdvancedEEE': 'Disabled',
      'EnableGreenEthernet': 'Disabled',
      'PowerSavingMode': 'Disabled',
      '*RSS': 'Enabled',
      '*IPChecksumOffloadIPv4': 'Rx & Tx Enabled',
      '*TCPChecksumOffloadIPv4': 'Rx & Tx Enabled',
      '*UDPChecksumOffloadIPv4': 'Rx & Tx Enabled'
    },
    tcp: {
      autoTuning: 'Normal',
      scalingHeuristics: 'Disabled',
      ecnCapability: 'Disabled',
      congestionProvider: 'CUBIC'
    }
  },

  gaming: {
    id: 'gaming',
    nameKey: 'profileGaming',
    descKey: 'profileGamingDesc',
    properties: {
      '*InterruptModeration': 'Disabled', // Instant packet notification, lower jitter
      '*FlowControl': 'Disabled', // No pause frames causing frame drops
      '*ReceiveBuffers': '1024',
      '*TransmitBuffers': '1024',
      '*EEE': 'Disabled',
      'AdvancedEEE': 'Disabled',
      'EnableGreenEthernet': 'Disabled',
      'PowerSavingMode': 'Disabled',
      'GigaLite': 'Disabled',
      '*RSS': 'Enabled',
      '*LsoV2IPv4': 'Disabled', // Minimize packet queuing latency
      '*LsoV2IPv6': 'Disabled',
      '*RscIPv4': 'Disabled',
      '*RscIPv6': 'Disabled',
      '*IPChecksumOffloadIPv4': 'Rx & Tx Enabled',
      '*TCPChecksumOffloadIPv4': 'Rx & Tx Enabled',
      '*UDPChecksumOffloadIPv4': 'Rx & Tx Enabled'
    },
    tcp: {
      autoTuning: 'Normal',
      scalingHeuristics: 'Disabled',
      ecnCapability: 'Disabled',
      congestionProvider: 'CUBIC'
    }
  },

  streaming: {
    id: 'streaming',
    nameKey: 'profileStreaming',
    descKey: 'profileStreamingDesc',
    properties: {
      '*InterruptModeration': 'Enabled', // Smooth queuing
      '*FlowControl': 'Rx & Tx Enabled',
      '*ReceiveBuffers': '2048', // High buffer capacity
      '*TransmitBuffers': '2048',
      '*EEE': 'Disabled',
      'AdvancedEEE': 'Disabled',
      'EnableGreenEthernet': 'Disabled',
      'PowerSavingMode': 'Disabled',
      '*RSS': 'Enabled',
      '*LsoV2IPv4': 'Enabled',
      '*LsoV2IPv6': 'Enabled',
      '*RscIPv4': 'Enabled',
      '*RscIPv6': 'Enabled',
      '*IPChecksumOffloadIPv4': 'Rx & Tx Enabled',
      '*TCPChecksumOffloadIPv4': 'Rx & Tx Enabled',
      '*UDPChecksumOffloadIPv4': 'Rx & Tx Enabled'
    },
    tcp: {
      autoTuning: 'Normal',
      scalingHeuristics: 'Disabled',
      ecnCapability: 'Enabled',
      congestionProvider: 'CUBIC'
    }
  },

  maxperf: {
    id: 'maxperf',
    nameKey: 'profileMaxPerf',
    descKey: 'profileMaxPerfDesc',
    properties: {
      '*InterruptModeration': 'Disabled',
      '*FlowControl': 'Disabled',
      '*ReceiveBuffers': '2048',
      '*TransmitBuffers': '2048',
      '*EEE': 'Disabled',
      'AdvancedEEE': 'Disabled',
      'EnableGreenEthernet': 'Disabled',
      'PowerSavingMode': 'Disabled',
      'GigaLite': 'Disabled',
      '*RSS': 'Enabled',
      '*LsoV2IPv4': 'Enabled',
      '*LsoV2IPv6': 'Enabled',
      '*RscIPv4': 'Enabled',
      '*RscIPv6': 'Enabled',
      '*IPChecksumOffloadIPv4': 'Rx & Tx Enabled',
      '*TCPChecksumOffloadIPv4': 'Rx & Tx Enabled',
      '*UDPChecksumOffloadIPv4': 'Rx & Tx Enabled'
    },
    tcp: {
      autoTuning: 'Normal',
      scalingHeuristics: 'Disabled',
      ecnCapability: 'Disabled',
      congestionProvider: 'CUBIC'
    }
  },

  custom: {
    id: 'custom',
    nameKey: 'profileCustom',
    descKey: 'profileCustomDesc',
    properties: {},
    tcp: {}
  }
};

module.exports = PROFILES;
