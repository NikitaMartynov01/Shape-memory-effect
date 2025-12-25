// ============================================
// ЭФФЕКТ ПАМЯТИ ФОРМЫ
// Визуализация мартенситного превращения
// ============================================

// --- МАССИВЫ ---
let atoms = [];
let bonds = [];
let startPositions = [];

// --- ПАРАМЕТРЫ ---
let cols = 10;
let rows = 6;
let atomSize = 16;
let spacing = 55;

// --- ТЕМПЕРАТУРЫ ---
let Ms = 30;
let Af = 80;

// --- СОСТОЯНИЕ ---
let temperature = 100;
let phase = "аустенит";
let isDeformed = false;

let slider;


function setup() {
  createCanvas(800, 500);
  createLattice();
}


function createLattice() {
  atoms = [];
  bonds = [];
  startPositions = [];
  
  let startX = (width - (cols - 1) * spacing) / 2;
  let startY = (height - 80 - (rows - 1) * spacing) / 2;
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let x = startX + j * spacing;
      let y = startY + i * spacing;
      
      atoms.push({
        x: x,
        y: y,
        targetX: x,
        targetY: y,
        row: i
      });
      
      startPositions.push({x: x, y: y});
    }
  }
  
  for (let i = 0; i < atoms.length; i++) {
    let row = Math.floor(i / cols);
    let col = i % cols;
    
    if (col < cols - 1) {
      bonds.push({from: i, to: i + 1});
    }
    if (row < rows - 1) {
      bonds.push({from: i, to: i + cols});
    }
  }
  
  isDeformed = false;
}


function draw() {
  background(25, 25, 45);
  
  if (temperature < Ms) {
    phase = "мартенсит";
  } else if (temperature > Af) {
    phase = "аустенит";
  } else {
    phase = "переход";
  }
  
  if (phase === "аустенит" && isDeformed) {
    restoreShape();
  }
  
  moveAtoms();
  drawBonds();
  drawAtoms();
  drawInterface();
  drawControls();
}


function moveAtoms() {
  for (let i = 0; i < atoms.length; i++) {
    atoms[i].x = lerp(atoms[i].x, atoms[i].targetX, 0.1);
    atoms[i].y = lerp(atoms[i].y, atoms[i].targetY, 0.1);
  }
}


function restoreShape() {
  for (let i = 0; i < atoms.length; i++) {
    atoms[i].targetX = startPositions[i].x;
    atoms[i].targetY = startPositions[i].y;
  }
  
  let done = true;
  for (let i = 0; i < atoms.length; i++) {
    let d = dist(atoms[i].x, atoms[i].y, startPositions[i].x, startPositions[i].y);
    if (d > 2) {
      done = false;
      break;
    }
  }
  
  if (done) {
    isDeformed = false;
  }
}


function deform() {
  if (phase !== "мартенсит") {
    return;
  }
  
  isDeformed = true;
  
  for (let i = 0; i < atoms.length; i++) {
    let row = atoms[i].row;
    let shiftX = row * 15 + random(-5, 5);
    let shiftY = random(-4, 4);
    
    atoms[i].targetX = startPositions[i].x + shiftX;
    atoms[i].targetY = startPositions[i].y + shiftY;
  }
}


function reset() {
  temperature = 100;
  createLattice();
}


function drawBonds() {
  for (let i = 0; i < bonds.length; i++) {
    let a = atoms[bonds[i].from];
    let b = atoms[bonds[i].to];
    
    let len = dist(a.x, a.y, b.x, b.y);
    let diff = abs(len - spacing);
    
    if (diff > 5) {
      stroke(255, 100, 100);
      strokeWeight(2);
    } else {
      stroke(255, 255, 255, 100);
      strokeWeight(1);
    }
    
    line(a.x, a.y, b.x, b.y);
  }
}


function drawAtoms() {
  for (let i = 0; i < atoms.length; i++) {
    if (phase === "аустенит") {
      fill(46, 204, 113);
    } else if (phase === "мартенсит") {
      fill(52, 152, 219);
    } else {
      fill(241, 196, 15);
    }
    
    noStroke();
    ellipse(atoms[i].x, atoms[i].y, atomSize, atomSize);
  }
}


function drawInterface() {
  fill(255);
  textSize(20);
  textAlign(LEFT);
  text("Эффект памяти формы", 20, 30);
  
  textSize(14);
  fill(255);
  text("T = " + temperature + "°C", 20, 55);
  
  if (phase === "аустенит") {
    fill(46, 204, 113);
  } else if (phase === "мартенсит") {
    fill(52, 152, 219);
  } else {
    fill(241, 196, 15);
  }
  text("Фаза: " + phase, 120, 55);
  
  if (isDeformed) {
    fill(255, 100, 100);
    text("● деформирован", 250, 55);
  }
}


function drawControls() {
  let y = height - 35;
  
  // Фон панели
  fill(35, 35, 55);
  noStroke();
  rect(0, height - 60, width, 60);
  
  stroke(60);
  line(0, height - 60, width, height - 60);
  
  // Слайдер температуры (рисуем вручную)
  fill(150);
  textSize(12);
  noStroke();
  textAlign(LEFT);
  text("Температура:", 20, y);
  
  // Полоса слайдера
  let sliderX = 120;
  let sliderW = 200;
  fill(80);
  rect(sliderX, y - 8, sliderW, 6, 3);
  
  // Позиция ползунка
  let knobX = map(temperature, -50, 150, sliderX, sliderX + sliderW);
  fill(52, 152, 219);
  ellipse(knobX, y - 5, 14, 14);
  
  // Подписи
  fill(100);
  textSize(10);
  text("-50°C", sliderX, y + 15);
  textAlign(RIGHT);
  text("150°C", sliderX + sliderW, y + 15);
  
  // Кнопки
  drawButton(380, y - 15, 100, 28, "Деформировать", 1);
  drawButton(490, y - 15, 80, 28, "Сбросить", 2);
}


function drawButton(x, y, w, h, label, id) {
  // Проверка наведения
  let hover = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
  
  fill(hover ? 70 : 50);
  stroke(100);
  strokeWeight(1);
  rect(x, y, w, h, 4);
  
  fill(255);
  noStroke();
  textSize(12);
  textAlign(CENTER, CENTER);
  text(label, x + w/2, y + h/2);
}


function mousePressed() {
  let y = height - 35;
  
  // Проверка клика по слайдеру
  let sliderX = 120;
  let sliderW = 200;
  if (mouseY > y - 15 && mouseY < y + 5 && mouseX > sliderX - 10 && mouseX < sliderX + sliderW + 10) {
    temperature = Math.round(map(mouseX, sliderX, sliderX + sliderW, -50, 150));
    temperature = constrain(temperature, -50, 150);
  }
  
  // Проверка клика по кнопкам
  if (mouseY > y - 15 && mouseY < y + 13) {
    if (mouseX > 380 && mouseX < 480) {
      deform();
    }
    if (mouseX > 490 && mouseX < 570) {
      reset();
    }
  }
}


function mouseDragged() {
  let y = height - 35;
  let sliderX = 120;
  let sliderW = 200;
  
  if (mouseY > y - 20 && mouseY < y + 10 && mouseX > sliderX - 10 && mouseX < sliderX + sliderW + 10) {
    temperature = Math.round(map(mouseX, sliderX, sliderX + sliderW, -50, 150));
    temperature = constrain(temperature, -50, 150);
  }
}
