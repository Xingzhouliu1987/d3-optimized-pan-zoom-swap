(function(d3,elem_updater_func,d3utils,window) {

function blocklabels() {
  params = {
    width: "100vw",
    height: null,
    top: "0px",
    left: "0px",
    container : d3.select("#top"),
    id: "foobox",
    fontSize: "4vmin",
    boxsizes : [3,4,12],
    infoboxes : {}
  }
  var widget = {}
  elem_updater_func(widget,params,{})
  function build(container) {
    if(container) params.container = container;
    params.elem = params.container
      .selectAll("#"+params.id)
      .data([{}])
      .enter()
      .append("div")
 .merge(params.container.selectAll("#"+params.id))
      .classed("container",true)
      .style("position","absolute")
      .style("width",params.width)
      .style("height",params.height)
      .style("top",(params.top===null? "0px" : params.top))
      .style("left",(params.left===null? "0px" : params.left))
      .style("font-size",params.fontSize)
      .attr("id",params.id)
      .classed("block-labels")
    
    if(params.elem.select(".row").size() == 0) {
      params.body = params.elem.append("div")
                  .classed("row",true)
    }
    return widget;
  }
  widget.build = build;
  function infobox(id) {
     if(params.infoboxes[id]) return params.infoboxes[id];
    
    console.log(id)
    var elm = params.body
          .append("div")
          .classed("col-md-"+params.boxsizes[0],true)
          .classed("col-sm-"+params.boxsizes[1],true)               .classed("col-xs-"+params.boxsizes[2],true)
          .classed("infobox",true)
          .attr("id",params.id + "-" + id)
    var innr = elm.append("div")
          .classed("col-md-12",true)
      innr.append("h3")
          .classed("lead",true)
      innr.append("p")
          .classed("main",true)
      innr.append("p")
          .classed("context",true)
      params.infoboxes[id] = elm;
      return elm;
  }
  widget.infobox = infobox
  return widget
}
window.blocklabels = blocklabels
})(d3,elem_updater_func,d3utils,window)