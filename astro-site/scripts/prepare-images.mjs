// Trusted repository inputs only. Keep the dynamic contact page's images static
// so protected deployments never need a server-side request back to themselves.
import sharp from 'sharp';
for (const width of [768, 1024]) {
  await sharp('src/assets/images/sw-working-2.png').resize({ width }).webp({ quality: 80 }).toFile(`public/media/contact-background-${width}.webp`);
}
for (const [name, width] of [['logo-navbar', 720], ['logo-footer', 336]]) {
  await sharp(`src/assets/images/${name}.png`).resize({ width, withoutEnlargement: true }).webp({ quality: 85 }).toFile(`src/assets/images/${name}.webp`);
}

// Social metadata must not reuse the small browser favicon.
await sharp('src/assets/images/logo-footer.png').resize({ width: 1200, height: 630, fit: 'contain', background: '#ffffff' }).flatten({ background: '#ffffff' }).png({ palette: true }).toFile('public/media/brand-share.png');
