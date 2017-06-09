# d3-optimized-pan-zoom-swap

# Purpose

Re-usable D3.js pan/zoom rendering code, primarily used for mapping geographic data.

# fastPanZoom.js

Fast Pan, Zoom and Reshade code that retains high frames per second rates for large numbers of nodes, using SVG rather than canvas to retain portability and straight forward d3 data binding. This encapsulates a solution that uses css transforms against HTML containers of SVG document fragments for zooming and panning behavior, and uses opacity tweens on layered <SVG> nodes to render color changes. 

fastPanZoom.render()

Renders the container and the first layer. chainable.

fastPanZoom.setzoom(zoomObject)

Applies a d3 zoom object, setting listeners on the div container.

fastPanZoom.

Sets the size of the svg element, which is the native size of graphic.

fastPanZoom.width, fastPanZoom.height

Sets the dimensions of the viewport.

fastPanZoom.initialize_view(k)

centers the svg element in the viewport, and scales graphic by k. k is 1 if not provided.

fastPanZoom.hidden_layer(name)

creates an svg element with dimensions set for default layer and name provided that exists only in memory. Returns selection referring to the svg element. If a layer with name already exists, that existing svg is returned. Layer is returned in current visibility state.

fastPanZoom.swap_layers(name, notransition)

swaps currently visible layer with layer having name. If that layer is already visible, no operations as made. If no layer with name exists, an error is thrown. Applies a fade transition by default, or swaps layers over without transition.




- Uses one html container (div) as viewport, attaching zoom listeners to this element. 
- Capacity to handle large number of nodes while maintaining high FPS (~60)

Index.html contains 12,000 nodes, and operates at 60 FPS.

Approaches:

(1) Apply transforms to HTML, rather than SVG nodes. 
