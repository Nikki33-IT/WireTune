const fs = require('fs');
const path = require('path');
const logger = require('../core/logger');

const storagePaths = require('../core/storage-paths');

class BenchmarkHistory {
  static getHistoryFile() {
    return storagePaths.getBenchmarkHistoryFile();
  }

  static getHistory() {
    try {
      const historyFile = this.getHistoryFile();
      if (fs.existsSync(historyFile)) {
        return JSON.parse(fs.readFileSync(historyFile, 'utf8'));
      }
    } catch (e) {
      logger.warn('Benchmark', 'Failed to read benchmark history', e.message);
    }
    return [];
  }

  static saveEntry(entry) {
    try {
      const history = this.getHistory();
      const record = {
        id: `bench-${Date.now()}`,
        timestamp: new Date().toISOString(),
        formattedDate: new Date().toLocaleString(),
        adapterName: entry.adapterName || 'Unknown Adapter',
        profile: entry.profile || 'Default',
        type: entry.type || 'BEFORE', // 'BEFORE', 'AFTER', 'STANDALONE'
        result: entry.result,
        comparison: entry.comparison || null
      };

      history.unshift(record);
      // Keep last 50 benchmark entries
      if (history.length > 50) history.pop();

      const historyFile = this.getHistoryFile();
      const dir = path.dirname(historyFile);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      fs.writeFileSync(historyFile, JSON.stringify(history, null, 2), 'utf8');
      return record;
    } catch (e) {
      logger.error('Benchmark', 'Failed to save benchmark entry', e.message);
      return null;
    }
  }

  static clearHistory() {
    try {
      const historyFile = this.getHistoryFile();
      if (fs.existsSync(historyFile)) {
        fs.writeFileSync(historyFile, JSON.stringify([], null, 2), 'utf8');
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  static exportFormat(format = 'json') {
    const history = this.getHistory();
    const ts = new Date().toISOString().replace(/[:.]/g, '-');

    if (format === 'json') {
      return {
        filename: `wiretune-benchmark-${ts}.json`,
        mimeType: 'application/json',
        content: JSON.stringify({
          app: 'WireTune',
          author: 'allynIT',
          exportedAt: new Date().toISOString(),
          history
        }, null, 2)
      };
    }

    if (format === 'csv') {
      const headers = ['Timestamp', 'Adapter', 'Type', 'Download_Mbps', 'Upload_Mbps', 'Latency_ms', 'Jitter_ms', 'Loss_percent', 'Stability'];
      const rows = history.map(h => {
        const m = h.result?.median || h.result || {};
        return [
          `"${h.formattedDate}"`,
          `"${h.adapterName}"`,
          `"${h.type}"`,
          m.downloadMbps || 0,
          m.uploadMbps || 0,
          m.latencyMs || 0,
          m.jitterMs || 0,
          m.packetLossPercent || 0,
          `"${m.stability?.rating || 'N/A'}"`
        ].join(',');
      });

      return {
        filename: `wiretune-benchmark-${ts}.csv`,
        mimeType: 'text/csv',
        content: [headers.join(','), ...rows].join('\r\n')
      };
    }

    // Default TXT report
    const lines = [
      '=================================================================',
      '  WIRETUNE NETWORK BENCHMARK AUDIT REPORT',
      '  Made by allynIT — https://github.com/allynIT',
      `  Exported: ${new Date().toLocaleString()}`,
      '=================================================================',
      ''
    ];

    history.forEach((h, idx) => {
      const m = h.result?.median || h.result || {};
      lines.push(`[#${idx + 1}] Date: ${h.formattedDate} | Adapter: ${h.adapterName} | Type: ${h.type}`);
      lines.push(`  • Download:     ${m.downloadMbps || 0} Mbps`);
      lines.push(`  • Upload:       ${m.uploadMbps || 0} Mbps`);
      lines.push(`  • Latency:      ${m.latencyMs || 0} ms`);
      lines.push(`  • Jitter:       ${m.jitterMs || 0} ms`);
      lines.push(`  • Packet Loss:  ${m.packetLossPercent || 0}%`);
      lines.push(`  • Stability:    ${m.stability?.rating || 'N/A'}`);
      if (h.comparison) {
        lines.push(`  • Summary:      ${h.comparison.summary}`);
      }
      lines.push('-----------------------------------------------------------------');
    });

    return {
      filename: `wiretune-benchmark-${ts}.txt`,
      mimeType: 'text/plain',
      content: lines.join('\r\n')
    };
  }
}

module.exports = BenchmarkHistory;
