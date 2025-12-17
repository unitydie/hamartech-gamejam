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
const assetPath = (p) => `${ASSET_BASE}${p}`;

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

  renderRunner(){
    const x = this.rx - window.scrollX;
    const y = this.ry - window.scrollY;
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
    if(e.target.closest("a,button,input,textarea,select,label")) return;
    this.unlockAudio();
    this.tx = e.clientX + window.scrollX;
    this.ty = e.clientY + window.scrollY;
    this.moving = true;
    this.playStepLoop();
    this.runner.classList.add("walking");
  }

  stepRunner(){
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
    this.renderRunner();
  }

  tick(t){
    if(!this.active) return;
    this.renderRunner();
    this.stepRunner();
    for(const k of this.torches){
      k.el.style.left = (k.x - window.scrollX) + "px";
      k.el.style.top  = (k.y - window.scrollY) + "px";

      k.hole.setAttribute("cx", k.x - window.scrollX);
      k.hole.setAttribute("cy", k.y - window.scrollY);
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
    if(!this.el) return;
    this.el.style.backgroundImage = `url("${assetPath("/assets/sfx/dragon.png")}")`;
    this.onClick = this.onClick.bind(this);
    this.el.addEventListener("click", this.onClick);
  }
  onClick(){
    this.clicks += 1;
    if(this.clicks >= 5){
      this.el.style.opacity = "0";
      this.el.style.pointerEvents = "none";
      if(this.torchRunner && typeof this.torchRunner.revealAll === "function"){
        this.torchRunner.revealAll();
      }
    }
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
    new CardTilt();
    this.torchRunner = new TorchRunner();
    this.dragonGate = new DragonGate(this.torchRunner);
  }
}

document.addEventListener("DOMContentLoaded", ()=>{
  new JamApp().init();
});
