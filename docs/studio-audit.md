# Goblin studio audit

Baseline commit: `a4749fa`. The [baseline CI run](https://github.com/tegusmagistus/benevolent-spectral-effects-goblin/actions/runs/43183273844) passed the production build, preview interactions, shader and export regression suite, and live Depth Lab check.

## Architecture

| Area | Current implementation | Constraint |
| --- | --- | --- |
| Build and hosting | Framework-free HTML, CSS and JavaScript. `node prepare-site.mjs` validates the preserved bundle and applies console, GPU, header and Depth Lab transforms. Wrangler serves static assets from `public/`. | Generated HTML is assembled from several source files. Keep edits in those sources and test the assembled build. Runtime hosting needs no environment variables. |
| Compositor | Canvas scene composition, WebGL2 postprocessing with reusable textures and framebuffers, an auxiliary mesh renderer, and a limited Canvas fallback. | Context recovery and browser/device coverage need dedicated tests. |
| Effects | Layer and master stacks, legacy processors and an opt-in Depth Lab schema with processor-specific parameters, tonal masks, blending, recipes, locks and variations. | Shared parameter contracts are incomplete. Existing saved effects must keep their original behaviour. |
| Media and projects | Local media, video/image/text/shape/mesh layers, a versioned JSON project, undo/redo and browser settings. | JSON does not carry source media bytes. Asset recovery and relinking need work. |
| Timeline and sound | Layer lanes, playhead, seeking, linear Depth Lab parameter automation and Web Audio analysis and routing. | Clip editing, easing and many-to-many modulation need a unified model. |
| Export | Canvas PNG and real-time canvas capture with mixed Web Audio output. MediaRecorder negotiates MP4 or WebM. | Capture is tied to real-time playback and browser codec support. Offline sequences and consistent export quality need a separate design. |

## Feature gaps and priorities

| Priority | Verified or present today | Next gap |
| --- | --- | --- |
| Preview and editing | Larger docked preview, pointer edge/corner resizing, floating window, Fit and fixed zoom, fullscreen and responsive controls. Existing tests cover desktop and mobile viewport sizes. | Keyboard window controls in this branch. Rendering quality still shares the canvas resolution with export. Native picture-in-picture remains unverified. |
| Effects and compositing | Depth Lab regression covers GPU output changes, legacy stacks, parameter storage, and exports with moving footage. | Unify typed parameter descriptors and serialisation first. Add compositing features only after fixture tests prove saved-project compatibility. |
| Timeline and modulation | Existing automation and audio response are exercised by regression tests. | Extend a shared automation model with easing, trimming, loop regions, simultaneous routes and deterministic export signals. |
| Spatial tools and creative systems | Authored depth input, point tracking hooks, mesh and sigil layers, and live recipes are present in source. | Test tracking on moving fixtures before claiming coverage. Then add selective masks and Goblin-specific engines on shared modulation and compositing primitives. |

Ladybug publicly documents a combined canvas/timeline/inspector workspace, sound-reactive workflows, tracking and depth tools, model import, saved looks and export controls. Its product direction supports prioritising complete editing workflows over increasing the raw effect count. Public references: [studio update](https://theladybug.app/changelog/029-meet-the-new-ladybug/), [Studio V2](https://theladybug.app/changelog/019-studio-v2-is-in-beta/), [tutorials](https://www.theladybug.app/tutorials/).

## Verification and rollout

Run `node prepare-site.mjs` from the repository root. The branch workflow generates a video fixture, runs `tests/verify-preview.cjs` and `tests/verify-depth.cjs`, and publishes the built `public/` directory and screenshots as its preview artifact. Serve that directory over HTTP to run the editor. A Cloudflare staging deployment should use its own preview target before production promotion.
