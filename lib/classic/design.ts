/** Classic page design: A "Papel" (paper editorial) or B "Dossiê" (dark dossier). */
export type Design = 'a' | 'b';
export const DESIGN_KEY = 'classic:design';
export const isDesign = (v: unknown): v is Design => v === 'a' || v === 'b';

/**
 * Inline boot script for <head>: picks the design before first paint so a returning B visitor never
 * sees A flash. Order: #a / #b in the URL, then the stored preference. Only compares against fixed
 * values; nothing from the URL or storage is ever written into the DOM.
 */
export const DESIGN_BOOT_SCRIPT = `(function(){try{var d=document.documentElement,h=location.hash.slice(1).toLowerCase(),s=null;if(h==='a'||h==='b'){s=h;localStorage.setItem('${DESIGN_KEY}',h)}else{s=localStorage.getItem('${DESIGN_KEY}')}if(s==='b')d.setAttribute('data-design','b')}catch(e){}})();`;
