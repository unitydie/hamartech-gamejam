/* HamarTech GameJam app.js (ООП-структура)
   Модули:
   - Toast
   - PageTransition, SmoothAnchors, RevealOnScroll, MobileMenu, Accordion, CardTilt
   - CopyLink, Countdown, FormUX (используют Toast)
   - Confetti (static)
   - TorchRunner (фиксированные факелы + бегун)
   - JamApp (инициализация всего)
*/

const $ = (q, root=document) => root.querySelector(q);
const $$ = (q, root=document) => Array.from(root.querySelectorAll(q));

const JAM_CONFIG = {
  theme: "Tema annonseres ved oppstart.",
  submitDeadline: "2026-01-15T18:00:00",
  timezoneLabel: "lokal tid",
};
const ASSET_BASE = location.pathname.includes("/hamartech-gamejam") ? "/hamartech-gamejam" : "";
const API_BASE = ASSET_BASE;
const assetPath = (p) => `${ASSET_BASE}${p}`;
const STORAGE_KEY = "jam_submissions_v1";

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

class PageTransition{
  constructor(){
    this.overlay = $(".page-transition");
    if(!this.overlay) return;
    requestAnimationFrame(()=> this.overlay.classList.remove("on"));
    document.addEventListener("click", (e)=> this.onNavigate(e));
  }
  onNavigate(e){
    const a = e.target.closest("a");
    if(!a || !this.overlay) return;
    const href = a.getAttribute("href");
    if(!href) return;
    const isAnchor = href.startsWith("#") || href.startsWith("/#");
    const isExternal = /^https?:\/\//.test(href) && !href.startsWith(location.origin);
    if(isExternal || isAnchor || a.target === "_blank") return;
    e.preventDefault();
    this.overlay.classList.add("on");
    setTimeout(()=> { window.location.href = href; }, 220);
  }
}

class SmoothAnchors{
  constructor(){
    document.addEventListener("click", (e)=> this.onClick(e));
  }
  onClick(e){
    const a = e.target.closest("a");
    if(!a) return;
    const href = a.getAttribute("href") || "";
    if(!href.startsWith("#") && !href.startsWith("/#")) return;
    const id = href.replace("/","");
    const target = document.querySelector(id);
    if(!target) return;
    e.preventDefault();

    const y = target.getBoundingClientRect().top + window.scrollY - 82;
    window.scrollTo({ top: y, behavior: "smooth" });

    const links = $("#navLinks");
    if(links && links.classList.contains("open")){
      links.classList.remove("open");
      const btn = $(".nav-toggle");
      if(btn) btn.setAttribute("aria-expanded","false");
    }
  }
}

class RevealOnScroll{
  constructor(){
    this.els = $$(".reveal");
    if(!("IntersectionObserver" in window)){
      this.els.forEach(el=>el.classList.add("is-visible"));
      return;
    }
    this.io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add("is-visible");
          this.io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    this.els.forEach(el=> this.io.observe(el));
  }
}

class MobileMenu{
  constructor(){
    this.btn = $(".nav-toggle");
    this.links = $("#navLinks");
    if(!this.btn || !this.links) return;
    this.btn.addEventListener("click", ()=> this.toggle());
    document.addEventListener("click", (e)=> this.onDocClick(e));
  }
  toggle(){
    const open = this.links.classList.toggle("open");
    this.btn.setAttribute("aria-expanded", open ? "true" : "false");
  }
  onDocClick(e){
    if(e.target.closest(".nav")) return;
    if(this.links.classList.contains("open")){
      this.links.classList.remove("open");
      this.btn.setAttribute("aria-expanded","false");
    }
  }
}

class Accordion{
  constructor(){
    this.buttons = $$(".acc-item");
    this.buttons.forEach(btn=>{
      const panel = btn.nextElementSibling;
      if(!panel) return;
      btn.addEventListener("click", ()=> this.toggle(btn, panel));
    });
  }
  toggle(btn, panel){
    const expanded = btn.getAttribute("aria-expanded") === "true";
    this.buttons.forEach(b=>{
      if(b !== btn){
        b.setAttribute("aria-expanded", "false");
        const p = b.nextElementSibling;
        if(p) p.style.maxHeight = "0px";
      }
    });
    btn.setAttribute("aria-expanded", expanded ? "false" : "true");
    panel.style.maxHeight = expanded ? "0px" : panel.scrollHeight + "px";
  }
}

class CopyLink{
  constructor(toast){
    this.toast = toast;
    this.btn = $("#copyLinkBtn");
    if(this.btn) this.btn.addEventListener("click", ()=> this.copy());
  }
  async copy(){
    try{
      await navigator.clipboard.writeText(location.href);
      this.toast?.show("Lenke kopiert!");
    }catch{
      this.toast?.show("Klarte ikke å kopiere.");
    }
  }
}

class Countdown{
  constructor(config){
    this.config = config;
    this.dEl = $("#d"); this.hEl = $("#h"); this.mEl = $("#m"); this.sEl = $("#s");
    this.deadlineText = $("#deadlineText");
    this.themeText = $("#themeText");
    this.target = new Date(this.config.submitDeadline);
    this.timer = null;
    this.init();
  }
  init(){
    if(this.themeText) this.themeText.textContent = this.config.theme;
    if(this.deadlineText){
      const opts = { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit", timeZone: "Europe/Oslo" };
      this.deadlineText.textContent = this.target.toLocaleString("nb-NO", opts) + " (" + this.config.timezoneLabel + ")";
    }
    this.tick();
    this.timer = setInterval(()=> this.tick(), 1000);
  }
  tick(){
    const now = new Date();
    let ms = this.target - now;
    if(ms < 0) ms = 0;
    const s = Math.floor(ms/1000);
    const days = Math.floor(s / 86400);
    const hours = Math.floor((s % 86400) / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    if(this.dEl) this.dEl.textContent = String(days).padStart(2,"0");
    if(this.hEl) this.hEl.textContent = String(hours).padStart(2,"0");
    if(this.mEl) this.mEl.textContent = String(mins).padStart(2,"0");
    if(this.sEl) this.sEl.textContent = String(secs).padStart(2,"0");
  }
}

class Confetti{
  static burst(){
    const n = 90;
    const root = document.createElement("div");
    root.style.position = "fixed";
    root.style.inset = "0";
    root.style.pointerEvents = "none";
    root.style.zIndex = "999";
    document.body.appendChild(root);

    for(let i=0;i<n;i++){
      const c = document.createElement("span");
      c.style.position = "absolute";
      c.style.left = (40 + Math.random()*20) + "vw";
      c.style.top = "55vh";
      c.style.width = "8px";
      c.style.height = "8px";
      c.style.borderRadius = "2px";
      c.style.background = `hsl(${Math.random()*360}, 85%, 65%)`;
      c.style.transform = "translate(-50%,-50%)";
      const dx = (Math.random()-0.5) * 520;
      const dy = - (160 + Math.random()*420);
      const rot = (Math.random()*720 - 360);
      const dur = 900 + Math.random()*700;
      c.animate([
        { transform: "translate(-50%,-50%) translate(0,0) rotate(0deg)", opacity: 1 },
        { transform: `translate(-50%,-50%) translate(${dx}px, ${dy}px) rotate(${rot}deg)`, opacity: 0 }
      ], { duration: dur, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" });
      root.appendChild(c);
    }
    setTimeout(()=> root.remove(), 1400);
  }
}

class FormUX{
  constructor(toast){
    this.toast = toast;
    this.submitBtn = $("#submitJamBtn");
    if(this.submitBtn){
      this.submitBtn.addEventListener("click", ()=> this.onSubmit());
    }
  }
  onSubmit(){
    const form = this.submitBtn.closest("form");
    if(form && form.checkValidity()){
      this.toast?.show("Sender inn... Lykke til!");
      Confetti.burst();
    }
  }
}

/* Local storage for form submissions */
function saveSubmission(entry){
  const now = new Date().toISOString();
  let arr = [];
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    arr = raw ? JSON.parse(raw) : [];
    if(!Array.isArray(arr)) arr = [];
  }catch{
    arr = [];
  }
  arr.push({ ...entry, ts: now });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

async function sendSubmissionToApi(entry){
  try{
    const res = await fetch(`${API_BASE}/api/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry)
    });
    if(!res.ok) throw new Error("bad status");
    const json = await res.json().catch(()=>null);
    return json;
  }catch(err){
    console.warn("Klarte ikke å lagre på server (API)", err);
    return null;
  }
}

function attachLocalForms(toaster){
  const registerForm = document.forms["gamejam-register"];
  const submitForm = document.forms["gamejam-submit"];

  const bind = (form, name)=>{
    if(!form) return;
    form.addEventListener("submit", async (e)=>{
      e.preventDefault();
      const btn = form.querySelector("button[type=submit]");
      if(btn) btn.disabled = true;
      const data = new FormData(form);
      const payload = {};
      data.forEach((v,k)=>{
        if(v instanceof File){
          if(v.name){ payload[k] = v.name; }
        }else{
          payload[k] = v;
        }
      });
      payload._form = name;
      saveSubmission(payload);
      const apiResult = await sendSubmissionToApi(payload);
      if(apiResult){
        toaster?.show?.("Sendt! Lagret på server og lokalt.");
      }else{
        toaster?.show?.("Sendt! Lagret lokalt (API utilgjengelig).");
      }
      form.reset();
      if(btn) btn.disabled = false;
    });
  };

  bind(registerForm, "register");
  bind(submitForm, "submit");
}

class CardTilt{
  constructor(){
    this.cards = document.querySelectorAll(".card, .feature, .badge, .project");
    this.cards.forEach(el => el.classList.add("tilt"));
    this.cards.forEach(el=>{
      el.addEventListener("mousemove", (e)=> this.onMove(e, el));
      el.addEventListener("mouseleave", ()=>{ el.style.transform = ""; });
    });
  }
  onMove(e, el){
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `rotateX(${(-y*6).toFixed(2)}deg) rotateY(${(x*8).toFixed(2)}deg) translateY(-2px)`;
  }
}

class TorchRunner{
  constructor(){
    this.overlay = document.getElementById("torchOverlay");
    this.svg = document.getElementById("torchSvg");
    this.maskRect = document.getElementById("torchMaskRect");
    this.darkRect = document.getElementById("torchDarkRect");
    this.lightsG = document.getElementById("torchMaskLights");
    this.torchLayer = document.getElementById("torchLayer");
    this.torchHost = this.torchLayer || document.body;
    this.runner = document.getElementById("runner");
    this.ready = !!(this.overlay && this.svg && this.maskRect && this.darkRect && this.lightsG && this.torchLayer && this.runner);
    if(!this.ready) return;

    this.stepSfx = this.createAudio(assetPath("/assets/sfx/step.ogg"), true, 0.45);
    this.fireSfx = this.createAudio(assetPath("/assets/sfx/fire.mp3"), true, 0.25);
    this.audioUnlocked = false;
    this.firePlaying = false;
    this.active = true;
    this.alive = true;
    this.respawnDelay = 1200;

    this.MAX_TORCHES = 7;
    this.BASE_R = 220;
    this.FLICKER = 18;
    this.SPEED_MIN = 7;
    this.SPEED_MAX = 18;

    this.torches = [];
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.rx = this.w * 0.5;
    this.ry = this.h * 0.6;
    this.tx = this.rx;
    this.ty = this.ry;
    this.moving = false;

    this.resizeSvg = this.resizeSvg.bind(this);
    this.tick = this.tick.bind(this);
    this.stepRunner = this.stepRunner.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);

    this.init();
  }

  init(){
    this.lockLayers();
    this.resizeSvg();
    window.addEventListener("resize", this.resizeSvg);
    this.runner.style.left = (this.rx - window.scrollX) + "px";
    this.runner.style.top  = (this.ry - window.scrollY) + "px";
    this.addTorch(this.rx, this.ry);
    window.addEventListener("pointerdown", this.onPointerDown, { capture: true, passive: true });
    requestAnimationFrame(this.tick);
  }

  createAudio(src, loop=false, volume=1){
    const a = new Audio(src);
    a.loop = loop;
    a.volume = volume;
    a.preload = "auto";
    a.crossOrigin = "anonymous";
    return a;
  }

  lockLayers(){
    this.overlay.style.setProperty("position", "fixed", "important");
    this.overlay.style.setProperty("inset", "0", "important");
    this.overlay.style.setProperty("width", "100vw", "important");
    this.overlay.style.setProperty("height", "100vh", "important");
    this.overlay.style.setProperty("pointer-events", "none", "important");
    this.overlay.style.setProperty("z-index", "5000", "important");

    this.torchLayer.style.setProperty("position", "fixed", "important");
    this.torchLayer.style.setProperty("inset", "0", "important");
    this.torchLayer.style.setProperty("width", "100vw", "important");
    this.torchLayer.style.setProperty("height", "100vh", "important");
    this.torchLayer.style.setProperty("pointer-events", "none", "important");
    this.torchLayer.style.setProperty("z-index", "5500", "important");

    this.runner.style.setProperty("position", "fixed", "important");
    this.runner.style.setProperty("pointer-events", "none", "important");
    this.runner.style.setProperty("z-index", "6000", "important");
  }

  unlockAudio(){
    if(this.audioUnlocked) return;
    this.audioUnlocked = true;
    this.ensureFireLoop();
  }

  playStepLoop(){
    if(!this.stepSfx) return;
    this.stepSfx.play().catch(()=>{});
  }

  stopStepLoop(){
    if(!this.stepSfx) return;
    this.stepSfx.pause();
    this.stepSfx.currentTime = 0;
  }

  ensureFireLoop(){
    if(this.firePlaying) return;
    if(!this.fireSfx) return;
    if(this.torches.length === 0) return;
    this.fireSfx.play().then(()=>{ this.firePlaying = true; }).catch(()=>{});
  }

  stopFireLoop(){
    if(!this.fireSfx) return;
    this.fireSfx.pause();
    this.fireSfx.currentTime = 0;
    this.firePlaying = false;
  }

  getRunnerViewport(){
    return { x: this.rx - window.scrollX, y: this.ry - window.scrollY, alive: this.alive };
  }

  die(){
    if(!this.alive) return;
    this.alive = false;
    this.moving = false;
    this.stopStepLoop();
    this.runner.style.opacity = "0";
    this.runner.classList.remove("walking");
    setTimeout(()=> this.respawn(), this.respawnDelay);
  }

  respawn(){
    this.rx = this.w * 0.5 + window.scrollX;
    this.ry = this.h * 0.6 + window.scrollY;
    this.tx = this.rx;
    this.ty = this.ry;
    this.renderRunner();
    this.runner.style.opacity = "1";
    this.alive = true;
    if(this.active){
      this.addTorch(this.rx, this.ry);
    }
  }

  resizeSvg(){
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.svg.setAttribute("viewBox", `0 0 ${this.w} ${this.h}`);
    this.maskRect.setAttribute("width", this.w);
    this.maskRect.setAttribute("height", this.h);
    this.darkRect.setAttribute("width", this.w);
    this.darkRect.setAttribute("height", this.h);
  }

  addTorch(x, y){
    if(!this.active) return;
    const t = document.createElement("div");
    t.className = "torch";
    t.style.setProperty("position", "fixed", "important");
    t.style.setProperty("pointer-events", "none", "important");
    t.style.left = x + "px";
    t.style.top  = y + "px";
    t.style.zIndex = "5600";

    const flame = document.createElement("span");
    flame.className = "flame";
    t.appendChild(flame);
    this.torchHost.appendChild(t);

    const hole = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    hole.setAttribute("cx", x);
    hole.setAttribute("cy", y);
    hole.setAttribute("r", this.BASE_R);
    hole.setAttribute("fill", "black");
    this.lightsG.appendChild(hole);

    this.torches.push({
      x, y,
      baseR: this.BASE_R,
      seed: Math.random()*1000,
      el: t,
      hole,
      _emitT: 0,
      _emitEvery: 120 + Math.random()*220
    });

    this.burstEmbers(x, y - 18, 18);
    this.ensureFireLoop();

    while(this.torches.length > this.MAX_TORCHES){
      const old = this.torches.shift();
      old.el.remove();
      old.hole.remove();
    }
  }

  renderRunner(sx=window.scrollX, sy=window.scrollY){
    const x = this.rx - sx;
    const y = this.ry - sy;
    this.runner.style.left = x + "px";
    this.runner.style.top  = y + "px";
  }

  spawnEmber(x, y){
    const e = document.createElement("span");
    e.className = "ember";
    const palette = ["#ffcf7a", "#ff9a4a", "#ff6a33"];
    e.style.background = palette[(Math.random()*palette.length)|0];
    const size = 2 + ((Math.random()*3)|0);
    e.style.width = size + "px";
    e.style.height = size + "px";
    e.style.left = x + "px";
    e.style.top  = y + "px";
    this.torchLayer.appendChild(e);

    const dx = (Math.random()-0.5) * 26;
    const dy = -(18 + Math.random()*42);
    const rot = (Math.random()*140 - 70);
    e.animate([
      { transform: "translate(-50%,-50%) translate(0,0) rotate(0deg)", opacity: 0.95 },
      { transform: `translate(-50%,-50%) translate(${dx}px, ${dy}px) rotate(${rot}deg)`, opacity: 0 }
    ], { duration: 520 + Math.random()*420, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" });
    setTimeout(()=> e.remove(), 1200);
  }

  burstEmbers(x, y, n=16){
    for(let i=0;i<n;i++){
      this.spawnEmber(x + (Math.random()-0.5)*8, y + (Math.random()-0.5)*8);
    }
  }

  onPointerDown(e){
    if(e.button !== 0) return;
    if(!this.alive) return;
    if(e.target.closest("#dragon")) return;
    if(e.target.closest("a,button,input,textarea,select,label")) return;
    this.unlockAudio();
    this.tx = e.clientX + window.scrollX;
    this.ty = e.clientY + window.scrollY;
    this.moving = true;
    this.playStepLoop();
    this.runner.classList.add("walking");
  }

  stepRunner(sx=window.scrollX, sy=window.scrollY){
    if(!this.moving) return;
    const dx = this.tx - this.rx;
    const dy = this.ty - this.ry;
    const dist = Math.hypot(dx, dy);
    const speed = Math.min(this.SPEED_MAX, Math.max(this.SPEED_MIN, dist * 0.08));
    if(dist < 6){
      this.rx = this.tx; this.ry = this.ty;
      this.moving = false;
      this.stopStepLoop();
      this.runner.classList.remove("walking");
      this.addTorch(this.tx, this.ty);
      return;
    }
    this.rx += (dx / dist) * speed;
    this.ry += (dy / dist) * speed;
    this.renderRunner(sx, sy);
  }

  tick(t){
    const sx = window.scrollX;
    const sy = window.scrollY;
    if(!this.active) return;
    this.renderRunner(sx, sy);
    this.stepRunner(sx, sy);
    for(const k of this.torches){
      const lx = k.x - sx;
      const ly = k.y - sy;
      k.el.style.left = lx + "px";
      k.el.style.top  = ly + "px";
      k.hole.setAttribute("cx", lx);
      k.hole.setAttribute("cy", ly);
      const flick = Math.sin((t * 0.006) + k.seed) * this.FLICKER + (Math.random() - 0.5) * 6;
      k.hole.setAttribute("r", Math.max(120, k.baseR + flick));
      if(t - k._emitT > k._emitEvery){
        this.spawnEmber(k.x, k.y - 26);
        k._emitT = t;
        k._emitEvery = 120 + Math.random()*220;
      }
    }
    requestAnimationFrame(this.tick);
  }

  revealAll(){
    if(!this.active) return;
    this.active = false;
    window.removeEventListener("pointerdown", this.onPointerDown, { capture: true });
    this.stopStepLoop();
    this.stopFireLoop();
    this.overlay.style.display = "none";
    this.torchLayer.style.display = "none";
    this.runner.style.display = "none";
    this.torches.forEach(k=>{
      k.el.remove();
      k.hole.remove();
    });
    this.torches = [];
  }
}

class DragonGate{
  constructor(torchRunner){
    this.el = document.getElementById("dragon");
    this.torchRunner = torchRunner;
    this.clicks = 0;
    this.vx = 0;
    this.vy = 0;
    this.hitSfx = this.createAudio(assetPath("/assets/sfx/hit.mp3"), false, 0.75);
    this.music = this.createAudio(assetPath("/assets/sfx/music.mp3"), true, 0.7);
    this.musicStarted = false;
    this.fireballs = [];
    this.fireInterval = null;
    this.arrows = [];
    this.finTimeout = null;
    this.wanderId = null;
    this.wanderSpeed = 40; // px/s
    this.wanderTarget = null;
    if(!this.el) return;
    this.el.style.backgroundImage = `url("${assetPath("/assets/sfx/dragon.png")}")`;
    this.el.style.setProperty("position", "fixed", "important");
    this.el.style.setProperty("z-index", "6500", "important");
    this.el.style.setProperty("pointer-events", "auto", "important");
    this.el.style.setProperty("transform", "translate(-50%,-50%)", "important");
    this.setInitialPosition();
    this.onClick = this.onClick.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.unlockMusic = this.unlockMusic.bind(this);
    this.el.addEventListener("click", this.onClick);
    window.addEventListener("resize", this.onResize);
    window.addEventListener("scroll", this.onScroll, { passive: true });
    document.addEventListener("click", this.unlockMusic, { capture: true, passive: true });
    this.startFire();
    this.startWander();
  }
  createAudio(src, loop=false, volume=1){
    const a = new Audio(src);
    a.loop = loop;
    a.volume = volume;
    a.preload = "auto";
    a.crossOrigin = "anonymous";
    return a;
  }
  setInitialPosition(){
    const w = window.innerWidth;
    const h = window.innerHeight;
    const size = this.el.offsetWidth || 140;
    const x = Math.max(0, w - size * 0.5 - 24);
    const y = h * 0.5;
    this.positionAt(x, y);
  }
  positionAt(x, y){
    this.vx = x;
    this.vy = y;
    this.el.style.right = "auto";
    this.el.style.left = `${x}px`;
    this.el.style.top = `${y}px`;
    this.el.style.setProperty("left", `${x}px`, "important");
    this.el.style.setProperty("top", `${y}px`, "important");
    this.el.style.setProperty("transform", "translate(-50%,-50%)", "important");
  }
  setRandomPosition(){
    const w = window.innerWidth;
    const h = window.innerHeight;
    const size = this.el.offsetWidth || 140;
    const margin = 30;
    const maxX = Math.max(margin, w - margin - size);
    const maxY = Math.max(margin, h - margin - size);
    const x = margin + Math.random() * (maxX - margin);
    const y = margin + Math.random() * (maxY - margin);
    this.positionAt(x, y);
  }
  startWander(){
    if(this.wanderId) return;
    this.pickNewTarget();
    let last = null;
    const step = (ts)=>{
      if(!this.el) return;
      if(!last) last = ts;
      const dt = (ts - last) / 1000;
      last = ts;
      if(this.wanderTarget){
        const dx = this.wanderTarget.x - this.vx;
        const dy = this.wanderTarget.y - this.vy;
        const dist = Math.hypot(dx, dy);
        if(dist < 4){
          this.pickNewTarget();
        }else{
          const move = this.wanderSpeed * dt;
          const nx = this.vx + (dx / dist) * move;
          const ny = this.vy + (dy / dist) * move;
          this.positionAt(nx, ny);
        }
      }
      this.wanderId = requestAnimationFrame(step);
    };
    this.wanderId = requestAnimationFrame(step);
  }

  pickNewTarget(){
    const w = window.innerWidth;
    const h = window.innerHeight;
    const size = this.el.offsetWidth || 140;
    const margin = 30;
    const maxX = Math.max(margin, w - margin - size);
    const maxY = Math.max(margin, h - margin - size);
    const x = margin + Math.random() * (maxX - margin);
    const y = margin + Math.random() * (maxY - margin);
    this.wanderTarget = { x, y };
  }

  stopWander(){
    if(this.wanderId){
      cancelAnimationFrame(this.wanderId);
      this.wanderId = null;
    }
  }
  onClick(){
    // fire arrow from runner towards dragon; only if runner alive
    if(!this.torchRunner || !this.torchRunner.alive) return;
    const runnerPos = this.torchRunner.getRunnerViewport();
    this.spawnArrow(runnerPos.x, runnerPos.y, this.vx, this.vy);
  }
  onResize(){
    if(this.clicks === 0){
      this.setInitialPosition();
    }
  }
  onScroll(){
    // keep dragon locked to viewport coords even if layout changes with scroll
    this.positionAt(this.vx, this.vy);
  }

  startFire(){
    if(this.fireInterval) return;
    this.fireInterval = setInterval(()=> this.shootFireball(), 1000);
  }

  stopFire(){
    if(this.fireInterval){
      clearInterval(this.fireInterval);
      this.fireInterval = null;
    }
    this.fireballs.forEach(fb=> fb.el.remove());
    this.fireballs = [];
  }

  shootFireball(){
    if(!this.torchRunner || !this.torchRunner.active) return;
    const runnerPos = this.torchRunner.getRunnerViewport();
    if(!runnerPos.alive) return;
    const startX = this.vx;
    const startY = this.vy;
    const dx = runnerPos.x - startX;
    const dy = runnerPos.y - startY;
    const dist = Math.hypot(dx, dy) || 1;
    const dirX = dx / dist;
    const dirY = dy / dist;
    const speed = 520; // px/s
    const el = document.createElement("div");
    el.className = "fireball";
    el.style.backgroundImage = `url("${assetPath("/assets/sfx/fireball.png")}")`;
    el.style.left = startX + "px";
    el.style.top  = startY + "px";
    el.style.setProperty("position", "fixed", "important");
    this.el.parentElement.appendChild(el);

    const fb = { el, x: startX, y: startY };
    this.fireballs.push(fb);

    let last = null;
    const step = (ts)=>{
      if(!last) last = ts;
      const dt = (ts - last) / 1000;
      last = ts;
      fb.x += dirX * speed * dt;
      fb.y += dirY * speed * dt;
      el.style.left = fb.x + "px";
      el.style.top  = fb.y + "px";

      const rPos = this.torchRunner.getRunnerViewport();
      if(rPos.alive){
        const d = Math.hypot((fb.x - rPos.x), (fb.y - rPos.y));
        if(d < 24){
          this.torchRunner.die();
          this.destroyFireball(fb);
          return;
        }
      }

      const w = window.innerWidth;
      const h = window.innerHeight;
      if(fb.x < -60 || fb.x > w + 60 || fb.y < -60 || fb.y > h + 60){
        this.destroyFireball(fb);
        return;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  destroyFireball(fb){
    fb.el.remove();
    this.fireballs = this.fireballs.filter(k=>k!==fb);
  }

  startMusic(){
    if(!this.music || this.musicStarted) return;
    this.musicStarted = true;
    this.music.play().catch(()=>{});
  }

  stopMusic(){
    if(!this.music) return;
    this.music.pause();
    this.music.currentTime = 0;
    this.musicStarted = false;
    document.removeEventListener("click", this.unlockMusic, true);
  }

  unlockMusic(){
    this.startMusic();
    document.removeEventListener("click", this.unlockMusic, true);
  }

  spawnArrow(sx, sy, tx, ty){
    const el = document.createElement("div");
    el.className = "arrow";
    el.style.backgroundImage = `url("${assetPath("/assets/sfx/bullet.png")}")`;
    el.style.left = sx + "px";
    el.style.top  = sy + "px";
    el.style.setProperty("position", "fixed", "important");
    this.el.parentElement.appendChild(el);

    const dx = tx - sx;
    const dy = ty - sy;
    const dist = Math.hypot(dx, dy) || 1;
    const dirX = dx / dist;
    const dirY = dy / dist;
    const angle = Math.atan2(dirY, dirX) * 180 / Math.PI;
    el.style.transform = `translate(-50%,-50%) rotate(${angle}deg)`;

    const speed = 700; // px/s
    const arrow = { el, x: sx, y: sy };
    this.arrows.push(arrow);

    let last = null;
    const step = (ts)=>{
      if(!last) last = ts;
      const dt = (ts - last) / 1000;
      last = ts;
      arrow.x += dirX * speed * dt;
      arrow.y += dirY * speed * dt;
      el.style.left = arrow.x + "px";
      el.style.top  = arrow.y + "px";

      const d = Math.hypot((arrow.x - this.vx), (arrow.y - this.vy));
      if(d < 28){
        this.registerHit();
        this.destroyArrow(arrow);
        return;
      }

      const w = window.innerWidth;
      const h = window.innerHeight;
      if(arrow.x < -80 || arrow.x > w + 80 || arrow.y < -80 || arrow.y > h + 80){
        this.destroyArrow(arrow);
        return;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  destroyArrow(ar){
    ar.el.remove();
    this.arrows = this.arrows.filter(k=>k!==ar);
  }

  registerHit(){
    if(this.hitSfx){
      this.hitSfx.currentTime = 0;
      this.hitSfx.play().catch(()=>{});
    }
    this.screenShake();
    this.clicks += 1;
    if(this.clicks >= 5){
      this.el.style.opacity = "0";
      this.el.style.pointerEvents = "none";
      window.removeEventListener("resize", this.onResize);
      window.removeEventListener("scroll", this.onScroll);
      this.stopFire();
      this.stopMusic();
      this.stopWander();
      this.arrows.forEach(a=>a.el.remove());
      this.arrows = [];
      this.playFinAnimation().then(()=>{
        if(this.torchRunner && typeof this.torchRunner.revealAll === "function"){
          this.torchRunner.revealAll();
        }
      });
      return;
    }
    this.setRandomPosition();
  }

  screenShake(){
    const root = document.documentElement;
    root.style.setProperty("transition", "transform 0.12s ease");
    root.style.setProperty("transform", "translate(3px, -3px)");
    clearTimeout(this.shakeTimeout);
    this.shakeTimeout = setTimeout(()=>{
      root.style.setProperty("transform", "");
    }, 140);
  }

  playFinAnimation(){
    return new Promise((resolve)=>{
      const video = document.createElement("video");
      video.src = assetPath("/assets/sfx/fin.mov");
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;
      video.style.position = "fixed";
      video.style.inset = "0";
      video.style.width = "100vw";
      video.style.height = "100vh";
      video.style.objectFit = "cover";
      video.style.zIndex = "9000";
      video.style.pointerEvents = "none";
      video.style.background = "black";

      const audio = new Audio(assetPath("/assets/sfx/on.mp3"));
      audio.autoplay = true;
      audio.volume = 0.8;
      audio.preload = "auto";

      const cleanup = ()=>{
        clearTimeout(this.finTimeout);
        video.remove();
        audio.pause();
        audio.currentTime = 0;
        resolve();
      };

      video.addEventListener("ended", cleanup, { once: true });
      document.body.appendChild(video);
      video.play().catch(()=>{ cleanup(); });
      audio.play().catch(()=>{});
      // Fallback in case ended doesn't fire
      this.finTimeout = setTimeout(cleanup, 6000);
    });
  }
}

class JamApp{
  constructor(config){
    this.config = { ...JAM_CONFIG, ...config };
    this.toast = new Toast($("#toast"));
  }
  init(){
    const overlay = $(".page-transition");
    if(overlay){
      overlay.classList.add("on");
      setTimeout(()=> overlay.classList.remove("on"), 60);
    }

    new PageTransition();
    new SmoothAnchors();
    new RevealOnScroll();
    new MobileMenu();
    new Accordion();
    new CopyLink(this.toast);
    new Countdown(this.config);
    new FormUX(this.toast);
    attachLocalForms(this.toast);
    new CardTilt();
    this.torchRunner = new TorchRunner();
    this.dragonGate = new DragonGate(this.torchRunner);
  }
}

document.addEventListener("DOMContentLoaded", ()=>{
  new JamApp().init();
});
