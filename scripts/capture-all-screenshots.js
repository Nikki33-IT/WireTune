const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = path.join(
  process.env.USERPROFILE,
  '.cache/hyperframes/chrome/chrome-headless-shell/win64-152.0.7977.30/chrome-headless-shell-win64/chrome-headless-shell.exe'
);

const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'images');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('Starting chrome-headless-shell with remote debugging...');
  const chrome = spawn(CHROME_PATH, [
    '--headless',
    '--remote-debugging-port=9222',
    '--window-size=1280,820',
    'http://127.0.0.1:42880'
  ], { stdio: 'ignore' });

  // Wait for debugger port
  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await sleep(200);
    try {
      const list = await fetchJson('http://127.0.0.1:9222/json');
      if (list && list.length > 0 && list[0].webSocketDebuggerUrl) {
        wsUrl = list[0].webSocketDebuggerUrl;
        break;
      }
    } catch (e) {}
  }

  if (!wsUrl) {
    console.error('Could not connect to Chrome DevTools Protocol');
    chrome.kill();
    process.exit(1);
  }

  console.log('Connected to CDP at:', wsUrl);
  const ws = new WebSocket(wsUrl);

  let idCounter = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  await new Promise(resolve => ws.onopen = resolve);

  function sendCmd(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await sendCmd('Page.enable');
  await sendCmd('Runtime.enable');
  await sleep(1500);

  // Helper to run JS
  async function evaluate(code) {
    const res = await sendCmd('Runtime.evaluate', { expression: code, awaitPromise: true });
    return res;
  }

  // Inject anonymized showcase details into DOM
  const anonymizeScript = `
    if (window.app) {
      if (app.state && app.state.config) app.state.config.firstRunComplete = true;
      const m = document.getElementById('firstRunModal');
      if (m) m.classList.remove('active');

      const titleEl = document.getElementById('dashboardAdapterTitle');
      if (titleEl) titleEl.textContent = 'Intel(R) Ethernet Controller I225-V';

      const mediaEl = document.getElementById('dashboardChipMedia');
      if (mediaEl) mediaEl.textContent = '802.3 (PCIe)';

      const speedEl = document.getElementById('dashboardChipSpeed');
      if (speedEl) speedEl.textContent = '2.5 Gbps';

      const sigEl = document.getElementById('dashboardChipSignal');
      if (sigEl) sigEl.textContent = 'Duplex: Full 2500/FD';

      const macEl = document.getElementById('dashboardChipMac');
      if (macEl) macEl.textContent = 'MAC: 00-1A-2B-8C-3F-4D';

      const topAdp = document.getElementById('topSelectedAdapterLabel');
      if (topAdp) topAdp.textContent = 'Intel(R) Ethernet Controller I225-V';
    }
  `;

  await evaluate(anonymizeScript);

  const views = [
    {
      filename: 'wiretune-dashboard.png',
      action: async () => {
        await evaluate(`
          app.switchTab('dashboard');
          ${anonymizeScript}
        `);
        await sleep(600);
      }
    },
    {
      filename: 'wiretune-adapter.png',
      action: async () => {
        await evaluate(`
          app.switchTab('dashboard');
          ${anonymizeScript}
          app.openAdapterSelectorModal();
          const list = document.getElementById('adapterModalList');
          if (list) {
            list.innerHTML = \`
              <div class="card selected" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center; padding:14px 18px; border-color:var(--accent-primary);">
                <div style="display:flex; align-items:center; gap:12px;">
                  <span class="status-dot online"></span>
                  <div>
                    <div style="font-weight:700; font-size:0.92rem; color:var(--text-primary);">Ethernet</div>
                    <div style="font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">
                      Intel(R) Ethernet Controller I225-V • 802.3 (PCIe) • 2.5 Gbps
                    </div>
                  </div>
                </div>
                <span class="brand-badge">Active</span>
              </div>
              <div class="card" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center; padding:14px 18px; border-color:var(--border-card);">
                <div style="display:flex; align-items:center; gap:12px;">
                  <span class="status-dot online"></span>
                  <div>
                    <div style="font-weight:700; font-size:0.92rem; color:var(--text-primary);">Wi-Fi</div>
                    <div style="font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">
                      Intel(R) Wi-Fi 6E AX211 160MHz • Native 802.11ax • 1.2 Gbps
                    </div>
                  </div>
                </div>
                <button class="btn-secondary" style="padding:4px 12px; font-size:0.75rem;">Select</button>
              </div>
              <div class="card" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center; padding:14px 18px; border-color:var(--border-card);">
                <div style="display:flex; align-items:center; gap:12px;">
                  <span class="status-dot offline"></span>
                  <div>
                    <div style="font-weight:700; font-size:0.92rem; color:var(--text-primary);">Ethernet 2</div>
                    <div style="font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">
                      Realtek Gaming 2.5GbE Family Controller • 802.3 • Disconnected
                    </div>
                  </div>
                </div>
                <button class="btn-secondary" style="padding:4px 12px; font-size:0.75rem;">Select</button>
              </div>
            \`;
          }
        `);
        await sleep(700);
      }
    },
    {
      filename: 'wiretune-optimization.png',
      action: async () => {
        await evaluate(`
          document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
          app.switchTab('optimize');
        `);
        await sleep(600);
      }
    },
    {
      filename: 'wiretune-benchmark.png',
      action: async () => {
        await evaluate(`
          app.switchTab('benchmark');
        `);
        await sleep(600);
      }
    },
    {
      filename: 'wiretune-dns.png',
      action: async () => {
        await evaluate(`
          app.switchTab('dns');
        `);
        await sleep(600);
      }
    },
    {
      filename: 'wiretune-diagnostics.png',
      action: async () => {
        await evaluate(`
          app.switchTab('diagnostics');
          const pre = document.getElementById('diagnosticsInfoPre');
          if (pre) {
            pre.textContent = JSON.stringify({
              "system": {
                "appName": "WireTune",
                "version": "1.0.0",
                "buildInfo": "git-release-x64",
                "osType": "Windows_NT",
                "osRelease": "10.0.22631",
                "osPlatform": "win32",
                "osVersion": "Windows 11 Pro",
                "arch": "x64",
                "runtime": "Node.js (Win32 Native NDIS Engine)"
              },
              "activeAdapter": {
                "name": "Ethernet",
                "description": "Intel(R) Ethernet Controller I225-V",
                "linkSpeed": "2.5 Gbps",
                "mediaType": "802.3 (PCIe)",
                "macAddress": "00-1A-2B-8C-3F-4D",
                "status": "Connected"
              },
              "health": {
                "score": 96,
                "status": "Optimal",
                "bufferbloatGrade": "A+"
              }
            }, null, 2);
          }
        `);
        await sleep(600);
      }
    },
    {
      filename: 'wiretune-profiles.png',
      action: async () => {
        await evaluate(`
          app.switchTab('profiles');
        `);
        await sleep(600);
      }
    },
    {
      filename: 'wiretune-settings.png',
      action: async () => {
        await evaluate(`
          app.switchTab('settings');
        `);
        await sleep(600);
      }
    },
    {
      filename: 'wiretune-about.png',
      action: async () => {
        await evaluate(`
          app.switchTab('about');
        `);
        await sleep(600);
      }
    },
    {
      filename: 'wiretune-dark-mode.png',
      action: async () => {
        await evaluate(`
          app.switchTab('dashboard');
          ${anonymizeScript}
          const modal = document.getElementById('optimizeProgressModal');
          if (modal) modal.classList.add('active');
        `);
        await sleep(600);
      }
    }
  ];

  for (const v of views) {
    console.log('Capturing:', v.filename);
    await v.action();
    const snap = await sendCmd('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(snap.data, 'base64');
    fs.writeFileSync(path.join(OUTPUT_DIR, v.filename), buffer);
    console.log('Saved:', v.filename, `(${buffer.length} bytes)`);
  }

  ws.close();
  chrome.kill();
  console.log('All 10 screenshots captured successfully!');
}

run().catch(err => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
