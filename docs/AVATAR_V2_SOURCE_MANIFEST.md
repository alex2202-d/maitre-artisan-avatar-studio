# Avatar V2 — source manifest

Final V2 pack generated from the approved Maître Artisan visual direction and integrated on 2026-09-19.

## Character
- Meshy V7 Image to 3D job: `01a0ba7f-719b-7b20-8345-2b554c61a5f1`
- Rig task: `01a0ba85-cdb5-7118-bde8-161db5e51b12`
- Output: rigged GLB, PBR textures, 2K geometry, A-pose
- Local target: `public/assets/avatar/v2/base/avatar_workwear_v2_rigged.glb`

## Outfit modules
- Hardhat: `01a0ba74-b55b-75f3-9f0d-b3d8a50902c0`
- Top: `01a0ba74-ca5e-7bb1-bcc9-1627ffe9742f`
- Bottom: `01a0ba74-d4b6-7170-a027-de35bae08bee`
- Gloves: `01a0ba74-def2-78f2-9ffc-608366e6b45f`
- Boots: `01a0ba74-e732-75d2-b067-00302e4d423a`

The one-shot workflow `.github/workflows/vendor-avatar-v2.yml` downloads the generated binaries into the repository so the app does not depend on remote model URLs at runtime.

## Integration
- V2 application integration commit: `dfa0cc4542cd6b7f714224cc6b6b2e5057dc4644`
- Vendored binary asset commit: `3259f98db255c4c05157bd83d51146411a8bbace`
- Runtime catalog points only to local `/assets/avatar/v2/` files.
