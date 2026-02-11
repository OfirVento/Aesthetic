# Aesthetic App — Mesh Demo Feature Spec

## What This App Is

A clinical aesthetic visualization workbench for
aesthetic medicine practitioners. Users upload a
face photo, then use sliders to preview how filler
injections and Botox would look — in real-time,
without AI image generation.

**Production URL:** https://aesthetic-ruddy.vercel.app
**Mesh Demo:** https://aesthetic-ruddy.vercel.app/mesh-demo
**GitHub Repo:** https://github.com/OfirVento/Aesthetic
**Vercel:** Connected to GitHub, auto-deploys from main

## Tech Stack

- Next.js (check package.json for version)
- TypeScript
- Tailwind CSS
- Three.js (WebGL 3D rendering)
- MediaPipe Face Mesh (468 facial landmarks)
- Zustand (state management)
- Deployed on Vercel

## Project Structure (Local)

The local project uses root-level directories
(NO src/ prefix):

```
app/                  ← Next.js App Router pages
  mesh-demo/page.tsx  ← The mesh demo page
  page.tsx            ← Main landing page
  layout.tsx          ← Root layout
  api/                ← API routes
components/
  simulation/
    MeshSimulator.tsx    ← React wrapper for renderer
    SimulationControls.tsx ← Slider UI
    index.ts             ← Barrel exports
lib/
  mediapipe.ts         ← Face detection (MediaPipe)
  meshSimulation/
    MeshRenderer.ts    ← Core Three.js renderer
    morphTargets.ts    ← 15 filler + 5 botox targets
    shaders.ts         ← GLSL shaders (unused currently)
    meshBuilder.ts     ← Face mesh triangulation
    types.ts           ← TypeScript interfaces
    index.ts           ← Barrel exports
```

tsconfig.json has: `"@/*": ["./*"]` (maps to root)

## The Feature That Needs To Work

### User Flow
1. User goes to /mesh-demo
2. Uploads a face photo
3. MediaPipe detects 468+ facial landmarks
4. Three.js renders the photo on a deformable grid
5. User moves filler sliders (lips, cheeks, chin, etc.)
6. The face image deforms in real-time showing the
   simulated filler effect

### Current Status
- Steps 1-4 WORK (page loads, face detected, image
  renders, "Ready" shows in green)
- Step 5-6 BROKEN — sliders don't deform the image.
  Browser console shows NO output when sliders move,
  meaning the React useEffect that calls
  updateSimulation() is not firing.

## Architecture

### Data Flow (should work but doesn't)

```
Slider onChange
  → onFillerChange(name, value)
  → setFillerValue(name, value)  [in useMeshSimulator hook]
  → setState({...prev, fillerValues: {...prev.fillerValues, [name]: value}})
  → MeshDemoPage re-renders
  → passes new `state` to MeshSimulator as `simulationState` prop
  → useEffect([simulationState, isInitialized]) fires
  → rendererRef.current.updateSimulation(simulationState)
  → MeshRenderer deforms grid vertices
  → posAttr.needsUpdate = true
  → render()
```

### Key Components

**MeshDemoPage** (app/mesh-demo/page.tsx)
- Uses useMeshSimulator() hook for state
- Passes state to MeshSimulator + SimulationControls
- File upload, export, reset buttons

**useMeshSimulator()** (in MeshSimulator.tsx)
- Returns: { state, setFillerValue, setBotoxValue, reset }
- state: { fillerValues: Record<string,number>, botoxValues: Record<string,number> }
- Values are 0-1 (sliders show 0-100%)

**MeshSimulator** (React component with forwardRef)
- Creates MeshRenderer on canvas
- useEffect([imageDataUrl]): initializes renderer with
  landmarks
- useEffect([simulationState, isInitialized]): calls
  updateSimulation — THIS IS THE ONE THAT'S NOT FIRING

**MeshRenderer** (Three.js class)
- OrthographicCamera(-1,1,1,-1,0.1,10) at z=5
- PlaneGeometry(2,2,80,80) = 6561 vertices
- MeshBasicMaterial with photo texture
- Landmarks converted to grid space:
  x = lm.x * 2 - 1, y = -(lm.y * 2 - 1)
- updateSimulation(): for each morph target with
  intensity > 0, displace grid vertices near affected
  landmarks radially outward with smoothstep falloff

**SimulationControls** (slider UI)
- Groups 15 filler targets + 5 botox zones by category
- Range inputs 0-100, divided by 100 for 0-1 values

**detectFaceLandmarks** (lib/mediapipe.ts)
- Uses @mediapipe/face_mesh (old API with callbacks)
- Loads WASM from jsdelivr CDN at runtime
- Returns LandmarkPoint[] (normalized 0-1 coords)

### Morph Targets (15 fillers)

Each has: name, region, category, affectedVertices
(MediaPipe landmark indices), deformationType
("normal" or "custom"), maxDisplacement, optional
customDirection.

Categories: lips (5), cheeksMidface (3), underEye (1),
lowerFace (4), nose (2)

maxDisplacement values range 0.06 to 0.16 in
normalized -1 to 1 grid space.

INFLUENCE_RADIUS = 0.28 (how far from a landmark
a grid vertex can be and still get deformed)

### Botox Zones (5)
- forehead_lines, glabella_11s, crows_feet_left/right,
  bunny_lines
- Currently NOT implemented in the renderer (only
  filler deformation works)
- Planned approach: fragment shader blur in UV zones

## The Bug

The useEffect that calls updateSimulation is not
firing when simulationState changes. Console logging
was added but never appears in the browser console
when sliders are moved.

Possible causes to investigate:

1. **React state not propagating** — Does useMeshSimulator's
   setState actually cause MeshDemoPage to re-render?
   Does the new state reach MeshSimulator as a prop?

2. **useEffect not detecting changes** — Is React
   comparing simulationState by reference or value?
   The setState uses spread operator which should
   create new references.

3. **StrictMode double-mount** — In development, React
   mounts/unmounts/remounts. The init effect uses
   initializingRef to prevent double init. Could this
   interfere with the simulation effect?

4. **forwardRef optimization** — Could React be skipping
   re-renders of MeshSimulator somehow?

5. **Next.js version issue** — The project uses a recent
   Next.js version. Check if there are known issues
   with useEffect in client components.

6. **Build vs runtime mismatch** — The Vercel build
   might be serving stale code. Verify by checking
   the console.log we added actually appears.

## What To Research & Try

### Approach 1: Debug the current React flow
- Add console.log everywhere: in setFillerValue,
  in MeshDemoPage render, in MeshSimulator render,
  in the useEffect
- Find exactly where the data flow breaks
- Fix the specific issue

### Approach 2: Simplify the React wiring
- Remove forwardRef, use a simpler component structure
- Put the MeshRenderer directly in the page component
  instead of a separate component
- Use useRef for the renderer + direct imperative calls
  instead of passing state through props

### Approach 3: Use a callback ref pattern
- Instead of useEffect to detect state changes, pass
  an onChange callback directly from the slider to
  the renderer
- SimulationControls → direct call to
  rendererRef.current.updateSimulation()
- Bypasses React's effect system entirely

### Approach 4: Canvas 2D approach (simpler)
- Skip Three.js entirely
- Use HTML5 Canvas 2D with image warping
- Implement mesh warping using canvas transforms
- Pros: simpler, fewer dependencies, no WebGL issues
- Cons: less smooth, harder to do complex deformations

### Approach 5: CSS transforms approach (simplest)
- Use CSS scale/translate on absolutely-positioned
  image regions
- Define clip-path regions for each face area
- Scale/translate based on slider values
- Pros: simplest possible, no canvas/WebGL
- Cons: crude, only works for basic effects

### Approach 6: WebGL with different library
- Use PixiJS instead of Three.js (better for 2D)
- Or use raw WebGL for more control
- Or use a mesh warping library specifically designed
  for image deformation

## Recommendations

1. **Start with Approach 1** — debug the React flow
   first. The code looks correct on paper; there may
   be a simple wiring issue.

2. **If Approach 1 fails, try Approach 3** — bypass
   React effects entirely with direct imperative
   calls from slider onChange to the renderer.

3. **If Three.js grid deformation is fundamentally
   problematic, try Approach 4** — Canvas 2D mesh
   warping is simpler and well-documented.

4. **Always test locally first** with npm run dev
   before pushing to Vercel.

5. **Check the browser console** (Cmd+Option+I) for
   errors after every change. The console is the
   primary debugging tool.

## Environment Notes

- Local project: ~/Projects/Aesthetic/ag-aesthetic
- GitHub: OfirVento/Aesthetic (main branch)
- Vercel: aesthetic-ruddy.vercel.app (connected to GitHub)
- Pushing to main auto-deploys to Vercel
- The project may have a stop-hook-git-check.sh that
  keeps interrupting — find and delete it if it fires
- @mediapipe/face_mesh loads WASM from CDN at runtime
- Three.js and @types/three need to be installed
