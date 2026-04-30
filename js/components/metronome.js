// Metronome popup component with Web Audio API

var metronomePopup = {
  data: function() {
    return {
      show: false,
      isPlaying: false,
      bpm: 120,
      beatsPerBar: 4,
      subdivision: 1,
      currentTick: 0,
      totalTicks: 4,
      audioCtx: null,
      nextNoteTime: 0,
      scheduleTimer: null,
      beatFlash: -1,
      taps: [],
    };
  },
  computed: {
    iconFill: function() {
      return this.isPlaying ? '#323248' : 'none';
    },
    iconStroke: function() {
      return this.isPlaying ? '#323248' : '#aaa';
    },
    beatDots: function() {
      var dots = [];
      for (var i = 0; i < this.beatsPerBar; i++) {
        dots.push({ index: i, active: i === this.currentTick });
      }
      return dots;
    },
  },
  methods: {
    toggle: function() {
      this.show = !this.show;
    },
    close: function() {
      this.show = false;
    },
    adjustBpm: function(d) {
      this.bpm = Math.max(30, Math.min(280, this.bpm + d));
    },
    adjustBar: function(d) {
      this.beatsPerBar = Math.max(1, Math.min(12, this.beatsPerBar + d));
      this.totalTicks = this.beatsPerBar;
      this.currentTick = 0;
    },
    tapTempo: function() {
      var now = Date.now();
      if (this.taps.length && now - this.taps[this.taps.length - 1] > 2000) {
        this.taps = [];
      }
      this.taps.push(now);
      if (this.taps.length > 5) this.taps.shift();
      if (this.taps.length > 1) {
        var sum = 0;
        for (var i = 1; i < this.taps.length; i++) {
          sum += this.taps[i] - this.taps[i - 1];
        }
        this.bpm = Math.round(60000 / (sum / (this.taps.length - 1)));
      }
    },
    startStop: function() {
      if (this.isPlaying) { this.stop(); }
      else { this.start(); }
    },
    start: function() {
      var self = this;
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      this.isPlaying = true;
      this.currentTick = 0;
      this.nextNoteTime = this.audioCtx.currentTime + 0.05;
      this.scheduleTimer = setInterval(function() { self.scheduler(); }, 25);
    },
    stop: function() {
      this.isPlaying = false;
      if (this.scheduleTimer) {
        clearInterval(this.scheduleTimer);
        this.scheduleTimer = null;
      }
      this.beatFlash = -1;
    },
    scheduler: function() {
      while (this.nextNoteTime < this.audioCtx.currentTime + 0.1) {
        this.scheduleNote(this.currentTick, this.nextNoteTime);
        var secsPerBeat = 60.0 / this.bpm;
        this.nextNoteTime += secsPerBeat;
        this.currentTick++;
        if (this.currentTick >= this.totalTicks) {
          this.currentTick = 0;
        }
      }
    },
    scheduleNote: function(tickIndex, time) {
      var self = this;
      var osc = this.audioCtx.createOscillator();
      var gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      var isFirst = tickIndex === 0;
      osc.frequency.value = isFirst ? 1200 : 900;
      gain.gain.setValueAtTime(isFirst ? 0.9 : 0.5, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
      osc.start(time);
      osc.stop(time + 0.06);

      var delay = Math.max(0, (time - this.audioCtx.currentTime) * 1000);
      setTimeout(function() {
        self.beatFlash = tickIndex;
        setTimeout(function() { self.beatFlash = -1; }, 80);
      }, delay);
    },
    onDocClick: function(e) {
      if (this.show && !this.$el.contains(e.target)) {
        this.close();
      }
    },
  },
  mounted: function() {
    var self = this;
    this._docClick = function(e) { self.onDocClick(e); };
    document.addEventListener('click', this._docClick);
  },
  beforeDestroy: function() {
    this.stop();
    document.removeEventListener('click', this._docClick);
  },
  template: `
    <div class="metronome-root">
      <div class="metronome-icon" @click.stop="toggle" :class="{ active: isPlaying }">
        <svg width="44" height="56" viewBox="0 0 36 54" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="13,8 23,8 30,44 6,44" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
          <g class="metronome-pendulum">
            <line class="metronome-needle" x1="18" y1="44" x2="18" y2="20" stroke="currentColor" stroke-linecap="round"/>
            <circle cx="18" cy="20" r="2.5" fill="currentColor"/>
          </g>
          <circle cx="18" cy="44" r="2" fill="currentColor"/>
        </svg>
      </div>

      <div v-if="show" class="metro-modal-background" @click="close">
        <div class="metro-modal" @click.stop>
          <div class="metro-header">
            <span class="metro-title">Metronome</span>
            <button class="metro-close" @click="close">&times;</button>
          </div>

          <div class="metro-body">
            <div class="metro-bpm-display">
              <span class="metro-bpm-val">{{ bpm }}</span>
              <span class="metro-bpm-label">BPM</span>
            </div>

            <div class="metro-slider-wrap">
              <input type="range" min="30" max="280" v-model.number="bpm" class="metro-slider">
            </div>

            <div class="metro-bpm-btns">
              <button class="metro-btn-sq" @click="adjustBpm(-1)">-</button>
              <button class="metro-btn-sq" @click="adjustBpm(1)">+</button>
            </div>

            <button class="metro-tap-btn" @click="tapTempo">TAP TEMPO</button>

            <div class="metro-beats-row">
              <span class="metro-beats-label">Beats</span>
              <button class="metro-beat-adj" @click="adjustBar(-1)">-</button>
              <span class="metro-beats-count">{{ beatsPerBar }}</span>
              <button class="metro-beat-adj" @click="adjustBar(1)">+</button>
            </div>

            <div class="metro-beat-dots">
              <span v-for="(dot, i) in beatDots" :key="'bd-'+i"
                class="metro-dot"
                :class="{ active: beatFlash === i, first: i === 0 }"
                :style="{ backgroundColor: beatFlash === i ? '#323248' : (i === 0 ? '#ccc' : '#e0e0e0') }">
              </span>
            </div>

            <button class="metro-play-btn" :class="{ playing: isPlaying }" @click="startStop">
              {{ isPlaying ? 'STOP' : 'START' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
};
