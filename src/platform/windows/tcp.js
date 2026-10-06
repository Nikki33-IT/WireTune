const PowerShell = require('./powershell');
const logger = require('../../core/logger');

class WindowsTCP {
  /**
   * Get global TCP stack settings
   */
  static async getTcpSettings() {
    const ps = `Get-NetTCPSetting -SettingName "Internet" -ErrorAction SilentlyContinue | Select-Object SettingName, AutoTuningLevelLocal, ScalingHeuristics, EcnCapability, CongestionProvider, Timestamps`;
    const res = await PowerShell.runJson(ps);

    if (!res.success || !res.data) {
      logger.warn('TCP', 'Failed to query Get-NetTCPSetting, fallback to netsh');
      return this.getTcpSettingsViaNetsh();
    }

    const data = Array.isArray(res.data) ? res.data[0] : res.data;
    return {
      autoTuning: this.mapAutoTuning(data.AutoTuningLevelLocal),
      scalingHeuristics: data.ScalingHeuristics === 1 ? 'Enabled' : 'Disabled',
      ecnCapability: data.EcnCapability === 1 ? 'Enabled' : 'Disabled',
      congestionProvider: this.mapCongestion(data.CongestionProvider),
      timestamps: data.Timestamps === 1 ? 'Enabled' : 'Disabled'
    };
  }

  static async getTcpSettingsViaNetsh() {
    const res = await PowerShell.run('netsh int tcp show global');
    if (!res.success) return {};

    const out = res.stdout;
    const autoTuningMatch = out.match(/Receive Window Auto-Tuning Level\s*:\s*([^\r\n]+)/i);
    const ecnMatch = out.match(/ECN Capability\s*:\s*([^\r\n]+)/i);
    const heuristicsMatch = out.match(/Receive-Side Scaling State\s*:\s*([^\r\n]+)/i);

    return {
      autoTuning: autoTuningMatch ? autoTuningMatch[1].trim() : 'normal',
      ecnCapability: ecnMatch ? ecnMatch[1].trim() : 'disabled',
      scalingHeuristics: 'Disabled',
      congestionProvider: 'CUBIC'
    };
  }

  static mapAutoTuning(val) {
    const map = {
      0: 'Normal',
      1: 'Disabled',
      2: 'HighlyRestricted',
      3: 'Restricted',
      4: 'Experimental'
    };
    return map[val] || (typeof val === 'string' ? val : 'Normal');
  }

  static mapCongestion(val) {
    const map = {
      0: 'Default',
      1: 'CTCP',
      2: 'CUBIC',
      3: 'BBR2',
      4: 'NewReno'
    };
    return map[val] || (typeof val === 'string' ? val : 'Default');
  }

  /**
   * Safe TCP tuning (safe by default)
   */
  static async setTcpSetting(settingKey, value) {
    logger.info('TCP', `Tuning TCP setting ${settingKey} -> ${value}`);
    let cmd = '';

    switch (settingKey) {
      case 'autoTuning':
        cmd = `Set-NetTCPSetting -SettingName "Internet" -AutoTuningLevelLocal ${value} -ErrorAction SilentlyContinue`;
        break;
      case 'scalingHeuristics':
        cmd = `Set-NetTCPSetting -SettingName "Internet" -ScalingHeuristics ${value} -ErrorAction SilentlyContinue`;
        break;
      case 'ecnCapability':
        cmd = `Set-NetTCPSetting -SettingName "Internet" -EcnCapability ${value} -ErrorAction SilentlyContinue`;
        break;
      case 'congestionProvider':
        cmd = `Set-NetTCPSetting -SettingName "Internet" -CongestionProvider ${value} -ErrorAction SilentlyContinue`;
        break;
      default:
        return { success: false, error: 'Unknown TCP setting' };
    }

    const res = await PowerShell.run(cmd);
    return res;
  }
}

module.exports = WindowsTCP;
