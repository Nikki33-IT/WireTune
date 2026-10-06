/**
 * WireTune Local API Client (strictly offline / 127.0.0.1)
 */

class WireTuneApi {
  static async get(endpoint) {
    const res = await fetch(endpoint);
    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }
    return res.json();
  }

  static async post(endpoint, data = {}) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `API error ${res.status}`);
    }
    return res.json();
  }

  // Convenience methods
  static getStatus() { return this.get('/api/status'); }
  static restartAsAdmin() { return this.post('/api/admin/restart'); }
  static getAdapters() { return this.get('/api/adapters'); }
  static getAdapterProperties(name) { return this.get(`/api/adapter/${encodeURIComponent(name)}/properties`); }
  static getAdapterStatus(name, profile) { return this.get(`/api/adapter/${encodeURIComponent(name)}/status?profile=${encodeURIComponent(profile)}`); }
  static getProfiles() { return this.get('/api/profiles'); }
  static optimize(adapterName, profileId, customOverrides) {
    return this.post('/api/optimize', { adapterName, profileId, customOverrides });
  }
  static restore(adapterName, filename, isFactory = false) {
    return this.post('/api/restore', { adapterName, filename, isFactory });
  }
  static getBackups(adapterName) { return this.get(`/api/backups/${encodeURIComponent(adapterName)}`); }
  static getAudit() { return this.get('/api/audit'); }
  static testPing(targetIp, adapterName) {
    return this.post('/api/test-ping', { targetIp, adapterName });
  }
  static getConfig() { return this.get('/api/config'); }
  static updateConfig(data) { return this.post('/api/config', data); }
  static getLanguages() { return this.get('/api/languages'); }
  static getLocale(lang) { return this.get(`/api/locales/${lang}`); }
  static getDiagnostics() { return this.get('/api/diagnostics'); }
  static exportLogs() { return this.post('/api/diagnostics/export'); }
  static getAdlibs() { return this.get('/api/adlibs'); }
  static getBenchmarkTelemetry(adapter) {
    return this.get(`/api/benchmark/telemetry${adapter ? '?adapter=' + encodeURIComponent(adapter) : ''}`);
  }
  static runBenchmark(adapterName, iterations = 3) {
    return this.post('/api/benchmark/run', { adapterName, iterations });
  }
  static compareBenchmark(before, after) {
    return this.post('/api/benchmark/compare', { before, after });
  }
  static getBenchmarkHistory() { return this.get('/api/benchmark/history'); }
  static saveBenchmarkHistory(entry) { return this.post('/api/benchmark/history', entry); }
  static clearBenchmarkHistory() {
    return fetch('/api/benchmark/history', { method: 'DELETE' }).then(r => r.json());
  }
  static getBenchmarkExportUrl(format = 'json') {
    return `/api/benchmark/export?format=${format}`;
  }

  // DNS Benchmark
  static getCurrentDns(adapter) {
    return this.get(`/api/dns/current${adapter ? '?adapter=' + encodeURIComponent(adapter) : ''}`);
  }
  static runDnsBenchmark(adapterName) {
    return this.post('/api/dns/benchmark', { adapterName });
  }
  static applyDns(adapterName, primary, secondary) {
    return this.post('/api/dns/apply', { adapterName, primary, secondary });
  }
  static resetDns(adapterName) {
    return this.post('/api/dns/reset', { adapterName });
  }

  // Why This Setting?
  static getPropertyMeta(key) {
    return this.get(`/api/property-meta/${encodeURIComponent(key)}`);
  }

  // Portable Mode
  static getPortableStatus() {
    return this.get('/api/portable/status');
  }
  static togglePortable(enable) {
    return this.post('/api/portable/toggle', { enable });
  }

  // Custom Adapter Profiles
  static getCustomProfiles() {
    return this.get('/api/custom-profiles');
  }
  static createCustomProfile(data) {
    return this.post('/api/custom-profiles', data);
  }
  static updateCustomProfile(id, data) {
    return fetch(`/api/custom-profiles/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json());
  }
  static deleteCustomProfile(id) {
    return fetch(`/api/custom-profiles/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    }).then(r => r.json());
  }
  static applyCustomProfile(id, adapterName) {
    return this.post(`/api/custom-profiles/${encodeURIComponent(id)}/apply`, { adapterName });
  }

  // Optimization Lab
  static runLabTest(adapterName, propertyKey, testValue) {
    return this.post('/api/lab/test', { adapterName, propertyKey, testValue });
  }
}

window.WireTuneApi = WireTuneApi;
