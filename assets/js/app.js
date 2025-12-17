/* HamarTech GameJam — app.js
   - Smooth anchor scrolling
   - Reveal-on-scroll
   - Mobile menu
   - Accordion
   - Countdown
   - Page transitions
   - Toast + confetti
   - Torch + runner overlay
*/

const $ = (q, root=document) => root.querySelector(q);
const $$ = (q, root=document) => Array.from(root.querySelectorAll(q));

function toast(msg){
  const el = $("#toast");
  if(!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(()=> el.classList.remove("show"), 2600);
}

function pageTransition(){
  const overlay = document.querySelector(".page-transition");
  if(!overlay) return;
  requestAnimationFrame(()=> overlay.classList.remove("on"));

  document.addEventListener("click", (e)=>{
    const a = e.target.closest("a");
    if(!a) return;
    const href = a.getAttribute("href");
    if(!href) return;

    const isAnchor = href.startsWith("#") || href.startsWith("/#");
    const isExternal = /^https?:\/\//.test(href) && !href.startsWith(location.origin);
    if(isExternal || isAnchor) return;
    if(a.target === "_blank") return;

    e.preventDefault();
    overlay.classList.add("on");
    setTimeout(()=> { window.location.href = href; }, 220);
  });
}

function smoothAnchors(){
  document.addEventListener("click", (e)=>{
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
  });
}

function revealOnScroll(){
  const els = $$(".reveal");
  if(!("IntersectionObserver" in window)){
    els.forEach(el=>el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el=> io.observe(el));
}

function mobileMenu(){
  const btn = $(".nav-toggle");
  const links = $("#navLinks");
  if(!btn || !links) return;

  btn.addEventListener("click", ()=>{
    const open = links.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  document.addEventListener("click", (e)=>{
    if(e.target.closest(".nav")) return;
    if(links.classList.contains("open")){
      links.classList.remove("open");
      btn.setAttribute("aria-expanded","false");
    }
  });
}

function accordion(){
  $$(".acc-item").forEach((btn)=>{
    const panel = btn.nextElementSibling;
    if(!panel) return;

    btn.addEventListener("click", ()=>{
      const expanded = btn.getAttribute("aria-expanded") === "true";
      $$(".acc-item").forEach(b=>{
        if(b !== btn){
          b.setAttribute("aria-expanded", "false");
          const p = b.nextElementSibling;
          if(p) p.style.maxHeight = "0px";
        }
      });

      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      panel.style.maxHeight = expanded ? "0px" : panel.scrollHeight + "px";
    });
  });
}

function setupCopyLink(){
  const btn = $("#copyLinkBtn");
  if(!btn) return;
  btn.addEventListener("click", async ()=>{
    try{
      await navigator.clipboard.writeText(location.href);
      toast("Lenke kopiert!");
    }catch{
      toast("Klarte ikke å kopiere.");
    }
  });
}

/* EDIT THESE for real event */
const CONFIG = {
  theme: "Tema annonseres ved oppstart.",
  submitDeadline: "2026-01-15T18:00:00",
  timezoneLabel: "lokal tid",
};

function countdown(){
  const dEl = $("#d"), hEl = $("#h"), mEl = $("#m"), sEl = $("#s");
  const deadlineText = $("#deadlineText");
  const themeText = $("#themeText");
  if(themeText) themeText.textContent = CONFIG.theme;

  const target = new Date(CONFIG.submitDeadline);
  if(deadlineText){
    const opts = { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit", timeZone: "Europe/Oslo" };
    deadlineText.textContent = target.toLocaleString("nb-NO", opts) + " (" + CONFIG.timezoneLabel + ")";
  }

  function tick(){
    const now = new Date();
    let ms = target - now;
    if(ms < 0) ms = 0;

    const s = Math.floor(ms/1000);
    const days = Math.floor(s / 86400);
    const hours = Math.floor((s % 86400) / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;

    if(dEl) dEl.textContent = String(days).padStart(2,"0");
    if(hEl) hEl.textContent = String(hours).padStart(2,"0");
    if(mEl) mEl.textContent = String(mins).padStart(2,"0");
    if(sEl) sEl.textContent = String(secs).padStart(2,"0");
  }
  tick();
  setInterval(tick, 1000);
}

/* Tiny confetti (no deps) */
function confettiBurst(){
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

function formUX(){
  const submitBtn = $("#submitJamBtn");
  if(submitBtn){
    submitBtn.addEventListener("click", ()=>{
      const form = submitBtn.closest("form");
      if(form && form.checkValidity()){
        toast("Sender inn... Lykke til!");
        confettiBurst();
      }
    });
  }
}

function cardTilt(){
  const cards = document.querySelectorAll(".card, .feature, .badge, .project");
  cards.forEach(el => el.classList.add("tilt"));

  cards.forEach(el=>{
    el.addEventListener("mousemove", (e)=>{
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `rotateX(${(-y*6).toFixed(2)}deg) rotateY(${(x*8).toFixed(2)}deg) translateY(-2px)`;
    });
    el.addEventListener("mouseleave", ()=>{ el.style.transform = ""; });
  });
}

/* embers */
function spawnEmber(layer, x, y){
  const e = document.createElement("span");
  e.className = "ember";

  const palette = ["#ffcf7a", "#ff9a4a", "#ff6a33"];
  e.style.background = palette[(Math.random()*palette.length)|0];

  const size = 2 + ((Math.random()*3)|0);
  e.style.width = size + "px";
  e.style.height = size + "px";

  e.style.left = x + "px";
  e.style.top  = y + "px";
  layer.appendChild(e);

  const dx = (Math.random()-0.5) * 26;
  const dy = -(18 + Math.random()*42);
  const rot = (Math.random()*140 - 70);

  e.animate([
    { transform: "translate(-50%,-50%) translate(0,0) rotate(0deg)", opacity: 0.95 },
    { transform: `translate(-50%,-50%) translate(${dx}px, ${dy}px) rotate(${rot}deg)`, opacity: 0 }
  ], { duration: 520 + Math.random()*420, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" });

  setTimeout(()=> e.remove(), 1200);
}
function burstEmbers(layer, x, y, n=16){
  for(let i=0;i<n;i++){
    spawnEmber(layer, x + (Math.random()-0.5)*8, y + (Math.random()-0.5)*8);
  }
}

/* Torch + runner overlay */
function torchRunnerMode(){
  const overlay = document.getElementById("torchOverlay");
  const svg = document.getElementById("torchSvg");
  const maskRect = document.getElementById("torchMaskRect");
  const darkRect = document.getElementById("torchDarkRect");
  const lightsG = document.getElementById("torchMaskLights");
  const torchLayer = document.getElementById("torchLayer");
  const runner = document.getElementById("runner");
  if(!overlay || !svg || !maskRect || !darkRect || !lightsG || !torchLayer || !runner) return;

  const MAX_TORCHES = 7;
  const BASE_R = 220;
  const FLICKER = 18;
  const SPEED_MIN = 7;
  const SPEED_MAX = 18;

  let w = window.innerWidth, h = window.innerHeight;

  function resizeSvg(){
    w = window.innerWidth; h = window.innerHeight;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    maskRect.setAttribute("width", w);
    maskRect.setAttribute("height", h);
    darkRect.setAttribute("width", w);
    darkRect.setAttribute("height", h);
  }
  resizeSvg();
  window.addEventListener("resize", resizeSvg);

  const torches = []; // {x,y,baseR,seed,el,hole,_emitT,_emitEvery}

  function addTorch(x, y){
    const t = document.createElement("div");
    t.className = "torch";
    t.style.left = x + "px";
    t.style.top  = y + "px";

    // flame element (CSS anim)
    const flame = document.createElement("span");
    flame.className = "flame";
    t.appendChild(flame);

    torchLayer.appendChild(t);

    const hole = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    hole.setAttribute("cx", x);
    hole.setAttribute("cy", y);
    hole.setAttribute("r", BASE_R);
    hole.setAttribute("fill", "black");
    lightsG.appendChild(hole);

    torches.push({
      x, y,
      baseR: BASE_R,
      seed: Math.random()*1000,
      el: t,
      hole,
      _emitT: 0,
      _emitEvery: 120 + Math.random()*220
    });

    burstEmbers(torchLayer, x, y - 18, 18);

    while(torches.length > MAX_TORCHES){
      const old = torches.shift();
      old.el.remove();
      old.hole.remove();
    }
  }

  // runner movement (fixed to viewport)
  let rx = w * 0.5, ry = h * 0.6;
  let tx = rx, ty = ry;
  let moving = false;

  runner.style.left = rx + "px";
  runner.style.top  = ry + "px";

  // стартовый факел
  addTorch(rx, ry);

  window.addEventListener("pointerdown", (e)=>{
    if(e.button !== 0) return;
    if(e.target.closest("a,button,input,textarea,select,label")) return;

    tx = e.clientX;
    ty = e.clientY;

    moving = true;
    runner.classList.add("walking");
  }, { capture: true, passive: true });

  function stepRunner(){
    if(!moving) return;

    const dx = tx - rx;
    const dy = ty - ry;
    const dist = Math.hypot(dx, dy);
    const speed = Math.min(SPEED_MAX, Math.max(SPEED_MIN, dist * 0.08));

    if(dist < 6){
      rx = tx; ry = ty;
      moving = false;
      runner.classList.remove("walking");
      addTorch(tx, ty);
      return;
    }

    rx += (dx / dist) * speed;
    ry += (dy / dist) * speed;

    runner.style.left = rx + "px";
    runner.style.top  = ry + "px";
  }

  function tick(t){
    stepRunner();

    for(const k of torches){
      // stay in viewport
      k.el.style.left = k.x + "px";
      k.el.style.top  = k.y + "px";
      k.hole.setAttribute("cx", k.x);
      k.hole.setAttribute("cy", k.y);

      const flick = Math.sin((t * 0.006) + k.seed) * FLICKER + (Math.random() - 0.5) * 6;
      k.hole.setAttribute("r", Math.max(120, k.baseR + flick));

      if(t - k._emitT > k._emitEvery){
        spawnEmber(torchLayer, k.x, k.y - 26);
        k._emitT = t;
        k._emitEvery = 120 + Math.random()*220;
      }
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

document.addEventListener("DOMContentLoaded", ()=>{
  const overlay = $(".page-transition");
  if(overlay) overlay.classList.add("on");
  setTimeout(()=> overlay && overlay.classList.remove("on"), 60);

  pageTransition();
  smoothAnchors();
  revealOnScroll();
  mobileMenu();
  accordion();
  setupCopyLink();
  countdown();
  formUX();
  cardTilt();
  torchRunnerMode();
});
