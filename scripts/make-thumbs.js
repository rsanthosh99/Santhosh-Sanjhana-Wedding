import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const sourceDir = process.argv[2];
const outDir = path.join(process.cwd(), 'thumbs');

if (!sourceDir) {
  console.error("❌ Please provide a source directory!");
  console.error('Usage: npm run make-thumbs "C:\\path\\to\\your\\photos"');
  process.exit(1);
}

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.heic']);

async function processDirectory(dir, relativePath = '') {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const entryRelativePath = path.join(relativePath, entry.name);
    const outPath = path.join(outDir, entryRelativePath);

    if (entry.isDirectory()) {
      await processDirectory(fullPath, entryRelativePath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (IMAGE_EXTENSIONS.has(ext)) {
        await fs.mkdir(path.dirname(outPath), { recursive: true });
        
        // Skip if thumb already exists
        try {
          await fs.access(outPath);
          console.log(`Skipping (already exists): ${entryRelativePath}`);
          continue;
        } catch {}

        console.log(`Compressing: ${entryRelativePath}`);
        try {
          await sharp(fullPath)
            .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 75, progressive: true })
            .toFile(outPath);
        } catch (err) {
          console.error(`❌ Failed to process ${entryRelativePath}:`, err.message);
        }
      }
    }
  }
}

async function run() {
  try {
    const stat = await fs.stat(sourceDir);
    if (!stat.isDirectory()) {
      throw new Error("Provided path is not a directory.");
    }
    await fs.mkdir(outDir, { recursive: true });
    console.log(`📸 Processing photos from: ${sourceDir}`);
    console.log(`📦 Outputting thumbs to: ${outDir}\n`);
    await processDirectory(sourceDir);
    console.log("\n✅ Done! Now just upload the entire 'thumbs' folder to the root of your GCS bucket.");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

run();
