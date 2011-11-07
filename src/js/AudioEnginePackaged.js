
window.App = window.App || {};

App.AudioEngine = function(o){

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
	
	var AudioPreloadItem = function(label,mp3,ogv){
		this.label = label;
		this.mp3 = mp3;
		this.ogv = ogv;
	};
	
	var AudioInstanceItem = function(){
		this.element = undefined;
		this.id = -1;
		this.isPlaying = false;
		this.label = "";
		this.shouldAutoDestory = true;
		this.shouldAutoRewind = false;
		this.shouldAutoStop = true;
		this.src = "";
		this.volume = 1.0;
	};
	
	
	var AudioEngine = function(options){
		
		this._contianer = options.element;
		this._swf = options.swf;
		this._namespace = options.namespace;
		this._preloadList = options.preloadList;
		this._onPreloadComplete = options.onPreloadComplete;
		
		this._isFlashFallBack = false;
		this._isFlashReady = false;
		this._isJavaScriptReady = false;
		this._flashElement = undefined;
		this._flashReadyInterval = undefined;
		this._audioFormat = "mp3";
		
		this._preloadContainer;
		this._instanceContainer;
		this._preloadIncrement = 0;
		this._preloadsObject = {};
		this._instancesArray = [];
		this._instanceIncrement = 0;
		this._volume = 1;
		this._isToggleVolumeOn = true;
		this._savedPreToggleVolume = 1;
		
		this._init();
	};
	
	
	
	
	
	
	//PRIVATE
	//_______________________________________________________________________________________________
	/**
	* Called from constructor to get things started
	*@private
	*/
	AudioEngine.prototype._init = function(){
		this._checkAudioSupport();			//check if we need flash fallback
		//this._isFlashFallBack = true;		//TEMP FLASH TESTING
		this._build();
	};
	
	/**
	* Checks whether browser can support ogv then mp3 format, if not then fallback to Flash. Method sets _isFlashFallBack and _audioFormat
	*@private
	*/
	AudioEngine.prototype._checkAudioSupport = function(){
		this._audioFormat = "mp3";
		this._isFlashFallBack = false;
		var mp3Test;
		var oggTest;
		if(!!document.createElement('audio').canPlayType){
			var audioElement=document.createElement("audio");
			oggTest=audioElement.canPlayType('audio/ogg');
			if (oggTest !== "maybe" && oggTest !== "probably"){
				mp3Test=audioElement.canPlayType('audio/mpeg');
				if (mp3Test !== "maybe" && mp3Test !== "probably"){
					this._isFlashFallBack = true;
				}else{
					this._audioFormat = "mp3";
				}
			}else{
				this._audioFormat = "ogv";
			}
		}else{
			this._isFlashFallBack = true;
		}
	}; 
	
	/**
	*@private
	*/
	AudioEngine.prototype._build = function(){
		if(this._isFlashFallBack === false){
			//Build Preload
			this._preloadContainer = create("div");
			attr(this._preloadContainer,"id","audioEnginePreloadContainer");
			append(this._contianer,this._preloadContainer);
			this._instanceContainer = create("div");
			attr(this._instanceContainer,"id","audioEngineInstanceContainer");
			append(this._contianer,this._instanceContainer);
			this._onAllIsReady();
		}else{		
			var objectString = "";
			objectString += '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="300" height="300" id="audioEngineFlashPlayer">'
			objectString += '<param name="movie" value="'+this._swf+'">';
			objectString += '<param name="bgcolor" value="#333333">';
			objectString += '<param name="flashvars" value="namespace='+this._namespace+'">';
			objectString += '<embed src="'+this._swf+'" quality="high" FlashVars="namespace='+this._namespace+'" width="300" height="300" name="audioEngineFlashPlayer" allowScriptAccess="sameDomain" allowFullScreen="false" type="application/x-shockwave-flash" pluginspage="http://www.adobe.com/go/getflashplayer" />';
			objectString += '</object>';
			this._contianer.innerHTML = objectString;
			this._flashReadyInterval = setInterval(this._FInterface_checkFlashIsReady.context(this),100);
		}
	};
	
	AudioEngine.prototype._onAllIsReady = function(){
		//now preload 
		this._preload(this._preloadList);
	};
	
	/**
	*@private
	*/
	AudioEngine.prototype._preloadComplete = function(e){
		console.log('_preloadComplete ' + attr(e.currentTarget,"data-label") + ' timestamp:'+e.timeStamp);
		var label = attr(e.currentTarget,"data-label");
		this._preloadsObject[label].isPreloaded = true;
		this._preloadIncrement++;
		
		removeEvent(e.currentTarget,'canplaythrough',this._preloadComplete.rEvtContext(this));	//Firefox sometimes calls this event twice
		if(this._preloadIncrement === this._preloadList.length){
			//console.log("_preloadComplete");
			this._onPreloadComplete();
		}
	};
	
	/**
	*@private
	*/
	AudioEngine.prototype._createAudioInstance = function(object,autoDestroy,autoRewind,autoStop){
		//create dom element
		var element = create("audio");
		attr(element,"src",object[this._audioFormat]);
		attr(element,"data-label",object.label);
		attr(element,"data-instance",this._instanceIncrement);
		attr(element,"controls","controls");
		append(this._instanceContainer,element);
		addEvent(element,'ended',this._audioEnded.context(this));
		
		var audioInstanceItem = new AudioInstanceItem();
		audioInstanceItem.src = object[this._audioFormat];
		audioInstanceItem.label = object.label;
		audioInstanceItem.id = this._instanceIncrement;
		audioInstanceItem.element = element;
		audioInstanceItem.isPlaying = false;
		audioInstanceItem.shouldAutoDestroy = (autoDestroy!=undefined)?autoDestroy:true;
		audioInstanceItem.shouldAutoRewind = (autoRewind!=undefined)?autoRewind:false;
		audioInstanceItem.shouldAutoStop = (autoStop!=undefined)?autoStop:true;
		
		this._instancesArray.push(audioInstanceItem);
		this._instanceIncrement++;
		return audioInstanceItem.id;
	};
	
	/**
	*@private
	*/
	AudioEngine.prototype._audioEnded = function(e){
		console.log('_audioEnded ' + attr(e.currentTarget,"data-label") + " " + attr(e.currentTarget,"data-instance") );
		var l;
		var element,audioInstanceItem;
		for(var i = this._instancesArray.length-1; i>-1 ;i--){
			audioInstanceItem = this._instancesArray[i];
			if(audioInstanceItem.element === e.currentTarget){
				if(audioInstanceItem.shouldAutoDestroy === true){
					element = this._instancesArray.splice(i,1)[0].element;
					remove(element);
				}else{
					if(audioInstanceItem.shouldAutoRewind === true){
						audioInstanceItem.element.currentTime = 0;
						if(audioInstanceItem.shouldAutoStop === true){
							audioInstanceItem.isPlaying = false;
							audioInstanceItem.element.pause();
						}
					}
				}
				return;
			}
		}
	};
	
	/**
	*@private
	*/
	AudioEngine.prototype._getAudioInstances = function(label,id){
		var decrement = this._instancesArray.length;
		var audioInstanceItem;
		var results = [];
		while(decrement--){
			audioInstanceItem = this._instancesArray[decrement];
			if(id != undefined){
				if(audioInstanceItem.id === id){
					results.push(audioInstanceItem);
					break;
				}
			}else{
				if(audioInstanceItem.label === label){
					results.push(audioInstanceItem);
				}
			}
		}
		return results;
	};
	
	/**
	*@private
	*/
	AudioEngine.prototype._removeAudioInstance = function(audioInstanceItem){
		var index = this._instancesArray.indexOf(audioInstanceItem);
		var element;
		if(index != -1){
			this._instancesArray.splice(index,1);
			remove(audioInstanceItem.element);
		}
	};
	
	/**
	* Preload array of sound objects
	* @public
	*/
	AudioEngine.prototype._preload = function(a){
		if(this._isFlashFallBack === true){
			this._FInterface_preload(a);
		}else{
			var l;
			var label;
			var preloadObject;
			for(var i=0,l = a.length; i<l; i++){
				preloadObject = a[i];
				label = a[i].label;
				
				if(this._preloadsObject[label] == undefined){
					
					this._preloadsObject[label] = a[i];
					a[i].preloadElement = create("audio");
					a[i].isPreloaded = false;
					attr(a[i].preloadElement,"src",a[i][this._audioFormat]);
					attr(a[i].preloadElement,"data-label",a[i].label);
					attr(a[i].preloadElement,"controls","controls");
					append(this._preloadContainer,a[i].preloadElement);
					addEvent(a[i].preloadElement,'canplaythrough',this._preloadComplete.rEvtContext(this));
					
					
					if (navigator.appName.indexOf("Microsoft") == -1) {
						//Firefox 7.01 OSX seemed to abort loading of longer audio files, therefore not able to preload, 
						//however in IE 9 PC the audio preloads played but did not respond to pause.
						a[i].preloadElement.play();
						a[i].preloadElement.pause();
					}
					
				}
			}
		}
	};
	
	
	
	
	
	//Flash Fallback Interface
	//_________________________________________________________________________________________________
	AudioEngine.prototype._F2JS_messageToJavaScript = function(str){
		console.log(str);
	};
	AudioEngine.prototype._F2JS_isReady = function(){
		
		console.log("_F2JS_isReady");
		this._isJavaScriptReady = true;
		
		this._FInterface_checkBothAreReady();
		return true;
	};
	
	AudioEngine.prototype._F2JS_preloadComplete = function(){
		//console.log("_F2JS_preloadComplete");
		this._onPreloadComplete();
	};
	
	AudioEngine.prototype._FInterface_checkBothAreReady = function(){
		if(this._isJavaScriptReady === true && this._isFlashReady === true){
			this._onAllIsReady();
		}
	};
	
	AudioEngine.prototype._FInterface_checkFlashIsReady = function(){
		var result = false;
		try{
			if (navigator.appName.indexOf("Microsoft") != -1) {
				 this._flashElement = window["audioEngineFlashPlayer"];
			 } else {
				 this._flashElement = document.getElementsByName("audioEngineFlashPlayer")[0];
			 }
			result = this._flashElement._JS2F_isFlashReady();
		}catch(e){
			console.log("_FInterface_checkFlashIsReady Can't connect to Flash");	
		}
		if(result === true){
			clearInterval(this._flashReadyInterval);	
			this._isFlashReady = true;
			
			this._FInterface_checkBothAreReady();
		}
		console.log("_F2JS_checkFlashIsReady:"+this._isFlashReady);	
	};
	
	AudioEngine.prototype._FInterface_preload = function(preloadObjects){
		this._flashElement._JS2F_preload(preloadObjects);
	};
	
	AudioEngine.prototype._FInterface_create = function(label,autoDestroy,autoRewind,autoStop){
		if(autoDestroy == undefined)autoDestroy = true;
		if(autoRewind == undefined)autoStop = false;
		if(autoStop == undefined)autoDestroy = true;
		return this._flashElement._JS2F_create(label,autoDestroy,autoRewind,autoStop);
	};
	
	AudioEngine.prototype._FInterface_play = function(label,id){
		if(id === undefined) id = -1;
		this._flashElement._JS2F_play(label,id);
	};
	
	AudioEngine.prototype._FInterface_pause = function(label,id){
		if(id === undefined) id = -1;
		this._flashElement._JS2F_pause(label,id);
	};
	
	AudioEngine.prototype._FInterface_stop = function(label,id){
		if(id === undefined) id = -1;
		this._flashElement._JS2F_stop(label,id);
	};
	
	AudioEngine.prototype._FInterface_stopAll = function(){
		this._flashElement._JS2F_stopAll();
	};
	
	AudioEngine.prototype._FInterface_setVolume = function(volume){
		this._flashElement._JS2F_setVolume(volume);
	};
	//End of Flash Fallback Interface
	//_________________________________________________________________________________________________
	
	
	
	
	
	
	
	
	
	
	//PUBLIC
	//_______________________________________________________________________________________________
	
	/**
	* Create sound and return instance id
	* @public 
	*/
	AudioEngine.prototype.create = function(label,autoDestroy,autoRewind,autoStop){
		var playInstanceID = -1;
		if(this._isFlashFallBack === true){
			playInstanceID = this._FInterface_create(label,autoDestroy,autoRewind,autoStop);
		}else{
			var preloadedObject = this._preloadsObject[label];
			
			if(preloadedObject != undefined){
				if(preloadedObject.isPreloaded == true){
					playInstanceID = this._createAudioInstance(preloadedObject,autoDestroy,autoRewind,autoStop);
				}else{
					console.log("AudioEngine play() Warning "+label+" has not finished preloading");
				}
			}else{
				console.log("AudioEngine play() Error "+label+" has not started preloading");
			}
		}
		return playInstanceID;
	};
	
	/**
	* Play sound by label or id
	* @public 
	*/
	AudioEngine.prototype.play = function(label,id){
		if(this._isFlashFallBack === true){
			this._FInterface_play(label,id);
		}else{
			var audioInstances = this._getAudioInstances(label,id);
			var decrement = audioInstances.length;
			var audioInstanceItem;
			while(decrement--){
				audioInstanceItem = audioInstances[decrement];
				if(audioInstanceItem.isPlaying === false){
					audioInstanceItem.element.play();
					audioInstanceItem.element.volume = audioInstanceItem.volume * this._volume;
					audioInstanceItem.isPlaying = true;
				}
			}
		}
	};
	
	/**
	* Pause sound by label or id
	* @public 
	*/
	AudioEngine.prototype.pause = function(label,id){
		if(this._isFlashFallBack === true){
			this._FInterface_pause(label,id);
		}else{
			var audioInstances = this._getAudioInstances(label,id);
			var decrement = audioInstances.length;
			var audioInstanceItem;
			while(decrement--){
				audioInstanceItem = audioInstances[decrement];
				if(audioInstanceItem.isPlaying === true){
					audioInstanceItem.element.pause();
					audioInstanceItem.isPlaying = false;
				}
			}
		}
	}
	
	/**
	* Stop sound by label or id
	* @public 
	*/
	AudioEngine.prototype.stop = function(label,id){
		if(this._isFlashFallBack === true){
			this._FInterface_stop(label,id);
		}else{
			var audioInstances = this._getAudioInstances(label,id);
			var decrement = audioInstances.length;
			var audioInstanceItem;
			while(decrement--){
				audioInstanceItem = audioInstances[decrement];
				if(audioInstanceItem.isPlaying === true){
					audioInstanceItem.element.pause();
					audioInstanceItem.isPlaying = false;
				}
				this._removeAudioInstance(audioInstanceItem);
			}
		}
	}
	
	/**
	* Stop all sounds
	* @public 
	*/
	AudioEngine.prototype.stopAll = function(){
		if(this._isFlashFallBack === true){
			this._FInterface_stopAll();
		}else{
			var decrement = this._instancesArray.length;
			var audioInstanceItem;
			while(decrement--){
				audioInstanceItem = this._instancesArray[decrement];
				if(audioInstanceItem.isPlaying === true){
					audioInstanceItem.element.pause();
					audioInstanceItem.isPlaying = false;
				}
				this._removeAudioInstance(audioInstanceItem);
			}
		}
	}
	
	/**
	* Set global volume
	* @public 
	*/
	AudioEngine.prototype.setVolume = function(volume){
		if(this._isFlashFallBack === true){
			this._FInterface_setVolume(volume);
		}else{
			var decrement = this._instancesArray.length;
			var audioInstanceItem;
			this._volume = volume;
			while(decrement--){
				audioInstanceItem = this._instancesArray[decrement];
				if(audioInstanceItem.isPlaying === true){
					audioInstanceItem.element.volume = audioInstanceItem.volume * this._volume;
				}
			}
		}
	}

	/**
	* Toggle volume
	* @public 
	*/
	AudioEngine.prototype.toggleVolume = function(){
		if(this._isToggleVolumeOn === true){
			this._savedPreToggleVolume = this._volume;
			this.setVolume(0)
			this._isToggleVolumeOn = false;
		}else{
			this.setVolume(this._savedPreToggleVolume);
			this._isToggleVolumeOn = true;
		}
		return this._isToggleVolumeOn;
	}

	return new AudioEngine(o);
};
