const fs = require('fs');
const path = require('path');
const storagePaths = require('../core/storage-paths');
const PROFILES = require('./profiles');
const PlatformBridge = require('../platform/index');
const OptimizationEngine = require('./engine');
const logger = require('../core/logger');

class CustomProfileManager {
  constructor() {
    this.ensureStorage();
  }

  ensureStorage() {
    storagePaths.ensureDir(storagePaths.getProfilesDir());
  }

  getCustomProfilesFile() {
    return path.join(storagePaths.getProfilesDir(), 'custom-profiles.json');
  }

  getCustomProfiles() {
    try {
      const file = this.getCustomProfilesFile();
      if (fs.existsSync(file)) {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
      }
    } catch (e) {
      logger.warn('Profiles', 'Failed to read custom profiles', e.message);
    }
    return [];
  }

  saveCustomProfiles(list) {
    try {
      this.ensureStorage();
      const file = this.getCustomProfilesFile();
      fs.writeFileSync(file, JSON.stringify(list, null, 2), 'utf8');
      return true;
    } catch (e) {
      logger.error('Profiles', 'Failed to save custom profiles', e.message);
      return false;
    }
  }

  /**
   * Return all available profiles: built-in presets + user custom profiles
   */
  getAllProfiles() {
    const customList = this.getCustomProfiles();
    
    // Built-in presets
    const presets = Object.values(PROFILES).map(p => ({
      ...p,
      isPreset: true,
      canDelete: false,
      canEdit: p.id === 'custom'
    }));

    // Formatted custom profiles
    const formattedCustom = customList.map(p => ({
      ...p,
      isPreset: false,
      canDelete: true,
      canEdit: true
    }));

    return [...presets, ...formattedCustom];
  }

  /**
   * Find profile by ID
   */
  getProfileById(id) {
    if (PROFILES[id]) {
      return { ...PROFILES[id], isPreset: true, canDelete: false, canEdit: id === 'custom' };
    }
    const customList = this.getCustomProfiles();
    const found = customList.find(p => p.id === id);
    if (found) {
      return { ...found, isPreset: false, canDelete: true, canEdit: true };
    }
    return null;
  }

  /**
   * Create a new custom profile
   */
  createProfile({ name, description, properties = {}, tcp = {} }) {
    if (!name || !name.trim()) {
      throw new Error('Profile name is required');
    }

    const id = `profile-${Date.now()}`;
    const customList = this.getCustomProfiles();

    const newProfile = {
      id,
      name: name.trim(),
      description: description ? description.trim() : 'Custom user profile',
      properties: properties || {},
      tcp: tcp || {
        autoTuning: 'Normal',
        scalingHeuristics: 'Disabled',
        ecnCapability: 'Disabled',
        congestionProvider: 'CUBIC'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    customList.push(newProfile);
    this.saveCustomProfiles(customList);
    logger.info('Profiles', `Created custom profile: ${newProfile.name} (${id})`);
    return newProfile;
  }

  /**
   * Capture an adapter's active settings as a new custom profile
   */
  async captureFromAdapter(adapterName, profileName, description) {
    if (!adapterName) throw new Error('Adapter name required');
    if (!profileName || !profileName.trim()) throw new Error('Profile name required');

    const props = await PlatformBridge.getAdvancedProperties(adapterName);
    const tcp = await PlatformBridge.getTcpSettings();

    const capturedProperties = {};
    for (const p of props) {
      if (p.currentValue !== undefined && p.currentValue !== null) {
        capturedProperties[p.keyword || p.name] = p.currentValue;
      }
    }

    return this.createProfile({
      name: profileName.trim(),
      description: description || `Captured snapshot from adapter ${adapterName}`,
      properties: capturedProperties,
      tcp
    });
  }

  /**
   * Update an existing custom profile
   */
  updateProfile(id, updates) {
    if (PROFILES[id]) {
      throw new Error('Cannot modify built-in preset profiles');
    }

    const customList = this.getCustomProfiles();
    const index = customList.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Profile not found');
    }

    const current = customList[index];
    const updated = {
      ...current,
      name: updates.name ? updates.name.trim() : current.name,
      description: updates.description !== undefined ? updates.description.trim() : current.description,
      properties: updates.properties !== undefined ? updates.properties : current.properties,
      tcp: updates.tcp !== undefined ? updates.tcp : current.tcp,
      updatedAt: new Date().toISOString()
    };

    customList[index] = updated;
    this.saveCustomProfiles(customList);
    logger.info('Profiles', `Updated custom profile: ${updated.name} (${id})`);
    return updated;
  }

  /**
   * Delete a custom profile
   */
  deleteProfile(id) {
    if (PROFILES[id]) {
      throw new Error('Cannot delete built-in preset profiles');
    }

    const customList = this.getCustomProfiles();
    const filtered = customList.filter(p => p.id !== id);
    if (filtered.length === customList.length) {
      throw new Error('Profile not found');
    }

    this.saveCustomProfiles(filtered);
    logger.info('Profiles', `Deleted custom profile: ${id}`);
    return { success: true, deletedId: id };
  }

  /**
   * Apply any profile (preset or custom) to an adapter
   */
  async applyProfileToAdapter(profileId, adapterName) {
    const profile = this.getProfileById(profileId);
    if (!profile) {
      throw new Error(`Profile ${profileId} not found`);
    }

    return OptimizationEngine.runOptimization(
      adapterName,
      profile.isPreset ? profile.id : 'custom',
      profile.properties || {}
    );
  }
}

module.exports = new CustomProfileManager();
