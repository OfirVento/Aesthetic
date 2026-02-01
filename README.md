# Aesthetic Styling

Clinical Aesthetic Visualization Workbench — a tool for aesthetic medicine practitioners to simulate injectable treatments with precise, region-specific controls.

## Tech Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Fabric.js** — Canvas mask drawing
- **MediaPipe Face Mesh** — In-browser face landmark detection
- **Nano Banana Pro** — Gemini AI image generation & photo editing (coming)
- **Zustand** — Client state management

## Getting Started

```bash
npm install
cp .env.local.example .env.local
# Fill in API keys in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                  # Next.js pages + API routes
├── components/
│   ├── canvas/           # Face canvas, mask tools, region presets
│   ├── controls/         # Contextual panel, region configs
│   ├── panels/           # Comparison view, history tray, workbench
│   ├── results/          # Visual mapping, clinical recipe
│   └── shared/           # Navigation, image upload, welcome, capture
├── lib/
│   ├── store/            # Zustand session store
│   ├── prompts.ts        # Clinical language prompt builder
│   └── api/              # External API clients (Nano Banana Pro, Replicate, Claude)
└── types/                # TypeScript definitions
```
