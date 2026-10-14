import { execSync } from 'node:child_process';

let cached: string | null = null;

/**
 * Last-modified date of the site (YYYY-MM-DD), taken from the last git commit at build time.
 * Server/build only. Falls back to today when git is unavailable.
 */
export function siteUpdated(): string {
  if (cached) return cached;
  try {
    const out = execSync('git log -1 --format=%cs', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    cached = /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : new Date().toISOString().slice(0, 10);
  } catch {
    cached = new Date().toISOString().slice(0, 10);
  }
  return cached;
}
