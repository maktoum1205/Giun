// Guitar Chord Database — Shape-based with correct fingerings
// Tuning: low E(40) A(45) D(50) G(55) B(59) high e(64)
// noteId 0=A, 1=A#, 2=B, 3=C, 4=C#, 5=D, 6=D#, 7=E, 8=F, 9=F#, 10=G, 11=G#

var chordTuning = [
  { midiBase: 64 }, // s0 high e
  { midiBase: 59 }, // s1 B
  { midiBase: 55 }, // s2 G
  { midiBase: 50 }, // s3 D
  { midiBase: 45 }, // s4 A
  { midiBase: 40 }, // s5 low E
];

function chordNoteId(midi) {
  return mod(midi + 3, 12);
}

// All data stored low-to-high: [lowE, A, D, G, B, highE]
// fret: -1=muted, 0=open, 1-15=fretted
// finger: null=open/muted, 1=index, 2=middle, 3=ring, 4=pinky

var chordTypeDefs = [
  { id: '',        name: '',         intervals: [0,4,7] },
  { id: 'm',       name: 'm',       intervals: [0,3,7] },
  { id: 'dim',     name: 'dim',     intervals: [0,3,6] },
  { id: 'aug',     name: 'aug',     intervals: [0,4,8] },
  { id: 'maj7',    name: 'maj7',    intervals: [0,4,7,11] },
  { id: 'm7',      name: 'm7',      intervals: [0,3,7,10] },
  { id: '7',       name: '7',       intervals: [0,4,7,10] },
  { id: 'dim7',    name: 'dim7',    intervals: [0,3,6,9] },
  { id: 'mM7',     name: 'mM7',     intervals: [0,3,7,11] },
  { id: 'aug7',    name: 'aug7',    intervals: [0,4,8,10] },
  { id: 'm7b5',    name: 'm7b5',    intervals: [0,3,6,10] },
  { id: 'sus2',    name: 'sus2',    intervals: [0,2,7] },
  { id: 'sus4',    name: 'sus4',    intervals: [0,5,7] },
  { id: '7sus2',   name: '7sus2',   intervals: [0,2,7,10] },
  { id: '7sus4',   name: '7sus4',   intervals: [0,5,7,10] },
  { id: '6',       name: '6',       intervals: [0,4,7,9] },
  { id: 'm6',      name: 'm6',      intervals: [0,3,7,9] },
  { id: 'maj9',    name: 'maj9',    intervals: [0,4,7,11,2] },
  { id: 'm9',      name: 'm9',      intervals: [0,3,7,10,2] },
  { id: '9',       name: '9',       intervals: [0,4,7,10,2] },
  { id: 'add9',    name: 'add9',    intervals: [0,4,7,2] },
  { id: 'madd9',   name: 'madd9',   intervals: [0,3,7,2] },
  { id: 'add11',   name: 'add11',   intervals: [0,4,7,5] },
  { id: '5',       name: '5',       intervals: [0,7] },
];

var slashChordDefs = [
  { id: 'slash3', bassInterval: 4 },
  { id: 'slash5', bassInterval: 7 },
];

// ── Chord Shapes — low-to-high: [lowE, A, D, G, B, highE] ──
// Each shape has { frets, fingers, rootStr } where rootStr is 0-5 (0=lowE)

// Helper: duplicate a shape transposed by n frets (for barre chords)
function transposeShape(shape, n) {
  var newFrets = [];
  if (n === 0) {
    // Still compute baseFret for the original shape
    newFrets = shape.frets.slice();
    var hasOpen0 = shape.frets.some(function(f) { return f === 0; });
    return {
      frets: newFrets,
      fingers: shape.fingers.slice(),
      rootStr: shape.rootStr,
      baseFret: hasOpen0 ? 0 : shape.frets.reduce(function(a,b) { return b>0 && b<a ? b : a; }, Infinity)
    };
  }
  var minF = Infinity;
  for (var i = 0; i < 6; i++) {
    if (shape.frets[i] < 0) {
      newFrets.push(-1);
    } else {
      var f = shape.frets[i] + n;
      newFrets.push(f);
      if (f < minF && f > 0) minF = f;
    }
  }
  // For barre shapes, the index finger bars at the transposed position
  var newFingers = shape.fingers.slice();
  if (n > 0) {
    for (var j = 0; j < 6; j++) {
      if (newFrets[j] === minF) newFingers[j] = 1;
    }
  }
  // baseFret: 0 if any open strings, otherwise the lowest fretted position
  var hasOpen = false;
  for (var k = 0; k < 6; k++) {
    if (newFrets[k] === 0) { hasOpen = true; break; }
  }
  return { frets: newFrets, fingers: newFingers, rootStr: shape.rootStr, baseFret: hasOpen ? 0 : minF };
}

// ── Shape definitions ──

var majorShapes = [
  { frets: [-1, 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null], rootStr: 1 }, // A-form (open A)
  { frets: [ 0, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null], rootStr: 0 }, // E-form (open E)
  { frets: [-1, 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null], rootStr: 1 }, // C-form (open C)
  { frets: [ 3, 2, 0, 0, 0, 3], fingers: [ 2, 1, null, null, null, 3], rootStr: 0 }, // G-form (open G)
  { frets: [-1,-1, 0, 2, 3, 2], fingers: [null,null, null, 1, 3, 2], rootStr: 2 }, // D-form (open D)
];

var minorShapes = [
  { frets: [-1, 0, 2, 2, 1, 0], fingers: [null, null, 2, 3, 1, null], rootStr: 1 }, // Am-form
  { frets: [ 0, 2, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null], rootStr: 0 }, // Em-form
  { frets: [-1,-1, 0, 2, 3, 1], fingers: [null,null, null, 2, 3, 1], rootStr: 2 }, // Dm-form
];

var dimShapes = [
  { frets: [-1, 0, 1, 2, 1, 0], fingers: [null, null, 1, 3, 2, null], rootStr: 1 }, // Adim
  { frets: [-1,-1, 0, 1, 0, 1], fingers: [null,null, null, 2, null, 3], rootStr: 2 }, // Ddim
];

var augShapes = [
  { frets: [-1, 0, 3, 2, 2, 1], fingers: [null, null, 4, 2, 3, 1], rootStr: 1 }, // Aaug
  { frets: [ 0, 3, 2, 1, 1, 0], fingers: [null, 4, 3, 1, 2, null], rootStr: 0 }, // Eaug
];

var maj7Shapes = [
  { frets: [-1, 0, 2, 1, 2, 0], fingers: [null, null, 2, 1, 3, null], rootStr: 1 }, // Amaj7
  { frets: [ 0, 2, 1, 1, 0, 0], fingers: [null, 2, 1, 1, null, null], rootStr: 0 }, // Emaj7
  { frets: [-1, 3, 2, 0, 0, 0], fingers: [null, 3, 2, null, null, null], rootStr: 1 }, // Cmaj7
  { frets: [ 3, 2, 0, 0, 0, 2], fingers: [ 2, 1, null, null, null, 3], rootStr: 0 }, // Gmaj7
  { frets: [-1,-1, 0, 2, 2, 2], fingers: [null,null, null, 1, 2, 3], rootStr: 2 }, // Dmaj7
];

var m7Shapes = [
  { frets: [-1, 0, 2, 0, 1, 0], fingers: [null, null, 2, null, 1, null], rootStr: 1 }, // Am7
  { frets: [ 0, 2, 0, 0, 0, 0], fingers: [null, 2, null, null, null, null], rootStr: 0 }, // Em7
  { frets: [-1,-1, 0, 2, 1, 1], fingers: [null,null, null, 3, 1, 2], rootStr: 2 }, // Dm7
];

var dom7Shapes = [
  { frets: [-1, 0, 2, 0, 2, 0], fingers: [null, null, 2, null, 3, null], rootStr: 1 }, // A7
  { frets: [ 0, 2, 0, 1, 0, 0], fingers: [null, 2, null, 1, null, null], rootStr: 0 }, // E7
  { frets: [-1, 3, 2, 3, 1, 0], fingers: [null, 3, 2, 4, 1, null], rootStr: 1 }, // C7
  { frets: [ 3, 2, 0, 0, 0, 1], fingers: [ 3, 2, null, null, null, 1], rootStr: 0 }, // G7
  { frets: [-1,-1, 0, 2, 1, 2], fingers: [null,null, null, 2, 1, 3], rootStr: 2 }, // D7
];

var dim7Shapes = [
  { frets: [-1, 0, 1, 2, 1, 2], fingers: [null, null, 1, 3, 2, 4], rootStr: 1 }, // Adim7
  { frets: [ 0, 1, 2, 0, 2, 0], fingers: [null, 1, 3, null, 4, null], rootStr: 0 }, // Edim7
];

var mM7Shapes = [
  { frets: [-1, 0, 2, 1, 1, 0], fingers: [null, null, 3, 1, 2, null], rootStr: 1 }, // AmM7
  { frets: [ 0, 2, 1, 0, 0, 0], fingers: [null, 3, 2, null, null, null], rootStr: 0 }, // EmM7
];

var aug7Shapes = [
  { frets: [-1, 0, 3, 0, 2, 1], fingers: [null, null, 4, null, 2, 1], rootStr: 1 }, // Aaug7
  { frets: [ 0, 3, 0, 1, 1, 0], fingers: [null, 4, null, 1, 2, null], rootStr: 0 }, // Eaug7
];

var m7b5Shapes = [
  { frets: [-1, 0, 1, 2, 1, 0], fingers: [null, null, 1, 3, 2, null], rootStr: 1 }, // Am7b5
  { frets: [ 0, 1, 2, 0, 2, 0], fingers: [null, 1, 3, null, 4, null], rootStr: 0 }, // Em7b5
];

var sus2Shapes = [
  { frets: [-1, 0, 2, 2, 0, 0], fingers: [null, null, 1, 2, null, null], rootStr: 1 }, // Asus2
  { frets: [ 0, 2, 4, 4, 2, 0], fingers: [null, 1, 3, 4, 2, null], rootStr: 0 }, // Esus2
  { frets: [-1, 3, 0, 0, 1, 3], fingers: [null, 2, null, null, 1, 4], rootStr: 1 }, // Csus2
  { frets: [ 3, 0, 0, 0, 3, 3], fingers: [ 1, null, null, null, 2, 3], rootStr: 0 }, // Gsus2
  { frets: [-1,-1, 0, 2, 3, 0], fingers: [null,null, null, 1, 2, null], rootStr: 2 }, // Dsus2
];

var sus4Shapes = [
  { frets: [-1, 0, 2, 2, 3, 0], fingers: [null, null, 1, 2, 4, null], rootStr: 1 }, // Asus4
  { frets: [ 0, 2, 2, 2, 0, 0], fingers: [null, 2, 3, 4, null, null], rootStr: 0 }, // Esus4
  { frets: [-1, 3, 2, 0, 3, 0], fingers: [null, 3, 2, null, 4, null], rootStr: 1 }, // Csus4
  { frets: [ 3, 3, 0, 0, 1, 3], fingers: [ 2, 3, null, null, 1, 4], rootStr: 0 }, // Gsus4
  { frets: [-1,-1, 0, 2, 3, 3], fingers: [null,null, null, 1, 2, 4], rootStr: 2 }, // Dsus4
];

var dom7sus4Shapes = [
  { frets: [-1, 0, 2, 0, 3, 0], fingers: [null, null, 1, null, 3, null], rootStr: 1 }, // A7sus4
  { frets: [ 0, 2, 2, 0, 3, 0], fingers: [null, 1, 2, null, 4, null], rootStr: 0 }, // E7sus4
];

var sixShapes = [
  { frets: [-1, 0, 2, 2, 2, 2], fingers: [null, null, 1, 2, 3, 4], rootStr: 1 }, // A6
  { frets: [ 0, 2, 2, 1, 2, 0], fingers: [null, 2, 3, 1, 4, null], rootStr: 0 }, // E6
  { frets: [-1,-1, 0, 2, 0, 2], fingers: [null,null, null, 1, null, 3], rootStr: 2 }, // D6
];

var m6Shapes = [
  { frets: [-1, 0, 2, 2, 1, 2], fingers: [null, null, 2, 3, 1, 4], rootStr: 1 }, // Am6
  { frets: [ 0, 2, 2, 0, 1, 0], fingers: [null, 2, 3, null, 1, null], rootStr: 0 }, // Em6
];

var fiveShapes = [
  { frets: [-1, 0, 2, 2, 0, 0], fingers: [null, null, 1, 3, null, null], rootStr: 1 }, // A5
  { frets: [ 0, 2, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null], rootStr: 0 }, // E5
  { frets: [-1,-1, 0, 2, 3, 0], fingers: [null,null, null, 1, 3, null], rootStr: 2 }, // D5
  { frets: [ 3, 5, 5, 0, 0, 0], fingers: [ 1, 2, 3, null, null, null], rootStr: 0 }, // G5
];

var dom7sus2Shapes = [
  { frets: [-1, 0, 2, 0, 0, 0], fingers: [null, null, 1, null, null, null], rootStr: 1 }, // A7sus2
  { frets: [-1,-1, 0, 2, 1, 0], fingers: [null,null, null, 2, 1, null], rootStr: 2 }, // D7sus2
];

var maj9Shapes = [
  { frets: [ 0, 2, 1, 1, 0, 2], fingers: [null, 2, 1, 1, null, 3], rootStr: 0 }, // Emaj9
  { frets: [-1, 0, 2, 4, 2, 4], fingers: [null, null, 1, 3, 1, 4], rootStr: 1 }, // Amaj9
];

var m9Shapes = [
  { frets: [ 0, 2, 0, 0, 0, 2], fingers: [null, 2, null, null, null, 3], rootStr: 0 }, // Em9
  { frets: [-1, 0, 2, 4, 1, 3], fingers: [null, null, 1, 4, 2, 3], rootStr: 1 }, // Am9
];

var dom9Shapes = [
  { frets: [ 0, 2, 0, 1, 0, 2], fingers: [null, 2, null, 1, null, 3], rootStr: 0 }, // E9
  { frets: [-1, 0, 2, 0, 2, 0], fingers: [null, null, 1, null, 3, null], rootStr: 1 }, // A9
];

var add9Shapes = [
  { frets: [ 0, 2, 2, 1, 0, 2], fingers: [null, 2, 3, 1, null, 4], rootStr: 0 }, // Eadd9
  { frets: [-1, 0, 2, 4, 2, 0], fingers: [null, null, 1, 3, 1, null], rootStr: 1 }, // Aadd9
];

var madd9Shapes = [
  { frets: [ 0, 2, 4, 0, 0, 2], fingers: [null, 1, 3, null, null, 4], rootStr: 0 }, // Emadd9
  { frets: [-1, 0, 2, 4, 1, 0], fingers: [null, null, 1, 3, 2, null], rootStr: 1 }, // Amadd9
];

var add11Shapes = [
  { frets: [-1, 0, 2, 2, 3, 0], fingers: [null, null, 1, 1, 4, null], rootStr: 1 }, // Aadd11
  { frets: [-1,-1, 0, 2, 3, 3], fingers: [null,null, null, 1, 2, 3], rootStr: 2 }, // Dadd11
];

// Map chord type to its shape collection
var shapeDB = {
  '':       majorShapes,
  'm':      minorShapes,
  'dim':    dimShapes,
  'aug':    augShapes,
  'maj7':   maj7Shapes,
  'm7':     m7Shapes,
  '7':      dom7Shapes,
  'dim7':   dim7Shapes,
  'mM7':    mM7Shapes,
  'aug7':   aug7Shapes,
  'm7b5':   m7b5Shapes,
  'sus2':   sus2Shapes,
  'sus4':   sus4Shapes,
  '7sus2':  dom7sus2Shapes,
  '7sus4':  dom7sus4Shapes,
  '6':      sixShapes,
  'm6':     m6Shapes,
  '5':      fiveShapes,
  'maj9':   maj9Shapes,
  'm9':     m9Shapes,
  '9':      dom9Shapes,
  'add9':   add9Shapes,
  'madd9':  madd9Shapes,
  'add11':  add11Shapes,
};

// For chord types without explicit shapes, derive from major shapes
function deriveShape(majorShape, intervals) {
  // We need to modify the major shape to match the target intervals
  // This is complex, so we use the algorithmic fallback instead
  return null;
}

// ── Voicing selection ──

// For each shape, compute which root note ID it naturally produces
function shapeNativeRoot(shape) {
  // The root is on rootStr string. Find which noteId is at fret shape.frets[rootStr]
  var strMidi = chordTuning[5 - shape.rootStr].midiBase; // convert to high-to-low index
  // Actually our chordTuning is high-to-low, shapes are low-to-high
  // Low E = index 5 in high-to-low = index 5, midiBase 40
  // A = index 4, midiBase 45
  // D = index 3, midiBase 50
  // G = index 2, midiBase 55
  // B = index 1, midiBase 59
  // high e = index 0, midiBase 64

  var hiIdx = 5 - shape.rootStr; // convert low-to-high index to high-to-low
  var midiBase;
  switch (shape.rootStr) {
    case 0: midiBase = 40; break; // low E
    case 1: midiBase = 45; break; // A
    case 2: midiBase = 50; break; // D
    case 3: midiBase = 55; break; // G
    case 4: midiBase = 59; break; // B
    case 5: midiBase = 64; break; // high e
  }

  var fret = shape.frets[shape.rootStr];
  if (fret < 0) return -1;
  return chordNoteId(midiBase + fret);
}

// Score a shape for selection (lower is better)
function shapeQuality(shape) {
  var minF = Infinity, maxF = -Infinity, openStrings = 0, mutedLow = 0;
  for (var i = 0; i < 6; i++) {
    var f = shape.frets[i];
    if (f === 0) openStrings++;
    else if (f > 0) {
      if (f < minF) minF = f;
      if (f > maxF) maxF = f;
    }
    // Count muted strings at the bottom
    if (f === -1 && i <= 2) mutedLow++;
  }
  if (minF === Infinity) minF = 0;
  if (maxF === -Infinity) maxF = 0;
  var span = maxF - minF;
  // Lower score = better: prefer open strings, low position, small span
  return minF * 8 - openStrings * 6 + span * 2 + mutedLow * 3;
}

// Select best shape for a given root note and chord type
function selectShape(rootNoteId, chordTypeId) {
  var shapes = shapeDB[chordTypeId];
  if (!shapes) return null;

  var bestShape = null;
  var bestScore = Infinity;

  for (var s = 0; s < shapes.length; s++) {
    var nativeRoot = shapeNativeRoot(shapes[s]);
    if (nativeRoot < 0) continue;
    var semitones = (rootNoteId - nativeRoot + 12) % 12;
    var transposed = transposeShape(shapes[s], semitones);
    var score = shapeQuality(transposed);
    if (score < bestScore) {
      bestScore = score;
      bestShape = transposed;
    }
  }

  return bestShape;
}

// Algorithmic fallback for chord types without explicit shapes
function computeVoicingFallback(rootNoteId, intervals, bassNoteId) {
  var chordSet = {};
  intervals.forEach(function(iv) { chordSet[mod(rootNoteId + iv, 12)] = true; });

  var perString = []; // high-to-low
  for (var s = 0; s < chordTuning.length; s++) {
    var opts = [];
    for (var f = 0; f <= 15; f++) {
      var nid = chordNoteId(chordTuning[s].midiBase + f);
      if (chordSet[nid]) {
        opts.push({ fret: f, noteId: nid, isRoot: nid === rootNoteId });
      }
    }
    perString.push(opts);
  }

  var bestScore = -Infinity;
  var bestResult = { frets: [-1,-1,-1,-1,-1,-1], fingers: [null,null,null,null,null,null], baseFret: 0, rootStr: -1 };

  for (var baseFret = 0; baseFret <= 10; baseFret++) {
    var maxFret = baseFret + 4;
    var filtered = [];
    for (var s2 = 0; s2 < perString.length; s2++) {
      var inWindow = [];
      for (var o = 0; o < perString[s2].length; o++) {
        var opt = perString[s2][o];
        if (opt.fret >= baseFret && opt.fret <= maxFret) inWindow.push(opt);
        if (opt.fret === 0 && baseFret <= 1) {
          if (!inWindow.some(function(x) { return x.fret === 0; })) inWindow.push(opt);
        }
      }
      filtered.push(inWindow);
    }

    var stringsWithOptions = 0;
    for (var s3 = 0; s3 < filtered.length; s3++) {
      if (filtered[s3].length > 0) stringsWithOptions++;
    }
    if (stringsWithOptions < 3) continue;

    var combos = generateCombinations(filtered);
    for (var c = 0; c < combos.length; c++) {
      var score = scoreVoicing(combos[c], rootNoteId, bassNoteId, intervals, baseFret);
      if (score > bestScore) {
        bestScore = score;
        // Convert high-to-low combo to low-to-high frets
        var loFrets = [-1,-1,-1,-1,-1,-1];
        var loFingers = [null,null,null,null,null,null];
        var rootStr = -1;
        for (var i = 0; i < 6; i++) {
          var lo = 5 - i; // high-to-low → low-to-high
          if (combos[c][i] !== null) {
            loFrets[lo] = combos[c][i].fret;
            if (combos[c][i].isRoot && rootStr < 0) rootStr = lo;
          }
        }
        if (rootStr < 0) {
          for (var j = 0; j < 6; j++) {
            if (loFrets[j] >= 0) { rootStr = j; break; }
          }
        }
        bestResult = { frets: loFrets, fingers: loFingers, baseFret: baseFret, rootStr: rootStr };
      }
    }
  }
  return bestResult;
}

// Already defined in prev version — reusing
function generateCombinations(perString) {
  var results = [[]];
  for (var s = 0; s < perString.length; s++) {
    var next = [];
    var opts = perString[s];
    for (var r = 0; r < results.length; r++) {
      var muted = results[r].slice();
      muted.push(null);
      next.push(muted);
      for (var o = 0; o < opts.length; o++) {
        var used = results[r].slice();
        used.push(opts[o]);
        next.push(used);
      }
    }
    if (next.length > 600) {
      next.sort(function(a, b) { return quickScore(b) - quickScore(a); });
      next = next.slice(0, 500);
    }
    results = next;
  }
  return results;
}

function quickScore(partial) {
  var used = 0, gaps = 0, hasRoot = false;
  var firstUsed = -1, lastUsed = -1;
  for (var i = 0; i < partial.length; i++) {
    if (partial[i] !== null) {
      used++;
      if (firstUsed < 0) firstUsed = i;
      lastUsed = i;
      if (partial[i].isRoot) hasRoot = true;
    }
  }
  for (var j = firstUsed + 1; j <= lastUsed; j++) {
    if (partial[j] === null && partial[j-1] !== null) gaps++;
  }
  return used * 10 + (hasRoot ? 5 : 0) - gaps * 3;
}

function scoreVoicing(combo, rootNoteId, bassNoteId, intervals, baseFret) {
  var usedStrings = 0, uniqueNotes = {};
  var minFret = Infinity, maxFret = -Infinity;
  var firstUsed = -1, lastUsed = -1;
  var hasRoot = false, bassNote = null;
  var gapCount = 0;

  for (var i = 0; i < combo.length; i++) {
    if (combo[i] !== null) {
      if (firstUsed < 0) firstUsed = i;
      lastUsed = i;
      usedStrings++;
      uniqueNotes[combo[i].noteId] = true;
      if (combo[i].isRoot) hasRoot = true;
      if (combo[i].fret < minFret) minFret = combo[i].fret;
      if (combo[i].fret > maxFret) maxFret = combo[i].fret;
      bassNote = combo[i].noteId; // last = lowest string
    }
  }
  for (var j = firstUsed + 1; j <= lastUsed; j++) {
    if (combo[j] === null && combo[j-1] !== null) gapCount++;
    if (combo[j] !== null && combo[j-1] === null) gapCount++;
  }
  var mutedHigh = firstUsed > 0;
  if (usedStrings < 3) return -1000;
  if (maxFret - minFret > 4) return -1000;
  if (bassNoteId >= 0 && bassNote !== bassNoteId) return -2000;

  var span = maxFret - minFret;
  var uniCount = Object.keys(uniqueNotes).length;
  var target = intervals.length;

  var score = 0;
  score += usedStrings * 10;
  score += uniCount * 8;
  score += (hasRoot ? 10 : 0);
  score -= span * 3;
  score -= gapCount * 6;
  score -= mutedHigh ? 4 : 0;
  if (bassNote === rootNoteId) score += 3;
  score -= baseFret * 2.5;
  // Open string bonus
  var openCount = 0;
  for (var k = 0; k < combo.length; k++) {
    if (combo[k] && combo[k].fret === 0) openCount++;
  }
  score += openCount * 5;
  score -= (target - uniCount) * 15;
  if (uniCount >= target) score += 5;
  return score;
}

// ── Build all voicings ──

function buildAllVoicings() {
  var cache = {};
  for (var root = 0; root < 12; root++) {
    cache[root] = {};
    for (var t = 0; t < chordTypeDefs.length; t++) {
      var ct = chordTypeDefs[t];
      var shape = selectShape(root, ct.id);
      var data;
      if (shape) {
        data = {
          frets: shape.frets,
          fingers: shape.fingers,
          baseFret: shape.baseFret,
          rootStr: shape.rootStr,
          rootId: root,
          intervals: ct.intervals,
          name: ct.name,
          bassNote: -1
        };
      } else {
        // Algorithmic fallback — convert result to low-to-high format
        var fallback = computeVoicingFallback(root, ct.intervals, -1);
        data = {
          frets: fallback.frets,
          fingers: fallback.fingers,
          baseFret: fallback.baseFret,
          rootStr: fallback.rootStr,
          rootId: root,
          intervals: ct.intervals,
          name: ct.name,
          bassNote: -1
        };
      }
      cache[root][ct.id] = data;
    }
    // Slash chords
    for (var s = 0; s < slashChordDefs.length; s++) {
      var sc = slashChordDefs[s];
      var bassId = mod(root + sc.bassInterval, 12);
      var shape2 = selectShape(root, '');
      var bf2 = 0;
      if (shape2) {
        // Use major shape but ensure bass note is the slash note
        // For simplicity, just use the major shape; bass note constraint is for display
        var fb = computeVoicingFallback(root, [0,4,7], bassId);
        cache[root][sc.id] = {
          frets: fb.frets,
          fingers: fb.fingers,
          baseFret: fb.baseFret,
          rootStr: fb.rootStr,
          rootId: root,
          intervals: [0,4,7],
          name: '',
          bassNote: bassId
        };
      } else {
        cache[root][sc.id] = cache[root][''];
      }
    }
  }
  return cache;
}

var allChordVoicings = buildAllVoicings();
var ChordDb_loaded = true;
