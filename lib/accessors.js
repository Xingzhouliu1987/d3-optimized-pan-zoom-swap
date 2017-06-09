(function(){
	   function elem_updater_func(params, obj, validations) {
		  validations = validations || {};
		  for(var valname in params) {
		    /*  function that creates access methods for parameters 
		        for user editable functions, passing in a parameter will 
		        set parameter value to the value passed in, after which the function will return the layer layerect;
		        if no parameter is passed in, the function will return the current value of that parameter
		    
		    */
		    function getonly(valnm) {
		      return function(val) {
		        if(val != null) throw "property cannot be set";
		        return params[valnm];
		      }
		    }
		    function getandset(valnm) {
		      return function(val) {
		        if(val==null) return params[valnm]
		        if(validations[valnm] && !validations[valnm](val)) {
		          throw "Validation Error";
		        }
		        params[valnm] = val;
		        return obj;
		      }
		    }
		    if(valname.slice(0,2) == "__" || obj[valname]) continue

		    if(valname[0]=="_") {
		      obj[valname.slice(1)] = getonly(valname)
		      continue
		    }
		    obj[valname] = getandset(valname)
		  }
	 }
	 window.elem_updater_func = elem_updater_func;
	// return {
	// 	elem_updater_func : elem_updater_func
	// }

})()