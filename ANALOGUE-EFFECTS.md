# Analogue signal effects

Seven additive processors in the existing Goblin editor, under **Analogue**. Search aliases: `analog`, `analogue`, `analoge`, `CRT`, `phosphor`, `oscilloscope`.

| Effect | Output |
| --- | --- |
| Analogue / Contour | Luminance-displaced luminous lines on black |
| Analogue / RGB Phosphor | Broken CRT lines, coloured channel offsets and raster texture |
| Analogue / Signal Dissolve | Contour lines breaking into seeded drifting light particles |
| Analogue / Wirefield | Crossed line mesh displaced by source brightness |
| Analogue / Rose Dust | Soft pink contours with fine phosphor grains and gentle particle drift |
| Analogue / Neon Veil | Violet contours with a separately coloured hot pink halo and signal breakup |
| Analogue / Coral Interference | Coral/pink highlights and violet shadows, with animated wave interference and torn bands |

These are digital simulations of analogue signal aesthetics. They do not claim to reproduce a particular hardware circuit. For the supplied reference look, use a brightly lit face or body against a dark, uncluttered background. Shadow cutoff controls which dark areas disappear. Bright backgrounds will also produce lines. No semantic background removal, facial tracking or true 3D reconstruction is implied.

Rose Dust starts with brighter grains and restrained drift to keep portrait features legible. Increase Dissolution and Particle drift for a more fragmented silhouette, or reduce them to retain continuous contours. Neon Veil has independent signal and halo colours.

## Controls

Line density, contour displacement, shadow cutoff, line width, glow, hue, signal instability, speed and seed affect the actual rendered image. RGB Phosphor adds channel separation. Signal Dissolve adds dissolution and drift. Rose Dust adds grain size, breakup and drift; Neon Veil adds independent halo colour and colour separation; Coral Interference adds shadow colour, interference depth and wave frequency. Search `pink` to find these three looks. Strength blends with the source; the initial value is 100%. Speed zero freezes procedural motion, but moving source video still moves. The seed and timeline time reproduce signal patterns; live audio response remains dependent on the existing audio engine.

These effects use the existing layer/master stacks, enable/bypass, strength keyframes, audio strength modulation, presets, project settings, reset and Clear VFX. Effect-specific parameters use existing sliders and numeric inputs; they do not yet have their own automation lanes. Apply one reconstruction processor first, then add optical effects or temporal effects as desired. Order remains meaningful.

## Performance and compatibility

The shared Canvas processor is reused in both WebGL stacks and Canvas fallback. Sampling is capped at 384 pixels on the longest edge and the signal drawing surface at 960; output keeps the existing chosen export resolution and aspect ratio. This deliberately limits fine detail at 4K. Buffers are reused across frames. Each analogue stage reads its source once; stacked reconstruction effects cost more than one stage. This is a CPU path, not a new GPU shader pipeline. Physical iPhone/Safari performance has not been verified.

Original artwork, layout, media audio and export controls remain intact. `analogue-build.mjs` injects the definitions and renderer into the preserved engine, fails on changed anchors and is safe to run repeatedly.

## Verification

Build: `node prepare-site.mjs` (also repeated for idempotence).

Regression: `node tests/verify-analogue.cjs` alongside existing session, preview, mobile, vertigo and depth suites in `.github/workflows/verify-depth.yml`.

The new test covers per-parameter pixel changes, seeded repeatability, static speed, bypass/zero strength, order dependence, numeric input, reset, serialization, search aliases, phone wrapping, moving H.264 input, audio/video export and a mixed WebGL/Canvas stack. See the linked CI result for actual pass/fail; the existence of the test is not evidence that it passed.
