/* Loads libraries required by the application using fallback */
let scripts= document.getElementsByTagName('script');
let path= scripts[scripts.length-1].src.split('?')[0];
let mydir= path.split('/').slice(0, -1).join('/')+'/';

fallback.load({
    Vue: [
        'https://cdn.jsdelivr.net/npm/vue/dist/vue.js',
        mydir+'../lib/Vue/vue.min.js'
    ],
    JZZ: [
        'https://cdn.jsdelivr.net/npm/jzz@0.8.8/javascript/JZZ.min.js',
        mydir+'../lib/JZZ/jzz.js'
    ],
    'JZZ.synth.Tiny': [
        'https://cdn.jsdelivr.net/npm/jzz-synth-tiny',
        mydir+'../lib/JZZ/JZZ.synth.Tiny.min.js'
    ],
    'JZZ.MIDI.SMF': [
        'https://cdn.jsdelivr.net/npm/jzz-midi-smf',
        mydir+'../lib/JZZ/jzz-midi-smf.js'
    ],
    TweenLite: [
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/1.18.0/TweenLite.min.js',
        mydir+'../lib/GSAP'
    ],
    'Tonnetz_utils':[
        mydir+'utils.js'
    ],
    'Tonnetz_l12n':[
        mydir+'l12n.js'
    ],
    'Tonnetz_mixins':[
        mydir+'mixins/clickMixins.js'
    ],
    'Tonnetz_trajectory':[
        mydir+'mixins/trajectory.js'
    ],
    'Tonnetz_dragZoom':[
        mydir+'decorators/dragZoom.js'
    ],
    'Tonnetz_guitar':[
        mydir+'components/guitarFretboard.js'
    ],
    'Tonnetz_loader':[
        mydir+'components/songLoader.js'
    ],
    'Tonnetz_tonnetzLike':[
        mydir+'components/tonnetzLike.js'
    ],
    'Tonnetz_clockOctave':[
        mydir+'components/clockOctave.js'
    ],
    'Tonnetz_playRecorder':[
        mydir+'components/playRecorder.js'
    ],
    'Tonnetz_midiBus':[
        mydir+'midiBus.js'
    ],
    'Tonnetz_tonnetzView':[
        mydir+'components/tonnetzView.js'
    ],
    'Tonnetz_intervalTable':[
        mydir+'components/intervalTable.js'
    ]
},{
    shim:{
        'JZZ.synth.Tiny': ['JZZ'],
        'JZZ.MIDI.SMF': ['JZZ'],
        'Tonnetz_guitar': ['Tonnetz_mixins'],
        'Tonnetz_tonnetzLike': ['Tonnetz_mixins'],
        'Tonnetz_clockOctave': ['Tonnetz_mixins'],
        'Tonnetz_playRecorder': ['Tonnetz_midiBus', 'Tonnetz_loader','Tonnetz_utils'],
        'Tonnetz_midiBus': ['Vue','JZZ'],
        'Tonnetz_tonnetzView': ['Tonnetz_tonnetzLike']
    }
}
)
