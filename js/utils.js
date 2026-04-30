// ============================================================================
// Misc utility functions

function bound(value,mini,maxi){
    return Math.min(maxi,Math.max(mini,value));
}

function mod(value,period){
    return ((value%period)+period)%period
}

function* range (begin, end, interval = 1) {
    for (let i = begin; i < end; i += interval) {
        yield i;
    }
}

function gcd(a, b) {
    if ( ! b) {
        return a;
    }
    return gcd(b, a % b);
};

function memo(func){
    var cache = {};
      return function(){
        var key = JSON.stringify(arguments);
        if (cache[key]){
          return cache[key];
        }
        else{
          val = func.apply(null, arguments);
          cache[key] = val;
          return val;
        }
    }
  }

function isSubset(a, b){
    return a.every(val => b.includes(val));
}

function isMidiPitch(pitch){
    return (pitch >= 0 && pitch < 128) || (JZZ.MIDI.noteValue(pitch) !== undefined);
}

const noop = function(){};

const average = arr => arr.reduce((a,b) => a + b, 0) / arr.length;

function arrayEquals(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;

    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
}

var Tonnetz_utils = true;
