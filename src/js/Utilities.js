//EventDispatcher.js
//_____________________________________________________________________________________________________________________________________________________________________________________________________________________________
var EventDispatcher = function(){
	this.eventHashTable = {};
}

EventDispatcher.prototype.addEventListener = function(eventType,func){
	if(this.eventHashTable[eventType] === undefined) this.eventHashTable[eventType] = [];
	if(this.eventHashTable[eventType].indexOf(func) === -1) this.eventHashTable[eventType].push(func);
};

EventDispatcher.prototype.removeEventListener = function(eventType,func){
	if(this.eventHashTable[eventType] === undefined) return false;
	if(this.eventHashTable[eventType].indexOf(func) > -1) this.eventHashTable[eventType].splice(this.eventHashTable[eventType].indexOf(func),1);
	return true;
};

Array.prototype.indexOf = function(value){
	for(var i=0;i<this.length;i++){
		if(this[i] === value){
			return i;
		}
	}
	return -1;
}

Array.prototype.clone = function(){
	var i=0;
	var l = this.length;
	var a = [];
	for(i=0;i<l;i++){
		a[i] = this[i];
	}
	return a;
}

Array.prototype.sum = function(){
	for(var s = 0, i = this.length; i; s += this[--i]);
    return s;
}

EventDispatcher.prototype.dispatchEvent = function(eventObject){
	var a = this.eventHashTable[eventObject.eventType];
	if(a === undefined || a.constructor != Array){
		return false;
	}
	for(var i=0;i<a.length;i++){
		a[i](eventObject);
	}
};
//end of EventDispatcher.js
//_____________________________________________________________________________________________________________________________________________________________________________________________________________________________








//event.js
//_____________________________________________________________________________________________________________________________________________________________________________________________________________________________

// written by Dean Edwards, 2005
// with input from Tino Zijdel, Matthias Miller, Diego Perini

// http://dean.edwards.name/weblog/2005/10/add-event/

function addEvent(element, type, handler) {
	if (element.addEventListener) {
		element.addEventListener(type, handler, false);
	} else {
		// assign each event handler a unique ID
		if (!handler.$$guid) handler.$$guid = addEvent.guid++;
		// create a hash table of event types for the element
		if (!element.events) element.events = {};
		// create a hash table of event handlers for each element/event pair
		var handlers = element.events[type];
		if (!handlers) {
			handlers = element.events[type] = {};
			// store the existing event handler (if there is one)
			if (element["on" + type]) {
				handlers[0] = element["on" + type];
			}
		}
		// store the event handler in the hash table
		handlers[handler.$$guid] = handler;
		// assign a global event handler to do all the work
		element["on" + type] = handleEvent;
	}
};
// a counter used to create unique IDs
addEvent.guid = 1;

function removeEvent(element, type, handler) {
	if (element.removeEventListener) {
		element.removeEventListener(type, handler, false);
	} else {
		// delete the event handler from the hash table
		if (element.events && element.events[type]) {
			delete element.events[type][handler.$$guid];
		}
	}
};

function handleEvent(event) {
	var returnValue = true;
	// grab the event object (IE uses a global event object)
	event = event || fixEvent(((this.ownerDocument || this.document || this).parentWindow || window).event);
	// get a reference to the hash table of event handlers
	var handlers = this.events[event.type];
	// execute each event handler
	for (var i in handlers) {
		this.$$handleEvent = handlers[i];
		if (this.$$handleEvent(event) === false) {
			returnValue = false;
		}
	}
	return returnValue;
};

function fixEvent(event) {
	// add W3C standard event methods
	event.preventDefault = fixEvent.preventDefault;
	event.stopPropagation = fixEvent.stopPropagation;
	return event;
};
fixEvent.preventDefault = function() {
	this.returnValue = false;
};
fixEvent.stopPropagation = function() {
	this.cancelBubble = true;
};


//end of event.js
//_____________________________________________________________________________________________________________________________________________________________________________________________________________________________








//helpers.js
//_____________________________________________________________________________________________________________________________________________________________________________________________________________________________
function cleanWhitespace(element) {
	element = element || document;
	var cur = element.firstChild;
	while(cur != null) {
		if( cur.nodeType == 3 && ! /\S/.test(cur.nodeValue)){
			element.removeChild(cur);	
		}else if(cur.nodeType==1){
			cleanWhitespace(cur);
		}
		cur = cur.nextSibling;
	}
}

function prev(elem) {
	do {
		elem = elem.previousSibling;
	} while (elem && elem.nodeType != 1);
	return elem;
}

function next(elem) {
	do {
		elem = elem.nextSibling;
	}while (elem && elem.nodeType != 1);
	return elem;
}

function first(elem){
	elem = elem.firstChild;
	return elem && elem.nodeType != 1 ? next( elem) : elem;
}

function last(elem) {
	elem = elem.lastChild;
	return elem && elem.nodeType != 1 ? prev(elem) : elem;	
}

function parent(elem,num) {
	num = num || 1;
	for(var i=0;i<num;i++){
		if(elem != null){
			elem = elem.parentNode;		
		}
	}
	return elem;
}

function id(name) {
	return document.getElementById(name);	
}

function tag(name, elem) {
	return (elem || document).getElementsByTagName(name);	
}

function domReady(f){
	if(domReady.done){
		return f();
	}
	if(domReady.timer){
		domReady.ready.push(f);
	}else{
		addEvent(window, "load", isDOMReady);
		domReady.ready = [f];
		domReady.timer = setInterval( isDOMReady,13);	
	}	
}

function isDOMReady() {
	if(domReady.done) return false;
	if(document && document.getElementById && document.getElementsByTagName && document.body) {
		clearInterval(domReady.timer);
		domReady.timer = null;
		for(var i=0;i<domReady.ready.length;i++){
			domReady.ready[i]();	
		}
		domReady.ready = null;
		domReady.done = true;
	}
}

function hasClass(name,type){
	var r = [];
	var re = new RegExp("(^|\\s)" + name + "(\\s|$)");
	var e = document.getElementsByTagName(type || "*");
	for(var j=0;j<e.length;j++){
		if(re.test(e[j])){
			r.push(e[j]);
		}
	}
	return r;
}
function text(e){
	var t = "";
	e = e.childNodes || e;
	for(var j=0;j<e.length;j++){
		j += e[j].nodeType != 1 ? e[j].nodeValue : text(e[j].childNodes);
	}
	return t;
}
function hasAttribute(elem,name) {
	return elem.getAttribute(name) != null;	
}
function attr(elem, name, value){
	if( !name || name.constructor != String ) return '';
	name = {'for':'htmlFor', 'class':'className'}[name] || name;
	if(typeof value != 'undefined'){
		elem[name] = value;
		if(elem.setAttribute){
			elem.setAttribute(name,value);
		}
	}
	return elem[name] || elem.getAttribute(name) || '';
}

function create( elem) {
	return document.createElementNS ? document.createElementNS('http://www.w3.org/1999/xhtml',elem) : document.createElement(elem);	
}
function before(parent, before, elem){
	if(elem == null){
		elem = before;
		before = parent;
		parent = before.parentNode;	
	}
	parent.insertBefore(checkElem( elem),before);
}
function append(parent, elem){
	parent.appendChild( checkElem( elem));	
}

function remove(elem){
	if(elem) elem.parentNode.removeChild( elem );
}

function empty ( elm ) {
	while( elem.firstChild) remove(elem.fistChild);
}

function checkElem(elem) {
	return elem && elem.constructor == String ? document.createTextNode(elem) : elem;	
}

//CSS
function getStyle(elem,name) {
	if(elem.style[name]){
		return elem.style[name];
	}else if(elem.currentStyle){
		return elem.currentStyle[name];
	}else if(document.defaultView && document.defaultView.getComputedStyle){
		name = name.replace(/(A-Z])/g,"-$1");
		name = name.toLowerCase();
		var s = document.defaultView.getComputedStyle(elem,"");
		return s && s.getPropertyValue(name);
	}else {
		return null;
	}
}

function posX(elem) {
	return parseInt( getStyle(elem,'left'));	
}

function posY(elem) {
	return parseInt( getStyle(elem,'top'));	
}

function getHeight(elem) {
	return parseInt( getStyle(elem,'height'));	
}

function getWidth(elem) {
	return parseInt( getStyle(elem,'width'));	
}

function pageX(elem){
	if(elem.offsetParent){
		return elem.offsetLeft + pageX( elem.offsetParent );
	}else{
		return elem.offsetLeft;
	}
}

function pageY(elem){
	if(elem.offsetParent){
		return elem.offsetTop + pageY( elem.offsetParent );
	}else{
		return elem.offsetTop;
	}
	//return elem.offsetParent ? elem.offsetTop + pageY( elem.offsetParent ) : elem.offsetTop;	
}

function fullWidth(elem) {
	if(getStyle( elem, 'display') != "none") {
		return elem.offsetWidth || getWidth(elem);	
	}
	var old = resetCSS(elem, {
		display: '',
		visibility: 'hidden',
		position: 'absolute'	
	});
	var w = elem.clientWidth || getWidth( elem);
	restore(elem,old);
	return w;
}

function fullHeight(elem) {
	if(getStyle( elem, 'display') != "none") {
		return elem.offsetHeight || getHeight(elem);	
	}
	var old = resetCSS(elem, {
		display: '',
		visibility: 'hidden',
		position: 'absolute'	
	});
	var h = elem.clientHeight || getHeight( elem);
	restore(elem,old);
	return h;
}

function resetCSS(elem,prop){
	var old = {};
	for(var i in prop){
		old[i] = elem.style[i];
		elem.style[i] = prop[i];
	}
	return old;
}

function restoreCSS( elem,prop) {
	for(var i in prop){
		elem.style[i] = prop[i];
	}
}



function disableSelection(target){
	if (typeof target.onselectstart!="undefined") //IE route
		target.onselectstart=function(){return false}

	else if (typeof target.style.MozUserSelect!="undefined") //Firefox route
		target.style.MozUserSelect="none"

	else //All other route (ie: Opera)
		target.onmousedown=function(){return false}

	target.style.cursor = "default"
}




//AJAX
if( typeof XMLHttpRequest == "undefined"){
	XMLHttpRequest = function(){
		return new ActiveXObject(navigator.userAgent.indexOf("MSIE 5") >= 0 ? "Microsoft.XMLHTTP" : "Msxml2.XMLHTTP");
	};
}
function ajax(options){
	options = {
		type: options.type || "POST",
		url: options.url || "",
		timeout: options.timeout || 5000,
		onComplete: options.onComplete || function(){},
		onError: options.onError || function(){},
		onSuccess: options.onSuccess || function(){},
		data: options.data || ""
	};
	
	var xml = new XMLHttpRequest();
	xml.open(options.type, options.url, true);
	var timeoutLength = options.timeout;
	var requestDone = false;
	setTimeout(function(){
		requestDone = true;
	}, timeoutLength);
	xml.onreadystatechange = function(){
		if( xml.readyState == 4 && !requestDone ){
			if( httpSuccess(xml) ) {
				options.onSuccess(httpData( xml, options.type));	
			} else {
				options.onError();
			}
			options.onComplete();
			xml = null;
		}
	};
	xml.send();
	function httpSuccess(r) {
		try {
			var test1 = !r.status && (location.protocol.indexOf("file") == 0);
			var test2 = (r.status >= 200 && r.status < 300);
			var test3 = r.status == 304;
			var test4 = navigator.userAgent.indexOf("Safari") >= 0 && typeof r.status == "undefined";
			//var test5 = navigator.userAgent.indexOf("Safari") >= 0 && r.status == 0;
			//var test6 = navigator.userAgent.indexOf("Firefox") >= 0 && r.status == 0;
			
			return test1 || test2 || test3 || test4;// || test5 || test6;
			
			//return !r.status && location.protocol == "file" || (r.status >= 200 && r.status < 300) || r.status == 304 || navigator.userAgent.indexOf("Safari") >= 0 && typeof r.status == "undefined" || navigator.userAgent.indexOf("Safari") >= 0 && typeof r.status == 0;
		}catch(e){}
		return false;
	}
	
	function httpData(r,type){
		var ct = r.getResponseHeader("content-type");
		var data = !type && ct && ct.indexOf("xml") >= 0;
		data = type == "xml" || data ? r.responseXML : r.responseText;
		if( type == "script" ){
			eval.call(window, data);
		}
		return data;
	}
}


Function.prototype.method = function(name,func){
	this.prototype[name] = func;
	return this;
};

Function.method('inherits', function (parent) {
    var d = {}, p = (this.prototype = new parent());
    this.method('uber', function uber(name) {
        if (!(name in d)) {
            d[name] = 0;
        }        
        var f, r, t = d[name], v = parent.prototype;
        if (t) {
            while (t) {
                v = v.constructor.prototype;
                t -= 1;
            }
            f = v[name];
        } else {
            f = p[name];
            if (f == this[name]) {
                f = v[name];
            }
        }
        d[name] += 1;
        r = f.apply(this, Array.prototype.slice.apply(arguments, [1]));
        d[name] -= 1;
        return r;
    });
    return this;
});

Function.method('swiss',function(parent) {
	for(var i=1; i< arguments.length; i+=1){
		var name = arguments[i];
		this.prototype[name] = parent.prototype[name];
	}
	return this;
});

// Allows for binding context to functions
// when using in event listeners and timeouts

Function.prototype.context = function(obj){
  var method = this,
  temp = function(){
    return method.apply(obj, arguments);
  };
  return temp;
};



// Like context, in that it creates a closure
// But insteaad keep "this" intact, and passes the var as the second argument of the function
// Need for event listeners where you need to know what called the event
// Only use with event callbacks

Function.prototype.evtContext = function(obj){
  var method = this,
  temp = function(){
    var origContext = this;
    return method.call(obj, arguments[0], origContext);
  };
  return temp;
};



// Removeable Event listener with Context
// Replaces the original function with a version that has context
// So it can be removed using the original function name.
// In order to work, a version of the function must already exist in the player/prototype

Function.prototype.rEvtContext = function(obj, funcParent){
  if (this.hasContext === true) { return this; }
  if (!funcParent) { funcParent = obj; }
  for (var attrname in funcParent) {
    if (funcParent[attrname] == this) {
      funcParent[attrname] = this.evtContext(obj);
      funcParent[attrname].hasContext = true;
      return funcParent[attrname];
    }
  }
  return this.evtContext(obj);
};

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
		  window.webkitRequestAnimationFrame || 
		  window.mozRequestAnimationFrame    || 
		  window.oRequestAnimationFrame      || 
		  window.msRequestAnimationFrame     || 
		  function(/* function */ callback, /* DOMElement */ element){
			window.setTimeout(callback, 1000 / 60);
		  };
})();


//end of helpers.js
//_____________________________________________________________________________________________________________________________________________________________________________________________________________________________