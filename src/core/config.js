const fs = require('fs');
const path = require('path');

const storagePaths = require('./storage-paths');

const DEFAULT_CONFIG = {
  language: 'en',
  firstRunComplete: false,
  theme: 'system', // 'system', 'dark', 'light'
  animations: true,
  pingTarget: 'gateway', // 'gateway' or custom ip
  lastAdapter: null,
  lastProfile: 'balanced',
  portableMode: storagePaths.isPortable()
};

class ConfigManager {
  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.load();
  }

  load() {
    try {
      const configFile = storagePaths.getConfigFile();
      if (fs.existsSync(configFile)) {
        const raw = fs.readFileSync(configFile, 'utf8');
        const parsed = JSON.parse(raw);
        this.config = { ...DEFAULT_CONFIG, ...parsed, portableMode: storagePaths.isPortable() };
      }
    } catch (err) {
      console.warn('[Config] Failed to read config, using defaults:', err.message);
      this.config = { ...DEFAULT_CONFIG };
    }
    return this.config;
  }

  save() {
    try {
      const configFile = storagePaths.getConfigFile();
      fs.writeFileSync(configFile, JSON.stringify(this.config, null, 2), 'utf8');
    } catch (err) {
      console.error('[Config] Failed to save config:', err.message);
    }
  }

  get(key) {
    return this.config[key];
  }

  set(key, value) {
    this.config[key] = value;
    this.save();
    return this.config;
  }

  getAll() {
    return { ...this.config };
  }

  update(newSettings) {
    this.config = { ...this.config, ...newSettings };
    this.save();
    return this.config;
  }
}

module.exports = new ConfigManager();
