/**
 * Localization setup
 */

import en from './en';
import hi from './hi';
import ta from './ta';
import te from './te';
import ml from './ml';

class MockI18n {
  locale: string = 'en';
  defaultLocale: string = 'en';
  enableFallback: boolean = true;
  translations: Record<string, any>;

  constructor(translations: Record<string, any>) {
    this.translations = translations;
  }

  t(key: string, options?: Record<string, unknown>): string {
    const parts = key.split('.');
    let current: any = this.translations[this.locale] || this.translations[this.defaultLocale];
    
    // Attempt to traverse with current locale
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        current = null;
        break;
      }
    }

    // Fallback to defaultLocale
    if (typeof current !== 'string' && this.locale !== this.defaultLocale) {
      current = this.translations[this.defaultLocale];
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          current = null;
          break;
        }
      }
    }

    return typeof current === 'string' ? current : key;
  }
}

const i18n = new MockI18n({ en, hi, ta, te, ml });

export default i18n;

export function setLocale(locale: string) {
  i18n.locale = locale;
}

export function t(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options);
}
