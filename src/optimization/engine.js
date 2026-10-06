const PlatformBridge = require('../platform/index');
const PROFILES = require('./profiles');
const { getPropertyMeta } = require('./property-meta');
const backupManager = require('../backup/backup-manager');
const logger = require('../core/logger');

class OptimizationEngine {
  /**
   * Run full optimization pipeline on selected adapter
   */
  static async runOptimization(adapterName, profileId, customOverrides = {}, progressCallback = null) {
    const notify = (step, percent, detail) => {
      if (typeof progressCallback === 'function') {
        progressCallback({ step, percent, detail });
      }
    };

    logger.info('Optimization', `Starting optimization for ${adapterName} with profile ${profileId}`);

    // Step 1: Detect adapter capabilities & supported properties
    notify('optStepCapabilities', 20, 'Inspecting adapter hardware capabilities and driver properties...');
    const adapters = await PlatformBridge.getAdapters();
    const adapter = adapters.find(a => a.name === adapterName || a.id === adapterName);

    if (!adapter) {
      throw new Error(`Adapter "${adapterName}" not found on system.`);
    }

    const currentProps = await PlatformBridge.getAdvancedProperties(adapterName);
    const tcpSettings = await PlatformBridge.getTcpSettings();

    // Step 2: Create local backup before touching ANY setting
    notify('optStepBackup', 40, 'Creating local snapshot backup before applying changes...');
    const backupResult = backupManager.createBackup(adapterName, currentProps, tcpSettings);

    // Step 3: Match against chosen profile & check compatibility
    notify('optStepApplying', 60, 'Evaluating compatibility and applying safe tweaks...');
    const profile = PROFILES[profileId] || PROFILES.balanced;
    const targetProperties = { ...profile.properties, ...customOverrides };

    const optimized = [];
    const skipped = [];
    const errors = [];

    // Map current properties by keyword and display name
    const propMap = new Map();
    for (const p of currentProps) {
      if (p.keyword) propMap.set(p.keyword, p);
      propMap.set(p.name, p);
    }

    // Step 4: Apply compatible adapter properties safely
    for (const [keyOrName, targetValue] of Object.entries(targetProperties)) {
      if (targetValue === null || targetValue === undefined) continue;

      const prop = propMap.get(keyOrName);
      if (!prop) {
        // Property is NOT supported by this hardware adapter / driver!
        skipped.push({
          property: keyOrName,
          targetValue,
          reason: 'Hardware or driver does not expose this capability'
        });
        continue;
      }

      // Check if already set to target value
      if (prop.currentValue === targetValue || prop.currentValue.toLowerCase() === String(targetValue).toLowerCase()) {
        skipped.push({
          property: prop.name,
          targetValue,
          reason: 'Already configured to optimal value'
        });
        continue;
      }

      // Compatibility check: verify targetValue against ValidDisplayValues if available
      if (prop.validValues && prop.validValues.length > 0) {
        const matches = prop.validValues.some(v => v.toLowerCase() === String(targetValue).toLowerCase());
        if (!matches) {
          skipped.push({
            property: prop.name,
            targetValue,
            validOptions: prop.validValues,
            reason: `Driver does not support target value '${targetValue}' (Accepted: ${prop.validValues.join(', ')})`
          });
          continue;
        }
      }

      // Metadata & safety info
      const meta = getPropertyMeta(prop.keyword || prop.name);

      // Attempt applying the change
      try {
        const applyRes = await PlatformBridge.setAdvancedProperty(
          adapterName,
          prop.keyword,
          prop.name,
          targetValue
        );

        if (applyRes.success) {
          optimized.push({
            property: prop.name,
            keyword: prop.keyword,
            oldValue: prop.currentValue,
            newValue: targetValue,
            reason: meta.impact,
            safety: meta.safety,
            category: meta.category
          });
          logger.info('Optimization', `Optimized ${prop.name}: ${prop.currentValue} -> ${targetValue}`);
        } else {
          errors.push({
            property: prop.name,
            oldValue: prop.currentValue,
            targetValue,
            reason: applyRes.error || 'Driver rejected parameter modification'
          });
        }
      } catch (err) {
        errors.push({
          property: prop.name,
          oldValue: prop.currentValue,
          targetValue,
          reason: err.message
        });
      }
    }

    // Step 5: TCP settings optimization (if profile defines them)
    if (profile.tcp) {
      for (const [tcpKey, tcpTarget] of Object.entries(profile.tcp)) {
        if (tcpSettings[tcpKey] && tcpSettings[tcpKey].toLowerCase() === tcpTarget.toLowerCase()) {
          skipped.push({
            property: `TCP ${tcpKey}`,
            targetValue: tcpTarget,
            reason: 'Already configured to optimal state'
          });
          continue;
        }

        try {
          const tcpRes = await PlatformBridge.setTcpSetting(tcpKey, tcpTarget);
          if (tcpRes.success) {
            optimized.push({
              property: `TCP ${tcpKey}`,
              keyword: `tcp_${tcpKey}`,
              oldValue: tcpSettings[tcpKey] || 'Unknown',
              newValue: tcpTarget,
              reason: 'TCP Stack low-latency & throughput tuning',
              safety: 'Safe',
              category: 'tcp'
            });
          }
        } catch (err) {
          logger.warn('Optimization', `TCP setting ${tcpKey} could not be updated: ${err.message}`);
        }
      }
    }

    // Step 6: Verify configuration
    notify('optStepVerifying', 90, 'Verifying active network configuration...');
    const verifiedProps = await PlatformBridge.getAdvancedProperties(adapterName);

    // Step 7: Record audit entry in local history
    const auditRecord = backupManager.recordAuditChange({
      adapterName,
      profile: profile.id,
      backupFile: backupResult.filename,
      changes: optimized,
      skipped,
      errors
    });

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
