// Guitar Fretboard Component with Scale Reference
// Standard tuning: E2 A2 D3 G3 B3 E4

var noteLabels = ['R', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];

var scalePatterns = {
    major:             { name: 'Major',        intervals: [0,2,4,5,7,9,11] },
    natural_minor:     { name: 'Minor',        intervals: [0,2,3,5,7,8,10] },
    harmonic_minor:    { name: 'Har.Min',      intervals: [0,2,3,5,7,8,11] },
    major_pentatonic:  { name: 'M.Pent',       intervals: [0,2,4,7,9] },
    minor_pentatonic:  { name: 'm.Pent',       intervals: [0,3,5,7,10] },
    blues:             { name: 'Blues',        intervals: [0,3,5,6,7,10] },
    dorian:            { name: 'Dorian',       intervals: [0,2,3,5,7,9,10] },
    phrygian:          { name: 'Phrygian',     intervals: [0,1,3,5,7,8,10] },
    lydian:            { name: 'Lydian',       intervals: [0,2,4,6,7,9,11] },
    mixolydian:        { name: 'Mixolydian',   intervals: [0,2,4,5,7,9,10] },
    locrian:           { name: 'Locrian',      intervals: [0,1,3,5,6,8,10] },
    phrygian_dominant: { name: 'Phry.Dom',     intervals: [0,1,4,5,7,8,10] },
    lydian_dominant:   { name: 'Lyd.Dom',      intervals: [0,2,4,6,7,9,10] },
    bebop_dominant:    { name: 'Bebop Dom',    intervals: [0,2,4,5,7,9,10,11] },
    whole_tone:             { name: 'Whole Tone',   intervals: [0,2,4,6,8,10] },
    diminished:             { name: 'Diminished',   intervals: [0,1,3,4,6,7,9,10] },
    japanese_pentatonic:    { name: 'J.Pent',       intervals: [0,2,3,7,9] },
    double_harmonic_major:  { name: 'D.Harm.Maj',   intervals: [0,1,4,5,7,8,11] },
};

var scaleList = [
    { id: 'major', name: 'Major/大调 (Ionian)' },
    { id: 'major_pentatonic', name: 'M.Pent/大五声' },
    { id: 'natural_minor', name: 'Minor/小调 (Aeolian)' },
    { id: 'harmonic_minor', name: 'Har.Min/和声小调' },
    { id: 'minor_pentatonic', name: 'm.Pent/小五声' },
    { id: 'blues', name: 'Blues/布鲁斯' },
    { id: 'dorian', name: 'Dorian/多利亚' },
    { id: 'phrygian', name: 'Phrygian/弗里几亚' },
    { id: 'lydian', name: 'Lydian/利底亚 (Major #4)' },
    { id: 'mixolydian', name: 'Mixolyd/混合利底亚 (Dominant)' },
    { id: 'phrygian_dominant', name: 'Phry.Dom/属弗里几亚 (Spanish)' },
    { id: 'lydian_dominant', name: 'Lyd.Dom/利底亚属音阶 (#4,b7)' },
    { id: 'bebop_dominant', name: 'Bebop Dom/比波普属音阶 (Jazz)' },
    { id: 'whole_tone', name: 'Whole Tone/全音阶' },
    { id: 'locrian', name: 'Locrian/洛克利亚' },
    { id: 'diminished', name: 'Diminished/减音阶 (Half-Whole)' },
    { id: 'japanese_pentatonic', name: 'J.Pent/日本阳五声 (Sakura)' },
    { id: 'double_harmonic_major', name: 'D.Harm.Maj/阿拉伯拜占庭' },
];

var guitarFretboard = {
    components: {
        clickToPlayWrapper
    },
    props: {
        notes: {
            type: Array,
            required: true
        },
        arpeggio: {
            type: Boolean,
            default: false
        }
    },
    data: function() {
        return {
            stringsData: [
                { label: 'e', midiBase: 64 },
                { label: 'B', midiBase: 59 },
                { label: 'G', midiBase: 55 },
                { label: 'D', midiBase: 50 },
                { label: 'A', midiBase: 45 },
                { label: 'E', midiBase: 40 },
            ],
            fretCount: 18,
            stringSpacing: 30,
            scaleLength: 1461,
            marginLeft: 38,
            marginTop: 28,
            marginRight: 28,
            nutWidth: 6,
            scaleRoot: -1,
            scaleType: 'major',
            showIntervals: false,
            fretZoom: 1.0,
            markerBottomGap: 30,
            rootMenuOpen: false,
            dropTop: '0px',
            dropLeft: '0px',
            dropMinWidth: '140px',
            quickScales: [
                { id: 'major', label: 'Major / 大调' },
                { id: 'natural_minor', label: 'Minor / 小调' },
                { id: 'dorian', label: 'Dorian / 多利亚' },
                { id: 'major_pentatonic', label: 'Pentatonic / 五声' },
                { id: 'blues', label: 'Blues / 布鲁斯' },
                { id: 'harmonic_minor', label: 'Har.Minor / 和声小调' },
                { id: 'diminished', label: 'Diminished / 减音阶' },
                { id: 'japanese_pentatonic', label: 'J.Pent / 日本五声' },
                { id: 'double_harmonic_major', label: 'Arabic / 阿拉伯' },
            ],
            soundSource: 'piano',
            soundOptions: [
                { id: 'guitar_clean', label: 'Elec.Gt / 电吉他清音', program: 27 },
                { id: 'guitar_acoustic', label: 'Ac.Gt / 原生吉他', program: 24 },
                { id: 'piano', label: 'Piano / 钢琴', program: 0 },
            ],
        }
    },
    computed: {
        strings: function() {
            return this.$root.strings;
        },
        nutX: function() {
            return this.marginLeft + 16;
        },
        fretboardWidth: function() {
            return this.nutX + this.fretX(this.fretCount) + this.marginRight;
        },
        fretboardHeight: function() {
            return this.marginTop * 2 + (this.stringsData.length - 1) * this.stringSpacing + this.markerBottomGap;
        },
        viewbox: function() {
            return '0 0 ' + this.fretboardWidth + ' ' + this.fretboardHeight;
        },
        positions: function() {
            var result = [];
            for (var s = 0; s < this.stringsData.length; s++) {
                for (var f = 0; f <= this.fretCount; f++) {
                    var midi = this.stringsData[s].midiBase + f;
                    var noteId = mod(midi + 3, 12);
                    var x = (f === 0)
                        ? this.nutX
                        : this.nutX + (this.fretX(f - 1) + this.fretX(f)) / 2;
                    var y = this.marginTop + s * this.stringSpacing;
                    var isScaleNote = this.scaleRoot >= 0 && !!this.scaleNoteSet[noteId];
                    result.push({
                        string: s,
                        fret: f,
                        midiPitch: midi,
                        noteId: noteId,
                        x: x,
                        y: y,
                        isActive: this.notes[noteId].count > 0,
                        isScaleNote: isScaleNote,
                        key: 'f' + f + 's' + s
                    });
                }
            }
            return result;
        },
        fretMarkers: function() {
            var markers = [];
            var markerFrets = [3, 5, 7, 9, 12, 15, 17];
            var y = this.marginTop + (this.stringsData.length - 1) * this.stringSpacing + 24;
            for (var i = 0; i < markerFrets.length; i++) {
                var f = markerFrets[i];
                var x = this.nutX + (this.fretX(f - 1) + this.fretX(f)) / 2;
                markers.push({ x: x, y: y });
            }
            return markers;
        },
        scaleNoteSet: function() {
            var set = {};
            if (this.scaleRoot < 0) return set;
            var pattern = scalePatterns[this.scaleType];
            if (!pattern) return set;
            for (var i = 0; i < pattern.intervals.length; i++) {
                var note = mod(this.scaleRoot + pattern.intervals[i], 12);
                set[note] = true;
            }
            return set;
        },
        scaleIntervals: function() {
            var map = {};
            if (this.scaleRoot < 0) return map;
            var pattern = scalePatterns[this.scaleType];
            if (!pattern) return map;
            for (var i = 0; i < pattern.intervals.length; i++) {
                var note = mod(this.scaleRoot + pattern.intervals[i], 12);
                map[note] = noteLabels[pattern.intervals[i]];
            }
            return map;
        },
        activeScaleId: function() {
            return this.scaleRoot >= 0 ? this.scaleRoot : -1;
        },
        displayNotes: function() {
            return this.strings.notes;
        },
        // Note indices ordered starting from C for the root selector
        chromaticIndices: function() {
            return [3,4,5,6,7,8,9,10,11,0,1,2];
        },
    },
    methods: {
        noteName: function(noteId) {
            return this.strings.notes[noteId];
        },
        intervalName: function(noteId) {
            return this.scaleIntervals[noteId] || '';
        },
        fretX: function(n) {
            // Real guitar fret spacing: distance from nut follows 2^(-n/12)
            return this.scaleLength * (1 - Math.pow(2, -n / 12));
        },

        // Custom dropdown controls
        toggleRootMenu: function(e) {
            this.rootMenuOpen = !this.rootMenuOpen;
            this.scaleMenuOpen = false;
            if (this.rootMenuOpen) {
                var rect = e.currentTarget.getBoundingClientRect();
                this.dropTop = (rect.bottom + 4) + 'px';
                this.dropLeft = rect.left + 'px';
                this.dropMinWidth = Math.max(rect.width, 140) + 'px';
            }
        },
        toggleScaleMenu: function(e) {
            this.scaleMenuOpen = !this.scaleMenuOpen;
            this.rootMenuOpen = false;
            if (this.scaleMenuOpen) {
                var rect = e.currentTarget.getBoundingClientRect();
                this.dropTop = (rect.bottom + 4) + 'px';
                this.dropLeft = rect.left + 'px';
                this.dropMinWidth = Math.max(rect.width, 140) + 'px';
            }
        },
        selectRoot: function(nid) {
            this.scaleRoot = nid;
            this.rootMenuOpen = false;
        },
        selectScale: function(scaleId) {
            this.scaleType = scaleId;
            this.scaleMenuOpen = false;
        },
        onDocClick: function(e) {
            if (!this.$el.contains(e.target)) {
                this.rootMenuOpen = false;
                this.scaleMenuOpen = false;
            }
        },
        scaleLabel: function() {
            var found = scaleList.find(function(s) { return s.id === this.scaleType; }, this);
            return found ? found.name : this.scaleType;
        },
        changeSound: function(opt) {
            this.soundSource = opt.id;
            midiBus.midiThru.send([0xC0, opt.program]);
        },
    },
    mounted: function() {
        var self = this;
        this._docClickClose = function(e) { self.onDocClick(e); };
        document.addEventListener('click', this._docClickClose);
    },
    beforeDestroy: function() {
        document.removeEventListener('click', this._docClickClose);
    },
    template: `
        <div class="guitar-fretboard-wrap">
            <div class="guitar-fretboard-scaler" :style="{paddingBottom: Math.max(0, (fretZoom - 1) * 18) + '%'}">
            <svg class="guitar-fretboard" :viewBox="viewbox"
                :style="fretZoom !== 1 ? {transform: 'scale(' + fretZoom + ')', transformOrigin: 'top center'} : {}"
                xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="0" dy="0.5" stdDeviation="0.8" flood-opacity="0.15"/>
                    </filter>
                </defs>

                <!-- Background -->
                <rect x="0" y="0" :width="fretboardWidth" :height="fretboardHeight"
                    rx="5" ry="5" fill="#faf8f3" stroke="#e0d8c8" stroke-width="1"/>

                <!-- Fret wires -->
                <line v-for="f in fretCount" :key="'fret-'+f"
                    :x1="nutX + fretX(f)"
                    :y1="marginTop"
                    :x2="nutX + fretX(f)"
                    :y2="marginTop + (stringsData.length - 1) * stringSpacing"
                    stroke="#d4cdbc" stroke-width="1.2"/>

                <!-- Nut -->
                <line
                    :x1="nutX"
                    :y1="marginTop"
                    :x2="nutX"
                    :y2="marginTop + (stringsData.length - 1) * stringSpacing"
                    stroke="#b8a98a" :stroke-width="nutWidth" stroke-linecap="round"/>

                <!-- Strings -->
                <line v-for="s, index in stringsData" :key="'string-'+index"
                    :x1="nutX - 5"
                    :y1="marginTop + index * stringSpacing"
                    :x2="nutX + fretX(fretCount) + 5"
                    :y2="marginTop + index * stringSpacing"
                    stroke="#d4cdbc"
                    :stroke-width="0.4 + (index + 1) * 0.35"
                    stroke-linecap="round"/>

                <!-- Fret marker dots above fretboard -->
                <circle v-for="(m, i) in fretMarkers" :key="'marker-'+i"
                    :cx="m.x" :cy="m.y" r="3.5"
                    fill="none" stroke="#c4b998" stroke-width="1.2" opacity="0.45"/>

                <!-- Open string notes (fret 0) -->
                <clickToPlayWrapper v-for="pos in positions.filter(function(p){return p.fret === 0})" :key="pos.key"
                    :pitches="[pos.midiPitch]"
                    :transform="'translate(' + pos.x + ',' + pos.y + ')'">
                    <g>
                        <circle r="14"
                            :class="{
                                activeNode: pos.isActive,
                                scaleNoteRing: scaleRoot >= 0 && pos.isScaleNote && !pos.isActive,
                                dimmedNote: scaleRoot >= 0 && !pos.isScaleNote && !pos.isActive
                            }"
                            :data-key="pos.noteId"
                            fill="white" stroke="#d4cdbc" stroke-width="1.5"
                            filter="url(#shadow)"/>
                        <text text-anchor="middle" dominant-baseline="central"
                            font-weight="bold"
                            :fill="pos.isActive ? 'white' : '#888'"
                            font-family="system-ui, sans-serif">
                            {{ pos.isActive ? noteName(pos.noteId) : (showIntervals && scaleRoot >= 0 ? (intervalName(pos.noteId) || '·') : noteName(pos.noteId)) }}
                        </text>
                    </g>
                </clickToPlayWrapper>

                <!-- Fretted notes (fret 1-18) -->
                <clickToPlayWrapper v-for="pos in positions.filter(function(p){return p.fret > 0})" :key="pos.key"
                    :pitches="[pos.midiPitch]"
                    :transform="'translate(' + pos.x + ',' + pos.y + ')'">
                    <g>
                        <circle r="12"
                            :class="{
                                activeNode: pos.isActive,
                                scaleNoteRing: scaleRoot >= 0 && pos.isScaleNote && !pos.isActive,
                                dimmedNote: scaleRoot >= 0 && !pos.isScaleNote && !pos.isActive
                            }"
                            :data-key="pos.noteId"
                            fill="white" stroke="#d4cdbc" stroke-width="1.2"
                            filter="url(#shadow)"/>
                        <text text-anchor="middle" dominant-baseline="central"
                            font-weight="bold"
                            :fill="pos.isActive ? 'white' : '#888'"
                            font-family="system-ui, sans-serif">
                            {{ pos.isActive ? noteName(pos.noteId) : (showIntervals && scaleRoot >= 0 ? (intervalName(pos.noteId) || '·') : noteName(pos.noteId)) }}
                        </text>
                    </g>
                </clickToPlayWrapper>
            </svg>
            </div>

            <!-- Scale Reference Controls -->
            <div class="scale-ref">

                <!-- Zoom row — centered above controls -->
                <div class="scale-zoom-row">
                    <span class="scale-ref-heading scale-ref-zoom-label">Zoom / 缩放</span>
                    <input type="range" class="zoom-slider" min="0.5" max="1.5" step="0.05"
                        v-model.number="fretZoom">
                    <span class="zoom-value">{{ Math.round(fretZoom * 100) }}%</span>
                </div>

                <!-- Root note selector row — circular buttons -->
                <div class="scale-root-row">
                    <button v-for="nid in chromaticIndices" :key="'root-'+nid"
                        class="scale-root-btn"
                        :class="{ active: scaleRoot === nid }"
                        :data-key="nid"
                        @click="scaleRoot = (scaleRoot === nid ? -1 : nid)">
                        {{ displayNotes[nid] }}
                    </button>
                </div>

                <!-- Controls row — centered single line -->
                <div class="scale-ctrl-row">
                    <div class="scale-ref-group">
                        <label class="scale-ref-heading">Arpeggio / 琶音</label>
                        <label class="scale-toggle">
                            <input type="checkbox" :checked="arpeggio" @change="$emit('arpeggio-change', $event.target.checked)">
                            <span>ON</span>
                        </label>
                    </div>

                    <div class="scale-ref-group">
                        <label class="scale-ref-heading">Intervals / 音程</label>
                        <label class="scale-toggle">
                            <input type="checkbox" v-model="showIntervals">
                            <span>ON</span>
                        </label>
                    </div>

                    <div class="scale-ref-group">
                        <label class="scale-ref-heading">Timbre / 音色</label>
                        <div class="sound-btn-row">
                            <button v-for="opt in soundOptions" :key="opt.id"
                                class="sound-btn"
                                :class="{ active: soundSource === opt.id }"
                                @click="changeSound(opt)">
                                {{ opt.label }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Quick scale buttons row — 5 single-select scales -->
                <div class="scale-btn-row">
                    <button v-for="qs in quickScales" :key="qs.id"
                        class="scale-btn"
                        :class="{ active: scaleType === qs.id }"
                        @click="scaleType = qs.id; if (scaleRoot < 0) scaleRoot = 3">
                        {{ qs.label }}
                    </button>
                </div>

            </div>
        </div>
    `
}
