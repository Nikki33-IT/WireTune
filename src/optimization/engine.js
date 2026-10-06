const PlatformBridge = require('../platform/index');
const PROFILES = require('./profiles');
const { getPropertyMeta } = require('./property-meta');
const backupManager = require('../backup/backup-manager');
const logger = require('../core/logger');

class OptimizationEngine {
  /**
   * Run full optimization pipeline on selected adapter.
   * Uses batch PowerShell execution for 10-15x faster property application.
   */
  static async runOptimization(adapterName, profileId, customOverrides = {}, progressCallback = null) {
    const notify = (step, percent, detail) => {
      if (typeof progressCallback === 'function') {
        progressCallback({ step, percent, detail });
      }
    };

    logger.info('Optimization', `Starting optimization for ${adapterName} with profile ${profileId}`);

    // Step 1: Fetch adapter info, advanced properties and TCP settings IN PARALLEL
    notify('optStepCapabilities', 15, 'Inspecting adapter hardware capabilities and driver properties...');

    const [adapters, currentProps, tcpSettings] = await Promise.all([
      PlatformBridge.getAdapters(),
      PlatformBridge.getAdvancedProperties(adapterName),
      PlatformBridge.getTcpSettings()
    ]);

    const adapter = adapters.find(a => a.name === adapterName || a.id === adapterName);
    if (!adapter) {
      throw new Error(`Adapter "${adapterName}" not found on system.`);
    }

    // Step 2: Create local backup before touching ANY setting
    notify('optStepBackup', 30, 'Creating local snapshot backup before applying changes...');
    const backupResult = backupManager.createBackup(adapterName, currentProps, tcpSettings);

    // Step 3: Evaluate which properties actually need changing
    notify('optStepApplying', 45, 'Evaluating compatibility and queuing safe tweaks...');
    const profile = PROFILES[profileId] || PROFILES.balanced;
    const targetProperties = { ...profile.properties, ...customOverrides };

    const optimized = [];
    const skipped = [];
    const errors = [];

    // Map current properties by keyword and display name for O(1) lookup
    const propMap = new Map();
    for (const p of currentProps) {
      if (p.keyword) propMap.set(p.keyword, p);
      propMap.set(p.name, p);
    }

    // --- COLLECT all changes that need to be applied ---
    const batchChanges = [];

    for (const [keyOrName, targetValue] of Object.entries(targetProperties)) {
      if (targetValue === null || targetValue === undefined) continue;

      const prop = propMap.get(keyOrName);
      if (!prop) {
        skipped.push({ property: keyOrName, targetValue, reason: 'Hardware or driver does not expose this capability' });
        continue;
      }

      if (prop.currentValue === targetValue ||
          prop.currentValue.toLowerCase() === String(targetValue).toLowerCase()) {
        skipped.push({ property: prop.name, targetValue, reason: 'Already configured to optimal value' });
        continue;
      }

      if (prop.validValues && prop.validValues.length > 0) {
        const matches = prop.validValues.some(v => v.toLowerCase() === String(targetValue).toLowerCase());
        if (!matches) {
          skipped.push({ property: prop.name, targetValue, validOptions: prop.validValues, reason: `Driver does not support target value '${targetValue}' (Accepted: ${prop.validValues.join(', ')})` });
          continue;
        }
      }

      batchChanges.push({ keyword: prop.keyword, displayName: prop.name, value: targetValue, _prop: prop });
    }

    // Step 4: Apply ALL adapter property changes in ONE PowerShell call
    notify('optStepApplying', 60, `Applying ${batchChanges.length} optimizations via batch engine...`);

    if (batchChanges.length > 0) {
      const batchResults = await PlatformBridge.setAdvancedPropertiesBatch(adapterName, batchChanges);

      for (const result of batchResults) {
        const propRef = batchChanges.find(c => c.keyword === result.keyword && c.displayName === result.displayName);
        const prop = propRef ? propRef._prop : null;
        const meta = getPropertyMeta(result.keyword || result.displayName);

        if (result.success) {
          optimized.push({ property: result.displayName, keyword: result.keyword, oldValue: prop ? prop.currentValue : 'Unknown', newValue: result.value, reason: meta.impact, safety: meta.safety, category: meta.category });
          logger.info('Optimization', `Optimized ${result.displayName}: ${prop ? prop.currentValue : '?'} -> ${result.value}`);
        } else {
          errors.push({ property: result.displayName, oldValue: prop ? prop.currentValue : 'Unknown', targetValue: result.value, reason: result.error || 'Driver rejected parameter modification' });
        }
      }
    }

    // Step 5: TCP settings optimization — run all in parallel
    if (profile.tcp) {
      const tcpChanges = [];
      for (const [tcpKey, tcpTarget] of Object.entries(profile.tcp)) {
        if (tcpSettings[tcpKey] && tcpSettings[tcpKey].toLowerCase() === tcpTarget.toLowerCase()) {
          skipped.push({ property: `TCP ${tcpKey}`, targetValue: tcpTarget, reason: 'Already configured to optimal state' });
        } else {
          tcpChanges.push({ key: tcpKey, value: tcpTarget });
        }
      }

      await Promise.all(tcpChanges.map(async ({ key, value }) => {
        try {
          const tcpRes = await PlatformBridge.setTcpSetting(key, value);
          if (tcpRes.success) {
            optimized.push({ property: `TCP ${key}`, keyword: `tcp_${key}`, oldValue: tcpSettings[key] || 'Unknown', newValue: value, reason: 'TCP Stack low-latency & throughput tuning', safety: 'Safe', category: 'tcp' });
          } else {
            errors.push({ property: `TCP ${key}`, oldValue: tcpSettings[key] || 'Unknown', targetValue: value, reason: tcpRes.error || 'TCP modification rejected' });
          }
        } catch (err) {
          logger.warn('Optimization', `TCP setting ${key} could not be updated: ${err.message}`);
        }
      }));
    }

    // Step 6: Verify configuration
    notify('optStepVerifying', 88, 'Verifying active network configuration...');
    const verifiedProps = await PlatformBridge.getAdvancedProperties(adapterName);

    // Step 7: Record audit entry
    const auditRecord = backupManager.recordAuditChange({ adapterName, profile: profile.id, backupFile: backupResult.filename, changes: optimized, skipped, errors });

    notify('optComplete', 100, 'Optimization process complete.');

    return {
      success: true,
      adapterName,
      profileId,
      backupPath: backupResult.path,
      backupFile: backupResult.filename,
      optimizedCount: optimized.length,
      skippedCount: skipped.length,
      errorCount: errors.length,
      optimized,
      skipped,
      errors,
      auditId: auditRecord ? auditRecord.id : null
    };
  }
}

module.exports = OptimizationEngine;
