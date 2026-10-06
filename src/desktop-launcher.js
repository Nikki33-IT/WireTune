const { exec, spawn } = require('child_process');
const { startServer } = require('./server');
const PlatformBridge = require('./platform/index');
const logger = require('./core/logger');

async function launch() {
  try {
    const port = await startServer(42880);
    const url = `http://127.0.0.1:${port}`;
    const isAdmin = await PlatformBridge.isAdmin();

    logger.info('Launcher', `WireTune started on ${url}. Elevated Admin: ${isAdmin}`);

    // Try opening as a clean borderless desktop app window via Microsoft Edge or Brave if available,
    // otherwise fallback to system default browser.
    const edgeAppCommand = `start msedge --app="${url}"`;
    const defaultBrowserCommand = `start "" "${url}"`;

    if (process.platform === 'win32') {
      exec(edgeAppCommand, (err) => {
        if (err) {
          // If msedge --app fails, fallback to standard default browser
          exec(defaultBrowserCommand);
        }
      });
    } else {
      exec(`xdg-open "${url}" || open "${url}"`);
    }

  } catch (err) {
    console.error('Failed to launch WireTune desktop application:', err);
  }
}

if (require.main === module) {
  launch();
}

module.exports = { launch };
