## Prompt for Claude Code on your terminal

Paste everything below the line into your local Claude Code:

---

I need you to fix the mesh deformation sliders on the
/mesh-demo page. When users move the filler sliders,
the face image should visibly deform in real-time.

The problem is in 2 files:

### File 1: src/lib/meshSimulation/MeshRenderer.ts

The updateSimulation() method needs to actually deform
the grid vertices. Here's what it must do:

1. Change INFLUENCE_RADIUS from 0.12 to 0.28
2. Reset all vertex positions from originalPositions
3. Loop through each FILLER_MORPH_TARGETS entry
4. Skip if intensity is 0 (no slider value)
5. Compute the centroid of the target's affected
   landmarks (average X,Y of those landmark indices)
6. For each grid vertex, find the distance to the
   nearest affected landmark
7. If distance < INFLUENCE_RADIUS, apply a smoothstep
   falloff and displace the vertex radially outward
   from the centroid
8. For "custom" direction targets where the XY
   magnitude > 0.2, use the custom direction instead
   of radial outward
9. Set posAttr.needsUpdate = true and call render()
10. Add console.log showing active fillers and how
    many vertices were displaced

If updateSimulation is currently a stub that just calls
this.render() without modifying positions, it needs to
be fully rewritten with the logic above.

### File 2: src/lib/meshSimulation/morphTargets.ts

1. Multiply ALL maxDisplacement values by 4x:
   - lips_upper_volume: 0.03 -> 0.12
   - lips_lower_volume: 0.035 -> 0.14
   - lips_vermilion_definition: 0.015 -> 0.06
   - lips_cupids_bow: 0.02 -> 0.08
   - lips_corners_lift: 0.025 -> 0.10
   - cheeks_volume: 0.04 -> 0.16
   - midface_volume: 0.035 -> 0.14
   - nasolabial_fill: 0.025 -> 0.10
   - tear_trough_fill: 0.02 -> 0.08
   - chin_projection: 0.04 -> 0.16
   - jawline_definition: 0.03 -> 0.12
   - marionette_fill: 0.02 -> 0.08
   - prejowl_fill: 0.025 -> 0.10
   - nose_bridge_height: 0.02 -> 0.08
   - nose_tip_projection: 0.015 -> 0.06

2. Fix Z-only custom directions (invisible in 2D):
   - chin_projection: {x:0,y:0,z:1} -> {x:0,y:1,z:0}
   - nose_bridge_height: {x:0,y:0,z:1} -> {x:0,y:-1,z:0}
   - nose_tip_projection: {x:0,y:-0.3,z:0.95} -> {x:0,y:1,z:0}

After changes, run: npm run build

Do NOT push to main or create a PR.
