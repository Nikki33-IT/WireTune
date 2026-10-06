const PowerShell = require('./powershell');
const logger = require('../../core/logger');

class WindowsAdapter {
  /**
   * List all network adapters on the system
   */
  static async getAdapters() {
    const ps = `Get-NetAdapter | Select-Object Name, InterfaceDescription, Status, LinkSpeed, MediaType, MacAddress, DriverVersion, DriverDate, InterfaceIndex`;
    const res = await PowerShell.runJson(ps);

    if (!res.success || !res.data) {
      logger.error('Adapter', 'Failed to query network adapters via PowerShell', res.error);
      return [];
    }

    const items = Array.isArray(res.data) ? res.data : [res.data];

    // Check Wi-Fi signal strength if Wi-Fi adapters exist
    let wifiSignal = null;
    const hasWifi = items.some(a => a.MediaType && a.MediaType.includes('802.11'));
    if (hasWifi) {
      try {
        const wlanRes = await PowerShell.run('netsh wlan show interfaces');
        if (wlanRes.success) {
          const match = wlanRes.stdout.match(/Signal\s*:\s*(\d+)%/i);
          if (match) {
            wifiSignal = `${match[1]}%`;
          }
        }
      } catch (err) {
        logger.debug('Adapter', 'Could not query netsh wlan', err.message);
      }
    }

    return items.map(item => {
      const isWifi = item.MediaType && item.MediaType.includes('802.11');
      return {
        id: item.Name,
        name: item.Name,
        description: item.InterfaceDescription || item.Name,
        status: item.Status || 'Unknown',
        connected: (item.Status || '').toLowerCase() === 'up',
        linkSpeed: item.LinkSpeed || 'Unknown',
        mediaType: item.MediaType || 'Unknown',
        isWifi,
        signal: isWifi ? (wifiSignal || 'Connected') : null,
        macAddress: item.MacAddress || 'N/A',
        driverVersion: item.DriverVersion || 'N/A',
        driverDate: item.DriverDate || 'N/A',
        index: item.InterfaceIndex
      };
    });
  }

  /**
   * Get all advanced properties for a given adapter
   */
  static async getAdvancedProperties(adapterName) {
    const escaped = adapterName.replace(/'/g, "''");
    const ps = `Get-NetAdapterAdvancedProperty -Name '${escaped}' -ErrorAction SilentlyContinue | Select-Object DisplayName, DisplayValue, RegistryKeyword, NumericParameterType, ValidDisplayValues`;
    const res = await PowerShell.runJson(ps);

    if (!res.success || !res.data) {
      logger.warn('Adapter', `No advanced properties found or query failed for adapter ${adapterName}`);
      return [];
    }

    const rawProps = Array.isArray(res.data) ? res.data : [res.data];

    return rawProps.map(p => {
      let validValues = [];
      if (Array.isArray(p.ValidDisplayValues)) {
        validValues = p.ValidDisplayValues;
      } else if (typeof p.ValidDisplayValues === 'string') {
        validValues = [p.ValidDisplayValues];
      }

      return {
        name: p.DisplayName,
        keyword: p.RegistryKeyword,
        currentValue: p.DisplayValue !== null && p.DisplayValue !== undefined ? String(p.DisplayValue) : 'Not Set',
        validValues: validValues,
        isNumeric: p.NumericParameterType !== null && p.NumericParameterType !== undefined
      };
    });
  }

  /**
   * Set an advanced property value for an adapter
   */
  static async setAdvancedProperty(adapterName, keyword, displayName, newValue) {
    const escapedAdapter = adapterName.replace(/'/g, "''");
    let cmd = '';

    if (keyword && keyword.trim().length > 0) {
      const escapedKey = keyword.replace(/'/g, "''");
      const escapedVal = String(newValue).replace(/'/g, "''");
      cmd = `Set-NetAdapterAdvancedProperty -Name '${escapedAdapter}' -RegistryKeyword '${escapedKey}' -RegistryValue '${escapedVal}' -NoRestart`;
    } else {
      const escapedName = displayName.replace(/'/g, "''");
      const escapedVal = String(newValue).replace(/'/g, "''");
      cmd = `Set-NetAdapterAdvancedProperty -Name '${escapedAdapter}' -DisplayName '${escapedName}' -DisplayValue '${escapedVal}' -NoRestart`;
    }

    logger.info('Adapter', `Executing: ${cmd}`);
    const res = await PowerShell.run(cmd);

    if (!res.success) {
      logger.error('Adapter', `Failed to set property ${displayName}: ${res.error || res.stderr}`);
      return {
        success: false,
        error: res.error || res.stderr || 'Modification failed'
      };
    }

    return { success: true };
  }

  /**
   * Reset adapter properties to factory defaults if supported
   */
  static async resetAdapter(adapterName) {
    const escaped = adapterName.replace(/'/g, "''");
    const cmd = `Reset-NetAdapterAdvancedProperty -Name '${escaped}' -DisplayName '*' -NoRestart`;
    return PowerShell.run(cmd);
  }
}

module.exports = WindowsAdapter;
