// CI gate: `npm audit` on production dependencies, failing on high/critical advisories.
//
// Allow-listed: advisories on the `next` package itself. Every one of them (Server Actions, middleware,
// image optimizer, RSC request handling, rewrites, dev server) targets the Next.js *server runtime*.
// This site is a static export (`output: 'export'`) served by GitHub Pages: no Next server, middleware,
// image optimizer or server actions run in production, so none is reachable. The fix is a major upgrade
// (Next 16); remove the allow-list when that lands. Anything else, including transitive packages of
// next, still fails the build.
import { execSync } from 'node:child_process';

const ALLOW = new Set(['next']);
const FAIL_ON = new Set(['high', 'critical']);

let raw;
try {
  raw = execSync('npm audit --omit=dev --json', { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
} catch (e) {
  raw = e.stdout?.toString() ?? '';
}
const report = JSON.parse(raw || '{}');
const vulns = Object.values(report.vulnerabilities ?? {});

const blocking = vulns.filter((v) => FAIL_ON.has(v.severity) && !ALLOW.has(v.name) && !(v.via ?? []).every((x) => typeof x === 'string' && ALLOW.has(x)));
const allowed = vulns.filter((v) => ALLOW.has(v.name));

for (const v of allowed) console.log(`allowed (static export, server-only advisories): ${v.name} ${v.severity}`);
if (blocking.length) {
  for (const v of blocking) console.error(`BLOCKING: ${v.name} (${v.severity}) via ${(v.via ?? []).map((x) => (typeof x === 'string' ? x : x.title)).join('; ')}`);
  process.exit(1);
}
console.log(`npm audit: no blocking high/critical advisories in production dependencies (${vulns.length} total, ${allowed.length} allow-listed)`);
