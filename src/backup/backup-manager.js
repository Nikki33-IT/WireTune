const fs = require('fs');
const path = require('path');
const logger = require('../core/logger');

const storagePaths = require('../core/storage-paths');

class BackupManager {
  constructor() {
    this.ensureDirs();
  }

  getBackupRoot() {
    return storagePaths.getBackupsDir();
  }

  getAuditFile() {
    return storagePaths.getAuditHistoryFile();
  }

  ensureDirs() {
    storagePaths.ensureDir(this.getBackupRoot());
  }

  /**
   * Sanitize adapter name for safe filesystem directory creation
   */
  getAdapterDir(adapterName) {
    const safeName = adapterName.replace(/[<>:"/\\|?*]/g, '_').trim();
    const dir = path.join(this.getBackupRoot(), safeName);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  /**
   * Create a full backup of an adapter's properties and TCP settings
   */
  createBackup(adapterName, properties, tcpSettings) {
    this.ensureDirs();
    const dir = this.getAdapterDir(adapterName);
    const now = new Date();
    const timestampStr = now.toISOString()
      .replace(/T/, '_')
      .replace(/:/g, '-')
      .split('.')[0];
    
    const filename = `${timestampStr}.json`;
    const fullPath = path.join(dir, filename);

    const snapshot = {
      adapterName,
      createdAt: now.toISOString(),
      timestamp: timestampStr,
      propertyCount: properties.length,
      properties: properties.map(p => ({
        name: p.name,
        keyword: p.keyword,
        value: p.currentValue,
        validValues: p.validValues
      })),
      tcpSettings: tcpSettings || {}
    };

    fs.writeFileSync(fullPath, JSON.stringify(snapshot, null, 2), 'utf8');
    logger.info('Backup', `Backup created successfully at: ${fullPath}`);
    return {
      success: true,
      path: fullPath,
      filename,
      timestamp: timestampStr,
      snapshot
    };
  }

  /**
   * List all backups for a specific adapter
   */
  listBackups(adapterName) {
    const dir = this.getAdapterDir(adapterName);
    if (!fs.existsSync(dir)) return [];

    const files = fs.readdirSync(dir)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse();

    return files.map(file => {
      const fullPath = path.join(dir, file);
      try {
        const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        return {
          filename: file,
          filePath: fullPath,
          createdAt: data.createdAt,
          timestamp: data.timestamp,
          propertyCount: data.propertyCount,
          adapterName: data.adapterName
        };
      } catch (err) {
        return null;
      }
    }).filter(Boolean);
  }

  /**
   * Load specific backup snapshot
   */
  loadBackup(adapterName, filename) {
    const dir = this.getAdapterDir(adapterName);
    const fullPath = path.join(dir, filename);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Backup file not found: ${filename}`);
    }
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  }

  /**
   * Record entry in local Audit History
   */
  recordAuditChange(entry) {
    try {
      const auditFile = this.getAuditFile();
      let history = [];
      if (fs.existsSync(auditFile)) {
        history = JSON.parse(fs.readFileSync(auditFile, 'utf8'));
      }

      const record = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        formattedDate: new Date().toLocaleString(),
        adapterName: entry.adapterName,
        profile: entry.profile,
        backupFile: entry.backupFile,
        changes: entry.changes || [],
        skipped: entry.skipped || [],
        errors: entry.errors || []
      };

      history.unshift(record);
      // Keep last 100 changes
      if (history.length > 100) history.pop();

      fs.writeFileSync(auditFile, JSON.stringify(history, null, 2), 'utf8');
      logger.info('Audit', `Recorded change audit for ${entry.adapterName} (${record.changes.length} changes)`);
      return record;
    } catch (err) {
      logger.error('Audit', 'Failed to record audit change', err.message);
      return null;
    }
  }

  getAuditHistory() {
    try {
      const auditFile = this.getAuditFile();
      if (fs.existsSync(auditFile)) {
        return JSON.parse(fs.readFileSync(auditFile, 'utf8'));
      }
    } catch (err) {
      logger.error('Audit', 'Failed to read audit file', err.message);
    }
    return [];
  }
}

module.exports = new BackupManager();
