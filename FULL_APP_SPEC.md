# Aesthetic — Full Product Spec

## What To Build

A clinical aesthetic visualization web app where
practitioners upload a patient's face photo, then
simulate injectable cosmetic treatments (fillers,
Botox) in real-time using 3D mesh deformation.
Sliders instantly deform the face image using WebGL
vertex displacement — no API calls, no AI generation.

---

## Target Users

- Aesthetic medicine practitioners
- Cosmetic consultants
- Patient education / before-after visualization

---

## User Flow

### Step 1: Capture
- Landing page with "Begin Face Scan" (camera) or
  "Upload Profile" (file picker)
- Photo captured as base64 data URL
- Auto-transition to Step 2

### Step 2: Simulation (/mesh-demo)
- MediaPipe Face Mesh detects 468 facial landmarks
- Photo rendered as WebGL texture on deformable grid
- User adjusts filler sliders (0-100%) per region
- Face deforms in real-time showing simulated effect
- User adjusts Botox sliders for wrinkle smoothing
- Export result as PNG

### Step 3: Results
- Visual mapping: final image with color-coded
  treatment dots at anatomical positions
- Clinical recipe: printable prescription protocol
  grouped by category with materials, sites, and
  intensity percentages

---

## Face Region Hierarchy (21 sub-regions)

### Lips (5)
- Upper lip — volume, projection
- Lower lip — volume, projection
- Vermilion border — definition, enhancement
- Cupid's bow — peak definition, height
- Mouth corners — lift, support

### Nose (3) [GATED — requires user warning]
- Bridge — height, width
- Tip — projection, rotation
- Base/Alar — width, flare

### Upper Face (5)
- Forehead — smoothing (Botox), volume
- Glabella (11 lines) — smoothing (Botox)
- Brow — lift, arch
- Crow's feet — smoothing (Botox)
- Temples — volume restoration

### Under-Eye (2)
- Tear trough — hollow filling, dark circle
- Lower eyelid — smoothing, tightening

### Cheeks & Midface (3)
- Cheek/malar — volume, projection
- Midface volume — restoration, lift
- Nasolabial fold — filling, softening

### Lower Face (4)
- Chin — projection, width
- Jawline — definition, contouring
- Marionette lines — filling, lift
- Pre-jowl sulcus — filling, smoothing

---

## 3D Mesh Simulation (Core Feature)

### How It Works
1. Photo loaded as WebGL texture on an 80x80 grid
2. MediaPipe landmarks mapped to grid coordinates
3. Per filler slider:
   - Find grid vertices near affected landmarks
   - Displace outward with smoothstep falloff
   - Creates volume-adding effect in real-time
4. Per Botox slider:
   - Blur fragment shader in UV zones
   - Creates wrinkle-smoothing effect

### Architecture
- **Three.js** with OrthographicCamera (-1,1,1,-1)
- **PlaneGeometry(2,2,80,80)** = 6561 vertices
- **MeshBasicMaterial** with photo texture
- **CPU vertex deformation** per frame
- Landmarks converted: x*2-1, -(y*2-1) → grid space

### 15 Morph Targets (Fillers)
Each target defines:
- `affectedVertices`: MediaPipe landmark indices
- `maxDisplacement`: 0.06-0.16 normalized units
- `deformationType`: "normal" (radial outward from
  centroid) or "custom" (specific XY direction)
- `INFLUENCE_RADIUS`: 0.28 (area of effect)

### 5 Botox Zones
Each zone defines:
- `landmarkIndices`: zone boundary
- `uvBounds`: min/maxU, min/maxV
- `maxBlurStrength`: 0.5-0.9
- Effect: Gaussian blur in fragment shader

### Current Bug
The React useEffect that connects slider state
changes to the MeshRenderer.updateSimulation()
call is NOT firing. The page loads, face is
detected, image renders, but moving sliders
produces no console output and no deformation.

### Research Approaches To Try

**Approach 1: Debug React data flow**
Add console.log at every step: setFillerValue →
useState → parent render → child prop → useEffect.
Find where the chain breaks.

**Approach 2: Bypass React effects**
Instead of useEffect to detect state changes, pass
a callback from sliders directly to the renderer.
`onChange → rendererRef.current.updateSimulation()`

**Approach 3: Simplify component structure**
Put MeshRenderer directly in the page component
instead of a separate MeshSimulator wrapper with
forwardRef.

**Approach 4: Canvas 2D mesh warping**
Skip Three.js entirely. Use HTML5 Canvas 2D with
triangulated mesh warping. Simpler, fewer deps.

**Approach 5: PixiJS displacement**
Use PixiJS DisplacementFilter with a displacement
map generated from landmark deltas. Built for 2D
image manipulation.

**Approach 6: CSS-based approach**
Use clip-path regions + CSS scale/translate per
face area. Crude but simple.

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 14+ | Framework, SSR, routing |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Zustand | State management |
| Three.js | 3D WebGL rendering |
| MediaPipe Face Mesh | 468 landmark detection |
| Lucide React | Icons |

---

## Key Data Structures

### SimulationState (3D mesh)
```typescript
{
  fillerValues: Record<string, number>  // 0-1
  botoxValues: Record<string, number>   // 0-1
}
```

---

## Design System

### Colors
- Background: stone-50 cream
- Text: stone-900 dark
- Primary actions: blue-500/600
- Category colors:
  - Lips: pink-500
  - Nose: amber-500
  - Upper Face: blue-500
  - Under-Eye: cyan-500
  - Cheeks: emerald-500
  - Lower Face: stone-600
- Status: emerald (success), red (error), amber (warning)

### Typography
- Sans-serif body, serif headings
- Uppercase tracking for labels
- Size scale: 10px caps → 4xl headings

### Layout Patterns
- Full-screen wizard (3 steps)
- Split view for before/after comparison
- Right sidebar for controls
- Bottom tray for version history

---

## Deployment
- Vercel (connected to GitHub, auto-deploys from main)
- Production URL: cl-aesthetic.vercel.app
- No database needed (client-side state only)
- No auth (demo/POC)
- No API keys needed for mesh-only approach

---

## What To Build First (Priority Order)

1. **Fix slider bug** — debug and fix the useEffect
   that connects sliders to mesh deformation
2. **Landing page + image capture/upload**
3. **MediaPipe face detection + landmark extraction**
4. **3D mesh simulation with working sliders**
5. **Botox zone implementation** (fragment shader blur)
6. **Results page** (visual map + clinical recipe)
7. **Export/print functionality**

---

## What To Research

1. **Best approach for real-time face deformation**
   - Three.js grid deformation vs Canvas 2D warping
     vs PixiJS displacement vs CSS transforms
   - Test each approach with a simple slider + face
     image to see which produces the most realistic
     and performant result

2. **MediaPipe version choice**
   - @mediapipe/face_mesh (old, callback-based) vs
     @mediapipe/tasks-vision (new, promise-based)
   - The old API uses onResults callbacks; the new
     one returns results directly

3. **State management for real-time updates**
   - Zustand works well for this scope
   - Consider Jotai for more atomic state updates
   - Or bypass React state entirely for slider →
     renderer communication

4. **Persistence layer**
   - Currently no database (state lost on refresh)
   - Consider Supabase, PlanetScale, or local
     IndexedDB for session persistence
