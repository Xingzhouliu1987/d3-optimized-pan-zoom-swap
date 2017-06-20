(function(d3,elem_updater_func,d3utils,window) {


// must support nodes in circle or nodes in box
//
function loupe() {

   var params = {
      zoomPan:null,
	  size : 0.75,
	  _svg : null,
	  _dim : {},
	  _r : null,
	  color : "#ff9900",
	  background : "#fefefe"
   }
   var widget = {}
   
   elem_updater_func(params, widget, {});
   
   function create() {
   		params._par = params.zoomPan.wrapper()
   			  .append("svg")
              .style("display","none")
              .attr("version","1.1")
              .attr("xmlns", "http://www.w3.org/2000/svg")
              .attr("width", params.zoomPan.width() + 10)
              .attr("height", params.zoomPan.height() + 10)
              .attr("id", params.zoomPan.id() + "-loupe")
              .attr("data-layer-name","loupe" + params.zoomPan.id().replace("-",""))
              .style("transform-origin","0px 0px 0px")
              .style("overflow","visible")
              .style("position","absolute")
              .style("z-index",250)
            
        params._svg = params._par
              .append("g")
              .classed("loupe-container",true)
        var r,cx;
        params._svg.append("path")
        	.attr("d",d3utils.enscrCircle(
        			r = Math.min(params.zoomPan.width()+10,params.zoomPan.height()+10) * params.size * 0.5,
        			[[0,0],[params.zoomPan.width() + 10,params.zoomPan.height() + 10]],
        			cx = [params.zoomPan.width()/2.0 + 5,params.zoomPan.height()/2.0 + 5]))
        			.attr("fill",params.background)
        			.attr("fill-opacity",0.95)
        			
        params._svg.append("circle")
        	.attr("r",r+2)
        	.attr("cx",cx[0])
        	.attr("cy",cx[1])
        	.attr("stroke",params.color)
        	.attr("stroke-width",8)
        	.attr("fill-opacity",0.0)
        params._svg.append("defs")
        			.append("clipPath")
        			.attr("id",params.zoomPan.id() + "-loupe-sq-clp")
        			.append("rect")
        			.attr("x",cx[0]+16)
        			.attr("y",cx[1]+16)
        			.attr("width",r+8)
        			.attr("height",r+8)
        
        params._svg.append("path")
        	.attr("d",d3utils.enscrCircle(r,[cx.map(function(d) {  return d + 5 }),cx.map(function(d) {  return d + r + 5 })],cx))
        			.attr("fill",params.color)
        			.attr("fill-opacity",0.95)
        	.attr("clip-path","url(#"+params.zoomPan.id() + "-loupe-sq-clp)")
        
      params._r  = r;					
   	  return widget
   
   }
   widget.create = create
   function show() {
   		params._par
   			  .style("display","block");
   		return widget
   }
   widget.show = show
   function hide() {
   		params._par
   			  .style("display","none");
   		return widget
   }
	widget.hide = hide
	return widget
}
function qtree_polygon_index() {

   var params = {
      bbox:null,
      extent : null,
      selection: d3.select(null),
      xy : null,
      _qt : null
      
   }
   var widget = {}
   
   elem_updater_func(params, widget, {});

   var cur = Array(params.selection.length).fill(false), 
       prev=[],
       currd = Array(params.selection.length),
       qt;
   function build() {
     var sel = widget.selection();
        qt = d3.quadtree().extent(params.extent)
        params._qt = qt;
        if(params.bbox!=null){
           sel.each(function(d,i){
           var bx = params.bbox(d);
           
           //add all four corners of a paths bounding box
           qt.add([bx[0][0],bx[0][1],i])
           qt.add([bx[1][0],bx[1][1],i])
           qt.add([bx[1][0],bx[0][1],i])
           qt.add([bx[0][0],bx[1][1],i])
           
           
         
        })
        return widget;
      } else {
           sel.each(function(d,i){
           var bx = params.xy(d);
           
           //add only the centroid of the point
           //console.log(bx);
           qt.add([bx[0],bx[1],i])
           
         
        })
        return widget;      
          
      
      }
   }
   widget.build = build
   function search(bbx){
        prev = cur;
        cur = Array(params.selection.length).fill(false)
        var d,q=0;
        qt.visit(function(node,x0,y0,x1,y1) {
             if(node.length) return x0 > bbx[1][0] || x1 < bbx[0][0] || y0 > bbx[1][1] || y1 < bbx[0][1]
             do {
               cur[(d=node.data)[2]] = cur[(d=node.data)[2]] || ( !(d[0]>x1 || d[0]<x0 || d[1] > y1 || d[1] < y0) )
               currd[d[2]] = d;
             } while(node=node.next)
        });
        return widget;
   }
   // finds a single point
   var pfnd,cfnd = d3.select(null),
       pn, cn = -1 ;
    /*
    		
    */
   function find(pnt) {
   		var dt = qt.find(pnt[0],pnt[1]),
   			sel = params.selection.filter(function(d,i){
   					return i == dt[2];
   			});
   		
   		pfnd = cfnd;
   		cfnd = sel;
   		// keep track of idx, since selection cant be compared
   		// 
   		pn = cn;
   		cn = dt[2]; 
   		// when no change, don't return results
   		//  		
   		return {enter: (cn==pn ? d3.select(null) : sel),
   		        exit: ( cn==pn ? d3.select(null) : pfnd) }
   }
   widget.find = find;
   function clear() {
   	cur = Array(params.selection.length).fill(false)
   	return widget;
   }
   widget.clear = clear;
   function box(bbx) {
      search(bbx)
      
      return {enter: params.selection.filter(function(d,i){
             return (cur[i]^prev[i]) && cur[i]
        }),
        exit: params.selection.filter(function(d,i){
             return (cur[i]^prev[i]) &&prev[i]
        })}
   
   }
   function circle(xy,r){
   
       search([[xy[0]-r,xy[1]-r],[xy[0]+r,xy[1]+r]])
       var pos=0,posn=0;
       
      return {enter: params.selection.filter(function(d,i){
      		if(params.xy) {
				var bx = currd[i], xd , yd;
				 //check that point is in circle
				 //
				 cur[i] = cur[i] && (((xd=bx[0]-xy[0])*xd + (yd=bx[1]-xy[1])*yd) < (r*r) )
				 return (cur[i]^prev[i]) && cur[i]
             } else {
            	
             };
        }),
        exit: params.selection.filter(function(d,i){
             return (cur[i]^prev[i]) && prev[i]
             
        })}
   }
   
   function inview(center, scale, width, height){
       var x=center[0],y=center[1];
       return box([[x-width/(2*scale),y-height/(2*scale)],[x+width/(2*scale),y-height/(2*scale)]])
   }
   widget.inview = inview
   function incircle(center, r){
      return circle(center, r)
   }
   widget.incircle = incircle
   return widget;
}
window.qtree_index = qtree_polygon_index;
window.loupe = loupe;

/* meant to listen on zoom event */
function setLoupe(lp,showmn,cb) {
	var stat = false;
	return function(e) {
		if(e.transform.k > showmn) {
			if(!stat) {
				lp.show()
				stat = true;
			}
			cb(e)
		} else {
			if(stat) {
				lp.hide()
				stat = false;
			}		
		
		}
		return stat;
	}
}
window.setloupe = setLoupe;
})(d3,elem_updater_func,d3utils,window)
//search = bbox([[x-width/(2*scale),y-height/(2*scale)],[x+width/(2*scale),y-height/(2*scale)]])