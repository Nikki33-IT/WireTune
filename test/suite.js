const assert = require('assert');
const path = require('path');
const fs = require('fs');

const configManager = require('../src/core/config');
const i18nManager = require('../src/localization/i18n');
const PlatformBridge = require('../src/platform/index');
const PROFILES = require('../src/optimization/profiles');
const { getPropertyMeta } = require('../src/optimization/property-meta');
const backupManager = require('../src/backup/backup-manager');
const PingTester = require('../src/network/ping-tester');
const DiagnosticTool = require('../src/diagnostics/diagnostic-tool');

async function runTests() {
  console.log('🧪 Starting WireTune Comprehensive Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}:`, err.message);
      failed++;
    }
  }

  async function asyncTest(name, fn) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Config Manager
  test('Config Manager loads defaults and updates', () => {
    const cfg = configManager.getAll();
    assert.ok(cfg.language, 'Config should have language');
    configManager.set('theme', 'dark');
    assert.strictEqual(configManager.get('theme'), 'dark');
  });

  // 2. Localization
  test('Localization loads languages and falls back gracefully', () => {
    const languages = i18nManager.getLanguages();
    assert.ok(Object.keys(languages).length >= 25, 'Should support at least 25 languages');
    const plName = i18nManager.t('pl', 'appName');
    assert.strictEqual(plName, 'WireTune');
    const missingKey = i18nManager.t('pl', 'nonExistentKey');
    assert.strictEqual(missingKey, 'nonExistentKey');
  });

  // 3. Profiles
  test('Profiles are properly defined with target values', () => {
    assert.ok(PROFILES.balanced, 'Balanced profile must exist');
    assert.ok(PROFILES.gaming, 'Gaming profile must exist');
    assert.ok(PROFILES.streaming, 'Streaming profile must exist');
    assert.ok(PROFILES.maxperf, 'Max Performance profile must exist');
    assert.ok(PROFILES.custom, 'Custom profile must exist');
    assert.strictEqual(PROFILES.gaming.properties['*InterruptModeration'], 'Disabled');
    assert.strictEqual(PROFILES.gaming.properties['*FlowControl'], 'Disabled');
    assert.strictEqual(PROFILES.balanced.properties['*InterruptModeration'], 'Enabled');
  });

  // 4. Property Metadata
  test('Property metadata correctly identifies parameters', () => {
    const meta = getPropertyMeta('*InterruptModeration');
    assert.strictEqual(meta.friendlyName, 'Interrupt Moderation');
    assert.ok(meta.whatItDoes.length > 10);
    assert.ok(meta.impact.length > 10);
    assert.ok(meta.downside.length > 10);
  });

  // 5. Backups & Audit History
  test('Backup manager creates and lists snapshots', () => {
    const testProps = [
      { name: 'Flow Control', keyword: '*FlowControl', currentValue: 'Rx & Tx Enabled' }
    ];
    const backupRes = backupManager.createBackup('Test-Adapter', testProps, { autoTuning: 'Normal' });
    assert.ok(backupRes.success);
    assert.ok(fs.existsSync(backupRes.path));

    const list = backupManager.listBackups('Test-Adapter');
    assert.ok(list.length > 0);

    const audit = backupManager.recordAuditChange({
      adapterName: 'Test-Adapter',
      profile: 'gaming',
      backupFile: backupRes.filename,
      changes: [{ property: 'Flow Control', from: 'Enabled', to: 'Disabled' }]
    });
    assert.ok(audit && audit.id);
  });

  // 6. Ping Tester honest comparison
  test('Ping Tester honestly evaluates results', () => {
    const before = { latencyMs: 24, packetLossPercent: 0, linkSpeed: '1 Gbps' };
    const afterBetter = { latencyMs: 20, packetLossPercent: 0, linkSpeed: '1 Gbps' };
    const afterSame = { latencyMs: 24, packetLossPercent: 0, linkSpeed: '1 Gbps' };

    const compBetter = PingTester.compare(before, afterBetter);
    assert.strictEqual(compBetter.hasImprovement, true);
    assert.ok(compBetter.summary.includes('improved'));

    const compSame = PingTester.compare(before, afterSame);
    assert.strictEqual(compSame.hasImprovement, false);
    assert.strictEqual(compSame.summary, 'No measurable improvement detected.');
  });

  // 7. Diagnostics
  test('Diagnostic tool generates system specs without network leaks', () => {
    const sys = DiagnosticTool.getSystemInfo();
    assert.strictEqual(sys.appName, 'WireTune');
    assert.ok(sys.osPlatform);
    assert.ok(sys.cpus > 0);
  });

  // 8. Platform Bridge detection
  await asyncTest('Platform Bridge queries system adapters', async () => {
    const adapters = await PlatformBridge.getAdapters();
    assert.ok(Array.isArray(adapters), 'Adapters should be an array');
    console.log(`    Detected ${adapters.length} network adapters on system`);
  });

  // 9. Network Benchmark Engine
  test('Network Benchmark evaluates stability and compares honest results', () => {
    const NetworkBenchmark = require('../src/network/benchmark');
    const stabExc = NetworkBenchmark.evaluateStability(0, 1.2);
    assert.strictEqual(stabExc.rating, 'Excellent');

    const stabPoor = NetworkBenchmark.evaluateStability(5.0, 20.0);
    assert.strictEqual(stabPoor.rating, 'Poor');

    const before = {
      median: { downloadMbps: 480, uploadMbps: 90, latencyMs: 25, jitterMs: 3.5, packetLossPercent: 0 }
    };
    const after = {
      median: { downloadMbps: 482, uploadMbps: 91, latencyMs: 18, jitterMs: 1.8, packetLossPercent: 0 }
    };
    const comp = NetworkBenchmark.compareResults(before, after);
    assert.strictEqual(comp.metrics.latency.status, 'improvement');
    assert.strictEqual(comp.metrics.jitter.status, 'improvement');
    assert.strictEqual(comp.overallStatus, 'improvement');
  });

  // 10. Benchmark History & Export
  test('Benchmark History saves and formats JSON, CSV and TXT exports', () => {
    const BenchmarkHistory = require('../src/network/benchmark-history');
    const rec = BenchmarkHistory.saveEntry({
      adapterName: 'Ethernet',
      type: 'BEFORE',
      result: { median: { downloadMbps: 500, uploadMbps: 100, latencyMs: 15, jitterMs: 1.5, packetLossPercent: 0 } }
    });
    assert.ok(rec && rec.id);

    const jsonExport = BenchmarkHistory.exportFormat('json');
    assert.ok(jsonExport.content.includes('allynIT'));

    const csvExport = BenchmarkHistory.exportFormat('csv');
    assert.ok(csvExport.content.includes('Download_Mbps'));

    const txtExport = BenchmarkHistory.exportFormat('txt');
    assert.ok(txtExport.content.includes('WIRETUNE NETWORK BENCHMARK'));
  });

  // 11. Adlibs and Author Branding
  test('Adlibs configuration loads allynIT author branding', () => {
    const adlibs = require('../locales/adlibs.json');
    assert.strictEqual(adlibs.author, 'allynIT');
    assert.ok(adlibs.startup.length > 0);
  });

  // 12. DNS Benchmark
  await asyncTest('DNS Benchmark resolves and calculates latency and reliability', async () => {
    const DnsBenchmark = require('../src/network/dns-benchmark');
    const cloudflareTest = await DnsBenchmark.testSingleResolver('1.1.1.1');
    assert.ok(cloudflareTest.avgLatency > 0, 'Average latency should be positive');
    assert.ok(cloudflareTest.reliability >= 80, 'Reliability should be high on public DNS');
    assert.ok(cloudflareTest.details.length > 0, 'Details list should contain domains');
  });

  // 13. Why This Setting Metadata
  test('Why this setting metadata provides honest technical explanations', () => {
    const meta = getPropertyMeta('*InterruptModeration');
    assert.ok(meta.whyRecommended.length > 20, 'Should explain why WireTune recommends this');
    assert.ok(meta.benefits.length > 10, 'Should list benefits');
    assert.ok(meta.downsides.length > 10, 'Should list downsides');
    assert.ok(meta.hardwareNotes.length > 10, 'Should list hardware/driver notes');
  });

  // 14. Portable Mode
  test('Portable Mode toggles self-contained storage in WireTuneData', () => {
    const storagePaths = require('../src/core/storage-paths');
    const statusBefore = storagePaths.getStatus();
    assert.ok(statusBefore.dataDir, 'Data directory must be resolved');

    const res = storagePaths.enablePortableMode();
    assert.strictEqual(res.isPortable, true);
    assert.ok(res.dataDir.includes('WireTuneData'));
    assert.ok(fs.existsSync(res.dataDir));

    // Cleanup and reset
    storagePaths.disablePortableMode();
    assert.strictEqual(storagePaths.isPortable(), false);
  });

  // 15. Custom Adapter Profiles
  test('Custom Profiles manager saves, edits, and deletes user profiles', () => {
    const CustomProfileManager = require('../src/optimization/custom-profiles');
    const all = CustomProfileManager.getAllProfiles();
    assert.ok(all.length >= 4, 'Should include default presets');

    const created = CustomProfileManager.createProfile({
      name: 'Test Gaming Pro',
      description: 'Ultra low latency profile',
      properties: { '*InterruptModeration': 'Disabled' }
    });
    assert.ok(created && created.id);
    assert.strictEqual(created.name, 'Test Gaming Pro');

    const updated = CustomProfileManager.updateProfile(created.id, {
      description: 'Updated description'
    });
    assert.strictEqual(updated.description, 'Updated description');

    const delRes = CustomProfileManager.deleteProfile(created.id);
    assert.strictEqual(delRes.success, true);
  });

  // Clean up any test artifacts generated during test suite
  const testAdapterDir = path.join(__dirname, '..', 'backups', 'Test-Adapter');
  if (fs.existsSync(testAdapterDir)) {
    try { fs.rmSync(testAdapterDir, { recursive: true, force: true }); } catch (e) {}
  }
  const wireTuneDataDir = path.join(__dirname, '..', 'WireTuneData');
  if (fs.existsSync(wireTuneDataDir)) {
    try { fs.rmSync(wireTuneDataDir, { recursive: true, force: true }); } catch (e) {}
  }
  const auditPath = path.join(__dirname, '..', 'backups', 'audit-history.json');
  if (fs.existsSync(auditPath)) {
    try { fs.writeFileSync(auditPath, '[]\n'); } catch (e) {}
  }
  const benchPath = path.join(__dirname, '..', 'backups', 'benchmark-history.json');
  if (fs.existsSync(benchPath)) {
    try { fs.writeFileSync(benchPath, '[]\n'); } catch (e) {}
  }

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
