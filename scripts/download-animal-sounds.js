#!/usr/bin/env node
/**
 * Downloads royalty-free animal sound MP3s into assets/sounds/animals/.
 * Run from project root: node scripts/download-animal-sounds.js
 * Source: FreeAnimalSounds.org (free to use).
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'assets', 'sounds', 'animals');
const FILES = [
  { name: 'cow.mp3', url: 'https://freeanimalsounds.org/wp-content/uploads/2017/07/Rinder_muh.mp3' },
  { name: 'sheep.mp3', url: 'https://freeanimalsounds.org/wp-content/uploads/2017/07/schafe.mp3' },
  { name: 'chicken.mp3', url: 'https://freeanimalsounds.org/wp-content/uploads/2017/07/huehner.mp3' },
  { name: 'pig.mp3', url: 'https://freeanimalsounds.org/wp-content/uploads/2017/07/schwein.mp3' },
  { name: 'dog.mp3', url: 'https://freeanimalsounds.org/wp-content/uploads/2017/07/Bluthund_jault.mp3' },
  { name: 'cat.mp3', url: 'https://freeanimalsounds.org/wp-content/uploads/2017/07/Katze_miaut.mp3' },
  { name: 'duck.mp3', url: 'https://freeanimalsounds.org/wp-content/uploads/2017/07/Ente_quackt.mp3' },
  { name: 'frog.mp3', url: 'https://freeanimalsounds.org/wp-content/uploads/2017/08/frogs.mp3' },
];

function download(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'EduPlay-AnimalSounds/1.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`${url} → ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
    req.on('error', reject);
  });
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }
  console.log('Downloading animal sounds to', OUT_DIR);
  for (const { name, url } of FILES) {
    try {
      const data = await download(url);
      const outPath = path.join(OUT_DIR, name);
      fs.writeFileSync(outPath, data);
      console.log('  OK', name);
    } catch (e) {
      console.warn('  FAIL', name, e.message);
    }
  }
  console.log('Done. Restart the app so it picks up the new files.');
}

main();
