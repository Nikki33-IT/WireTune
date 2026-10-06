const { exec } = require('child_process');
const PlatformBridge = require('../platform/index');
const PowerShell = require('../platform/windows/powershell');
const logger = require('../core/logger');

class PingTester {
  /**
   * Find default gateway IP address on Windows
   */
  static async getDefaultGateway() {
    if (process.platform === 'win32') {
      const res = await PowerShell.runJson(
        `Get-NetRoute -DestinationPrefix '0.0.0.0/0' -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty NextHop`
      );
      if (res.success && res.data) {
        return typeof res.data === 'string' ? res.data : '127.0.0.1';
      }
    }
    return '127.0.0.1';
  }

  /**
   * Run latency & packet loss test
   */
  static async runTest(targetIp = null, adapterName = null) {
    const target = targetIp || (await this.getDefaultGateway());
    logger.info('Diagnostics', `Running ping test against target: ${target}`);

    // Get current link speed if adapterName provided
    let linkSpeed = 'Unknown';
    if (adapterName) {
      try {
        const adapters = await PlatformBridge.getAdapters();
        const found = adapters.find(a => a.name === adapterName || a.id === adapterName);
        if (found) {
          linkSpeed = found.linkSpeed;
        }
      } catch (err) {
        logger.debug('Diagnostics', 'Could not query link speed', err.message);
      }
    }

    return new Promise((resolve) => {
      // 4 packets ping test
      const pingCmd = process.platform === 'win32'
        ? `ping -n 4 -w 1000 ${target}`
        : `ping -c 4 -W 1 ${target}`;

      exec(pingCmd, (error, stdout) => {
        const output = stdout || '';

        // Extract packet loss
        let packetLoss = 0;
        const lossMatch = output.match(/(\d+)%\s*(loss|utraty|verlust)/i);
        if (lossMatch) {
          packetLoss = parseInt(lossMatch[1], 10);
        }

        // Extract latency (Average)
        let latency = 0;
        const avgMatch = output.match(/(Average|Średnia|Mittelwert)\s*=\s*(\d+)\s*ms/i);
        if (avgMatch) {
          latency = parseInt(avgMatch[2], 10);
        } else {
          // Alternative regex for times: time=12ms or czas=12ms
          const times = [...output.matchAll(/(?:time|czas)[<=](\d+)\s*ms/gi)].map(m => parseInt(m[1], 10));
          if (times.length > 0) {
            latency = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
          } else if (target === '127.0.0.1') {
            latency = 1;
          }
        }

        resolve({
          success: true,
          target,
          latencyMs: latency,
          packetLossPercent: packetLoss,
          linkSpeed: linkSpeed,
          rawOutput: output
        });
      });
    });
  }

  /**
   * Compare Before and After results honestly
   */
  static compare(before, after) {
    if (!before || !after) return null;

    const latencyDiff = before.latencyMs - after.latencyMs; // positive means improved
    const lossDiff = before.packetLossPercent - after.packetLossPercent;
    const hasImprovement = latencyDiff > 0 || lossDiff > 0;

    return {
      before: {
        latency: `${before.latencyMs} ms`,
        packetLoss: `${before.packetLossPercent}%`,
        linkSpeed: before.linkSpeed
      },
      after: {
        latency: `${after.latencyMs} ms`,
        packetLoss: `${after.packetLossPercent}%`,
        linkSpeed: after.linkSpeed
      },
      latencyDelta: latencyDiff,
      hasImprovement,
      summary: hasImprovement
        ? `Latency improved by ${latencyDiff} ms.`
        : 'No measurable improvement detected.'
    };
  }
}

module.exports = PingTester;
