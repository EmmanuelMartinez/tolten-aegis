## What does this PR do?

<!-- A short description, and the problem it solves. -->

## How was it tested?

- [ ] `node scripts/validate.js` passes
- [ ] Loaded as a dynamic Cordis plugin (`cordis_define` + `cordis_run`) and verified in the UI
- [ ] Both halves are present (`code.host` **and** `code.client`) if a package was redefined

## Screenshots / GIF (required for UI changes)

## Checklist

- [ ] `README.md` (and `README.es.md` where it exists) updated
- [ ] `CHANGELOG.md` updated under `[Unreleased]`
- [ ] No secrets, tokens or personal data
- [ ] Sandbox rules respected (no `process`, `document`, `window` in plugin code)
