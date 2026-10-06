const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const PORTABLE_MARKER = path.join(ROOT_DIR, 'portable.dat');
const PORTABLE_DATA_DIR = path.join(ROOT_DIR, 'WireTuneData');

class StoragePaths {
  constructor() {
    this._isPortable = this.detectPortable();
  }

  detectPortable() {
    if (process.env.WIRETUNE_PORTABLE === '1' || process.env.WIRETUNE_PORTABLE === 'true') {
      return true;
    }
    if (fs.existsSync(PORTABLE_MARKER)) {
      return true;
    }
    if (fs.existsSync(PORTABLE_DATA_DIR) && fs.statSync(PORTABLE_DATA_DIR).isDirectory()) {
      return true;
    }
    return false;
  }

  isPortable() {
    return this._isPortable;
  }

  getDataRoot() {
    return this._isPortable ? PORTABLE_DATA_DIR : ROOT_DIR;
  }

  getConfigFile() {
    if (this._isPortable) {
      this.ensureDir(PORTABLE_DATA_DIR);
      return path.join(PORTABLE_DATA_DIR, 'config.json');
    }
    return path.join(ROOT_DIR, 'config.json');
  }

  getBackupsDir() {
    const dir = path.join(this.getDataRoot(), 'backups');
    this.ensureDir(dir);
    return dir;
  }

  getProfilesDir() {
    const dir = path.join(this.getDataRoot(), 'profiles');
    this.ensureDir(dir);
    return dir;
  }

  getBenchmarkHistoryFile() {
    return path.join(this.getBackupsDir(), 'benchmark-history.json');
  }

  getAuditHistoryFile() {
    return path.join(this.getBackupsDir(), 'audit-history.json');
  }

  getDiagnosticsDir() {
    const dir = path.join(this.getDataRoot(), 'diagnostics');
    this.ensureDir(dir);
    return dir;
  }

  ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
      try {
        fs.mkdirSync(dirPath, { recursive: true });
      } catch (e) {
        // Silently handle if race condition
      }
    }
  }

  enablePortableMode() {
    this.ensureDir(PORTABLE_DATA_DIR);
    this.ensureDir(path.join(PORTABLE_DATA_DIR, 'backups'));
    this.ensureDir(path.join(PORTABLE_DATA_DIR, 'profiles'));
    this.ensureDir(path.join(PORTABLE_DATA_DIR, 'diagnostics'));

    // Migrate standard config if it exists
    const standardConfig = path.join(ROOT_DIR, 'config.json');
    const portableConfig = path.join(PORTABLE_DATA_DIR, 'config.json');
    if (fs.existsSync(standardConfig) && !fs.existsSync(portableConfig)) {
      try {
        fs.copyFileSync(standardConfig, portableConfig);
      } catch (e) {}
    }

    // Migrate standard benchmark history if it exists
    const standardBench = path.join(ROOT_DIR, 'backups', 'benchmark-history.json');
    const portableBench = path.join(PORTABLE_DATA_DIR, 'backups', 'benchmark-history.json');
    if (fs.existsSync(standardBench) && !fs.existsSync(portableBench)) {
      try {
        fs.copyFileSync(standardBench, portableBench);
      } catch (e) {}
    }

    // Write marker
    try {
      fs.writeFileSync(PORTABLE_MARKER, 'WireTune Portable Mode Enabled\nData Directory: ./WireTuneData/\n', 'utf8');
    } catch (e) {}

    this._isPortable = true;
    return {
      success: true,
      isPortable: true,
      dataDir: PORTABLE_DATA_DIR
    };
  }

  disablePortableMode() {
    try {
      if (fs.existsSync(PORTABLE_MARKER)) {
        fs.unlinkSync(PORTABLE_MARKER);
      }
    } catch (e) {}

    this._isPortable = false;
    return {
      success: true,
      isPortable: false,
      dataDir: ROOT_DIR
    };
  }

  getStatus() {
    return {
      isPortable: this._isPortable,
      dataDir: this.getDataRoot(),
      portableDataDir: PORTABLE_DATA_DIR,
      markerExists: fs.existsSync(PORTABLE_MARKER)
    };
  }
}

module.exports = new StoragePaths();
