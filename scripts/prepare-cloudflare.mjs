import { mkdir, copyFile, writeFile, rm } from 'node:fs/promises';
const base = 'https://novawebstudios14-source.github.io/nove-landingpage/';
const out = 'site-dist';
await rm(out, { recursive: true, force: true });
await mkdir(out + '/assets', { recursive: true });
for (const name of ['index.html','.nojekyll','assets/styles.css','assets/script.js','assets/prelead.js','assets/favicon.svg','assets/logo-0.png','assets/logo-1.png','assets/logo-2.png','assets/case-0.jpg','assets/case-1.jpg']) {
  await copyFile(name, out + '/' + name);
}
for (const name of ['vsl-optimized.mp4','vsl-poster.jpg']) {
  const response = await fetch(base + 'assets/' + name, { signal: AbortSignal.timeout(90000) });
  if (!response.ok) throw new Error(name + ': HTTP ' + response.status);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (name.endsWith('.mp4') && (bytes.length < 1024 || bytes.subarray(4,8).toString() !== 'ftyp')) {
    throw new Error('The optimized video is missing or is not an MP4; deployment stopped.');
  }
  if (name.endsWith('.jpg') && (bytes[0] !== 255 || bytes[1] !== 216)) throw new Error('Invalid video poster');
  await writeFile(out + '/assets/' + name, bytes);
  console.log(name + ': ' + bytes.length + ' bytes copied into Cloudflare deployment');
}
console.log('Verified all runtime assets are present in ' + out);
