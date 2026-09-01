/** Officiella projektbilder från GitHub – logotyp först (framsida), sedan skärmdumpar (detaljsida). */
const raw = (repo: string, branch: string, path: string) =>
  `https://raw.githubusercontent.com/nRn-World/${repo}/${branch}/${path
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;

const og = (repo: string) => `https://opengraph.githubassets.com/1/nRn-World/${repo}`;

export const PROJECT_IMAGES = {
  shadowPaw: [
    raw('ShadowPaw', 'main', 'public/icon.svg'),
    raw('ShadowPaw', 'main', 'Screenshot/main-menu.png'),
    raw('ShadowPaw', 'main', 'Screenshot/gameplay.png'),
    raw('ShadowPaw', 'main', 'Screenshot/Gameover.png'),
  ],
  doggyPlayer: [
    raw('Doggy-Player', 'main', 'Logo Bilder/logoW-cropped-no-bg1024x1024.png'),
    raw('Doggy-Player', 'main', 'Screenshot/Sc2.png'),
    raw('Doggy-Player', 'main', 'Screenshot/Sc3.png'),
    raw('Doggy-Player', 'main', 'Screenshot/Sc1.png'),
    raw('Doggy-Player', 'main', 'Screenshot/Movie.png'),
  ],
  windowsSmartTaskbar: [
    raw('WindowsSmartTaskbar', 'main', 'logo.png'),
    raw('WindowsSmartTaskbar', 'main', 'Screenshot/Screenshot 2.png'),
    raw('WindowsSmartTaskbar', 'main', 'Screenshot/Screenshot 3.png'),
    raw('WindowsSmartTaskbar', 'main', 'Screenshot/Screenshot 1.png'),
  ],
  nobreakAudioBuilder: [
    raw('NOBreak-Audio-Builder', 'master', 'Icon/Icon-no-bg.png'),
    raw('NOBreak-Audio-Builder', 'master', 'Screenshot/SC1.png'),
    raw('NOBreak-Audio-Builder', 'master', 'Screenshot/SC2.png'),
    raw('NOBreak-Audio-Builder', 'master', 'Screenshot/SC3png.png'),
    raw('NOBreak-Audio-Builder', 'master', 'Screenshot/SC4png.png'),
    raw('NOBreak-Audio-Builder', 'master', 'Screenshot/SC5png.png'),
  ],
  octosArmy: [
    raw('OctosArmy', 'main', 'Logo/OSAI-no-bg.png'),
    raw('OctosArmy', 'main', 'Screenshots/Start.png'),
    raw('OctosArmy', 'main', 'Screenshots/Start2.png'),
    raw('OctosArmy', 'main', 'Screenshots/Agents.png'),
    raw('OctosArmy', 'main', 'Screenshots/Finish.png'),
  ],
  theSilentRoom1986: [
    'https://raw.githubusercontent.com/RobinAyzit/The-Silent-Room-1986/master/logo.png',
    og('TheSilentRoom1986'),
  ],
  farmGuardianTd: [
    raw('Farm-Guardian-TD', 'main', 'public/icons/icon-512.png'),
    raw('Farm-Guardian-TD', 'main', 'screenshots/desktop-home.png'),
    raw('Farm-Guardian-TD', 'main', 'screenshots/professional-battle-390.png'),
    raw('Farm-Guardian-TD', 'main', 'screenshots/campaign-2026-390.png'),
    raw('Farm-Guardian-TD', 'main', 'screenshots/mobile-battle.png'),
  ],
  neonPathPuzzle: [
    raw('NeonPathPuzzle', 'main', 'assets/icon.png'),
    raw('NeonPathPuzzle', 'main', 'screenshots/main-menu.png'),
    raw('NeonPathPuzzle', 'main', 'screenshots/gameplay.png'),
    raw('NeonPathPuzzle', 'main', 'screenshots/level-complete.png'),
    raw('NeonPathPuzzle', 'main', 'screenshots/themes.png'),
  ],
  doneTogether: [
    raw('DoneTogether', 'main', 'public/pwa-icon.png'),
    raw('DoneTogether', 'main', 'screenshot/login.png'),
    raw('DoneTogether', 'main', 'screenshot/create.png'),
    raw('DoneTogether', 'main', 'screenshot/creat2.png'),
  ],
  nexNote: [
    raw('NexNote', 'main', 'logo-no-bg.png'),
    raw('NexNote', 'main', 'Screenshots/Start.png'),
    raw('NexNote', 'main', 'Screenshots/1.png'),
    raw('NexNote', 'main', 'Screenshots/2.png'),
    raw('NexNote', 'main', 'Screenshots/3.png'),
  ],
  secretPrompts: [
    raw('SecretPromts', 'master', 'logo/SP-no-bg.png'),
  ],
  siteScannerPro: [
    og('SiteScannerPro'),
  ],
  globalEmergency: [
    raw('GLOBAL_EMERGENCY', 'main', 'public/app-icon.svg'),
    raw('GLOBAL_EMERGENCY', 'main', 'public/app-icon-maskable.svg'),
  ],
  privateLinkSaver: [
    raw('PrivateLinkSaver', 'main', 'icons/FullLogo_Transparent.png'),
    raw('PrivateLinkSaver', 'main', 'Screenshot/Start1.png'),
    raw('PrivateLinkSaver', 'main', 'Screenshot/Menu.png'),
    raw('PrivateLinkSaver', 'main', 'Screenshot/Menu2.png'),
    raw('PrivateLinkSaver', 'main', 'Screenshot/Settings.png'),
  ],
  bugraider: [
    og('BUGRAIDER'),
    raw('BUGRAIDER', 'main', 'Screenshots/Finish.png'),
    raw('BUGRAIDER', 'main', 'Screenshots/Finisher.png'),
  ],
  bluetoothSafetyLock: [
    raw('BluetoothSafetyLock', 'main', 'bluetooth-safetylock-logo.png'),
    raw('BluetoothSafetyLock', 'main', 'Screenshot/Start.png'),
    raw('BluetoothSafetyLock', 'main', 'Screenshot/Add Device.png'),
    raw('BluetoothSafetyLock', 'main', 'Screenshot/Security Actions.png'),
    raw('BluetoothSafetyLock', 'main', 'Screenshot/Settings.png'),
  ],
  flashVideoDownloader: [
    raw('FlashVideoDownloader', 'main', 'icons/icon128.png'),
    raw('FlashVideoDownloader', 'main', 'Screenshots/SC1.png'),
    raw('FlashVideoDownloader', 'main', 'Screenshots/SC2.png'),
    raw('FlashVideoDownloader', 'main', 'Screenshots/SC3.png'),
  ],
  notePin: [
    raw('NotePin', 'main', 'Logo/Logo.png'),
    raw('NotePin', 'main', 'Screenshot/SC1.png'),
    raw('NotePin', 'main', 'Screenshot/SC2.png'),
    raw('NotePin', 'main', 'Screenshot/SC3.png'),
    raw('NotePin', 'main', 'Screenshot/SC4.png'),
  ],
  parkeraISthlm: [
    raw('ParkeraiSthlm', 'master', 'public/icon-512.png'),
    raw('ParkeraiSthlm', 'master', 'public/icon-192.png'),
  ],
} as const;
