// node tts.mjs <outDir> <voice> [speed]
import { KokoroTTS } from "kokoro-js";
import fs from "fs";
import path from "path";

const [, , OUT, VOICE = "bf_emma", SPEED = "1"] = process.argv;
fs.mkdirSync(OUT, { recursive: true });

// Script lines (UK English). "U.M.M." is spelled so the voice reads the letters.
const LINES = [
  "A furniture store adds AI recommendations, expecting a more personal shopping experience.",
  "But someone browsing for a small apartment gets shown oversized sofas, and dining tables beyond their budget.",
  "The system knows what they clicked. It's missing what matters to their decision.",
  "At U.M.M., that's where we'd start: what would make these recommendations useful?",
  "Perhaps it's asking about room size and budget. Perhaps the catalogue needs consistent dimensions, prices and availability.",
  "We bring those foundations together, build the recommendation experience, and test whether it helps customers choose.",
  "If AI personalisation is on your roadmap, let's work out what your business needs to make it work.",
];

const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "fp32", device: "cpu" });
for (let i = 0; i < LINES.length; i++) {
  const t0 = Date.now();
  const audio = await tts.generate(LINES[i], { voice: VOICE, speed: parseFloat(SPEED) });
  const file = path.join(OUT, `vo_${String(i + 1).padStart(2, "0")}.wav`);
  await audio.save(file);
  const dur = audio.audio.length / audio.sampling_rate;
  console.log(`${path.basename(file)}  ${dur.toFixed(2)}s  (${((Date.now() - t0) / 1000).toFixed(1)}s)  ${LINES[i]}`);
}
