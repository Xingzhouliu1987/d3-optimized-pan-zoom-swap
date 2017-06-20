(function(d3,window){
	
	function randomguid() {
	    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	    return v.toString(16);
	     });

  }
  var trc = d3.select(null).transition(),
      slc = d3.select(null);

  function isTransition(obj) {
  	return (obj.constructor.name == "Transition")
  }
  function isSelection(obj) {
  	 return (obj.constructor.name == "Selection")
  }
  /*
	in d3.v4, end events on transitions are no longer attached per object, but per selection.
	given a function that modifies some attributes on some nodes that may optionally use a transition to apply those 
	changes, the following function calls a provided callback once all transitions (if any) have been completed.
	this function calls the callback with all selection type objects, getting the selection object from a transition where needed

  */
  function quiesced(selections, callback, timeout) {
  	var ts = 0, to = null;
  	try {
	  	
	  	if(timeout) {
	  	    to = setTimeout(function(){
	  	    	callback(null, "timed out");
	  	    }, timeout);
	  	};
	  	function endfunc(){
	  		if(--ts===0) {
	  			if(to) clearTimeout(to)
	  			callback(selections.map(function(d){
	  				if(isTransition(d)) return d.selection()
	  				return d;
	  			}))
	  			
	  		}
	  	}
	  	selections.map(function(sel){
	  		if(isTransition(sel)) {

	  			ts++
	  			try {
	  				sel.on("end.quiscecheck"+randomguid().replace("-",""),endfunc)
	  			} catch(err) {
	  				if(err.message=="too late") {
	  					--ts ;
	  				}
	  				else {
	  					throw err;
	  				}
	  			}
	  		
	  		}
	  	})
	  	if(ts === 0) {
	  		
	  		if(to) clearTimeout(to)
	  		callback(selections)
	  	}
    } catch(err) {
    	if(to) clearTimeout(to);
    	callback(null, err)
    	throw err;
    }
  }
  var isfunc = function(val) { return typeof(val) == "function"; },
      isnumber = function(val) { return typeof(val) == "number" },
      alltrue = function(arr, assert) { 
        assert = assert || function(a) { return a; }; 
        return arr.reduce(function(a,b){
          return (a && assert(b))
      },true) } , 
       anytrue = function(arr, assert){
       	  assert = assert || function(a) { return a; }
       	  return arr.reduce(function(a,b){
       	  	   return a || assert(b)
       	  }, false)

       };
   

   function transformProp() {
      return (function(props) {
            var style = document.documentElement.style;
            for (var i = 0; i < props.length; i++) {
                if (props[i] in style) return {
                    transform: 'transform',
                    WebkitTransform: '-webkit-transform',
                    OTransform: '-o-transform',
                    MozTransform: '-moz-transform',
                    msTransform: '-ms-transform'
                }[props[i]];
            }
            return false;
        })(['transform', 'WebkitTransform', 'OTransform', 'MozTransform', 'msTransform']);
 }
 /*
    creates an enscribed circle
 */
 function enscrCircle(r,box,cxy) {
    // center of box
 	var boxc = cxy || [ (box[1][0] + box[0][0]) * 0.5, 
 				 (box[1][1] + box[0][1]) * 0.5 ],
 	    c0 = [boxc[0] + r, boxc[1]];
    return "M"+c0+"a"+[r,r]+" 0 1,0 "+[-r*2,0]+"a"+[r,r]+" 0 1,0 "+[r*2,0]+"M" + [box[0][0],box[0][1]] + "L" 
    		+ [box[1][0],box[0][1]] + "L" + [box[1][0],box[1][1]] + "L" + [box[0][0],box[1][1]] + "L" + 
    		 [box[0][0],box[0][1]] + "Z";
 }


  /*
     convenient zoomHandler for transforming html zoom targets
     
     @example
        zoom.on("zoom", zoomHandler(zoomTarget, d3))

     @function zoomHandler
     @param { Selection } the object that is the target for the zoom transform - the svg element in many cases
     @param { object } d3c the d3 instance that exists at runtime must be passed in for it to have access to the d3.event

  
  function zoomHandler(html_elem, d3c) {
    var tprop = transformProp()
  	return function() {
  		var t = d3c.event.transform;
  		return html_elem.style(tprop, html_transforms()(t));
  	}
  }
  */

function M(ab) {
  return "M" + ab;
}
function C(a,b,dest) {
  return "C" + a + " " + b + " " + dest;
}
function A(r,dest,inv) {
   return "A" + r.join(" ") + " " +
     [0,!inv * 1, inv * 1].join(" ")
     + " " + dest.join(" ");
}
	function grass(ext,wd,extractor) {
		var xm,
		xs = d3.interpolate((xm = ext.map(function(d) {return d[0]}))[0],xm[1]),
		 ym = ext.map(function(d) {return d[1]}),
		xz=xm[1] - xm[0],
		yz=ym[1] - ym[0];
		extractor === undefined ? function(d) { return d; } : extractor;
		return function(t) { 
		   t = extractor(t)
		   return M([xm[0],ym[0] + yz]) + C([xs(t*0.125),ym[0] + yz * 0.36],[xs(t * 0.5), + ym[0] +  (yz * 0.068)],[xs(t),ym[0]]) + C([xs(t*0.56),ym[0] + yz * 0.068],                 
		   [xs(t*0.187),ym[0] + yz * 0.36],[xm[0]+wd,ym[0] + yz]) + A([wd,wd * 0.75],[xm[0],ym[0] + yz],true)
		 }
	}

  window.grass = grass
  function transformGrass(ext, wd, extractor, adjx, adjy ) {
    var xdf = ext[1][0] - ext[0][0],
        ydf = ext[1][1] - ext[0][1];
      adjx = adjx===undefined? 0 : adjx;
      adjy = adjy===undefined? 0 : adjy;
	   extractor == null ? function(d) { return d; } : extractor;
      return function(t) {
            var sc = extractor(t), scy = Math.abs(extractor(t));
            return "translate(" + [xdf * (1-sc) + (wd * 0.5) * (1-sc) + adjx   * (1 - sc), ydf * (1-scy) + ext[0][1] * (1-scy) + adjy * (1-scy)] + ")scale("+[sc,scy]+")"
    }
    
} 
  var functor = function(val) {
  		return val === undefined ? function(x) { return x; } : function() { return val; }
  };
function attrGetter(attr_name, applyf) {
	applyf = applyf && applyf.type == "function" ? applyf : functor();
	return function(d) {
		return applyf(d[attr_name])
	}
}
function aggregateResults(eo, valuefunc, keyfuncs , totals) {
	var nst = d3.nest();
	
		keyfuncs.map(function(p) {
			nst.key(p.type=="function" ? p : attrGetter(p))
		})
		
		nst
		.rollup(function(d){ 
		 	try { return valuefunc(d[0]) } catch(err) { return 0; }
		 });
		var entr = {},ext = {};
	   var ns = nst
		.entries(eo.enter.data())
		.map(function(nest) {
			
			nest.values = nest && nest.values ?  nest.values.reduce(function(a,b) {
				return a + b.value;
			},0) : 0;
			if(entr[nest.key] == null) {
				 entr[nest.key] = nest.values
			} else {
				entr[nest.key] += nest.values
			}
			return nest
		})

	   nst
		.entries(eo.exit.data())
		.map(function(nest) {

			nest.values = nest && nest.values ?  nest.values.reduce(function(a,b) {
				return a + b.value;
			},0) : 0;

			if(ext[nest.key] == null) {
				 ext[nest.key] = nest.values
			} else {
				 ext[nest.key] += nest.values
			}
			return nest
		})
		if(totals["grand"] == null) totals["grand"] = {key:"grand",value:0};
		for(nm in ext) {
			totals[nm].value = totals[nm].value - ext[nm]
			totals["grand"].value -= ext[nm]
		}
		for(nm in entr) {
			if(totals[nm] == null) totals[nm] = {key: nm, value: 0}
			totals[nm].value = totals[nm].value + entr[nm]
			totals["grand"].value += entr[nm]
		}
		for(nm in totals) {
			if(Math.abs(totals[nm].value) <= 0 && nm != "grand") {
				delete totals[nm];
			}
		}
		return totals;
  }
  window.d3utils =  {
	//	zoomHandler : zoomHandler, 
	//	html_transforms : html_transforms,
	    grassfn : {
	    	grass : grass,
	    	transform : transformGrass
	    },
		transformProp : transformProp, 
		randomguid : randomguid,
		functor : functor ,
    quiesced : quiesced ,
    alltrue : alltrue,
    attrGetter : attrGetter,
    anytrue : anytrue,
    transformGrass : transformGrass,
    grass : grass ,
    aggregateResults : aggregateResults,
    enscrCircle : enscrCircle,
    isType : {
  		func : isfunc, 
  		number : isnumber,
      transition : isTransition,
      selection : isSelection,
      sumr : function(a,b) { return a + b; }
    }
  }

})(d3,window)