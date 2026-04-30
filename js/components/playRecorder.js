let playRecorder = {
    components: {songLoader},
    data: function(){return{
        player: {playing:false, play:noop, pause:noop, stop: noop, resume:noop},
        recording: false,
        modal: false,
        startTime:undefined,
        SMF:undefined,
        elapsed: 0,
        totalDuration: 0,
        timerInterval: null,
    }},
    computed:{
        strings: function(){return this.$root.strings},
        elapsedDisplay: function() {
            var s = Math.floor(this.elapsed);
            if (s < 10) return '0' + s;
            return '' + s;
        },
    },
    methods:{
        resetNotes: function(){
            this.$emit('reset-notes');
        },
        startTimer: function() {
            var self = this;
            this.stopTimer();
            if (!this.recording) {
                this.elapsed = this.totalDuration;
            } else {
                this.elapsed = 0;
            }
            this.timerInterval = setInterval(function() {
                if (self.recording) {
                    self.elapsed += 0.1;
                    if (self.elapsed >= 60) {
                        self.stop();
                    }
                } else {
                    self.elapsed -= 0.1;
                    if (self.elapsed <= 0) {
                        self.elapsed = 0;
                        self.stop();
                    }
                }
            }, 100);
        },
        stopTimer: function() {
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
        },
        playPause: function() {
            if (this.player.playing) {
                this.player.pause();
                this.stopTimer();
            }else if(this.player.paused){
                this.player.resume();
                this.startTimer();
            }else{
                this.resetNotes();
                this.player.play();
                this.startTimer();
            }
        },
        stop: function(){
            this.stopTimer();
            if (this.recording) {
                this.recording = false;
                this.totalDuration = this.elapsed;
                this.SMF[0].add(new Date().getTime() - this.startTime, JZZ.MIDI.smfEndOfTrack());
                this.fromTrajectory();
            }
            if(this.player){
                this.player.stop();
            }
            this.elapsed = 0;
            setTimeout(this.resetNotes,10);
        },
        load: function(data, name) {
            this.$root.initMIDI();
            this.modal=false;
            this.resetNotes();
            if(this.player.playing){
                this.stop();
            }
            try {
                this.SMF = JZZ.MIDI.SMF(data);
                this.player = this.SMF.player();
                this.player.connect(midiBus.midiThru);
                this.player.play();
            } catch (e) {
                console.log(e);
                throw e;
            }
        },
        fromTrajectory : function () {
            if(this.player.playing){
                this.stop();
            }
            this.SMF=this.SMF;
            this.player = this.SMF.player();
            this.player.connect(midiBus.midiThru);
            this.resetNotes();
        },
        rotate: function(){
            this.stop()
            this.rotateTrajectory(this.SMF);
            this.player=this.SMF.player();
            this.player.connect(midiBus.midiThru);
            this.player.play();
        },
        translate: function(translate=1){
            this.stop()
            this.translateTrajectory(this.SMF,translate);
            this.player=this.SMF.player();
            this.player.connect(midiBus.midiThru);
            this.player.play();
        },
        rotateTrajectory : function (SMF) {
            for (SMFTrack of SMF){
                let symmetryCenter = undefined;
                for (SME of SMFTrack){
                    let note = SME.getNote();
                    if(note !== undefined){
                        if (symmetryCenter === undefined){
                            symmetryCenter = note;
                        }else{
                            noteIntervalClass = mod(2*(symmetryCenter - note),12)
                            if(noteIntervalClass > 6){
                                note += noteIntervalClass-12
                            }else{
                                note += noteIntervalClass
                            }
                        }
                        SME.setNote(note);
                    }
                }
            }
        },
        translateTrajectory : function (SMF,translate) {
            for (SMFTrack of SMF){
                for (SME of SMFTrack){
                    let note = SME.getNote();
                    if(note !== undefined){
                        SME.setNote(note+translate);
                    }
                }
            }
        },
        recordToggle: function(){
            if(this.recording){
                this.recording = false;
                this.totalDuration = this.elapsed;
                this.SMF[0].add(new Date().getTime() - this.startTime,JZZ.MIDI.smfEndOfTrack());
                this.stopTimer();
                this.elapsed = 0;
                this.stop();
                this.fromTrajectory();
            }else{
                this.recording = true;
                this.SMF = new JZZ.MIDI.SMF(0,500);
                this.SMF.push(new JZZ.MIDI.SMF.MTrk());
                this.SMF[0].add(0,JZZ.MIDI.smfBPM(120));
                this.startTime = new Date().getTime();
                this.startTimer();
            }
        },
        midiHandler: function(midiEvent){
            if(this.recording){
                if(midiEvent.isNoteOn()){
                    this.SMF[0].add(new Date().getTime()-this.startTime,JZZ.MIDI.noteOn(midiEvent.getChannel(),midiEvent.getNote(),midiEvent[2]))
                }else if(midiEvent.isNoteOff()){
                    this.SMF[0].add(new Date().getTime()-this.startTime,JZZ.MIDI.noteOff(midiEvent.getChannel(),midiEvent.getNote()));
                }else if(midiEvent.ff!==0x51){
                    this.SMF[0].add(new Date().getTime()-this.startTime,midiEvent);
                }
            }
        },
        download: function(){
            let str = this.SMF.dump();
            let b64 = JZZ.lib.toBase64(str);
            let uri = 'data:audio/midi;base64,' + b64;
            var element = document.createElement('a');
            element.setAttribute('href', uri);
            element.setAttribute('download', 'export.mid');
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        }
    },
    mounted: function(){
        midiBus.connect(this.midiHandler);
    },
    template: `
        <div class="transport-controls" v-cloak>
            <div class="transport-timer" v-show="recording || player.playing">{{ elapsedDisplay }}</div>
            <button class="transport-btn rec-btn" :class="{ recording: recording }" @click="recordToggle" :title="recording ? strings.stopRecord : strings.start">
                <svg width="32" height="32" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="13" stroke="currentColor" stroke-width="1.2" style="fill:none"/>
                    <circle cx="16" cy="16" r="9" :style="{fill: recording ? '#e53935' : 'currentColor'}"/>
                </svg>
            </button>
            <button class="transport-btn play-btn" @click="playPause" :title="player.playing ? strings.pause : strings.play">
                <svg v-if="player.playing" width="32" height="32" viewBox="0 0 32 32">
                    <rect x="9" y="8" width="5" height="16" rx="1" fill="currentColor"/>
                    <rect x="18" y="8" width="5" height="16" rx="1" fill="currentColor"/>
                </svg>
                <svg v-else width="32" height="32" viewBox="0 0 32 32">
                    <polygon points="11,7 11,25 26,16" style="fill:currentColor"/>
                </svg>
            </button>
            <button class="transport-btn stop-btn" :class="{ active: player.playing || recording }" @click="stop" :title="strings.stopPlay">
                <svg width="32" height="32" viewBox="0 0 32 32">
                    <rect x="8" y="8" width="16" height="16" rx="2" :style="{fill: (player.playing || recording) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.2"/>
                </svg>
            </button>
        </div>
    `
}

var Tonnetz_playRecorder = true;
