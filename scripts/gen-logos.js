const fs = require("fs");
const path = require("path");
const icons = require("simple-icons");

const outDir = path.join(process.cwd(), "public", "brands");
fs.mkdirSync(outDir, { recursive: true });

const map = {
  toyota: "toyota.svg",
  mazda: "mazda.svg",
  hyundai: "hyundai.svg",
  kia: "kia.svg",
  ford: "ford.svg",
  mitsubishi: "mitsubishi.svg",
  subaru: "subaru.svg",
  nissan: "nissan.svg",
  honda: "honda.svg",
  bmw: "bmw.svg",
  mercedesbenz: "mercedes.svg",
  audi: "audi.svg",
};

for (const [slug, filename] of Object.entries(map)) {
  const key = "si" + slug[0].toUpperCase() + slug.slice(1);
  const icon = icons[key];
  if (!icon) continue;
  const svg = icon.svg.replace("<svg", `<svg fill="#${icon.hex}"`);
  fs.writeFileSync(path.join(outDir, filename), svg, "utf8");
  console.log("Wrote", filename);
}

// Holden: não existe no simple-icons → placeholder clean
const holden = `
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="64" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="28" fill="none" stroke="#c0202a" stroke-width="4"/>
  <path d="M22 40c6 2 14 2 20-3 3-3 4-8 1-12-2-3-6-5-10-5-4 0-8 2-10 5-2 3-2 6 0 9 1 2 3 3 5 4-2 1-4 1-6 2z"
        fill="#c0202a" opacity="0.92"/>
</svg>`;
fs.writeFileSync(path.join(outDir, "holden.svg"), holden.trim(), "utf8");
console.log("Wrote holden.svg");
