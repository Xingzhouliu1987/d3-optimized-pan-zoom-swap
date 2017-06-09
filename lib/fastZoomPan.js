(function(d3,elem_updater_func,d3utils,window) {
    function zoomHandler(html_elem) {
      var tprop = d3utils.transformProp()
      return function() {
        var t = d3.event.transform;
        return html_elem().style(tprop,'translate3d(' + t.x + 'px,' + t.y + 'px, 0px) scale3d(' + t.k + "," + t.k + ",1)");
      }
    }
    function zoomQuickTransitionHandler(svg,t0,t1) {
           var ix = d3.interpolate(t0.x,t1.x),
               iy = d3.interpolate(t0.y,t1.y),
               ik = d3.interpolate(t0.k,t1.k);
           return function(t) {
                  return 'translate3d(' + ix(t) + 'px,' + iy(t) + 'px, 0px) scale(' + ik(t) + "," + ik(t) + ")"
           }
    }
    /*
  HTML Transforms 
    uses 3d transform to trigger gpu acceleration on most browsers
  */
function check_resolution_after_zoom(svg,t) {
       var isFfx = /firefox/.test(navigator.userAgent),
           node = svg.node() ,
           kmax = t.k ,
           ct = t.k ,
           tOut;
       
       function forced_layout() {
              clearTimeout(tOut);
              node.style.display = "none"
              node.clientWidth;
              node.style.display = "block"
              kmax = ct;
              node.clientWidth;
              tOut = null;
       }

       // noOp if the browser is firefox
       if(isFfx) return function(){};
       
       return function() {
              ct = d3.event.transform.k;
              if(ct > kmax ){//|| Math.max(kmax/ct) > 2) {
                     clearTimeout(tOut)
                     tOut = setTimeout(forced_layout, 300)
              }
       }
}

function fastZoomPan() {
       var params = {
          width : 960,
          height : 500,
          bbox : null,
          container : null, 
          id : "widget-a",
          tDuration : 2000,
          tEase : d3.easePolyInOut(4.0),
          _svg : null , 
          _wrapper : null, 
          _zoom : null,
          _svgdim : null,
          __hidden : {}
       }
      var widget = {}
  var dispatcher = d3.dispatch("preswap","postswap")

      var validations = {
        container : d3utils.isType.selection ,
        bbox : function(val) { return d3utils.isType.func(val) || (val.length == 2 && val[0].length == 2 & val[1].length ==2 && 
            d3utils.alltrue(val[0], d3utils.isType.number) && d3utils.alltrue(val[1], d3utils.isType.number)) }
      }

      elem_updater_func(params, widget, validations);
      /*
        This function builds the zppm and pan.
        CSS Transforms (translations, scale, rotations, etc., ) can be rendered with hardware acceleration when applied against HTML in most browsers. The same is 
            not true for the same transformations applied against nodes inside SVG docs.

        - wrapper div :
             relatively position
             transform origin is 2d center
             serves as viewport, clipping overflow
             listens from wheel and drag events, and emits zoom events

        - svg element :
             transform target
             sized to cover bounding box of all elements inside @ scale = 1
             positioned to match scale - ie svg element should be centered using negative translations if necessary

       listening on a html element, then transforming another html element (the svg container is rendered as html), we get accellerated svg zoom transforms; 
       
       @method fastZoomPan.render
       @param { Array } optional array of data to apply if you've set bbox as a function
       @return { fastZoomPan } returns self for chaining


      */
  function build() {
     var bbox;
     if(Array.isArray(params.bbox)) 
      { 
        bbox = params.bbox
      } 
      else
      {
        bbox = params.bbox.call(widget)
      }
      var bbx, bby;
      var svgwidth = Math.max(bbox[1][0] - bbox[0][0], params.width),
          svgheight = Math.max(bbox[1][1] - bbox[0][1], params.height);
     // params.__initial_translation = [ -Math.max(wdiff, 0) * 0.5 , -Math.max(vdiff, 0) * 0.5 ]
    // console.log(bbox)
      params._svgdim = {width: svgwidth , height: svgheight};
      return render_frame();
  } 
  widget.build = build;
  function render_frame() {
       params._wrapper = params.container.append("div")
              .style("width", params.width + "px")
              .style("height", params.height + "px")
              .style("pointer-events","all")
              .style("position", "relative")
              .attr("id", params.id + "-wrapper")
              .style("overflow","hidden")
              .style("transform-origin","50% 50% 0px")

      params._svg = params._wrapper
                      .append("svg")
                      .attr("version","1.1")
                      .attr("xmlns", "http://www.w3.org/2000/svg")
                      .attr("width", params._svgdim.width )
                      .attr("height", params._svgdim.height )
                      .attr("id", params.id + "-default")
                      .attr("data-layer-name","default")
                      .style("transform-origin","0px 0px 0px")
                      .style("overflow","visible")
                      .style("position","absolute")
                      .style("z-index",100)
     return widget;    
  }
  widget.render = build
  
  function hidden_layer(layername) {
    if(params.__hidden[layername]) return params.__hidden[layername];
    if(params._svg.attr("data-layer-name") == layername) return params._svg;
        params.__hidden[layername] = params._wrapper
              .append("svg")
              .style("display","none")
              .attr("version","1.1")
              .attr("xmlns", "http://www.w3.org/2000/svg")
              .attr("width", params._svgdim.width)
              .attr("height", params._svgdim.height)
              .attr("id", params.id + "-"+ layername)
              .attr("data-layer-name",layername)
              .style("transform-origin","0px 0px 0px")
              .style("overflow","visible")
              .style("position","absolute")
              .style("z-index",50)
      return params.__hidden[layername];
  }
  // required when zooming to a scale that's larger than any other scale since the svg element was last fully redrawn
  //   without forcing a synchronous redraw at maximum scale on bringing in the svg node, resolution will be limited to 
  //   whatever scale it was in at the previous full redraw.
  // function force_sync_redraw() {
  //   var node = widget.svg().node();
  //   node.style.display = "none";
  //   node.clientWidth;
  //   node.style.display = "block";
  //   //node.clientWidth;
  // }
  var swapping = null;
  function swap_visible(hidden_layer,notransition) {
      if(swapping || widget.svg().attr("data-layer-name")==hidden_layer || params.__hidden[hidden_layer] == null) {
            return widget;
      }
      dispatcher.call("preswap", widget, params._svg.attr("data-layer-name"), hidden_layer)

      /*

          need deconfliction solution

      */
      swapping = true;

      var swap_in = params.__hidden[hidden_layer],
          swap_out = params._svg,
          t = getTransform();
      swap_in.style("transform",swap_out.style("transform"))
      
      swap_in
            // .style("display","block")
             .style("opacity",1.0);
      swap_in.node().style.display = "block"
      params._svg = swap_in;
      
      function complete_swap(){

                    widget.zoom().on("zoom.check_resolution"+widget.id(), check_resolution_after_zoom(params._svg , t))

                    swap_out.style("z-index",50)
                            .style("display","none")

                    swap_in.style("z-index",100)
                    params.__hidden[swap_out.attr("data-layer-name")] = swap_out;
                      /*
                       re applies state that existed at the beginning of the operation
                     */
                     
                     dispatcher.call("postswap", widget, params._svg.attr("data-layer-name"), hidden_layer)
                     swapping = false;
      }
      if(notransition) {
        complete_swap()
        return widget;
      }
      swap_out.transition()
              .duration(params.tDuration)
              .style("opacity",0.0)
             // .ease(params.tEase)
              .on("interrupt",function() {
                  swap_out
                    .style("opacity",0.0)
                  complete_swap()
              })
              .on("end",complete_swap);
       return widget;
  }
  widget.rendering = function() {
    return swapping;
  }
  widget.hidden_layer = hidden_layer;
  widget.swap_visible = swap_visible;
      

  /*
    @method fastZoomPan.getTransform
    @return { d3.Transform } method to get current zoom transform
  */
  function getTransform() {
      return d3.zoomTransform(params._wrapper.node())
  }
  /*
    @method fastZoomPan.transformTo
    @param { Array } a length two array representing the projected point you would like to center
    @param { Number } optional scale. will use current scale if left blank
    @return { d3.Transform } a d3 transform object that represents the specified transformation

  */
  function transformTo(d, scale, bounded) {
      scale = d3utils.isType.number(scale) ? scale : getTransform().k;
      if(d && d3utils.alltrue(d, d3utils.isType.number)) {
          if(!bounded) return d3.zoomIdentity.translate(params.width / 2 - d[0] * scale , params.height / 2 - d[1] * scale).scale(scale)
          

          var scalextent = widget.zoom().scaleExtent();
          scale = Math.min( scalextent[1] , Math.max(scale, scalextent[0]) )
          var xt = Math.max(0,d[0] * scale + params.width - params._svgdim.width * scale)
                      + (params.width / 2 - d[0] * scale) + Math.min(0,d[0] * scale - params.width/2);
          var yt = Math.max(0,d[1] * scale + params.height - params._svgdim.height * scale)
                      + (params.height / 2 - d[1] * scale) + Math.min(0,d[1] * scale - params.height/2);
          
          return d3.zoomIdentity.translate(xt, yt)
                      .scale( scale )
      }
      return transformTo([params._svgdim.width / 2 , params._svgdim.height / 2], scale, bounded)
  }
  widget.getTransform = getTransform;
  
  function transform(center, scale, notransition) {
       return widget.wrapper()
             .transition()
             .duration(params.tDuration)
            // .ease(params.tEase)
             .call(widget.zoom().transform, widget.transformTo(center,scale))
  }
  widget.transform = transform
   /* 
    Takes an initialized d3.zoom object, sets translate bounds, then binds
    listeners to wrapper and transforms to svg
    click and double click listeners are disabled, as they are extraneous and makes adding mouse listeners 
    on svg elements difficult

    @method fastZoomPan.setzoom
    @param { object } a d3.zoom object 
    @return { object } return self for chaining
       */
  function setzoom(zoom) {
      if(!zoom) {
         zoom = d3.zoom().scaleExtent([0.5,5])
      }
      zoom.translateExtent([[
          0,0
        ],[
          Math.max(params.width , widget.svgdim().width),
          Math.max(params.height , widget.svgdim().height)
      ]]);
      params._zoom = zoom;
      widget.wrapper().call( zoom.on("zoom."+widget.id().replace("-","_"), zoomHandler( widget.svg ) ) )


      //widget.wrapper().call( widget.zoom().transform , transformTo(null, 1) )
      widget.zoom().on("zoom.check_resolution"+widget.id(),
                     check_resolution_after_zoom(widget.svg() , getTransform()))
                             //d3.zoomTransform(widget.wrapper().node())
                             //.translate( params.width / 2 - params._svgdim.width/2, params.height / 2 - params._svgdim.height/2 ).scale(1) )
      
  
          return widget;
      
      }
      widget.setzoom = setzoom;
      widget.transformTo = transformTo;
      /*
        This must be called after all rendering and transitions during initial creation have ceased.
      */
      function initialize_view(k) {
        widget.wrapper().call( widget.zoom().transform , transformTo(null, k || 1))
      }
      widget.initialize_view = initialize_view
      return widget;
    }
    window.fastZoomPan = fastZoomPan;
})(d3,elem_updater_func,d3utils,window)