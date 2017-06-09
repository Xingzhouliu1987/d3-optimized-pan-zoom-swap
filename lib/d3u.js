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
  window.d3utils =  {
	//	zoomHandler : zoomHandler, 
	//	html_transforms : html_transforms,
		transformProp : transformProp, 
		randomguid : randomguid,
    quiesced : quiesced,
    alltrue : alltrue,
    anytrue : anytrue,
    isType : {
  		func : isfunc, 
  		number : isnumber,
      transition : isTransition,
      selection : isSelection
    }
  }

})(d3,window)