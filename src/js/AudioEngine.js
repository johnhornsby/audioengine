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

