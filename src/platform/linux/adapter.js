/**
 * Linux platform adapter implementation (modular architecture)
 * Uses ethtool, ip, and sysctl when running on Linux systems
 */
const logger = require('../../core/logger');

class LinuxAdapter {
  static async getAdapters() {
    logger.info('Platform', 'Linux adapter detection invoked');
    // Placeholder architecture for Linux ethtool / sysctl implementation
    return [
      {
        id: 'eth0',
        name: 'eth0',
        description: 'Native Linux Ethernet Interface',
        status: 'Up',
        connected: true,
        linkSpeed: '1 Gbps',
        mediaType: '802.3',
        isWifi: false,
        signal: null,
        macAddress: '00:00:00:00:00:00',
        driverVersion: 'Linux kernel',
        platformNote: 'Linux support is modular and planned for future release'
      }
    ];
  }

  static async getAdvancedProperties(adapterName) {
    return [
      {
        name: 'Ring Buffer (rx)',
        keyword: 'rx_ring',
        currentValue: '1024',
        validValues: ['512', '1024', '2048', '4096'],
        isNumeric: true
      },
      {
        name: 'TCP BBR Congestion Control',
        keyword: 'net.ipv4.tcp_congestion_control',
        currentValue: 'bbr',
        validValues: ['cubic', 'bbr', 'reno'],
        isNumeric: false
      }
    ];
  }

  static async setAdvancedProperty(adapterName, keyword, displayName, newValue) {
    return {
      success: false,
      error: 'Direct hardware modification on Linux will be available in WireTune v1.1.0'
    };
  }
}

module.exports = LinuxAdapter;
