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
Function.prototype.context = function(obj){
  var method = this,
  temp = function(){
    return method.apply(obj, arguments);
  };
  return temp;
};

var Animator = {
	_tweeningObjectsArray:[],
	_removeDecrement:0,
	_updateCurrentTime:0,
	_updateDecrement:0,
	_updateCurrentObject:{},
	_updatePropertyDecriment:0,
	_updatePropertyObject:{},
	_updateTimePercentage:0,
	_updateEasingPercentage:0,
	_updatePropertyString:"",
	_update:function(){
		this._updateDecrement = this._tweeningObjectsArray.length;
		while(this._updateDecrement--){
			this._updateCurrentObject = this._tweeningObjectsArray[this._updateDecrement];
			this._updateCurrentTime = (new Date() - 0);
			
			this._updateTimePercentage = (this._updateCurrentTime - this._updateCurrentObject.startTime) / (this._updateCurrentObject.endTime - this._updateCurrentObject.startTime);
			this._updateEasingPercentage = Animator.easingFunctions[this._updateCurrentObject.transition](this._updateCurrentTime - this._updateCurrentObject.startTime,0,1,this._updateCurrentObject.endTime - this._updateCurrentObject.startTime);
	
			if(this._updateTimePercentage < 1){
				for (this._updatePropertyString in this._updateCurrentObject.targetPropeties) {
					this._updateCurrentObject.rawTarget[this._updatePropertyString] = this._updateCurrentObject.targetPropeties[this._updatePropertyString].b + (this._updateEasingPercentage * this._updateCurrentObject.targetPropeties[this._updatePropertyString].c);
				}
				this._updateCurrentObject.onUpdate();
				
			}else{
				for (this._updatePropertyString in this._updateCurrentObject.targetPropeties) {
					this._updateCurrentObject.rawTarget[this._updatePropertyString] = this._updateCurrentObject.targetPropeties[this._updatePropertyString].b + this._updateCurrentObject.targetPropeties[this._updatePropertyString].c;
				}
				this._tweeningObjectsArray.splice(this._updateDecrement,1);
				this._updateCurrentObject.onUpdate();
				this._updateCurrentObject.onComplete();
			}
			
			
			if(this._tweeningObjectsArray.length > 0){
				window.requestAnimFrame(this._update.context(this));
			}
		}
	},
	defaultOptions:{
		time: 1,
		transition: 'easeOutExpo',
		onUpdate: undefined,
		onComplete: undefined,
		onRemove: undefined
	}
};

Animator.addTween = function(object,options){
	var o = {};
	o.rawTarget = object;
	o.targetPropeties = {};
	for (var key in this.defaultOptions) {
		if (options[key]) {
			o[key] = options[key];
			delete options[key];
		} else {
			o[key] = this.defaultOptions[key];
		}
	}
	for (var key in options) {
		var endValue = options[key];
		var startValue = object[key];
		o.targetPropeties[key] = {
			b: startValue,
			c: endValue - startValue
		};	
	}
	o.startTime = (new Date() - 0);
    o.endTime = o.time * 1000 + o.startTime;
	this._tweeningObjectsArray.push(o);
	if(this._tweeningObjectsArray.length === 1){
		window.requestAnimFrame(this._update.context(this));
	}
};

Animator.removeTween = function(object){
	var callback;
	this._removeDecrement = this._tweeningObjectsArray.length;
	while(this._removeDecrement--){
		if(this._tweeningObjectsArray[this._removeDecrement].rawTarget === object){
			callback = this._tweeningObjectsArray[this._removeDecrement].onRemove;
			this._tweeningObjectsArray.splice(this._removeDecrement,1);
			callback();
			return true;
		}
	}
	return false;
};

/**
 * Easing equation function for a simple linear tweening, with no easing.
 *
 * @param t		Current time (in frames or seconds).
 * @param b		Starting value.
 * @param c		Change needed in value.
 * @param d		Expected easing duration (in frames or seconds).
 * @return		The correct value.
 */
Animator.easingFunctions = {
    easeNone: function(t, b, c, d) {
        return c*t/d + b;
    },
    easeInQuad: function(t, b, c, d) {
        return c*(t/=d)*t + b;
    },
    easeOutQuad: function(t, b, c, d) {
        return -c *(t/=d)*(t-2) + b;
    },
    easeInOutQuad: function(t, b, c, d) {
        if((t/=d/2) < 1) return c/2*t*t + b;
        return -c/2 *((--t)*(t-2) - 1) + b;
    },
    easeInCubic: function(t, b, c, d) {
        return c*(t/=d)*t*t + b;
    },
    easeOutCubic: function(t, b, c, d) {
        return c*((t=t/d-1)*t*t + 1) + b;
    },
    easeInOutCubic: function(t, b, c, d) {
        if((t/=d/2) < 1) return c/2*t*t*t + b;
        return c/2*((t-=2)*t*t + 2) + b;
    },
    easeOutInCubic: function(t, b, c, d) {
        if(t < d/2) return Animator.easingFunctions.easeOutCubic(t*2, b, c/2, d);
        return Animator.easingFunctions.easeInCubic((t*2)-d, b+c/2, c/2, d);
    },
    easeInQuart: function(t, b, c, d) {
        return c*(t/=d)*t*t*t + b;
    },
    easeOutQuart: function(t, b, c, d) {
        return -c *((t=t/d-1)*t*t*t - 1) + b;
    },
    easeInOutQuart: function(t, b, c, d) {
        if((t/=d/2) < 1) return c/2*t*t*t*t + b;
        return -c/2 *((t-=2)*t*t*t - 2) + b;
    },
    easeOutInQuart: function(t, b, c, d) {
        if(t < d/2) return Animator.easingFunctions.easeOutQuart(t*2, b, c/2, d);
        return Animator.easingFunctions.easeInQuart((t*2)-d, b+c/2, c/2, d);
    },
    easeInQuint: function(t, b, c, d) {
        return c*(t/=d)*t*t*t*t + b;
    },
    easeOutQuint: function(t, b, c, d) {
        return c*((t=t/d-1)*t*t*t*t + 1) + b;
    },
    easeInOutQuint: function(t, b, c, d) {
        if((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
        return c/2*((t-=2)*t*t*t*t + 2) + b;
    },
    easeOutInQuint: function(t, b, c, d) {
        if(t < d/2) return Animator.easingFunctions.easeOutQuint(t*2, b, c/2, d);
        return Animator.easingFunctions.easeInQuint((t*2)-d, b+c/2, c/2, d);
    },
    easeInSine: function(t, b, c, d) {
        return -c * Math.cos(t/d *(Math.PI/2)) + c + b;
    },
    easeOutSine: function(t, b, c, d) {
        return c * Math.sin(t/d *(Math.PI/2)) + b;
    },
    easeInOutSine: function(t, b, c, d) {
        return -c/2 *(Math.cos(Math.PI*t/d) - 1) + b;
    },
    easeOutInSine: function(t, b, c, d) {
        if(t < d/2) return Animator.easingFunctions.easeOutSine(t*2, b, c/2, d);
        return Animator.easingFunctions.easeInSine((t*2)-d, b+c/2, c/2, d);
    },
    easeInExpo: function(t, b, c, d) {
        return(t==0) ? b : c * Math.pow(2, 10 *(t/d - 1)) + b - c * 0.001;
    },
    easeOutExpo: function(t, b, c, d) {
        return(t==d) ? b+c : c * 1.001 *(-Math.pow(2, -10 * t/d) + 1) + b;
    },
    easeInOutExpo: function(t, b, c, d) {
        if(t==0) return b;
        if(t==d) return b+c;
        if((t/=d/2) < 1) return c/2 * Math.pow(2, 10 *(t - 1)) + b - c * 0.0005;
        return c/2 * 1.0005 *(-Math.pow(2, -10 * --t) + 2) + b;
    },
    easeOutInExpo: function(t, b, c, d) {
        if(t < d/2) return Animator.easingFunctions.easeOutExpo(t*2, b, c/2, d);
        return Animator.easingFunctions.easeInExpo((t*2)-d, b+c/2, c/2, d);
    },
    easeInCirc: function(t, b, c, d) {
        return -c *(Math.sqrt(1 -(t/=d)*t) - 1) + b;
    },
    easeOutCirc: function(t, b, c, d) {
        return c * Math.sqrt(1 -(t=t/d-1)*t) + b;
    },
    easeInOutCirc: function(t, b, c, d) {
        if((t/=d/2) < 1) return -c/2 *(Math.sqrt(1 - t*t) - 1) + b;
        return c/2 *(Math.sqrt(1 -(t-=2)*t) + 1) + b;
    },
    easeOutInCirc: function(t, b, c, d) {
        if(t < d/2) return Animator.easingFunctions.easeOutCirc(t*2, b, c/2, d);
        return Animator.easingFunctions.easeInCirc((t*2)-d, b+c/2, c/2, d);
    },
    easeInElastic: function(t, b, c, d, a, p) {
        var s;
        if(t==0) return b;  if((t/=d)==1) return b+c;  if(!p) p=d*.3;
        if(!a || a < Math.abs(c)) { a=c; s=p/4; } else s = p/(2*Math.PI) * Math.asin(c/a);
        return -(a*Math.pow(2,10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p )) + b;
    },
    easeOutElastic: function(t, b, c, d, a, p) {
        var s;
        if(t==0) return b;  if((t/=d)==1) return b+c;  if(!p) p=d*.3;
        if(!a || a < Math.abs(c)) { a=c; s=p/4; } else s = p/(2*Math.PI) * Math.asin(c/a);
        return(a*Math.pow(2,-10*t) * Math.sin((t*d-s)*(2*Math.PI)/p ) + c + b);
    },
    easeInOutElastic: function(t, b, c, d, a, p) {
        var s;
        if(t==0) return b;  if((t/=d/2)==2) return b+c;  if(!p) p=d*(.3*1.5);
        if(!a || a < Math.abs(c)) { a=c; s=p/4; }       else s = p/(2*Math.PI) * Math.asin(c/a);
        if(t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p )) + b;
        return a*Math.pow(2,-10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p )*.5 + c + b;
    },
    easeOutInElastic: function(t, b, c, d, a, p) {
        if(t < d/2) return Animator.easingFunctions.easeOutElastic(t*2, b, c/2, d, a, p);
        return jTweener.easingFunctions.easeInElastic((t*2)-d, b+c/2, c/2, d, a, p);
    },
    easeInBack: function(t, b, c, d, s) {
        if(s == undefined) s = 1.70158;
        return c*(t/=d)*t*((s+1)*t - s) + b;
    },
    easeOutBack: function(t, b, c, d, s) {
        if(s == undefined) s = 1.70158;
        return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
    },
    easeInOutBack: function(t, b, c, d, s) {
        if(s == undefined) s = 1.70158;
        if((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
        return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
    },
    easeOutInBack: function(t, b, c, d, s) {
        if(t < d/2) return Animator.easingFunctions.easeOutBack(t*2, b, c/2, d, s);
        return Animator.easingFunctions.easeInBack((t*2)-d, b+c/2, c/2, d, s);
    },
    easeInBounce: function(t, b, c, d) {
        return c - Animator.easingFunctions.easeOutBounce(d-t, 0, c, d) + b;
    },
    easeOutBounce: function(t, b, c, d) {
        if((t/=d) <(1/2.75)) {
            return c*(7.5625*t*t) + b;
        } else if(t <(2/2.75)) {
            return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
        } else if(t <(2.5/2.75)) {
            return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
        } else {
            return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
        }
    },
    easeInOutBounce: function(t, b, c, d) {
        if(t < d/2) return Animator.easingFunctions.easeInBounce(t*2, 0, c, d) * .5 + b;
        else return Animator.easingFunctions.easeOutBounce(t*2-d, 0, c, d) * .5 + c*.5 + b;
    },
    easeOutInBounce: function(t, b, c, d) {
        if(t < d/2) return Animator.easingFunctions.easeOutBounce(t*2, b, c/2, d);
        return Animator.easingFunctions.easeInBounce((t*2)-d, b+c/2, c/2, d);
    }
};
Animator.easingFunctions.linear = Animator.easingFunctions.easeNone;

// JavaScript Document