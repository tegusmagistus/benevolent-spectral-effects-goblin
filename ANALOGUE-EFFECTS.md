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

## Keeping footage detailed

Click **Crisp detail** in any Analogue inspector for Fine sampling, narrower lines, reduced geometric displacement, stronger edge definition and less glow. On particle/broken-line effects it reconnects traces into continuous lines. Colours, seed, effect mix and animation/audio settings stay as chosen; Undo reverses the shortcut and Reset restores the effect's original look.

- **Detail quality**: 1 Draft, 2 Fine, 3 Ultra. Increases source sampling and line segments; does not change canvas/export dimensions.
- **Shape clarity**: reduces geometric warping, channel offsets and particle drift, so features stay closer to their source positions.
- **Fine edge definition**: local luminance sharpening for eyes, hair, clothing and fine contrast; high amounts can also emphasise source noise.
- **Glow softness**: narrows the halo independently of its brightness.
- **Continuous lines**: reconnects dots and broken segments on the fragmenting effects; set to zero for the original breakup.
- **Line density**: now extends to 320. Excessively dense or thick lines can merge; combine with narrower line width.

Existing settings keep the original Draft sampling and neutral detail controls until adjusted. The detail shortcut is optional. It cannot reconstruct information absent from the uploaded footage.

## Performance and compatibility

The shared Canvas processor is reused in both WebGL stacks and Canvas fallback. Draft sampling is capped at 384 pixels on the longest edge and drawing at 960. Fine raises these to 768/1440 and Ultra to 1536/1920; line paths use 192/384/768 segments respectively. Quality caps avoid unbounded buffers; Ultra can substantially reduce playback speed on phones. Output keeps the existing chosen export resolution and aspect ratio. This deliberately limits fine detail at 4K. Buffers are reused across frames. Each analogue stage reads its source once; stacked reconstruction effects cost more than one stage. This is a CPU path, not a new GPU shader pipeline. Physical iPhone/Safari performance has not been verified.

Original artwork, layout, media audio and export controls remain intact. `analogue-build.mjs` injects the definitions and renderer into the preserved engine, fails on changed anchors and is safe to run repeatedly.

## Verification

Build: `node prepare-site.mjs` (also repeated for idempotence).

Regression: `node tests/verify-analogue.cjs` alongside existing session, preview, mobile, vertigo and depth suites in `.github/workflows/verify-depth.yml`.

The new test covers per-parameter pixel changes, seeded repeatability, static speed, bypass/zero strength, order dependence, numeric input, reset, serialization, search aliases, phone wrapping, moving H.264 input, audio/video export and a mixed WebGL/Canvas stack. See the linked CI result for actual pass/fail; the existence of the test is not evidence that it passed.

Detail controls release: [verification run 46035762336](https://github.com/tegusmagistus/benevolent-spectral-effects-goblin/actions/runs/46035762336) passed on commit `5bffbd1677b751a8847bf58eae912d61c7bd9003`. This includes all seven Analogue processors, per-control pixel changes, Crisp detail with undo/reset/save-reopen, mobile layout, moving-video export with audio, and the existing preview/session/vertigo/depth regression suites. Captured before/after frames show the shortcut reconnecting Rose Dust into finer continuous contours. Exported WebM decoded without errors. Physical Safari/iPhone performance remains unverified.


## Animated variations, overlays and original window

- **Horizontal Tide / Vertical Tide:** animated contour reconstruction. Line orientation selects vertical or horizontal lines independently of wave travel angle. Wave depth, frequency, angle and signed travel speed control displacement; negative speed reverses travel. Signal speed freezes all procedural animation at zero.
- **Living Mesh:** a crossed, moving brightness-relief grid over the original image. Original footage visibility blends the source underneath the grid. This does not infer facial topology or track a 3D face.
- **Silver Current:** monochrome moving contours with directional spatial echoes. Echo copies, distance and persistence control the repeated signal. These are spatial copies, not earlier video frames.
- **Cyber Glyphs:** original circuit sigils, reticles and instrument patterns on the existing footage. Controls: count, size, overlay opacity, stroke width, hue, saturation, glow, style, speed, drift, rotation and seed. It does not load external GIFs or emulate readable technical telemetry.
- **Original Window:** a movable/resizable rectangle restores the stack's incoming source. Put it last to preserve its clear area. In layer scope this is the layer before its effect chain; in master scope it is the incoming layer composite, including layer-level effects. Later effects and layer masks/transforms still apply. It is intentionally not automatic subject segmentation.

Original Window has X/Y, width, height, feather and optional frame controls. Drag its outline on the preview, use the lower-right resize handle, or press arrow keys (Shift for larger movement). Make window square uses actual canvas dimensions. Handles are editing-only and never enter exports. Frame colour only changes output when frame width is above zero. Multiple windows can be stacked. Rectangles stay within the image; their values are normalized so aspect and output size changes remain bounded.

All analogue signals now expose saturation: zero produces monochrome signal lines. On overlays, source footage retains its own colours. New controls default neutrally for existing saved effects. Preview and exports use timeline-driven, seeded procedural motion; no frame history is needed. Draft/Fine/Ultra and Crisp detail remain available on reconstruction effects. Original Window and Cyber Glyphs have their own relevant controls rather than an unrelated Crisp detail shortcut.

Verification command: `node tests/verify-analogue-motion.cjs`. Covers per-control pixels, moving and frozen signals, monochrome output, exact original-window interior pixels, bypass, real drag/resize/keyboard interaction, undo/reset/project serialization, phone layout, moving-video export/audio and mixed WebGL/Canvas stacks. Hardware mobile/Safari testing remains unverified; CPU cost increases with density, quality and stacked processors.
