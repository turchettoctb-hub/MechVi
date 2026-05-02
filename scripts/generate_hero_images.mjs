import fs from "fs";
import path from "path";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY not found. Put it in .env.local or set as env var.");
  process.exit(1);
}

const outDir = path.join(process.cwd(), "public", "hero");

// Dark Premium, “car ad campaign” (sem marcas/logos/texto).
// Evitamos crianças/adolescentes para não cair em guardrails.
const prompts = [
  {
    file: "1.jpg",
    prompt: `
Ultra-premium automotive campaign photo, cinematic night, rain-soaked street, reflections, neon bokeh.
Subject: sleek unbranded performance coupe silhouette (NO logos), low angle, aggressive stance, tasteful luxury.
Shot style: ARRI Alexa look, 35mm lens, shallow depth of field, high contrast, crisp details, realistic color grading.
No text, no watermark, no logos, no license plates, no brand emblems.
`.trim(),
  },
  {
    file: "2.jpg",
    prompt: `
Ultra-premium automotive campaign photo inside a modern luxury garage at night.
Subject: unbranded SUV/pickup silhouette (NO logos), soft LED strips, glossy concrete floor, minimalistic premium architecture.
Shot style: cinematic, wide 16:9 composition, subtle haze, high-end magazine look, sharp.
No text, no watermark, no logos, no license plates.
`.trim(),
  },
  {
    file: "3.jpg",
    prompt: `
Futuristic premium automotive UI vibe (still photoreal).
Scene: driver POV inside a modern unbranded car at night, luxury interior, soft ambient lighting, minimal HUD glow (NO readable text), rain on windshield, city lights bokeh.
Shot style: ultra-real, cinematic, high contrast, luxury tech aesthetic.
No readable text, no watermark, no logos.
`.trim(),
  },
  {
    file: "4.jpg",
    prompt: `
Premium off-road adventure photo at sunrise, cinematic wide shot.
Subject: unbranded rugged 4x4 silhouette (NO logos) on a coastal cliff road, ocean mist, golden hour light, dramatic sky.
Shot style: high-end travel magazine, crisp detail, realistic grading.
No text, no watermark, no logos, no license plates.
`.trim(),
  },
  {
    file: "5.jpg",
    prompt: `
Premium workshop macro photo, cinematic.
Close-up: mechanic hands with gloves inspecting brake rotor and pads with a flashlight, ultra-detailed metal textures, moody workshop lighting, shallow depth of field.
No brand logos, no text, no watermark.
`.trim(),
  },
];

async function generateWith(model) {
  console.log("Using model:", model);
  for (let i = 0; i < prompts.length; i++) {
    const p = prompts[i];
    const outPath = path.join(outDir, p.file);
    console.log(`[${i + 1}/5] Generating ${p.file} ...`);

    const resp = await client.images.generate({
      model,
      prompt: p.prompt,
      size: "1792x1024",
      // GPT Image models accept quality; if your account rejects it, remove the line.
      quality: "high",
      response_format: "b64_json",
    });

    const b64 = resp.data?.[0]?.b64_json;
    if (!b64) throw new Error("No b64_json returned (check model access/billing).");

    fs.writeFileSync(outPath, Buffer.from(b64, "base64"));
    console.log("✅ Saved:", outPath);
  }
}

async function run() {
  // Prefer GPT Image (best quality). Fallback to dall-e-3 if you don't have access.
  try {
    await generateWith("gpt-image-1");
  } catch (e) {
    console.warn("⚠️ gpt-image-1 failed, falling back to dall-e-3. Error:", e?.message || e);
    await generateWith("dall-e-3");
  }

  console.log("\n🎉 Done. Images overwritten in /public/hero.");
  console.log("Now clear Next cache: delete .next and restart dev server.");
}

run().catch((e) => {
  console.error("❌ Failed:", e?.message || e);
  process.exit(1);
});
