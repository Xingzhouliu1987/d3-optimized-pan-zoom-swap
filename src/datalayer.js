(function(d3, elem_updater_func, d3utils, window){

function DataLayer(layerObj) {
  for(var nm in layerObj){
    this[nm] = layerObj[nm];
  }
}

var datalayers = {};

function dataLayer(klassname, ___) {
  var params = {
    /* this is the g element that is attached to the SVG container or intermediate g element in which visualization is rendered
     *** REQUIRED *** */
    container : null,
    // the svg element that container belongs to
    _svg : null,
    // container for data layer elements
    _elem : null,
    // rendered data layer elements
    _selection : null,
    /* selector for layerects, using generated uuid class */
    _selector : null,
    /*
       function applied to enter set to create elements
       *** required ***
    */
    efunc : null,
    /*
      pointer events consumed by data layerects
    */
    pointerEvents : "auto",
    /*
      Update function applied to the merged set - consisting of both enter and existing sets
    */
    ufunc : function(d, o) { return d; },
    /*
      applied to exiting elements.
    */
    xfunc : function(d, o) { return d.remove(); },
    /*
      applied to existing set ONLY. applied before ufunc and before merged set is constructed.
    */
    ofunc : function(d, o) { return d; },
    /*
      key function used to match elements with data points
    */
    key : null
  }

  
  /*
      generates a random uuid as the 
  */
  var ident = d3utils.randomguid(),
      rendered = false;
  /**
   *
   *
   *
   *
  */
  var layer = new DataLayer(layer);
  
  datalayers[ident] = layer;
  /* 
    class of the layer element
  */ 
  params._elem_klass = klassname == null ? "" : klassname;
  /*
    id of the layer element
  */
  params._elem_id = "data-layer-" + ident;
  /*
     class of layer data layerects
  */
  params._klassname = "data-layer-" + ident +"-item";
  /*
      selector to get all data elements
  */
  params._selector = "." + params._klassname;
  var isfunc = function(val) { return typeof(val) == "function"; };
  var validations = {
    container : d3utils.isType.selection,
    efunc : isfunc,
    ofunc : isfunc,
    ufunc : isfunc,
    xfunc : isfunc
  }
  elem_updater_func(params, layer, validations);
   
  var dispatcher = ___ || d3.dispatch("rendered","set_container", "prerender", "rendercomplete");
  var container_func = layer.container;
  layer.container = function(val) {
    // creates the structure, 
    // attaching an element representing this layer to the container, which should be
    // a g element
    //
    if(val == null) return params.container;
    /*
        no-op if we are passing in the same container as what is set in params
    */
    if(val == params.container) return layer;
    /*
        layer element is removed if we are moving containers
    */
    if(params._svg) {
      throw "already set up";
    }
    return container_func(val);

 }

 function setup() {

    // sets svg to parent svg
    params._svg = params.container.nodes()[0].ownerSVGElement;

    // appends the wrapper
    params._elem = params.container.append("g")
                                    .style("pointer-events","none")
                                    .classed(params._elem_klass , true)
                                    .attr("id",params._elem_id)

  }

  var _existing_data = [];
  layer.render = function(data) {
    /*
      attach the wrapper g element if being called the first time
    */
    if(params._elem==null) setup()
    var fullset, entered, existing , exited;
    /*
      fires before any rendering occurs.
      can be used to render scales, for instance
    */
    if(data==null) {
      data = _existing_data;
    } else {
      _existing_data = data;
    }
    dispatcher.call("prerender", params.container, layer, data)
    params._elem.style("visibility","visible")
    /*
      pointer events should go to the visualization objects
    */
                .style("pointer-events", "none");
    var joined = params._elem
          .selectAll(params._selector)
          .data(data, params.key)

    // update existing nodes, using ufunc
    existing = params.ofunc(joined, layer)
    
    fullset = params.ufunc( 
                (entered = params.efunc(joined.enter(), layer)
                    .style("pointer-events", params.pointerEvents)
                    .classed(params._klassname, true) )
                .merge(joined) , layer )
        

    exited =  params.xfunc(joined.exit(), layer);
    
    params._selection = fullset;
    
    if(d3utils.isType.transition(fullset)) params._selection = fullset.selection()
    /* fired after rendering completes */
    dispatcher.call("rendered", params.container , layer , fullset, [existing,entered,exited]);
    d3utils.quiesced([existing,entered,exited, fullset], function(res, err) {
        if(res) {
           dispatcher.call("rendercomplete", params.container, layer , res.pop() , res)
        }
    })
    return layer;
  }
  layer.clear = function() {
    dispatcher.on("rendercomplete.clear", function(){
      params._elem.style("visibility","hidden")
      dispatcher.on("rendercomplete.clear", null);
    })
    layer.render([]);
   // params._elem.style("visibility","hidden")
    rendered = false;
    return layer;
  }
  layer.hide = function(tf) {
    params._elem.style("visibility","hidden")
    if(params._selection) params._selection.style("pointer-events","none");
    return layer;
  }
  layer.show = function(tf) {
    params._elem.style("visibility","visible")
    if(params._selection) params._selection.style("pointer-events",params.pointerEvents);
    return layer;
  }
  
  layer.on = function(event, cb )
  {
    dispatcher.on(event, cb)
    return layer;

  }

  function cloneIn(alt_container) {
      var cln = dataLayer(klassname , dispatcher.copy());
      for(var nm in params) {
          if(nm.slice(0,1) != "_" && nm != "container") cln[nm](params[nm])
      }
      return cln.container(alt_container)
  }
  return layer;
}
   window.dataLayer = dataLayer;
})(d3, elem_updater_func, d3utils, window)