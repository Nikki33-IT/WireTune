const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', '..', 'locales');

class I18nManager {
  constructor() {
    this.locales = {};
    this.availableLanguages = {};
    this.loadAll();
  }

  loadAll() {
    try {
      const manifestPath = path.join(LOCALES_DIR, 'languages.json');
      if (fs.existsSync(manifestPath)) {
        this.availableLanguages = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      }

      const files = fs.readdirSync(LOCALES_DIR);
      for (const file of files) {
        if (file.endsWith('.json') && file !== 'languages.json') {
          const code = file.replace('.json', '');
          const content = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, file), 'utf8'));
          this.locales[code] = content;
        }
      }
    } catch (err) {
      console.warn('[I18n] Error loading locales:', err.message);
    }
  }

  getLanguages() {
    return this.availableLanguages;
  }

  getLocale(langCode) {
    const english = this.locales['en'] || {};
    const selected = this.locales[langCode] || {};
    // Fallback: merge selected over english
    return { ...english, ...selected };
  }

  t(langCode, key, params = {}) {
    const locale = this.getLocale(langCode);
    let text = locale[key] || (this.locales['en'] && this.locales['en'][key]) || key;

    for (const [paramKey, paramVal] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramVal);
    }

    return text;
  }
}

module.exports = new I18nManager();
