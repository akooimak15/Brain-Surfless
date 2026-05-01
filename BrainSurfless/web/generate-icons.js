#!/usr/bin/env node

/**
 * Generate PWA icons for Brain Surfless
 * Run: node web/generate-icons.js
 * 
 * Creates placeholder icons in web/public/icons/
 * (Replace with actual design later)
 */

const fs = require('fs');
const path = require('path');

// Try to use canvas if available; otherwise skip
let canvas;
try {
  const { createCanvas } = require('canvas');
  canvas = createCanvas;
} catch (e) {
  console.warn('canvas module not found. Install with: npm install --save-dev canvas');
  console.warn('Skipping icon generation. Please provide custom icons in web/public/icons/');
  process.exit(0);
}

const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create simple icons with gradient background and text
function generateIcon(size, text = 'BS') {
  const c = canvas(size, size);
  const ctx = c.getContext('2d');

  // Gradient background: dark blue to purple
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#1a1a1a');
  gradient.addColorStop(1, '#333333');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Center text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(size * 0.4)}px -apple-system, BlinkMacSystemFont, "Segoe UI"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, size / 2, size / 2);

  return c.toBuffer('image/png');
}

// Generate sizes
const sizes = [96, 192, 512];
sizes.forEach(size => {
  const buf = generateIcon(size);
  const filePath = path.join(iconsDir, `icon-${size}x${size}.png`);
  fs.writeFileSync(filePath, buf);
  console.log(`✓ Created ${filePath}`);

  // Maskable variant
  const maskablePath = path.join(iconsDir, `icon-${size}x${size}-maskable.png`);
  fs.writeFileSync(maskablePath, buf);
  console.log(`✓ Created ${maskablePath}`);
});

// Simple screenshots (192x108 and 540x720)
function generateScreenshot(width, height) {
  const c = canvas(width, height);
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#111111';
  ctx.font = `bold ${Math.round(height * 0.08)}px -apple-system`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Brain Surfless', width / 2, height / 2);

  return c.toBuffer('image/png');
}

const screenshotSizes = [[192, 108], [540, 720]];
screenshotSizes.forEach(([w, h]) => {
  const buf = generateScreenshot(w, h);
  const filePath = path.join(iconsDir, `screenshot-${w}x${h}.png`);
  fs.writeFileSync(filePath, buf);
  console.log(`✓ Created ${filePath}`);
});

console.log('\n✨ Icons generated successfully!');
console.log('(Replace with actual designs in production)');
