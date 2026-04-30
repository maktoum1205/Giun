// Main Vue application — Tonnetz with Guitar Fretboard

var proto;

var record = {
    startTime: undefined,
    SMF: undefined,
    recording: false
};

// Auto-reload after inactivity
var timeout = null;
function restartTimeout() {
    clearTimeout(timeout);
}
document.addEventListener('touchdown', restartTimeout);
document.addEventListener('mousemove', restartTimeout);

proto = new Vue({
    el: '#proto',
    components: {
        clockOctave: clockOctave,
        songLoader: songLoader,
        guitarFretboard: guitarFretboard,
        chordReference: chordReference,
        metronomePopup: metronomePopup,
        playRecorder: playRecorder,
        tonnetzView: tonnetzView,
        languageSelector: languageSelector,
        intervalTable: intervalTable
    },
    data: {
        tonnetze: tonnetze3,
        intervals: tonnetze3[9],
        type: 'tonnetz',
        notes: Array.from(Array(12), function(_x, index) { return { id: index, count: 0 }; }),
        synth: (function() { try { return JZZ.synth.Tiny(); } catch(e) { console.warn('JZZ.synth.Tiny unavailable:', e); return null; } })(),
        ascii: (function() { try { return JZZ.input.ASCII({ W: 'C5', S: 'C#5', X: 'D5', D: 'D#5', C: 'E5', V: 'F5', G: 'F#5', B: 'G5', H: 'Ab5', N: 'A5', J: 'Bb5', M: 'B5' }); } catch(e) { console.warn('JZZ.input.ASCII unavailable:', e); return null; } })(),
        trace: false,
        arpeggio: false,
        allStrings: strings,
        language: (function() {
            var s = location.search.match(/hl=(\w*)/);
            return (s && strings.hasOwnProperty(s[1])) ? s[1] : 'en';
        })()
    },
    computed: {
        complementNotes: function() {
            return this.notes.map(function(note) { return { id: note.id, count: note.count ? 0 : 1 }; });
        },
        strings: function() {
            return strings[this.language];
        }
    },
    created: function() {
        // MIDI device init deferred to initMIDI(), called on user action (e.g. loading a MIDI file)
    },
    methods: {
        initMIDI: function() {
            if (this._midiInitialized) return;
            this._midiInitialized = true;
            var self = this;
            setTimeout(function() { self.deviceUpdate({ inputs: { added: JZZ().info().inputs } }); }, 500);
            JZZ().onChange(this.deviceUpdate);
        },
        deviceUpdate: function(evt) {
            if (evt.inputs.added) {
                for (var i = 0; i < evt.inputs.added.length; i++) {
                    try {
                        JZZ().openMidiIn(evt.inputs.added[i].name)
                            .connect(midiBus.midiThru)
                            .connect(restartTimeout);
                    } catch (e) {}
                }
            }
            if (evt.inputs.removed) {
                for (var i = 0; i < evt.inputs.removed.length; i++) {
                    try {
                        JZZ().openMidiIn(evt.inputs.removed[i].name).disconnect(midiBus.midiThru);
                    } catch (e) {}
                }
            }
            this.resetNotes();
        },
        midiHandler: function(midiEvent) {
            var noteIndex = (midiEvent.getNote() + 3) % 12;
            if (midiEvent.isNoteOn()) {
                this.notes[noteIndex].count++;
            } else if (midiEvent.isNoteOff()) {
                if (this.notes[noteIndex].count > 0) {
                    this.notes[noteIndex].count--;
                }
            }
        },
        resetNotes: function() {
            for (var i = 0; i < this.notes.length; i++) {
                this.notes[i].count = 0;
            }
        },
        traceToggle: function() {
            this.trace = !this.trace;
        },
        noteOn: function(pitches) {
            var self = this;
            if (self.arpeggio && pitches.length > 1) {
                var delay = 0;
                for (var i = 0; i < pitches.length; i++) {
                    (function(p, d) {
                        setTimeout(function() {
                            midiBus.midiThru.noteOn(0, p, 100);
                        }, d);
                    })(pitches[i], delay);
                    delay += 120;
                }
            } else {
                for (var i = 0; i < pitches.length; i++) {
                    midiBus.midiThru.noteOn(0, pitches[i], 100);
                }
            }
        },
        noteOff: function(pitches) {
            for (var i = 0; i < pitches.length; i++) {
                midiBus.midiThru.noteOff(0, pitches[i], 100);
            }
        },
        reset: function(option) {
            if (option) {
                window.location.search = '?hl=' + option;
            } else {
                window.location.reload();
            }
        }
    },
    mounted: function() {
        midiBus.$on('note-on', this.noteOn);
        midiBus.$on('note-off', this.noteOff);
        if (this.ascii) { this.ascii.connect(midiBus.midiThru); }
        if (this.synth) { midiBus.midiThru.connect(this.synth); }
        midiBus.midiThru.connect(this.midiHandler);
    }
});
