// EMBED1 - ¿Quién necesita energía?
// Drag & drop con Pointer Events (móvil + desktop), y “premium feel” con micro-animaciones.

const ASSETS = {
  pixi: {
    normal: "assets/pixi_normal.png",
    happy: "assets/pixi_sonrie.png",
    think: "assets/pixi_pensativo.png",
    sad: "assets/pixi_triste.png",
  },
  energy: "assets/energy_icon.png",
  watermark: "assets/spixar_logo.png",
};

const OBJECTS = [
  // Marca cuáles necesitan energía (puedes ajustar según tu lección)
  { id: "pixi", name: "Pixi", img: "assets/pixi_normal.png", needsEnergy: true },
  { id: "lampara", name: "Lámpara", img: "assets/objeto_lampara.png", needsEnergy: true },
  { id: "piedra", name: "Piedra", img: "assets/objeto_piedra.png", needsEnergy: false },
  { id: "robot_off", name: "Robot apagado", img: "assets/objeto_robot_off.png", needsEnergy: true },
  { id: "planta", name: "Planta", img: "assets/objeto_planta.png", needsEnergy: false },
];

const ui = {
  grid: document.getElementById("grid"),
  pixiFace: document.getElementById("pixiFace"),
  dialogText: document.getElementById("dialogText"),
  score: document.getElementById("score"),
  total: document.getElementById("total"),
  resetBtn: document.getElementById("resetBtn"),
  stage: document.getElementById("stage"),
  energy: document.getElementById("energy"),
};

let solved = new Set();
let score = 0;

function setPixi(faceKey, text) {
  ui.pixiFace.src = ASSETS.pixi[faceKey] || ASSETS.pixi.normal;
  ui.dialogText.textContent = text;

  // micro “pop”
  ui.pixiFace.style.transform = "scale(1.03)";
  ui.pixiFace.style.filter = "drop-shadow(0 18px 26px rgba(0,0,0,.40))";
  setTimeout(() => {
    ui.pixiFace.style.transform = "";
    ui.pixiFace.style.filter = "";
  }, 160);
}

function renderCards() {
  ui.grid.innerHTML = "";

  OBJECTS.forEach(obj => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = obj.id;

    const top = document.createElement("div");
    top.className = "cardTop";

    const name = document.createElement("div");
    name.className = "cardName";
    name.textContent = obj.name;

    const badge = document.createElement("div");
    badge.className = "badge";
    badge.textContent = "Suelta aquí";

    top.appendChild(name);
    top.appendChild(badge);

    const imgWrap = document.createElement("div");
    imgWrap.className = "cardImgWrap";

    const img = document.createElement("img");
    img.className = "cardImg";
    img.src = obj.img;
    img.alt = obj.name;

    imgWrap.appendChild(img);

    card.appendChild(top);
    card.appendChild(imgWrap);

    ui.grid.appendChild(card);
  });

  ui.total.textContent = String(OBJECTS.filter(o => o.needsEnergy).length);
}

function updateScore() {
  ui.score.textContent = String(score);
}

function resetGame() {
  solved = new Set();
  score = 0;
  updateScore();
  renderCards();
  setPixi("normal", "¡Dame energía para funcionar! ⚡");

  // Limpia estados visuales
  document.querySelectorAll(".card").forEach(c => {
    c.classList.remove("drop-ok", "drop-bad", "done");
    const badge = c.querySelector(".badge");
    badge.className = "badge";
    badge.textContent = "Suelta aquí";
  });
}

ui.resetBtn.addEventListener("click", resetGame);

/* =========================
   Drag (Pointer Events)
   ========================= */
let dragging = false;
let dragClone = null;
let pointerId = null;
let startRect = null;

function makeClone() {
  const clone = ui.energy.cloneNode(true);
  clone.id = "energyClone";
  clone.style.position = "fixed";
  clone.style.left = "0px";
  clone.style.top = "0px";
  clone.style.width = ui.energy.getBoundingClientRect().width + "px";
  clone.style.zIndex = "9999";
  clone.style.pointerEvents = "none";
  clone.style.transition = "none";
  clone.style.transform = "translate(-9999px,-9999px)";
  document.body.appendChild(clone);
  return clone;
}

function moveCloneTo(x, y) {
  if (!dragClone) return;
  const w = dragClone.getBoundingClientRect().width;
  const h = dragClone.getBoundingClientRect().height;
  dragClone.style.transform = `translate(${x - w/2}px, ${y - h/2}px) scale(1.04)`;
}

function getCardUnderPointer(x, y) {
  const el = document.elementFromPoint(x, y);
  if (!el) return null;
  const card = el.closest?.(".card");
  return card || null;
}

function flashCard(card, ok) {
  card.classList.remove("drop-ok", "drop-bad");
  card.classList.add(ok ? "drop-ok" : "drop-bad");
  setTimeout(() => card.classList.remove("drop-ok", "drop-bad"), 450);
}

function markDone(card, ok) {
  const badge = card.querySelector(".badge");
  if (ok) {
    badge.className = "badge ok";
    badge.textContent = "¡Con energía!";
  } else {
    badge.className = "badge no";
    badge.textContent = "No necesita";
  }
  card.classList.add("done");
}

function onPointerDown(e) {
  // solo botón principal / touch
  if (dragging) return;
  dragging = true;
  pointerId = e.pointerId;
  ui.energy.setPointerCapture(pointerId);

  startRect = ui.energy.getBoundingClientRect();
  dragClone = makeClone();

  setPixi("think", "¿A quién le damos energía? Suelta el ícono sobre un objeto 🤔");
  moveCloneTo(e.clientX, e.clientY);
}

function onPointerMove(e) {
  if (!dragging) return;
  moveCloneTo(e.clientX, e.clientY);

  // hover feedback
  const card = getCardUnderPointer(e.clientX, e.clientY);
  document.querySelectorAll(".card").forEach(c => c.style.outline = "none");
  if (card) {
    card.style.outline = "2px solid rgba(0,255,239,.28)";
    card.style.outlineOffset = "2px";
  }
}

function onPointerUp(e) {
  if (!dragging) return;
  dragging = false;

  // limpia hover outline
  document.querySelectorAll(".card").forEach(c => c.style.outline = "none");

  const card = getCardUnderPointer(e.clientX, e.clientY);

  // remove clone
  if (dragClone) {
    dragClone.remove();
    dragClone = null;
  }

  if (!card) {
    setPixi("normal", "¡Intenta de nuevo! Suelta la energía sobre un objeto 🙂");
    return;
  }

  const id = card.dataset.id;
  const obj = OBJECTS.find(o => o.id === id);
  if (!obj) return;

  // Si ya lo resolvió correctamente y es de energía, no sumar otra vez
  if (obj.needsEnergy && solved.has(id)) {
    setPixi("think", "Ese ya tiene energía 😄 Prueba con otro.");
    return;
  }

  if (obj.needsEnergy) {
    solved.add(id);
    score++;
    updateScore();
    flashCard(card, true);
    markDone(card, true);

    if (id === "pixi") {
      setPixi("happy", "¡SÍ! Sin energía, Pixi no puede vivir ⚡✨");
    } else {
      setPixi("happy", `¡Correcto! ${obj.name} necesita energía para funcionar ✅`);
    }

    // Win condition
    const needed = OBJECTS.filter(o => o.needsEnergy).length;
    if (score >= needed) {
      setPixi("happy", "¡Lo lograste! Identificaste todo lo que necesita energía 🏆⚡");
    }
  } else {
    flashCard(card, false);
    markDone(card, false);
    setPixi("sad", `Mmm… ${obj.name} no necesita energía para “vivir”. ¡Probemos con otro!`);
  }
}

ui.energy.addEventListener("pointerdown", onPointerDown);
ui.energy.addEventListener("pointermove", onPointerMove);
ui.energy.addEventListener("pointerup", onPointerUp);
ui.energy.addEventListener("pointercancel", onPointerUp);

// Init
resetGame();
