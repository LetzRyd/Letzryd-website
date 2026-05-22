import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const assetDir = path.join(root, "public", "replica-assets");
const textFiles = [
  path.join(root, "src", "generated", "pages.json"),
  path.join(root, "src", "styles", "replica.css"),
  path.join(root, "app", "layout.tsx"),
];

function realExtension(buffer) {
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return ".jpg";
  if (buffer[0] === 0x89 && buffer.toString("ascii", 1, 4) === "PNG") return ".png";
  if (buffer.toString("ascii", 0, 3) === "GIF") return ".gif";
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return ".webp";
  if (buffer.toString("ascii", 0, 4) === "%PDF") return ".pdf";
  if (buffer.toString("ascii", 4, 8) === "ftyp") return ".mp4";
  return null;
}

async function replaceInTextFiles(replacements) {
  for (const file of textFiles) {
    let text = await fs.readFile(file, "utf8");
    for (const [from, to] of replacements) {
      text = text.split(from).join(to);
    }
    await fs.writeFile(file, text);
  }
}

async function main() {
  const entries = await fs.readdir(assetDir);
  const replacements = [];

  for (const name of entries) {
    const filePath = path.join(assetDir, name);
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) continue;

    const buffer = await fs.readFile(filePath);
    const expectedExt = realExtension(buffer);
    if (!expectedExt) continue;

    const currentExt = path.extname(name).toLowerCase();
    if (currentExt === expectedExt) continue;

    const nextName = `${name.slice(0, -currentExt.length)}${expectedExt}`;
    const nextPath = path.join(assetDir, nextName);
    await fs.rename(filePath, nextPath);
    replacements.push([`/replica-assets/${name}`, `/replica-assets/${nextName}`]);
  }

  if (replacements.length) {
    await replaceInTextFiles(replacements);
  }

  console.log(`Normalized ${replacements.length} asset extension(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
