const backupManager = require('./backup-manager');
const PlatformBridge = require('../platform/index');
const logger = require('../core/logger');

class RestoreManager {
  /**
   * Restore settings from the latest or specified backup
   */
  static async restoreBackup(adapterName, filename = null) {
    logger.info('Restore', `Starting restoration for adapter: ${adapterName}`);

    let backupData;
    if (filename) {
      backupData = backupManager.loadBackup(adapterName, filename);
    } else {
      const backups = backupManager.listBackups(adapterName);
      if (!backups || backups.length === 0) {
        return {
          success: false,
          error: 'No local backup found for this adapter.'
        };
      }
      backupData = backupManager.loadBackup(adapterName, backups[0].filename);
    }

    const currentProps = await PlatformBridge.getAdvancedProperties(adapterName);
    const propMap = new Map();
    for (const p of currentProps) {
      if (p.keyword) propMap.set(p.keyword, p);
      propMap.set(p.name, p);
    }

    const restored = [];
    const skipped = [];
    const failed = [];

    // 1. Restore adapter advanced properties
    for (const saved of backupData.properties) {
      const current = propMap.get(saved.keyword) || propMap.get(saved.name);
      if (!current) {
        skipped.push({ name: saved.name, reason: 'Property no longer present on adapter' });
        continue;
      }

      if (current.currentValue === saved.value) {
        // Already matching
        continue;
      }

      // Check if saved value is among valid display values if list is provided
      if (current.validValues && current.validValues.length > 0 && !current.validValues.includes(saved.value)) {
        skipped.push({
          name: saved.name,
          reason: `Saved value '${saved.value}' is not accepted by current driver`
        });
        continue;
      }

      const res = await PlatformBridge.setAdvancedProperty(adapterName, saved.keyword, saved.name, saved.value);
      if (res.success) {
        restored.push({
          name: saved.name,
          oldValue: current.currentValue,
          restoredValue: saved.value
        });
      } else {
        failed.push({
          name: saved.name,
          error: res.error || 'Failed to revert property'
        });
      }
    }

    // 2. Restore TCP settings if available
    if (backupData.tcpSettings) {
      for (const [key, val] of Object.entries(backupData.tcpSettings)) {
        try {
          await PlatformBridge.setTcpSetting(key, val);
        } catch (err) {
          logger.warn('Restore', `Failed to restore TCP setting ${key}: ${err.message}`);
        }
      }
    }

    // Record in audit log
    backupManager.recordAuditChange({
      adapterName,
      profile: 'Restore',
      backupFile: filename || 'latest',
      changes: restored.map(r => ({
        property: r.name,
        from: r.oldValue,
        to: r.restoredValue,
        reason: 'Restored from local backup snapshot'
      })),
      skipped,
      errors: failed
    });

    logger.info('Restore', `Restoration finished. Restored: ${restored.length}, Skipped: ${skipped.length}, Failed: ${failed.length}`);

    return {
      success: true,
      restoredCount: restored.length,
      skippedCount: skipped.length,
      failedCount: failed.length,
      restored,
      skipped,
      failed
    };
  }

  /**
   * Reset adapter to manufacturer / driver default settings
   */
  static async restoreFactoryDefaults(adapterName) {
    logger.info('Restore', `Attempting factory reset for adapter: ${adapterName}`);
    const res = await PlatformBridge.resetAdapter(adapterName);
    return res;
  }
}

module.exports = RestoreManager;
