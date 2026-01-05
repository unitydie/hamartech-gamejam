const path = require("path");
const fs = require("fs/promises");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 8000;
const BASE_PATH = process.env.BASE_PATH || "/hamartech-gamejam";
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "submissions.json");

app.use(express.json({ limit: "2mb" }));

async function ensureStore(){
  await fs.mkdir(DATA_DIR, { recursive: true });
  try{
    await fs.access(DATA_FILE);
  }catch{
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

async function readStore(){
  try{
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  }catch{
    return [];
  }
}

async function appendStore(entry){
  const list = await readStore();
  const record = {
    id: Date.now().toString(36) + Math.random().toString(16).slice(2, 8),
    ts: new Date().toISOString(),
    ...entry
  };
  list.push(record);
  await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2), "utf8");
  return record;
}

app.post(`${BASE_PATH}/api/submissions`, async (req, res) => {
  const body = req.body || {};
  try{
    const saved = await appendStore(body);
    res.status(201).json(saved);
  }catch(err){
    console.error("Failed to save submission", err);
    res.status(500).json({ error: "Could not save submission" });
  }
});

app.get(`${BASE_PATH}/api/submissions`, async (_req, res) => {
  try{
    const data = await readStore();
    res.json(data);
  }catch(err){
    res.status(500).json({ error: "Could not read submissions" });
  }
});

app.use(BASE_PATH, express.static(__dirname));

app.get("/", (_req, res) => {
  res.redirect(`${BASE_PATH}/`);
});

app.use((req, res, next) => {
  if(req.path.startsWith(BASE_PATH)) return next();
  return res.redirect(`${BASE_PATH}${req.path}`);
});

ensureStore().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}${BASE_PATH}/`);
  });
}).catch((err)=>{
  console.error("Could not prepare storage", err);
  process.exit(1);
});
