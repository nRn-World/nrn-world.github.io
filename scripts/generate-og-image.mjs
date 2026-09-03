import fs from 'node:fs';
import sharp from 'sharp';

async function createOgImage() {
  const svg = `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="grad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stop-color="#bc13fe" stop-opacity="0.25"/>
        <stop offset="50%" stop-color="#3b82f6" stop-opacity="0.10"/>
        <stop offset="100%" stop-color="#0a0a0f" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0c0d12"/>
        <stop offset="100%" stop-color="#07080b"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <rect width="1200" height="630" fill="url(#grad)"/>
    <rect x="60" y="60" width="1080" height="510" rx="24" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="2"/>
    
    <text x="600" y="270" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="900" font-size="72" fill="#ffffff" text-anchor="middle" letter-spacing="-1">n<tspan fill="#3b82f6">R</tspan>nWorld</text>
    
    <text x="600" y="340" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="500" font-size="28" fill="#a1a1aa" text-anchor="middle">Project Hub &amp; Direct Downloads for Windows Utilities &amp; AI Tools</text>
    
    <text x="600" y="420" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="700" font-size="20" fill="#3b82f6" text-anchor="middle" letter-spacing="2">19 VERIFIED OPEN SOURCE PROJECTS • DIRECT OFFICIAL RELEASES</text>
  </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile('public/og-image.png');

  console.log('Created public/og-image.png (1200x630)');
}

createOgImage();
