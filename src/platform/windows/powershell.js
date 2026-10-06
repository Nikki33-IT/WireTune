const { exec } = require('child_process');
const logger = require('../../core/logger');

class PowerShell {
  /**
   * Run a PowerShell command securely and return string or parsed JSON
   */
  static run(command, options = {}) {
    const timeout = options.timeout || 15000;
    return new Promise((resolve, reject) => {
      // Force UTF-8 output encoding for accurate text capture
      const wrapped = `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; ${command}`;
      const psCommand = `powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "${wrapped.replace(/"/g, '\\"')}"`;

      exec(psCommand, { timeout, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
          logger.debug('PowerShell', `Command finished with error: ${command.substring(0, 80)}`, { error: error.message, stderr });
          return resolve({
            success: false,
            error: error.message,
            stderr: (stderr || '').trim(),
            stdout: (stdout || '').trim()
          });
        }
        resolve({
          success: true,
          stdout: (stdout || '').trim(),
          stderr: (stderr || '').trim()
        });
      });
    });
  }

  /**
   * Run a command and parse JSON output
   */
  static async runJson(command, options = {}) {
    const res = await this.run(`${command} | ConvertTo-Json -Depth 5`, options);
    if (!res.success || !res.stdout) {
      return { success: false, error: res.error || res.stderr || 'No output', data: null };
    }

    try {
      const parsed = JSON.parse(res.stdout);
      return { success: true, data: parsed };
    } catch (parseErr) {
      // PowerShell might return non-JSON if an exception or warning was printed
      logger.warn('PowerShell', `Failed to parse JSON output: ${res.stdout.substring(0, 100)}`, { err: parseErr.message });
      return { success: false, error: parseErr.message, raw: res.stdout, data: null };
    }
  }
}

module.exports = PowerShell;
