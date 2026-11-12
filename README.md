# UMM Video: UX & Digital Commerce

"Making AI Personalisation Useful": a 50-second LinkedIn video for UMM Digital, in 4:5 (1080×1350).

The script is in `Core posts for UX & Digital Commerce.docx`.

## Latest render

`production/renders/UMM_AI-Personalisation_4x5_1080x1350_v4_male-voice.mp4`, with captions in `production/renders/UMM_AI-Personalisation_captions.srt`.

## Layout

| Path | Contents |
| --- | --- |
| `production/comp/` | The video as a seekable HTML composition (`index.html` is the current 4:5 cut) |
| `production/assets/` | Brand fonts and logos, footage and stock images |
| `production/audio/` | Voice-over takes (Kokoro TTS), music, and the mixes |
| `production/renders/` | Exported MP4s, poster frames and captions |
| `production/tools/` | Scripts that render frames, generate the voice-over and time the captions |

## Re-rendering

You need Node.js and Google Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`.

```sh
cd production/tools
npm install
# all frames of the 50 s cut at 30 fps
node render.js .. <framesDir> frames 50
# only frames a..b, e.g. after a small change
node render.js .. <framesDir> range 300:420
# voice-over: voice bm_fable, speed 1.05
node tts.mjs <outDir> bm_fable 1.05
```

`render.js` only saves PNG frames. Put them together with the audio mix (`production/audio/mix_v3_male.wav`) in ffmpeg at 30 fps.

The fonts and stock media are licensed, so keep this repository private.
