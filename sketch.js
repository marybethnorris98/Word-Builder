let baseShapes = [];   // master unique tiles (objects)
let shapes = [];       // runtime array (base tiles first, clones appended)
let groups = [];       // CATEGORY_COUNT groups arrays of baseShapes references
let nextClickIndex = 0;
let resetButton, checkButton, defineButton;
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
const SAFE_MARGIN = 50;

// NOTE: preload left blank for CORS safety
function preload() {}

function setup() {
  createCanvas(windowWidth, windowHeight);

  textAlign(CENTER, CENTER);
  rectMode(CORNER);
  noStroke();

  createBaseShapesFromFullList();
  categorizeBaseShapes();
  calculateScale();

  buildArea = {
    x: SAFE_MARGIN,
    y: SAFE_MARGIN,
    w: width - SAFE_MARGIN * 2,
    h: constrain(120 * scaleFactor, 80, 200)
  };

  // Buttons  
  resetButton = createButton("🔄 Reset");
  styleAppButton(resetButton);
  resetButton.mousePressed(resetShapes);

  checkButton = createButton("✔️ Check Word");
  styleAppButton(checkButton);
  checkButton.mousePressed(checkWord);

  defineButton = createButton("📘 Definition");
  styleAppButton(defineButton);
  defineButton.mousePressed(showDefinition);

  layoutGroups();
  shapes = baseShapes.map(b => ({ ...b }));

  schedulePositionButtons();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateScale();

  buildArea.x = SAFE_MARGIN;
  buildArea.y = SAFE_MARGIN;
  buildArea.w = width - SAFE_MARGIN * 2;
  buildArea.h = constrain(120 * scaleFactor, 80, 200);

  categorizeBaseShapes();
  layoutGroups();
  shapes = baseShapes.map(b => ({ ...b }));
  schedulePositionButtons();
}

function styleAppButton(btn) {
  if (!btn) return;
  btn.style("font-family", "system-ui");
  btn.style("font-size", "16px");
  btn.style("padding", "8px 12px");
  btn.style("border-radius", "10px");
  btn.style("background", "white");
  btn.style("box-shadow", "0 6px 12px rgba(0,0,0,0.06)");
  btn.style("cursor", "pointer");
  btn.style("border", "none");
}

function schedulePositionButtons() {
  requestAnimationFrame(() => {
    positionButtons();
    setTimeout(positionButtons, 60);
    setTimeout(positionButtons, 250);
  });
}

function positionButtons() {
  if (!buildArea) return;

  const areaX = buildArea.x;
  const areaY = buildArea.y;
  const areaW = buildArea.w;
  const areaH = buildArea.h;

  const wReset  = safeEltWidth(resetButton, 90);
  const wCheck  = safeEltWidth(checkButton, 120);
  const wDefine = safeEltWidth(defineButton, 120);

  const gap = 18;
  const totalW = wReset + wCheck + wDefine + gap * 2;

  const startX = areaX + (areaW - totalW) / 2;
  const y = areaY + areaH + 18;

  resetButton.position(startX, y);
  checkButton.position(startX + wReset + gap, y);
  defineButton.position(startX + wReset + wCheck + gap * 2, y);
}

function safeEltWidth(p5Button, fallback) {
  try {
    if (p5Button?.elt?.offsetWidth) return p5Button.elt.offsetWidth;
  } catch(e){}
  return fallback;
}

function calculateScale() {
  scaleFactor = min(width / DESIGN_W, height / DESIGN_H);
}

// -----------------------------
// Base shapes
// -----------------------------
function createBaseShapesFromFullList() {
  const raw = [
    "a","b","c","d","e","f","g","h","i","j","k","l","m",
    "n","o","p","q","r","s","t","u","v","w","x","y","z",

    "ch","sh","th","wh","qu","-ck","-s","-ff","-ll","-ss","-zz",
    "-ing","-ang","-ong","-ung","-ink","-ank","-onk","-unk",
    "bl-","cl-","fl-","gl-","pl-","sl-",
    "br-","cr-","dr-","fr-","gr-","pr-","tr-",
    "sc-","sk-","sm-","sn-","sp-","st-",
    "scr-","shr-","spl-","spr-","squ-","str-","thr-",
    "dw-","sw-","tw-",

    "-ld","-lf","-lk","-lp","-lt","-ct","-ft","-nt","-pt","-st","-xt",
    "-mp","-nd","-sk","-sp","-nch","-tch","-dge",

    "ai","ea","oa","-ay","ee","-oe","ou","ow","oi","-oy","au","aw",
    "oo","eigh","ei","-ew","-ey","ie","igh","-ue","ui","oe","augh","ough",

    "*e","a_e","e_e","i_e","o_e","u_e","y_e",

    "er","ir","ur","ar","or","war","wor",

    "un-","sub-","con-","in-","mis-","de-","re-","pro-","pre-","be-",

    "-es","-less","-ness","-ment","-ful","-ish","-en","-tion","-sion",
    "-ed","-ic","-ing",

    "-by","-vy","-zy","-ky","-ly","-ny","-dy","-fy","-py","-sy","-ty",

    "-ble","-cle","-dle","-fle","-gle","-kle","-ple","-tle","-zle",

    "ph","kn-","gn","wr-","-mb","-mn"
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
// Layout: BLOCK WRAP
// -----------------------------
function layoutGroups() {
  calculateScale();

  const leftMargin = SAFE_MARGIN;
  const maxRowWidth = width - SAFE_MARGIN * 2;

  const baseTileW = constrain(floor(70 * scaleFactor), 36, 140);
  const baseTileH = constrain(floor(44 * scaleFactor), 24, 80);

  const tileGap  = max(8 * scaleFactor, 6);
  const rowGap   = max(20 * scaleFactor, 14);
  const groupGap = max(45 * scaleFactor, 30);

  const BUTTON_OFFSET = 18;
  const fallbackButtonHeight = 40;

  let realButtonHeight = fallbackButtonHeight;
  try {
    if (resetButton?.elt?.offsetHeight) {
      realButtonHeight = resetButton.elt.offsetHeight;
    }
  } catch(e){}

  // Your requested big gap after the buttons
  const BIG_GAP = 80;

  // Starting Y position for first row of tiles
  let y =
    buildArea.y +
    buildArea.h +
    BUTTON_OFFSET +
    realButtonHeight +
    BIG_GAP;

  // ---------------------------
  // CATEGORY-BY-CATEGORY LAYOUT
  // ---------------------------

  for (let gi = 0; gi < groups.length; gi++) {
    const block = groups[gi];
    if (!block.length) continue;

    let x = leftMargin;

    for (let s of block) {
      // WRAP TO NEW ROW IF TILE DOESN'T FIT
      if (x + baseTileW > leftMargin + maxRowWidth) {
        x = leftMargin;
        y += baseTileH + rowGap;
      }

      // Assign final positions to base shapes
      s.w = baseTileW;
      s.h = baseTileH;
      s.homeX = x;
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

      x += baseTileW + tileGap;
    }

    // After each category → add vertical gap
    y += baseTileH + groupGap;
  }

  // Rebuild shapes array
  shapes = baseShapes.map(b => ({ ...b }));

  schedulePositionButtons();
}
function draw() {
  background(backgroundColor);

  fill(buildAreaColor);
  rect(buildArea.x, buildArea.y, buildArea.w, buildArea.h, 20 * scaleFactor);

  const inBox = shapes.filter(s => s.inBox);
  if (inBox.length === 0) {
    fill("#282828");
    textSize(min(24 * scaleFactor, 24));
    text("🧱 Click letters to build a word",
         buildArea.x + buildArea.w / 2,
         buildArea.y + buildArea.h / 2);
  }

  for (let s of shapes) {
    s.x = lerp(s.x, s.targetX, 0.15);
    s.y = lerp(s.y, s.targetY, 0.15);
    s.scale = lerp(s.scale, s.targetScale, 0.15);
  }

  for (let s of shapes) {
    push();
    fill(tileShadowColor);
    rect(s.x + tileShadowOffset, s.y + tileShadowOffset,
         s.w * s.scale, s.h * s.scale, tileCorner * scaleFactor);
    pop();

    push();
    fill(s.color);
    rect(s.x, s.y, s.w * s.scale, s.h * s.scale, tileCorner * scaleFactor);

    fill("#282828");
    textSize(s.inBox ? s.h * s.scale * 0.82 : s.h * s.scale * 0.58);
    text(s.label, s.x + (s.w * s.scale)/2, s.y + (s.h * s.scale)/2);
    pop();
  }

  arrangeShapesInBox();
}

// -----------------------------
// Click tiles
// -----------------------------
function mousePressed() {
  for (let i = shapes.length - 1; i >= 0; i--) {
    const s = shapes[i];
    const sw = s.w * s.scale;
    const sh = s.h * s.scale;

    if (mouseX > s.x && mouseX < s.x + sw &&
        mouseY > s.y && mouseY < s.y + sh) {

      if (s.isBase) {
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
        shapes.splice(i, 1);
        arrangeShapesInBox();
        return;
      }
    }
  }
}

// -----------------------------
// Arrange in box
// -----------------------------
function arrangeShapesInBox() {
  const inBox = shapes
    .filter(s => s.inBox)
    .sort((a,b) => (a.clickIndex||0)-(b.clickIndex||0));

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
  const startX = buildArea.x + (buildArea.w - totalW) / 2;
  const centerY = buildArea.y + buildArea.h / 2;

  let x = startX;

  for (let t of inBox) {
    t.targetX = x;
    t.targetY = centerY - (t.h * t.targetScale) / 2;

    const base = baseShapes.find(b => b.label === t.label);
    t.color = base ? base.originalColor : "#ffffff";

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
    .sort((a,b)=>(a.clickIndex||0)-(b.clickIndex||0))
    .map(s=>s.label)
    .join("");
}

// -----------------------------
// Reset
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

  schedulePositionButtons();
  console.log("resetShapes(): cleared.");
}

// -----------------------------
// Dictionary API
// -----------------------------
async function checkWord() {
  const word = getCurrentWord().toLowerCase();
  if (!word) return alert("No word built.");

  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!res.ok) return alert(`❌ "${word}" is NOT a recognized English word.`);

    alert(`✔️ "${word}" appears to be a real word.`);
  } catch (err) {
    alert("Network error.");
  }
}

async function showDefinition() {
  const word = getCurrentWord().toLowerCase();
  if (!word) return alert("No word built.");

  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!res.ok) return alert(`❌ No definition found for "${word}".`);
    const json = await res.json();

    const entry = json[0];
    const meaning = entry.meanings?.[0];
    const defObj = meaning?.definitions?.[0];

    const part = meaning?.partOfSpeech ? ` (${meaning.partOfSpeech})` : "";
    const definition = defObj?.definition || null;
    const example = defObj?.example ? `\n\nExample: "${defObj.example}"` : "";

    if (!definition) return alert(`❌ No definition available for "${word}".`);
    alert(`📘 ${word}${part} — ${definition}${example}`);
  } catch (err) {
    alert("Network error.");
  }
}
