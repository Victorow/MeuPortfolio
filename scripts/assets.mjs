// Downloads planet textures (Solar System Scope, CC BY 4.0) into assets/raw/
// and writes resized tiers to public/textures/{high,mid,low}/ plus manifest.json.
// If `toktx` (KTX-Software) is on PATH, also emits .ktx2 and the manifest prefers it.
import fs from 'node:fs/promises';
import path from 'node:path';
import { execSync } from 'node:child_process';
import sharp from 'sharp';

const BASE = 'https://www.solarsystemscope.com/textures/download/';

const SRC = {
  earth_day: '8k_earth_daymap.jpg',
  earth_night: '8k_earth_nightmap.jpg',
  earth_clouds: '8k_earth_clouds.jpg',
  earth_specular: '2k_earth_specular_map.tif',
  earth_normal: '2k_earth_normal_map.tif',
  moon: '8k_moon.jpg',
  mars: '8k_mars.jpg',
  jupiter: '8k_jupiter.jpg',
  saturn: '8k_saturn.jpg',
  saturn_ring: '2k_saturn_ring_alpha.png',
  uranus: '2k_uranus.jpg',
  venus: '4k_venus_atmosphere.jpg',
  neptune: '2k_neptune.jpg',
  sun: '2k_sun.jpg',
  milkyway: '8k_stars_milky_way.jpg'
};

// Max width per texture per tier (keeps the byte budget).
const CAP = {
  earth_day: { high: 8192, mid: 4096, low: 2048 },
  earth_night: { high: 4096, mid: 2048, low: 1024 },
  earth_clouds: { high: 4096, mid: 2048, low: 1024 },
  earth_specular: { high: 2048, mid: 2048, low: 1024 },
  earth_normal: { high: 2048, mid: 2048, low: 1024 },
  moon: { high: 2048, mid: 2048, low: 1024 },
  mars: { high: 4096, mid: 2048, low: 1024 },
  jupiter: { high: 4096, mid: 2048, low: 1024 },
  saturn: { high: 4096, mid: 2048, low: 1024 },
  saturn_ring: { high: 2048, mid: 1024, low: 1024 },
  uranus: { high: 2048, mid: 1024, low: 1024 },
  venus: { high: 4096, mid: 2048, low: 1024 },
  neptune: { high: 2048, mid: 1024, low: 1024 },
  sun: { high: 2048, mid: 1024, low: 1024 },
  milkyway: { high: 8192, mid: 4096, low: 2048 }
};

// Deep-sky photographs (Hubble / JWST — NASA, ESA, CSA, STScI; public domain) via Wikimedia Commons.
const DEEP_BASE = 'https://commons.wikimedia.org/wiki/Special:FilePath/';
const DEEP = {
  galaxy_whirlpool: 'Messier51_sRGB.jpg',
  galaxy_pinwheel: 'M101_hires_STScI-PRC2006-10a.jpg',
  galaxy_barred: 'Hubble2005-01-barred-spiral-galaxy-NGC1300.jpg',
  nebula_orion: 'Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg',
  nebula_pillars: 'Pillars_of_Creation_(NIRCam_Image).jpg',
  nebula_helix: 'NGC7293_(2004).jpg'
};
for (const k of Object.keys(DEEP)) CAP[k] = { high: 4096, mid: 2048, low: 1024 };

const TIERS = ['high', 'mid', 'low'];
const raw = 'assets/raw';
const out = 'public/textures';

await fs.mkdir(raw, { recursive: true });

const hasToktx = (() => {
  try {
    execSync('toktx --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
})();

async function download(file, base = BASE, destName = file) {
  const dest = path.join(raw, destName);
  try {
    await fs.access(dest);
    return dest;
  } catch {
    /* not cached */
  }
  process.stdout.write(`download ${file} ... `);
  const res = await fetch(base + file, { headers: { 'User-Agent': 'Mozilla/5.0 (portfolio asset script; contact victoroow@gmail.com)' }, redirect: 'follow' });
  if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
  await fs.writeFile(dest, Buffer.from(await res.arrayBuffer()));
  console.log('ok');
  return dest;
}

const manifest = {};
const ALL = { ...Object.fromEntries(Object.entries(SRC).map(([k, f]) => [k, { file: f, base: BASE, dest: f }])),
  ...Object.fromEntries(Object.entries(DEEP).map(([k, f]) => [k, { file: f + '?width=4096', base: DEEP_BASE, dest: `${k}.jpg` }])) };
for (const [key, src] of Object.entries(ALL)) {
  const file = src.dest;
  const rawPath = await download(src.file, src.base, src.dest);
  manifest[key] = {};
  const isPng = file.endsWith('.png');
  const ext = isPng ? 'png' : 'jpg';
  for (const tier of TIERS) {
    const dir = path.join(out, tier);
    await fs.mkdir(dir, { recursive: true });
    const dest = path.join(dir, `${key}.${ext}`);
    let exists = false;
    try {
      await fs.access(dest);
      exists = true;
    } catch {
      /* build it */
    }
    if (!exists) {
      const img = sharp(rawPath, { limitInputPixels: false }).resize({ width: CAP[key][tier], withoutEnlargement: true });
      if (isPng) await img.png({ compressionLevel: 9 }).toFile(dest);
      else await img.jpeg({ quality: tier === 'high' ? 82 : 78, mozjpeg: true }).toFile(dest);
    }
    let url = `/textures/${tier}/${key}.${ext}`;
    if (hasToktx) {
      const k = dest.replace(/\.(jpg|png)$/, '.ktx2');
      execSync(`toktx --t2 --genmipmap ${isPng ? '--uastc 2' : '--bcmp'} "${k}" "${dest}"`, { stdio: 'ignore' });
      url = `/textures/${tier}/${key}.ktx2`;
    }
    manifest[key][tier] = url;
  }
  console.log(`tiered ${key}`);
}

await fs.writeFile(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2));

let totals = {};
for (const tier of TIERS) {
  const files = await fs.readdir(path.join(out, tier));
  let bytes = 0;
  for (const f of files) bytes += (await fs.stat(path.join(out, tier, f))).size;
  totals[tier] = (bytes / 1024 / 1024).toFixed(1) + ' MB';
}
console.log('manifest written', hasToktx ? '(ktx2)' : '(jpg/png)', totals);
