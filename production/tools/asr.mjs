// node asr.mjs <audio.wav>  — transcribes with Whisper (local) and prints timestamped chunks
import { pipeline } from "@huggingface/transformers";
import { execFileSync } from "child_process";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const ff = require("ffmpeg-static");
const file = process.argv[2];
const raw = execFileSync(ff, ["-v", "error", "-i", file, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], { maxBuffer: 1 << 28 });
const audio = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
const asr = await pipeline("automatic-speech-recognition", "Xenova/whisper-base.en", { dtype: "fp32" });
const out = await asr(audio, { chunk_length_s: 30, stride_length_s: 5, return_timestamps: true });
for (const c of out.chunks) console.log(`[${c.timestamp[0]?.toFixed(1)}–${c.timestamp[1]?.toFixed(1)}] ${c.text.trim()}`);
