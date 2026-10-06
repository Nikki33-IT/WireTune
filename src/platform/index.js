const os = require('os');
const WindowsAdapter = require('./windows/adapter');
const WindowsTCP = require('./windows/tcp');
const WindowsAdmin = require('./windows/admin');
const LinuxAdapter = require('./linux/adapter');
const logger = require('../core/logger');

const isWin = process.platform === 'win32';
const isLinux = process.platform === 'linux';

class PlatformBridge {
  static getPlatformInfo() {
    return {
      platform: process.platform,
      isWindows: isWin,
      isLinux: isLinux,
      osType: os.type(),
      osRelease: os.release(),
      arch: os.arch(),
      hostname: os.hostname(),
      uptime: os.uptime()
    };
  }

  static async isAdmin() {
    if (isWin) {
      return WindowsAdmin.checkIsAdmin();
    }
    // On Unix, check if uid is 0
    return process.getuid ? process.getuid() === 0 : false;
  }

  static async restartAsAdmin() {
    if (isWin) {
      return WindowsAdmin.restartAsAdmin();
    }
    return { success: false, error: 'Elevation only automated on Windows' };
  }

  static async getAdapters() {
    if (isWin) {
      return WindowsAdapter.getAdapters();
    }
    if (isLinux) {
      return LinuxAdapter.getAdapters();
    }
    return [];
  }

  static async getAdvancedProperties(adapterName) {
    if (isWin) {
      return WindowsAdapter.getAdvancedProperties(adapterName);
    }
    if (isLinux) {
      return LinuxAdapter.getAdvancedProperties(adapterName);
    }
    return [];
  }

  static async setAdvancedProperty(adapterName, keyword, displayName, newValue) {
    if (isWin) {
      return WindowsAdapter.setAdvancedProperty(adapterName, keyword, displayName, newValue);
    }
    if (isLinux) {
      return LinuxAdapter.setAdvancedProperty(adapterName, keyword, displayName, newValue);
    }
    return { success: false, error: 'Unsupported platform' };
  }

  static async getTcpSettings() {
    if (isWin) {
      return WindowsTCP.getTcpSettings();
    }
    return {
      autoTuning: 'Normal',
      scalingHeuristics: 'Disabled',
      ecnCapability: 'Disabled',
      congestionProvider: 'CUBIC'
    };
  }

  static async setTcpSetting(key, val) {
    if (isWin) {
      return WindowsTCP.setTcpSetting(key, val);
    }
    return { success: false, error: 'TCP tuning only supported on Windows in this release' };
  }

  static async resetAdapter(adapterName) {
    if (isWin) {
      return WindowsAdapter.resetAdapter(adapterName);
    }
    return { success: false, error: 'Reset only supported on Windows' };
  }
}

module.exports = PlatformBridge;
