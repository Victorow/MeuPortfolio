/** Which version the visitor chose last: the 3D journey or the classic page (localStorage, enum-validated). */
export const VERSION_KEY = 'vp:version';
export type SiteVersion = 'classic' | '3d';

export function readVersionPref(): SiteVersion | null {
  try {
    const v = window.localStorage.getItem(VERSION_KEY);
    return v === 'classic' || v === '3d' ? v : null;
  } catch {
    return null;
  }
}

export function writeVersionPref(v: SiteVersion | null) {
  try {
    if (v) window.localStorage.setItem(VERSION_KEY, v);
    else window.localStorage.removeItem(VERSION_KEY);
  } catch {
    /* storage blocked: preference simply is not remembered */
  }
}

/** Inline <head> script for the 3D pages: returning classic visitors are sent there before first paint. */
export function versionBootScript(locale: string): string {
  const target = JSON.stringify(`/${locale}/classic/`);
  return `(function(){try{if(location.search.indexOf('stay=3d')<0&&localStorage.getItem('${VERSION_KEY}')==='classic')location.replace(${target})}catch(e){}})();`;
}
