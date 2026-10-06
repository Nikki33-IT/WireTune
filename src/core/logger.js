const fs = require('fs');
const path = require('path');

class LocalLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
  }

  log(level, category, message, meta = null) {
    const entry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      category,
      message,
      meta: meta ? (typeof meta === 'object' ? meta : { data: meta }) : null
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    const consoleMsg = `[${entry.timestamp}] [${entry.level}] [${category}] ${message}`;
    if (level === 'error') {
      console.error(consoleMsg, meta || '');
    } else if (level === 'warn') {
      console.warn(consoleMsg, meta || '');
    } else {
      console.log(consoleMsg);
    }
  }

  info(category, message, meta) {
    this.log('info', category, message, meta);
  }

  warn(category, message, meta) {
    this.log('warn', category, message, meta);
  }

  error(category, message, meta) {
    this.log('error', category, message, meta);
  }

  debug(category, message, meta) {
    this.log('debug', category, message, meta);
  }

  getRecentLogs(limit = 200) {
    return this.logs.slice(-limit);
  }

  exportLogsToFile(destinationDir) {
    const targetDir = destinationDir || path.join(__dirname, '..', '..', 'diagnostics');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const filename = `wiretune-log-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const fullPath = path.join(targetDir, filename);
    const content = JSON.stringify({
      app: 'WireTune',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      privacyNotice: 'This log was generated locally on your computer and was not sent anywhere.',
      logs: this.logs
    }, null, 2);

    fs.writeFileSync(fullPath, content, 'utf8');
    this.info('Logger', `Logs exported locally to: ${fullPath}`);
    return { success: true, filePath: fullPath, count: this.logs.length };
  }
}

module.exports = new LocalLogger();
