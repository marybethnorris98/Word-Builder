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
  shapes = baseShapes.map(b => ({ ...b }));
  positionResetButton();
}

function positionResetButton() {
  resetButton.position(width * 0.86, buildArea.y + buildArea.h + 12);
}

// ---- helper scale functions (uniform)
function calculateScale() {
  scaleFactor = min(windowWidth / DESIGN_W, windowHeight / DESIGN_H);
  const margin = 0.05 * width;
  buildArea = {
    x: margin,
    y: 0.03 * height,
    w: width - margin * 2,
    h: constrain(120 * scaleFactor, 80, 200)
  };
}
function createBaseShapesFromFullList() {
  const raw = [
    // single letters a–z
    "a","b","c","d","e","f","g","h","i","j","k","l","m",
    "n","o","p","q","r","s","t","u","v","w","x","y","z",

    // digraphs, blends, clusters
    "ch","sh","th","wh","qu","-ck","-s","-ff","-ll","-ss","-zz",
    "-ing","-ang","-ong","-ung","-ink","-ank","-onk","-unk",
    "bl-","cl-","fl-","gl-","pl-","sl-",
    "br-","cr-","dr-","fr-","gr-","pr-","tr-",
    "sc-","sk-","sm-","sn-","sp-","st-",
    "scr-","shr-","spl-","spr-","squ-","str-","thr-",
    "dw-","sw-","tw-",

    // final clusters
    "-ld","-lf","-lk","-lp","-lt","-ct","-ft","-nt","-pt","-st","-xt",
    "-mp","-nd","-sk","-sp","-nch","-tch","-dge",

    // vowel teams
    "ai","ea","oa","-ay","ee","-oe","ou","ow","oi","-oy","au","aw",
    "oo","eigh","ei","-ew","-ey","ie","igh","-ue","ui","oe","augh","ough",

    // magic-e
    "*e","a_e","e_e","i_e","o_e","u_e","y_e",

    // r-controlled
    "er","ir","ur","ar","or","war","wor",

    // prefixes
    "un-","sub-","con-","in-","mis-","de-","re-","pro-","pre-","be-",

    // suffixes
    "-es","-less","-ness","-ment","-ful","-ish","-en","-tion","-sion",
    "-ed","-ic","-ing",

    // y-endings
    "-by","-vy","-zy","-ky","-ly","-ny","-dy","-fy","-py","-sy","-ty",

    // -le patterns
    "-ble","-cle","-dle","-fle","-gle","-kle","-ple","-tle","-zle",

    // oddballs and repeats
    "ph","kn-","gn","wr-","-mb","-mn",
    "ai","ea","oa","ee","ie","oo","igh","eigh","ough","augh","ei",
    "-ew","-ey","ie","-ue","ui","au","aw",
    "-s","-ff","-ll","-ss","-zz","-ck","tch","-dge","-nch","-oy","-oy","-oe"
  ];

  const seen = new Set();
  const uniq = [];
  for (let t of raw) {
    if (!seen.has(t)) {
      seen.add(t);
      uniq.push(t);
    }
  }
  baseShapes = uniq.map(lbl => ({
    label: lbl,
    w: 70, h: 44,
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
  }));
}
function categorizeBaseShapes() {
  const singleLetters = new Set("abcdefghijklmnopqrstuvwxyz".split(""));
  const digraphs = new Set(["ch","sh","th","wh","qu","ph","tch","dge","ck","ff","ll","ss","zz","gn","kn","wr","mb","mn"]);
  const lBlends = new Set(["bl-","cl-","fl-","gl-","pl-","sl-"]);
  const rBlends = new Set(["br-","cr-","dr-","fr-","gr-","pr-","tr-"]);
  const sBlends = new Set(["sc-","sk-","sm-","sn-","sp-","st-"]);
  const threeLetter = new Set(["scr-","shr-","spl-","spr-","squ-","str-","thr-"]);
  const wBlends = new Set(["dw-","sw-","tw-"]);

  const vowelTeam1 = new Set(["ai","ea","oa","ay","ee","oe","ou","ow",
    "oi","oy","igh","oo","au","aw"]);
  const vowelTeam2 = new Set(["eigh","ei","ew","ey","ie","ough","ue",
    "ui","augh"]);

  const rControl = new Set(["er","ir","ur","ar","or","war","wor"]);
  const ngnk = new Set(["-ing","-ang","-ong","-ung","-ink","-ank","-onk","-unk"]);
  const finalClusters = new Set(["-ld","-lf","-lk","-lp","-lt","-ct","-ft",
    "-nt","-pt","-st","-xt","-mp","-nd","-sk","-sp","-nch","-tch","-dge"]);

  const prefixes = new Set(["un-","sub-","con-","in-","mis-","de-","re-",
    "pro-","pre-","be-"]);

  const suffixes = new Set(["-es","-less","-ness","-ment","-ful","-ish","-en",
    "-tion","-sion","-ed","-ic","-ing"]);

  const magicE = new Set(["*e","a_e","e_e","i_e","o_e","u_e","y_e"]);
  const yEndings = new Set(["-by","-vy","-zy","-ky","-ly","-ny","-dy","-fy",
    "-py","-sy","-ty"]);
  const leSyllables = new Set(["-ble","-cle","-dle","-fle","-gle","-kle",
    "-ple","-tle","-zle"]);
  const oddballs = new Set(["y","-ild","-old","-olt","-ind","augh","ough"]);

  groups = Array.from({length: CATEGORY_COUNT}, () => []);

  for (let s of baseShapes) {
    const lbl = s.label.toLowerCase().replace(/_/g, "").replace(/-/g, "");

    let g = null;

    if (singleLetters.has(lbl)) g = 0;
    else if (digraphs.has(lbl)) g = 1;
    else if (lBlends.has(s.label)) g = 2;
    else if (rBlends.has(s.label)) g = 3;
    else if (sBlends.has(s.label)) g = 4;
    else if (threeLetter.has(s.label)) g = 5;
    else if (wBlends.has(s.label)) g = 6;
    else if (vowelTeam1.has(lbl)) g = 7;
    else if (vowelTeam2.has(lbl)) g = 8;
    else if (rControl.has(lbl)) g = 9;
    else if (ngnk.has(s.label)) g = 10;
    else if (finalClusters.has(s.label)) g = 11;
    else if (prefixes.has(s.label)) g = 12;
    else if (suffixes.has(s.label)) g = 13;
    else if (magicE.has(s.label)) g = 14;
    else if (yEndings.has(s.label)) g = 15;
    else if (oddballs.has(s.label)) g = 16;
    else if (leSyllables.has(s.label)) g = 17;
    else g = 16;

    s.groupIndex = g;
    groups[g].push(s);
  }

  // --- colors
  for (let s of baseShapes) {
    const g = s.groupIndex;
    if (g === 0 && /^[aeiouy]$/.test(s.label)) s.originalColor = "lightyellow";
    else if (g === 7 || g === 8 || g === 14) s.originalColor = "lightyellow";
    else if (g === 12 || g === 13) s.originalColor = "lightgreen";
    else s.originalColor = "white";
    s.color = s.originalColor;
  }
}
function layoutGroups() {
  calculateScale();

  const rowPlan = [
  [0],          // Single letters (a-z)
  [1],          // Digraphs

  [2, 3, 4],    // L-blends, R-blends, S-blends

  [7],          // Vowel teams 1
  [8],          // Vowel teams 2

  [12],         // Prefixes
  [13],         // Suffixes

  // Everything else split into two rows
  [5, 6, 9, 10],  
  [11, 14, 15]
  [16, 17]
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

    // --- First pass: measure each block ---
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

    // --- Second pass: draw blocks and position tiles ---
    for (let block of blocks) {
      const { items, width, height, rows } = block;

      // BORDER
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

      // TILE PLACEMENT
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

  // animate
  for (let s of shapes) {
    s.x = lerp(s.x, s.targetX, 0.15);
    s.y = lerp(s.y, s.targetY, 0.15);
    s.scale = lerp(s.scale, s.targetScale, 0.15);
  }

  // draw shapes
  for (let s of shapes) {
    fill(s.color || "white");
    stroke(200);
    rect(s.x, s.y, s.w * s.scale, s.h * s.scale, 8 * scaleFactor);
    noStroke();
    fill(0);
    textSize(s.inBox ? min(48 * scaleFactor, s.h * 0.9) : min(20 * scaleFactor, s.h * 0.6));
    text(s.label, s.x + (s.w * s.scale) / 2, s.y + (s.h * s.scale) / 2);
  }

  arrangeShapesInBox();
}
function mousePressed() {
  for (let i = shapes.length - 1; i >= 0; i--) {
    const s = shapes[i];
    const sw = s.w * s.scale;
    const sh = s.h * s.scale;

    if (mouseX > s.x && mouseX < s.x + sw && mouseY > s.y && mouseY < s.y + sh) {
      if (s.isBase) {
        const clone = {
          label: s.label,
          w: s.w, h: s.h,
          x: s.homeX, y: s.homeY,
          homeX: s.homeX, homeY: s.homeY,
          targetX: s.homeX, targetY: s.homeY,
          color: "lightyellow",
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
        shapes.splice(i, 1);
        arrangeShapesInBox();
        return;
      }
    }
  }
}
function arrangeShapesInBox() {
  const inBox = shapes
    .filter(s => s.inBox)
    .sort((a, b) => a.clickIndex - b.clickIndex);

  if (inBox.length === 0) {
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

  const spacing = max(8 * scaleFactor, 8);
  const maxLetterW = min(160 * scaleFactor, buildArea.w / inBox.length * 0.9);
  const letterW = max(40 * scaleFactor, maxLetterW);
  const totalW = inBox.length * letterW + (inBox.length - 1) * spacing;

  let startX = buildArea.x + (buildArea.w - totalW) / 2;
  const centerY = buildArea.y + buildArea.h / 2;

  let x = startX;
  for (let t of inBox) {
    t.targetX = x;
    t.targetY = centerY - (t.h * t.targetScale) / 2;

    const base = baseShapes.find(b => b.label === t.label);
    if (base) {
  t.color = base.originalColor;   // keep the real category color
} else {
  t.color = 'white';
}
    t.targetScale = min(2.0, (buildArea.h / t.h) * 0.9);

    x += letterW + spacing;
  }

  for (let s of shapes) {
    if (s.isBase) {
      s.targetX = s.homeX;
      s.targetY = s.homeY;
      s.targetScale = 1;
      s.color = s.originalColor;
    }
  }
}
function getCurrentWord() {
  return shapes
    .filter(s => s.inBox)
    .sort((a, b) => a.clickIndex - b.clickIndex)
    .map(s => s.label)
    .join("");
}

function resetShapes() {
  shapes = baseShapes.map(b => ({ ...b }));
  nextClickIndex = 0;
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
