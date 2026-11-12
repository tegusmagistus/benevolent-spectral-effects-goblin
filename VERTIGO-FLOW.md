# Oh God Jeff / Go With the Flow

Find this processor in **Tibetan-inspired**, or search **Jeff**. It projects the current footage onto four receding walls and a distant floor to suggest looking down into a great drop. It is an original optical treatment, not recovered scene depth or tracking.

- **Height / depth** changes how far away the floor appears.
- **Downward pull** moves the wall texture toward you and shifts the point you look toward.
- **Vertigo sway** adds slow side-to-side camera movement.
- **Flow speed** controls animation. Zero freezes it.
- **Camera tilt** banks the view.
- **Depth repetitions** sets how often the footage repeats down the walls.
- **Strength** blends the treatment with the original. Start lower for a subtle effect.

The processor uses the existing Canvas compositing path, works among GPU effects, and also works in Canvas fallback. Geometry depends on playback time and settings, so pausing or revisiting a time does not accumulate random feedback. Existing strength keyframes, layer/master scope, bypass, reset and project persistence apply. Preview dimensions do not control export resolution.

This is a stylised four-wall perspective illusion. It does not reconstruct real cliffs, infer camera height, isolate subjects or produce physically accurate scene depth. Performance varies with output resolution and stack complexity.

Validation: `node prepare-site.mjs`; with the existing test server and motion fixture, `node tests/verify-vertigo.cjs`. The workflow also retains the preview, phone layout, legacy shader and export suites.
