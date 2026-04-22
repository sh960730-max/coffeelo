// Fix slide 18 yellow outline by editing the pptx XML directly
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const srcPptx = "C:/SMARTECOSYS/pptx_build/output4.pptx";
const workDir = "C:/SMARTECOSYS/pptx_build/pptx_unpack";

// Clean work dir
if (fs.existsSync(workDir)) {
  fs.rmSync(workDir, { recursive: true, force: true });
}
fs.mkdirSync(workDir, { recursive: true });

// Unzip using PowerShell
execSync(`powershell.exe -Command "Expand-Archive -Path '${srcPptx}' -DestinationPath '${workDir}' -Force"`, { stdio: "inherit" });

const slide18Path = path.join(workDir, "ppt", "slides", "slide18.xml");
let xml = fs.readFileSync(slide18Path, "utf8");

// Strategy 1: Find tblPr and tableStyleId, change styleId or remove
console.log("Before length:", xml.length);

// Look for <a:tblPr ...> opening
const tblPrMatch = xml.match(/<a:tblPr[^>]*>([\s\S]*?)<\/a:tblPr>/);
if (tblPrMatch) {
  console.log("Found tblPr:", tblPrMatch[0].substring(0, 200));
}

// Remove <a:tableStyleId>...</a:tableStyleId>
xml = xml.replace(/<a:tableStyleId>[^<]+<\/a:tableStyleId>/g, "");

// Replace yellow border colors (#FFC000, #FFEB99, etc.) in the slide with transparent or none
// PowerPoint yellow outline may be encoded as srgbClr
xml = xml.replace(/<a:srgbClr val="FFC000"\/>/g, '<a:srgbClr val="E5E7EB"/>');
xml = xml.replace(/<a:srgbClr val="FFA500"\/>/g, '<a:srgbClr val="E5E7EB"/>');
xml = xml.replace(/<a:srgbClr val="F59E0B"\/>/g, '<a:srgbClr val="E5E7EB"/>');

// Also find any lnL/lnR/lnT/lnB that have yellow stroke
console.log("After length:", xml.length);

fs.writeFileSync(slide18Path, xml, "utf8");
console.log("Wrote modified slide18.xml");

// Repack: we need to zip ppt_unpack back into pptx
const outPath = "C:/SMARTECOSYS/pptx_build/output4b.pptx";
if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
// Use PowerShell Compress-Archive with -Force then rename
// But Compress-Archive creates zip with folder structure — need to zip contents
// Better: use jszip
const JSZip = (function () {
  try {
    return require("jszip");
  } catch {
    console.log("Installing jszip...");
    execSync("npm install jszip --no-save", { stdio: "inherit", cwd: "C:/SMARTECOSYS/pptx_build" });
    return require("jszip");
  }
})();

async function repack() {
  const zip = new JSZip();
  function addDir(dirPath, relBase) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dirPath, e.name);
      const rel = relBase ? relBase + "/" + e.name : e.name;
      if (e.isDirectory()) {
        addDir(full, rel);
      } else {
        const data = fs.readFileSync(full);
        zip.file(rel, data);
      }
    }
  }
  addDir(workDir, "");
  const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(outPath, buf);
  console.log("Wrote:", outPath);
}

repack().catch(e => { console.error(e); process.exit(1); });
