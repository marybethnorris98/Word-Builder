let shapes = [];
let buildArea = { x: 50, y: 50, w: 800, h: 100 };
let resetButton;

function setup() {
  createCanvas(1600, 1400);
  textAlign(CENTER, CENTER);
  rectMode(CORNER);
  noStroke();

  // Reset button
  resetButton = createButton("🔄 Reset");
  resetButton.position(900, 80);
  resetButton.style('font-size', '24px');
  resetButton.mousePressed(resetShapes);

  // Load shapes
  addShapes();
}

function addShapes() {
  function addShape(x, y, w, h, color, label) {
    shapes.push({
      x,
      y,
      w,
      h,
      color,
      label,
      inBox: false,
      homeX: x,
      homeY: y,
      targetX: x,
      targetY: y,
      scale: 1,
      targetScale: 1,
      originalColor: color,
    });
  }

  // 🔤 Sample letters (add your full set here)
  addShape(40, 300, 40, 40, 'lightyellow', 'a');
  addShape(90, 300, 40, 40, 'white', 'b');
  addShape(140, 300, 40, 40, 'white', 'c');
  addShape(190, 300, 40, 40, 'white', 'd');
  addShape(240, 300, 40, 40, 'lightyellow', 'e');
  addShape(290, 300, 40, 40, 'white', 'f');
  addShape(340, 300, 40, 40, 'white', 'g');
  addShape(390, 300, 40, 40, 'white', 'h');
  addShape(440, 300, 40, 40, 'lightyellow', 'i');
  addShape(490, 300, 40, 40, 'white', 'j');
  addShape(540, 300, 40, 40, 'white', 'k');
  addShape(590, 300, 40, 40, 'white', 'l');
  addShape(640, 300, 40, 40, 'white', 'm');
addShape(40, 350, 40, 40, 'white', 'n');
  addShape(90, 350, 40, 40, 'lightyellow', 'o');
  addShape(140, 350, 40, 40, 'white', 'p');
  addShape(190, 350, 40, 40, 'white', 'q');
 addShape(240, 350, 40, 40, 'white', 'r');
  addShape(290, 350, 40, 40, 'white', 's');
  addShape(340, 350, 40, 40, 'white', 't');
  addShape(390, 350, 40, 40, 'lightyellow', 'u');
  addShape(440, 350, 40, 40, 'white', 'v');
  addShape(490, 350, 40, 40, 'white', 'w');
  addShape(540, 350, 40, 40, 'white', 'x');
  addShape(590, 350, 40, 40, 'white', 'y');
  addShape(640, 350, 40, 40, 'white', 'z');
  addShape(40, 450, 60, 40, 'white', 'ch');
  addShape(115, 450, 60, 40, 'white', 'sh');
  addShape(185, 450, 60, 40, 'white', 'th');
  addShape(255, 450, 60, 40, 'white', 'wh');
  addShape(325, 450, 60, 40, 'white', 'qu');
  addShape(600, 450, 60, 40, 'white', '-ck');
  addShape(775, 300, 60, 40, 'lightgreen', '-s');
  addShape(395, 450, 60, 40, 'white', '-ff');
  addShape(465, 450, 60, 40, 'white', '-ll');
  addShape(535, 450, 60, 40, 'white', '-ss');
  addShape(600, 450, 60, 40, 'white', '-zz');
  addShape(40, 550, 60, 40, 'lightyellow', '-ing');
  addShape(115, 550, 60, 40, 'lightyellow', '-ang');
  addShape(185, 550, 60, 40, 'lightyellow', '-ong');
  addShape(255, 550, 60, 40, 'lightyellow', '-ung');
  addShape(325, 550, 60, 40, 'lightyellow', '-ink');
  addShape(395, 550, 60, 40, 'lightyellow', '-ank');
  addShape(465, 550, 60, 40, 'lightyellow', '-onk');
  addShape(535, 550, 60, 40, 'lightyellow', '-unk');
  addShape(395, 600, 60, 40, 'white', 'bl-');
  addShape(255, 600, 60, 40, 'white', 'cl-');
  addShape(325, 600, 60, 40, 'white', 'fl-');
  addShape(40, 600, 60, 40, 'white', 'gl-');
  addShape(115, 600, 60, 40, 'white', 'pl-');
  addShape(185, 600, 60, 40, 'white', 'sl-');
  addShape(255, 900, 60, 40, 'white', 'br-');
  addShape(325, 900, 60, 40, 'white', 'cr-');
  addShape(395, 900, 60, 40, 'white', 'dr-');
  addShape(465, 900, 60, 40, 'white', 'fr-');
  addShape(535, 900, 60, 40, 'white', 'gr-');
  addShape(600, 900, 60, 40, 'white', 'pr-');
  addShape(675, 900, 60, 40, 'white', 'tr-');
  addShape(975, 600, 60, 40, 'white', 'sc-');
  addShape(900, 600, 60, 40, 'white', 'sk-');
  addShape(750, 600, 60, 40, 'white', 'sm-');
  addShape(825, 600, 60, 40, 'white', 'sn-');
  addShape(600, 600, 60, 40, 'white', 'sp-');
  addShape(675, 600, 60, 40, 'white', 'st-');
  addShape(40, 650, 60, 40, 'white', 'scr-');
  addShape(115, 650, 60, 40, 'white', 'shr-');
  addShape(185, 650, 60, 40, 'white', 'spl-');
  addShape(255, 650, 60, 40, 'white', 'spr-');
  addShape(325, 650, 60, 40, 'white', 'squ-');
  addShape(395, 650, 60, 40, 'white', 'str-');
  addShape(465, 650, 60, 40, 'white', 'thr-');
  addShape(1100, 800, 60, 40, 'white', 'dw-');
  addShape(1000, 800, 60, 40, 'white', 'sw-');
  addShape(900, 800, 60, 40, 'white', 'tw-');
  addShape(40, 900, 60, 40, 'lightyellow', 'y');
  addShape(115, 700, 60, 40, 'white', '-ld');
  addShape(185, 700, 60, 40, 'white', '-lf');
  addShape(255, 700, 60, 40, 'white', '-lk');
  addShape(325, 700, 60, 40, 'white', '-lp');
  addShape(395, 700, 60, 40, 'white', '-lt');
  addShape(465, 700, 60, 40, 'white', '-ct');
  addShape(535, 700, 60, 40, 'white', '-ft');
  addShape(600, 700, 60, 40, 'white', '-nt');
  addShape(675, 700, 60, 40, 'white', '-pt');
  addShape(750, 700, 60, 40, 'white', '-st');
  addShape(825, 700, 60, 40, 'white', '-xt');
  addShape(900, 700, 60, 40, 'white', '-mp');
  addShape(40, 700, 60, 40, 'white', '-nd');
  addShape(115, 750, 60, 40, 'white', '-sk');
  addShape(185, 750, 60, 40, 'white', '-sp');
  addShape(600, 650, 60, 40, 'white', '-nch');
  addShape(675, 650, 60, 40, 'white', '-tch');
  addShape(750, 650, 60, 40, 'white', '-dge');
  addShape(850, 300, 60, 40, 'lightgreen', 'un-');
  addShape(850, 350, 60, 40, 'lightgreen', 'sub-');
  addShape(850, 550, 60, 40, 'lightgreen', 'con-');
  addShape(920, 350, 60, 40, 'lightgreen', 'in-');
  addShape(775, 350, 60, 40, 'lightgreen', 'mis-');
  addShape(920, 400, 60, 40, 'lightgreen', '-ing');
  addShape(40, 800, 60, 40, 'lightyellow', '-ild');
  addShape(115, 800, 60, 40, 'lightyellow', '-old');
  addShape(185, 800, 60, 40, 'lightyellow', '-olt');
  addShape(255, 800, 60, 40, 'lightyellow', '-ind');
  addShape(850, 400, 60, 40, 'lightgreen', '-es');
  addShape(395, 800, 60, 40, 'lightyellow', '*e');
  addShape(465, 800, 60, 40, 'lightyellow', 'a_e');
  addShape(535, 800, 60, 40, 'lightyellow', 'e_e');
  addShape(600, 800, 60, 40, 'lightyellow', 'i_e');
  addShape(675, 800, 60, 40, 'lightyellow', 'o_e');
  addShape(750, 800, 60, 40, 'lightyellow', 'u_e');
  addShape(825, 800, 60, 40, 'lightyellow', 'y_e');
  addShape(1000, 350, 60, 40, 'lightgreen', '-less');
  addShape(1000, 400, 60, 40, 'lightgreen', '-ness');
  addShape(775, 400, 60, 40, 'lightgreen', '-ment');
  addShape(775, 550, 60, 40, 'lightgreen', '-ful');
  addShape(920, 500, 60, 40, 'lightgreen', '-ish');
  addShape(850, 500, 60, 40, 'lightgreen', '-en');
  addShape(40, 850, 60, 40, 'white', '-ble');
  addShape(115, 850, 60, 40, 'white', '-cle');
  addShape(185, 850, 60, 40, 'white', '-dle');
  addShape(255, 850, 60, 40, 'white', '-fle');
  addShape(325, 850, 60, 40, 'white', '-gle');
  addShape(395, 850, 60, 40, 'white', '-kle');
  addShape(465, 850, 60, 40, 'white', '-ple');
  addShape(535, 850, 60, 40, 'white', '-tle');
  addShape(600, 850, 60, 40, 'white', '-zle');
  addShape(115, 900, 60, 40, 'lightyellow', 'ai');
  addShape(185, 900, 60, 40, 'lightyellow', 'ea');
  addShape(255, 900, 60, 40, 'lightyellow', 'oa');
  addShape(325, 900, 60, 40, 'lightyellow', '-ay');
  addShape(395, 900, 60, 40, 'lightyellow', 'ee');
  addShape(465, 900, 60, 40, 'lightyellow', '-oe');
  addShape(535, 900, 60, 40, 'white', 'ph');
  addShape(1000, 450, 60, 40, 'lightgreen', 're-');
  addShape(1000, 400, 60, 40, 'lightgreen', 'pro-');
  addShape(775, 450, 60, 40, 'lightgreen', 'de-');
  addShape(850, 450, 60, 40, 'lightgreen', 'pre-');
  addShape(920, 450, 60, 40, 'lightgreen', 'be-');
  addShape(40, 950, 60, 40, 'lightyellow', 'er');
  addShape(115, 950, 60, 40, 'lightyellow', 'ir');
  addShape(185, 950, 60, 40, 'lightyellow', 'ur');
  addShape(255, 950, 60, 40, 'lightyellow', 'ar');
  addShape(325, 950, 60, 40, 'lightyellow', 'or');
 addShape(40, 500, 60, 40, 'white', '-by');
addShape(115, 500, 60, 40, 'white', '-vy');
addShape(185, 500, 60, 40, 'white', '-zy');
addShape(255, 500, 60, 40, 'white', '-ky');
addShape(325, 500, 60, 40, 'white', '-ly');
addShape(395, 500, 60, 40, 'white', '-ny');
addShape(465, 500, 60, 40, 'white', '-dy');
addShape(535, 500, 60, 40, 'white', '-fy');
addShape(600, 500, 60, 40, 'white', '-py');
addShape(670, 500, 60, 40, 'white', '-sy');
addShape(670, 450, 60, 40, 'white', '-ty');
addShape(255, 1000, 60, 40, 'lightyellow', 'ou');
addShape(325, 1000, 60, 40, 'lightyellow', 'ow');
addShape(395, 1000, 60, 40, 'lightyellow', 'oi');
addShape(465, 1000, 60, 40, 'lightyellow', '-oy');
addShape(535, 1000, 60, 40, 'lightyellow', 'igh');
addShape(600, 1000, 60, 40, 'lightyellow', 'au');
addShape(675, 1000, 60, 40, 'lightyellow', 'aw');
addShape(1000, 300, 60, 40, 'lightgreen', '-ed');
addShape(825, 1000, 60, 40, 'lightyellow', 'oo');
addShape(920, 300, 60, 40, 'lightgreen', '-ic');
addShape(40, 1050, 60, 40, 'lightyellow', 'eigh');
addShape(1000, 500, 60, 40, 'lightgreen', '-tion');
addShape(775, 500, 60, 40, 'lightgreen', '-sion');
addShape(255, 1050, 60, 40, 'lightyellow', 'augh');
addShape(325, 1050, 60, 40, 'lightyellow', 'ei');
addShape(395, 1050, 60, 40, 'lightyellow', '-ew');
addShape(465, 1050, 60, 40, 'lightyellow', '-ey');
addShape(535, 1050, 60, 40, 'lightyellow', 'ie');
addShape(600, 1050, 60, 40, 'lightyellow', 'ough');
addShape(675, 1050, 60, 40, 'lightyellow', '-ue');
addShape(750, 1050, 60, 40, 'lightyellow', 'ui');
addShape(825, 1050, 60, 40, 'white', 'war');
addShape(900, 1050, 60, 40, 'white', 'wor');
addShape(40, 1100, 60, 40, 'white', 'gn');
addShape(115, 1100, 60, 40, 'white', 'kn-');
addShape(185, 1100, 60, 40, 'white', '-mb');
addShape(255, 1100, 60, 40, 'white', '-mn');
addShape(325, 1100, 60, 40, 'white', 'wr-');
}

function draw() {
  background(240);

  // Draw white build area
  stroke(180);
  fill(255);
  rect(buildArea.x, buildArea.y, buildArea.w, buildArea.h, 15);

  let inBoxShapes = shapes.filter((s) => s.inBox);

  // Show instruction text only if box is empty
  if (inBoxShapes.length === 0) {
    noStroke();
    fill(0);
    textSize(24);
    textAlign(CENTER, CENTER);
    text("🧱 Click letters to build a word", buildArea.x + buildArea.w / 2, buildArea.y + buildArea.h / 2);
  }

  // Animate position and scale smoothly
  for (let s of shapes) {
    s.x = lerp(s.x, s.targetX, 0.15);
    s.y = lerp(s.y, s.targetY, 0.15);
    s.scale = lerp(s.scale, s.targetScale, 0.15);
  }

  // Draw shapes
  for (let s of shapes) {
    push();
    translate(s.x + s.w / 2, s.y + s.h / 2);
    scale(s.scale);
    fill(s.color);
    stroke(200);
    rect(-s.w / 2, -s.h / 2, s.w, s.h, 10);
    noStroke();
    fill(0);
    textSize(s.inBox ? 48 : 16); // Large in box, small at bottom
    text(s.label, 0, 0);
    pop();
  }

  arrangeShapesInBox();

  // Show the built word below the box
  fill(0);
  textSize(36);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text("Word: " + getCurrentWord(), buildArea.x + buildArea.w / 2, buildArea.y + buildArea.h + 50);
}

// Toggle shapes when clicked
function mousePressed() {
  for (let s of shapes) {
    if (
      mouseX > s.x &&
      mouseX < s.x + s.w &&
      mouseY > s.y &&
      mouseY < s.y + s.h
    ) {
      s.inBox = !s.inBox;

      if (s.inBox) {
        s.color = 'lightyellow';
        s.targetScale = 1.5;
      } else {
        s.color = s.originalColor;
        s.targetScale = 1;
      }

      arrangeShapesInBox();
      break;
    }
  }
}

// 🔹 Center and space the letters evenly inside the build box
function arrangeShapesInBox() {
  let inBoxShapes = shapes.filter((s) => s.inBox);
  if (inBoxShapes.length === 0) {
    // Send all letters home if nothing in box
    for (let s of shapes) {
      s.targetX = s.homeX;
      s.targetY = s.homeY;
    }
    return;
  }

  inBoxShapes.sort((a, b) => a.label.localeCompare(b.label)); // optional: sort alphabetically or by click order

  const spacing = 20;
  const letterWidth = 90; // width per letter when enlarged
  const totalWidth = inBoxShapes.length * letterWidth + (inBoxShapes.length - 1) * spacing;
  const startX = buildArea.x + (buildArea.w - totalWidth) / 2;
  const centerY = buildArea.y + buildArea.h / 2;

  let currentX = startX;
  for (let s of inBoxShapes) {
    s.targetX = currentX;
    s.targetY = centerY - (s.h * 1.5) / 2;
    currentX += letterWidth + spacing;
  }

  // Return all others to home
  for (let s of shapes) {
    if (!s.inBox) {
      s.targetX = s.homeX;
      s.targetY = s.homeY;
    }
  }
}

function getCurrentWord() {
  let inBoxShapes = shapes.filter((s) => s.inBox);
  return inBoxShapes.map((s) => s.label).join('');
}

function resetShapes() {
  for (let s of shapes) {
    s.inBox = false;
    s.color = s.originalColor;
    s.targetX = s.homeX;
    s.targetY = s.homeY;
    s.targetScale = 1;
  }
}
