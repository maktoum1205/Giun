// Chord Reference Table — Vertical chord diagrams with finger numbers

var noteNamesShort = ['A', 'A♯', 'B', 'C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯'];

var chordReference = {
  props: {
    notes: { type: Array, required: true },
    arpeggio: { type: Boolean, default: false }
  },
  data: function() {
    return {
      activeTab: 0,
      cardW: 100,
      cardH: 136,
      boxLeft: 20,
      boxRight: 92,
      boxTop: 12,
      strSpc: 14.4,
      fretSpc: 17,
      dotR: 6,
      activePitches: null,
    };
  },
  computed: {
    boxWidth: function() { return this.boxRight - this.boxLeft; },
    rootOrder: function() {
      return [0,1,2,3,4,5,6,7,8,9,10,11];
    },
    currentChords: function() {
      var root = this.activeTab;
      var result = [];
      var voicings = allChordVoicings[root];
      if (!voicings) return result;
      for (var t = 0; t < chordTypeDefs.length; t++) {
        var ct = chordTypeDefs[t];
        var vd = voicings[ct.id];
        if (!vd) continue;
        result.push({
          rootId: root,
          rootName: noteNamesShort[root],
          fullName: noteNamesShort[root] + ct.name,
          frets: vd.frets,
          fingers: vd.fingers,
          baseFret: vd.baseFret,
          rootStr: vd.rootStr,
          intervals: vd.intervals,
          isSlash: false,
          bassNote: -1
        });
      }
      for (var s = 0; s < slashChordDefs.length; s++) {
        var sc = slashChordDefs[s];
        var bassId = mod(root + sc.bassInterval, 12);
        var svd = voicings[sc.id];
        if (!svd) continue;
        var bassName = this.getNoteName(bassId);
        result.push({
          rootId: root,
          rootName: noteNamesShort[root],
          fullName: noteNamesShort[root] + '/' + bassName,
          frets: svd.frets,
          fingers: svd.fingers,
          baseFret: svd.baseFret,
          rootStr: svd.rootStr,
          intervals: [0,4,7],
          isSlash: true,
          bassNote: bassId
        });
      }
      return result;
    },
    displayNotes: function() {
      return this.$root.strings ? this.$root.strings.notes : noteNamesShort;
    }
  },
  methods: {
    getNoteName: function(nid) {
      return this.displayNotes[nid] || noteNamesShort[nid];
    },
    selectTab: function(nid) {
      this.clearHighlight();
      this.activeTab = nid;
    },
    strX: function(i) {
      return this.boxLeft + i * (this.boxWidth / 5);
    },
    fretLineY: function(j) {
      return this.boxTop + j * this.fretSpc;
    },
    fretDotY: function(f, baseFret) {
      var effBase = (baseFret === 0) ? 1 : baseFret;
      var row = f - effBase;
      if (row < 0) row = 0;
      return this.boxTop + (row + 0.5) * this.fretSpc;
    },
    visibleFrets: function(chord) {
      var maxF = 0;
      for (var i = 0; i < 6; i++) {
        if (chord.frets[i] > maxF) maxF = chord.frets[i];
      }
      if (chord.baseFret === 0) return Math.max(4, maxF + 1);
      return Math.max(5, maxF - chord.baseFret + 2);
    },
    boxHeight: function(chord) {
      return this.visibleFrets(chord) * this.fretSpc;
    },
    chordPitches: function(chord) {
      var pitches = [];
      for (var i = 0; i < 6; i++) {
        if (chord.frets[i] >= 0) {
          var hi = 5 - i;
          pitches.push(chordTuning[hi].midiBase + chord.frets[i]);
        }
      }
      return pitches;
    },
    playChord: function(chord) {
      this.clearHighlight();
      var pitches = this.chordPitches(chord);
      if (pitches.length > 0) {
        if (this.arpeggio && pitches.length > 1) {
          var self = this;
          var delay = 0;
          for (var i = 0; i < pitches.length; i++) {
            (function(p) {
              setTimeout(function() {
                midiBus.midiThru.noteOn(0, p, 100);
              }, delay);
            })(pitches[i]);
            delay += 120;
          }
        } else {
          for (var i = 0; i < pitches.length; i++) {
            midiBus.midiThru.noteOn(0, pitches[i], 100);
          }
        }
        this.activePitches = pitches;
      }
    },
    clearHighlight: function() {
      if (this.activePitches) {
        for (var i = 0; i < this.activePitches.length; i++) {
          midiBus.midiThru.noteOff(0, this.activePitches[i], 100);
        }
        this.activePitches = null;
      }
    },
  },
  mounted: function() {
    var self = this;
    this._docClick = function() { self.clearHighlight(); };
    document.addEventListener('click', this._docClick);
  },
  beforeDestroy: function() {
    document.removeEventListener('click', this._docClick);
  },
  template: `
    <div class="chord-ref-container">
      <div class="chord-tabs">
        <button v-for="nid in rootOrder" :key="'tab-'+nid"
          class="chord-tab-btn"
          :class="{ active: activeTab === nid }"
          :data-key="nid"
          @click="selectTab(nid)">
          {{ displayNotes[nid] }}
        </button>
      </div>

      <div class="chord-grid">
        <div v-for="chord in currentChords" :key="chord.fullName"
          class="chord-card" @click.stop="playChord(chord)">

          <div class="chord-card-name">{{ chord.fullName }}</div>

          <svg class="chord-mini-svg"
            :viewBox="'0 0 ' + cardW + ' ' + cardH"
            xmlns="http://www.w3.org/2000/svg">

            <rect :x="boxLeft" :y="boxTop"
              :width="boxWidth" :height="boxHeight(chord)"
              fill="none" stroke="#000" stroke-width="1.5" rx="2"/>

            <!-- String lines (vertical) -->
            <line v-for="si in 6" :key="'s-'+si"
              :x1="strX(si - 1)" :y1="boxTop"
              :x2="strX(si - 1)" :y2="boxTop + boxHeight(chord)"
              stroke="#000" stroke-width="0.8"/>

            <!-- Fret lines (horizontal) -->
            <line v-for="fj in (visibleFrets(chord) + 1)" :key="'f-'+fj"
              :x1="boxLeft" :y1="fretLineY(fj - 1)"
              :x2="boxRight" :y2="fretLineY(fj - 1)"
              stroke="#000"
              :stroke-width="fj === 1 && chord.baseFret === 0 ? 2.8 : 0.8"/>

            <!-- Fret number label -->
            <text v-if="chord.baseFret > 0"
              :x="4" :y="fretLineY(0) + fretSpc * 0.5"
              text-anchor="start" dominant-baseline="central"
              font-size="9" fill="#000" font-weight="700">
              {{ chord.baseFret }}fr
            </text>

            <!-- Top indicators: X (muted), R (root) -->
            <g v-for="si in 6" :key="'top-'+si">
              <g v-if="chord.frets[si-1] === -1"
                :transform="'translate(' + strX(si-1) + ',' + (boxTop - 7) + ')'">
                <line x1="-3.5" y1="-3.5" x2="3.5" y2="3.5" stroke="#000" stroke-width="1.3"/>
                <line x1="3.5" y1="-3.5" x2="-3.5" y2="3.5" stroke="#000" stroke-width="1.3"/>
              </g>
              <text v-if="chord.rootStr === si-1 && chord.frets[si-1] !== -1"
                :x="strX(si-1)" :y="boxTop - 7"
                text-anchor="middle" dominant-baseline="central"
                font-size="9" font-weight="700" fill="#000">R</text>
            </g>

            <!-- Finger dots -->
            <g v-for="si in 6" :key="'dot-'+si">
              <g v-if="chord.frets[si-1] > 0">
                <circle :cx="strX(si-1)"
                  :cy="fretDotY(chord.frets[si-1], chord.baseFret)"
                  :r="dotR" fill="#000" stroke="#000" stroke-width="0.8"/>
                <text v-if="chord.fingers[si-1]"
                  :x="strX(si-1)" :y="fretDotY(chord.frets[si-1], chord.baseFret)"
                  text-anchor="middle" dominant-baseline="central"
                  font-size="7.5" font-weight="700" fill="white">
                  {{ chord.fingers[si-1] }}
                </text>
              </g>
            </g>

          </svg>
        </div>
      </div>
    </div>
  `
};
