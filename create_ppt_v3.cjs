const pptxgen = require("pptxgenjs");
const fs = require("fs");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";

// ===== DARK THEME COLOR PALETTE (matching reference PPT) =====
const C = {
  bg: "0F172A",        // main dark background
  bgCard: "1E293B",    // card on dark
  bgCardLight: "334155", // lighter card
  teal: "0D9488",      // primary accent
  green: "10B981",     // secondary accent
  greenDark: "064E3B", // dark green
  greenPale: "F0FDFA",
  white: "FFFFFF",
  grayLight: "E2E8F0",
  gray: "CBD5E1",
  grayMid: "94A3B8",
  grayDark: "64748B",
  textBody: "CBD5E1",  // body text on dark
  textSub: "94A3B8",
  redPale: "FEE2E2",
  red: "EF4444",
  bluePale: "E0F2FE",
  mintPale: "99F6E4",
  slate: "F1F5F9",
  slateLight: "F8FAFC",
};
const FONT = "Malgun Gothic";
const ICONS = "C:/SMARTECOSYS/ref_icons/";

// Load icons from reference PPT
function icon(name) {
  const path = ICONS + name;
  if (fs.existsSync(path)) return fs.readFileSync(path);
  return null;
}

// ===== HELPERS =====
function darkBg(slide) {
  slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.33, h: 7.5, fill: { color: C.bg } });
}

function addFooter(slide, num, section) {
  slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 6.95, w: 13.33, h: 0.55, fill: { color: "0B1120" } });
  slide.addText("SMARTECOSYS", { x: 0.5, y: 7.0, w: 2.5, h: 0.4, fontSize: 8, color: C.grayDark, fontFace: FONT, bold: true });
  if (section) slide.addText(section, { x: 5.0, y: 7.0, w: 4.0, h: 0.4, fontSize: 8, color: C.grayDark, fontFace: FONT, align: "center" });
  slide.addText(String(num).padStart(2, "0"), { x: 12.0, y: 7.0, w: 1.0, h: 0.4, fontSize: 9, color: C.teal, fontFace: FONT, align: "right", bold: true });
}

function sectionHeader(slide, title, subtitle) {
  slide.addText(title, { x: 0.6, y: 0.3, w: 12.0, h: 0.55, fontSize: 19, color: C.white, fontFace: FONT, bold: true });
  if (subtitle) {
    slide.addText(subtitle, { x: 0.6, y: 0.85, w: 12.0, h: 0.35, fontSize: 10, color: C.grayMid, fontFace: FONT });
  }
  // accent line
  slide.addShape(pptx.shapes.RECTANGLE, { x: 0.6, y: 1.2, w: 1.5, h: 0.04, fill: { color: C.teal } });
}

function statBox(slide, val, label, sub, x, y, w, h, accentColor) {
  const ac = accentColor || C.green;
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, fill: { color: C.bgCard }, rectRadius: 0.08,
    line: { color: "2D3748", width: 0.5 }
  });
  slide.addText(val, { x, y: y + h * 0.08, w, h: h * 0.45, fontSize: 26, color: ac, fontFace: FONT, bold: true, align: "center" });
  slide.addText(label, { x: x + 0.1, y: y + h * 0.5, w: w - 0.2, h: h * 0.25, fontSize: 10, color: C.white, fontFace: FONT, align: "center", bold: true });
  if (sub) slide.addText(sub, { x: x + 0.1, y: y + h * 0.73, w: w - 0.2, h: h * 0.22, fontSize: 8, color: C.grayMid, fontFace: FONT, align: "center" });
}

function tagBadge(slide, text, x, y, color) {
  const c = color || C.teal;
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x, y, w: 1.8, h: 0.3, fill: { color: c }, rectRadius: 0.15 });
  slide.addText(text, { x, y, w: 1.8, h: 0.3, fontSize: 9, color: C.white, fontFace: FONT, align: "center", valign: "middle", bold: true });
}

function numCircle(slide, num, x, y) {
  slide.addShape(pptx.shapes.OVAL, { x, y, w: 0.35, h: 0.35, fill: { color: C.teal } });
  slide.addText(num, { x, y, w: 0.35, h: 0.35, fontSize: 11, color: C.white, fontFace: FONT, bold: true, align: "center", valign: "middle" });
}

function addIcon(slide, filename, x, y, w, h) {
  const data = icon(filename);
  if (data) {
    const ext = filename.endsWith('.jpeg') ? 'jpg' : 'png';
    slide.addImage({ data: `image/${ext};base64,${data.toString('base64')}`, x, y, w: w || 0.25, h: h || 0.25 });
  }
}

function infoBar(slide, text, y, bgColor) {
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5, y, w: 12.3, h: 0.65, fill: { color: bgColor || C.bgCard }, rectRadius: 0.06, line: { color: C.teal, width: 0.5 } });
  slide.addText(text, { x: 0.8, y, w: 11.7, h: 0.65, fontFace: FONT, valign: "middle" });
}

// ========================================
// SLIDE 1: COVER (Dark theme with teal accent)
// ========================================
let s1 = pptx.addSlide();
darkBg(s1);

// Decorative teal glow shapes
s1.addShape(pptx.shapes.OVAL, { x: -2, y: -1.5, w: 6, h: 6, fill: { color: C.teal, transparency: 92 } });
s1.addShape(pptx.shapes.OVAL, { x: 9, y: 3, w: 5, h: 5, fill: { color: C.green, transparency: 94 } });

// Top tag
tagBadge(s1, "Coffee Lo", 0.6, 0.5, C.teal);
addIcon(s1, "image-1-2.png", 0.65, 0.53, 0.2, 0.2);

// Main title
s1.addText("\uCEE4\uD53C \uCC0C\uAEBC\uAE30\uAC00 \uC218\uC775\uC774 \uB429\uB2C8\uB2E4", {
  x: 0.6, y: 1.5, w: 9.0, h: 0.8,
  fontSize: 34, color: C.white, fontFace: FONT, bold: true
});
s1.addText("\uD504\uB79C\uCC28\uC774\uC988 \uC5ED\uBB3C\uB958\uB9DD \uAE30\uBC18 Zero-Cost \uC790\uC6D0\uD654 \uD30C\uD2B8\uB108\uC2ED \uC81C\uC548", {
  x: 0.6, y: 2.4, w: 9.0, h: 0.45,
  fontSize: 16, color: C.grayLight, fontFace: FONT
});

// Highlight box
s1.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 3.3, w: 5.5, h: 1.0, fill: { color: C.white, transparency: 90 }, rectRadius: 0.08, line: { color: C.teal, width: 0.5 } });
s1.addText([
  { text: "\uD22C\uC790\uAE08 \uC5C6\uC774, \uBB3C\uB958\uB9DD\uB9CC \uACF5\uC720\uD558\uBA74\n", options: { fontSize: 12, color: C.white } },
  { text: "\uC5F0\uAC04 20\uC5B5 \uC6D0\uC758 \uC21C\uC218\uC775\uC774 \uBC1C\uC0DD\uD569\uB2C8\uB2E4.", options: { fontSize: 14, color: C.green, bold: true } },
], { x: 0.9, y: 3.4, w: 5.0, h: 0.8, fontFace: FONT, lineSpacingMultiple: 1.4 });

s1.addText("PRESENTED BY \uC2A4\uB9C8\uD2B8\uC5D0\uCF54\uC2DC\uC2A4 (SMARTECOSYS)  |  2026. 04", {
  x: 0.6, y: 5.0, w: 8.0, h: 0.35, fontSize: 10, color: C.grayMid, fontFace: FONT
});

// Right side decorative stat cards
statBox(s1, "405\uC794", "\uC5F0\uAC04 1\uC778\uB2F9 \uCEE4\uD53C", "", 9.0, 1.5, 3.5, 1.2, C.green);
statBox(s1, "17.6\uB9CC\uD1A4", "\uC5F0\uAC04 \uCEE4\uD53C\uBC15 \uBC30\uCD9C", "", 9.0, 3.0, 3.5, 1.2, C.teal);
statBox(s1, "90%+", "\uBB3C\uB958\uBE44 \uC808\uAC10 \uD6A8\uACFC", "", 9.0, 4.5, 3.5, 1.2, C.green);

// ========================================
// SLIDE 2: Current Problem
// ========================================
let s2 = pptx.addSlide();
darkBg(s2);
sectionHeader(s2, "\uAD6D\uB0B4 \uCEE4\uD53C \uD504\uB79C\uCC28\uC774\uC988\uB294 \uB9E4\uC77C \uC218\uBC31 \uD1A4\uC758 \uCEE4\uD53C\uBC15\uC744 \uD3D0\uAE30\uBB3C\uB85C \uBC84\uB9AC\uACE0 \uC788\uC2B5\uB2C8\uB2E4");
addFooter(s2, 2, "01. \uC2DC\uC7A5 \uD604\uD669");

tagBadge(s2, "CURRENT PROBLEM", 0.6, 0.85, C.red);

// 4 stat cards in a row
const probStats = [
  { val: "17.6\uB9CC \uD1A4", label: "\uC5F0\uAC04 \uBC1C\uC0DD\uD558\uB294 \uCEE4\uD53C\uBC15", sub: "\uC6D0\uB450 1kg\uB2F9 0.91kg\uC758 \uCEE4\uD53C\uBC15 \uBC1C\uC0DD", color: C.green },
  { val: "41\uC5B5+", label: "\uC5F0\uAC04 \uC4F0\uB808\uAE30 \uCC98\uB9AC \uBE44\uC6A9", sub: "\uC810\uD3EC\uB2F9 \uC6D4 5~15\uB9CC\uC6D0, \uC5F0 120\uB9CC\uC6D0 \uBD80\uB2F4", color: C.red },
  { val: "90%", label: "\uB9E4\uB9BD\xB7\uC18C\uAC01 \uCC98\uB9AC \uBE44\uC728", sub: "\uD0C4\uC18C \uBC30\uCD9C \uBC0F \uD658\uACBD \uC624\uC5FC\uC758 \uC8FC\uC694 \uC6D0\uC778", color: C.red },
  { val: "Zero", label: "\uCEE4\uD53C\uBC15 \uBD80\uAC00\uAC00\uCE58 \uCC3D\uCD9C\uC561", sub: "\uB9C9\uB300\uD55C \uC790\uC6D0\uC774 \uADF8\uB300\uB85C \uBC84\uB824\uC9C0\uACE0 \uC788\uC2B5\uB2C8\uB2E4", color: C.red },
];

probStats.forEach((s, i) => {
  statBox(s2, s.val, s.label, s.sub, 0.5 + i * 3.15, 1.7, 2.95, 2.2, s.color);
});

// Bottom quote bar
s2.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 4.3, w: 12.3, h: 1.8, fill: { color: C.bgCard }, rectRadius: 0.08 });
tagBadge(s2, "MISSED OPPORTUNITY", 0.7, 4.45, C.red);

s2.addText([
  { text: "\"\uC5F0\uAC04 17.6\uB9CC \uD1A4\uC758 \uCEE4\uD53C\uBC15\uC774 \uC5B4\uB5A0\uD55C \uACBD\uC81C\uC801 \uAC00\uCE58 \uCC3D\uCD9C \uC5C6\uC774 \uD3D0\uAE30\uBB3C\uB85C \uC804\uB77D\"\n", options: { fontSize: 13, color: C.white, italic: true } },
  { text: "\uB9E4\uB9BD \uC2DC \uBA54\uD0C4(CH\u2084) \uBC1C\uC0DD \u2014 CO\u2082 \uB300\uBE44 80\uBC30\uC758 \uC628\uC2E4\uAC00\uC2A4 | Scope 3 \uADDC\uC81C \uAC15\uD654\uB85C \uAE30\uC5C5 \uBE44\uC6A9 \uC0C1\uC2B9 \uC555\uBC15", options: { fontSize: 10, color: C.grayMid } },
], { x: 0.8, y: 4.9, w: 11.5, h: 1.0, fontFace: FONT, lineSpacingMultiple: 1.5 });

// ========================================
// SLIDE 3: Reverse Logistics Solution
// ========================================
let s3 = pptx.addSlide();
darkBg(s3);
sectionHeader(s3, "\uAE30\uC874 \uB0A9\uD488 \uBB3C\uB958\uB9DD\uC744 \uC5ED\uBC29\uD5A5\uC73C\uB85C \uD65C\uC6A9\uD558\uBA74 \uC218\uAC70 \uBE44\uC6A9\uC774 \uC81C\uB85C\uAC00 \uB429\uB2C8\uB2E4");
addFooter(s3, 3, "02. \uD575\uC2EC \uC804\uB7B5: \uC5ED\uBB3C\uB958");

tagBadge(s3, "0 \uCD94\uAC00 \uBE44\uC6A9", 0.6, 0.85, C.green);

// Flow diagram with dark cards
const flowItems = [
  { label: "\uC2A4\uB9C8\uD2B8\uC5D0\uCF54\uC2DC\uC2A4\n\uCC98\uB9AC \uACF5\uC7A5", x: 0.3, w: 2.5, accent: C.teal },
  { label: "\uC6D0\uB450\xB7\uC18C\uBAA8\uD488 \uB0A9\uD488 \u2192\n\u2190 \uCEE4\uD53C\uBC15 \uC218\uAC70 (\uD68C\uCC28)", x: 3.1, w: 3.2, accent: C.green },
  { label: "3PL \uBB3C\uB958\uC13C\uD130\n(\uC5ED\uBB3C\uB958 \uAC70\uC810)", x: 6.6, w: 2.5, accent: C.teal },
  { label: "\uAC00\uB9F9\uC810 \uBC30\uC1A1 \u2192\n\u2190 \uBC00\uD3D0\uD1B5 \uD68C\uC218", x: 9.4, w: 2.1, accent: C.green },
  { label: "\uCEE4\uD53C \uAC00\uB9F9\uC810\n\uC804\uAD6D \uB124\uD2B8\uC6CC\uD06C", x: 11.0, w: 1.9, accent: C.teal },
];

flowItems.forEach(f => {
  s3.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: f.x, y: 1.6, w: f.w, h: 1.1, fill: { color: C.bgCard }, rectRadius: 0.06,
    line: { color: f.accent, width: 0.8 }
  });
  s3.addText(f.label, {
    x: f.x, y: 1.6, w: f.w, h: 1.1,
    fontSize: 10, color: C.white, fontFace: FONT, bold: true, align: "center", valign: "middle", lineSpacingMultiple: 1.3
  });
});

// Key mechanism section
s3.addText("\uD575\uC2EC \uBA54\uCEE4\uB2C8\uC998 \u2014 1:1 \uBC00\uD3D0\uD1B5 \uB9DE\uAD50\uD658 \uBC29\uC2DD", {
  x: 0.6, y: 3.1, w: 12.0, h: 0.4, fontSize: 13, color: C.white, fontFace: FONT, bold: true
});

const mechs = [
  { n: "01", t: "\uB0A9\uD488 \uC2DC \uC804\uB2EC", d: "\uBB3C\uB958 \uCC28\uB7C9\uC774 \uC6D0\uB450 \uBC0F \uC18C\uBAA8\uD488\uC744 \uB0A9\uD488\uD560 \uB54C, \uBE48 \uBC00\uD3D0\uD1B5(20L)\uC744 \uAC00\uB9F9\uC810\uC5D0 \uD568\uAED8 \uC804\uB2EC" },
  { n: "02", t: "\uC218\uAC70 \uC2DC \uD68C\uC218", d: "\uCEE4\uD53C\uBC15\uC774 \uAC00\uB4DD \uCC2C \uBC00\uD3D0\uD1B5\uC744 \uD68C\uCC28\uD558\uB294 \uBE48 \uBB3C\uB958 \uCC28\uB7C9\uC5D0 \uC2E4\uC5B4 \uD68C\uC218" },
  { n: "03", t: "\uC704\uC0DD \uBCF4\uC7A5", d: "\uC804\uC6A9 \uBC00\uD3D0 \uC6A9\uAE30\uB85C \uC545\uCDE8\xB7\uBD80\uD328 \uBC29\uC9C0, \uBB3C\uB958 \uCC28\uB7C9 \uC624\uC5FC \uC81C\uB85C" },
];

mechs.forEach((m, i) => {
  const x = 0.5 + i * 4.1;
  s3.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x, y: 3.7, w: 3.9, h: 1.5, fill: { color: C.bgCard }, rectRadius: 0.06 });
  numCircle(s3, m.n, x + 0.15, 3.85);
  s3.addText(m.t, { x: x + 0.6, y: 3.8, w: 3.1, h: 0.35, fontSize: 11, color: C.green, fontFace: FONT, bold: true });
  s3.addText(m.d, { x: x + 0.15, y: 4.25, w: 3.6, h: 0.7, fontSize: 9, color: C.textBody, fontFace: FONT, lineSpacingMultiple: 1.4 });
});

// Regulation highlight
s3.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 5.5, w: 12.3, h: 0.9, fill: { color: C.bgCard }, rectRadius: 0.06, line: { color: C.green, width: 0.5 } });
s3.addText([
  { text: "2022\uB144 \uADDC\uC81C \uD601\uC2E0  ", options: { bold: true, color: C.green, fontSize: 11 } },
  { text: "\uD658\uACBD\uBD80 \uC801\uADF9\uD589\uC815\uC704\uC6D0\uD68C \uC2EC\uC758\uB85C \uCEE4\uD53C\uCC0C\uAEBC\uAE30 '\uC21C\uD658\uC790\uC6D0' \uC778\uC815 \u2192 \uC77C\uBC18 \uD654\uBB3C \uCC28\uB7C9\uC73C\uB85C \uD569\uBC95 \uC6B4\uBC18 \uAC00\uB2A5", options: { color: C.textBody, fontSize: 10 } },
], { x: 0.8, y: 5.55, w: 11.7, h: 0.8, fontFace: FONT });

// ========================================
// SLIDE 4: Technology & Products
// ========================================
let s4 = pptx.addSlide();
darkBg(s4);
sectionHeader(s4, "IoT \uC218\uAC70 \uC2DC\uC2A4\uD15C + \uD2B9\uD5C8 \uAE30\uC220\uB85C \uACE0\uBD80\uAC00\uAC00\uCE58 \uCC3D\uCD9C");
addFooter(s4, 4, "03. \uAE30\uC220 \uBC0F \uC81C\uD488");

tagBadge(s4, "\uD2B9\uD5C8 \uAE30\uC220", 0.6, 0.85, C.teal);

// Process flow: Input -> Process -> Output
const proc = [
  { label: "\uC218\uAC70\uB41C \uCEE4\uD53C\uBC15\n\uC218\uBD84 60~70% \uD568\uC720", x: 0.5, w: 2.8, bg: C.bgCard },
  { label: "IoT \uC13C\uC11C \uCE21\uC815\n\uC911\uB7C9/\uD568\uC218\uC728/GPS", x: 3.6, w: 2.8, bg: C.bgCard },
  { label: "\uCD5C\uC801 \uB178\uC120 \uB3C4\uCD9C\n\uAC74\uC870\uC911\uB7C9 \uD658\uC0B0 AI", x: 6.7, w: 2.8, bg: C.bgCard },
  { label: "\uC800\uC628\uC5F4\uD48D\uAC74\uC870\n80~120\u00B0C \uACE0\uD6A8\uC728", x: 9.8, w: 2.8, bg: C.teal },
];

proc.forEach((p, i) => {
  s4.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: p.x, y: 1.5, w: p.w, h: 1.0, fill: { color: p.bg }, rectRadius: 0.06, line: { color: C.teal, width: 0.5 } });
  s4.addText(p.label, { x: p.x, y: 1.5, w: p.w, h: 1.0, fontSize: 10, color: C.white, fontFace: FONT, bold: true, align: "center", valign: "middle", lineSpacingMultiple: 1.3 });
  if (i < 3) s4.addText("\u25B6", { x: p.x + p.w, y: 1.7, w: 0.55, h: 0.6, fontSize: 14, color: C.teal, fontFace: FONT, align: "center" });
});

// Output products
s4.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 2.8, w: 5.8, h: 1.8, fill: { color: C.bgCard }, rectRadius: 0.08, line: { color: C.green, width: 0.5 } });
s4.addText("\uACE0\uD488\uC9C8 \uC5F0\uB8CC\uD0C4 (B2B)", { x: 0.7, y: 2.9, w: 5.4, h: 0.35, fontSize: 12, color: C.green, fontFace: FONT, bold: true });
s4.addText("5,649 kcal/kg", { x: 0.7, y: 3.25, w: 3.0, h: 0.4, fontSize: 22, color: C.white, fontFace: FONT, bold: true });
s4.addText("\uB2E8\uAC00 23\uB9CC\uC6D0/\uD1A4", { x: 3.7, y: 3.3, w: 2.5, h: 0.3, fontSize: 11, color: C.teal, fontFace: FONT });
s4.addText("\uBAA9\uC7AC\uD3A0\uB9BF \uB300\uBE44 \uC57D 2\uBC30 \uBC1C\uC5F4\uB7C9 | \uBC1C\uC804\uC18C/\uBCF4\uC77C\uB7EC \uC7A5\uAE30\uACF5\uAE09\uACC4\uC57D | RPS \uC81C\uB3C4 \uB300\uC751 \uBC14\uC774\uC624\uB9E4\uC2A4", {
  x: 0.7, y: 3.75, w: 5.4, h: 0.6, fontSize: 9, color: C.textBody, fontFace: FONT, lineSpacingMultiple: 1.4
});

s4.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 6.9, y: 2.8, w: 5.9, h: 1.8, fill: { color: C.bgCard }, rectRadius: 0.08, line: { color: C.green, width: 0.5 } });
s4.addText("\uD504\uB9AC\uBBF8\uC5C4 \uD3AB\uBAA8\uB798 (B2C)", { x: 7.1, y: 2.9, w: 5.5, h: 0.35, fontSize: 12, color: C.green, fontFace: FONT, bold: true });
s4.addText("$76.6\uC5B5 \uC2DC\uC7A5", { x: 7.1, y: 3.25, w: 3.0, h: 0.4, fontSize: 22, color: C.white, fontFace: FONT, bold: true });
s4.addText("\uB2E8\uAC00 40\uB9CC\uC6D0/\uD1A4", { x: 10.1, y: 3.3, w: 2.5, h: 0.3, fontSize: 11, color: C.teal, fontFace: FONT });
s4.addText("\uAE00\uB85C\uBC8C \uC2DC\uC7A5 2031\uB144 $76.6\uC5B5 (CAGR 4.14%) | \uCC9C\uC5F0 \uB2E4\uACF5\uC131 \uD0C8\uCDE8\uB825 | ESG \uC18C\uBE44\uC790 \uAC10\uC131", {
  x: 7.1, y: 3.75, w: 5.5, h: 0.6, fontSize: 9, color: C.textBody, fontFace: FONT, lineSpacingMultiple: 1.4
});

// Tech comparison table
s4.addText("\uAE30\uC220 \uACBD\uC7C1\uB825 \uBE44\uAD50", { x: 0.6, y: 4.85, w: 5.0, h: 0.35, fontSize: 12, color: C.white, fontFace: FONT, bold: true });

const techRows = [
  [{ text: "\uBE44\uAD50 \uD56D\uBAA9", options: { bold: true, color: C.white, fill: { color: C.teal }, fontSize: 10, fontFace: FONT } },
   { text: "\uC2A4\uB9C8\uD2B8\uC5D0\uCF54\uC2DC\uC2A4 (\uC800\uC628\uC5F4\uD48D\uAC74\uC870)", options: { bold: true, color: C.white, fill: { color: C.teal }, fontSize: 10, fontFace: FONT } },
   { text: "\uC77C\uBC18 \uAC74\uC870 \uBC29\uC2DD", options: { bold: true, color: C.white, fill: { color: C.teal }, fontSize: 10, fontFace: FONT } }],
  [{ text: "\uAC74\uC870 \uC628\uB3C4", options: { fontSize: 9, fontFace: FONT, color: C.white } },
   { text: "80~120\u00B0C (\uC800\uC628)", options: { fontSize: 9, fontFace: FONT, color: C.green, bold: true } },
   { text: "200\u00B0C \uC774\uC0C1 (\uACE0\uC628)", options: { fontSize: 9, fontFace: FONT, color: C.red } }],
  [{ text: "\uC5D0\uB108\uC9C0 \uD6A8\uC728", options: { fontSize: 9, fontFace: FONT, color: C.white } },
   { text: "\uACE0\uD6A8\uC728 (\uC5F4\uD68C\uC218 \uC2DC\uC2A4\uD15C)", options: { fontSize: 9, fontFace: FONT, color: C.green, bold: true } },
   { text: "\uC800\uD6A8\uC728 (\uC5F4 \uC190\uC2E4)", options: { fontSize: 9, fontFace: FONT, color: C.red } }],
  [{ text: "\uC81C\uD488 \uD488\uC9C8", options: { fontSize: 9, fontFace: FONT, color: C.white } },
   { text: "\uC720\uAE30\uBB3C \uBCF4\uC874, \uACE0\uD488\uC9C8", options: { fontSize: 9, fontFace: FONT, color: C.green, bold: true } },
   { text: "\uD0C4\uD654 \uBC1C\uC0DD, \uD488\uC9C8 \uC800\uD558", options: { fontSize: 9, fontFace: FONT, color: C.red } }],
  [{ text: "\uD658\uACBD\uC131", options: { fontSize: 9, fontFace: FONT, color: C.white } },
   { text: "\uC720\uD574\uBB3C\uC9C8/\uC545\uCDE8 \uBC1C\uC0DD \uC5C6\uC74C", options: { fontSize: 9, fontFace: FONT, color: C.green, bold: true } },
   { text: "\uC720\uD574\uBB3C\uC9C8 \uB2E4\uB7C9 \uBC29\uCD9C", options: { fontSize: 9, fontFace: FONT, color: C.red } }],
];

s4.addTable(techRows, {
  x: 0.5, y: 5.2, w: 12.3,
  border: { type: "solid", pt: 0.5, color: "2D3748" },
  colW: [2.5, 5.0, 4.8],
  rowH: [0.35, 0.3, 0.3, 0.3, 0.3],
  margin: [4, 8, 4, 8],
  autoPage: false,
});

// ========================================
// SLIDE 5: Financial Simulation
// ========================================
let s5 = pptx.addSlide();
darkBg(s5);
sectionHeader(s5, "\uC7AC\uBB34 \uC2DC\uBBAC\uB808\uC774\uC158 \u2014 \uC5F0\uAC04 \uC218\uC775 \uAD6C\uC870");
addFooter(s5, 5, "04. \uC218\uC775 \uC2DC\uBBAC\uB808\uC774\uC158");

// Revenue summary boxes
statBox(s5, "2,737\uD1A4", "\uC5F0\uAC04 \uCEE4\uD53C\uBC15 \uBC1C\uC0DD\uB7C9", "3,000\uC810\uD3EC \u00D7 2.5kg \u00D7 365\uC77C", 0.5, 1.5, 3.0, 1.5, C.teal);
statBox(s5, "958\uD1A4", "\uAC74\uC870 \uD6C4 \uCC98\uB9AC\uB7C9", "\uC218\uC728 35% \uAE30\uC900", 3.8, 1.5, 3.0, 1.5, C.teal);
statBox(s5, "26.9\uC5B5", "\uC5F0\uAC04 \uCD1D \uB9E4\uCD9C", "\uC5F0\uB8CC\uD0C4 70% + \uD3AB\uBAA8\uB798 30%", 7.1, 1.5, 3.0, 1.5, C.green);
statBox(s5, "20\uC5B5+", "\uC21C\uC218\uC775 \uC608\uC0C1", "\uC218\uC775 \uC250\uC5B4 50:50 \uAE30\uC900", 10.4, 1.5, 2.5, 1.5, C.green);

// Revenue breakdown table
const revRows = [
  [{ text: "\uD56D\uBAA9", options: { bold: true, color: C.white, fill: { color: C.teal }, fontSize: 10, fontFace: FONT } },
   { text: "\uC218\uCE58", options: { bold: true, color: C.white, fill: { color: C.teal }, fontSize: 10, fontFace: FONT } },
   { text: "\uBE44\uACE0", options: { bold: true, color: C.white, fill: { color: C.teal }, fontSize: 10, fontFace: FONT } }],
  [{ text: "\uC5F0\uB8CC\uD0C4 \uC804\uD658 (70%)", options: { fontSize: 9, fontFace: FONT, color: C.white } },
   { text: "671\uD1A4 \u00D7 23\uB9CC\uC6D0", options: { fontSize: 9, fontFace: FONT, color: C.green, bold: true } },
   { text: "15.4\uC5B5 \uC6D0", options: { fontSize: 9, fontFace: FONT, color: C.green, bold: true } }],
  [{ text: "\uD3AB\uBAA8\uB798 \uC804\uD658 (30%)", options: { fontSize: 9, fontFace: FONT, color: C.white } },
   { text: "287\uD1A4 \u00D7 40\uB9CC\uC6D0", options: { fontSize: 9, fontFace: FONT, color: C.green, bold: true } },
   { text: "11.5\uC5B5 \uC6D0", options: { fontSize: 9, fontFace: FONT, color: C.green, bold: true } }],
  [{ text: "\uCD1D \uB9E4\uCD9C", options: { bold: true, fontSize: 10, fontFace: FONT, color: C.white, fill: { color: C.bgCard } } },
   { text: "", options: { fill: { color: C.bgCard }, fontFace: FONT } },
   { text: "26.9\uC5B5 \uC6D0", options: { bold: true, fontSize: 10, fontFace: FONT, color: C.green, fill: { color: C.bgCard } } }],
  [{ text: "\uC218\uC775 \uC250\uC5B4 (50%)", options: { bold: true, fontSize: 10, fontFace: FONT, color: C.white, fill: { color: "064E3B" } } },
   { text: "\uBCF8\uC0AC \uADC0\uC18D \uC218\uC775", options: { fontSize: 9, fontFace: FONT, color: C.green, fill: { color: "064E3B" } } },
   { text: "\uC5F0 ~13.5\uC5B5 \uC6D0", options: { bold: true, fontSize: 10, fontFace: FONT, color: C.green, fill: { color: "064E3B" } } }],
];

s5.addTable(revRows, {
  x: 0.5, y: 3.3, w: 12.3,
  border: { type: "solid", pt: 0.5, color: "2D3748" },
  colW: [4.0, 4.5, 3.8],
  rowH: [0.38, 0.35, 0.35, 0.38, 0.42],
  margin: [4, 8, 4, 8],
  autoPage: false,
});

// Additional benefits
s5.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 5.5, w: 12.3, h: 0.9, fill: { color: C.bgCard }, rectRadius: 0.06, line: { color: C.green, width: 0.5 } });
s5.addText([
  { text: "\uAC00\uB9F9\uC810 \uC808\uAC10 \uD6A8\uACFC  ", options: { bold: true, color: C.green, fontSize: 11 } },
  { text: "\uC810\uD3EC\uB2F9 \uC6D4 10\uB9CC\uC6D0 \uC885\uB7C9\uC81C \uBD09\uD22C \uBE44\uC6A9 \uC808\uAC10 \u00D7 3,000\uC810\uD3EC = \uC5F0\uAC04 36\uC5B5 \uC6D0 \uC808\uAC10 | \uAC00\uB9F9\uC810\uC8FC \uC7AC\uACC4\uC57D\uB960 \uD5A5\uC0C1\uC758 \uAC00\uC7A5 \uAC15\uB825\uD55C \uC815\uCC45", options: { color: C.textBody, fontSize: 10 } },
], { x: 0.8, y: 5.55, w: 11.7, h: 0.8, fontFace: FONT });

// ========================================
// SLIDE 6: Franchisee Benefits (Before/After)
// ========================================
let s6 = pptx.addSlide();
darkBg(s6);
sectionHeader(s6, "\uAC00\uB9F9\uC810\uC8FC 1\uC778\uB2F9 \uC5F0\uAC04 120\uB9CC \uC6D0 \uC808\uAC10 \u2014 \uBCF8\uC0AC\uC758 \uAC00\uC7A5 \uAC15\uB825\uD55C \uC9C0\uC6D0 \uC815\uCC45");
addFooter(s6, 6, "05. \uAC00\uB9F9\uC810 \uD61C\uD0DD");

// Before card
s6.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 1.5, w: 5.8, h: 3.5, fill: { color: C.bgCard }, rectRadius: 0.1, line: { color: C.red, width: 0.8 } });
tagBadge(s6, "\uD604\uC7AC: \uC77C\uBC18 \uC4F0\uB808\uAE30 \uBC30\uCD9C", 0.8, 1.7, C.red);
const befItems = [
  "\uB9E4\uC6D4 \uC4F0\uB808\uAE30\uBD09\uD22C \uAD6C\uB9E4 \uBE44\uC6A9 \uBC1C\uC0DD",
  "\uB9E4\uC7A5 \uB0B4 \uC545\uCDE8 \uBC0F \uD574\uCDA9 \uBB38\uC81C \uBC1C\uC0DD \uAC00\uB2A5\uC131",
  "\uBD84\uB9AC\uC218\uAC70 \uBC0F \uBB34\uAC70\uC6B4 \uBD09\uD22C \uBC30\uCD9C \uC5C5\uBB34 \uBD80\uB2F4",
];
befItems.forEach((item, i) => {
  s6.addText("\u2716  " + item, { x: 0.8, y: 2.2 + i * 0.5, w: 5.2, h: 0.4, fontSize: 10, color: C.textBody, fontFace: FONT });
});
s6.addText("\uC5F0\uAC04 120\uB9CC \uC6D0 \uC9C0\uCD9C", { x: 0.8, y: 3.8, w: 5.2, h: 0.4, fontSize: 14, color: C.red, fontFace: FONT, bold: true });

// Arrow
s6.addText("\u25B6", { x: 6.1, y: 2.6, w: 1.0, h: 1.0, fontSize: 28, color: C.green, fontFace: FONT, align: "center" });

// After card
s6.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 6.9, y: 1.5, w: 5.9, h: 3.5, fill: { color: C.bgCard }, rectRadius: 0.1, line: { color: C.green, width: 0.8 } });
tagBadge(s6, "\uB3C4\uC785 \uD6C4: \uBC00\uD3D0\uD1B5 \uB9DE\uAD50\uD658", 7.2, 1.7, C.green);
const aftItems = [
  "\uCEE4\uD53C\uBC15 \uCC98\uB9AC \uBE44\uC6A9 \uC804\uBA74 \uBB34\uB8CC\uD654 (Zero Cost)",
  "\uC804\uC6A9 \uBC00\uD3D0 \uC6A9\uAE30 \uC0AC\uC6A9\uC73C\uB85C \uC704\uC0DD \uBB38\uC81C \uC644\uC804 \uCC28\uB2E8",
  "\uB0A9\uD488 \uC2DC \uBE48 \uD1B5\uACFC \uAC00\uB4DD \uCC2C \uD1B5\uC744 \uAD50\uD658\uB9CC \uD558\uBA74 \uC644\uB8CC",
];
aftItems.forEach((item, i) => {
  s6.addText("\u2714  " + item, { x: 7.2, y: 2.2 + i * 0.5, w: 5.3, h: 0.4, fontSize: 10, color: C.textBody, fontFace: FONT });
});
s6.addText("\uBE44\uC6A9 Zero", { x: 7.2, y: 3.8, w: 5.3, h: 0.4, fontSize: 14, color: C.green, fontFace: FONT, bold: true });

// Bottom savings stat
s6.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 5.3, w: 12.3, h: 1.2, fill: { color: C.bgCard }, rectRadius: 0.08 });
s6.addText([
  { text: "\uC5F0 120\uB9CC \uC6D0 \uC808\uAC10  ", options: { bold: true, color: C.green, fontSize: 16 } },
  { text: " \u00D7  3,000\uAC1C \uC810\uD3EC  =  ", options: { color: C.white, fontSize: 14 } },
  { text: "\uCD1D 36\uC5B5 \uC6D0 \uC808\uAC10", options: { bold: true, color: C.green, fontSize: 16 } },
], { x: 0.8, y: 5.35, w: 11.7, h: 0.5, fontFace: FONT, align: "center" });
s6.addText("\uD504\uB79C\uCC28\uC774\uC988 \uBCF8\uC0AC \uACBD\uC7C1 \uC6B0\uC704 \uD655\uBCF4 | \uAC00\uB9F9\uC810\uC8FC \uC2E4\uC9C8 \uC9C0\uC6D0\uC73C\uB85C \uC7AC\uACC4\uC57D\uB960 \uD5A5\uC0C1 | \uC790\uC6D0\uC21C\uD658 \uC6B0\uC218 \uB9E4\uC7A5 \uC778\uC99D\uB9C8\uD06C", {
  x: 0.8, y: 5.9, w: 11.7, h: 0.4, fontSize: 10, color: C.grayMid, fontFace: FONT, align: "center"
});

// ========================================
// SLIDE 7: ESG & Coffee Lo App
// ========================================
let s7 = pptx.addSlide();
darkBg(s7);
sectionHeader(s7, "'Coffee Lo' \uC571\uC73C\uB85C ESG \uC131\uACFC\uB97C \uC2E4\uC2DC\uAC04 \uB370\uC774\uD130\uB85C \uC99D\uBA85\uD569\uB2C8\uB2E4");
addFooter(s7, 7, "06. ESG \uBC0F \uCEE4\uD53C\uB85C \uC571");

tagBadge(s7, "SCOPE 3", 0.6, 0.85, C.teal);
tagBadge(s7, "K-ESG \uB300\uC751", 2.6, 0.85, C.green);

// Dashboard mockup
s7.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 1.5, w: 5.5, h: 3.5, fill: { color: C.bgCard }, rectRadius: 0.1, line: { color: C.teal, width: 0.5 } });
s7.addText("Coffee Lo Dashboard", { x: 0.7, y: 1.6, w: 5.1, h: 0.35, fontSize: 10, color: C.grayMid, fontFace: FONT });
s7.addText("TOTAL CARBON REDUCTION", { x: 0.7, y: 2.0, w: 5.1, h: 0.3, fontSize: 9, color: C.grayMid, fontFace: FONT });
s7.addText("2,000t", { x: 0.7, y: 2.3, w: 3.0, h: 0.6, fontSize: 36, color: C.green, fontFace: FONT, bold: true });
s7.addText("CO\u2082eq / Year", { x: 3.5, y: 2.5, w: 2.3, h: 0.3, fontSize: 10, color: C.grayMid, fontFace: FONT });

// Fake chart bars
const months = ["J","F","M","A","M","J","J","A","S","O","N","D"];
const heights = [0.3,0.35,0.5,0.6,0.7,0.8,0.85,0.9,1.0,1.1,1.15,1.2];
months.forEach((m, i) => {
  const bx = 0.8 + i * 0.4;
  s7.addShape(pptx.shapes.RECTANGLE, { x: bx, y: 4.6 - heights[i], w: 0.25, h: heights[i], fill: { color: i < 6 ? C.teal : C.green } });
  s7.addText(m, { x: bx - 0.05, y: 4.65, w: 0.35, h: 0.2, fontSize: 7, color: C.grayMid, fontFace: FONT, align: "center" });
});

// Feature table (right side)
s7.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 6.5, y: 1.5, w: 6.3, h: 3.5, fill: { color: C.bgCard }, rectRadius: 0.1 });

const esgFeatures = [
  { feat: "\uC2E4\uC2DC\uAC04 \uC218\uAC70 \uD604\uD669", detail: "\uC810\uD3EC\uBCC4\xB7\uC77C\uBCC4 \uCEE4\uD53C\uBC15 \uC218\uAC70\uB7C9 \uB300\uC2DC\uBCF4\uB4DC", use: "\uB370\uC774\uD130 \uD22C\uBA85\uC131 \uD655\uBCF4" },
  { feat: "\uD0C4\uC18C \uAC10\uCD95 \uC790\uB3D9 \uD658\uC0B0", detail: "\uC218\uAC70\uB7C9 \u2192 CO\u2082 \uAC10\uCD95\uB7C9 \uC790\uB3D9 \uBCC0\uD658", use: "ESG \uBCF4\uACE0\uC11C \uC989\uC2DC \uD65C\uC6A9" },
  { feat: "Scope 3 \uBCF4\uACE0\uC11C \uC5F0\uB3D9", detail: "K-ESG \uD3C9\uAC00 \uD56D\uBAA9\uBCC4 \uB9DE\uCDA4\uD615 \uB370\uC774\uD130", use: "\uAE30\uC5C5 \uACF5\uC2DC \uC81C\uB3C4 \uB300\uC751" },
  { feat: "\uC18C\uBE44\uC790 \uCEE4\uBBA4\uB2C8\uCF00\uC774\uC158", detail: "\uB9E4\uC7A5\uBCC4 \uCE5C\uD658\uACBD \uAE30\uC5EC \uC2DC\uAC01\uD654", use: "\uBE0C\uB79C\uB4DC \uC774\uBBF8\uC9C0 \uC81C\uACE0" },
];

esgFeatures.forEach((f, i) => {
  const y = 1.7 + i * 0.8;
  s7.addText(f.feat, { x: 6.8, y, w: 2.5, h: 0.35, fontSize: 10, color: C.green, fontFace: FONT, bold: true });
  s7.addText(f.detail, { x: 6.8, y: y + 0.3, w: 3.5, h: 0.3, fontSize: 8, color: C.textBody, fontFace: FONT });
  s7.addText(f.use, { x: 10.5, y: y + 0.1, w: 2.0, h: 0.3, fontSize: 8, color: C.teal, fontFace: FONT });
});

// Bottom
s7.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 5.3, w: 12.3, h: 0.9, fill: { color: C.bgCard }, rectRadius: 0.06, line: { color: C.teal, width: 0.5 } });
s7.addText([
  { text: "\uC2A4\uD0C0\uBC85\uC2A4 \uCD94\uACA9 \uC804\uB7B5  ", options: { bold: true, color: C.teal, fontSize: 11 } },
  { text: "\uC2A4\uD0C0\uBC85\uC2A4\uAC00 \uC218\uB144\uAC04 \uC774\uB8E9\uD55C \uC790\uC6D0\uC21C\uD658 \uBC38\uB958\uCCB4\uC778\uC744 \uB2E8\uAE30\uAC04\uC5D0 \uC544\uC6C3\uC18C\uC2F1 \uD615\uD0DC\uB85C \uB0B4\uC7AC\uD654 | IPO/\uB9E4\uAC01 \uC2DC \uAE30\uC5C5\uAC00\uCE58 Re-rating", options: { color: C.textBody, fontSize: 10 } },
], { x: 0.8, y: 5.35, w: 11.7, h: 0.8, fontFace: FONT });

// ========================================
// SLIDE 8: Expansion Roadmap
// ========================================
let s8 = pptx.addSlide();
darkBg(s8);
sectionHeader(s8, "3\uB2E8\uACC4 \uD655\uC7A5 \uB85C\uB4DC\uB9F5 \u2014 \uD30C\uC77C\uB7FF\uC5D0\uC11C \uC804\uAD6D \uD504\uB79C\uCC28\uC774\uC988 \uC0DD\uD0DC\uACC4\uB85C");
addFooter(s8, 8, "07. \uB85C\uB4DC\uB9F5");

const phases = [
  { title: "Phase 1: \uD30C\uC77C\uB7FF", period: "2025 Q3~Q4", items: ["\uB300\uC0C1: 300\uAC1C \uC810\uD3EC", "\uCC98\uB9AC\uB7C9: 274\uD1A4/\uC5F0", "\uC608\uC0C1 \uB9E4\uCD9C: \uC57D 2.7\uC5B5 \uC6D0"], milestones: ["\uBB3C\uB958 \uC2DC\uC2A4\uD15C \uAC80\uC99D \uBC0F \uC548\uC815\uD654", "Coffee Lo \uC571 \uBCA0\uD0C0 \uCD9C\uC2DC", "\uCD08\uAE30 ESG \uB370\uC774\uD130 \uCD95\uC801"], color: C.teal },
  { title: "Phase 2: \uD655\uC7A5", period: "2026", items: ["\uB300\uC0C1: \uC804\uCCB4 3,000\uAC1C", "\uCC98\uB9AC\uB7C9: 2,737\uD1A4/\uC5F0", "\uC608\uC0C1 \uB9E4\uCD9C: \uC57D 26.9\uC5B5 \uC6D0"], milestones: ["\uC804\uAD6D \uB2E8\uC704 \uBB3C\uB958\uB9DD \uC644\uC131", "B2B \uC5F0\uB8CC\uD0C4 \uB300\uB7C9 \uACF5\uAE09 \uACC4\uC57D", "\uBC18\uB824\uB3D9\uBB3C \uC720\uD1B5\uB9DD \uD655\uBCF4"], color: C.green },
  { title: "Phase 3: \uC0DD\uD0DC\uACC4", period: "2027~", items: ["\uB300\uC0C1: \uD0C0 \uD504\uB79C\uCC28\uC774\uC988 \uD655\uC7A5", "\uCC98\uB9AC\uB7C9: 10,000\uD1A4+/\uC5F0", "\uC608\uC0C1 \uB9E4\uCD9C: 100\uC5B5+ \uC6D0"], milestones: ["\uBCF5\uC218 \uD504\uB79C\uCC28\uC774\uC988 \uD30C\uD2B8\uB108\uC2ED", "\uC21C\uD658\uC790\uC6D0 \uACF5\uACF5\uC870\uB2EC \uC9C4\uC785", "\uD574\uC678 \uC2DC\uC7A5 \uC9C4\uCD9C"], color: C.greenDark },
];

phases.forEach((p, i) => {
  const x = 0.3 + i * 4.3;
  s8.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x, y: 1.5, w: 4.1, h: 4.8, fill: { color: C.bgCard }, rectRadius: 0.1, line: { color: p.color, width: 0.8 } });
  // Header
  s8.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: x + 0.15, y: 1.65, w: 3.8, h: 0.45, fill: { color: p.color }, rectRadius: 0.04 });
  s8.addText(p.title, { x: x + 0.15, y: 1.65, w: 3.8, h: 0.45, fontSize: 12, color: C.white, fontFace: FONT, bold: true, align: "center", valign: "middle" });
  s8.addText(p.period, { x: x + 0.2, y: 2.2, w: 3.7, h: 0.3, fontSize: 10, color: C.grayMid, fontFace: FONT });
  // Stats
  p.items.forEach((item, j) => {
    s8.addText("\u25B8  " + item, { x: x + 0.2, y: 2.55 + j * 0.35, w: 3.7, h: 0.3, fontSize: 10, color: C.white, fontFace: FONT });
  });
  // Milestones
  s8.addText("\uD575\uC2EC \uB9C8\uC77C\uC2A4\uD1A4", { x: x + 0.2, y: 3.75, w: 3.7, h: 0.3, fontSize: 9, color: C.grayMid, fontFace: FONT, bold: true });
  p.milestones.forEach((ms, j) => {
    s8.addText("\u25A0  " + ms, { x: x + 0.2, y: 4.1 + j * 0.35, w: 3.7, h: 0.3, fontSize: 9, color: C.textBody, fontFace: FONT });
  });
});

// ========================================
// SLIDE 9: Risk & Public Procurement
// ========================================
let s9 = pptx.addSlide();
darkBg(s9);
sectionHeader(s9, "\uB9AC\uC2A4\uD06C \uBD84\uC11D \uBC0F \uACF5\uACF5\uC870\uB2EC \uC804\uB7B5");
addFooter(s9, 9, "08. \uB9AC\uC2A4\uD06C \uBC0F \uACF5\uACF5\uC870\uB2EC");

// Risk table
const riskRows = [
  [{ text: "\uB9AC\uC2A4\uD06C \uD56D\uBAA9", options: { bold: true, color: C.white, fill: { color: C.teal }, fontSize: 9, fontFace: FONT } },
   { text: "\uBC1C\uC0DD \uAC00\uB2A5\uC131", options: { bold: true, color: C.white, fill: { color: C.teal }, fontSize: 9, fontFace: FONT } },
   { text: "\uC601\uD5A5\uB3C4", options: { bold: true, color: C.white, fill: { color: C.teal }, fontSize: 9, fontFace: FONT } },
   { text: "\uB300\uC751 \uC804\uB7B5", options: { bold: true, color: C.white, fill: { color: C.teal }, fontSize: 9, fontFace: FONT } }],
  [{ text: "\uBB3C\uB958 \uD30C\uD2B8\uB108 \uC774\uD0C8", options: { fontSize: 9, fontFace: FONT, color: C.white } },
   { text: "\uB0AE\uC74C", options: { fontSize: 9, fontFace: FONT, color: C.green } },
   { text: "\uB192\uC74C", options: { fontSize: 9, fontFace: FONT, color: C.red } },
   { text: "\uBCF5\uC218 3PL \uACC4\uC57D \uBC0F \uBC31\uC5C5 \uD30C\uD2B8\uB108 \uD655\uBCF4", options: { fontSize: 9, fontFace: FONT, color: C.textBody } }],
  [{ text: "\uC218\uAC70\uB7C9 \uBCC0\uB3D9", options: { fontSize: 9, fontFace: FONT, color: C.white } },
   { text: "\uC911\uAC04", options: { fontSize: 9, fontFace: FONT, color: "#F59E0B" } },
   { text: "\uC911\uAC04", options: { fontSize: 9, fontFace: FONT, color: "#F59E0B" } },
   { text: "\uCD5C\uC18C \uC218\uAC70\uB7C9 SLA \uACC4\uC57D \uBC0F \uD0C0 \uBE0C\uB79C\uB4DC \uBCF4\uC644 \uC218\uAC70\uB9DD", options: { fontSize: 9, fontFace: FONT, color: C.textBody } }],
  [{ text: "\uC5F0\uB8CC\uD0C4 \uD310\uB85C \uD655\uBCF4", options: { fontSize: 9, fontFace: FONT, color: C.white } },
   { text: "\uC911\uAC04", options: { fontSize: 9, fontFace: FONT, color: "#F59E0B" } },
   { text: "\uB192\uC74C", options: { fontSize: 9, fontFace: FONT, color: C.red } },
   { text: "\uBC1C\uC804\uC18C \uC7A5\uAE30 \uACF5\uAE09 MOU + \uC21C\uD658\uC790\uC6D0\uC0AC\uC6A9\uC81C\uD488 \uACF5\uACF5\uC870\uB2EC", options: { fontSize: 9, fontFace: FONT, color: C.textBody } }],
  [{ text: "\uD3AB\uBAA8\uB798 \uACBD\uC7C1 \uC2EC\uD654", options: { fontSize: 9, fontFace: FONT, color: C.white } },
   { text: "\uC911\uAC04", options: { fontSize: 9, fontFace: FONT, color: "#F59E0B" } },
   { text: "\uC911\uAC04", options: { fontSize: 9, fontFace: FONT, color: "#F59E0B" } },
   { text: "\uCE5C\uD658\uACBD \uD504\uB9AC\uBBF8\uC5C4 \uD3EC\uC9C0\uC154\uB2DD + B2B/B2C \uCC44\uB110 \uB2E4\uBCC0\uD654", options: { fontSize: 9, fontFace: FONT, color: C.textBody } }],
];

s9.addTable(riskRows, {
  x: 0.5, y: 1.5, w: 12.3,
  border: { type: "solid", pt: 0.5, color: "2D3748" },
  colW: [2.2, 1.5, 1.3, 7.3],
  rowH: [0.38, 0.4, 0.4, 0.4, 0.4],
  margin: [4, 8, 4, 8],
  autoPage: false,
});

// Public procurement section
s9.addText("\uACF5\uACF5\uC870\uB2EC \uBC0F \uBBFC\uAD00 \uD611\uB825 \uC804\uB7B5", { x: 0.6, y: 3.85, w: 12.0, h: 0.4, fontSize: 13, color: C.white, fontFace: FONT, bold: true });
s9.addShape(pptx.shapes.RECTANGLE, { x: 0.6, y: 4.25, w: 1.5, h: 0.04, fill: { color: C.teal } });

const pubCards = [
  { region: "\uC11C\uC6B8 \uC131\uB3D9\uAD6C", stat: "129\uD1A4 \uC628\uC2E4\uAC00\uC2A4 \uAC10\uCD95", detail: "200\uC5EC \uAC1C \uCEE4\uD53C\uC810 \uCC38\uC5EC" },
  { region: "\uC11C\uC6B8 \uC911\uAD6C", stat: "4,450\uB9CC \uC6D0 \uBCF4\uC870\uAE08", detail: "157\uD1A4 \uCEE4\uD53C\uBC15 \uC7AC\uD65C\uC6A9" },
  { region: "\uB300\uAD6C \uC911\uAD6C", stat: "\uB9E4\uCD9C 2.75\uBC30 \uC131\uC7A5", detail: "\uC790\uD65C\uC13C\uD130 \uCEE4\uD53C\uD050\uBE0C \uC0AC\uC5C5\uB2E8" },
];

pubCards.forEach((p, i) => {
  const x = 0.5 + i * 4.1;
  s9.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x, y: 4.5, w: 3.9, h: 1.3, fill: { color: C.bgCard }, rectRadius: 0.06, line: { color: C.teal, width: 0.5 } });
  s9.addText(p.region, { x: x + 0.15, y: 4.55, w: 3.6, h: 0.3, fontSize: 10, color: C.teal, fontFace: FONT, bold: true });
  s9.addText(p.stat, { x: x + 0.15, y: 4.85, w: 3.6, h: 0.35, fontSize: 12, color: C.white, fontFace: FONT, bold: true });
  s9.addText(p.detail, { x: x + 0.15, y: 5.2, w: 3.6, h: 0.3, fontSize: 9, color: C.textBody, fontFace: FONT });
});

s9.addText("\uC21C\uD658\uC790\uC6D0\uC0AC\uC6A9\uC81C\uD488 \uC778\uC815 \u2192 \uACF5\uACF5\uAE30\uAD00/\uC9C0\uC790\uCCB4 \uC6B0\uC120 \uAD6C\uB9E4 \uC790\uACA9 \uD655\uBCF4 | \uC5F4\uBCD1\uD569\uBC1C\uC804\uC18C + \uC720\uAE30\uB3D9\uBB3C\uBCF4\uD638\uC13C\uD130 \uB0A9\uD488", {
  x: 0.5, y: 6.1, w: 12.3, h: 0.4, fontSize: 9, color: C.grayMid, fontFace: FONT, align: "center"
});

// ========================================
// SLIDE 10: CTA / Conclusion
// ========================================
let s10 = pptx.addSlide();
darkBg(s10);

// Decorative glow
s10.addShape(pptx.shapes.OVAL, { x: -2, y: -1, w: 7, h: 7, fill: { color: C.teal, transparency: 93 } });
s10.addShape(pptx.shapes.OVAL, { x: 8, y: 2, w: 6, h: 6, fill: { color: C.green, transparency: 94 } });

s10.addText("\uC9C0\uAE08 \uC2DC\uC791\uD558\uBA74, \uB0B4\uB144\uBD80\uD130 \uC218\uC775\uC774 \uBC1C\uC0DD\uD569\uB2C8\uB2E4", {
  x: 0.6, y: 0.6, w: 12.0, h: 0.6, fontSize: 22, color: C.white, fontFace: FONT, bold: true
});
s10.addText("6\uAC1C\uC6D4 \uD30C\uC77C\uB7FF, Zero Risk\uB85C \uC2DC\uC791\uD558\uC138\uC694", {
  x: 0.6, y: 1.3, w: 12.0, h: 0.4, fontSize: 14, color: C.grayLight, fontFace: FONT
});
s10.addText("\uBCF8\uC0AC\uB294 \uBB3C\uB958\uB9DD\uB9CC \uACF5\uC720\uD558\uACE0, \uB098\uBA38\uC9C0\uB294 \uC2A4\uB9C8\uD2B8\uC5D0\uCF54\uC2DC\uC2A4\uAC00 \uCC45\uC784\uC9D1\uB2C8\uB2E4.", {
  x: 0.6, y: 1.8, w: 12.0, h: 0.35, fontSize: 11, color: C.grayMid, fontFace: FONT
});

// 3 CTA cards
const ctas = [
  { title: "\uBCF8\uC0AC \uD22C\uC790\uAE08 0\uC6D0", desc: "\uC124\uBE44, \uAE30\uC220, \uBB3C\uB958 \uB4F1 \uBAA8\uB4E0 \uCD08\uAE30 \uD22C\uC790 \uBC0F \uC6B4\uC601 \uBE44\uC6A9\uC740 \uC2A4\uB9C8\uD2B8\uC5D0\uCF54\uC2DC\uC2A4\uAC00 \uC804\uB2F4\uD569\uB2C8\uB2E4." },
  { title: "\uC5F0 10\uC5B5+ \uC218\uC775 \uC250\uC5B4", desc: "\uAC00\uB9F9\uC810 \uACF5\uAC04 \uD611\uC870 \uBC0F 3PL \uC5F0\uACB0 \uB300\uAC00\uB85C \uBC1C\uC0DD\uD558\uB294 \uC21C\uC774\uC775\uC758 50%\uB97C \uB9E4\uC6D4 \uC815\uC0B0\uD569\uB2C8\uB2E4." },
  { title: "ESG \uC131\uACFC \uADF9\uB300\uD654", desc: "Coffee Lo \uC571\uC744 \uD1B5\uD574 \uC2E4\uC2DC\uAC04 \uD0C4\uC18C \uAC10\uCD95 \uB370\uC774\uD130\uB97C \uBB34\uC0C1\uC73C\uB85C \uC81C\uACF5\uBC1B\uC544 \uB9AC\uD3EC\uD2B8\uC5D0 \uD65C\uC6A9\uD569\uB2C8\uB2E4." },
];

ctas.forEach((c, i) => {
  const x = 0.5 + i * 4.15;
  s10.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x, y: 2.5, w: 3.95, h: 1.8, fill: { color: C.bgCard }, rectRadius: 0.08, line: { color: C.teal, width: 0.5 } });
  addIcon(s10, "image-10-" + (i + 2) + ".png", x + 0.2, 2.65, 0.3, 0.3);
  s10.addText(c.title, { x: x + 0.6, y: 2.6, w: 3.1, h: 0.35, fontSize: 12, color: C.green, fontFace: FONT, bold: true });
  s10.addText(c.desc, { x: x + 0.2, y: 3.1, w: 3.55, h: 0.9, fontSize: 9, color: C.textBody, fontFace: FONT, lineSpacingMultiple: 1.4 });
});

// Next Steps
s10.addText("NEXT STEPS", { x: 0.6, y: 4.6, w: 3.0, h: 0.35, fontSize: 12, color: C.white, fontFace: FONT, bold: true });
s10.addShape(pptx.shapes.RECTANGLE, { x: 0.6, y: 4.95, w: 1.2, h: 0.04, fill: { color: C.teal } });

const steps = [
  { n: "1", t: "MOU \uCCB4\uACB0", d: "\uD30C\uC77C\uB7FF \uBC94\uC704 \uBC0F \uC870\uAC74 \uD569\uC758 (2\uC8FC \uB0B4)" },
  { n: "2", t: "\uD30C\uC77C\uB7FF \uC2E4\uC2DC", d: "300\uAC1C \uC810\uD3EC \uAE30\uBC18 6\uAC1C\uC6D4 \uC2DC\uBC94 \uC6B4\uC601" },
  { n: "3", t: "\uC804\uAD6D \uD655\uB300", d: "\uC131\uACFC \uAC80\uC99D \uD6C4 \uC804\uCCB4 \uAC00\uB9F9\uC810 \uD655\uB300 \uC801\uC6A9" },
];

steps.forEach((s, i) => {
  const x = 0.5 + i * 4.15;
  s10.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x, y: 5.2, w: 3.95, h: 0.9, fill: { color: C.bgCard }, rectRadius: 0.06 });
  numCircle(s10, s.n, x + 0.15, 5.35);
  s10.addText(s.t, { x: x + 0.6, y: 5.25, w: 3.0, h: 0.35, fontSize: 11, color: C.green, fontFace: FONT, bold: true });
  s10.addText(s.d, { x: x + 0.6, y: 5.6, w: 3.0, h: 0.3, fontSize: 9, color: C.textBody, fontFace: FONT });
});

// Footer
s10.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 6.5, w: 13.33, h: 1.0, fill: { color: "0B1120" } });
s10.addText("SMARTECOSYS  |  \uC2A4\uB9C8\uD2B8\uC5D0\uCF54\uC2DC\uC2A4", {
  x: 0.6, y: 6.7, w: 5.0, h: 0.3, fontSize: 10, color: C.grayDark, fontFace: FONT
});

// ===== SAVE =====
const outputPath = "C:/Users/SAMSUNG/Desktop/\uC2A4\uB9C8\uD2B8\uC5D0\uCF54\uC2DC\uC2A4_\uD22C\uC790\uC81C\uC548\uC11C.pptx";
pptx.writeFile({ fileName: outputPath })
  .then(() => console.log("PPT created: " + outputPath))
  .catch(err => console.error("Error:", err));
