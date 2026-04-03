import { mkdirSync } from "fs";
import { dirname, join } from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const BG_COLOR = { r: 243, g: 245, b: 252, alpha: 1 }; // hsl(225 56% 97%) = #f3f5fc
const ICON_SRC = join(root, "public/icons/android-chrome-192x192.png");

await sharp(ICON_SRC).resize(180, 180).toFile(join(root, "public/icons/apple-icon-180.png"));
console.log("✓ apple-icon-180.png");

const splashSizes = [
  [2048, 2732],
  [2732, 2048],
  [1668, 2388],
  [2388, 1668],
  [1640, 2360],
  [2360, 1640],
  [1536, 2048],
  [2048, 1536],
  [1290, 2796],
  [2796, 1290],
  [1179, 2556],
  [2556, 1179],
  [1284, 2778],
  [2778, 1284],
  [1170, 2532],
  [2532, 1170],
  [1125, 2436],
  [2436, 1125],
  [1242, 2688],
  [2688, 1242],
  [828, 1792],
  [1792, 828],
  [1242, 2208],
  [2208, 1242],
  [750, 1334],
  [1334, 750],
  [640, 1136],
  [1136, 640],
];

mkdirSync(join(root, "public/splash"), { recursive: true });

const ICON_512 = join(root, "public/icons/icon-512x512.png");

for (const [w, h] of splashSizes) {
  const iconSize = Math.round(Math.min(w, h) * 0.25);
  const iconBuffer = await sharp(ICON_512).resize(iconSize, iconSize).toBuffer();

  const left = Math.round((w - iconSize) / 2);
  const top = Math.round((h - iconSize) / 2);

  const filename = `apple-splash-${w}-${h}.jpg`;
  await sharp({
    create: { width: w, height: h, channels: 4, background: BG_COLOR },
  })
    .composite([{ input: iconBuffer, left, top }])
    .jpeg({ quality: 90 })
    .toFile(join(root, "public/splash", filename));

  console.log(`✓ ${filename}`);
}

console.log("\nDone!");
