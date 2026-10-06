const { exec } = require('child_process');
const path = require('path');
const logger = require('../../core/logger');
const PowerShell = require('./powershell');

class WindowsAdmin {
  static async checkIsAdmin() {
    return new Promise((resolve) => {
      // 'net session' will exit with code 0 only if running as Administrator
      exec('net session', (error) => {
        const isAdmin = !error;
        logger.debug('Security', `Admin check result: ${isAdmin}`);
        resolve(isAdmin);
      });
    });
  }

  static async restartAsAdmin() {
    const batPath = path.resolve(__dirname, '..', '..', '..', 'WireTune-Admin.bat');
    const psCmd = `Start-Process -FilePath "cmd.exe" -ArgumentList "/c \\"${batPath}\\"" -Verb RunAs`;
    logger.info('Security', 'Requesting UAC elevation restart');
    return PowerShell.run(psCmd);
  }
}

module.exports = WindowsAdmin;
