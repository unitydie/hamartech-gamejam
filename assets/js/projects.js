const $ = (q, root=document) => root.querySelector(q);
const $$ = (q, root=document) => Array.from(root.querySelectorAll(q));
const ASSET_BASE = location.pathname.includes("/hamartech-gamejam") ? "/hamartech-gamejam" : "";
const assetPath = (p) => `${ASSET_BASE}${p}`;

async function loadProjects(){
  const res = await fetch(assetPath("/assets/data/projects.json"), { cache: "no-store" });
  if(!res.ok) throw new Error("Kunne ikke laste prosjekter");
  return await res.json();
}

function uniq(arr){
  return Array.from(new Set(arr)).sort((a,b)=>a.localeCompare(b));
}

function render(projects){
  const q = ($("#q")?.value || "").toLowerCase().trim();
  const engine = $("#engine")?.value || "";
  const tag = $("#tag")?.value || "";
  const grid = $("#grid");
  const empty = $("#empty");
  if(!grid) return;

  const filtered = projects.filter(p=>{
    const hay = `${p.title} ${p.author} ${p.engine} ${(p.tags||[]).join(" ")}`.toLowerCase();
    if(q && !hay.includes(q)) return false;
    if(engine && p.engine !== engine) return false;
    if(tag && !(p.tags||[]).includes(tag)) return false;
    return true;
  });

  grid.innerHTML = filtered.map(p=>{
    const tags = (p.tags||[]).map(t=>`<span class="tag">${t}</span>`).join("");
    const safe = (s)=> String(s||"").replaceAll("<","&lt;").replaceAll(">","&gt;");
    return `
      <article class="project reveal is-visible">
        <h3>${safe(p.title)}</h3>
        <p class="muted">${safe(p.description)}</p>
        <div class="meta">
          <span class="tag">${safe(p.author)}</span>
          <span class="tag">${safe(p.engine || "Engine")}</span>
          ${tags}
        </div>
        <a class="btn btn-primary" href="${safe(p.link)}" target="_blank" rel="noreferrer">Spill / Se</a>
      </article>
    `;
  }).join("");

  if(empty) empty.hidden = filtered.length !== 0;
}

async function init(){
  const projects = await loadProjects();

  const engines = uniq(projects.map(p=>p.engine).filter(Boolean));
  const tags = uniq(projects.flatMap(p=>p.tags||[]).filter(Boolean));

  const engineSel = $("#engine");
  const tagSel = $("#tag");
  if(engineSel){
    engines.forEach(e=>{
      const o = document.createElement("option");
      o.value = e; o.textContent = e;
      engineSel.appendChild(o);
    });
  }
  if(tagSel){
    tags.forEach(t=>{
      const o = document.createElement("option");
      o.value = t; o.textContent = t;
      tagSel.appendChild(o);
    });
  }

  ["q","engine","tag"].forEach(id=>{
    const el = $("#"+id);
    if(el) el.addEventListener("input", ()=> render(projects));
    if(el) el.addEventListener("change", ()=> render(projects));
  });

  render(projects);
}

document.addEventListener("DOMContentLoaded", ()=>{
  init().catch(()=>{
    const grid = $("#grid");
    if(grid) grid.innerHTML = `<div class="card">Kunne ikke laste prosjekter.</div>`;
  });
});
