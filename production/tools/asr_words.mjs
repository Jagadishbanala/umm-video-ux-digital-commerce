// node asr_words.mjs <audio.wav> — Whisper word-level timestamps
import { pipeline } from "@huggingface/transformers";
import { execFileSync } from "child_process";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const ff = require("ffmpeg-static");
const raw = execFileSync(ff, ["-v", "error", "-i", process.argv[2], "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], { maxBuffer: 1 << 28 });
const audio = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
const asr = await pipeline("automatic-speech-recognition", "Xenova/whisper-base.en", { dtype: "fp32" });
const out = await asr(audio, { chunk_length_s: 30, stride_length_s: 5, return_timestamps: "word" });
console.log(out.text.trim()); console.log("---");
console.log(out.chunks.map(c => `${c.timestamp[0]?.toFixed(2)} ${c.text.trim()}`).join("\n"));
