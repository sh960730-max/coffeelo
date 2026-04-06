const pptxgen = require("pptxgenjs");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";

// ===== COLOR PALETTE (matching existing business plan PPT) =====
const C = {
  bg: "F5F5F5",
  white: "FFFFFF",
  dark: "111827",
  darkSub: "1F2937",
  gray: "6B7280",
  grayLight: "9CA3AF",
  cardBg: "F3F4F6",
  cardBorder: "E5E7EB",
  greenDeep: "2E7D32",
  greenBright: "16A34A",
  greenMid: "10B981",
  greenDark: "065F46",
  greenPale: "ECFDF5",
  greenPale2: "F0FDF4",
  greenLight: "D1FAE5",
  greenMint: "A7F3D0",
  coffee: "4A2C17",
  redPale: "FEF2F2",
  redText: "DC2626",
  bluePale: "EFF6FF",
  blueText: "2563EB",
  yellowPale: "FEF3C7",
  yellowText: "B45309",
  amber: "F59E0B",
};
const FONT = "Malgun Gothic";

// ===== HELPERS =====
function addSlideBase(slide) {
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0, y: 0, w: 13.33, h: 7.5, fill: { color: C.bg }
  });
}

function addFooter(slide, num, section) {
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0, y: 7.0, w: 13.33, h: 0.5, fill: { color: C.white }
  });
  slide.addText("Smart EcoSys", {
    x: 0.4, y: 7.05, w: 2.5, h: 0.4,
    fontSize: 9, color: C.grayLight, fontFace: FONT, bold: true
  });
  if (section) {
    slide.addText(section, {
      x: 5.0, y: 7.05, w: 4.0, h: 0.4,
      fontSize: 9, color: C.grayLight, fontFace: FONT, align: "center"
    });
  }
  slide.addText(String(num).padStart(2, "0"), {
    x: 12.0, y: 7.05, w: 1.0, h: 0.4,
    fontSize: 10, color: C.dark, fontFace: FONT, align: "right", bold: true
  });
}

function addSectionTitle(slide, title, subtitle) {
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.4, y: 0.3, w: 12.5, h: 1.1, fill: { color: C.white },
    shadow: { type: "outer", blur: 4, offset: 1, color: "D1D5DB", opacity: 0.3 }
  });
  slide.addText(title, {
    x: 0.7, y: 0.35, w: 11.0, h: 0.55,
    fontSize: 20, color: C.dark, fontFace: FONT, bold: true
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.7, y: 0.9, w: 11.0, h: 0.4,
      fontSize: 11, color: C.gray, fontFace: FONT
    });
  }
}

function addNumBadge(slide, num, x, y) {
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x, y, w: 0.4, h: 0.4, fill: { color: C.cardBorder }, rectRadius: 0.04
  });
  slide.addText(num, {
    x, y, w: 0.4, h: 0.4,
    fontSize: 11, color: C.gray, fontFace: FONT, bold: true, align: "center", valign: "middle"
  });
}

function addStatCard(slide, num, label, sublabel, x, y, w, h, accentColor) {
  const ac = accentColor || C.greenDeep;
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, fill: { color: C.white }, rectRadius: 0.08,
    shadow: { type: "outer", blur: 3, offset: 1, color: "D1D5DB", opacity: 0.3 }
  });
  slide.addText(num, {
    x, y: y + 0.15, w, h: h * 0.45,
    fontSize: 28, color: ac, fontFace: FONT, bold: true, align: "center"
  });
  slide.addText(label, {
    x: x + 0.15, y: y + h * 0.5, w: w - 0.3, h: h * 0.25,
    fontSize: 10, color: C.dark, fontFace: FONT, align: "center", bold: true
  });
  if (sublabel) {
    slide.addText(sublabel, {
      x: x + 0.15, y: y + h * 0.72, w: w - 0.3, h: h * 0.22,
      fontSize: 8, color: C.grayLight, fontFace: FONT, align: "center"
    });
  }
}

function addInfoCard(slide, x, y, w, h, bgColor) {
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, fill: { color: bgColor || C.greenPale }, rectRadius: 0.08,
  });
}

// ========================================
// SLIDE 1: COVER
// ========================================
let s1 = pptx.addSlide();
s1.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.33, h: 7.5, fill: { color: C.white } });
s1.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 0.12, h: 7.5, fill: { color: C.greenDeep } });
s1.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.33, h: 0.06, fill: { color: C.greenDeep } });
s1.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 7.44, w: 13.33, h: 0.06, fill: { color: C.greenDeep } });
s1.addShape(pptx.shapes.OVAL, { x: 10.5, y: 1.0, w: 2.0, h: 2.0, fill: { color: C.greenPale2 } });
s1.addShape(pptx.shapes.OVAL, { x: 11.2, y: 2.5, w: 1.5, h: 1.5, fill: { color: C.greenLight } });

s1.addText("SMARTECOSYS", {
  x: 0.8, y: 1.2, w: 8.0, h: 0.5,
  fontSize: 14, color: C.greenDeep, fontFace: FONT, bold: true, charSpacing: 6
});
s1.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 1.8, w: 2.5, h: 0.04, fill: { color: C.greenDeep } });
s1.addText("\uC804\uB7B5\uC801 \uD22C\uC790\uC81C\uC548\uC11C", {
  x: 0.8, y: 2.2, w: 9.0, h: 1.0,
  fontSize: 36, color: C.dark, fontFace: FONT, bold: true
});
s1.addText("\uD504\uB79C\uCC28\uC774\uC988 \uC5ED\uBB3C\uB958\uB9DD \uAE30\uBC18\n\uCEE4\uD53C\uBC15 \uACE0\uBD80\uAC00\uAC00\uCE58 \uC790\uC6D0\uD654 \uBC0F ESG \uC5F0\uACC4 \uBE44\uC988\uB2C8\uC2A4 \uBAA8\uB378", {
  x: 0.8, y: 3.3, w: 9.0, h: 1.2,
  fontSize: 16, color: C.gray, fontFace: FONT, lineSpacingMultiple: 1.6
});

const tags = ["\uCEE4\uD53C \uC18C\uBE44", "\uC790\uC6D0 \uC21C\uD658", "\uCCAD\uC815 \uC5D0\uB108\uC9C0"];
tags.forEach((tag, i) => {
  s1.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8 + i * 2.2, y: 4.8, w: 2.0, h: 0.4, fill: { color: C.greenPale }, rectRadius: 0.2
  });
  s1.addText(tag, {
    x: 0.8 + i * 2.2, y: 4.8, w: 2.0, h: 0.4,
    fontSize: 10, color: C.greenDeep, fontFace: FONT, align: "center", valign: "middle"
  });
});

s1.addText("2026. 04", {
  x: 0.8, y: 5.8, w: 3.0, h: 0.4, fontSize: 12, color: C.grayLight, fontFace: FONT
});
s1.addText("\uC8FC\uC2DD\uD68C\uC0AC \uC2A4\uB9C8\uD2B8\uC5D0\uCF54\uC2DC\uC2A4", {
  x: 0.8, y: 6.2, w: 4.0, h: 0.4, fontSize: 13, color: C.dark, fontFace: FONT, bold: true
});

// ========================================
// SLIDE 2: TABLE OF CONTENTS
// ========================================
let s2 = pptx.addSlide();
addSlideBase(s2);
addFooter(s2, 2);

s2.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 0.4, y: 0.3, w: 3.5, h: 0.7, fill: { color: C.greenDeep }, rectRadius: 0.06
});
s2.addText("Table of Contents", {
  x: 0.6, y: 0.35, w: 3.0, h: 0.25,
  fontSize: 10, color: C.greenLight, fontFace: FONT
});
s2.addText("\uBAA9\uCC28", {
  x: 0.6, y: 0.58, w: 3.0, h: 0.35,
  fontSize: 16, color: C.white, fontFace: FONT, bold: true
});

s2.addText("\uC2A4\uB9C8\uD2B8\uC5D0\uCF54\uC2DC\uC2A4\uC758\n\uC9C0\uC18D\uAC00\uB2A5\uD55C \uBE44\uC804\uACFC\n\uAD6C\uCCB4\uC801\uC778 \uD22C\uC790 \uC804\uB7B5\uC744\n\uC18C\uAC1C\uD569\uB2C8\uB2E4.", {
  x: 0.6, y: 1.3, w: 3.5, h: 1.6,
  fontSize: 12, color: C.gray, fontFace: FONT, lineSpacingMultiple: 1.6
});

const tocItems = [
  { n: "01", t: "\uC2DC\uC7A5 \uD604\uD669", d: "\uCEE4\uD53C \uC18C\uBE44\uC640 \uD3D0\uAE30\uBB3C \uBB38\uC81C" },
  { n: "02", t: "\uD3D0\uAE30 \uD504\uB85C\uC138\uC2A4 \uD55C\uACC4", d: "\uB9E4\uB9BD/\uC18C\uAC01 \uBE44\uC6A9, \uBA54\uD14C\uC778 \uBC30\uCD9C" },
  { n: "03", t: "\uBB3C\uB958 \uBCD1\uBAA9 \uD604\uC0C1", d: "3PL \uBB3C\uB958\uBE44 \uC6D0\uAC00 1/3 \uC810\uC720" },
  { n: "04", t: "\uD575\uC2EC \uC804\uB7B5: \uC5ED\uBB3C\uB958", d: "\uBE48 \uD68C\uD56D \uCC28\uB7C9 \uD65C\uC6A9, \uBB3C\uB958\uBE44 90%+ \uC808\uAC10" },
  { n: "05", t: "\uADDC\uC81C \uD601\uC2E0", d: "\uC21C\uD658\uC790\uC6D0 \uC778\uC815, \uC77C\uBC18\uCC28\uB7C9 \uC6B4\uBC18 \uD5C8\uC6A9" },
  { n: "06", t: "IoT \uC2A4\uB9C8\uD2B8 \uC218\uAC70", d: "\uC13C\uC11C, \uAC74\uC870\uC911\uB7C9 \uD658\uC0B0, \uCD5C\uC801 \uB178\uC120" },
  { n: "07", t: "\uCE5C\uD658\uACBD \uACE0\uC591\uC774 \uBAA8\uB798", d: "\uAE00\uB85C\uBC8C $76.6\uC5B5 \uC2DC\uC7A5, CAGR 4.14%" },
  { n: "08", t: "\uBC14\uC774\uC624 \uACE0\uD615\uC5F0\uB8CC", d: "5,649kcal/kg, \uBAA9\uC7AC\uD3A0\uB9BF 2\uBC30" },
  { n: "09", t: "\uD22C\uC790 \uAC00\uCE58 \uC81C\uC548", d: "ESG + \uBE44\uC6A9\uC808\uAC10 + ROI" },
  { n: "10", t: "\uACF5\uACF5 \uC870\uB2EC \uBC0F \uD611\uB825", d: "\uC9C0\uC790\uCCB4 \uC0AC\uB840, \uACF5\uACF5\uC870\uB2EC" },
  { n: "11", t: "\uD22C\uC790\uAE08 \uD65C\uC6A9 \uACC4\uD68D", d: "CAPEX/OPEX \uBC30\uBD84, \uC218\uC775 \uC21C\uD658" },
  { n: "12", t: "Closed-Loop \uC644\uC131", d: "\uACB0\uB860 \uBC0F \uD30C\uD2B8\uB108\uC2ED \uC81C\uC548" },
];

tocItems.forEach((item, i) => {
  const col = i < 6 ? 0 : 1;
  const row = col === 0 ? i : i - 6;
  const xBase = col === 0 ? 4.5 : 9.0;
  const yBase = 0.6 + row * 1.0;

  s2.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: xBase, y: yBase, w: 4.2, h: 0.85, fill: { color: C.white }, rectRadius: 0.06,
    shadow: { type: "outer", blur: 2, offset: 1, color: "E5E7EB", opacity: 0.3 }
  });
  s2.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: xBase + 0.15, y: yBase + 0.18, w: 0.45, h: 0.45, fill: { color: C.cardBorder }, rectRadius: 0.04
  });
  s2.addText(item.n, {
    x: xBase + 0.15, y: yBase + 0.18, w: 0.45, h: 0.45,
    fontSize: 11, color: C.gray, fontFace: FONT, bold: true, align: "center", valign: "middle"
  });
  s2.addText(item.t, {
    x: xBase + 0.75, y: yBase + 0.1, w: 3.2, h: 0.4,
    fontSize: 11, color: C.dark, fontFace: FONT, bold: true
  });
  s2.addText(item.d, {
    x: xBase + 0.75, y: yBase + 0.45, w: 3.2, h: 0.35,
    fontSize: 9, color: C.grayLight, fontFace: FONT
  });
});

// ========================================
// SLIDE 3: Market Status
// ========================================
let s3 = pptx.addSlide();
addSlideBase(s3);
addSectionTitle(s3, "\uC5F0\uAC04 40\uB9CC \uD1A4, \uBC84\uB824\uC9C0\uB294 \uCEE4\uD53C\uBC15\uC758 \uD604\uC2E4", "01. \uC2DC\uC7A5 \uD604\uD669 \uBC0F \uBB38\uC81C \uC815\uC758");
addFooter(s3, 3, "01. \uC2DC\uC7A5 \uD604\uD669");

const stats3 = [
  { n: "01", title: "\uD55C\uAD6D \uCEE4\uD53C \uC18C\uBE44", val: "\uC138\uACC4 3\uC704", sub: "1\uC778\uB2F9 \uC5F0\uAC04 405\uC794 \uC18C\uBE44\n(\uC138\uACC4 \uD3C9\uADE0\uC758 2.7\uBC30)", bg: C.greenPale2 },
  { n: "02", title: "\uC5F0\uAC04 \uBC1C\uC0DD\uB7C9", val: "400,000\uD1A4", sub: "\uB9E4\uB144 40\uB9CC \uD1A4\uC758 \uCEE4\uD53C\uCC0C\uAEBC\uAE30\n\uC0DD\uD65C\uD3D0\uAE30\uBB3C\uB85C \uBC30\uCD9C", bg: C.redPale },
  { n: "03", title: "\uD604\uC7AC \uCC98\uB9AC \uBC29\uC2DD", val: "90% \uC18C\uAC01\u00B7\uB9E4\uB9BD", sub: "\uC7AC\uD65C\uC6A9\uB960 10% \uBBF8\uB9CC,\n\uC2EC\uAC01\uD55C \uD0C4\uC18C \uBC30\uCD9C\uC6D0", bg: C.redPale },
  { n: "04", title: "\uCE74\uD398 \uD3D0\uAE30 \uBD80\uB2F4", val: "\uC6D4 5~15\uB9CC\uC6D0", sub: "\uC885\uB7C9\uC81C \uBD09\uD22C \uAD6C\uB9E4 \uBE44\uC6A9\n\uBC0F \uC545\uCDE8/\uBCF4\uAD00 \uBB38\uC81C", bg: C.yellowPale },
];

stats3.forEach((s, i) => {
  const x = 0.4 + i * 3.15;
  const y = 1.7;
  s3.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x, y, w: 2.95, h: 3.3, fill: { color: s.bg }, rectRadius: 0.1
  });
  addNumBadge(s3, s.n, x + 0.15, y + 0.15);
  s3.addText(s.title, {
    x: x + 0.6, y: y + 0.15, w: 2.15, h: 0.4,
    fontSize: 10, color: C.gray, fontFace: FONT
  });
  s3.addText(s.val, {
    x: x + 0.15, y: y + 0.7, w: 2.65, h: 0.8,
    fontSize: 22, color: C.coffee, fontFace: FONT, bold: true, align: "center"
  });
  s3.addText(s.sub, {
    x: x + 0.15, y: y + 1.6, w: 2.65, h: 1.0,
    fontSize: 9, color: C.grayLight, fontFace: FONT, align: "center", lineSpacingMultiple: 1.5
  });
});

addInfoCard(s3, 0.4, 5.3, 12.5, 1.3, C.redPale);
s3.addText([
  { text: "\uB9E4\uB9BD \uC2DC \uBA54\uD0C4(CH\u2084) \uBC1C\uC0DD  ", options: { bold: true, color: C.redText, fontSize: 12 } },
  { text: "\uC628\uC2E4\uAC00\uC2A4 \uC545\uD654 (CO\u2082\uC758 80\uBC30)  |  ", options: { color: C.dark, fontSize: 11 } },
  { text: "ESG \uADDC\uC81C \uAC15\uD654  ", options: { bold: true, color: C.redText, fontSize: 12 } },
  { text: "(Scope 3 \uBE44\uC6A9 \uC0C1\uC2B9)  |  ", options: { color: C.dark, fontSize: 11 } },
  { text: "\uC5F0\uAC04 \uC9C0\uC790\uCCB4 \uD3D0\uAE30 \uBE44\uC6A9 41\uC5B5 \uC6D0+", options: { bold: true, color: C.dark, fontSize: 11 } },
], { x: 0.7, y: 5.5, w: 12.0, h: 0.9, fontFace: FONT, lineSpacingMultiple: 1.4 });

// ========================================
// SLIDE 4: Existing Disposal Limits
// ========================================
let s4 = pptx.addSlide();
addSlideBase(s4);
addSectionTitle(s4, "\uAE30\uC874 \uD3D0\uAE30 \uD504\uB85C\uC138\uC2A4\uC758 \uAD6C\uC870\uC801 \uD55C\uACC4", "02. \uB9E4\uB9BD/\uC18C\uAC01 \uC911\uC2EC \uCC98\uB9AC\uC758 \uD658\uACBD\uC801, \uC7AC\uBB34\uC801 \uBE44\uC6A9");
addFooter(s4, 4, "02. \uD3D0\uAE30 \uD504\uB85C\uC138\uC2A4 \uD55C\uACC4");

const tRows = [
  [
    { text: "\uAD6C\uBD84", options: { bold: true, color: C.white, fill: { color: C.dark }, fontSize: 11, fontFace: FONT } },
    { text: "\uBC1C\uC0DD \uBA54\uCEE4\uB2C8\uC998 \uBC0F \uD604\uD669", options: { bold: true, color: C.white, fill: { color: C.dark }, fontSize: 11, fontFace: FONT } },
    { text: "\uACBD\uC81C\uC801 / \uD658\uACBD\uC801 \uD30C\uAE09 \uD6A8\uACFC", options: { bold: true, color: C.white, fill: { color: C.dark }, fontSize: 11, fontFace: FONT } },
  ],
  [
    { text: "\uC5F0\uAC04 \uBC30\uCD9C \uADDC\uBAA8", options: { bold: true, fontSize: 10, fontFace: FONT, color: C.dark } },
    { text: "2019\uB144 \uAE30\uC900 176,000\uD1A4 \uC774\uC0C1\n(\uD604\uC7AC \uB354 \uC99D\uAC00 \uCD94\uC138)", options: { fontSize: 10, fontFace: FONT, color: C.darkSub } },
    { text: "\uCEE4\uD53C 1\uC794\uB2F9 14.97g~16g \uD3D0\uAE30\uBB3C \uC794\uB958", options: { fontSize: 10, fontFace: FONT, color: C.darkSub } },
  ],
  [
    { text: "\uCC98\uB9AC \uBE44\uC6A9 (\uC7AC\uBB34)", options: { bold: true, fontSize: 10, fontFace: FONT, color: C.dark } },
    { text: "\uB9E4\uB9BD kg\uB2F9 15\uC6D0 / \uC18C\uAC01 kg\uB2F9 10\uC6D0", options: { fontSize: 10, fontFace: FONT, color: C.darkSub } },
    { text: "\uC5F0\uAC04 \uC9C0\uC790\uCCB4 \uD3D0\uAE30 \uBE44\uC6A9 41\uC5B5 \uC6D0 \uC774\uC0C1", options: { fontSize: 10, fontFace: FONT, color: C.redText } },
  ],
  [
    { text: "\uD658\uACBD \uC624\uC5FC \uB9AC\uC2A4\uD06C", options: { bold: true, fontSize: 10, fontFace: FONT, color: C.dark } },
    { text: "\uBD80\uD328 \uACFC\uC815\uC5D0\uC11C \uAE30\uD6C4\uBCC0\uD654 6\uB300 \uC628\uC2E4\uAC00\uC2A4\n\uBA54\uD14C\uC778(CH\u2084) \uB300\uB7C9 \uBC30\uCD9C", options: { fontSize: 10, fontFace: FONT, color: C.darkSub } },
    { text: "Scope 3 \uC628\uC2E4\uAC00\uC2A4 \uBC30\uCD9C\uB7C9 \uAE09\uC99D\n\uD0C4\uC18C\uC138 \uC7A0\uC7AC \uB9AC\uC2A4\uD06C", options: { fontSize: 10, fontFace: FONT, color: C.redText } },
  ],
  [
    { text: "\uB9E4\uC7A5 \uB0B4 \uC7AC\uD65C\uC6A9 \uD55C\uACC4", options: { bold: true, fontSize: 10, fontFace: FONT, color: C.dark } },
    { text: "\uD0C8\uCDE8\uC81C \uBA85\uBAA9 \uACE0\uAC1D \uBB34\uB8CC \uC81C\uACF5\n(\uAD6D\uC9C0\uC801, \uC77C\uC2DC\uC801 \uD55C\uACC4)", options: { fontSize: 10, fontFace: FONT, color: C.darkSub } },
    { text: "\uD0C8\uCDE8 \uC218\uBA85 \uC885\uB8CC \uD6C4\n\uC0DD\uD65C\uC4F0\uB808\uAE30\uB85C \uC7AC\uD3B8\uC785", options: { fontSize: 10, fontFace: FONT, color: C.darkSub } },
  ],
];

s4.addTable(tRows, {
  x: 0.4, y: 1.7, w: 12.5,
  border: { type: "solid", pt: 0.5, color: C.cardBorder },
  colW: [2.8, 4.85, 4.85],
  rowH: [0.5, 0.7, 0.7, 0.7, 0.7],
  margin: [6, 10, 6, 10],
  autoPage: false,
});

addInfoCard(s4, 0.4, 5.3, 12.5, 1.2, C.greenPale);
s4.addText([
  { text: "\u276F  ", options: { color: C.greenDeep, fontSize: 13, bold: true } },
  { text: "\uBA54\uD14C\uC778(CH\u2084)\uC740 CO\u2082 \uB300\uBE44 \uB2E8\uAE30 80\uBC30, \uC7A5\uAE30 21\uBC30\uC758 \uC9C0\uAD6C\uC628\uB09C\uD654\uC9C0\uC218(GWP)\uB97C \uBCF4\uC720\uD55C \uAE30\uD6C4\uBCC0\uD654 6\uB300 \uD575\uC2EC \uC628\uC2E4\uAC00\uC2A4", options: { color: C.dark, fontSize: 11 } },
], { x: 0.7, y: 5.5, w: 12.0, h: 0.8, fontFace: FONT });

// ========================================
// SLIDE 5: 3PL Logistics
// ========================================
let s5 = pptx.addSlide();
addSlideBase(s5);
addSectionTitle(s5, "3PL \uBB3C\uB958\uC758 \uACBD\uC81C\uC131 \uACB0\uC5EC", "03. \uB3C5\uB9BD \uBB3C\uB958 \uCCB4\uACC4\uC758 \uCE58\uBA85\uC801 \uBCD1\uBAA9 \uD604\uC0C1");
addFooter(s5, 5, "03. \uBB3C\uB958 \uBCD1\uBAA9 \uD604\uC0C1");

s5.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 0.4, y: 1.7, w: 4.5, h: 4.5, fill: { color: C.redPale }, rectRadius: 0.15
});
s5.addText("1/3", {
  x: 0.4, y: 2.0, w: 4.5, h: 2.0,
  fontSize: 80, color: C.redText, fontFace: FONT, bold: true, align: "center"
});
s5.addText("\uC81C\uC870\uC6D0\uAC00(COGS) \uC911\n\uBB3C\uB958\uBE44 \uBE44\uC911", {
  x: 0.4, y: 3.8, w: 4.5, h: 1.0,
  fontSize: 14, color: C.dark, fontFace: FONT, align: "center", bold: true, lineSpacingMultiple: 1.4
});
s5.addText("\uC2DC\uC7A5 \uAC00\uACA9 \uACBD\uC7C1\uB825 \uC644\uC804 \uC0C1\uC2E4", {
  x: 0.4, y: 4.9, w: 4.5, h: 0.5,
  fontSize: 11, color: C.redText, fontFace: FONT, align: "center"
});

const problems = [
  { n: "01", t: "\uCEE4\uD53C\uBC15 \uBB3C\uB9AC\uC801 \uD2B9\uC131", d: "\uC218\uBD84 \uD568\uC720\uB85C \uBB34\uAC81\uACE0 \uBCC0\uC9C8 \uC6A9\uC774, \uAC1C\uBCC4 \uAC00\uB9F9\uC810 \uBC30\uCD9C\uB7C9 \uC18C\uADDC\uBAA8" },
  { n: "02", t: "\uC804\uB2F4 \uCC28\uB7C9 \uC218\uAC70 \uBE44\uC6A9", d: "\uC720\uB958\uBE44, \uAE30\uC0AC \uC778\uAC74\uBE44, \uAC10\uAC00\uC0C1\uAC01\uBE44 \uC804\uC561 \uC81C\uC870\uB2E8\uAC00\uC5D0 \uC804\uAC00" },
  { n: "03", t: "\uC6B4\uC1A1 \uBC00\uB3C4 \uBD80\uC7AC", d: "\uBB3C\uB958 \uACBD\uC81C\uD559\uC758 \uD575\uC2EC\uC778 \uC6B4\uC1A1\uBC00\uB3C4\uC640 \uC801\uC7AC \uD6A8\uC728\uC131 \uACB0\uC5EC" },
  { n: "04", t: "\uADDC\uBAA8\uC758 \uBE44\uACBD\uC81C", d: "\uC0B0\uBC1C\uC801 \uC218\uCC9C \uAC1C \uAC00\uB9F9\uC810 \uC21C\uD68C(Milk-run) \uBC29\uC2DD \uBE44\uD6A8\uC728" },
  { n: "05", t: "\uADDC\uBAA8 \uD655\uC7A5 \uBD88\uAC00", d: "\uC804\uD1B5\uC801 \uBB3C\uB958 \uCCB4\uACC4\uB85C\uB294 \uC808\uB300 \uD574\uACB0 \uBD88\uAC00\uB2A5\uD55C \uAD6C\uC870" },
];

problems.forEach((p, i) => {
  const y = 1.7 + i * 0.92;
  s5.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 5.3, y, w: 7.6, h: 0.8, fill: { color: C.white }, rectRadius: 0.06,
    shadow: { type: "outer", blur: 2, offset: 1, color: "E5E7EB", opacity: 0.3 }
  });
  addNumBadge(s5, p.n, 5.5, y + 0.2);
  s5.addText(p.t, {
    x: 6.1, y: y + 0.05, w: 2.5, h: 0.35,
    fontSize: 11, color: C.dark, fontFace: FONT, bold: true
  });
  s5.addText(p.d, {
    x: 6.1, y: y + 0.38, w: 6.5, h: 0.35,
    fontSize: 9, color: C.grayLight, fontFace: FONT
  });
});

addInfoCard(s5, 5.3, 6.3, 7.6, 0.5, C.greenPale);
s5.addText("\u276F  \uAE30\uC874 \uC778\uD504\uB77C\uC5D0 \uC790\uC6D0 \uD68C\uC218\uB97C \uC735\uD569\uC2DC\uD0A4\uB294 \uD30C\uAD34\uC801 \uC811\uADFC \uBC29\uC2DD \uD544\uC694", {
  x: 5.5, y: 6.3, w: 7.2, h: 0.5,
  fontSize: 11, color: C.greenDeep, fontFace: FONT, bold: true, valign: "middle"
});

// ========================================
// SLIDE 6: Reverse Logistics
// ========================================
let s6 = pptx.addSlide();
addSlideBase(s6);
addSectionTitle(s6, "\uD575\uC2EC \uC804\uB7B5: \uC5ED\uBB3C\uB958 \uB124\uD2B8\uC6CC\uD06C \uD1B5\uD569", "04. Reverse Logistics \u2014 \uBE48 \uD68C\uD56D \uCC28\uB7C9\uC758 \uC804\uB7B5\uC801 \uD65C\uC6A9");
addFooter(s6, 6, "04. \uD575\uC2EC \uC804\uB7B5");

const flowLabels = [
  { label: "\uBCF8\uC0AC \uBB3C\uB958\uC13C\uD130\n\uC6D0\uB450/\uBD80\uC790\uC7AC \uC801\uC7AC", bg: C.greenPale2 },
  { label: "\uAC00\uB9F9\uC810 \uBC30\uC1A1\n\uC0C1\uD488 \uD558\uC5ED \uC644\uB8CC", bg: C.greenPale2 },
  { label: "\uCEE4\uD53C\uBC15 \uC801\uC7AC\n\uBE48 \uCC28\uB7C9 \uD65C\uC6A9", bg: C.yellowPale },
  { label: "\uBB3C\uB958\uAC70\uC810 \uC9D1\uD558\nCross-docking", bg: C.yellowPale },
  { label: "\uC790\uC6D0\uD654 \uD50C\uB79C\uD2B8\n\uC81C\uD488 \uC81C\uC870", bg: C.greenPale2 },
];

flowLabels.forEach((f, i) => {
  const x = 0.3 + i * 2.6;
  s6.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x, y: 1.7, w: 2.2, h: 1.1, fill: { color: f.bg }, rectRadius: 0.08
  });
  s6.addText(f.label, {
    x, y: 1.72, w: 2.2, h: 1.06,
    fontSize: 10, color: C.dark, fontFace: FONT, bold: true, align: "center", valign: "middle", lineSpacingMultiple: 1.3
  });
  if (i < 4) {
    s6.addText("\u25B6", {
      x: x + 2.2, y: 1.9, w: 0.4, h: 0.7,
      fontSize: 16, color: C.greenDeep, fontFace: FONT, align: "center"
    });
  }
});

addStatCard(s6, "~0\uC6D0", "\uD55C\uACC4 \uC6B4\uC1A1 \uBE44\uC6A9", "Marginal Transport Cost\n\uC2E4\uC9C8\uC801 \uC81C\uB85C \uC218\uB834", 0.4, 3.2, 3.9, 2.0, C.greenDeep);
addStatCard(s6, "90%+", "\uBB3C\uB958\uBE44 \uC808\uAC10\uB960", "\uC6D0\uAC00 \uAD6C\uC870\uC758 1/3\uC744\n\uAC09\uC544\uBA39\uB358 \uBB3C\uB958\uBE44 \uC18C\uAC70", 4.6, 3.2, 3.9, 2.0, C.greenDeep);
addStatCard(s6, "0 \uCD94\uAC00\uBC30\uCC28", "\uCD94\uAC00 \uC6B4\uD589/\uAE30\uC0AC \uBD88\uD544\uC694", "\uD504\uB79C\uCC28\uC774\uC988 \uAE30\uC874 \uBB3C\uB958\uB9DD\n100% \uD65C\uC6A9", 8.8, 3.2, 4.1, 2.0, C.greenDeep);

addInfoCard(s6, 0.4, 5.5, 12.5, 1.0, C.greenPale);
s6.addText([
  { text: "\u276F  ", options: { color: C.greenDeep, fontSize: 13, bold: true } },
  { text: "FedEx, UPS \uB4F1 \uAE00\uB85C\uBC8C \uBB3C\uB958 \uAE30\uC5C5\uC774 \uC774\uBBF8 \uC5ED\uBB3C\uB958\uB85C \uB9C9\uB300\uD55C \uACBD\uC7C1\uB825 \uD655\uBCF4  |  \uD504\uB79C\uCC28\uC774\uC988 \uC21C\uBC29\uD5A5 \uBB3C\uB958\uC640 \uC5ED\uBB3C\uB958\uC758 \uD558\uC774\uBE0C\uB9AC\uB4DC \uACB0\uD569", options: { color: C.dark, fontSize: 11 } },
], { x: 0.7, y: 5.6, w: 12.0, h: 0.8, fontFace: FONT });

// ========================================
// SLIDE 7: Regulatory Innovation
// ========================================
let s7 = pptx.addSlide();
addSlideBase(s7);
addSectionTitle(s7, "\uADDC\uC81C \uD601\uC2E0: \uC21C\uD658\uC790\uC6D0 \uC778\uC815", "05. 2022\uB144 \uD658\uACBD\uBD80 \uC801\uADF9\uD589\uC815\uC704\uC6D0\uD68C \uC2EC\uC758");
addFooter(s7, 7, "05. \uADDC\uC81C \uD601\uC2E0");

s7.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.4, y: 1.7, w: 5.8, h: 3.8, fill: { color: C.redPale }, rectRadius: 0.12 });
s7.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.8, y: 1.9, w: 2.0, h: 0.45, fill: { color: C.redText }, rectRadius: 0.04 });
s7.addText("BEFORE", { x: 0.8, y: 1.9, w: 2.0, h: 0.45, fontSize: 12, color: C.white, fontFace: FONT, bold: true, align: "center", valign: "middle" });

["\u2716  \uCEE4\uD53C\uCC0C\uAEBC\uAE30 = '\uC77C\uBC18 \uD3D0\uAE30\uBB3C' \uBD84\uB958",
 "\u2716  '\uD3D0\uAE30\uBB3C \uC804\uBB38 \uC218\uC9D1\uC6B4\uBC18\uC5C5\uCCB4'\uB9CC \uD569\uBC95 \uC6B4\uBC18",
 "\u2716  \uD2B9\uC218 \uCC28\uB7C9 \uD544\uC218 \uC694\uAC74",
 "\u2716  \uD504\uB79C\uCC28\uC774\uC988 \uC77C\uBC18 \uBB3C\uB958 \uCC28\uB7C9 \uC218\uAC70 \uC6D0\uCC9C \uCC28\uB2E8",
].forEach((item, i) => {
  s7.addText(item, { x: 0.8, y: 2.6 + i * 0.6, w: 5.0, h: 0.45, fontSize: 11, color: C.dark, fontFace: FONT });
});

s7.addText("\u25B6", { x: 6.0, y: 3.1, w: 1.2, h: 1.0, fontSize: 32, color: C.greenDeep, fontFace: FONT, align: "center" });

s7.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 7.1, y: 1.7, w: 5.8, h: 3.8, fill: { color: C.greenPale }, rectRadius: 0.12 });
s7.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 7.5, y: 1.9, w: 3.0, h: 0.45, fill: { color: C.greenDeep }, rectRadius: 0.04 });
s7.addText("AFTER (2022.03~)", { x: 7.5, y: 1.9, w: 3.0, h: 0.45, fontSize: 12, color: C.white, fontFace: FONT, bold: true, align: "center", valign: "middle" });

["\u2714  \uCEE4\uD53C\uCC0C\uAEBC\uAE30 = '\uC21C\uD658\uC790\uC6D0' \uACF5\uC2DD \uC778\uC815",
 "\u2714  \uD3D0\uAE30\uBB3C \uBD84\uB958 \uAE30\uC900\uC5D0\uC11C \uC81C\uC678",
 "\u2714  \uC77C\uBC18 \uD654\uBB3C \uCC28\uB7C9\uC73C\uB85C \uD569\uBC95 \uC6B4\uBC18 \uAC00\uB2A5",
 "\u2714  \uD504\uB79C\uCC28\uC774\uC988 \uBB3C\uB958\uB9DD \uD63C\uC6A9(\uC5ED\uBB3C\uB958) \uAC00\uB2A5",
].forEach((item, i) => {
  s7.addText(item, { x: 7.5, y: 2.6 + i * 0.6, w: 5.0, h: 0.45, fontSize: 11, color: C.dark, fontFace: FONT });
});

addInfoCard(s7, 0.4, 5.8, 12.5, 0.8, C.yellowPale);
s7.addText([
  { text: "\uC815\uCC45\uC801 \uC21C\uD48D(Tailwind)  ", options: { bold: true, color: C.yellowText, fontSize: 12 } },
  { text: "\uC5ED\uBB3C\uB958 \uC81C\uC548\uC758 \uAC00\uC7A5 \uAC15\uB825\uD55C \uBC95\uB960\uC801 \uBA85\uBD84 \uD655\uBCF4 \u2014 \uC77C\uBC18 \uBB3C\uB958 \uCC28\uB7C9\uC758 \uCEE4\uD53C\uBC15 \uC6B4\uBC18\uC774 \uD569\uBC95\uD654", options: { color: C.dark, fontSize: 11 } }
], { x: 0.7, y: 5.9, w: 12.0, h: 0.6, fontFace: FONT });

// ========================================
// SLIDE 8: IoT Smart Collection
// ========================================
let s8 = pptx.addSlide();
addSlideBase(s8);
addSectionTitle(s8, "IoT \uAE30\uBC18 \uC2A4\uB9C8\uD2B8 \uC218\uAC70 \uC2DC\uC2A4\uD15C", "06. \uD2B9\uD5C8 \uAE30\uBC18 \uCEE4\uD53C\uCC0C\uAEBC\uAE30 \uC218\uAC70 \uC5ED\uBB3C\uB958 \uC2DC\uC2A4\uD15C");
addFooter(s8, 8, "06. IoT \uC2A4\uB9C8\uD2B8 \uC218\uAC70");

const iotCards = [
  { n: "01", t: "\uC2A4\uB9C8\uD2B8 \uBCF4\uAD00 \uC6A9\uAE30", d: "\uAC00\uB9F9\uC810 \uB0B4 IoT \uC13C\uC11C \uB0B4\uC7A5\n\uC911\uB7C9 + \uD568\uC218\uC728(\uC218\uBD84) \uC2E4\uC2DC\uAC04 \uCE21\uC815", bg: C.greenPale2, x: 0.4, y: 1.7 },
  { n: "02", t: "\uB370\uC774\uD130 \uBB34\uC120 \uC1A1\uCD9C", d: "\uC911\uB7C9/\uD568\uC218\uC728/GPS \uC704\uCE58 \uC815\uBCF4\n\uD074\uB77C\uC6B0\uB4DC \uC911\uC559 \uC11C\uBC84\uB85C \uC989\uAC01 \uC804\uC1A1", bg: C.greenPale2, x: 6.9, y: 1.7 },
  { n: "03", t: "\uAC74\uC870\uC911\uB7C9 \uD658\uC0B0", d: "\uD568\uC218\uC728 \uB370\uC774\uD130 \uAE30\uBC18\n\uC2E4\uC81C \uC81C\uC870 \uD22C\uC785 \uAC00\uB2A5 \uAC74\uC870\uC911\uB7C9 \uC0B0\uCD9C", bg: C.yellowPale, x: 0.4, y: 3.5 },
  { n: "04", t: "\uCD5C\uC801 \uB178\uC120 \uB3C4\uCD9C", d: "\uAC74\uC870\uC911\uB7C9 + \uBD80\uD328 \uC784\uACC4\uC2DC\uAC04 +\n\uC794\uC5EC \uC801\uC7AC\uACF5\uAC04/\uAC70\uB9AC \uC885\uD569 \uC5F0\uC0B0", bg: C.yellowPale, x: 6.9, y: 3.5 },
];

iotCards.forEach(c => {
  s8.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: c.x, y: c.y, w: 6.0, h: 1.4, fill: { color: c.bg }, rectRadius: 0.1 });
  addNumBadge(s8, c.n, c.x + 0.2, c.y + 0.2);
  s8.addText(c.t, { x: c.x + 0.75, y: c.y + 0.1, w: 4.5, h: 0.4, fontSize: 13, color: C.dark, fontFace: FONT, bold: true });
  s8.addText(c.d, { x: c.x + 0.75, y: c.y + 0.55, w: 5.0, h: 0.7, fontSize: 10, color: C.gray, fontFace: FONT, lineSpacingMultiple: 1.4 });
});

s8.addText("\u25B6", { x: 6.1, y: 2.0, w: 1.0, h: 0.8, fontSize: 22, color: C.greenDeep, fontFace: FONT, align: "center" });
s8.addText("\u25BC", { x: 2.8, y: 3.0, w: 1.0, h: 0.6, fontSize: 22, color: C.greenDeep, fontFace: FONT, align: "center" });
s8.addText("\u25B6", { x: 6.1, y: 3.8, w: 1.0, h: 0.8, fontSize: 22, color: C.amber, fontFace: FONT, align: "center" });

addInfoCard(s8, 0.4, 5.3, 12.5, 1.2, C.greenPale);
s8.addText([
  { text: "\uAE30\uC220\uC801 \uD574\uC790(Moat)  ", options: { bold: true, color: C.greenDeep, fontSize: 12 } },
  { text: "\uC545\uCDE8 \uC0AC\uC804 \uCC28\uB2E8 | \uC801\uC7AC \uD6A8\uC728 \uADF9\uB300\uD654 | \uAC74\uC870 \uC5D0\uB108\uC9C0 \uBE44\uC6A9 \uC120\uC81C\uC801 \uD1B5\uC81C | \uC218\uAC70 \uB178\uC120 \uAE30\uC0AC \uB2E8\uB9D0\uAE30 \uC790\uB3D9 \uC804\uC1A1", options: { color: C.dark, fontSize: 11 } }
], { x: 0.7, y: 5.5, w: 12.0, h: 0.8, fontFace: FONT });

// ========================================
// SLIDE 9: Cat Litter
// ========================================
let s9 = pptx.addSlide();
addSlideBase(s9);
addSectionTitle(s9, "\uCE5C\uD658\uACBD \uACE0\uC591\uC774 \uBAA8\uB798 \u2014 B2C \uD575\uC2EC \uC81C\uD488", "07. \uAE00\uB85C\uBC8C \uACE0\uC18D \uC131\uC7A5 \uC18C\uBE44\uC7AC \uC2DC\uC7A5");
addFooter(s9, 9, "07. \uACE0\uC591\uC774 \uBAA8\uB798");

addStatCard(s9, "$62.6\uC5B5", "2026\uB144 \uC2DC\uC7A5 \uADDC\uBAA8", "(\uC57D 8\uC870 \uC6D0)", 0.4, 1.7, 3.8, 1.6, C.greenDeep);
addStatCard(s9, "$76.6\uC5B5", "2031\uB144 \uC804\uB9DD", "(\uC57D 10\uC870 \uC6D0)", 4.6, 1.7, 3.8, 1.6, C.greenDeep);
addStatCard(s9, "4.14%", "CAGR", "(2026~2031 \uC5F0\uD3C9\uADE0 \uC131\uC7A5\uB960)", 8.8, 1.7, 4.1, 1.6, C.coffee);

const advCards = [
  { n: "01", t: "\uCC9C\uC5F0 \uB2E4\uACF5\uC131 \uD0C8\uCDE8\uB825", d: "\uCEE4\uD53C \uC6D0\uB450 \uAE30\uACF5\uC774 \uC554\uBAA8\uB2C8\uC544 \uC545\uCDE8 \uBD84\uC790\uB97C \uAC15\uB825 \uD761\uCC29", bg: C.greenPale2 },
  { n: "02", t: "\uC2DD\uBB3C\uC131 \uC18C\uC7AC \uD2B8\uB80C\uB4DC", d: "\uBCA4\uD1A0\uB098\uC774\uD2B8(\uC810\uD1A0) \uB300\uBE44 \uBA3C\uC9C0 \uC5C6\uC74C, \uD638\uD761\uAE30 \uC548\uC804", bg: C.greenPale2 },
  { n: "03", t: "\uACBD\uB7C9 DTC \uCD5C\uC801\uD654", d: "\uB0AE\uC740 \uBC00\uB3C4\uB85C \uD0DD\uBC30 \uC6B4\uC1A1\uBE44 \uC808\uAC10, \uC628\uB77C\uC778 \uAD6C\uB3C5 \uBAA8\uB378 \uC801\uD569", bg: C.yellowPale },
  { n: "04", t: "ESG \uC18C\uBE44\uC790 \uAC10\uC131", d: "100% \uD3D0\uAE30\uBB3C \uC7AC\uD65C\uC6A9, \uC778\uACF5 \uD654\uD559\uD5A5\uB8CC \uBB34\uCCA8\uAC00", bg: C.yellowPale },
];

advCards.forEach((a, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = 0.4 + col * 6.3;
  const y = 3.7 + row * 1.2;
  s9.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x, y, w: 6.0, h: 1.0, fill: { color: a.bg }, rectRadius: 0.08 });
  addNumBadge(s9, a.n, x + 0.15, y + 0.3);
  s9.addText(a.t, { x: x + 0.65, y: y + 0.05, w: 5.0, h: 0.4, fontSize: 11, color: C.dark, fontFace: FONT, bold: true });
  s9.addText(a.d, { x: x + 0.65, y: y + 0.45, w: 5.0, h: 0.4, fontSize: 9, color: C.gray, fontFace: FONT });
});

s9.addText("Mordor Intelligence \uC0B0\uC5C5 \uB9AC\uD3EC\uD2B8 \uAE30\uBC18", { x: 0.4, y: 6.5, w: 5.0, h: 0.3, fontSize: 8, color: C.grayLight, fontFace: FONT, italic: true });

// ========================================
// SLIDE 10: Bio Fuel
// ========================================
let s10 = pptx.addSlide();
addSlideBase(s10);
addSectionTitle(s10, "\uBC14\uC774\uC624 \uACE0\uD615\uC5F0\uB8CC \u2014 B2B \uCE90\uC2DC\uCE74\uC6B0", "08. \uD0C4\uC18C \uC800\uAC10\uD615 \uACE0\uD6A8\uC728 \uC5D0\uB108\uC9C0\uC6D0");
addFooter(s10, 10, "08. \uBC14\uC774\uC624 \uACE0\uD615\uC5F0\uB8CC");

s10.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 0.4, y: 1.7, w: 5.5, h: 3.3, fill: { color: C.white }, rectRadius: 0.12,
  shadow: { type: "outer", blur: 4, offset: 1, color: "D1D5DB", opacity: 0.3 }
});
s10.addText("5,649", { x: 0.4, y: 1.9, w: 5.5, h: 1.3, fontSize: 64, color: C.greenDeep, fontFace: FONT, bold: true, align: "center" });
s10.addText("kcal/kg", { x: 0.4, y: 3.1, w: 5.5, h: 0.5, fontSize: 20, color: C.greenBright, fontFace: FONT, align: "center" });
s10.addText("\uAC74\uC870 \uCEE4\uD53C\uBC15 \uBC1C\uC5F4\uB7C9\n\uBAA9\uC7AC \uD3A0\uB9BF \uB300\uBE44 \uC57D 2\uBC30", {
  x: 0.4, y: 3.6, w: 5.5, h: 0.8, fontSize: 12, color: C.gray, fontFace: FONT, align: "center", lineSpacingMultiple: 1.4
});

const bens = [
  { n: "01", t: "B2B \uCE90\uC2DC\uCE74\uC6B0", d: "\uC0B0\uC5C5\uC6A9 \uBCF4\uC77C\uB7EC/\uBC1C\uC804\uC18C \uB0A9\uD488\uC73C\uB85C \uB9E4\uCD9C \uD558\uBC29 \uACBD\uC9C1\uC131 \uD655\uBCF4", bg: C.greenPale2 },
  { n: "02", t: "RPS \uC81C\uB3C4 \uB300\uC751", d: "\uD654\uC11D\uC5F0\uB8CC \uD63C\uC18C \uC758\uBB34\uD654\uC5D0 \uB530\uB978 \uBC14\uC774\uC624\uB9E4\uC2A4 \uC218\uC694 \uAE09\uC99D", bg: C.greenPale2 },
  { n: "03", t: "100% \uD3D0\uAE30\uBB3C \uC7AC\uD65C\uC6A9", d: "\uBC8C\uBAA9 \uB17C\uB780 \uC5C6\uB294 \uCE5C\uD658\uACBD \uC778\uC99D \uAC00\uB2A5", bg: C.yellowPale },
  { n: "04", t: "\uC7A5\uAE30 \uACF5\uAE09 \uACC4\uC57D", d: "\uBC1C\uC804 \uACF5\uAE30\uC5C5\uACFC\uC758 \uC548\uC815\uC801 \uC218\uC775 \uAD6C\uC870 \uD655\uBCF4", bg: C.yellowPale },
];

bens.forEach((b, i) => {
  const y = 1.7 + i * 0.88;
  s10.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 6.3, y, w: 6.6, h: 0.75, fill: { color: b.bg }, rectRadius: 0.06 });
  addNumBadge(s10, b.n, 6.5, y + 0.18);
  s10.addText(b.t, { x: 7.1, y: y + 0.02, w: 2.5, h: 0.35, fontSize: 11, color: C.dark, fontFace: FONT, bold: true });
  s10.addText(b.d, { x: 7.1, y: y + 0.35, w: 5.5, h: 0.35, fontSize: 9, color: C.gray, fontFace: FONT });
});

addInfoCard(s10, 0.4, 5.3, 12.5, 1.0, C.greenPale);
s10.addText([
  { text: "\uBE44\uAD50 \uC6B0\uC704  ", options: { bold: true, color: C.greenDeep, fontSize: 12 } },
  { text: "\uCEE4\uD53C\uBC15 \uACE0\uD615\uC5F0\uB8CC 5,649kcal/kg  vs  \uB098\uBB34\uAECD\uC9C8/\uBAA9\uC7AC \uBD80\uC0B0\uBB3C ~3,000kcal/kg  |  \uC57D 2\uBC30\uC758 \uC5D0\uB108\uC9C0 \uD6A8\uC728", options: { color: C.dark, fontSize: 11 } }
], { x: 0.7, y: 5.4, w: 12.0, h: 0.8, fontFace: FONT });

// ========================================
// SLIDE 11: Investment Value
// ========================================
let s11 = pptx.addSlide();
addSlideBase(s11);
addSectionTitle(s11, "\uD504\uB79C\uCC28\uC774\uC988 \uBCF8\uC0AC \uD22C\uC790 \uAC00\uCE58", "09. Win-Win \uC804\uB7B5\uC801 \uD30C\uD2B8\uB108\uC2ED\uC758 3\uB300 \uCD95");
addFooter(s11, 11, "09. \uD22C\uC790 \uAC00\uCE58 \uC81C\uC548");

const pillars = [
  { title: "ESG \uACF5\uC2DC \uBB34\uAE30", color: C.greenDeep, bg: C.greenPale2, items: ["\uC2A4\uD0C0\uBC85\uC2A4 \uC218\uC900\uC758 \uC790\uC6D0\uC21C\uD658 \uCCB4\uACC4 \uB2E8\uAE30 \uB0B4\uC7AC\uD654", "Scope 3 \uC628\uC2E4\uAC00\uC2A4 \uAC10\uCD95 \uC2E4\uC801 \uD655\uBCF4", "IPO/\uB9E4\uAC01 \uC2DC \uAE30\uC5C5\uAC00\uCE58 \uC7AC\uD3C9\uAC00(Re-rating)", "\uBE0C\uB79C\uB4DC \uD3C9\uD310 \uC9C0\uC218 ESG \uAC00\uC911\uCE58 \uB300\uC751"] },
  { title: "\uAC00\uB9F9\uC810 \uBE44\uC6A9 \uC808\uAC10", color: C.amber, bg: C.yellowPale, items: ["\uC885\uB7C9\uC81C \uBD09\uD22C \uAD6C\uB9E4\uBE44 \uC989\uAC01 \uC18C\uAC70", "\uC790\uC6D0\uC21C\uD658 \uC6B0\uC218 \uB9E4\uC7A5 \uC778\uC99D\uB9C8\uD06C", "\uC790\uD65C\uC13C\uD130 \uC5F0\uACC4 \uC9C0\uC5ED\uC0AC\uD68C \uACF5\uD5CC", "1\uC11D 4\uC870: \uD658\uACBD+\uBE44\uC6A9+\uC77C\uC790\uB9AC+\uC774\uBBF8\uC9C0"] },
  { title: "\uD22C\uC790 \uC218\uC775(ROI)", color: C.blueText, bg: C.bluePale, items: ["\uC9C0\uBD84 \uD22C\uC790\uB85C \uC218\uC775 \uACF5\uC720 \uC8FC\uC8FC \uC9C0\uC704", "\uACE0\uBD80\uAC00\uAC00\uCE58 \uC81C\uD488 \uC601\uC5C5\uC774\uC775 \uBC30\uB2F9", "\uC774\uC885 \uC0B0\uC5C5 \uD3EC\uD2B8\uD3F4\uB9AC\uC624 \uB2E4\uBCC0\uD654", "\uD3D0\uAE30\uBB3C \u2192 \uC790\uC0B0 \uC804\uD658 \uC218\uC775 \uBAA8\uB378"] },
];

pillars.forEach((p, i) => {
  const x = 0.4 + i * 4.2;
  s11.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x, y: 1.7, w: 4.0, h: 4.8, fill: { color: p.bg }, rectRadius: 0.12 });
  s11.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: x + 0.3, y: 1.95, w: 3.4, h: 0.55, fill: { color: p.color }, rectRadius: 0.06 });
  s11.addText(p.title, { x: x + 0.3, y: 1.95, w: 3.4, h: 0.55, fontSize: 14, color: C.white, fontFace: FONT, bold: true, align: "center", valign: "middle" });
  p.items.forEach((item, j) => {
    s11.addText("\u2714  " + item, { x: x + 0.3, y: 2.8 + j * 0.7, w: 3.4, h: 0.55, fontSize: 10, color: C.dark, fontFace: FONT, lineSpacingMultiple: 1.3 });
  });
});

// ========================================
// SLIDE 12: Public Procurement
// ========================================
let s12 = pptx.addSlide();
addSlideBase(s12);
addSectionTitle(s12, "\uACF5\uACF5 \uC870\uB2EC \uBC0F \uBBFC\uAD00 \uD611\uB825", "10. \uC9C0\uC790\uCCB4 \uCC38\uC5EC \uC0AC\uB840\uC640 \uC21C\uD658\uC790\uC6D0\uC0AC\uC6A9\uC81C\uD488 \uC81C\uB3C4");
addFooter(s12, 12, "10. \uACF5\uACF5 \uC870\uB2EC");

const cases = [
  { region: "\uC11C\uC6B8 \uC131\uB3D9\uAD6C", d: "200\uC5EC \uAC1C \uCEE4\uD53C\uC804\uBB38\uC810 \uC790\uBC1C \uCC38\uC5EC\n129\uD1A4 \uC628\uC2E4\uAC00\uC2A4 \uAC10\uCD95 (\uC804\uAD6D \uD655\uC0B0 \uC2DC 16,185\uD1A4)", bg: C.greenPale2 },
  { region: "\uC11C\uC6B8 \uC911\uAD6C", d: "\uC2DC \uBCF4\uC870\uAE08 4,450\uB9CC \uC6D0 \uD3B8\uC131\n\uCEE4\uD53C\uBC15 157\uD1A4 \uC7AC\uD65C\uC6A9 \uBCF8\uACA9 \uCD94\uC9C4", bg: C.yellowPale },
  { region: "\uB300\uAD6C \uC911\uAD6C", d: "\uC790\uD65C\uC13C\uD130 '\uCEE4\uD53C\uD050\uBE0C' \uC0AC\uC5C5\uB2E8\n\uB9E4\uCD9C 2,400\uB9CC(2020)\u21926,600\uB9CC(2022) 2.75\uBC30 \uC131\uC7A5", bg: C.greenPale2 },
];

cases.forEach((c, i) => {
  const y = 1.7 + i * 1.35;
  s12.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.4, y, w: 6.2, h: 1.15, fill: { color: c.bg }, rectRadius: 0.08 });
  s12.addText(c.region, { x: 0.6, y: y + 0.05, w: 2.0, h: 1.05, fontSize: 13, color: C.greenDeep, fontFace: FONT, bold: true, valign: "middle" });
  s12.addText(c.d, { x: 2.6, y: y + 0.05, w: 3.8, h: 1.05, fontSize: 10, color: C.dark, fontFace: FONT, valign: "middle", lineSpacingMultiple: 1.5 });
});

s12.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 7.0, y: 1.7, w: 5.9, h: 4.35, fill: { color: C.white }, rectRadius: 0.12, shadow: { type: "outer", blur: 3, offset: 1, color: "D1D5DB", opacity: 0.3 } });
s12.addText("\uC21C\uD658\uC790\uC6D0\uC0AC\uC6A9\uC81C\uD488 \uC778\uC815 \uC808\uCC28", { x: 7.2, y: 1.85, w: 5.5, h: 0.5, fontSize: 14, color: C.dark, fontFace: FONT, bold: true });

[{ step: "1", label: "\uC2E0\uCCAD\uC11C \uC81C\uCD9C", bg: C.cardBg },
 { step: "2", label: "\uC11C\uB958 \uC2EC\uC0AC", bg: C.cardBg },
 { step: "3", label: "\uD604\uC7A5 \uC870\uC0AC", bg: C.cardBg },
 { step: "4", label: "\uD655\uC778\uC11C \uBC1C\uAE09", bg: C.greenDeep },
].forEach((p, i) => {
  const y = 2.55 + i * 0.7;
  s12.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 7.3, y, w: 5.3, h: 0.5, fill: { color: p.bg }, rectRadius: 0.04 });
  s12.addText(p.step + ".  " + p.label, { x: 7.5, y, w: 5.0, h: 0.5, fontSize: 12, color: p.bg === C.greenDeep ? C.white : C.dark, fontFace: FONT, bold: p.bg === C.greenDeep, valign: "middle" });
  if (i < 3) s12.addText("\u25BC", { x: 9.5, y: y + 0.4, w: 1.0, h: 0.35, fontSize: 10, color: C.grayLight, fontFace: FONT, align: "center" });
});

s12.addText("\uACF5\uACF5\uC870\uB2EC \uD6A8\uACFC", { x: 7.3, y: 5.2, w: 5.3, h: 0.35, fontSize: 11, color: C.greenDeep, fontFace: FONT, bold: true });
s12.addText("\u2022 \uACE0\uD615\uC5F0\uB8CC \u2192 \uC5F4\uBCD1\uD569\uBC1C\uC804\uC18C/\uC9C0\uC5ED\uB09C\uBC29\uACF5\uC0AC\n\u2022 \uACE0\uC591\uC774 \uBAA8\uB798 \u2192 \uC804\uAD6D \uC720\uAE30\uB3D9\uBB3C \uBCF4\uD638\uC13C\uD130", { x: 7.3, y: 5.5, w: 5.3, h: 0.7, fontSize: 10, color: C.gray, fontFace: FONT, lineSpacingMultiple: 1.5 });

// ========================================
// SLIDE 13: Investment Plan
// ========================================
let s13 = pptx.addSlide();
addSlideBase(s13);
addSectionTitle(s13, "\uD22C\uC790\uAE08 \uD65C\uC6A9 \uACC4\uD68D", "11. CAPEX/OPEX \uBC30\uBD84 \uBC0F \uC218\uC775 \uC21C\uD658 \uAD6C\uC870");
addFooter(s13, 13, "11. \uD22C\uC790\uAE08 \uD65C\uC6A9");

s13.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.4, y: 1.7, w: 6.2, h: 2.7, fill: { color: C.greenPale2 }, rectRadius: 0.1 });
s13.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.7, y: 1.9, w: 3.0, h: 0.45, fill: { color: C.greenDeep }, rectRadius: 0.04 });
s13.addText("CAPEX (\uC790\uBCF8\uC801 \uC9C0\uCD9C)", { x: 0.7, y: 1.9, w: 3.0, h: 0.45, fontSize: 12, color: C.white, fontFace: FONT, bold: true, align: "center", valign: "middle" });
["\u25B8  IoT \uC2A4\uB9C8\uD2B8 \uBCF4\uAD00 \uC6A9\uAE30 \uAE08\uD615 \uC81C\uC791 \uBC0F \uB300\uB7C9 \uC591\uC0B0",
 "\u25B8  \uC815\uBCF4\uC1A1\uCD9C\uC7A5\uCE58 \uC804\uAD6D \uAC00\uB9F9\uC810 \uC77C\uAD04 \uBC30\uD3EC",
 "\u25B8  \uC790\uB3D9\uD654 \uD50C\uB79C\uD2B8 \uC124\uBE44 \uB77C\uC778 \uC99D\uC124",
 "\u25B8  \uD3A0\uB9BF \uC555\uCD9C \uC131\uD615 \uC124\uBE44 \uACE0\uB3C4\uD654",
].forEach((item, i) => {
  s13.addText(item, { x: 0.7, y: 2.55 + i * 0.42, w: 5.5, h: 0.38, fontSize: 10, color: C.dark, fontFace: FONT });
});

s13.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 6.9, y: 1.7, w: 6.0, h: 2.7, fill: { color: C.yellowPale }, rectRadius: 0.1 });
s13.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 7.2, y: 1.9, w: 3.0, h: 0.45, fill: { color: C.amber }, rectRadius: 0.04 });
s13.addText("OPEX (\uC6B4\uC601\uBE44 \uC2DC\uB108\uC9C0)", { x: 7.2, y: 1.9, w: 3.0, h: 0.45, fontSize: 12, color: C.white, fontFace: FONT, bold: true, align: "center", valign: "middle" });
["\u25B8  \uD504\uB79C\uCC28\uC774\uC988 \uBB3C\uB958 \uCC28\uB7C9 API \uC5F0\uB3D9",
 "\u25B8  \uCD5C\uC801 \uC218\uAC70 \uB178\uC120 \uB3C4\uCD9C \uD504\uB85C\uADF8\uB7A8 \uAC00\uB3D9",
 "\u25B8  \uBB3C\uB958\uBE44 \uC6D0\uAC00 1/3 \u2192 \uC2E4\uC9C8 0 \uC804\uD658",
 "\u25B8  \uCD08\uACA9\uCC28 \uC6D0\uAC00 \uACBD\uC7C1\uB825 \uC989\uC2DC \uD655\uBCF4",
].forEach((item, i) => {
  s13.addText(item, { x: 7.2, y: 2.55 + i * 0.42, w: 5.5, h: 0.38, fontSize: 10, color: C.dark, fontFace: FONT });
});

s13.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.4, y: 4.7, w: 12.5, h: 2.0, fill: { color: C.white }, rectRadius: 0.1, shadow: { type: "outer", blur: 3, offset: 1, color: "D1D5DB", opacity: 0.3 } });
s13.addText("\uC218\uC775\uC758 \uC120\uC21C\uD658 \uBC0F Exit \uD50C\uB79C", { x: 0.7, y: 4.8, w: 12.0, h: 0.4, fontSize: 13, color: C.dark, fontFace: FONT, bold: true });

[{ label: "B2B \uACE0\uD615\uC5F0\uB8CC\n\uB0A9\uD488 \uB300\uAE08", bg: C.greenPale2 },
 { label: "B2C \uACE0\uC591\uC774\uBAA8\uB798\nDTC \uC628\uB77C\uC778 \uD310\uB9E4", bg: C.greenPale2 },
 { label: "\uD504\uB79C\uCC28\uC774\uC988 \uBCF8\uC0AC\n\uBC30\uB2F9 \uC218\uC775 \uD658\uC6D0", bg: C.greenDeep },
 { label: "ESG \uBCF4\uACE0\uC11C\n\uD3D0\uAE30\uBB3C \uC81C\uB85C\uD654 \uAE30\uC7AC", bg: C.greenPale2 },
].forEach((s, i) => {
  const x = 0.7 + i * 3.1;
  s13.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x, y: 5.35, w: 2.6, h: 1.0, fill: { color: s.bg }, rectRadius: 0.06 });
  s13.addText(s.label, { x, y: 5.35, w: 2.6, h: 1.0, fontSize: 10, color: s.bg === C.greenDeep ? C.white : C.dark, fontFace: FONT, align: "center", valign: "middle", bold: s.bg === C.greenDeep, lineSpacingMultiple: 1.3 });
  if (i < 3) s13.addText("\u25B6", { x: x + 2.6, y: 5.55, w: 0.5, h: 0.6, fontSize: 14, color: C.greenBright, fontFace: FONT, align: "center" });
});

// ========================================
// SLIDE 14: CONCLUSION
// ========================================
let s14 = pptx.addSlide();
s14.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.33, h: 7.5, fill: { color: C.white } });
s14.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 0.12, h: 7.5, fill: { color: C.greenDeep } });
s14.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.33, h: 0.06, fill: { color: C.greenDeep } });
s14.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 7.44, w: 13.33, h: 0.06, fill: { color: C.greenDeep } });
s14.addShape(pptx.shapes.OVAL, { x: 10.0, y: 0.5, w: 2.5, h: 2.5, fill: { color: C.greenPale2 } });
s14.addShape(pptx.shapes.OVAL, { x: 11.0, y: 2.5, w: 1.8, h: 1.8, fill: { color: C.greenLight } });

s14.addText("Closed-Loop", { x: 0.8, y: 0.6, w: 9.0, h: 0.7, fontSize: 32, color: C.greenDeep, fontFace: FONT, bold: true });
s14.addText("\uC0DD\uD0DC\uACC4\uC758 \uC644\uC131", { x: 0.8, y: 1.3, w: 9.0, h: 0.7, fontSize: 32, color: C.dark, fontFace: FONT, bold: true });
s14.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 2.1, w: 3.0, h: 0.04, fill: { color: C.greenDeep } });

["\u2714  \uD504\uB79C\uCC28\uC774\uC988 \uC5ED\uBB3C\uB958\uB9DD + \uC2A4\uB9C8\uD2B8\uC5D0\uCF54\uC2DC\uC2A4 \uC790\uC6D0\uD654 \uAE30\uC220\uC758 \uC644\uBCBD\uD55C \uACB0\uD569",
 "\u2714  \uBB3C\uB958\uBE44 90%+ \uC808\uAC10\uC73C\uB85C \uCD08\uACA9\uCC28 \uC6D0\uAC00 \uACBD\uC7C1\uB825 \uD655\uBCF4",
 "\u2714  \uACE0\uC591\uC774 \uBAA8\uB798(B2C) + \uACE0\uD615\uC5F0\uB8CC(B2B) \uB4C0\uC5BC \uC218\uC775 \uAD6C\uC870",
 "\u2714  ESG \uACF5\uC2DC \uC131\uACFC + \uAC00\uB9F9\uC810 \uBE44\uC6A9 \uC808\uAC10 + \uD22C\uC790 \uC218\uC775\uC758 \uC0BC\uC911 \uAC00\uCE58",
 "\u2714  \uC9C0\uC790\uCCB4 \uACF5\uACF5\uC870\uB2EC + \uC21C\uD658\uC790\uC6D0\uC0AC\uC6A9\uC81C\uD488\uC73C\uB85C \uC548\uC815\uC801 \uCE90\uC2DC\uD50C\uB85C\uC6B0",
 "\u2714  \uB300\uD55C\uBBFC\uAD6D \uCEE4\uD53C \uD504\uB79C\uCC28\uC774\uC988 \uC0B0\uC5C5\uC758 \uC0C8\uB85C\uC6B4 \uC9C0\uC18D\uAC00\uB2A5\uACBD\uC601 \uD45C\uC900 \uC218\uB9BD",
].forEach((c, i) => {
  s14.addText(c, { x: 1.0, y: 2.5 + i * 0.55, w: 9.0, h: 0.45, fontSize: 12, color: C.dark, fontFace: FONT });
});

s14.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 5.7, w: 3.0, h: 0.04, fill: { color: C.greenDeep } });
s14.addText("\uC2A4\uB9C8\uD2B8\uC5D0\uCF54\uC2DC\uC2A4\uC640\uC758 \uC804\uB7B5\uC801 \uD30C\uD2B8\uB108\uC2ED\uC740", { x: 0.8, y: 5.9, w: 10.0, h: 0.45, fontSize: 14, color: C.gray, fontFace: FONT });
s14.addText("\uC120\uD0DD\uC774 \uC544\uB2CC \uC0DD\uC874\uC744 \uC704\uD55C \uD544\uC218 ESG \uC194\uB8E8\uC158\uC785\uB2C8\uB2E4.", { x: 0.8, y: 6.3, w: 10.0, h: 0.5, fontSize: 18, color: C.greenDeep, fontFace: FONT, bold: true });
s14.addText("Smart EcoSys", { x: 0.8, y: 7.0, w: 3.0, h: 0.3, fontSize: 10, color: C.grayLight, fontFace: FONT });

// ===== SAVE =====
const outputPath = "C:/Users/SAMSUNG/Desktop/\uC2A4\uB9C8\uD2B8\uC5D0\uCF54\uC2DC\uC2A4_\uD22C\uC790\uC81C\uC548\uC11C.pptx";
pptx.writeFile({ fileName: outputPath })
  .then(() => console.log("PPT created: " + outputPath))
  .catch(err => console.error("Error:", err));
