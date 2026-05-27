/**
 * Localization setup — i18n
 */

import { I18n } from 'i18n-js';
import en from './en';
import hi from './hi';

const i18n = new I18n({ en, hi });
i18n.defaultLocale = 'en';
i18n.locale = 'en';
i18n.enableFallback = true;

export default i18n;

export function setLocale(locale: string) {
  i18n.locale = locale;
}

export function t(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options);
}
