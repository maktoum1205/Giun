let noteTonnetz = {
    mixins: [activableMixin],
    computed:{
        strings: function (){
            return this.$root.strings
        }
    },
    template: `
        <g class="tonnetzNote">
            <circle v-bind:class="{activeNode:isActive, visitedNode:semiActive}"
                v-bind:data-key="notes[0].id">
            </circle>
            <text>
                {{ strings.notes[notes[0].id] }}
            </text>
        </g>
        `
};

let chord = {
    mixins: [activableMixin],
    props: {
        shape:{
            type: Array,
            required: true
        }
    },
    computed: {
        coords: function (){
            return this.shape.map(logicalToSvg);
        },
        center: function (){
            return {x:average(this.coords.map(({x}) => x)),
                    y:average(this.coords.map(({y}) => y))}
        }
    }
}

let dichordTonnetz = {
    extends: chord,
    computed: {
        coordsHTML: function (){
            return {
                x1 : this.coords[0].x,
                x2 : this.coords[1].x,
                y1 : this.coords[0].y,
                y2 : this.coords[1].y
            }
        }
    },
    template: `
    <g class="tonnetzDichord">
        <line v-bind:class="{activeDichord:isActive, visitedDichord:semiActive}"
            v-bind="coordsHTML">
        </line>
        <circle v-bind:class="{activeDichord:isActive}"
                v-bind:cx="center.x" v-bind:cy="center.y">
        </circle>
    </g>
    `
};

let trichordTonnetz = {
    extends: chord,
    computed: {
        points: function (){
            return this.coords.map( ({x,y}) => `${x},${y}` ).join(' ')
        }
    },
    template: `
        <polygon v-bind:class="{activeTrichord:isActive, visitedTrichord:semiActive}"
            class="tonnetzTrichord"
            v-bind:points="points"/>
        `
};

// Geometrical constants
const xstep=Math.sqrt(3)/2
const baseSize=50

const logicalToSvgX = node => node.x * xstep * baseSize;
const logicalToSvgY = node => (node.y + node.x/2) * baseSize;
const logicalToSvg = node => ({x:logicalToSvgX(node), y:logicalToSvgY(node)})

let tonnetzLike = {
    props: {
        notes: Array,
        intervals: {
            type: Array,
            default: () => [3,4,5]
        },
        bounds: {
            type: Object
        }
    },
    computed: {
        nodeList: function (){
            var nodes = [];
            var xmin = Math.floor(this.bounds.xmin/(baseSize*xstep))
            var xmax = Math.ceil(this.bounds.xmax/(baseSize*xstep))
            for(xi of range(xmin,xmax+1)){
                ymin = Math.floor(this.bounds.ymin/(baseSize)-xi/2)
                ymax = Math.ceil(this.bounds.ymax/(baseSize)-xi/2)
                for(yi of range(ymin,ymax+1)){
                    let node = {x:xi,y:yi};
                    nodes.push(node)
                }
            }
            return nodes;
        },
        dichordList: function (){
            var nodes = [];
            for(node of this.nodeList){
                nodes.push([{x:node.x,y:node.y},{x:node.x+1,y:node.y  }]);
                nodes.push([{x:node.x,y:node.y},{x:node.x  ,y:node.y+1}]);
                nodes.push([{x:node.x,y:node.y},{x:node.x-1,y:node.y+1}]);
            }
            return nodes;
        },
        trichordList: function (){
            var nodes = [];
            for(node of this.nodeList){
                nodes.push([{x:node.x,y:node.y},{x:node.x+1,y:node.y  },{x:node.x,y:node.y+1}]);
                nodes.push([{x:node.x,y:node.y},{x:node.x-1,y:node.y+1},{x:node.x,y:node.y+1}]);
            }
            return nodes;
        }
    },
    methods: {
        node2Notes: function (nodes){
            return nodes.map(node => this.notes[mod(-node.x*this.intervals[0]+node.y*this.intervals[2],12)])
        },
        nodesToPitches: function(nodes){
            return nodes.map(nodeIt => {
                let x = 81-nodeIt.x*this.intervals[0]+nodeIt.y*(this.intervals[2]-12)
                return Math.max(x,mod(x,12))
            });
        },
        position: function(node){
            let {x,y} = logicalToSvg(node)
            return `translate(${x} ${y})`
        },
        shape: function(nodes){
            return nodes.map(node => ({
                x:node.x-nodes[0].x,
                y:node.y-nodes[0].y
            }));
        },
        genKey: function (n){
            return n.map(function textify(node){return `${node.x},${node.y}`}).join(' ')
        }
    },
    subtemplateNote:`
            <clickToPlayWrapper :transform="position(n.nodes[0])"
            v-for="n in trichordStateList" v-bind:key="genKey(n.nodes)"
            :pitches="nodesToPitches(n.nodes)">
                <trichord
                v-bind:notes="memoNode2Notes(n.nodes)"
                v-bind:nodes="n.nodes"
                :shape="memoShape(n.nodes)"
                :forceState="n.status"
                />
    </clickToPlayWrapper>`,
    subtemplateDichord:`
            <clickToPlayWrapper :transform="position(n.nodes[0])"
            v-for="n in dichordStateList" v-bind:key="genKey(n.nodes)"
            :pitches="nodesToPitches(n.nodes)">
                <dichord
                v-bind:shape="memoShape(n.nodes)"
                v-bind:notes="memoNode2Notes(n.nodes)"
                :forceState="n.status"/>
    </clickToPlayWrapper>`,
    subtemplateTrichord:`
            <clickToPlayWrapper :transform="position(n.node)"
            v-for="n in nodeStateList" v-bind:key="genKey([n.node])"
            :pitches="nodesToPitches([n.node])">
                <note v-bind:notes="memoNode2Notes([n.node])"
                v-bind:nodes="[n.node]"
                :forceState="n.status"/>
    </clickToPlayWrapper>`
};

let tonnetzPlan = {
    components: {
        clickToPlayWrapper,
        'note': noteTonnetz,
        'dichord': dichordTonnetz,
        'trichord': trichordTonnetz
    },
    extends: tonnetzLike,
    mixins: [traceHandler],
    template: `
        <g>
            ${tonnetzLike.subtemplateNote}
            ${tonnetzLike.subtemplateDichord}
            ${tonnetzLike.subtemplateTrichord}
        </g>
    `
}

// ----------------------- Chicken Wire ---------------------------

let trichordChicken = {
    extends: chord,
    props: ['id'],
    computed: {
        strings: function (){
            return this.$root.strings
        },
        text: function(){
            var major = (this.shape[0].y == this.shape[1].y);
            if (major){
                return this.strings.notes[this.notes[2].id];
            }else{
                var display = this.strings.notes[this.notes[2].id];
                return display[0].toLowerCase() + display.substring(1);
            }
        }
    },
    template: `
        <g v-bind:id="id" class=chickenTrichord>
            <circle v-bind:class="{activeTrichord:isActive, visitedTrichord:semiActive}"
                v-bind:cx="center.x" v-bind:cy="center.y">
            </circle>
            <text v-bind:x="center.x" v-bind:y="center.y">
                {{ text }}
            </text>
        </g>
        `
}

let dichordChicken = {
    extends: chord,
    computed: {
        coordsHTML: function (){
            let dx = this.coords[1].x - this.coords[0].x;
            let dy = this.coords[1].y - this.coords[0].y;
            let rotate = function(point){
                return {x: (dx*point.x-dy*point.y),
                        y: (dy*point.x+dx*point.y)};
            };
            const p1 = {x:0.5,y:xstep/3};
            const p2 = {x:0.5,y:-xstep/3};
            return {
                x1 : rotate(p1).x,
                x2 : rotate(p2).x,
                y1 : rotate(p1).y,
                y2 : rotate(p2).y
            }
        }
    },
    template: `
    <g class="chickenDichord">
        <line v-bind:class="{activeDichord:isActive, visitedDichord:semiActive}"
            v-bind="coordsHTML">
        </line>
        <circle v-bind:class="{activeDichord:isActive}"
                v-bind:cx="center.x" v-bind:cy="center.y">
        </circle>
    </g>
    `
}

let noteChicken = {
    mixins: [activableMixin],
    props: ['notes','nodes'],
    computed: {
        coords: function (){
            return[
                {x:+baseSize*xstep/3,  y:+baseSize/2},
                {x:-baseSize*xstep/3,  y:+baseSize/2},
                {x:-baseSize*2*xstep/3,y:0},
                {x:-baseSize*xstep/3,  y:-baseSize/2},
                {x:+baseSize*xstep/3,  y:-baseSize/2},
                {x:+baseSize*2*xstep/3,y:0}
            ]
        },
        points: function (){
            return this.coords.map( ({x,y}) => `${x},${y}` ).join(' ')
        }
    },
    template: `
        <polygon v-bind:class="{activeNode:isActive, visitedNode:semiActive}" class="chickenNote"
            v-bind:points="points" v-bind:data-key="notes[0].id"/>
        `
}

let chickenWire = {
    components: {
        clickToPlayWrapper,
        'note': noteChicken,
        'dichord': dichordChicken,
        'trichord': trichordChicken
    },
    extends: tonnetzLike,
    mixins: [traceHandler],
    template: `
        <g>
        ${tonnetzLike.subtemplateTrichord}
        ${tonnetzLike.subtemplateDichord}
        ${tonnetzLike.subtemplateNote}
        </g>
    `
}

var Tonnetz_tonnetzLike = true
