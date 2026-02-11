## Context & Task for Local Claude Code

### Project Overview
This is "Aesthetic" — a Next.js 14 clinical aesthetic
visualization app. The key feature is a mesh demo page
at /mesh-demo that lets users upload a face photo, then
use sliders to simulate filler injections (lip volume,
cheek volume, etc.) via real-time WebGL mesh deformation.

### Architecture (mesh-demo)
- User uploads a photo
- MediaPipe detects 468 facial landmarks
- Three.js creates a PlaneGeometry(2,2,80,80) grid
  textured with the photo
- Sliders control filler intensity (0-1)
- updateSimulation() deforms grid vertices near the
  matching facial landmarks, creating visible volume
  changes in real-time
- Orthographic camera renders the deformed texture

### Key Files
- src/lib/meshSimulation/MeshRenderer.ts
  (core renderer with updateSimulation)
- src/lib/meshSimulation/morphTargets.ts
  (15 filler targets + 5 botox zones with landmark
  indices and maxDisplacement values)
- src/components/simulation/MeshSimulator.tsx
  (React wrapper around MeshRenderer)
- src/components/simulation/SimulationControls.tsx
  (slider UI)
- src/app/mesh-demo/page.tsx (demo page)

### What Was Done
All code changes for the mesh deformation are complete
and working in the codebase:
- INFLUENCE_RADIUS = 0.28 (area of effect for each
  landmark)
- All maxDisplacement values boosted 4x for visible
  effects
- Z-only custom directions fixed to use Y-axis
  (visible in 2D orthographic projection)
- Console logging added to updateSimulation

### Current Problem
The changes exist on branch "mesh-deformation-fix" but
have NOT been merged into "main". The Vercel production
site (aesthetic-ruddy.vercel.app) deploys from "main",
so it still has the old stub code where sliders do
nothing.

Also: localhost:3001/mesh-demo showed a blank page,
which needs debugging.

### What You Need To Do

1. First, figure out why localhost:3001/mesh-demo shows
   a blank page. Check the terminal for build errors or
   runtime errors. Try running:
   npm run dev
   Then check the browser console for errors.

2. Fix any issues that cause the blank page.

3. Once the mesh-demo works locally, merge into main
   and deploy to Vercel:
   git checkout main
   git pull origin main
   git merge mesh-deformation-fix --no-edit
   git push origin main

4. Verify the build passes before pushing:
   npm run build

5. After pushing, the Vercel site at
   aesthetic-ruddy.vercel.app/mesh-demo should
   automatically redeploy with the working sliders.

### Important Notes
- Do NOT force push to main
- If there are merge conflicts, resolve them carefully
  keeping the mesh deformation code intact
- The critical files that must be preserved in the
  merge are MeshRenderer.ts and morphTargets.ts
- The PROMPT_FOR_LOCAL_CLAUDE.md file in the project
  root can be deleted, it was just used to transfer
  instructions
