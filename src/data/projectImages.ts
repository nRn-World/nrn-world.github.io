/** Officiella projektbilder från GitHub – logotyp först (framsida), sedan skärmdumpar (detaljsida). */
const raw = (repo: string, branch: string, path: string) =>
  `https://raw.githubusercontent.com/nRn-World/${repo}/${branch}/${path
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;

const og = (repo: string) => `https://opengraph.githubassets.com/1/nRn-World/${repo}`;

export const PROJECT_IMAGES = {
  shadowPaw: [
    '/images/projects/shadowPaw.svg',
    raw('ShadowPaw', 'main', 'Screenshot/main-menu.png'),
    raw('ShadowPaw', 'main', 'Screenshot/gameplay.png'),
    raw('ShadowPaw', 'main', 'Screenshot/Gameover.png'),
  ],
  doggyPlayer: [
    '/images/projects/doggyPlayer.webp',
    raw('Doggy-Player', 'main', 'Screenshot/Sc2.png'),
    raw('Doggy-Player', 'main', 'Screenshot/Sc3.png'),
    raw('Doggy-Player', 'main', 'Screenshot/Sc1.png'),
    raw('Doggy-Player', 'main', 'Screenshot/Movie.png'),
  ],
  windowsSmartTaskbar: [
    '/images/projects/windowsSmartTaskbar.webp',
    raw('WindowsSmartTaskbar', 'main', 'Screenshot/Screenshot 2.png'),
    raw('WindowsSmartTaskbar', 'main', 'Screenshot/Screenshot 3.png'),
    raw('WindowsSmartTaskbar', 'main', 'Screenshot/Screenshot 1.png'),
  ],
  nobreakAudioBuilder: [
    '/images/projects/nobreakAudioBuilder.webp',
    raw('NOBreak-Audio-Builder', 'master', 'Screenshot/SC1.png'),
    raw('NOBreak-Audio-Builder', 'master', 'Screenshot/SC2.png'),
    raw('NOBreak-Audio-Builder', 'master', 'Screenshot/SC3png.png'),
    raw('NOBreak-Audio-Builder', 'master', 'Screenshot/SC4png.png'),
    raw('NOBreak-Audio-Builder', 'master', 'Screenshot/SC5png.png'),
  ],
  octosArmy: [
    '/images/projects/octosArmy.webp',
    raw('OctosArmy', 'main', 'Screenshots/Start.png'),
    raw('OctosArmy', 'main', 'Screenshots/Start2.png'),
    raw('OctosArmy', 'main', 'Screenshots/Agents.png'),
    raw('OctosArmy', 'main', 'Screenshots/Finish.png'),
  ],
  theSilentRoom1986: [
    '/images/projects/theSilentRoom1986.webp',
    og('TheSilentRoom1986'),
  ],
  farmGuardianTd: [
    '/images/projects/farmGuardianTd.webp',
    raw('Farm-Guardian-TD', 'main', 'screenshots/desktop-home.png'),
    raw('Farm-Guardian-TD', 'main', 'screenshots/professional-battle-390.png'),
    raw('Farm-Guardian-TD', 'main', 'screenshots/campaign-2026-390.png'),
    raw('Farm-Guardian-TD', 'main', 'screenshots/mobile-battle.png'),
  ],
  neonPathPuzzle: [
    '/images/projects/neonPathPuzzle.webp',
    raw('NeonPathPuzzle', 'main', 'screenshots/main-menu.png'),
    raw('NeonPathPuzzle', 'main', 'screenshots/gameplay.png'),
    raw('NeonPathPuzzle', 'main', 'screenshots/level-complete.png'),
    raw('NeonPathPuzzle', 'main', 'screenshots/themes.png'),
  ],
  doneTogether: [
    '/images/projects/doneTogether.webp',
    raw('DoneTogether', 'main', 'screenshot/login.png'),
    raw('DoneTogether', 'main', 'screenshot/create.png'),
    raw('DoneTogether', 'main', 'screenshot/creat2.png'),
  ],
  nexNote: [
    '/images/projects/nexNote.webp',
    raw('NexNote', 'main', 'Screenshots/Start.png'),
    raw('NexNote', 'main', 'Screenshots/1.png'),
    raw('NexNote', 'main', 'Screenshots/2.png'),
    raw('NexNote', 'main', 'Screenshots/3.png'),
  ],
  secretPrompts: [
    '/images/projects/secretPrompts.webp',
  ],
  siteScannerPro: [
    '/images/projects/siteScannerPro.webp',
  ],
  globalEmergency: [
    '/images/projects/globalEmergency.svg',
    raw('GLOBAL_EMERGENCY', 'main', 'public/app-icon-maskable.svg'),
  ],
  privateLinkSaver: [
    '/images/projects/privateLinkSaver.webp',
    raw('PrivateLinkSaver', 'main', 'Screenshot/Start1.png'),
    raw('PrivateLinkSaver', 'main', 'Screenshot/Menu.png'),
    raw('PrivateLinkSaver', 'main', 'Screenshot/Menu2.png'),
    raw('PrivateLinkSaver', 'main', 'Screenshot/Settings.png'),
  ],
  bugraider: [
    '/images/projects/bugraider.webp',
    raw('BUGRAIDER', 'main', 'Screenshots/Finish.png'),
    raw('BUGRAIDER', 'main', 'Screenshots/Finisher.png'),
  ],
  bluetoothSafetyLock: [
    '/images/projects/bluetoothSafetyLock.webp',
    raw('BluetoothSafetyLock', 'main', 'Screenshot/Start.png'),
    raw('BluetoothSafetyLock', 'main', 'Screenshot/Add Device.png'),
    raw('BluetoothSafetyLock', 'main', 'Screenshot/Security Actions.png'),
    raw('BluetoothSafetyLock', 'main', 'Screenshot/Settings.png'),
  ],
  flashVideoDownloader: [
    '/images/projects/flashVideoDownloader.webp',
    raw('FlashVideoDownloader', 'main', 'Screenshots/SC1.png'),
    raw('FlashVideoDownloader', 'main', 'Screenshots/SC2.png'),
    raw('FlashVideoDownloader', 'main', 'Screenshots/SC3.png'),
  ],
  notePin: [
    '/images/projects/notePin.webp',
    raw('NotePin', 'main', 'Screenshot/SC1.png'),
    raw('NotePin', 'main', 'Screenshot/SC2.png'),
    raw('NotePin', 'main', 'Screenshot/SC3.png'),
    raw('NotePin', 'main', 'Screenshot/SC4.png'),
  ],
  parkeraISthlm: [
    '/images/projects/parkeraISthlm.webp',
    raw('ParkeraiSthlm', 'master', 'public/icon-192.png'),
  ],
} as const;
