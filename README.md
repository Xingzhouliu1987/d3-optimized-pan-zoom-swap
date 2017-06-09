# d3-optimized-pan-zoom-swap

# Purpose

Re-usable D3.js pan/zoom rendering code, useful for maps and similar scenarios.

- Ensure usage of GPU acceleration for Pan Zoom and Reshade tasks
- Capacity to handle large number of nodes while maintaining high FPS (~60)

Index.html contains 12,000 nodes, and operates at 60 FPS.

Approaches:

(1) Apply transforms to HTML, rather than SVG nodes. 
