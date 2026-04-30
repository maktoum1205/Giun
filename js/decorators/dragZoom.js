let dragZoomSvg = {
    props: {
        height: Number,
        width: Number,
        scaleBounds: {
            type: Object,
            default: () => ({mini: 1, maxi: 2})
        },
        lock: {
            type: Boolean,
            default: false
        }
    },
    data: function(){return{
        tx      : 0,
        ty      : 0,
        scale   : 2,
        captureMouse: false,
        clickedPos  : {x:0,y:0},
    }},
    computed: {
        transform: function(){
            return `scale(${this.scale}) translate(${this.tx} ${this.ty})`
        },
        viewbox: function(){
            return `0 0 ${this.width} ${this.height}`
        },
        bounds: function(){
            return{
                xmin:-this.tx,
                ymin:-this.ty,
                xmax:-this.tx+this.width /this.scale,
                ymax:-this.ty+this.height/this.scale,
            }
        }
    },
    watch:{
        lock: 'captureOff'
    },
    methods: {
        zoomInOut: function (wheelEvent){
            if(this.lock) return;

            // Only zoom with Ctrl/Cmd held; let normal scroll pass through
            if (!wheelEvent.ctrlKey && !wheelEvent.metaKey) return;

            wheelEvent.preventDefault();

            var multiplier = Math.exp(-wheelEvent.deltaY/600)
            multiplier = bound(multiplier,this.scaleBounds.mini/this.scale,
                                          this.scaleBounds.maxi/this.scale);
            if(multiplier===1){
                return
            }
            let pointer = {x: wheelEvent.clientX - this.$el.getBoundingClientRect().left,
                           y: wheelEvent.clientY - this.$el.getBoundingClientRect().top};
            var pointerSvg = ({x:pointer.x/this.scale-this.tx,
                               y:pointer.y/this.scale-this.ty});
            this.tx = (this.tx + pointerSvg.x)/multiplier - pointerSvg.x
            this.ty = (this.ty + pointerSvg.y)/multiplier - pointerSvg.y
            this.scale = this.scale*multiplier
            return
        },
        drag: function (event){
            if (this.captureMouse){
                var dx = event.clientX - this.clickedPos.x
                var dy = event.clientY - this.clickedPos.y
                this.tx += dx / this.scale
                this.ty += dy / this.scale
                this.clickedPos = {x:event.clientX,y:event.clientY}
            }
            return
        },
        captureOn: function (event){
            if(this.lock) return
            this.captureMouse = true
            this.clickedPos = {x:event.clientX,y:event.clientY}
            return
        },
        captureOff: function (event){
            this.captureMouse = false
            return
        },
        panTo: function(targetPosition){
            if(targetPosition.x > this.bounds.xmin && targetPosition.x < this.bounds.xmax
             &&targetPosition.y > this.bounds.ymin && targetPosition.y < this.bounds.ymax)
            {
                return
            }else{
                newPos = {
                    tx:- targetPosition.x + this.width/this.scale/2,
                    ty:- targetPosition.y + this.height/this.scale/2
                };
                TweenLite.to(this,1,newPos);
            }
        }
    },
    mounted(){
        this.$on('pan',this.panTo);
    },
    template: `
        <svg id="svg" class="tonnetz"
        v-bind:width="width" v-bind:height="height"
        v-bind:viewBox="viewbox"
        v-on:wheel="zoomInOut"
        v-on:pointerdown="captureOn"
        v-on:pointerup="captureOff"
        v-on:pointerleave="captureOff"
        v-on:pointermove="drag">
            <g ref="trans" v-bind:transform="transform">
                <slot :bounds="bounds"/>
            </g>
        </svg>
    `
}

var Tonnetz_dragZoom = true;
