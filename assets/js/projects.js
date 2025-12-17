const $ = (q, root=document) => root.querySelector(q);
const $$ = (q, root=document) => Array.from(root.querySelectorAll(q));
const ASSET_BASE = location.pathname.includes("/hamartech-gamejam") ? "/hamartech-gamejam" : "";
const assetPath = (p) => `${ASSET_BASE}${p}`;
const STORAGE_KEY = "jam_submissions_v1";

function loadLocalSubmissions(){
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function renderLocal(){
  const grid = $("#grid");
  const empty = $("#empty");
  if(!grid) return;

  const submissions = loadLocalSubmissions().filter(s=>s._form === "submit");
  if(submissions.length === 0){
    grid.innerHTML = "";
    if(empty){
      empty.hidden = false;
      empty.innerHTML = `<p>Ingen lokale innsendinger ennå. Send inn fra forsiden og åpne denne siden i samme nettleser.</p>`;
    }
    return;
  }

  grid.innerHTML = submissions.map(s=>{
    const safe = (v="")=> String(v).replaceAll("<","&lt;").replaceAll(">","&gt;");
    const tags = (s.tags || s.engine || "").toString();
    return `
      <article class="project reveal is-visible">
        <h3>${safe(s.title)}</h3>
        <p class="muted">${safe(s.description)}</p>
        <div class="meta">
          <span class="tag">${safe(s.author || "Team")}</span>
          <span class="tag">${safe(s.engine || "Engine")}</span>
          ${tags ? `<span class="tag">${safe(tags)}</span>` : ""}
        </div>
        ${s.link ? `<a class="btn btn-primary" href="${safe(s.link)}" target="_blank" rel="noreferrer">Spill / Se</a>` : ""}
      </article>
    `;
  }).join("");

  if(empty) empty.hidden = true;
}

document.addEventListener("DOMContentLoaded", ()=> renderLocal());
