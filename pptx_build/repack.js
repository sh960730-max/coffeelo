const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");

const workDir = "C:/SMARTECOSYS/pptx_build/pptx_unpack";
const outPath = "C:/SMARTECOSYS/pptx_build/output4.pptx";

async function run() {
  const zip = new JSZip();
  function addDir(dirPath, relBase) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dirPath, e.name);
      const rel = relBase ? relBase + "/" + e.name : e.name;
      if (e.isDirectory()) addDir(full, rel);
      else zip.file(rel, fs.readFileSync(full));
    }
  }
  addDir(workDir, "");
  const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(outPath, buf);
  console.log("Wrote:", outPath, buf.length, "bytes");
}

run().catch(e => { console.error(e); process.exit(1); });
