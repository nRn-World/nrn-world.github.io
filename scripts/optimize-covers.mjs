import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const OUT_DIR = path.resolve('public/images/projects');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const raw = (repo, branch, filePath) =>
  `https://raw.githubusercontent.com/nRn-World/${repo}/${branch}/${filePath
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;

const og = (repo) => `https://opengraph.githubassets.com/1/nRn-World/${repo}`;

const COVERS = {
  shadowPaw: raw('ShadowPaw', 'main', 'public/icon.svg'),
  doggyPlayer: raw('Doggy-Player', 'main', 'Logo Bilder/logoW-cropped-no-bg1024x1024.png'),
  windowsSmartTaskbar: raw('WindowsSmartTaskbar', 'main', 'logo.png'),
  nobreakAudioBuilder: raw('NOBreak-Audio-Builder', 'master', 'Icon/Icon-no-bg.png'),
  octosArmy: raw('OctosArmy', 'main', 'Logo/OSAI-no-bg.png'),
  theSilentRoom1986: 'https://raw.githubusercontent.com/RobinAyzit/The-Silent-Room-1986/master/logo.png',
  farmGuardianTd: raw('Farm-Guardian-TD', 'main', 'public/icons/icon-512.png'),
  neonPathPuzzle: raw('NeonPathPuzzle', 'main', 'assets/icon.png'),
  doneTogether: raw('DoneTogether', 'main', 'public/pwa-icon.png'),
  nexNote: raw('NexNote', 'main', 'logo-no-bg.png'),
  secretPrompts: raw('SecretPromts', 'master', 'logo/SP-no-bg.png'),
  siteScannerPro: og('SiteScannerPro'),
  globalEmergency: raw('GLOBAL_EMERGENCY', 'main', 'public/app-icon.svg'),
  privateLinkSaver: raw('PrivateLinkSaver', 'main', 'icons/FullLogo_Transparent.png'),
  bugraider: og('BUGRAIDER'),
  bluetoothSafetyLock: raw('BluetoothSafetyLock', 'main', 'bluetooth-safetylock-logo.png'),
  flashVideoDownloader: raw('FlashVideoDownloader', 'main', 'icons/icon128.png'),
  notePin: raw('NotePin', 'main', 'Logo/Logo.png'),
  parkeraISthlm: raw('ParkeraiSthlm', 'master', 'public/icon-512.png'),
};

async function optimizeAll() {
  console.log('Downloading and optimizing 19 project covers...');
  let totalOriginalBytes = 0;
  let totalOptimizedBytes = 0;

  for (const [key, url] of Object.entries(COVERS)) {
    try {
      console.log(`Fetching ${key}...`);
      const res = await fetch(url, {
        headers: { 'User-Agent': 'nRnWorld-Asset-Optimizer' }
      });
      if (!res.ok) {
        console.warn(`Failed fetching ${key} from ${url}: ${res.status}`);
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      totalOriginalBytes += buffer.length;

      const outWebpPath = path.join(OUT_DIR, `${key}.webp`);

      if (url.endsWith('.svg')) {
        const outSvgPath = path.join(OUT_DIR, `${key}.svg`);
        fs.writeFileSync(outSvgPath, buffer);
        totalOptimizedBytes += buffer.length;
        console.log(`Saved SVG ${key}: ${(buffer.length / 1024).toFixed(1)} KB`);
      } else {
        // Optimize to WebP with max width 400px
        const optBuffer = await sharp(buffer)
          .resize({ width: 400, height: 400, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85, effort: 6 })
          .toBuffer();
        
        fs.writeFileSync(outWebpPath, optBuffer);
        totalOptimizedBytes += optBuffer.length;
        console.log(`Saved WebP ${key}: ${(buffer.length / 1024).toFixed(1)} KB -> ${(optBuffer.length / 1024).toFixed(1)} KB`);
      }
    } catch (err) {
      console.error(`Error processing ${key}:`, err.message);
    }
  }

  console.log('===================================');
  console.log(`Total original: ${(totalOriginalBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Total optimized: ${(totalOptimizedBytes / 1024).toFixed(1)} KB`);
  console.log(`Savings: ${((1 - totalOptimizedBytes / totalOriginalBytes) * 100).toFixed(1)}%`);
}

optimizeAll();
