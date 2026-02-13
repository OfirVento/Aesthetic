# Aesthetic Styling Simulation - Claude Code Handoff Document

## IMPORTANT: Read This Entire Document Before Starting

This document contains the complete context, specifications, technical decisions, and implementation plan for building an upgraded Clinical Aesthetic Visualization Workbench. The user (Ofir) has already done extensive planning - your job is to execute.

---

## 1. PROJECT OVERVIEW

### What We're Building
A clinical-grade visualization tool for aesthetic medicine practitioners (doctors) to:
1. Capture/upload a patient photo
2. Select specific facial regions (lips, jawline, cheeks, nasolabial folds, etc.)
3. Apply simulated injectable effects (Botox, fillers, skin boosters) with precise control
4. See realistic before/after comparisons WITHOUT identity drift
5. Iterate through versions ("I liked the lips from try #1, jawline from try #3")
6. Export a consultation record (PDF with treatment plan)

### The Core Technical Challenge
**Localized, identity-preserving image editing that feels responsive during a live doctor-patient consultation.**

Fillers add volume (3D), so flat 2D edits won't convincingly show projection. We're solving this with a 2.5D approach (depth estimation + parallax) rather than full 3D reconstruction.

---

## 2. EXISTING PROTOTYPE

There are 2 existing projects in `~/Documents/Aesthetic Styling Simulation/`:
- **Project 1:** Full app with flow, UI, prompts
- **Project 2:** Updated results/export screen only

### Current UI Flow (3 Steps)
1. **01 SCAN** - Landing page with "Begin Face Scan" or "Upload Profile" options
2. **02 SIMULATION** - The critical workbench screen with:
   - Top toolbar: Region preset buttons (Lips, Jawline, Cheeks, etc.) + brush/lasso tools
   - Center: Side-by-side Baseline (Original) vs Design (Active Design)
   - **Floating contextual panel:** Appears near selected region with region-specific sliders
   - Bottom: History tray with version thumbnails
   - "Apply" button to commit changes
3. **03 RESULTS** - Two tabs:
   - "My Style Card" - Before/after comparison with structural analysis text
   - "Treatment Recipe" - Two sub-tabs:
     - "Clinician Plan" - Table with Area, Product Type, Suggested Amount, Vector/Path, Notes
     - "Clinical Overlay" - Annotated face image with injection points and dosing

### Design System
- Cream/off-white background
- Black primary buttons and accents
- Serif font for "Aesthetic Styling" logo
- Clean, clinical, premium aesthetic
- NOT a consumer beauty filter - must feel like a medical instrument

### What Exists vs What Needs Building

| Component | Current State | Needs |
|-----------|--------------|-------|
| UI/Design language | ✅ Exists | Replicate/enhance |
| 3-step flow | ✅ Exists | Keep |
| Slider controls | ✅ Exists (global) | Replace with contextual region controls |
| Side-by-side view | ✅ Exists | Keep |
| History tray | ✅ UI exists | Add versioning logic |
| **Region selection** | ❌ Missing | Build: brush/lasso + presets |
| **Contextual controls** | ❌ Missing | Build: floating panel with region-specific sliders |
| **Image generation/inpainting** | ❌ Missing | Build: FLUX.1 integration |
| **Identity preservation** | ❌ Missing | Build: masked inpainting |
| **2.5D depth view** | ❌ Missing | Build: depth parallax |
| Clinical overlay | ✅ UI exists | Connect to edit data |
| Export | ✅ UI exists | Generate real PDF |

---

## 3. TECHNICAL STACK (DECIDED)

| Component | Technology | Why |
|-----------|------------|-----|
| **Frontend** | Next.js 14 + Tailwind + shadcn/ui | Fast, matches existing design |
| **Canvas/Masks** | Fabric.js | Mature library for brush/lasso drawing, layers, history |
| **Face Landmarks** | MediaPipe Face Mesh (in-browser) | Free, instant, 468 3D points, no API needed |
| **Semantic Segmentation** | SAM 2 via Replicate | Best-in-class "click to select" masks |
| **Inpainting** | FLUX.1 Fill via Fal.ai | Current best quality for controlled localized edits |
| **Depth Estimation** | Depth Anything v2 via Replicate | For 2.5D parallax visualization |
| **Clinical Brain** | Claude API (Sonnet 4.5) | Intent parsing, prompt generation, treatment summaries |
| **Storage** | Supabase | Auth + database + file storage |
| **Hosting** | Vercel | Fastest deployment for iteration |
| **Auth** | None for v1 | Internal testing only |

### API Services Needed
- **Fal.ai** - FLUX.1 inpainting (user will set up)
- **Replicate** - SAM 2 + Depth Anything (user will set up)
- **Anthropic** - Claude API (user has access)
- **Supabase** - Database/storage (user will create project)

---

## 4. CORE REQUIREMENTS (NON-NEGOTIABLE)

### Identity & Context Preservation
- Patient identity MUST remain consistent
- NO unintended changes to: eyes, hair, clothing, background, non-target skin regions
- Maintain natural lighting and shadow continuity
- Edits apply ONLY within selected mask/region

### Clinical Credibility
- Must NOT feel like a consumer beauty filter
- Must NOT "beautify" broadly or add glamor aesthetics
- All outputs labeled as "simulation / visualization (not guaranteed outcome)"

### Auditability
- Track what changed, where, and by how much
- Every generation becomes a discrete version in history

---

## 5. CLINICAL LANGUAGE MAPPING

UI slider percentages map to clinical terminology:

| Range | Label | Clinical Language Examples |
|-------|-------|---------------------------|
| 0% | Verification | Strict pixel preservation / no-op |
| 1-30% | Subtle | "micro-refresh", "hydration effect", "soft relaxation" |
| 31-70% | Balanced | "definition", "sharpening", "liquid rhinoplasty", "mandibular contour" |
| 71-100% | Enhanced | "structural reshaping", "bold augmentation", "total toxin lift" |

---

## 6. IMPLEMENTATION PLAN

### Phase 1 - Core Workbench (Priority)

#### 1.1 Project Setup
- Initialize Next.js 14 with App Router
- Configure Tailwind with the cream/clinical design system
- Set up environment variables structure for APIs
- Install dependencies: fabric.js, @mediapipe/face_mesh, etc.

#### 1.2 UI Replication
- Replicate the exact UI from existing prototype (cream background, clinical aesthetic)
- 3-step navigation (Scan → Simulation → Results)
- **Remove old global Styling Panel** - replaced by contextual region controls
- Side-by-side image comparison component (Baseline vs Design)
- History tray component at bottom
- Region preset buttons (Lips, Jawline, etc.) in a toolbar
- Floating contextual control panel that appears when a region is selected

#### 1.3 Image Upload & Face Detection
- Guided capture flow (or file upload)
- MediaPipe Face Mesh integration (runs in browser)
- Extract 468 landmarks for region presets
- Display face detection confirmation

#### 1.4 Region Selection System
- **Preset buttons:** Lips, Jawline, Chin, Cheeks, Nasolabial Folds, Upper Face (forehead), Tear Troughs
- **Brush tool:** Freehand mask painting with adjustable size
- **Lasso tool:** Draw polygon selection
- Mask feathering (soft edges)
- Mask expand/contract controls
- Clear visual feedback (outline + translucent overlay)

#### 1.5 Contextual Region Controls (KEY FEATURE)

When a region is selected, a floating control panel appears near that region with **context-specific sliders**. Each region has different relevant controls:

| Region | Controls | What They Do |
|--------|----------|--------------|
| **Lips** | Volume, Projection, Definition, Width | Fullness, forward/back, border sharpness, horizontal spread |
| **Jawline** | Definition, Contour, Angle | Sharpness, overall shape, angular vs soft |
| **Chin** | Projection, Length, Width | Forward/back, vertical, horizontal |
| **Cheeks** | Volume, Lift, Projection | Fullness, vertical position, forward prominence |
| **Nasolabial Folds** | Depth Reduction, Smoothing | Reduce fold depth, soften appearance |
| **Upper Face/Forehead** | Relaxation, Lift, Smoothing | Botox-like effects, brow position, texture |
| **Tear Troughs** | Fill, Smoothing | Reduce hollow, soften transition |
| **Nose** | Bridge Height, Tip Projection, Width | Dorsal line, tip forward/back, nostril width |

**UI Behavior:**
- Controls appear as a small floating panel anchored near the selected region
- Each slider: 0-100% with subtle/balanced/enhanced zones
- Optional text input below sliders: "Add specific notes" for edge cases
- "Preview" button for quick feedback, "Apply" commits to history

**Why This Approach:**
- Predictable, reproducible results
- Easy to explain to patients: "I'm adding 30% projection to your lips"
- Perfect for treatment plan export (exact parameters recorded)
- Feels like a professional clinical instrument, not a beauty filter

#### 1.6 FLUX.1 Inpainting Integration
- Connect to Fal.ai API
- Send: base image + mask + constructed prompt
- **Prompt construction from contextual controls:**
  - Region name (e.g., "Lips")
  - Each control and its value (e.g., Volume 45%, Projection 30%)
  - Map values to clinical language (subtle/moderate/enhanced)
  - Append optional user notes
- Handle loading states gracefully (show spinner, disable controls)
- Display result in "Design" panel
- On success, auto-save to history tray

#### 1.7 Side-by-Side Comparison
- Synchronized zoom/pan between Baseline and Design
- Identical aspect ratio (critical for subtle comparisons)
- Toggle overlay option

### Phase 2 - History & Polish

#### 2.1 Version History System
- Each "Apply" creates a new version
- Store per version:
  - Input image reference
  - Selected region name
  - Mask data (the actual mask image/coordinates)
  - **All contextual control values** (e.g., {volume: 45, projection: 30, definition: 60})
  - Optional user notes/text
  - Generated prompt (for debugging/audit)
  - Output image reference
  - Timestamp
- Navigate between versions
- Compare any two versions side-by-side
- Support for: "I liked the lips from try #1, jawline from try #3" (mix & match future feature)

#### 2.2 2.5D Depth Visualization
- Run Depth Anything v2 on original image
- Generate depth map
- Implement subtle parallax/tilt effect on hover or drag
- Shows volume changes convincingly without full 3D

#### 2.3 Supabase Integration
- Session storage
- Image storage (original + generated)
- Version history persistence

### Phase 3 - Results & Export

#### 3.1 Style Card Generation
- Before/after images
- "Structural Analysis" text generated by Claude API
- Treatment summary

#### 3.2 Clinician Plan Table
- Auto-populate from edit history:
  - Area (from selected regions)
  - Product Type (Toxin vs HA Filler based on region)
  - Suggested Amount (derived from slider %)
  - Vector/Path
  - Notes (muscle names, technique hints)

#### 3.3 Clinical Overlay
- Render original face with annotation layer
- Draw injection points at landmark positions
- Connect to dosing labels
- Blue = Toxin, Green = HA Filler (matching existing UI)

#### 3.4 PDF Export
- Compile all data into downloadable PDF
- Include disclaimer: "Visual simulation, not a guaranteed medical outcome"
- Reference ID, timestamp

---

## 7. KEY TECHNICAL DETAILS

### Inpainting Prompt Strategy
The prompt sent to FLUX.1 should be constructed from the contextual control values:

**Prompt Template:**
```
[Region]: [Control 1 at X%], [Control 2 at Y%], [Control 3 at Z%]. [Optional user notes]
Maintain exact identity, lighting, and all areas outside the mask.
Medical aesthetic visualization, photorealistic, subtle natural result.
```

**Example for Lips with Volume 45%, Projection 30%, Definition 60%:**
```
Lips: Moderate volume enhancement (45%), subtle forward projection (30%), well-defined vermillion border (60%).
Maintain exact identity, lighting, and all areas outside the mask.
Medical aesthetic visualization, photorealistic, subtle natural result.
```

**Example for Jawline with Definition 70%, Contour 50%, Angle 40%:**
```
Jawline: Enhanced definition and sharpness (70%), balanced contour refinement (50%), subtly more angular appearance (40%).
Maintain exact identity, lighting, and all areas outside the mask.
Medical aesthetic visualization, photorealistic, subtle natural result.
```

**Control Value to Language Mapping:**
| Range | Intensity | Language Prefix |
|-------|-----------|-----------------|
| 0% | None | "no change to" |
| 1-30% | Subtle | "subtle", "slight", "gentle", "soft" |
| 31-60% | Moderate | "moderate", "balanced", "noticeable" |
| 61-85% | Enhanced | "enhanced", "significant", "prominent" |
| 86-100% | Maximum | "maximum", "dramatic", "bold" |

### MediaPipe Landmark Regions
Use these landmark indices for preset masks:
- **Lips:** indices 61-68, 78-95, 146-149, 178-191, 375-378, 402-415
- **Jawline:** indices 132-172 (left), 361-401 (right)
- **Cheeks:** indices 116-123 (left), 345-352 (right)
- **Nasolabial:** indices 92-98 (left), 327-333 (right)
- **Forehead/Upper Face:** indices 66-70, 103-107, 332-336
- **Nose:** indices 1-6, 168, 197-199, 419-421

(Verify exact indices from MediaPipe documentation - these are approximate)

### Mask Processing
1. User selection → binary mask (white = edit, black = preserve)
2. Apply Gaussian blur for feathering (configurable radius)
3. Send to inpainting API as separate mask image
4. Composite result: preserve outside mask pixel-perfect

---

## 8. FILE STRUCTURE (SUGGESTED)

```
aesthetic-styling/
├── app/
│   ├── page.tsx                 # Landing (01 SCAN)
│   ├── simulation/
│   │   └── page.tsx             # Workbench (02 SIMULATION)
│   ├── results/
│   │   └── page.tsx             # Results (03 RESULTS)
│   ├── api/
│   │   ├── inpaint/route.ts     # FLUX.1 proxy
│   │   ├── segment/route.ts     # SAM 2 proxy
│   │   ├── depth/route.ts       # Depth Anything proxy
│   │   └── summary/route.ts     # Claude API for summaries
│   └── layout.tsx
├── components/
│   ├── ui/                      # shadcn components
│   ├── canvas/
│   │   ├── FaceCanvas.tsx       # Main canvas with Fabric.js
│   │   ├── MaskTools.tsx        # Brush, lasso tools
│   │   └── RegionPresets.tsx    # Quick-select buttons toolbar
│   ├── controls/
│   │   ├── ContextualPanel.tsx  # Floating control panel per region
│   │   ├── RegionControls.tsx   # Region-specific slider configs
│   │   └── controlsConfig.ts    # Define which controls per region
│   ├── panels/
│   │   ├── HistoryTray.tsx      # Bottom version history
│   │   └── ComparisonView.tsx   # Side-by-side display
│   ├── results/
│   │   ├── StyleCard.tsx
│   │   ├── ClinicianPlan.tsx
│   │   └── ClinicalOverlay.tsx
│   └── shared/
│       ├── Navigation.tsx       # Top nav with steps
│       └── ImageUpload.tsx
├── lib/
│   ├── mediapipe.ts             # Face mesh utilities
│   ├── masks.ts                 # Mask generation/processing
│   ├── prompts.ts               # Clinical language mapping
│   ├── api/
│   │   ├── fal.ts               # Fal.ai client
│   │   ├── replicate.ts         # Replicate client
│   │   └── claude.ts            # Anthropic client
│   └── store/
│       └── session.ts           # Zustand store for session state
├── types/
│   └── index.ts                 # TypeScript definitions
├── public/
└── styles/
    └── globals.css
```

---

## 9. ENVIRONMENT VARIABLES NEEDED

```env
# Fal.ai - FLUX.1 Inpainting
FAL_KEY=

# Replicate - SAM 2 + Depth Anything
REPLICATE_API_TOKEN=

# Anthropic - Claude for summaries
ANTHROPIC_API_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## 10. IMMEDIATE FIRST STEPS

1. **Analyze existing projects** in `~/Documents/Aesthetic Styling Simulation/`
2. **Identify reusable code** - especially UI components, styles, any existing logic
3. **Create new Next.js project** (or upgrade existing if suitable)
4. **Set up the design system** matching the prototype screenshots
5. **Build the Simulation workbench screen first** - this is the critical path
6. **Integrate MediaPipe** for face detection
7. **Build region selection tools** (presets first, then brush/lasso)
8. **Connect FLUX.1 inpainting** (Ofir will provide API keys)

---

## 11. COMMUNICATION NOTES

- Ofir is the founder, not a coder - write all code yourself, explain decisions clearly
- Optimize for speed and simplicity first, production-ready later
- This will become a SaaS product but start as internal testing tool
- No auth needed for v1
- Budget-conscious on API calls but prioritize quality results
- When uncertain, ask Ofir - he's available for decisions

---

## 12. SUCCESS CRITERIA

The build is successful when:
1. Doctors can precisely edit small facial regions without collateral changes
2. Patients recognize themselves and trust the output
3. Side-by-side comparisons are distortion-free
4. Versioning supports "I liked X from try #1, Y from try #3"
5. Exported summary is usable for clinical records
6. The experience feels like a clinical instrument, not a beauty filter

---

## START NOW

Begin by running:
```
cd ~/Documents/Aesthetic\ Styling\ Simulation
ls -la
```

Then analyze both existing projects and report what you find. Identify what can be reused and propose any adjustments to this plan based on the actual code.
