/* HamarTech GameJam app.js (ООП-структура)
   Модули:
   - Toast
   - PageTransition, SmoothAnchors, RevealOnScroll, MobileMenu, Accordion, CardTilt
   - CopyLink, Countdown, FormUX (используют Toast)
   - Confetti (static)
   - TorchRunner (фиксированные факелы + бегун + ЗВУК)
   - JamApp (инициализация всего)
*/

const $ = (q, root=document) => root.querySelector(q);
const $$ = (q, root=document) => Array.from(root.querySelectorAll(q));

const JAM_CONFIG = {
  theme: "Tema annonseres ved oppstart.",
  submitDeadline: "2026-01-15T18:00:00",
  timezoneLabel: "lokal tid",
};

/* ================= Toast ================= */

class Toast{
  constructor(el){
    this.el = el;
    this._timer = null;
  }
  show(msg){
    if(!this.el) return;
    this.el.textContent = msg;
    this.el.classList.add("show");
    clearTimeout(this._timer);
    this._timer = setTimeout(()=> this.el.classList.remove("show"), 2600);
  }
}

/* ================= AudioManager ================= */

class AudioManager{
  constructor(){
    this.ctx = null;
    this.buffers = {};
  }

  async init(){
    if(this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  async load(name, url){
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    this.buffers[name] = await this.ctx.decodeAudioData(buf);
  }

  play(name, { loop=false, volume=0.6 } = {}){
    if(!this.ctx || !this.buffers[name]) return null;

    const src = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();

    src.buffer = this.buffers[name];
    src.loop = loop;
    gain.gain.value = volume;

    src.connect(gain).connect(this.ctx.destination);
    src.start();

    return { src, gain };
  }
}

/* ================= TorchRunner ================= */

class TorchRunner{
  constructor(audio){
    this.audio = audio;

    this.overlay = document.getElementById("torchOverlay");
    this.svg = document.getElementById("torchSvg");
    this.maskRect = document.getElementById("torchMaskRect");
    this.darkRect = document.getElementById("torchDarkRect");
    this.lightsG = document.getElementById("torchMaskLights");
    this.torchLayer = document.getElementById("torchLayer");
    this.runner = document.getElementById("runner");

    this.ready = !!(this.overlay && this.svg && this.maskRect && this.darkRect && this.lightsG && this.torchLayer && this.runner);
    if(!this.ready) return;

    this.MAX_TORCHES = 7;
    this.BASE_R = 220;
    this.FLICKER = 18;
    this.SPEED_MIN = 7;
    this.SPEED_MAX = 18;

    this.torches = [];
    this.fireSounds = new Map();

    this.stepTimer = 0;
    this.stepInterval = 280;

    this.rx = window.innerWidth * 0.5;
    this.ry = window.innerHeight * 0.6;
    this.tx = this.rx;
    this.ty = this.ry;
    this.moving = false;

    this.resizeSvg = this.resizeSvg.bind(this);
    this.tick = this.tick.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);

    this.init();
  }

  init(){
    this.resizeSvg();
    window.addEventListener("resize", this.resizeSvg);
    window.addEventListener("pointerdown", this.onPointerDown, { passive:true });
    this.renderRunner();
    this.addTorch(this.rx, this.ry);
    requestAnimationFrame(this.tick);
  }

  resizeSvg(){
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    this.maskRect.setAttribute("width", w);
    this.maskRect.setAttribute("height", h);
    this.darkRect.setAttribute("width", w);
    this.darkRect.setAttribute("height", h);
  }

  renderRunner(){
    this.runner.style.left = (this.rx - window.scrollX) + "px";
    this.runner.style.top  = (this.ry - window.scrollY) + "px";
  }

  onPointerDown(e){
    if(e.button !== 0) return;
    if(e.target.closest("a,button,input,textarea,select,label")) return;

    this.tx = e.clientX + window.scrollX;
    this.ty = e.clientY + window.scrollY;
    this.moving = true;
    this.runner.classList.add("walking");
  }

  stepRunner(t){
    if(!this.moving) return;

    if(t - this.stepTimer > this.stepInterval){
      this.audio?.play("step", { volume: 0.35 });
      this.stepTimer = t;
    }

    const dx = this.tx - this.rx;
    const dy = this.ty - this.ry;
    const dist = Math.hypot(dx, dy);
    const speed = Math.min(this.SPEED_MAX, Math.max(this.SPEED_MIN, dist * 0.08));

    if(dist < 6){
      this.rx = this.tx;
      this.ry = this.ty;
      this.moving = false;
      this.runner.classList.remove("walking");
      this.addTorch(this.rx, this.ry);
      return;
    }

    this.rx += (dx / dist) * speed;
    this.ry += (dy / dist) * speed;
  }

  addTorch(x, y){
    const t = document.createElement("div");
    t.className = "torch";
    this.torchLayer.appendChild(t);

    const flame = document.createElement("span");
    flame.className = "flame";
    t.appendChild(flame);

    const hole = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    hole.setAttribute("fill", "black");
    this.lightsG.appendChild(hole);

    const fire = this.audio?.play("fire", { loop:true, volume:0.25 });

    this.torches.push({
      x, y,
      el: t,
      hole,
      fire,
      seed: Math.random()*1000,
      emitT: 0
    });

    while(this.torches.length > this.MAX_TORCHES){
      const old = this.torches.shift();
      old.el.remove();
      old.hole.remove();
      old.fire?.src.stop();
    }
  }

  spawnEmber(x, y){
    const e = document.createElement("span");
    e.className = "ember";
    e.style.left = (x - window.scrollX) + "px";
    e.style.top  = (y - window.scrollY) + "px";
    this.torchLayer.appendChild(e);

    const dx = (Math.random()-0.5) * 26;
    const dy = -(18 + Math.random()*42);

    e.animate([
      { transform: "translate(-50%,-50%)", opacity: 1 },
      { transform: `translate(${dx}px,${dy}px)`, opacity: 0 }
    ], { duration: 700, easing: "ease-out" });

    setTimeout(()=> e.remove(), 1000);
  }

  tick(t){
    this.renderRunner();
    this.stepRunner(t);

    for(const k of this.torches){
      k.el.style.left = (k.x - window.scrollX) + "px";
      k.el.style.top  = (k.y - window.scrollY) + "px";
      k.hole.setAttribute("cx", k.x - window.scrollX);
      k.hole.setAttribute("cy", k.y - window.scrollY);
      const flick = Math.sin(t*0.006 + k.seed) * this.FLICKER;
      k.hole.setAttribute("r", Math.max(120, this.BASE_R + flick));

      if(t - k.emitT > 180){
        this.spawnEmber(k.x, k.y - 26);
        k.emitT = t;
      }
    }

    requestAnimationFrame(this.tick);
  }
}

/* ================= JamApp ================= */

class JamApp{
  constructor(config){
    this.config = { ...JAM_CONFIG, ...config };
    this.toast = new Toast($("#toast"));
    this.audio = new AudioManager();
  }

  async init(){
    await this.audio.init();
    await Promise.all([
      this.audio.load("step", "/hamartech-gamejam/assets/sfx/step.wav"),
      this.audio.load("fire", "/hamartech-gamejam/assets/sfx/fire.wav")
    ]);

    new TorchRunner(this.audio);
  }
}

document.addEventListener("DOMContentLoaded", ()=>{
  new JamApp().init();
});
