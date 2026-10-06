const dns = require('dns').promises;
const { performance } = require('perf_hooks');
const PowerShell = require('../platform/windows/powershell');
const logger = require('../core/logger');

const POPULAR_RESOLVERS = [
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    primary: '1.1.1.1',
    secondary: '1.0.0.1',
    features: 'Ultra-fast • Strict Privacy • No Logging',
    tag: 'Fastest'
  },
  {
    id: 'google',
    name: 'Google Public DNS',
    primary: '8.8.8.8',
    secondary: '8.8.4.4',
    features: 'Global Anycast • High Reliability • Anycast Routing',
    tag: 'Popular'
  },
  {
    id: 'quad9',
    name: 'Quad9',
    primary: '9.9.9.9',
    secondary: '149.112.112.112',
    features: 'Malware & Threat Blocking • Privacy-focused',
    tag: 'Secure'
  },
  {
    id: 'opendns',
    name: 'Cisco OpenDNS',
    primary: '208.67.222.222',
    secondary: '208.67.220.220',
    features: 'Enterprise Caching • Family Shield Support',
    tag: 'Stable'
  },
  {
    id: 'adguard',
    name: 'AdGuard DNS',
    primary: '94.140.14.14',
    secondary: '94.140.15.15',
    features: 'Built-in Ad & Tracker Filtering',
    tag: 'Ad-Block'
  },
  {
    id: 'controld',
    name: 'Control D',
    primary: '76.76.2.0',
    secondary: '76.76.10.0',
    features: 'High-Performance Anycast • Uncensored',
    tag: 'Fast'
  },
  {
    id: 'cleanbrowsing',
    name: 'CleanBrowsing',
    primary: '185.228.168.9',
    secondary: '185.228.169.9',
    features: 'Security Filter • Phishing Protection',
    tag: 'Filtered'
  }
];

const TEST_DOMAINS = [
  'google.com',
  'cloudflare.com',
  'wikipedia.org',
  'github.com',
  'microsoft.com'
];

class DnsBenchmark {
  /**
   * Query currently configured DNS servers for adapter
   */
  static async getCurrentDns(adapterName) {
    if (process.platform === 'win32' && adapterName) {
      try {
        const escaped = adapterName.replace(/'/g, "''");
        const ps = `Get-DnsClientServerAddress -InterfaceAlias '${escaped}' -AddressFamily IPv4 | Select-Object -ExpandProperty ServerAddresses`;
        const res = await PowerShell.run(ps);
        if (res.success && res.stdout) {
          const lines = res.stdout.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
          if (lines.length > 0) {
            return {
              primary: lines[0],
              secondary: lines[1] || lines[0],
              servers: lines
            };
          }
        }
      } catch (e) {
        logger.debug('DNS', 'Failed to read adapter DNS via PowerShell', e.message);
      }
    }

    try {
      const servers = require('dns').getServers();
      if (servers && servers.length > 0) {
        return {
          primary: servers[0],
          secondary: servers[1] || servers[0],
          servers
        };
      }
    } catch (e) {}

    return { primary: 'Auto (DHCP)', secondary: 'Auto (DHCP)', servers: [] };
  }

  /**
   * Run benchmark across all public resolvers + current system DNS
   */
  static async runBenchmark(adapterName) {
    const currentDns = await this.getCurrentDns(adapterName);
    const listToTest = [];

    // Add Current DNS as first item
    if (currentDns.primary && currentDns.primary !== 'Auto (DHCP)') {
      listToTest.push({
        id: 'current',
        name: 'Current System DNS',
        primary: currentDns.primary,
        secondary: currentDns.secondary,
        features: 'Currently assigned resolver',
        tag: 'Current',
        isCurrent: true
      });
    }

    // Add public resolvers
    POPULAR_RESOLVERS.forEach(r => {
      // Check if this public resolver is current
      const isCurrent = currentDns.primary === r.primary;
      listToTest.push({
        ...r,
        isCurrent: isCurrent || false
      });
    });

    const results = [];

    for (const resolverItem of listToTest) {
      const testResult = await this.testSingleResolver(resolverItem.primary);
      results.push({
        ...resolverItem,
        ...testResult
      });
    }

    // Sort: 100% reliability first, then lowest average latency
    results.sort((a, b) => {
      if (b.reliability !== a.reliability) {
        return b.reliability - a.reliability;
      }
      return a.avgLatency - b.avgLatency;
    });

    // Mark fastest
    if (results.length > 0 && results[0].reliability > 0) {
      results[0].isFastest = true;
    }

    return {
      adapterName,
      testedAt: new Date().toISOString(),
      currentDns,
      resolvers: results
    };
  }

  /**
   * Test a single DNS server IP across test domains
   */
  static async testSingleResolver(serverIp) {
    if (!serverIp || serverIp === 'Auto (DHCP)') {
      return {
        avgLatency: 999,
        minLatency: 999,
        maxLatency: 999,
        jitter: 0,
        reliability: 0,
        status: 'offline',
        details: []
      };
    }

    const resolver = new dns.Resolver({ timeout: 2000, tries: 1 });
    try {
      resolver.setServers([serverIp]);
    } catch (e) {
      return {
        avgLatency: 999,
        minLatency: 999,
        maxLatency: 999,
        jitter: 0,
        reliability: 0,
        status: 'invalid',
        details: []
      };
    }

    const latencies = [];
    const details = [];

    for (const domain of TEST_DOMAINS) {
      const start = performance.now();
      try {
        await resolver.resolve4(domain);
        const duration = Math.round((performance.now() - start) * 10) / 10;
        latencies.push(duration);
        details.push({ domain, success: true, latency: duration });
      } catch (err) {
        details.push({ domain, success: false, error: err.code || err.message });
      }
    }

    if (latencies.length === 0) {
      return {
        avgLatency: 999,
        minLatency: 999,
        maxLatency: 999,
        jitter: 0,
        reliability: 0,
        status: 'offline',
        details
      };
    }

    const minLatency = Math.min(...latencies);
    const maxLatency = Math.max(...latencies);
    const avgLatency = Math.round((latencies.reduce((a, b) => a + b, 0) / latencies.length) * 10) / 10;
    
    // Calculate jitter
    let jitter = 0;
    if (latencies.length > 1) {
      let diffSum = 0;
      for (let i = 1; i < latencies.length; i++) {
        diffSum += Math.abs(latencies[i] - latencies[i - 1]);
      }
      jitter = Math.round((diffSum / (latencies.length - 1)) * 10) / 10;
    }

    const reliability = Math.round((latencies.length / TEST_DOMAINS.length) * 100);

    let status = 'optimal';
    if (reliability < 100) {
      status = 'degraded';
    } else if (avgLatency > 100) {
      status = 'slow';
    } else if (avgLatency > 40) {
      status = 'good';
    }

    return {
      avgLatency,
      minLatency,
      maxLatency,
      jitter,
      reliability,
      status,
      details
    };
  }

  /**
   * Apply selected DNS to Windows network adapter (Requires user consent)
   */
  static async applyDns(adapterName, primaryDns, secondaryDns) {
    if (!adapterName) {
      return { success: false, error: 'No adapter specified' };
    }
    if (!primaryDns) {
      return { success: false, error: 'Primary DNS required' };
    }

    const sec = secondaryDns && secondaryDns !== primaryDns ? secondaryDns : primaryDns;
    
    if (process.platform === 'win32') {
      try {
        const escaped = adapterName.replace(/'/g, "''");
        const ps = `Set-DnsClientServerAddress -InterfaceAlias '${escaped}' -ServerAddresses @('${primaryDns}', '${sec}'); Clear-DnsClientCache`;
        const res = await PowerShell.run(ps);
        if (!res.success) {
          return { success: false, error: res.error || 'Failed to apply DNS' };
        }
        logger.info('DNS', `Applied DNS to ${adapterName}: ${primaryDns}, ${sec}`);
        return {
          success: true,
          message: `DNS set to ${primaryDns} / ${sec}`,
          primary: primaryDns,
          secondary: sec
        };
      } catch (err) {
        logger.error('DNS', `Error applying DNS: ${err.message}`);
        return { success: false, error: err.message };
      }
    }

    return { success: false, error: 'Applying DNS is currently only supported on Windows' };
  }

  /**
   * Reset adapter DNS to automatic (DHCP)
   */
  static async resetDns(adapterName) {
    if (!adapterName) {
      return { success: false, error: 'No adapter specified' };
    }

    if (process.platform === 'win32') {
      try {
        const escaped = adapterName.replace(/'/g, "''");
        const ps = `Set-DnsClientServerAddress -InterfaceAlias '${escaped}' -ResetServerAddresses; Clear-DnsClientCache`;
        const res = await PowerShell.run(ps);
        if (!res.success) {
          return { success: false, error: res.error || 'Failed to reset DNS' };
        }
        logger.info('DNS', `Reset DNS to automatic (DHCP) on ${adapterName}`);
        return {
          success: true,
          message: 'DNS successfully reset to automatic (DHCP)'
        };
      } catch (err) {
        logger.error('DNS', `Error resetting DNS: ${err.message}`);
        return { success: false, error: err.message };
      }
    }

    return { success: false, error: 'Resetting DNS is currently only supported on Windows' };
  }
}

module.exports = DnsBenchmark;
