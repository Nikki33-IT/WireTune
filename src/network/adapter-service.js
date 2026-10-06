const PlatformBridge = require('../platform/index');
const PROFILES = require('../optimization/profiles');
const { getPropertyMeta } = require('../optimization/property-meta');
const logger = require('../core/logger');

class AdapterService {
  /**
   * Get all adapters with health and optimization score
   */
  static async getAdaptersOverview() {
    const adapters = await PlatformBridge.getAdapters();
    const result = [];

    for (const adp of adapters) {
      let optimizationStatus = 'not_optimized'; // 'optimized', 'not_optimized', 'attention'
      let attentionReasons = [];
      let statusDetails = [];

      if (!adp.connected) {
        optimizationStatus = 'attention';
        attentionReasons.push('Adapter is currently disconnected');
      }

      // Check speed degradation
      if (adp.linkSpeed && (adp.linkSpeed.includes('10 Mbps') || adp.linkSpeed.includes('100 Mbps'))) {
        if (adp.description.includes('Gigabit') || adp.description.includes('GbE') || adp.description.includes('2.5GbE')) {
          optimizationStatus = 'attention';
          attentionReasons.push(`Link speed is throttled to ${adp.linkSpeed} on a Gigabit-capable adapter (check cable or negotiate settings)`);
        }
      }

      result.push({
        ...adp,
        optimizationStatus,
        attentionReasons,
        statusDetails
      });
    }

    return result;
  }

  /**
   * Evaluate detailed optimization state for a specific adapter against a profile
   */
  static async evaluateAdapterOptimization(adapterName, profileId = 'balanced') {
    const props = await PlatformBridge.getAdvancedProperties(adapterName);
    const profile = PROFILES[profileId] || PROFILES.balanced;
    const propMap = new Map();
    for (const p of props) {
      if (p.keyword) propMap.set(p.keyword, p);
      propMap.set(p.name, p);
    }

    let matching = 0;
    let mismatched = 0;
    let unsupported = 0;
    const details = [];

    for (const [keyOrName, targetVal] of Object.entries(profile.properties)) {
      const prop = propMap.get(keyOrName);
      const meta = getPropertyMeta(keyOrName);

      if (!prop) {
        unsupported++;
        details.push({
          name: meta.friendlyName || keyOrName,
          status: 'unsupported',
          current: 'Not Supported',
          target: targetVal,
          reason: 'Hardware/driver lacks this feature'
        });
        continue;
      }

      const isMatch = prop.currentValue.toLowerCase() === String(targetVal).toLowerCase();
      if (isMatch) {
        matching++;
        details.push({
          name: prop.name,
          status: 'optimized',
          current: prop.currentValue,
          target: targetVal
        });
      } else {
        mismatched++;
        details.push({
          name: prop.name,
          status: 'suboptimal',
          current: prop.currentValue,
          target: targetVal,
          reason: `Current: ${prop.currentValue}, Target: ${targetVal}`
        });
      }
    }

    // Determine status
    let status = 'not_optimized';
    let statusText = 'Not optimized';
    let color = 'yellow';

    if (mismatched === 0 && matching > 0) {
      status = 'optimized';
      statusText = 'Optimized';
      color = 'green';
    } else if (matching > mismatched) {
      status = 'partially_optimized';
      statusText = 'Partially optimized';
      color = 'yellow';
    }

    return {
      adapterName,
      profile: profileId,
      status,
      statusText,
      color,
      matchingCount: matching,
      mismatchedCount: mismatched,
      unsupportedCount: unsupported,
      details
    };
  }
}

module.exports = AdapterService;
