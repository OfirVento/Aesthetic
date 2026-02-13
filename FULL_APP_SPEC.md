# Aesthetic — Full Product Spec for AI Builder

## What To Build

A clinical aesthetic visualization web app where
practitioners upload a patient's face photo, then
simulate injectable cosmetic treatments (fillers,
Botox) in real-time. Two simulation approaches:

1. **AI Image Generation** (Gemini) — select a face
   region, adjust intensity sliders, click Apply,
   and AI generates a realistic edited image
2. **Real-time 3D Mesh** — slider movements instantly
   deform the face image using WebGL vertex
   displacement (no API call needed)

---

## Target Users

- Aesthetic medicine practitioners
- Cosmetic consultants
- Patient education / before-after visualization

---

## User Flow (3 Steps)

### Step 1: Capture
- Landing page with "Begin Face Scan" (camera) or
  "Upload Profile" (file picker)
- Photo captured as base64 data URL
- Auto-transition to Step 2

### Step 2: Simulation
- MediaPipe Face Mesh detects 468 facial landmarks
- User selects a face region from hierarchical menu:
  - 6 categories → 21 sub-regions
  - Mask overlay highlights selected area
- User adjusts 2-3 sliders per region (0-100%)
- Two modes:
  - **AI mode**: Click "Apply Simulation" → builds
    prompt from slider values → calls Gemini API →
    returns edited image → stored in version history
  - **Mesh mode** (/mesh-demo): Sliders instantly
    deform face via WebGL grid displacement

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

## AI Image Generation Approach

### Prompt System (2 levels)

**System Prompt** (wrapper):
- Medical context for injectable cosmetics
- Rules: no makeup, no filters, preserve identity,
  background, skin tone. Structural changes ONLY.
- Contains `{TASK_PROMPT}` placeholder

**Task Prompt** (per-region, dynamic):
- Built from slider values
- Maps percentage to intensity level:
  - 1-25% = "slight"
  - 26-50% = "noticeable"
  - 51-75% = "significant"
  - 76-100% = "dramatic"
- Each intensity has a specific prompt text, e.g.:
  - Slight: "Slightly increase upper lip thickness
    while keeping exact same natural lip color"
  - Dramatic: "Dramatically augment upper lip
    fullness while keeping same natural lip color"

**Prompt Config**:
- ~1800 lines of medical prompts covering all 21
  sub-regions × 2-3 controls × 4 intensity levels
- Fully editable via Settings modal (persisted to
  localStorage)

### API Flow
```
Slider values + selected region
  → buildInpaintPrompt() — maps values to text
  → buildFullPrompt() — wraps with system prompt
  → generateRegionMask() — creates B&W mask from
    landmarks (white = edit area)
  → POST /api/inpaint — sends image + prompt + mask
  → Gemini 2.5 Flash generates edited image
  → Response stored in version history
```

### Mask Generation
- Uses MediaPipe 468 facial landmarks
- Each sub-region has ordered landmark indices
  defining a closed polygon
- Canvas draws filled polygon → applies 8px
  Gaussian feathering → exports as PNG data URL
- Sent to Gemini as editing mask

---

## 3D Mesh Simulation Approach

### How It Should Work
1. Photo loaded as WebGL texture on a 80×80 grid
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
| Next.js 14+ | Framework, SSR, API routes |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Zustand | State management |
| Three.js | 3D WebGL rendering |
| MediaPipe Face Mesh | 468 landmark detection |
| Google Gemini API | AI image generation |
| Fabric.js | Canvas manipulation (optional) |
| Lucide React | Icons |

---

## Key Data Structures

### SessionState (Zustand)
```typescript
{
  step: "scan" | "simulation" | "results"
  capturedImage: string | null     // base64
  activeImage: string | null       // currently displayed
  landmarks: LandmarkPoint[] | null // 468 points
  selectedCategory: RegionCategory | null
  selectedSubRegion: SubRegion | null
  controlValues: Record<string, number> // 0-100
  notes: string
  history: VersionEntry[]
  isProcessing: boolean
  error: string | null
}
```

### SimulationState (3D mesh)
```typescript
{
  fillerValues: Record<string, number>  // 0-1
  botoxValues: Record<string, number>   // 0-1
}
```

### VersionEntry (history)
```typescript
{
  id: string
  timestamp: number
  category, subRegion: string
  controlValues: Record<string, number>
  notes: string
  prompt: string           // full prompt sent
  inputImage: string       // base64
  outputImage: string      // base64
  maskData: string         // base64
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
- Modal for settings/prompt editing

---

## API Endpoints

### POST /api/inpaint
**Request:**
```json
{
  "imageDataUrl": "data:image/jpeg;base64,...",
  "prompt": "Full prompt text",
  "maskDataUrl": "data:image/png;base64,..." (optional)
}
```

**Response:**
```json
{
  "imageDataUrl": "data:image/png;base64,...",
  "debugPrompt": "Echo of prompt sent"
}
```

**Error handling:**
- Retry 3x with exponential backoff on 503
- Returns 400 for missing required fields
- Returns 500 for API/server errors

---

## Environment Variables
```
GEMINI_API_KEY=your-key-here  (server-side only)
```

---

## Deployment
- Vercel (connected to GitHub, auto-deploys from main)
- Production URL: cl-aesthetic.vercel.app
- No database needed (client-side state only)
- No auth (demo/POC)

---

## What To Build First (Priority Order)

1. **Landing page + image capture/upload**
2. **MediaPipe face detection + landmark extraction**
3. **Region selection UI** (6 categories → 21 subs)
4. **Mask generation from landmarks**
5. **Prompt system** (build prompts from sliders)
6. **Gemini API integration** (/api/inpaint route)
7. **Before/after comparison view**
8. **Version history tray**
9. **Results page** (visual map + clinical recipe)
10. **Real-time 3D mesh simulation** (research best
    approach — see options above)
11. **Settings/prompt editor modal**
12. **Export/print functionality**

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

3. **Gemini model selection**
   - gemini-2.5-flash-image (fast, good quality)
   - gemini-2.5-pro (slower, potentially better)
   - Test both for aesthetic edit quality

4. **Prompt engineering for realistic results**
   - Current prompts emphasize "no makeup, no color
     changes, structural only"
   - Test different prompt strategies for each region
   - Consider few-shot examples with before/after

5. **State management**
   - Zustand works well for this scope
   - Consider Jotai for more atomic state updates
     (may help with the useEffect issue)

6. **Persistence layer**
   - Currently no database (state lost on refresh)
   - Consider Supabase, PlanetScale, or local
     IndexedDB for session persistence
