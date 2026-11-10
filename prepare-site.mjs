/** Unpack the delivered BSEG build without rebuilding or altering the app. */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname, sep } from 'node:path';
import { inflateRawSync } from 'node:zlib';

const archive = process.argv[2] || 'BSEG_Moon_Relic_Web.zip';
const expected = 'ff006eba56494be767e309bb34b2edd4a36764644f47085c7a14b624fd7e85e6';
const root = resolve('public');
const required = new Set([
  'index.html', 'moon-relic.css', '_headers', 'netlify.toml',
  'assets/filigree-rail.webp', 'assets/chrome-sigil.webp',
  'assets/liquid-silver.webp', 'assets/chrome-frame.png'
]);

try {
  if (!existsSync(archive)) throw new Error(
    'Upload the original BSEG_Moon_Relic_Web.zip to the repository root, beside this script. Do not unzip it or rename it.'
  );
  const zip = readFileSync(archive);
  if (createHash('sha256').update(zip).digest('hex') !== expected)
    throw new Error('Archive checksum does not match the preserved Moon Relic build. No app files were changed.');
  let end = -1;
  for (let i = zip.length - 22; i >= Math.max(0, zip.length - 65557); i--) {
    if (zip.readUInt32LE(i) === 0x06054b50 && i + 22 + zip.readUInt16LE(i + 20) === zip.length) { end = i; break; }
  }
  if (end < 0) throw new Error('Invalid ZIP directory.');
  const count = zip.readUInt16LE(end + 10);
  let pos = zip.readUInt32LE(end + 16);
  const entries = [];
  const seen = new Set();
  for (let n = 0; n < count; n++) {
    if (zip.readUInt32LE(pos) !== 0x02014b50) throw new Error('Invalid ZIP entry.');
    const method = zip.readUInt16LE(pos + 10);
    const packedSize = zip.readUInt32LE(pos + 20);
    const size = zip.readUInt32LE(pos + 24);
    const nameLen = zip.readUInt16LE(pos + 28);
    const extraLen = zip.readUInt16LE(pos + 30);
    const commentLen = zip.readUInt16LE(pos + 32);
    const local = zip.readUInt32LE(pos + 42);
    const name = zip.subarray(pos + 46, pos + 46 + nameLen).toString('utf8');
    pos += 46 + nameLen + extraLen + commentLen;
    if (!name.startsWith('BSEG_Web_Ready/')) throw new Error('Unexpected ZIP root.');
    const relative = name.slice('BSEG_Web_Ready/'.length);
    if (!required.has(relative) || seen.has(relative)) throw new Error('Unexpected or duplicate file: ' + relative);
    const target = resolve(root, relative);
    if (!target.startsWith(root + sep)) throw new Error('Unsafe ZIP path.');
    if (zip.readUInt32LE(local) !== 0x04034b50) throw new Error('Invalid ZIP data header.');
    const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
    const packed = zip.subarray(start, start + packedSize);
    const bytes = method === 0 ? packed : method === 8 ? inflateRawSync(packed) : null;
    if (!bytes || bytes.length !== size) throw new Error('Unsupported or corrupt entry: ' + relative);
    if (existsSync(target) && !readFileSync(target).equals(bytes))
      throw new Error('Existing app edits found in ' + relative + '. Refusing to overwrite them.');
    entries.push({relative, target, bytes});
    seen.add(relative);
  }
  if (seen.size !== required.size) throw new Error('The preserved archive is incomplete.');
  for (const {target, bytes} of entries) {
    mkdirSync(dirname(target), {recursive: true});
    writeFileSync(target, bytes);
  }
  console.log('Preserved BSEG app prepared in public/. Application source and assets are unchanged.');
  console.log('Cloudflare Pages: build command = node prepare-site.mjs; output directory = public');
} catch (error) {
  console.error('BSEG preparation stopped: ' + error.message);
  process.exitCode = 1;
}
