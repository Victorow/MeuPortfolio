// Notifies IndexNow (Bing, Yandex and partners) that the public pages changed.
// Runs after each successful deploy, with no dependencies (plain Node fetch).
// The key is public by design: it only proves we control the host, because the
// same value is served at /{key}.txt.
const SITE_URL = 'https://victors.codes';
const KEY = 'c5c59857b8094b38388b6e4e6c4c0cff';
const urlList = ['/pt-BR/classic/', '/en/classic/', '/pt-BR/', '/en/'].map((p) => SITE_URL + p);

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(SITE_URL).host, key: KEY, keyLocation: `${SITE_URL}/${KEY}.txt`, urlList })
});
console.log(`IndexNow: HTTP ${res.status} for ${urlList.length} URLs`);
if (res.status !== 200 && res.status !== 202) {
  console.log(await res.text());
  console.warn('IndexNow did not accept the submission (non-blocking).');
}
