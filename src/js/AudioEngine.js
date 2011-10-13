var AudioEngine = function(options){
	
	this._contianer = options.element;
	this._isFlashFallBack = false;
	this._audioFormat = "mp3";
	
	this._preloadContainer;
	this._instanceContainer;
	this._preloadsObject = {};
	this._instancesArray = [];
	this._instanceIncrement = 0;
	
	this._init();
};






//PRIVATE
//_______________________________________________________________________________________________
/**
*@private
*/
AudioEngine.prototype._init = function(){
	//check if we need flash fallback
	this._checkAudioSupport();
	this._build();
};


AudioEngine.prototype._checkAudioSupport = function(){
	this._audioFormat = "mp3";
	this._isFlashFallBack = false;
	var mp3Test;
	var oggTest;
	if(!!document.createElement('audio').canPlayType){
		var audioElement=document.createElement("audio");
		oggTest=audioElement.canPlayType('video/ogg; codecs="theora, vorbis"');
		if (oggTest !== "probably"){
			mp3Test=audioElement.canPlayType('video/mpeg: codecs="avc1.42E01E, mp4a.40.2"');
			if (mp3Test !== "probably"){
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
} 

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
	}
};

/**
*@private
*/
AudioEngine.prototype._preloadComplete = function(e){
	console.log('_preloadComplete ' + attr(e.currentTarget,"data-label"));
	var label = attr(e.currentTarget,"data-label");
	this._preloadsObject[label].isPreloaded = true;
};

/**
*@private
*/
AudioEngine.prototype._createAudioInstance = function(object){
	//create dom element
	var element = create("audio");
	attr(element,"src",object[this._audioFormat]);
	attr(element,"data-label",object.label);
	attr(element,"data-instance",this._instanceIncrement);
	append(this._instanceContainer,element);
	addEvent(element,'ended',this._audioEnded.context(this));
	
	var instanceObject = {};
	instanceObject.src = object[this._audioFormat];
	instanceObject.label = object.label;
	instanceObject.id = this._instanceIncrement;
	instanceObject.element = element;
	instanceObject.isPlaying = true;
	
	this._instancesArray.push(instanceObject);
	this._instanceIncrement++;
	element.play();
	return instanceObject.id;
};

/**
*@private
*/
AudioEngine.prototype._audioEnded = function(e){
	console.log('_audioEnded ' + attr(e.currentTarget,"data-label") + " " + attr(e.currentTarget,"data-instance") );
	var l;
	var element;
	for(var i = this._instancesArray.length-1; i>-1 ;i--){
		if(this._instancesArray[i].element === e.currentTarget){
			element = this._instancesArray.splice(i,1)[0].element;
			remove(element);
			return;
		}
	}
};

AudioEngine.prototype._getAudioInstances = function(label,id){
	var decrement = this._instancesArray.length;
	var instanceObject;
	var results = [];
	while(decrement--){
		instanceObject = this._instancesArray[decrement];
		if(id != undefined){
			if(instanceObject.id === id){
				results.push(instanceObject);
				break;
			}
		}else{
			if(instanceObject.label === label){
				results.push(instanceObject);
			}
		}
	}
	return results;
};

AudioEngine.prototype._removeAudioInstance = function(instanceObject){
	var index = this._instancesArray.indexOf(instanceObject);
	var element;
	if(index != -1){
		this._instancesArray.splice(index,1);
		remove(instanceObject.element);
	}
}


//PUBLIC
//_______________________________________________________________________________________________

/**
* @public
*/
AudioEngine.prototype.preload = function(a){
	var l;
	var label;
	for(var i=0,l = a.length; i<l; i++){
		label = a[i].label;
		if(this._preloadsObject[label] == undefined){
			
			this._preloadsObject[label] = a[i];
			a[i].preloadElement = create("audio");
			a[i].isPreloaded = false;
			attr(a[i].preloadElement,"src",a[i][this._audioFormat]);
			attr(a[i].preloadElement,"data-label",a[i].label);
			append(this._preloadContainer,a[i].preloadElement);
			addEvent(a[i].preloadElement,'canplaythrough',this._preloadComplete.context(this));
			a[i].preloadElement.play()
			a[i].preloadElement.pause();
		}
	}
};

AudioEngine.prototype.play = function(label,id){
	var preloadedObject;
	var playInstanceID;
	var audioInstances;
	var instanceObject;
	if(id != undefined){
		audioInstances = this._getAudioInstances(label,id);
		if(audioInstances.length === 1){
			instanceObject = audioInstances[0];
			if(instanceObject.isPlaying === true){
				instanceObject.element.play();
				instanceObject.isPlaying = false;
			}
		}
	}else{
		preloadedObject = this._preloadsObject[label];
		playInstanceID = -1;
		if(preloadedObject != undefined){
			if(preloadedObject.isPreloaded == true){
				playInstanceID = this._createAudioInstance(preloadedObject);
			}else{
				console.log("AudioEngine play() Warning "+label+" has not finished preloading");
			}
		}else{
			console.log("AudioEngine play() Error "+label+" has not started preloading");
		}
	}
	return playInstanceID;
};

AudioEngine.prototype.pause = function(label,id){
	var audioInstances = this._getAudioInstances(label,id);
	var decrement = audioInstances.length;
	var instanceObject;
	while(decrement--){
		instanceObject = audioInstances[decrement];
		if(instanceObject.isPlaying === true){
			instanceObject.element.pause();
			instanceObject.isPlaying = false;
		}
	}
}

AudioEngine.prototype.stop = function(label,id){
	var audioInstances = this._getAudioInstances(label,id);
	var decrement = audioInstances.length;
	var instanceObject;
	while(decrement--){
		instanceObject = audioInstances[decrement];
		if(instanceObject.isPlaying === true){
			instanceObject.element.pause();
			instanceObject.isPlaying = false;
		}
		this._removeAudioInstance(instanceObject);
	}
}

AudioEngine.prototype.stopAll = function(){
	var decrement = this._instancesArray.length;
	var instanceObject;
	while(decrement--){
		instanceObject = this._instancesArray[decrement];
		if(instanceObject.isPlaying === true){
			instanceObject.element.pause();
			instanceObject.isPlaying = false;
		}
		this._removeAudioInstance(instanceObject);
	}
}