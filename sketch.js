let baseShapes = [];   // master unique tiles (objects)
let shapes = [];       // runtime array (base tiles first, clones appended)
let groups = [];       // 18 groups arrays of baseShapes references
let nextClickIndex = 0;
let resetButton;
let buildArea;
let scaleFactor = 1;

// --- DESIGN / layout settings
const DESIGN_W = 1600;
const DESIGN_H = 1400;
const CATEGORY_COUNT = 18;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  rectMode(CORNER);
  noStroke();

  createBaseShapesFromFullList();
  categorizeBaseShapes();
  calculateScale();
  layoutGroups();

  // shapes initially are copies of baseShapes (so we can push clones later)
  shapes = baseShapes.map(b => ({ ...b }));

  // reset button
  resetButton = createButton("🔄 Reset");
  resetButton.style("font-size", "18px");
  resetButton.mousePressed(resetShapes);
  positionResetButton();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateScale();
  layoutGroups();
  // refresh runtime shapes (keep clones removed on resize)
  // ensure baseShapes remain first in shapes
  shapes = baseShapes.map(b => ({ ...b }));
  positionResetButton();
}

function positionResetButton() {
  resetButton.position(width * 0.86, buildArea.y + buildArea.h + 12);
}

// ---- helper scale functions (uniform)
function calculateScale() {
  scaleFactor = min(windowWidth / DESIGN_W, windowHeight / DESIGN_H);
  // setup buildArea relative to scaled design
  const margin = 0.05 * width;
  buildArea = {
    x: margin,
    y: 0.03 * height,
    w: width - margin * 2,
    h: constrain(120 * scaleFactor, 80, 200)
  };
}

// --- FULL master label list (collated from your provided tiles)
// keep duplicates in source, will be deduped preserving order
function createBaseShapesFromFullList() {
  const raw = [
    // single letters a-m
    "a","b","c","d","e","f","g","h","i","j","k","l","m",
    // n-z
    "n","o","p","q","r","s","t","u","v","w","x","y","z",

    // clusters and digraphs from your list
    "ch","sh","th","wh","qu","-ck","-s","-ff","-ll","-ss","-zz",
    "-ing","-ang","-ong","-ung","-ink","-ank","-onk","-unk",
    "bl-","cl-","fl-","gl-","pl-","sl-",
    "br-","cr-","dr-","fr-","gr-","pr-","tr-",
    "sc-","sk-","sm-","sn-","sp-","st-",
    "scr-","shr-","spl-","spr-","squ-","str-","thr-",
    "dw-","sw-","tw-",
    // endings / final clusters
    "-ld","-lf","-lk","-lp","-lt","-ct","-ft","-nt","-pt","-st","-xt","-mp","-nd","-sk","-sp","-nch","-tch","-dge",

    // vowel teams (many)
    "ai","ea","oa","-ay","ee","-oe","ou","ow","oi","-oy","au","aw","oo","eigh","ei","-ew","-ey","ie","igh","-ue","ui","oe","augh","ough",

    // magic-e / starred
    "*e","a_e","e_e","i_e","o_e","u_e","y_e",

    // r-controlled and similar
    "er","ir","ur","ar","or","war","wor",

    // prefixes (prefix list)
    "un-","sub-","con-","in-","mis-","de-","re-","pro-","pre-","be-",

    // suffixes (common)
    "-es","-less","-ness","-ment","-ful","-ish","-en","-tion","-sion","-ed","-ic","-ing",

    // y-endings & odd endings
    "-by","-vy","-zy","-ky","-ly","-ny","-dy","-fy","-py","-sy","-ty",
    // other endings / patterns
    "-ild","-old","-olt","-ind","-ble","-cle","-dle","-fle","-gle","-kle","-ple","-tle","-zle",
    "dw-","sw-","tw-","ph","kn-","gn","wr-","-mb","-mn",
    "ai","ea","oa","ee","ie","oo","igh","eigh","ough","augh","ei","-ew","-ey","ie","-ue","ui","au","aw",
    // some repeats & additional items from your list
    "-s","-ff","-ll","-ss","-zz","-ck","tch","-dge","-nch","-oy","-oy","-oe"
  ];

  // dedupe preserving order
  const seen = new Set();
  const uniq = [];
  for (let t of raw) {
    if (!seen.has(t)) {
      seen.add(t);
      uniq.push(t);
    }
  }

  baseShapes = uniq.map(lbl => {
    return {
      label: lbl,
      w: 70, h: 44,           // base tile size (will be adjusted in layout)
      x: 0, y: 0,
      homeX: 0, homeY: 0,
      targetX: 0, targetY: 0,
      color: "white",
      originalColor: "white",
      isBase: true,
      inBox: false,
      scale: 1,
      targetScale: 1,
      clickIndex: null,
      groupIndex: null
    };
  });
}

// --- categorizer: map each label into one of 18 groups
function categorizeBaseShapes() {
  // prepare sets / lists for exact matching
  const singleLetters = new Set("abcdefghijklmnopqrstuvwxyz".split(""));
  const digraphs = new Set(["ch","sh","th","wh","qu","ph","tch","dge","-ck","-ff","-ll","-ss","-zz","gn","kn-","wr-","-mb","-mn"]);
  const lBlends = new Set(["bl-","cl-","fl-","gl-","pl-","sl-"]);
  const rBlends = new Set(["br-","cr-","dr-","fr-","gr-","pr-","tr-"]);
  const sBlends = new Set(["sc-","sk-","sm-","sn-","sp-","st-"]);
  const threeLetter = new Set(["scr-","shr-","spl-","spr-","squ-","str-","thr-"]);
  const wBlends = new Set(["dw-","sw-","tw-"]);
  const vowelTeam1 = new Set(["ai","ea","oa","-ay","ee","-oe","ou","ow","oi","-oy","igh","oo","au","aw","oy","oe"]);
  const vowelTeam2 = new Set(["eigh","ei","-ew","-ey","ie","ough","-ue","ui","au","aw","oe","augh","ei"]);
  const rControl = new Set(["er","ir","ur","ar","or","war","wor"]);
  const ngnk = new Set(["-ing","-ang","-ong","-ung","-ink","-ank","-onk","-unk"]);
  const finalClusters = new Set(["-ld","-lf","-lk","-lp","-lt","-ct","-ft","-nt","-pt","-st","-xt","-mp","-nd","-sk","-sp","-nch","-tch","-dge"]);
  const prefixes = new Set(["un-","sub-","con-","in-","mis-","de-","re-","pro-","pre-","be-"]);
  const suffixes = new Set(["-es","-less","-ness","-ment","-ful","-ish","-en","-tion","-sion","-ed","-ic","-ing"]);
  const magicE = new Set(["*e","a_e","e_e","i_e","o_e","u_e","y_e"]);
  const yEndings = new Set(["-by","-vy","-zy","-ky","-ly","-ny","-dy","-fy","-py","-sy","-ty"]);
  const leSyllables = new Set(["-ble","-cle","-dle","-fle","-gle","-kle","-ple","-tle","-zle"]);
  const oddballs = new Set(["y","-ild","-old","-olt","-ind","augh","ough"]);

  // initialize groups arrays
  groups = [];
  for (let i = 0; i < CATEGORY_COUNT; i++) groups.push([]);

  // assign each base shape
  for (let s of baseShapes) {
    const lbl = s.label.toLowerCase();

    let g = null;

    // 1 Single letters
    if (singleLetters.has(lbl)) g = 0;

    // 2 Digraphs
    else if (digraphs.has(lbl.replace('-', ''))) g = 1;

    // 3 L blends
    else if (lBlends.has(lbl)) g = 2;

    // 4 R blends
    else if (rBlends.has(lbl)) g = 3;

    // 5 S blends
    else if (sBlends.has(lbl)) g = 4;

    // 6 3-letter blends
    else if (threeLetter.has(lbl)) g = 5;

    // 7 W blends
    else if (wBlends.has(lbl)) g = 6;

    // 8 vowel teams group 1
    else if (vowelTeam1.has(lbl.replace('-', '').replace('_',''))) g = 7;

    // 9 vowel teams group 2 (long/odd)
    else if (vowelTeam2.has(lbl.replace('-', '').replace('_',''))) g = 8;

    // 10 r-controlled
    else if (rControl.has(lbl.replace('-', ''))) g = 9;

    // 11 -ng / -nk family
    else if (ngnk.has(lbl)) g = 10;

    // 12 final consonant clusters
    else if (finalClusters.has(lbl)) g = 11;

    // 13 prefixes
    else if (prefixes.has(lbl)) g = 12;

    // 14 suffixes
    else if (suffixes.has(lbl)) g = 13;

    // 15 magic-e
    else if (magicE.has(lbl)) g = 14;

    // 16 y-endings
    else if (yEndings.has(lbl)) g = 15;

    // 17 oddballs & misc (catch)
    else if (oddballs.has(lbl)) g = 16;

    // 18 -le syllables
    else if (leSyllables.has(lbl)) g = 17;

    // fallback heuristics if still null
    if (g === null) {
      if (lbl.startsWith("bl")||lbl.startsWith("cl")||lbl.startsWith("fl")||lbl.startsWith("gl")||lbl.startsWith("pl")||lbl.startsWith("sl")) g = 2;
      else if (lbl.startsWith("br")||lbl.startsWith("cr")||lbl.startsWith("dr")||lbl.startsWith("fr")||lbl.startsWith("gr")||lbl.startsWith("pr")||lbl.startsWith("tr")) g = 3;
      else if (lbl.startsWith("sc")||lbl.startsWith("sk")||lbl.startsWith("sm")||lbl.startsWith("sn")||lbl.startsWith("sp")||lbl.startsWith("st")) g = 4;
      else if (lbl.includes("ing") || lbl.includes("tion") || lbl.startsWith("-") || lbl.endsWith("-")) g = 13;
      else g = 16;
    }

    s.groupIndex = g;
    groups[g].push(s);
  }

  // assign colors per rule: vowels and vowel-teams (groups 0 single vowels + 7 & 8 vowel teams) = lightyellow
  // prefixes (12) and suffixes (13) = lightgreen
  for (let s of baseShapes) {
    const g = s.groupIndex;
    // single-letter vowels (group 0 but only a,e,i,o,u,y)
    if (g === 0 && /^(a|e|i|o|u|y)$/.test(s.label.toLowerCase())) {
      s.originalColor = 'lightyellow';
    }
    // vowel team groups
    else if (g === 7 || g === 8) {
      s.originalColor = 'lightyellow';
    }
    // magic-e patterns also vowel-related -> yellow
    else if (g === 14) {
      s.originalColor = 'lightyellow';
    }
    // prefixes / suffixes green
    else if (g === 12 || g === 13) {
      s.originalColor = 'lightgreen';
    } else {
      s.originalColor = 'white';
    }
    s.color = s.originalColor;
  }
}

// --- layout: center each group in its own block; groups stack vertically with spacing
function layoutGroups() {
  calculateScale();

  const rowPlan = [
    [0, 1],             
    [2, 3, 4],          
    [7, 8],             
    [12, 13],           
    [5, 6, 9, 10, 11, 14, 15, 16, 17]
  ];

  const top = buildArea.y + buildArea.h + 30 * scaleFactor;
  const rowGap = max(35 * scaleFactor, height * 0.03);
  const blockGap = 70 * scaleFactor;

  const availableW = width * 0.9;
  const leftMargin = (width - availableW) / 2;

  const baseTileW = constrain(floor(70 * scaleFactor), 40, 140);
  const baseTileH = constrain(floor(44 * scaleFactor), 28, 80);
  const tileGap = max(8 * scaleFactor, 6);

  let y = top;

  for (let row of rowPlan) {
    let blocks = [];
    let totalRowWidth = 0;

    // --- First pass: compute each block width ---
    for (let gi of row) {
      const items = groups[gi] || [];

      const maxCols = max(1, floor((availableW * 0.9 + tileGap) / (baseTileW + tileGap)));
      const cols = min(items.length, maxCols);
      const rowsNeeded = items.length ? ceil(items.length / cols) : 0;

      const width = cols > 0 ? cols * baseTileW + (cols - 1) * tileGap : 0;
      const height = rowsNeeded * (baseTileH + tileGap) - tileGap;

      blocks.push({ gi, items, width, height, rows: rowsNeeded });
      totalRowWidth += width;
    }

    totalRowWidth += blockGap * (row.length - 1);

    let startX = leftMargin + (availableW - totalRowWidth) / 2;
    let blockX = startX;

    // --- Second pass: draw blocks + place tiles ---
    for (let block of blocks) {
      const { items, width, height, rows } = block;

      // --- Draw border around this block ---
      if (items.length > 0) {
        stroke(200);
        strokeWeight(2);
        noFill();
        rect(
          blockX - 10 * scaleFactor,
          y - 10 * scaleFactor,
          width + 20 * scaleFactor,
          height + 20 * scaleFactor,
          10 * scaleFactor
        );
      }

      // --- Place tiles inside block ---
      if (items.length > 0) {
        const maxCols = max(1, floor((availableW * 0.9 + tileGap) / (baseTileW + tileGap)));
        const cols = min(items.length, maxCols);
        const rowsNeeded = ceil(items.length / cols);

        let idx = 0;
        for (let r = 0; r < rowsNeeded; r++) {
          const countInRow = min(cols, items.length - r * cols);
          const rowWidth = countInRow * baseTileW + (countInRow - 1) * tileGap;
          const rowStartX = blockX + (width - rowWidth) / 2;

          for (let c = 0; c < countInRow; c++) {
            const s = items[idx++];

            s.w = baseTileW;
            s.h = baseTileH;
            s.homeX = rowStartX + c * (baseTileW + tileGap);
            s.homeY = y + r * (baseTileH + tileGap);
            s.x = s.homeX;
            s.y = s.homeY;
            s.targetX = s.homeX;
            s.targetY = s.homeY;
            s.scale = 1;
            s.targetScale = 1;
            s.color = s.originalColor;
            s.inBox = false;
            s.isBase = true;
          }
        }
      }

      blockX += width + blockGap;
    }

    const tallestRows = max(...blocks.map(b => b.rows));
    const tallestHeight = tallestRows * (baseTileH + tileGap);
    y += tallestHeight + rowGap;
  }

  shapes = baseShapes.map(b => ({ ...b }));
}

function draw() {
  background(245);

  // build area
  stroke(180);
  fill(255);
  rect(buildArea.x, buildArea.y, buildArea.w, buildArea.h, 12 * scaleFactor);

  // hint text
  const inBox = shapes.filter(s => s.inBox);
  if (inBox.length === 0) {
    noStroke();
    fill(40);
    textSize(min(24 * scaleFactor, 24));
    text("🧱 Click letters to build a word", buildArea.x + buildArea.w / 2, buildArea.y + buildArea.h / 2);
  }

  // animate tiles
  for (let s of shapes) {
    s.x = lerp(s.x, s.targetX, 0.15);
    s.y = lerp(s.y, s.targetY, 0.15);
    s.scale = lerp(s.scale === undefined ? 1 : s.scale, s.targetScale === undefined ? 1 : s.targetScale, 0.15);
  }

  // draw shapes (base + clones)
  for (let s of shapes) {
    fill(s.color || "white");
    stroke(200);
    rect(s.x, s.y, s.w * s.scale, s.h * s.scale, 8 * scaleFactor);
    noStroke();
    fill(0);
    textSize(s.inBox ? min(48 * scaleFactor, s.h * 0.9) : min(20 * scaleFactor, s.h * 0.6));
    text(s.label, s.x + (s.w * s.scale) / 2, s.y + (s.h * s.scale) / 2);
  }

  // arrange in box if needed
  arrangeShapesInBox();

// --- click handling (topmost-first)
function mousePressed() {
  for (let i = shapes.length - 1; i >= 0; i--) {
    const s = shapes[i];
    const sw = s.w * (s.scale || 1);
    const sh = s.h * (s.scale || 1);
    if (mouseX > s.x && mouseX < s.x + sw && mouseY > s.y && mouseY < s.y + sh) {
      if (s.isBase) {
        // create clone (inBox)
        const clone = {
          label: s.label,
          w: s.w, h: s.h,
          x: s.homeX,
          y: s.homeY,
          homeX: s.homeX, homeY: s.homeY,
          targetX: s.homeX, targetY: s.homeY,
          color: 'lightyellow', // will be kept for vowels; arrangeShapesInBox may set
          originalColor: s.originalColor,
          isBase: false,
          inBox: true,
          scale: 1,
          targetScale: 1.5,
          clickIndex: nextClickIndex++
        };
        shapes.push(clone);
        arrangeShapesInBox();
        return;
      } else {
        // remove clone
        shapes.splice(i, 1);
        arrangeShapesInBox();
        return;
      }
    }
  }
}

// --- arrange clicked shapes into build area (preserve click order)
function arrangeShapesInBox() {
  const inBox = shapes.filter(s => s.inBox).sort((a, b) => a.clickIndex - b.clickIndex);

  if (inBox.length === 0) {
    // return base tiles to home
    for (let s of shapes) {
      if (s.isBase) {
        s.targetX = s.homeX;
        s.targetY = s.homeY;
        s.targetScale = 1;
        s.color = s.originalColor;
      }
    }
    return;
  }

  // compute fit width inside buildArea
  const spacing = max(8 * scaleFactor, 8);
  // letter width target: try to fit reasonably
  const maxLetterW = min(160 * scaleFactor, buildArea.w / max(1, inBox.length) * 0.9);
  const letterW = max(40 * scaleFactor, maxLetterW);
  const totalW = inBox.length * letterW + (inBox.length - 1) * spacing;
  let startX = buildArea.x + (buildArea.w - totalW) / 2;
  const centerY = buildArea.y + buildArea.h / 2;

  let x = startX;
  for (let t of inBox) {
    t.targetX = x;
    t.targetY = centerY - (t.h * t.targetScale || t.h * 1.5) / 2;
    // ensure clones color follow vowel/prefix/suffix rules
    // find base originalColor if exists
    const base = baseShapes.find(b => b.label === t.label);
    if (base) {
      // if base originalColor exists, use it for clone background
      t.color = (base.originalColor === 'lightgreen' || base.originalColor === 'lightyellow') ? base.originalColor : 'lightyellow';
    } else {
      t.color = 'lightyellow';
    }
    t.targetScale = min(2.0, (buildArea.h / t.h) * 0.9);
    x += letterW + spacing;
  }

  // base tiles return to home
  for (let s of shapes) {
    if (s.isBase) {
      s.targetX = s.homeX;
      s.targetY = s.homeY;
      s.targetScale = 1;
      s.color = s.originalColor;
    }
  }
}

// --- word composition (ordered by clickIndex)
function getCurrentWord() {
  return shapes
    .filter(s => s.inBox)
    .sort((a, b) => a.clickIndex - b.clickIndex)
    .map(s => s.label)
    .join("");
}

// --- reset
function resetShapes() {
  // remove clones, keep base shapes
  shapes = baseShapes.map(b => ({ ...b }));
  nextClickIndex = 0;
  // restore visual properties
  for (let s of shapes) {
    s.inBox = false;
    s.color = s.originalColor;
    s.scale = 1;
    s.targetScale = 1;
    s.clickIndex = null;
    s.x = s.homeX;
    s.y = s.homeY;
    s.targetX = s.homeX;
    s.targetY = s.homeY;
  }
}
