import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/*
|--------------------------------------------------------------------------
| ANTIMATE ADMIN — APP SETTINGS CONTEXT
|--------------------------------------------------------------------------
|
| Central application settings:
|
| - Language: English / Kinyarwanda
| - Theme: Dark / Light
|
| Components such as:
| - Sidebar
| - Navbar
| - Pages
|
| should use this context instead of reading localStorage directly.
|
|--------------------------------------------------------------------------
*/

const AppSettingsContext = createContext(null);

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const DEFAULT_LANGUAGE = "en";
const DEFAULT_THEME = "dark";

const SUPPORTED_LANGUAGES = ["en", "rw"];
const SUPPORTED_THEMES = ["dark", "light"];

/*
|--------------------------------------------------------------------------
| STORAGE KEYS
|--------------------------------------------------------------------------
*/

const LANGUAGE_KEY = "antimate_language";
const THEME_KEY = "antimate_theme";

/*
|--------------------------------------------------------------------------
| PROVIDER
|--------------------------------------------------------------------------
*/

export function AppSettingsProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved =
      localStorage.getItem(LANGUAGE_KEY) ||
      localStorage.getItem("language") ||
      localStorage.getItem("lang");

    return SUPPORTED_LANGUAGES.includes(saved)
      ? saved
      : DEFAULT_LANGUAGE;
  });

  const [theme, setThemeState] = useState(() => {
    const saved =
      localStorage.getItem(THEME_KEY) ||
      localStorage.getItem("theme");

    return SUPPORTED_THEMES.includes(saved)
      ? saved
      : DEFAULT_THEME;
  });

  /*
  |--------------------------------------------------------------------------
  | APPLY THEME TO HTML
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const root = document.documentElement;

    root.setAttribute("data-theme", theme);

    root.style.colorScheme = theme;
  }, [theme]);

  /*
  |--------------------------------------------------------------------------
  | APPLY LANGUAGE TO HTML
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    document.documentElement.setAttribute(
      "lang",
      language === "rw" ? "rw" : "en"
    );
  }, [language]);

  /*
  |--------------------------------------------------------------------------
  | LANGUAGE
  |--------------------------------------------------------------------------
  */

  const setLanguage = (nextLanguage) => {
    if (!SUPPORTED_LANGUAGES.includes(nextLanguage)) {
      return;
    }

    setLanguageState(nextLanguage);

    localStorage.setItem(
      LANGUAGE_KEY,
      nextLanguage
    );

    /*
     * Keep compatibility with older components
     * that may still use these keys.
     */

    localStorage.setItem(
      "language",
      nextLanguage
    );

    localStorage.setItem(
      "lang",
      nextLanguage
    );

    window.dispatchEvent(
      new CustomEvent(
        "antimate-language-change",
        {
          detail: {
            language: nextLanguage,
          },
        }
      )
    );
  };

  /*
  |--------------------------------------------------------------------------
  | TOGGLE LANGUAGE
  |--------------------------------------------------------------------------
  */

  const toggleLanguage = () => {
    setLanguage(
      language === "en"
        ? "rw"
        : "en"
    );
  };

  /*
  |--------------------------------------------------------------------------
  | THEME
  |--------------------------------------------------------------------------
  */

  const setTheme = (nextTheme) => {
    if (!SUPPORTED_THEMES.includes(nextTheme)) {
      return;
    }

    setThemeState(nextTheme);

    localStorage.setItem(
      THEME_KEY,
      nextTheme
    );

    /*
     * Compatibility with older components.
     */

    localStorage.setItem(
      "theme",
      nextTheme
    );

    window.dispatchEvent(
      new CustomEvent(
        "antimate-theme-change",
        {
          detail: {
            theme: nextTheme,
          },
        }
      )
    );
  };

  /*
  |--------------------------------------------------------------------------
  | TOGGLE THEME
  |--------------------------------------------------------------------------
  */

  const toggleTheme = () => {
    setTheme(
      theme === "dark"
        ? "light"
        : "dark"
    );
  };

  /*
  |--------------------------------------------------------------------------
  | TRANSLATION HELPER
  |--------------------------------------------------------------------------
  |
  | Usage:
  |
  | t("dashboard")
  |
  */

  const translations = {
    en: {
      dashboard: "Dashboard",
      devices: "Devices",
      generateDevice: "Generate Device",
      generateGateway: "Generate Gateway",
      workers: "Workers",
      settings: "Settings",
      administration: "Administration",
      logout: "Logout",

      platform: "IoT Management Platform",

      language: "Language",
      english: "English",
      kinyarwanda: "Kinyarwanda",

      light: "Light",
      dark: "Dark",

      administrator: "Administrator",
      admin: "Admin",

      openMenu: "Open menu",
      closeMenu: "Close menu",

      search: "Search",
      sort: "Sort",
      filter: "Filter",
      details: "Details",
      create: "Create",
      edit: "Edit",
      delete: "Delete",
      cancel: "Cancel",
      save: "Save",
      back: "Back",

      online: "Online",
      offline: "Offline",
      active: "Active",
      inactive: "Inactive",

      loading: "Loading...",
      noData: "No data available",
    },

    rw: {
      dashboard: "Ikibaho",
      devices: "Ibikoresho",
      generateDevice: "Kora Device",
      generateGateway: "Kora Gateway",
      workers: "Abakozi",
      settings: "Igenamiterere",
      administration: "Imiyoborere",
      logout: "Sohoka",

      platform: "Urubuga rwo gucunga IoT",

      language: "Ururimi",
      english: "English",
      kinyarwanda: "Kinyarwanda",

      light: "Umucyo",
      dark: "Umwijima",

      administrator: "Umuyobozi",
      admin: "Umuyobozi",

      openMenu: "Fungura menu",
      closeMenu: "Funga menu",

      search: "Shakisha",
      sort: "Tondeka",
      filter: "Shungura",
      details: "Ibisobanuro",
      create: "Kora",
      edit: "Hindura",
      delete: "Siba",
      cancel: "Hagarika",
      save: "Bika",
      back: "Subira",

      online: "Irakora",
      offline: "Ntabwo iri gukora",
      active: "Ikora",
      inactive: "Ntabwo ikora",

      loading: "Birimo gutegurwa...",
      noData: "Nta makuru ahari",
    },
  };

  const t = (key) => {
    return (
      translations[language]?.[key] ||
      translations.en?.[key] ||
      key
    );
  };

  /*
  |--------------------------------------------------------------------------
  | CONTEXT VALUE
  |--------------------------------------------------------------------------
  */

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,

      theme,
      setTheme,
      toggleTheme,

      t,

      supportedLanguages:
        SUPPORTED_LANGUAGES,

      supportedThemes:
        SUPPORTED_THEMES,

      isKinyarwanda:
        language === "rw",

      isEnglish:
        language === "en",

      isDark:
        theme === "dark",

      isLight:
        theme === "light",
    }),
    [language, theme]
  );

  return (
    <AppSettingsContext.Provider
      value={value}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}

/*
|--------------------------------------------------------------------------
| HOOK
|--------------------------------------------------------------------------
*/

export function useAppSettings() {
  const context =
    useContext(AppSettingsContext);

  if (!context) {
    throw new Error(
      "useAppSettings must be used inside AppSettingsProvider"
    );
  }

  return context;
}

export default AppSettingsContext;