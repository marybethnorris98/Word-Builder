let baseShapes = [];   // master unique tiles (objects)
let shapes = [];       // runtime array (base tiles first, clones appended)
let groups = [];       // CATEGORY_COUNT groups arrays of baseShapes references
let nextClickIndex = 0;
let resetButton;
let buildArea;
let scaleFactor = 1;

// THEME / COLORS
const backgroundColor = "#FAF8F0";          // warm off-white
const buildAreaColor  = "rgba(255,255,255,0.95)"; // slightly translucent white
const tileShadowColor = "rgba(0,0,0,0.12)";  // subtle shadow
const tileCorner = 12;
const tileShadowOffset = 4;

// design reference
const DESIGN_W = 1600;
const DESIGN_H = 1400;
const CATEGORY_COUNT = 18;
const SAFE_MARGIN = 50;   // about 1/2 inch on most screens

// NOTE: disabled font loading for GitHub Pages (CORS-safe)
function preload() {
  // intentionally left blank (avoid loadFont from remote CDN)
}

function setup() {
  // full-window canvas (avoid negative/incorrect sizes on some hosts)
  createCanvas(windowWidth, windowHeight);

  // drawing defaults
  textAlign(CENTER, CENTER);
  rectMode(CORNER);
  noStroke();

  // initial data + layout
  createBaseShapesFromFullList();
  categorizeBaseShapes();
  calculateScale();

  // initial buildArea (positioned inside canvas using SAFE_MARGIN)
  buildArea = {
    x: SAFE_MARGIN,
    y: SAFE_MARGIN,
    w: width - SAFE_MARGIN * 2,
    h: constrain(120 * scaleFactor, 80, 200)
  };

  // reset button (DOM)
  resetButton = createButton("🔄 Reset");
  resetButton.style("font-family", "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial");
  resetButton.style("font-size", "18px");
  resetButton.style("padding", "10px 14px");
  resetButton.style("border-radius", "12px");
  resetButton.style("background", "white");
  resetButton.style("box-shadow", "0 6px 12px rgba(0,0,0,0.06)");
  resetButton.mousePressed(resetShapes);

  layoutGroups();

  // shapes are copies of baseShapes (so runtime clones can be appended)
  shapes = baseShapes.map(b => ({ ...b }));

  positionResetButton();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateScale();

  // rebuild buildArea using new width/height (respect SAFE_MARGIN)
  buildArea.w = width - SAFE_MARGIN * 2;
  buildArea.y = SAFE_MARGIN;
  buildArea.h = constrain(120 * scaleFactor, 80, 200);

  categorizeBaseShapes();
  layoutGroups();
  shapes = baseShapes.map(b => ({ ...b }));
  positionResetButton();
}

function positionResetButton() {
  // position relative to canvas (no extra SAFE_MARGIN offset because we used full-window canvas)
  const btnX = width * 0.86;
  const desiredY = buildArea.y + buildArea.h + 12;
  const btnY = min(desiredY, height - 40);
  resetButton.position(btnX, btnY);
}

function calculateScale() {
  // scale relative to canvas size (not window minus margin)
  scaleFactor = min(width / DESIGN_W, height / DESIGN_H);
}

// -----------------------------
// Base shapes (full list)
// -----------------------------
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

  // remove duplicates while preserving order
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
    color: "#ffffff",
    originalColor: "#ffffff",
    isBase: true,
    inBox: false,
    scale: 1,
    targetScale: 1,
    clickIndex: null,
    groupIndex: null
  }));
}

// -----------------------------
// Categorize
// -----------------------------
function categorizeBaseShapes() {
  const singleLetters = new Set("abcdefghijklmnopqrstuvwxyz".split(""));
  const digraphs = new Set(["ch","sh","th","wh","qu","ph","tch","dge","ck","ff","ll","ss","zz","gn","kn","wr","mb","mn"]);
  const lBlends = new Set(["bl-","cl-","fl-","gl-","pl-","sl-"]);
  const rBlends = new Set(["br-","cr-","dr-","fr-","gr-","pr-","tr-"]);
  const sBlends = new Set(["sc-","sk-","sm-","sn-","sp-","st-"]);
  const threeLetter = new Set(["scr-","shr-","spl-","spr-","squ-","str-","thr-"]);
  const wBlends = new Set(["dw-","sw-","tw-"]);

  const vowelTeam1 = new Set(["ai","ea","oa","ay","ee","oe","ou","ow","oi","oy","igh","oo","au","aw"]);
  const vowelTeam2 = new Set(["eigh","ei","ew","ey","ie","ough","ue","ui","augh"]);

  const rControl = new Set(["er","ir","ur","ar","or","war","wor"]);
  const ngnk = new Set(["-ing","-ang","-ong","-ung","-ink","-ank","-onk","-unk"]);
  const finalClusters = new Set(["-ld","-lf","-lk","-lp","-lt","-ct","-ft","-nt","-pt","-st","-xt","-mp","-nd","-sk","-sp","-nch","-tch","-dge"]);

  const prefixes = new Set(["un-","sub-","con-","in-","mis-","de-","re-","pro-","pre-","be-"]);
  const suffixes = new Set(["-es","-less","-ness","-ment","-ful","-ish","-en","-tion","-sion","-ed","-ic","-ing"]);

  const magicE = new Set(["*e","a_e","e_e","i_e","o_e","u_e","y_e"]);
  const yEndings = new Set(["-by","-vy","-zy","-ky","-ly","-ny","-dy","-fy","-py","-sy","-ty"]);
  const leSyllables = new Set(["-ble","-cle","-dle","-fle","-gle","-kle","-ple","-tle","-zle"]);
  const oddballs = new Set(["y","-ild","-old","-olt","-ind","augh","ough"]);

  groups = Array.from({length: CATEGORY_COUNT}, () => []);

  for (let s of baseShapes) {
    const lbl = s.label.toLowerCase().replace(/_/g, "");

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

  // category colors (hex)
  const COLOR_YELLOW = "#fff7c8";
  const COLOR_GREEN  = "#e6f6df";
  const COLOR_WHITE  = "#ffffff";

  for (let s of baseShapes) {
    const g = s.groupIndex;
    if (g === 0 && /^[aeiouy]$/.test(s.label)) s.originalColor = COLOR_YELLOW;
    else if (g === 7 || g === 8 || g === 14) s.originalColor = COLOR_YELLOW;
    else if (g === 12 || g === 13) s.originalColor = COLOR_GREEN;
    else s.originalColor = COLOR_WHITE;
    s.color = s.originalColor;
  }
}

// -----------------------------
// Layout: BLOCK WRAP (whole blocks wrap)
// -----------------------------
function layoutGroups() {
  calculateScale();

  const leftMargin = SAFE_MARGIN;
  const maxRowWidth = width - SAFE_MARGIN * 2;

  // tile/base sizes
  const baseTileW = constrain(floor(70 * scaleFactor), 36, 140);
  const baseTileH = constrain(floor(44 * scaleFactor), 24, 80);
  const tileGap = max(8 * scaleFactor, 6);
  const blockGap = max(40 * scaleFactor, 24);
  const rowGap = max(30 * scaleFactor, 18);

  let y = buildArea.y + buildArea.h + 30 * scaleFactor;
  y = max(y, SAFE_MARGIN);
  let currentRowWidth = 0;

  // We'll build a new list of baseShapes positions based on groups (wrapping blocks)
  for (let gi = 0; gi < groups.length; gi++) {
    const block = groups[gi];
    if (!block || block.length === 0) continue;

    // measure block width (all tiles placed in one row inside the block)
    const blockWidth = block.length * baseTileW + (block.length - 1) * tileGap;

    // if the block cannot fit on the current row, wrap to next row
    if (currentRowWidth > 0 && currentRowWidth + blockWidth > maxRowWidth) {
      // new row
      y += baseTileH + rowGap;
      currentRowWidth = 0;
    }

    // starting X for this block
    let blockStartX = leftMargin + currentRowWidth;

    // place each tile in this block
    for (let i = 0; i < block.length; i++) {
      const s = block[i];

      s.w = baseTileW;
      s.h = baseTileH;
      s.homeX = blockStartX + i * (baseTileW + tileGap);
      s.homeY = y;
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

    // advance currentRowWidth (block + gap)
    currentRowWidth += blockWidth + blockGap;
  }

  // After placing all blocks, update runtime shapes as copies of baseShapes
  shapes = baseShapes.map(b => ({ ...b }));
  positionResetButton();
}

// -----------------------------
// Draw loop
// -----------------------------
function draw() {
  // soft background for whole canvas
  background(backgroundColor);

  // modern build area
  noStroke();
  fill(buildAreaColor);
  rect(buildArea.x, buildArea.y, buildArea.w, buildArea.h, 20 * scaleFactor);

  // hint text when empty
  const inBox = shapes.filter(s => s.inBox);
  if (inBox.length === 0) {
    noStroke();
    fill("#282828");
    textSize(min(24 * scaleFactor, 24));
    text("🧱 Click letters to build a word", buildArea.x + buildArea.w / 2, buildArea.y + buildArea.h / 2);
  }

  // animate movement/scale (unchanged)
  for (let s of shapes) {
    s.x = lerp(s.x, s.targetX, 0.15);
    s.y = lerp(s.y, s.targetY, 0.15);
    s.scale = lerp(s.scale, s.targetScale, 0.15);
  }

  // draw tiles (bases and clones)
  for (let s of shapes) {

    // draw subtle shadow (under tile)
    push();
    noStroke();
    fill(tileShadowColor);
    rect(s.x + tileShadowOffset, s.y + tileShadowOffset, s.w * s.scale, s.h * s.scale, tileCorner * scaleFactor);
    pop();

    // draw actual tile (use s.color which preserves your tile color rules)
    push();
    noStroke();
    fill(s.color || "#ffffff");
    rect(s.x, s.y, s.w * s.scale, s.h * s.scale, tileCorner * scaleFactor);

    // tile text (dark gray)
    noStroke();
    fill("#282828");
    textSize(
      s.inBox
        ? s.h * s.scale * 0.82
        : s.h * s.scale * 0.58
    );
    text(s.label, s.x + (s.w * s.scale) / 2, s.y + (s.h * s.scale) / 2);
    pop();
  }

  arrangeShapesInBox();
}

// -----------------------------
// Mouse press: click base or clone
// -----------------------------
function mousePressed() {
  // iterate top-down so later shapes (clones) can be removed if clicked
  for (let i = shapes.length - 1; i >= 0; i--) {
    const s = shapes[i];
    const sw = s.w * s.scale;
    const sh = s.h * s.scale;
    if (mouseX > s.x && mouseX < s.x + sw && mouseY > s.y && mouseY < s.y + sh) {
      if (s.isBase) {
        // create a clone (keep original category color)
        const clone = {
          label: s.label,
          w: s.w, h: s.h,
          x: s.homeX, y: s.homeY,
          homeX: s.homeX, homeY: s.homeY,
          targetX: s.homeX, targetY: s.homeY,
          color: s.originalColor,
          originalColor: s.originalColor,
          isBase: false,
          inBox: true,
          scale: 1,
          targetScale: 1.5,
          clickIndex: nextClickIndex++,
          groupIndex: s.groupIndex
        };
        shapes.push(clone);
        arrangeShapesInBox();
        return;
      } else {
        // clicked a clone -> remove it
        shapes.splice(i, 1);
        arrangeShapesInBox();
        return;
      }
    }
  }
}

// -----------------------------
// Arrange shapes that are in the top box
// -----------------------------
function arrangeShapesInBox() {
  const inBox = shapes
    .filter(s => s.inBox)
    .sort((a, b) => (a.clickIndex || 0) - (b.clickIndex || 0));

  if (inBox.length === 0) {
    // return bases back to their home positions
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

  // spacing logic for box
  const spacing = max(8 * scaleFactor, 8);
  // compute available width per tile with padding
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
      t.color = base.originalColor;
    } else {
      t.color = '#ffffff';
    }
    // scale to fit box height (but keep within a cap)
    t.targetScale = min(2.0, (buildArea.h / t.h) * 0.9);

    x += letterW + spacing;
  }

  // ensure all base tiles remain at home positions visually
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
    .sort((a, b) => (a.clickIndex || 0) - (b.clickIndex || 0))
    .map(s => s.label)
    .join("");
}

// -----------------------------
// Reset shapes (clear top box)
// -----------------------------
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
  positionResetButton();
}
