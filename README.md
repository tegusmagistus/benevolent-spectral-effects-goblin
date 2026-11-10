# BENEVOLENT SPECTRAL EFFECTS GOBLIN

by GHOSTGIRL 空舞

Deployment setup for the existing BSEG Moon Relic application. No application redesign or rebuild is performed by this repository's preparation script.

## Status

The repository contains the import script, an automatic GitHub import workflow, and Cloudflare Pages configuration. The app archive still needs to be uploaded. No live demo or Cloudflare deployment is claimed by this setup.

## Upload the existing app

1. Download the original `BSEG_Moon_Relic_Web.zip` supplied in the conversation. Keep the file zipped and retain its exact name.
2. Open https://github.com/tegusmagistus/benevolent-spectral-effects-goblin/upload/main and upload that ZIP at the repository root, then commit to `main`.
3. The `Import preserved BSEG application` workflow checks the archive checksum and copies the unchanged application into `public/`. Its status appears under Actions. It refuses to overwrite differing existing app files.

The original archive remains in the repository. The checksum is pinned to preserve the delivered build:

`ff006eba56494be767e309bb34b2edd4a36764644f47085c7a14b624fd7e85e6`

## Connect Cloudflare Pages

In the Cloudflare dashboard choose Workers & Pages, Create application, Pages, then Import an existing Git repository. Authorize access to this repository.

- Repository: `tegusmagistus/benevolent-spectral-effects-goblin`
- Framework: None
- Production branch: `main`
- Build command: `node prepare-site.mjs`
- Build output directory: `public`
- Root directory: leave blank

Save and deploy. Cloudflare displays the actual `pages.dev` website address after a successful deployment. Do not treat a guessed hostname as a working link.

The Cloudflare build also unpacks the original ZIP independently, so it does not depend on the import workflow committing `public/` first.

## Domain

The requested custom domain is `benevolantgoblin.com`. GitHub initialization does not change GoDaddy DNS. Add the domain in Cloudflare only after the preview deployment succeeds, and preserve unrelated email and verification DNS records.

## Preservation checks

The preparation script was run locally against the supplied ZIP. Every output file matched the archive byte-for-byte. That packaging check is not a claim of live-host, Safari, or GPU testing.

## References

- https://developers.cloudflare.com/pages/framework-guides/deploy-anything/
- https://developers.cloudflare.com/pages/get-started/git-integration/
- https://developers.cloudflare.com/pages/configuration/custom-domains/
