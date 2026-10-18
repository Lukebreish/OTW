import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import en from '../i18n/en.js';
import fr from '../i18n/fr.js';
import nl from '../i18n/nl.js';

// Site languages. English is the default and the fallback for every missing string.
// A language only appears in the switch once it is marked ready, so a half-translated
// language never reaches visitors. Flip `ready` when fr.js / nl.js are complete and checked.
export const LANGS = [
  { code: 'en', label: 'EN', name: 'English', dict: en, ready: true },
  { code: 'fr', label: 'FR', name: 'Français', dict: fr, ready: false },
  { code: 'nl', label: 'NL', name: 'Nederlands', dict: nl, ready: false },
];
export const DEFAULT_LANG = 'en';
const KEY = 'otw-lang';
const isReady = (code) => LANGS.some((l) => l.code === code && l.ready);

function initialLang() {
  const fromUrl = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('lang');
  if (fromUrl && isReady(fromUrl)) return fromUrl;
  try {
    const saved = window.localStorage.getItem(KEY);
    if (saved && isReady(saved)) return saved;
  } catch { /* storage blocked */ }
  return DEFAULT_LANG;
}

const LangContext = createContext({ lang: DEFAULT_LANG, setLang: () => {}, t: (k) => en[k] ?? k, loc: (r, f) => r?.[f] });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);

  const setLang = useCallback((code) => {
    if (!isReady(code)) return;
    setLangState(code);
    try { window.localStorage.setItem(KEY, code); } catch { /* storage blocked */ }
  }, []);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const value = useMemo(() => {
    const dict = LANGS.find((l) => l.code === lang)?.dict || en;
    // t('key') → text in the current language, else English, else the key itself.
    // t('key', { name: 'Ana' }) replaces {name} in the text.
    const t = (key, vars) => {
      let s = dict[key] ?? en[key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
      return s;
    };
    // loc(row, 'title') → a Supabase row's translated field, from its `translations`
    // column ({ fr: { title }, nl: { title } }), else the English column.
    const loc = (row, field) => row?.translations?.[lang]?.[field] || row?.[field];
    return { lang, setLang, t, loc };
  }, [lang, setLang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
export const readyLangs = () => LANGS.filter((l) => l.ready);
