/**
 * WireTune Client-side i18n manager
 */

class I18nClient {
  constructor() {
    this.currentLanguage = 'en';
    this.dictionary = {};
    this.fallbackDictionary = {};
    this.availableLanguages = {};
  }

  async init(initialLang = 'en') {
    try {
      const langsRes = await WireTuneApi.getLanguages();
      this.availableLanguages = langsRes.languages || {};

      // Always load English as reliable fallback
      this.fallbackDictionary = await WireTuneApi.getLocale('en');

      await this.setLanguage(initialLang);
    } catch (err) {
      console.warn('I18n init error:', err);
    }
  }

  async setLanguage(langCode) {
    this.currentLanguage = langCode;
    try {
      this.dictionary = await WireTuneApi.getLocale(langCode);
    } catch (err) {
      console.warn(`Could not load locale for ${langCode}, using fallback:`, err);
      this.dictionary = this.fallbackDictionary;
    }

    // Set document direction for RTL languages like Arabic
    if (langCode === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.removeAttribute('dir');
    }

    this.translateDOM();
  }

  t(key, params = {}) {
    let text = this.dictionary[key] || this.fallbackDictionary[key] || key;
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    return text;
  }

  translateDOM(root = document) {
    const elements = root.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      const translated = this.t(key);
      const svg = el.querySelector('svg');
      if (svg) {
        const textSpan = el.querySelector('span[data-i18n]') || el.querySelector('.btn-text');
        if (textSpan) {
          textSpan.textContent = translated;
        } else {
          for (let node of el.childNodes) {
            if (node.nodeType === 3 && node.nodeValue.trim().length > 0) {
              node.nodeValue = ' ' + translated.trim();
              break;
            }
          }
        }
      } else {
        el.textContent = translated;
      }
    });

    // Translate placeholders
    const inputs = root.querySelectorAll('[data-i18n-placeholder]');
    inputs.forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        el.setAttribute('placeholder', this.t(key));
      }
    });

    // Translate title tooltips
    const titled = root.querySelectorAll('[data-i18n-title]');
    titled.forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        el.setAttribute('title', this.t(key));
      }
    });
  }
}

window.i18n = new I18nClient();
