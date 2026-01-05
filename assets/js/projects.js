(()=> {
  const $ = (q, root=document) => root.querySelector(q);
  const $$ = (q, root=document) => Array.from(root.querySelectorAll(q));
  const ASSET_BASE = location.pathname.includes("/hamartech-gamejam") ? "/hamartech-gamejam" : "";
  const assetPath = (p) => `${ASSET_BASE}${p}`;
  const STORAGE_KEY = "jam_submissions_v1";

  function loadLocalSubmissions(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : [];
      if(Array.isArray(data)) return data;
      return normalizeSubmissions([data]);
    }catch(err){
      console.warn("Kunne ikke lese lokale innsendinger", err);
      return [];
    }
  }

  async function loadApiSubmissions(){
    try{
      const res = await fetch(`${ASSET_BASE}/api/submissions`, { cache: "no-store" });
      if(!res.ok) throw new Error("bad status " + res.status);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }catch(err){
      console.warn("API submissions unavailable", err);
      return [];
    }
  }

  function normalizeSubmissions(list){
    return (list || [])
      .map(item=>{
        if(item && typeof item === "object") return item;
        if(typeof item === "string"){
          try{ return JSON.parse(item); }catch{return null;}
        }
        return null;
      })
      .filter(Boolean);
  }

  const safe = (v="")=> String(v).replace(/[<>"']/g, (ch)=>{
    switch(ch){
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "\"": return "&quot;";
      case "'": return "&#39;";
      default: return ch;
    }
  });

  async function renderLocal(){
    const grid = $("#grid");
    const empty = $("#empty");
    if(!grid) return;

    const [apiSubs, localSubs] = await Promise.all([
      loadApiSubmissions(),
      Promise.resolve(loadLocalSubmissions())
    ]);

    const submissions = normalizeSubmissions([...apiSubs, ...localSubs]).filter(s=>{
      if(s._form === "submit") return true;
      // Fallback for eldre data uten _form flagg
      return !!(s.title || s.author || s.link || s.description);
    });

    if(submissions.length === 0){
      grid.innerHTML = "";
      if(empty){
        empty.hidden = false;
        empty.innerHTML = `<p>Ingen lokale innsendinger enda. Send inn fra forsiden og apne denne siden i samme nettleser.</p>`;
        const raw = localStorage.getItem(STORAGE_KEY);
        if(raw === null){
          empty.innerHTML += `<p class="small muted">Ingen data i localStorage for nøkkel "${STORAGE_KEY}".</p>`;
        }else{
          empty.innerHTML += `<p class="small muted">Fant data, men ingen gyldige prosjekter. Rådata (dev): ${safe(raw)}</p>`;
        }
      }
      return;
    }

    grid.innerHTML = submissions.map(s=>{
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
})();
