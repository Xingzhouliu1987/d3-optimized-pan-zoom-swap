# d3-optimized-pan-zoom-swap

# Purpose

Re-usable D3.js pan/zoom rendering code, primarily used for mapping geographic data.

# fastPanZoom.js

Fast Pan, Zoom and Reshade code that retains high frames per second rates for large numbers of nodes (>10.000), using SVG rather than canvas to retain portability and straight forward d3 data binding. This encapsulates a solution that uses css transforms against HTML containers of SVG document fragments for zooming and panning behavior, and uses opacity tweens on layered ```<SVG>``` nodes to render color changes. 

Rasterization is minimized, and should be limited to SVG changes that are not pan,zoom or opacity tweenable, when raster of regions are not yet in memory, or after zoom operation requires image at higher resolution than current bitmap. Hidden layers are retained.

```
fastPanZoom.render()
```

Renders the container and the first layer. chainable. 

```
fastPanZoom.setzoom(zoomObject)
```

Applies a d3 zoom object, setting listeners on the div container. Returns currently set value if no argument given.

```
fastPanZoom.bbox([[minx,miny],[maxx,maxy]])
```

Sets the size of the svg element, which is the native size of graphic. Returns currently set value if no argument given.

```
fastPanZoom
    .width([int])
    .height([int])
    ```

Sets the dimensions of the viewport.
```
  fastPanZoom.initialize_view(k)
```
centers the svg element in the viewport, and scales graphic by k. k is 1 if not provided.
```
  fastPanZoom.hidden_layer(name)
```
creates an svg element with dimensions set for default layer and name provided that exists only in memory. Returns selection referring to the svg element. If a layer with name already exists, that existing svg is returned. Layer is returned in current visibility state.
```
  fastPanZoom.swap_visible(name, notransition)
```
swaps currently visible layer with layer having name. If that layer is already visible, no operations as made. If no layer with name exists, an error is thrown. Applies a fade transition by default, or swaps layers over without transition. Hidden layer will be swapped in with the same transform currently applied to layer being swapped out - ie matching elements should be at the same location in viewport.

```
  fastPamZoom.zoom()
```
returns reference to d3.zoom object. Can only get the zoom object. Must call setzoom to swap zoom object.

```
fastPanZoom.getTransform()
```
Returns current transform state as d3 Transform object.

```
// creates transform that centers point [x,y] in the viewport at scale [scale]
var t = fastPanZoom.transformTo([x,y], scale)

// will apply the transform
fastPanZoom.wrapper().call(fastPanZoom.zoom().transform, t)
```
Converts [x,y] location on the ```<SVG> ```to transform that would center that location in the viewport at scale k. Returns a d3-zoom Transform object.

```
fastPanZoom.tDuration([int])
```
Sets default duration for transforms. Current swap_visible transform uses this property. Returns currently set value if no argument given.


