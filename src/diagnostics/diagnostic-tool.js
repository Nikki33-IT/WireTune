const os = require('os');
const { execSync } = require('child_process');
const logger = require('../core/logger');
const PlatformBridge = require('../platform/index');

class DiagnosticTool {
  static getSystemInfo() {
    let gitInfo = 'v1.0.0-release';
    try {
      gitInfo = execSync('git rev-parse --short HEAD', { encoding: 'utf8', timeout: 1000 }).trim();
    } catch (e) {
      // Offline / standalone release
    }

    return {
      appName: 'WireTune',
      version: '1.0.0',
      buildInfo: gitInfo ? `git-${gitInfo}` : 'stable',
      osType: os.type(),
      osRelease: os.release(),
      osPlatform: os.platform(),
      osVersion: os.version ? os.version() : os.release(),
      arch: os.arch(),
      cpus: os.cpus().length,
      cpuModel: os.cpus()[0]?.model || 'Unknown',
      totalMemoryMb: Math.round(os.totalmem() / 1024 / 1024),
      freeMemoryMb: Math.round(os.freemem() / 1024 / 1024),
      nodeVersion: process.version,
      uptimeHours: (os.uptime() / 3600).toFixed(1),
      privacyMode: 'Offline Strictly Local'
    };
  }

  static async generateDiagnosticReport() {
    const sys = this.getSystemInfo();
    const isAdmin = await PlatformBridge.isAdmin();
    const adapters = await PlatformBridge.getAdapters();
    const tcp = await PlatformBridge.getTcpSettings();
    const recentLogs = logger.getRecentLogs(50);

    return {
      generatedAt: new Date().toISOString(),
      system: sys,
      privileges: {
        isAdmin,
        mode: isAdmin ? 'Elevated (Read/Write)' : 'Standard User (Read-Only Preview)'
      },
      adapters,
      tcpSettings: tcp,
      recentLogs
    };
  }
}

module.exports = DiagnosticTool;
