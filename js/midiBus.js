var midiBus=new Vue({
    data: function(){return {
        midiThru:JZZ.Widget()
    }},
    methods:{
        connect: function(output){
            this.midiThru.connect(output)
        }
    }
});

var Tonnetz_midiBus = true;
