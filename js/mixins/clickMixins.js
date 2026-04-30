let clickToPlayWrapper = {
    props: {
        pitches: {
            type:Array,
            required:true,
            validator: function(pitches){
                return pitches.every( isMidiPitch )
            }
        }
    },
    data: function (){return{
        clicked: false
    }},
    methods:{
        clickOn: function(){
            if(!this.clicked){
                this.clicked=true;
                midiBus.$emit('note-on',this.pitches);
            }
        },
        clickOff: function(){
            if(this.clicked){
                this.clicked=false;
                midiBus.$emit('note-off',this.pitches);
            }
        },
        enter: function(event){
            if(event.pressure!==0){
                this.clickOn();
            }
        }
    },
    template:`
        <g @pointerdown="clickOn()"
        @pointerup="clickOff()"
        @pointerenter="enter"
        @pointerleave="clickOff()"
        @touchstart.prevent
        @touchmove.prevent
        @touchend.prevent>
            <slot/>
        </g>
    `
}

var activableMixin = {
    props: {
        notes:{
            type: Array,
            required: true
        },
        forceState:{
            type: Number,
            default: -1,
            validator: n => [-1,0,1,2].includes(n)
        }
    },
    computed: {
        isActive : function(){
            return (this.forceState===-1 && this.notes.every(elem => elem.count > 0))
                || this.forceState===2;
        },
        semiActive: function(){
            return this.forceState === 1;
        }
    }
}

var Tonnetz_mixins = true;
