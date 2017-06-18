(function(d3,elem_updater_func,d3utils,window) {


# must support nodes in circle or nodes in box
#

function qtree_polygon_index() {

   var params = {
      bbox:null,
      extent : null,
      selection: d3.select(null),
      xy : null
      
   }
   var widget = {}
   var cur = Array(params.selection.length).fill(false), 
       prev=[],
       qt;
   function build() {
     var sel = widget.selection();
        qt = quadtree().extent(params.extent)
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
      }
      
      if(params.xy != null){
           sel.each(function(d,i){
           var bx = params.xy(d);
           
           //add only the centroid of the point
           
           qt.add([bx[0],bx[1],i])
           
         
        })
        return widget;      
          
      
      }
   }
   
   function search(bbx){
        prev = cur;
        cur = Array(params.selection.length).fill(false)
        var d,q=0;
        qt.visit(function(node,x0,y0,x1,y1)
             if(node.length) return x0 > bbx[1][0] || x1 < bbx[0][0] || y0 > bbx[1][1] || y1 < bbx[0][1]
             do {
               cur[(d=node.data)[2]] |= ( !(d[0]>x1 || d[0]<x0 || d[1] > x1 || d[1] < x0) )
                
             } while(node=node.next)
        });
        return widget;
   }
   function box(bbx) {
      search(bbx)
      
      return {enter: params.selection.filter(function(d,i){
             return (cur[i]^prev[i])&&cur[i]
        }),
        exit: params.selection.filter(function(d,i){
             return (cur[i]^prev[i])&&prev[i]
        })}
   
   }
   function circle(xy,r){
   
       search([[xy[0]-r,xy[1]-r],[xy[0]+r,xy[1]+r]])
       var pos=0,posn=0;
       
      return {enter: params.selection.filter(function(d,i){
      
             //check that point is in circle
             //
             cur[i] &= (((xd=xf(d)-xy[0])*xd + (yd=yf(d)-xy[1])*yd)<r*r)
             return (cur[i]^prev[i])&&cur[i]
        }),
        exit: params.selection.filter(function(d,i){
             return (cur[i]^prev[i])&&prev[i]
             
        })}
   }
   
   function inview(center, scale, width, height){
       var x=center[0],y=center[1];
       return box([[x-width/(2*scale),y-height/(2*scale)],[x+width/(2*scale),y-height/(2*scale)]])
   }
   
   function incircle(center, r){
      return circle(center, r)
   }
   
}
   window.qtree_index = qtree_polygon_index;
})(d3,elem_updater_func,d3utils,window)
//search = bbox([[x-width/(2*scale),y-height/(2*scale)],[x+width/(2*scale),y-height/(2*scale)]])