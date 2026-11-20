# Session reliability and next improvements

## Implemented in this change

- Startup now starts from the original clean preview instead of silently restoring the saved editing state. Named recipes remain available.
- Tools contains New session, Restore previous session, Clear all VFX and Remove selected layer. Clear VFX is also beside the always-visible Mix controls.
- Clear VFX removes the master and every layer's effect stack. Reset selected effect restores defaults and removes its animation/audio modulation.
- Layer removal pauses playback, disconnects source audio, releases its object URL, resets render memory and refreshes selection/output sizing. Undo restores media from the existing IndexedDB cache.
- New session releases attached video, image, depth/tracking resources and stops uploaded audio and microphone input. Its edit state can be undone. External audio tracks and microphone permissions are not serialized into the undo history.
- Late video imports cannot re-add media after a session change. Recovery is explicit; it does not run during startup.
- These editing actions are blocked while an export is preparing or recording.

## Findings from the existing source

`restore()` unconditionally reopened localStorage project settings, and `restoreMedia()` reattached IndexedDB sources. New project previously replaced state but left media resources and uploaded audio attached. Deletion was available mainly through the timeline, with no direct layer-inspector action. VFX reset was fragmented between ritual and deep settings, and neither was a complete reset of all parameters, animation and routing. There was no clear-all action spanning both layer and master effects.

## Next priorities

1. **Asset manager and relinking.** Show missing media explicitly; allow replacing a source while retaining edits. Project JSON refers to local cached assets and is not a portable media bundle.
2. **Named projects and storage management.** Separate named project saves from session recovery, show storage usage and offer deliberate deletion of cached sources. Cached assets remain for undo and saved-project compatibility in this change; removing a timeline layer does not purge disk storage.
3. **Unified effect inspector.** Use a single parameter schema and consistent reset/automation behavior across all effect families; expose layer/master scope clearly beside each chain.
4. **Export feedback.** Add progress, clear cancellation and codec capability information. Current export is browser MediaRecorder based and runs in real time.
5. **Timeline editing.** Add explicit clip in/out points and per-clip timing before introducing more simultaneous media layers.

## Validation

`node prepare-site.mjs` (including repeated build), `node tests/verify-session.cjs`, and the retained preview, mobile-effects, vertigo, shader, animation and media-export integration suites. Browser results are recorded by the repository's Verify Depth Lab effects workflow. Do not infer untested Safari or physical-phone behavior from Chromium viewport tests.
