// SmartEcoSys 사업계획서 - MGC 톤앤매너 적용 (23 slides)
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const Fa = require("react-icons/fa");

// ========== Palette (MGC tone) ==========
const C = {
  navy: "0F1E3D", navyDark: "0A1530", dark: "1F2937", body: "4B5563",
  muted: "6B7280", light: "9CA3AF", border: "E5E7EB", bg: "F8FAFC", card: "FFFFFF",
  green: "10B981", greenDark: "047857", greenSoft: "ECFDF5",
  yellow: "F59E0B", yellowSoft: "FEF3C7",
  red: "DC2626", redSoft: "FEF2F2",
  blue: "2563EB", blueDark: "1E3A8A", blueSoft: "EFF6FF",
  orange: "F97316", orangeSoft: "FFF7ED",
  slate: "475569",
};

const FONT_T = "맑은 고딕";
const FONT_B = "맑은 고딕";
const W = 13.3, H = 7.5;
const IMG_DIR = "C:/SMARTECOSYS/pptx_build/source_images";

// Load image metadata
const meta = JSON.parse(fs.readFileSync("C:/SMARTECOSYS/pptx_build/source_meta.json", "utf8").replace(/^\uFEFF/, ""));
// Convert pt -> inch (96 pt slideWidth = 13.33 in, ratio = 13.33/960)
const SX = W / meta.slideWidth;   // 13.3 / 960
const SY = H / meta.slideHeight;  // 7.5 / 540

function getSlideImages(slideNum, minWidthPt = 60) {
  const s = meta.slides.find(x => x.slide === slideNum);
  if (!s) return [];
  return s.shapes.filter(sh => sh.width >= minWidthPt && sh.height >= minWidthPt);
}
function findImageByPos(slideNum, lx, ty, tolerance = 50) {
  const imgs = getSlideImages(slideNum, 30);
  return imgs.find(im => Math.abs(im.left - lx) < tolerance && Math.abs(im.top - ty) < tolerance);
}

// ========== Icon helper ==========
async function icon(IconComponent, color, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color: "#" + color, size: String(size) })
  );
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + png.toString("base64");
}

// ========== Setup ==========
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "SMARTECOSYS";
pres.title = "커피박 자원화 플랫폼 사업계획서";

// ========== Common helpers ==========
function pageFrame(slide, accent = C.navy) {
  slide.background = { color: C.bg };
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.18, h: H,
    fill: { color: accent }, line: { color: accent, width: 0 }
  });
}
function pageHeader(slide, chapterNum, chapterText) {
  // top-right chapter label
  slide.addText(`0${chapterNum}. ${chapterText}`, {
    x: W - 4, y: 0.3, w: 3.6, h: 0.35,
    fontFace: FONT_B, fontSize: 11, color: C.muted, align: "right", margin: 0
  });
  // top-left brand
  slide.addText("SMARTECOSYS", {
    x: 0.6, y: 0.3, w: 4, h: 0.35,
    fontFace: FONT_T, fontSize: 12, bold: true, color: C.navy, charSpacing: 0.5, margin: 0
  });
}
function pageTitle(slide, title, subtitle) {
  slide.addText(title, {
    x: 0.6, y: 0.85, w: 12, h: 0.75,
    fontFace: FONT_T, fontSize: 28, bold: true, color: C.dark, margin: 0,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.6, y: 1.5, w: 12, h: 0.4,
      fontFace: FONT_B, fontSize: 12, color: C.muted, margin: 0,
    });
  }
  slide.addShape(pres.shapes.LINE, {
    x: 0.6, y: 1.95, w: 12.1, h: 0,
    line: { color: C.border, width: 0.75 }
  });
}
function footerPage(slide, n) {
  slide.addText(`${n} / 25`, {
    x: W - 1.0, y: H - 0.4, w: 0.8, h: 0.3,
    fontSize: 9, color: C.light, align: "right", margin: 0
  });
}

async function build() {

  // ===== Pre-render icons =====
  const I = {
    coffee: await icon(Fa.FaCoffee, C.slate),
    recycle: await icon(Fa.FaRecycle, C.green),
    bolt: await icon(Fa.FaBolt, C.yellow),
    fire: await icon(Fa.FaFire, C.orange),
    leaf: await icon(Fa.FaLeaf, C.green),
    trash: await icon(Fa.FaTrashAlt, C.red),
    won: await icon(Fa.FaWonSign, C.yellow),
    warn: await icon(Fa.FaExclamationTriangle, C.red),
    cloud: await icon(Fa.FaCloud, C.slate),
    truck: await icon(Fa.FaTruck, C.blue),
    store: await icon(Fa.FaStore, C.slate),
    mobile: await icon(Fa.FaMobileAlt, C.blue),
    route: await icon(Fa.FaRoute, C.green),
    industry: await icon(Fa.FaIndustry, C.navy),
    bolt2: await icon(Fa.FaBolt, C.green),
    building: await icon(Fa.FaBuilding, C.blue),
    cogs: await icon(Fa.FaCogs, C.blue),
    box: await icon(Fa.FaBoxOpen, C.green),
    check: await icon(Fa.FaCheckCircle, C.green),
    cat: await icon(Fa.FaCat, C.greenDark),
    dog: await icon(Fa.FaDog, C.orange),
    chart: await icon(Fa.FaChartLine, C.green),
    chartBar: await icon(Fa.FaChartBar, C.blue),
    chartPie: await icon(Fa.FaChartPie, C.green),
    handshake: await icon(Fa.FaHandshake, C.orange),
    cart: await icon(Fa.FaShoppingCart, C.green),
    coins: await icon(Fa.FaCoins, C.yellow),
    flag: await icon(Fa.FaFlag, C.green),
    rocket: await icon(Fa.FaRocket, C.navy),
    mapPin: await icon(Fa.FaMapMarkerAlt, C.red),
    globe: await icon(Fa.FaGlobeAsia, C.blue),
    cube: await icon(Fa.FaCube, C.orange),
    flask: await icon(Fa.FaFlask, C.blue),
    wind: await icon(Fa.FaWind, C.blue),
    snow: await icon(Fa.FaSnowflake, C.blue),
    bldg: await icon(Fa.FaBuilding, C.navy),
    cal: await icon(Fa.FaCalendarAlt, C.blue),
    file: await icon(Fa.FaFileAlt, C.green),
    user: await icon(Fa.FaUserTie, C.green),
    award: await icon(Fa.FaAward, C.yellow),
    light: await icon(Fa.FaLightbulb, C.yellow),
    arrow: await icon(Fa.FaArrowRight, C.light),
  };

  // ============================================================
  // SLIDE 1 - Cover
  // ============================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.card };
    // Top accent bar (green)
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.13, fill: { color: C.green }, line: { color: C.green, width: 0 } });
    // Left navy bar
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0.13, w: 0.18, h: H - 0.13, fill: { color: C.navy }, line: { color: C.navy, width: 0 } });

    // Top icon row: coffee → recycle → energy
    const icoY = 1.5;
    s.addShape(pres.shapes.OVAL, { x: 4.4, y: icoY, w: 1.0, h: 1.0, fill: { color: C.bg }, line: { color: C.border, width: 0.75 } });
    s.addImage({ data: I.coffee, x: 4.65, y: icoY + 0.25, w: 0.5, h: 0.5 });
    s.addText("커피 소비", { x: 4.0, y: icoY + 1.05, w: 1.8, h: 0.3, fontSize: 11, bold: true, color: C.dark, align: "center", margin: 0 });

    s.addText("→", { x: 5.55, y: icoY + 0.25, w: 0.6, h: 0.5, fontSize: 22, color: C.light, align: "center", margin: 0 });

    s.addShape(pres.shapes.OVAL, { x: 6.15, y: icoY, w: 1.0, h: 1.0, fill: { color: C.greenSoft }, line: { color: C.green, width: 0.75 } });
    s.addImage({ data: I.recycle, x: 6.4, y: icoY + 0.25, w: 0.5, h: 0.5 });
    s.addText("자원 순환", { x: 5.75, y: icoY + 1.05, w: 1.8, h: 0.3, fontSize: 11, bold: true, color: C.greenDark, align: "center", margin: 0 });

    s.addText("→", { x: 7.3, y: icoY + 0.25, w: 0.6, h: 0.5, fontSize: 22, color: C.light, align: "center", margin: 0 });

    s.addShape(pres.shapes.OVAL, { x: 7.9, y: icoY, w: 1.0, h: 1.0, fill: { color: C.yellowSoft }, line: { color: C.yellow, width: 0.75 } });
    s.addImage({ data: I.bolt, x: 8.15, y: icoY + 0.25, w: 0.5, h: 0.5 });
    s.addText("청정 에너지", { x: 7.5, y: icoY + 1.05, w: 1.8, h: 0.3, fontSize: 11, bold: true, color: C.orange, align: "center", margin: 0 });

    // Title
    s.addText([
      { text: "커피 찌꺼기, ", options: { color: C.dark, bold: true } },
      { text: "에너지", options: { color: C.green, bold: true } },
      { text: "로 다시 태어나다", options: { color: C.dark, bold: true } },
    ], { x: 0.6, y: 3.4, w: 12.1, h: 1.0, fontFace: FONT_T, fontSize: 42, align: "center", margin: 0 });

    s.addShape(pres.shapes.RECTANGLE, { x: 6.4, y: 4.55, w: 0.6, h: 0.05, fill: { color: C.green }, line: { color: C.green, width: 0 } });

    s.addText("커피박 자원화 플랫폼 (커피로) 사업계획서", {
      x: 0.6, y: 4.75, w: 12.1, h: 0.45, fontSize: 16, color: C.body, align: "center", margin: 0
    });

    // Bottom: company brand
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: H - 1.1, w: W, h: 1.1, fill: { color: C.navy }, line: { color: C.navy, width: 0 } });
    s.addImage({ data: I.leaf, x: 5.45, y: H - 0.85, w: 0.55, h: 0.55 });
    s.addText("주식회사 스마트에코시스", {
      x: 6.05, y: H - 0.83, w: 5, h: 0.5,
      fontFace: FONT_T, fontSize: 18, bold: true, color: "FFFFFF", margin: 0
    });
    s.addText("Smart EcoSys Inc.   |   April 2026", {
      x: 6.05, y: H - 0.4, w: 5, h: 0.3, fontSize: 10, color: "94A3B8", margin: 0
    });
  }

  // ============================================================
  // SLIDE 2 - Table of Contents
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.navy);
    // brand only (no chapter label on TOC)
    s.addText("SMARTECOSYS", {
      x: 0.6, y: 0.3, w: 4, h: 0.35,
      fontFace: FONT_T, fontSize: 12, bold: true, color: C.navy, charSpacing: 0.5, margin: 0
    });
    s.addText("Table of Contents", { x: 0.6, y: 0.85, w: 6, h: 0.45, fontSize: 14, color: C.green, bold: true, charSpacing: 1, margin: 0 });
    s.addText("목차", { x: 0.6, y: 1.3, w: 6, h: 1.0, fontSize: 48, bold: true, color: C.dark, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.5, w: 0.6, h: 0.05, fill: { color: C.green }, line: { color: C.green, width: 0 } });
    s.addText("스마트에코시스의 지속가능한 비전과\n구체적인 실행 계획을 소개합니다.", {
      x: 0.6, y: 2.75, w: 5.5, h: 1.0, fontSize: 13, color: C.body, margin: 0
    });

    // Right side: 6 items in 2 columns
    const items = [
      { n: "01", title: "사업 개요 및 배경", desc: "문제 정의, 솔루션, 시장 기회", color: C.red },
      { n: "02", title: "기술 소개", desc: "매스밸런스, 커피로 앱, O2O 플랫폼", color: C.blue },
      { n: "03", title: "사업 소개", desc: "제품군 다각화", color: C.green },
      { n: "04", title: "시장 현황", desc: "시장 규모, 경쟁사 분석, 포지셔닝", color: C.orange },
      { n: "05", title: "매출 계획", desc: "5개년 재무 추정, 수익성 분석", color: C.navy },
      { n: "06", title: "투자 제안", desc: "자금 사용 계획, 투자 조건, 비전", color: C.greenDark },
    ];
    const colX = [6.7, 10.0];
    items.forEach((it, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = colX[col];
      const y = 1.0 + row * 2.0;
      // Number circle
      s.addShape(pres.shapes.OVAL, { x, y, w: 0.85, h: 0.85, fill: { color: "FFFFFF" }, line: { color: it.color, width: 2 } });
      s.addText(it.n, { x, y, w: 0.85, h: 0.85, fontSize: 18, bold: true, color: it.color, align: "center", valign: "middle", margin: 0 });
      // Title
      s.addText(it.title, { x: x + 1.05, y: y + 0.05, w: 2.6, h: 0.4, fontFace: FONT_T, fontSize: 16, bold: true, color: C.dark, margin: 0 });
      s.addText(it.desc, { x: x + 1.05, y: y + 0.5, w: 2.6, h: 0.35, fontSize: 10, color: C.muted, margin: 0 });
    });
    footerPage(s, 2);
  }

  // ============================================================
  // SLIDE 3 - 문제 정의
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.red);
    pageHeader(s, 1, "사업 개요 및 배경");
    s.addText([
      { text: "연간 ", options: { color: C.dark, bold: true } },
      { text: "40만 톤", options: { color: C.red, bold: true } },
      { text: ", 버려지는 커피박의 현실", options: { color: C.dark, bold: true } },
    ], { x: 0.6, y: 0.85, w: 12, h: 0.75, fontFace: FONT_T, fontSize: 28, margin: 0 });
    s.addText("폭증하는 한국 커피 소비 vs 미진한 재활용 인프라", { x: 0.6, y: 1.5, w: 12, h: 0.4, fontSize: 12, color: C.muted, margin: 0 });
    s.addShape(pres.shapes.LINE, { x: 0.6, y: 1.95, w: 12.1, h: 0, line: { color: C.border, width: 0.75 } });

    // 4 stat cards
    const stats = [
      { x: 0.6,  ico: I.coffee, accent: C.blue,   title: "한국 커피 소비", num: "세계 3위",    desc: "1인당 연간 405잔 소비\n(세계 평균의 2.7배)" },
      { x: 3.8,  ico: I.trash,  accent: C.red,    title: "연간 발생량",   num: "400,000톤", desc: "매년 40만 톤의 커피찌꺼기\n생활폐기물로 배출" },
      { x: 7.0,  ico: I.fire,   accent: C.orange, title: "현재 처리 방식", num: "90% 소각·매립", desc: "재활용률 10% 미만,\n심각한 탄소 배출원" },
      { x: 10.2, ico: I.won,    accent: C.yellow, title: "카페 폐기 부담", num: "월 5~15만원", desc: "종량제 봉투 구매 비용\n및 악취/보관 문제" },
    ];
    for (let i = 0; i < stats.length; i++) {
      const st = stats[i];
      // accent top bar
      s.addShape(pres.shapes.RECTANGLE, { x: st.x, y: 2.3, w: 2.95, h: 0.08, fill: { color: st.accent }, line: { color: st.accent, width: 0 } });
      s.addShape(pres.shapes.RECTANGLE, { x: st.x, y: 2.38, w: 2.95, h: 2.6, fill: { color: C.card }, line: { color: C.border, width: 0.5 } });
      // big number on top right
      s.addText(`0${i+1}`, { x: st.x + 1.95, y: 2.5, w: 0.95, h: 0.5, fontSize: 24, bold: true, color: C.border, align: "right", margin: 0 });
      // icon
      s.addShape(pres.shapes.OVAL, { x: st.x + 0.25, y: 2.55, w: 0.55, h: 0.55, fill: { color: C.bg }, line: { color: C.border, width: 0.5 } });
      s.addImage({ data: st.ico, x: st.x + 0.32, y: 2.62, w: 0.4, h: 0.4 });
      // title
      s.addText(st.title, { x: st.x + 0.25, y: 3.2, w: 2.6, h: 0.35, fontFace: FONT_B, fontSize: 11, color: C.muted, margin: 0 });
      s.addText(st.num, { x: st.x + 0.25, y: 3.55, w: 2.6, h: 0.6, fontFace: FONT_T, fontSize: 22, bold: true, color: C.dark, margin: 0 });
      s.addText(st.desc, { x: st.x + 0.25, y: 4.2, w: 2.6, h: 0.65, fontFace: FONT_B, fontSize: 10, color: C.muted, margin: 0 });
    }

    // Bottom dark banner with 3 alerts
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 5.4, w: 12.1, h: 1.7, fill: { color: C.navy }, line: { color: C.navy, width: 0 } });
    s.addText("ESG 리스크: 지금 당장 해결해야 할 3가지 위협", { x: 0.85, y: 5.55, w: 11.6, h: 0.4, fontFace: FONT_T, fontSize: 14, bold: true, color: "FFFFFF", margin: 0 });

    const alerts = [
      { x: 0.85, ico: I.warn, t: "매립 시 메탄(CH₄) 발생" },
      { x: 4.95, ico: I.warn, t: "온실가스 악화 (CO₂의 34배)" },
      { x: 9.05, ico: I.warn, t: "ESG 규제 강화 (비용 상승)" },
    ];
    alerts.forEach((al, i) => {
      s.addShape(pres.shapes.RECTANGLE, { x: al.x, y: 6.05, w: 3.85, h: 0.85, fill: { color: "1A2B4D" }, line: { color: C.red, width: 0.75 } });
      s.addImage({ data: al.ico, x: al.x + 0.2, y: 6.27, w: 0.42, h: 0.42 });
      s.addText(al.t, { x: al.x + 0.75, y: 6.18, w: 3.0, h: 0.6, fontSize: 11, bold: true, color: "FFFFFF", valign: "middle", margin: 0 });
      if (i < 2) {
        s.addText("→", { x: al.x + 3.85, y: 6.27, w: 0.25, h: 0.4, fontSize: 14, color: C.red, align: "center", margin: 0 });
      }
    });
    footerPage(s, 3);
  }

  // ============================================================
  // SLIDE 4 - 솔루션 (5단계)
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.blue);
    pageHeader(s, 1, "사업 개요 및 배경");
    pageTitle(s, "커피로 (Coffee L.O.) — 수거부터 판매까지 벨류체인 플랫폼", "수거 → 운송 → 가공 → 판매를 잇는 통합 자원순환 생태계");

    const sx = 0.6, sy = 2.4, sw = 2.42, sh = 4.0, gap = 0.05;
    const steps = [
      { num: "1", color: C.slate, ico: I.store, title: "카페", items: ["커피박 발생 & 분리 배출"] },
      { num: "2", color: C.blue, ico: I.mobile, title: "앱 수거요청", items: ["원터치 수거 신청", "스케줄링"] },
      { num: "3", color: C.green, ico: I.route, title: "AI 최적 수거", items: ["경로 최적화로 물류비 절감"], highlight: true },
      { num: "4", color: C.red, ico: I.fire, title: "건조·연료화", items: ["고품질 연료탄 제조", "(4,800 kcal)"] },
      { num: "5", color: C.navy, ico: I.industry, title: "발전소 판매", items: ["바이오매스 발전소", "안정적 공급"] },
    ];

    steps.forEach((st, i) => {
      const x = sx + i * (sw + gap);
      const bg = st.highlight ? C.greenSoft : C.card;
      const lineCol = st.highlight ? C.green : C.border;
      s.addShape(pres.shapes.RECTANGLE, { x, y: sy, w: sw, h: 0.08, fill: { color: st.color }, line: { color: st.color, width: 0 } });
      s.addShape(pres.shapes.RECTANGLE, { x, y: sy + 0.08, w: sw, h: sh - 0.08, fill: { color: bg }, line: { color: lineCol, width: st.highlight ? 1.25 : 0.75 } });
      s.addShape(pres.shapes.OVAL, { x: x + 0.2, y: sy + 0.3, w: 0.45, h: 0.45, fill: { color: st.color }, line: { color: st.color, width: 0 } });
      s.addText(st.num, { x: x + 0.2, y: sy + 0.31, w: 0.45, h: 0.45, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
      // Big icon
      s.addShape(pres.shapes.OVAL, { x: x + sw/2 - 0.55, y: sy + 1.0, w: 1.1, h: 1.1, fill: { color: C.bg }, line: { color: C.border, width: 0.5 } });
      s.addImage({ data: st.ico, x: x + sw/2 - 0.35, y: sy + 1.2, w: 0.7, h: 0.7 });
      // title
      s.addText(st.title, { x, y: sy + 2.3, w: sw, h: 0.45, fontFace: FONT_T, fontSize: 16, bold: true, color: C.dark, align: "center", margin: 0 });
      // body
      s.addText(st.items.join("\n"), { x: x + 0.2, y: sy + 2.85, w: sw - 0.4, h: 1.0, fontFace: FONT_B, fontSize: 11, color: C.body, align: "center", margin: 0 });
    });
    // Arrows between
    for (let i = 0; i < 4; i++) {
      const ax = sx + (i + 1) * (sw + gap) - 0.05;
      s.addText("›", { x: ax - 0.18, y: sy + 1.3, w: 0.4, h: 0.4, fontSize: 22, color: C.light, align: "center", bold: true, margin: 0 });
    }

    // Bottom dark banner
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 6.6, w: 12.1, h: 0.6, fill: { color: C.navy }, line: { color: C.navy, width: 0 } });
    s.addImage({ data: I.check, x: 0.85, y: 6.72, w: 0.36, h: 0.36 });
    s.addText([
      { text: "통합 밸류체인 구축으로 ", options: { color: "FFFFFF" } },
      { text: "수거 물류비 30%+ 절감", options: { color: C.green, bold: true } },
      { text: " 및 카페-발전소 직접 연결로 마진 극대화", options: { color: "FFFFFF" } },
    ], { x: 1.35, y: 6.7, w: 11.3, h: 0.45, fontSize: 12, valign: "middle", margin: 0 });
    footerPage(s, 4);
  }

  // ============================================================
  // SLIDE 5 - 회사 소개
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.green);
    pageHeader(s, 1, "사업 개요 및 배경");
    pageTitle(s, "회사 소개", "지속가능한 자원순환과 디지털 기술의 결합");

    // Two-column info table
    const rows = [
      { label: "회사명",    ico: I.building, value: "주식회사 스마트에코시스 (Smart EcoSys Inc.)" },
      { label: "설립연월",  ico: I.cal,      value: "2026년 1월 (법인 설립 완료)" },
      { label: "사업분야",  ico: I.recycle,  value: "커피박 자원화  |  바이오매스 연료 제조  |  O2O 플랫폼 서비스" },
      { label: "핵심 플랫폼",ico: I.mobile,  value: "커피로 (Coffee L.O.)  —  Flutter iOS / Android" },
      { label: "수익 모델",  ico: I.coins,   value: "연료탄 판매  ·  앱 구독료(월 1만원)  ·  O2O 주문 중개 수수료" },
      { label: "지식재산권",ico: I.award,    value: "슬러지 연료화 처리 시스템 (제 10-2069317호)\n슬러지 연료화 처리 시스템의 건조공기 공급장치 (제 10-2069308호)" },
    ];
    const tx = 0.6, ty = 2.3, rowH = 0.78, lblW = 2.6, valW = 9.5;
    // Outer card
    s.addShape(pres.shapes.RECTANGLE, { x: tx, y: ty, w: lblW + valW, h: rowH * rows.length + 0.1, fill: { color: C.card }, line: { color: C.border, width: 0.5 } });
    rows.forEach((r, i) => {
      const y = ty + 0.05 + i * rowH;
      // label cell bg
      s.addShape(pres.shapes.RECTANGLE, { x: tx, y, w: lblW, h: rowH, fill: { color: C.greenSoft }, line: { color: C.border, width: 0 } });
      s.addImage({ data: r.ico, x: tx + 0.25, y: y + 0.22, w: 0.34, h: 0.34 });
      s.addText(r.label, { x: tx + 0.7, y: y + 0.18, w: lblW - 0.85, h: 0.45, fontFace: FONT_T, fontSize: 12, bold: true, color: C.greenDark, valign: "middle", margin: 0 });
      // value
      s.addText(r.value, { x: tx + lblW + 0.25, y: y + 0.05, w: valW - 0.4, h: rowH - 0.1, fontFace: FONT_B, fontSize: 11, color: C.body, valign: "middle", margin: 0 });
      // bottom line
      if (i < rows.length - 1) {
        s.addShape(pres.shapes.LINE, { x: tx, y: y + rowH, w: lblW + valW, h: 0, line: { color: C.border, width: 0.5 } });
      }
    });
    footerPage(s, 5);
  }

  // ============================================================
  // SLIDE 6 - BIO-SRF 품질 기준 (2 tables)
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.blue);
    pageHeader(s, 2, "기술 소개");
    pageTitle(s, "스마트에코시스 바이오 고형연료제품 (BIO-SRF)", "관련 법령 품질 기준 충족 및 프리미엄 등급 자체 기준 확보");

    // Two table cards side by side
    const t1Data = [
      ["항목", "단위", "성형", "비성형"],
      ["모양·크기", "mm", "직경 50 / 길이 100↓", "가로·세로 50↓"],
      ["발열량 (저위)", "kcal/kg", "3,500 이상 (제조)", "동일"],
      ["수분 함유량", "wt.%", "15 이하", "25 이하"],
      ["수은 (Hg)", "mg/kg", "1.0 이하", "1.0 이하"],
      ["카드뮴 (Cd)", "mg/kg", "5.0 이하", "5.0 이하"],
      ["납 (Pb)", "mg/kg", "150 이하", "150 이하"],
      ["비소 (As)", "mg/kg", "13.0 이하", "13.0 이하"],
      ["회분 함유량", "wt.%", "20 이하", "20 이하"],
      ["염소 함유량", "wt.%", "2.0 이하", "2.0 이하"],
      ["황분 함유량", "wt.%", "0.6↓ (폐타이어 2.0↓)", "동일"],
    ];
    const t2Data = [
      ["항목", "단위", "성형", "비성형"],
      ["발열량 (저위)", "kcal/kg", "3,000 이상 (제조)", "동일"],
      ["수분 함유량", "wt.%", "10 이하", "25 이하"],
      ["수은 (Hg)", "mg/kg", "0.6 이하", "0.6 이하"],
      ["납 (Pb)", "mg/kg", "100 이하", "100 이하"],
      ["비소 (As)", "mg/kg", "5.0 이하", "5.0 이하"],
      ["크롬 (Cr)", "mg/kg", "70.0 이하", "70.0 이하"],
      ["회분 함유량", "wt.%", "15 이하", "15 이하"],
      ["염소 함유량", "wt.%", "0.5 이하", "0.5 이하"],
      ["바이오매스", "wt.%", "95 이상", "95 이상"],
    ];

    function makeTable(headerColor, data) {
      return data.map((row, i) => {
        if (i === 0) {
          return row.map(c => ({ text: c, options: { fill: { color: headerColor }, color: "FFFFFF", bold: true, align: "center", valign: "middle", fontSize: 10 } }));
        }
        return row.map((c, j) => ({ text: c, options: { color: j === 0 ? C.dark : C.body, bold: j === 0, align: j === 0 ? "left" : "center", valign: "middle", fontSize: 9, fill: { color: i % 2 === 0 ? "F8FAFC" : "FFFFFF" } } }));
      });
    }

    // Card 1 (left) - SRF (orange)
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.2, w: 6.0, h: 0.5, fill: { color: C.orangeSoft }, line: { color: C.border, width: 0.5 } });
    s.addImage({ data: I.fire, x: 0.8, y: 2.32, w: 0.28, h: 0.28 });
    s.addText("일반 고형연료제품 (SRF) 품질 기준", { x: 1.15, y: 2.25, w: 5.4, h: 0.4, fontFace: FONT_T, fontSize: 12, bold: true, color: C.dark, valign: "middle", margin: 0 });
    s.addTable(makeTable(C.orange, t1Data), {
      x: 0.6, y: 2.7, w: 6.0, colW: [1.5, 0.9, 1.95, 1.65],
      border: { pt: 0.5, color: C.border }, fontFace: FONT_B,
      rowH: 0.36,
    });

    // Card 2 (right) - BIO-SRF (green)
    s.addShape(pres.shapes.RECTANGLE, { x: 6.9, y: 2.2, w: 6.0, h: 0.5, fill: { color: C.greenSoft }, line: { color: C.border, width: 0.5 } });
    s.addImage({ data: I.leaf, x: 7.1, y: 2.32, w: 0.28, h: 0.28 });
    s.addText("바이오 고형연료제품 (BIO-SRF) 품질 기준", { x: 7.45, y: 2.25, w: 5.4, h: 0.4, fontFace: FONT_T, fontSize: 12, bold: true, color: C.dark, valign: "middle", margin: 0 });
    s.addTable(makeTable(C.green, t2Data), {
      x: 6.9, y: 2.7, w: 6.0, colW: [1.5, 0.9, 1.95, 1.65],
      border: { pt: 0.5, color: C.border }, fontFace: FONT_B,
      rowH: 0.36,
    });
    footerPage(s, 6);
  }

  // ============================================================
  // SLIDE 7 - 건조 기술 비교
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.blue);
    pageHeader(s, 2, "기술 소개");
    pageTitle(s, "건조 기술 방식별 상세 비교 및 경쟁력 분석", "고온건조 vs 저온건조 vs 스마트에코시스 저온열풍기류건조");

    // Header colors
    const data = [
      ["비교 항목", "고온건조", "저온건조", "저온열풍기류건조"],
      ["건조 시간", "짧음 (화재 위험)", "장시간 소요 (24h↑)", "획기적 단축 (1h)"],
      ["처리 용량", "대량 가능", "대량 처리 어려움", "대량 처리 (다단구조)"],
      ["함수율 (품질)", "낮음 (과건조 우려)", "높음 (20% 이상)", "최적 함수율 (10%↓)"],
      ["건조 온도", "고온", "저온", "저온 열풍"],
      ["에너지 효율", "낮음 (연료비 과다)", "보통", "높음 (열순환 방식)"],
      ["응축수 발생", "다량 (폐수처리 필요)", "발생", "거의 없음 (Zero화)"],
      ["악취 문제", "심각 (민원 발생)", "보통", "해결 (밀폐 순환)"],
      ["환경 영향", "대기오염 물질 다량", "적음", "친환경 (오염 최소화)"],
      ["유지보수", "비용 높음 (화재 등)", "보통", "용이함 (모듈형)"],
      ["구조 방식", "-", "연속식 (단일 구조)", "다단(Multiple) 배치식"],
      ["운영 안정성", "화재 위험 상존", "안전함", "매우 안전 (저온)"],
    ];

    const tbl = data.map((row, i) => {
      if (i === 0) {
        return row.map((c, j) => {
          const bgs = [C.dark, C.red, C.blue, C.green];
          return { text: c, options: { fill: { color: bgs[j] }, color: "FFFFFF", bold: true, align: "center", valign: "middle", fontSize: 11 } };
        });
      }
      return row.map((c, j) => {
        let col = C.body;
        let bg = i % 2 === 0 ? "F8FAFC" : "FFFFFF";
        if (j === 0) { col = C.dark; }
        if (j === 3) { col = C.greenDark; bg = C.greenSoft; }
        return { text: c, options: { color: col, bold: j === 0 || j === 3, align: j === 0 ? "left" : "center", valign: "middle", fontSize: 10, fill: { color: bg } } };
      });
    });

    s.addTable(tbl, {
      x: 0.6, y: 2.2, w: 12.1, colW: [3.0, 3.0, 3.05, 3.05],
      border: { pt: 0.5, color: C.border }, fontFace: FONT_B,
      rowH: 0.35,
    });

    // Bottom callout
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 6.85, w: 12.1, h: 0.4, fill: { color: C.greenSoft }, line: { color: C.green, width: 0.5 } });
    s.addImage({ data: I.check, x: 0.8, y: 6.93, w: 0.24, h: 0.24 });
    s.addText("스마트에코시스 저온열풍기류건조: 모든 비교 항목에서 압도적 우위 — 짧은 건조 시간, 친환경, 운영 안정성 동시 확보", {
      x: 1.1, y: 6.88, w: 11.5, h: 0.35, fontSize: 10, bold: true, color: C.greenDark, valign: "middle", margin: 0
    });
    footerPage(s, 7);
  }

  // ============================================================
  // SLIDE 8 - 경쟁사 비교 (7개사)
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.blue);
    pageHeader(s, 2, "기술 소개");
    pageTitle(s, "주요 경쟁사별 기술 및 설비 상세 비교 (7개사)", "환경성·운영 온도·건조 방식의 종합 비교 — 자사 기술 압도적");

    const data = [
      ["구분", "스마트에코시스", "A", "B", "C", "D", "E", "F"],
      ["건조 방식", "직접 열풍기류건조", "직접열풍건조", "직접가열탄화", "간접가열건조", "간접가열건조", "스팀 분사 건조", "전열판 간접 건조"],
      ["설비 구조", "저온열풍\n다단 수직구조", "로터리킬른\n건조기", "1차 건조\n2차 탄화설비", "패들건조기", "디스크 건조기", "과열증기\n건조기", "증발건조기"],
      ["처리 공법", "저온열풍건조\n공법", "SAFE 공법", "탄화공법", "열풍 건조공법", "스팀건조공법", "과열증기\n건조공법", "진공유중건조\n공법"],
      ["가동 온도", "45 ~ 95℃", "350 ~ 850℃", "750℃ 이상", "350℃ 이상", "160 ~ 180℃", "500 ~ 600℃", "120 ~ 300℃"],
      ["환경성\n(악취/유해물질)", "저온열풍건조로\n유해물질/악취\n발생 없음", "고온건조로 인한\n유해물질 다량\n방출", "고온건조로 인한\n유해물질 다량\n방출", "고온건조로 인한\n유해물질 다량\n방출", "고온건조로 인한\n유해물질 다량\n방출", "고온 스팀건조 시\n유해폐수 다량\n방출", "유중건조 시\n유폐수 다량\n방출"],
    ];

    const tbl = data.map((row, i) => {
      if (i === 0) {
        return row.map((c, j) => ({
          text: c,
          options: {
            fill: { color: j === 1 ? C.green : (j === 0 ? C.dark : "475569") },
            color: "FFFFFF", bold: true, align: "center", valign: "middle", fontSize: 11,
          }
        }));
      }
      return row.map((c, j) => {
        let col = C.body, bg = "FFFFFF", bold = false;
        if (j === 0) { col = C.dark; bold = true; bg = "F8FAFC"; }
        if (j === 1) { col = C.greenDark; bold = true; bg = C.greenSoft; }
        if (j > 1 && i === 5) { col = C.red; bold = true; bg = "FEF2F2"; }
        return { text: c, options: { color: col, bold, align: j === 0 ? "left" : "center", valign: "middle", fontSize: 8, fill: { color: bg } } };
      });
    });

    s.addTable(tbl, {
      x: 0.6, y: 2.2, w: 12.1, colW: [1.45, 1.85, 1.45, 1.45, 1.45, 1.45, 1.45, 1.45],
      border: { pt: 0.5, color: C.border }, fontFace: FONT_B,
      rowH: 0.7,
    });
    footerPage(s, 8);
  }

  // ============================================================
  // SLIDE 9 - 시스템 구조 (with original images)
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.blue);
    pageHeader(s, 2, "기술 소개");
    pageTitle(s, "스마트에코시스 저온 열풍기류건조 시스템 구조", "커피찌꺼기 → 펠릿 성형 → 저온 건조 → 고형연료 4단계 공정");

    // Original slide 9 has a single composite illustration. Show it large.
    const s9imgs = getSlideImages(9, 200).sort((a, b) => (b.width * b.height) - (a.width * a.height));

    // Big illustration card
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.2, w: 8.8, h: 5.0, fill: { color: C.card }, line: { color: C.border, width: 0.75 } });
    if (s9imgs[0]) {
      s.addImage({
        path: path.join(IMG_DIR, s9imgs[0].file),
        x: 0.75, y: 2.35, w: 8.5, h: 4.7,
        sizing: { type: "contain", w: 8.5, h: 4.7 }
      });
    }

    // Right side: 4 step labels stacked
    const steps9 = [
      { num: "1", title: "혼합 단계",    color: C.green,     desc: "커피찌꺼기 + 부재료 혼합 (함수율 70~80%)" },
      { num: "2", title: "펠릿 성형",    color: C.navy,      desc: "혼합 원료 압축 성형 (함수율 약 50%)" },
      { num: "3", title: "저온 열풍 건조", color: C.blue,      desc: "함수율 50% → 15~20%" },
      { num: "4", title: "연료 완성",    color: C.greenDark, desc: "고형 연료탄 (최종 10% 이하)" },
    ];
    steps9.forEach((st, i) => {
      const y = 2.2 + i * 1.27;
      s.addShape(pres.shapes.RECTANGLE, { x: 9.65, y, w: 3.05, h: 1.17, fill: { color: C.card }, line: { color: C.border, width: 0.5 } });
      s.addShape(pres.shapes.RECTANGLE, { x: 9.65, y, w: 0.08, h: 1.17, fill: { color: st.color }, line: { color: st.color, width: 0 } });
      s.addShape(pres.shapes.OVAL, { x: 9.85, y: y + 0.18, w: 0.42, h: 0.42, fill: { color: st.color }, line: { color: st.color, width: 0 } });
      s.addText(st.num, { x: 9.85, y: y + 0.19, w: 0.42, h: 0.42, fontSize: 13, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
      s.addText(st.title, { x: 10.4, y: y + 0.18, w: 2.25, h: 0.4, fontSize: 13, bold: true, color: C.dark, margin: 0 });
      s.addText(st.desc, { x: 10.4, y: y + 0.55, w: 2.25, h: 0.55, fontSize: 9.5, color: C.muted, margin: 0 });
    });

    // Bottom flow banner
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 7.3, w: 12.1, h: 0.05, fill: { color: C.green }, line: { color: C.green, width: 0 } });
    footerPage(s, 9);
  }

  // ============================================================
  // SLIDE 10 - 현장사진
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.blue);
    pageHeader(s, 2, "기술 소개");
    pageTitle(s, "스마트에코시스 저온 열풍기류건조 — 현장사진", "실제 가동 중인 자체 건조 설비 — 안정적 운영 검증 완료");

    // Get top 2 biggest images from source slide 10
    const s10imgs = getSlideImages(10, 100).sort((a, b) => (b.width * b.height) - (a.width * a.height)).slice(0, 2);

    [0, 1].forEach(i => {
      const x = i === 0 ? 0.6 : 6.95;
      s.addShape(pres.shapes.RECTANGLE, { x: x - 0.05, y: 2.25, w: 6.0, h: 4.6, fill: { color: C.card }, line: { color: C.border, width: 0.75 } });
      if (s10imgs[i]) {
        s.addImage({
          path: path.join(IMG_DIR, s10imgs[i].file),
          x, y: 2.35, w: 5.9, h: 4.4,
          sizing: { type: "cover", w: 5.9, h: 4.4 }
        });
      }
    });
    s.addText("저온열풍 다단 수직 설비 #1", { x: 0.6, y: 6.95, w: 5.9, h: 0.3, fontSize: 11, bold: true, color: C.body, align: "center", margin: 0 });
    s.addText("저온열풍 다단 수직 설비 #2", { x: 6.95, y: 6.95, w: 5.9, h: 0.3, fontSize: 11, bold: true, color: C.body, align: "center", margin: 0 });
    footerPage(s, 10);
  }

  // ============================================================
  // SLIDE 11 - 수거 협력사
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.blue);
    pageHeader(s, 2, "기술 소개");
    pageTitle(s, "수거 협력사 / 사회적협동조합 자원과 순환", "전국 500여 카페·기업 수거 네트워크 + 월 1,000톤 수거 능력 확보");

    // Left side: partner card
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.25, w: 4.0, h: 4.95, fill: { color: C.card }, line: { color: C.border, width: 0.75 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.25, w: 4.0, h: 0.08, fill: { color: C.green }, line: { color: C.green, width: 0 } });

    s.addShape(pres.shapes.OVAL, { x: 2.0, y: 2.55, w: 1.2, h: 1.2, fill: { color: C.greenSoft }, line: { color: C.green, width: 1.5 } });
    s.addImage({ data: I.recycle, x: 2.3, y: 2.85, w: 0.6, h: 0.6 });

    s.addText("수거 및 집하", { x: 0.6, y: 3.85, w: 4.0, h: 0.4, fontFace: FONT_T, fontSize: 16, bold: true, color: C.dark, align: "center", margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 1.5, y: 4.3, w: 2.2, h: 0.35, fill: { color: C.greenSoft }, line: { color: C.greenSoft, width: 0 } });
    s.addText("자원과순환 협동조합", { x: 1.5, y: 4.3, w: 2.2, h: 0.35, fontSize: 10, bold: true, color: C.greenDark, align: "center", valign: "middle", margin: 0 });

    s.addText([
      { text: "•  스타벅스코리아 등 ", options: { color: C.body } },
      { text: "500곳 이상", options: { color: C.dark, bold: true } },
      { text: " 수거 계약", options: { color: C.body, breakLine: true } },
      { text: "•  전국 주요 도시 집하장 네트워크 보유", options: { color: C.body, breakLine: true } },
      { text: "•  각 지자체와 정식 계약 체결", options: { color: C.body, breakLine: true } },
      { text: "•  스마트에코시스 MOU 체결 완료", options: { color: C.body } },
    ], { x: 0.85, y: 4.85, w: 3.5, h: 1.5, fontSize: 11, paraSpaceAfter: 4, margin: 0 });

    // Bottom highlight badge inside card
    s.addShape(pres.shapes.RECTANGLE, { x: 0.85, y: 6.55, w: 3.5, h: 0.5, fill: { color: C.navy }, line: { color: C.navy, width: 0 } });
    s.addText("월 1,000톤 수거 능력", { x: 0.85, y: 6.55, w: 3.5, h: 0.5, fontSize: 12, bold: true, color: C.green, align: "center", valign: "middle", margin: 0 });

    // Arrow
    s.addText("→", { x: 4.7, y: 4.4, w: 0.4, h: 0.5, fontSize: 22, color: C.light, align: "center", margin: 0 });

    // Right side: partner logos area (extract from source)
    s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 2.25, w: 7.5, h: 4.95, fill: { color: C.card }, line: { color: C.border, width: 0.75 } });
    s.addText("주요 파트너사", { x: 5.4, y: 2.4, w: 7.1, h: 0.4, fontFace: FONT_T, fontSize: 12, bold: true, color: C.muted, margin: 0 });

    // Use the biggest composite logo image
    const s11imgs = getSlideImages(11, 200).sort((a, b) => (b.width * b.height) - (a.width * a.height));
    if (s11imgs[0]) {
      s.addImage({
        path: path.join(IMG_DIR, s11imgs[0].file),
        x: 5.4, y: 2.85, w: 7.1, h: 4.2,
        sizing: { type: "contain", w: 7.1, h: 4.2 }
      });
    }
    footerPage(s, 11);
  }

  // ============================================================
  // SLIDE 12 - 업무 프로세스
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.blue);
    pageHeader(s, 2, "기술 소개");
    pageTitle(s, "수거 협력사 / 사회적협동조합 자원과 순환 업무 프로세스", "수거 → 이동 → 집하 → 보관 — 검증된 4단계 표준 운영");

    // 4 photos with labels - sort by left position (preserve visual order)
    const s12imgs = getSlideImages(12, 100).sort((a, b) => a.left - b.left).slice(0, 4);
    const labels = [
      { t: "수거", desc: "현장에서 직접 수거 및 분리 배출" },
      { t: "이동", desc: "전용 차량으로 효율적 운송" },
      { t: "집하", desc: "지역 거점에 통합 집하" },
      { t: "보관", desc: "전용 보관소에서 위생적 관리" },
    ];
    [0, 1, 2, 3].forEach(i => {
      const x = 0.6 + i * 3.175;
      const w = 3.0;
      s.addShape(pres.shapes.RECTANGLE, { x, y: 2.25, w, h: 4.0, fill: { color: C.card }, line: { color: C.border, width: 0.75 } });
      if (s12imgs[i]) {
        s.addImage({
          path: path.join(IMG_DIR, s12imgs[i].file),
          x: x + 0.05, y: 2.3, w: w - 0.1, h: 3.9,
          sizing: { type: "cover", w: w - 0.1, h: 3.9 }
        });
      }
      // numbered badge bottom-left of photo
      s.addShape(pres.shapes.OVAL, { x: x + 0.15, y: 2.4, w: 0.5, h: 0.5, fill: { color: C.navy }, line: { color: C.navy, width: 0 } });
      s.addText(String(i + 1), { x: x + 0.15, y: 2.4, w: 0.5, h: 0.5, fontSize: 14, bold: true, color: C.green, align: "center", valign: "middle", margin: 0 });

      // Label below
      s.addShape(pres.shapes.RECTANGLE, { x, y: 6.4, w, h: 0.55, fill: { color: C.navy }, line: { color: C.navy, width: 0 } });
      s.addText(labels[i].t, { x, y: 6.4, w, h: 0.55, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
      s.addText(labels[i].desc, { x, y: 6.95, w, h: 0.3, fontSize: 9, color: C.muted, align: "center", margin: 0 });

      if (i < 3) {
        s.addText("→", { x: x + w - 0.1, y: 4.0, w: 0.4, h: 0.5, fontSize: 22, color: C.light, bold: true, align: "center", margin: 0 });
      }
    });
    footerPage(s, 12);
  }

  // ============================================================
  // SLIDE 13 - 고형연료 제품군 확대 (건설 동계연료)
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.green);
    pageHeader(s, 3, "사업 소개");
    pageTitle(s, "스마트에코시스 고형연료 제품군 확대 ① 건설 동계연료", "건설현장 콘크리트 양생 열원으로 활용 — 기존 갈탄 대비 친환경 고효율");

    // Left: feature card (compact)
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.2, w: 5.5, h: 3.5, fill: { color: C.card }, line: { color: C.border, width: 0.75 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.2, w: 0.08, h: 3.5, fill: { color: C.orange }, line: { color: C.orange, width: 0 } });
    s.addImage({ data: I.fire, x: 0.85, y: 2.4, w: 0.45, h: 0.45 });
    s.addText("건설 동계연료 판매", { x: 1.45, y: 2.37, w: 4.5, h: 0.45, fontFace: FONT_T, fontSize: 17, bold: true, color: C.dark, margin: 0 });
    s.addText("Construction Winter Heating Fuel", { x: 1.45, y: 2.78, w: 4.5, h: 0.32, fontSize: 10, color: C.muted, margin: 0 });

    s.addShape(pres.shapes.LINE, { x: 0.85, y: 3.25, w: 5.0, h: 0, line: { color: C.border, width: 0.5 } });

    s.addText([
      { text: "콘크리트 양생 열원 연료 공급", options: { bold: true, color: C.dark, fontSize: 12, breakLine: true } },
      { text: "건설현장 동절기 콘크리트 양생을 위한 고품질 친환경 열원 연료로 신규 시장 진입", options: { color: C.body, fontSize: 10 } },
    ], { x: 0.85, y: 3.4, w: 5.2, h: 0.9, paraSpaceAfter: 2, margin: 0 });

    s.addText([
      { text: "✓  ", options: { color: C.green, bold: true } },
      { text: "발열량 4,800 kcal/kg 고품질 연료탄", options: { color: C.body, breakLine: true } },
      { text: "✓  ", options: { color: C.green, bold: true } },
      { text: "기존 갈탄 대비 유해물질·악취 90% 감소", options: { color: C.body, breakLine: true } },
      { text: "✓  ", options: { color: C.green, bold: true } },
      { text: "동절기(11월~2월) 안정적 매출 확보", options: { color: C.body } },
    ], { x: 0.85, y: 4.4, w: 5.2, h: 1.25, fontSize: 10.5, paraSpaceAfter: 4, margin: 0 });

    // Right: single big photo (only 1 large photo in source slide 13)
    const s13imgs = getSlideImages(13, 150).sort((a, b) => (b.width * b.height) - (a.width * a.height));
    s.addShape(pres.shapes.RECTANGLE, { x: 6.4, y: 2.2, w: 6.3, h: 3.5, fill: { color: C.card }, line: { color: C.border, width: 0.75 } });
    if (s13imgs[0]) {
      s.addImage({
        path: path.join(IMG_DIR, s13imgs[0].file),
        x: 6.5, y: 2.3, w: 6.1, h: 3.3,
        sizing: { type: "contain", w: 6.1, h: 3.3 }
      });
    }

    // Comparison table at bottom (lifted up)
    const cmp = [
      ["구분", "갈탄(석탄류)", "우드펠릿(1급)", "커피박 펠릿(제안)", "고체연료(젤/캔)"],
      ["발열량 (kcal/kg)", "약 4,500~5,000", "약 4,300~4,500", "약 4,800~5,000", "약 6,500~7,500"],
      ["1톤당 단가 (VAT별도)", "약 25~35만 원", "약 45~55만 원", "약 35~45만 원", "약 180~250만 원"],
      ["톤당 발열 효율", "낮음", "보통", "높음 (유분 포함)", "매우 높음"],
    ];
    const cmpTbl = cmp.map((row, i) => row.map((c, j) => {
      if (i === 0) return { text: c, options: { fill: { color: C.dark }, color: "FFFFFF", bold: true, align: "center", valign: "middle", fontSize: 9 } };
      let bg = i % 2 === 0 ? "F8FAFC" : "FFFFFF";
      let col = C.body, bold = false;
      if (j === 0) { col = C.dark; bold = true; }
      if (j === 3) { col = C.greenDark; bold = true; bg = C.greenSoft; }
      return { text: c, options: { color: col, bold, align: j === 0 ? "left" : "center", valign: "middle", fontSize: 10, fill: { color: bg } } };
    }));
    s.addTable(cmpTbl, {
      x: 0.6, y: 5.95, w: 12.1, colW: [2.3, 2.45, 2.45, 2.45, 2.45],
      border: { pt: 0.5, color: C.border }, fontFace: FONT_B, rowH: 0.32,
    });
    footerPage(s, 13);
  }

  // ============================================================
  // SLIDE 14 - 반려동물 탈취제 (제품군 확대 ②)
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.green);
    pageHeader(s, 3, "사업 소개");
    pageTitle(s, "스마트에코시스 고형연료 제품군 확대 ② 반려동물 탈취제", "급성장 반려동물 시장 진입 — 고양이 모래·강아지 패드 원료 공급");

    // Left card: text
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.25, w: 4.5, h: 4.95, fill: { color: C.card }, line: { color: C.border, width: 0.75 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.25, w: 0.08, h: 4.95, fill: { color: C.green }, line: { color: C.green, width: 0 } });
    s.addImage({ data: I.cat, x: 0.85, y: 2.45, w: 0.55, h: 0.55 });
    s.addText("반려동물 탈취제 판매", { x: 1.55, y: 2.42, w: 3.5, h: 0.5, fontFace: FONT_T, fontSize: 16, bold: true, color: C.dark, margin: 0 });
    s.addText("Premium Pet Deodorizer", { x: 1.55, y: 2.85, w: 3.5, h: 0.35, fontSize: 10, color: C.muted, margin: 0 });

    s.addShape(pres.shapes.LINE, { x: 0.85, y: 3.35, w: 4.0, h: 0, line: { color: C.border, width: 0.5 } });

    s.addText("커피 원두의 강력한 천연 탈취력과 다공성 구조를 활용한 프리미엄 반려동물 위생 용품 원료 공급", {
      x: 0.85, y: 3.55, w: 4.1, h: 1.0, fontSize: 11, color: C.body, margin: 0
    });

    s.addText("핵심 USP", { x: 0.85, y: 4.7, w: 4.1, h: 0.35, fontSize: 11, bold: true, color: C.greenDark, margin: 0 });
    s.addText([
      { text: "✓  ", options: { color: C.green, bold: true } },
      { text: "강력한 암모니아 탈취 효과", options: { color: C.body, breakLine: true } },
      { text: "✓  ", options: { color: C.green, bold: true } },
      { text: "100% 식물성·생분해 원료", options: { color: C.body, breakLine: true } },
      { text: "✓  ", options: { color: C.green, bold: true } },
      { text: "버려지는 자원의 부가가치 창출", options: { color: C.body } },
    ], { x: 0.85, y: 5.1, w: 4.1, h: 1.5, fontSize: 11, paraSpaceAfter: 6, margin: 0 });

    // Right: 2 product cards with images - sort by left position for correct order
    const s14imgs = getSlideImages(14, 150).sort((a, b) => a.left - b.left).slice(0, 2);
    [0, 1].forEach(i => {
      const x = 5.4 + i * 3.85;
      s.addShape(pres.shapes.RECTANGLE, { x, y: 2.25, w: 3.6, h: 4.4, fill: { color: C.card }, line: { color: C.border, width: 0.75 } });
      if (s14imgs[i]) {
        s.addImage({
          path: path.join(IMG_DIR, s14imgs[i].file),
          x: x + 0.1, y: 2.35, w: 3.4, h: 4.2,
          sizing: { type: "cover", w: 3.4, h: 4.2 }
        });
      }
      // Bottom label
      s.addShape(pres.shapes.RECTANGLE, { x, y: 6.7, w: 3.6, h: 0.5, fill: { color: C.greenDark }, line: { color: C.greenDark, width: 0 } });
      s.addText(i === 0 ? "강아지 패드 탈취제" : "고양이 모래 탈취제", {
        x, y: 6.7, w: 3.6, h: 0.5, fontSize: 12, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0
      });
    });
    footerPage(s, 14);
  }

  // ============================================================
  // SLIDE 15 - O2O 비즈모델
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.green);
    pageHeader(s, 3, "사업 소개");
    pageTitle(s, "스마트에코시스 비즈니스 모델 확대 — O2O 주문 중개 서비스", "수거 앱 → 결제 페이백 → 매출 증대 → 수거량 증가의 선순환 구조");

    // Top wide highlight banner
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.25, w: 12.1, h: 1.4, fill: { color: C.yellowSoft }, line: { color: C.yellow, width: 1 } });
    s.addImage({ data: I.mobile, x: 0.85, y: 2.55, w: 0.6, h: 0.6 });
    s.addText("O2O 주문 중개 서비스", { x: 1.6, y: 2.4, w: 6, h: 0.5, fontFace: FONT_T, fontSize: 18, bold: true, color: C.dark, margin: 0 });
    s.addText("수거 앱을 활용하여 카페와 고객의 B2C 주문 중개 + 거래액 수수료 페이백", { x: 1.6, y: 2.85, w: 11, h: 0.35, fontSize: 12, color: C.body, margin: 0 });
    s.addText([
      { text: "✓  거래액 ", options: { color: C.green, bold: true } },
      { text: "수수료를 고객에게 페이백", options: { color: C.dark, bold: true } },
      { text: "        ✓  ", options: { color: C.green, bold: true } },
      { text: "점포매출 증대로 커피박 수거량 증가", options: { color: C.dark, bold: true } },
    ], { x: 1.6, y: 3.18, w: 11, h: 0.4, fontSize: 11, margin: 0 });

    // 3 stages: Hook → Lock-in → Revenue
    const stages = [
      { x: 0.6,  color: C.green,  badge: "Hook",    badgeColor: C.greenSoft, ico: I.mapPin, title: "진입 전략", desc: "\"커피 1잔을 마시면 100원을 드려요\"\n페이백 마케팅 전략 시장 진입" },
      { x: 4.85, color: C.blue,   badge: "Lock-in", badgeColor: C.blueSoft, ico: I.handshake, title: "유지 전략", desc: "포인트 적립 + 페이백 마케팅 유지\n이탈률 최소화" },
      { x: 9.1,  color: C.orange, badge: "Revenue", badgeColor: C.orangeSoft, ico: I.coins, title: "수익화", desc: "O2O 플랫폼 수익 창출\n시장점유율 증대로 수익금 증가\n하이브리드 모델 완성" },
    ];
    const cw = 3.85, ch = 3.0;
    stages.forEach((st, i) => {
      // top accent
      s.addShape(pres.shapes.RECTANGLE, { x: st.x, y: 3.95, w: cw, h: 0.08, fill: { color: st.color }, line: { color: st.color, width: 0 } });
      s.addShape(pres.shapes.RECTANGLE, { x: st.x, y: 4.03, w: cw, h: ch - 0.08, fill: { color: C.card }, line: { color: C.border, width: 0.5 } });
      // badge
      s.addShape(pres.shapes.RECTANGLE, { x: st.x + cw - 1.15, y: 4.2, w: 1.0, h: 0.35, fill: { color: st.badgeColor }, line: { color: st.badgeColor, width: 0 } });
      s.addText(st.badge, { x: st.x + cw - 1.15, y: 4.2, w: 1.0, h: 0.35, fontSize: 9, bold: true, color: st.color, align: "center", valign: "middle", margin: 0 });
      // icon
      s.addShape(pres.shapes.OVAL, { x: st.x + 0.25, y: 4.25, w: 0.55, h: 0.55, fill: { color: C.bg }, line: { color: C.border, width: 0.5 } });
      s.addImage({ data: st.ico, x: st.x + 0.32, y: 4.32, w: 0.4, h: 0.4 });
      // title
      s.addText(st.title, { x: st.x + 0.25, y: 4.95, w: cw - 0.5, h: 0.45, fontFace: FONT_T, fontSize: 16, bold: true, color: C.dark, margin: 0 });
      s.addText(st.desc, { x: st.x + 0.25, y: 5.45, w: cw - 0.5, h: 1.4, fontSize: 11, color: C.body, margin: 0 });
      if (i < 2) {
        s.addText("›", { x: st.x + cw - 0.05, y: 5.2, w: 0.4, h: 0.4, fontSize: 24, color: C.light, bold: true, align: "center", margin: 0 });
      }
    });
    footerPage(s, 15);
  }

  // ============================================================
  // SLIDE 16 - 고형 연료(Bio-SRF) 영업 전략
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.green);
    pageHeader(s, 3, "사업 소개");
    pageTitle(s,
      "투트랙(Two-Track) 시장 진입 — 고형 연료(Bio-SRF) 영업 전략",
      "대규모 B2B 파이프라인 확보 및 고수익 B2C 니치마켓 공략"
    );

    // Description banner
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.15, w: 12.1, h: 0.65, fill: { color: C.greenSoft }, line: { color: C.green, width: 0.5 } });
    s.addImage({ data: I.check, x: 0.8, y: 2.3, w: 0.35, h: 0.35 });
    s.addText([
      { text: "스마트에코시스의 고형 연료 사업은 ", options: { color: C.body } },
      { text: "B2B 대량 공급을 통한 조기 매출 안정화", options: { color: C.dark, bold: true } },
      { text: "와 ", options: { color: C.body } },
      { text: "B2C 채널을 통한 고부가가치 창출", options: { color: C.dark, bold: true } },
      { text: "을 동시에 달성하는 투트랙(Two-Track) 전략을 전개합니다.", options: { color: C.body } },
    ], { x: 1.2, y: 2.2, w: 11.4, h: 0.55, fontSize: 11, valign: "middle", margin: 0 });

    // Two column header cards (B2B blue / B2C green)
    const colHeadY = 3.0;
    s.addShape(pres.shapes.RECTANGLE, { x: 3.1, y: colHeadY, w: 4.85, h: 0.55, fill: { color: C.blue } });
    s.addImage({ data: I.industry, x: 3.3, y: colHeadY + 0.1, w: 0.35, h: 0.35 });
    s.addText("B2B (안정적 볼륨 확보)", { x: 3.75, y: colHeadY + 0.05, w: 4.1, h: 0.45, fontSize: 13, bold: true, color: "FFFFFF", valign: "middle", margin: 0 });

    s.addShape(pres.shapes.RECTANGLE, { x: 7.95, y: colHeadY, w: 4.75, h: 0.55, fill: { color: C.green } });
    s.addImage({ data: I.cart, x: 8.15, y: colHeadY + 0.1, w: 0.35, h: 0.35 });
    s.addText("B2C (고부가가치 창출)", { x: 8.6, y: colHeadY + 0.05, w: 4.1, h: 0.45, fontSize: 13, bold: true, color: "FFFFFF", valign: "middle", margin: 0 });

    // 3 rows
    const rows = [
      {
        label: "핵심 타겟",
        b2b: [{t:"산업용 연료 대형 수요처"},{t:"공공 / 사회복지 기관"}],
        b2c: [{t:"친환경 가치 소비를 지향하는 캠핑족 및 레저 인구"}],
      },
      {
        label: "주요 채널\n및 파트너",
        b2b: [{t:"대형리싸이클링:",b:true},{t:" 산업용 수요 (구매의향서 체결 중)"},{t:"사랑의 연탄:",b:true},{t:" 공공/복지 수요 (구매의향서 체결 중)"}],
        b2c: [{t:"네이버 스마트스토어, 쿠팡 등 D2C 채널"},{t:"캠핑 전문 커뮤니티 및 아웃도어 버티컬 플랫폼"}],
      },
      {
        label: "전략적\n방향성",
        b2b: [{t:"초기 캐시카우 창출:",b:true},{t:" LOI 기반의 사전 물량 확보로 양산 초기 리스크 최소화 및 공장 가동률 극대화"},{t:"ESG 가치 실현:",b:true},{t:" '사랑의 연탄' 공급 등 사회공헌(CSR) 결합을 통해 친환경 선도 기업으로서의 브랜드 이미지 구축"}],
        b2c: [{t:"프리미엄 친환경 펠릿 포지셔닝:",b:true},{t:" 기존 목재 펠릿 대비 커피박 특유의 우수한 열량과 탈취 효과를 강조"},{t:"D2C 마진 극대화:",b:true},{t:" 유통 단계를 최소화하고 리뷰/바이럴 마케팅을 통한 직접 판매 활성화"}],
      },
    ];
    const rowY = [3.7, 4.4, 5.4];
    const rowH = [0.65, 0.95, 1.8];
    rows.forEach((r, i) => {
      const y = rowY[i], h = rowH[i];
      // label cell
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 2.45, h, fill: { color: "EFF2F7" }, line: { color: C.border, width: 0.5 } });
      s.addText(r.label, { x: 0.7, y, w: 2.3, h, fontSize: 12, bold: true, color: C.dark, align: "center", valign: "middle", margin: 0 });
      // B2B cell
      s.addShape(pres.shapes.RECTANGLE, { x: 3.1, y, w: 4.85, h, fill: { color: C.blueSoft }, line: { color: C.border, width: 0.5 } });
      const b2bRuns = [];
      r.b2b.forEach((item, idx) => {
        if (typeof item === "object" && !Array.isArray(item)) {
          b2bRuns.push({ text: "•  ", options: { color: C.blue, bold: true } });
          // if item.t and the next item(s) are continuation of same bullet, handle inline
          b2bRuns.push({ text: item.t, options: { color: item.b ? C.dark : C.body, bold: !!item.b, breakLine: !r.b2b[idx+1] || (idx+1 < r.b2b.length && !r.b2b[idx+1].b && idx === r.b2b.length - 1) } });
        }
      });
      // Simplified: build bullets manually based on pattern
      const b2bText = [];
      for (let j = 0; j < r.b2b.length; j++) {
        const cur = r.b2b[j];
        if (cur.b && j + 1 < r.b2b.length && !r.b2b[j+1].b) {
          // bold header + continuation
          b2bText.push({ text: "• ", options: { color: C.blue, bold: true } });
          b2bText.push({ text: cur.t, options: { color: C.dark, bold: true } });
          b2bText.push({ text: r.b2b[j+1].t, options: { color: C.body, breakLine: j + 2 < r.b2b.length } });
          j++;
        } else {
          b2bText.push({ text: "• ", options: { color: C.blue, bold: true } });
          b2bText.push({ text: cur.t, options: { color: cur.b ? C.dark : C.body, bold: !!cur.b, breakLine: j < r.b2b.length - 1 } });
        }
      }
      s.addText(b2bText, { x: 3.25, y: y + 0.08, w: 4.6, h: h - 0.16, fontSize: 10, paraSpaceAfter: 4, margin: 0 });

      // B2C cell
      s.addShape(pres.shapes.RECTANGLE, { x: 7.95, y, w: 4.75, h, fill: { color: C.greenSoft }, line: { color: C.border, width: 0.5 } });
      const b2cText = [];
      for (let j = 0; j < r.b2c.length; j++) {
        const cur = r.b2c[j];
        if (cur.b && j + 1 < r.b2c.length && !r.b2c[j+1].b) {
          b2cText.push({ text: "• ", options: { color: C.green, bold: true } });
          b2cText.push({ text: cur.t, options: { color: C.dark, bold: true } });
          b2cText.push({ text: r.b2c[j+1].t, options: { color: C.body, breakLine: j + 2 < r.b2c.length } });
          j++;
        } else {
          b2cText.push({ text: "• ", options: { color: C.green, bold: true } });
          b2cText.push({ text: cur.t, options: { color: cur.b ? C.dark : C.body, bold: !!cur.b, breakLine: j < r.b2c.length - 1 } });
        }
      }
      s.addText(b2cText, { x: 8.1, y: y + 0.08, w: 4.5, h: h - 0.16, fontSize: 10, paraSpaceAfter: 4, margin: 0 });
    });
    footerPage(s, 16);
  }

  // ============================================================
  // SLIDE 17 - 고양이 모래 영업 전략
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.green);
    pageHeader(s, 3, "사업 소개");
    pageTitle(s,
      "밸류체인(Value Chain) 파트너십 + 친환경 자체 브랜드 — 고양이 모래 영업 전략",
      "펫 시장 선점을 위한 빠른 시장 진입과 충성 고객 확보 투트랙"
    );

    // Description banner
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.15, w: 12.1, h: 0.65, fill: { color: C.greenSoft }, line: { color: C.green, width: 0.5 } });
    s.addImage({ data: I.cat, x: 0.8, y: 2.3, w: 0.35, h: 0.35 });
    s.addText([
      { text: "폭발적으로 성장하는 펫 케어 시장에서 ", options: { color: C.body } },
      { text: "기존 유통 강자와의 전략적 파트너십", options: { color: C.dark, bold: true } },
      { text: "을 통해 시장 진입 속도를 높이고, ", options: { color: C.body } },
      { text: "자체 브랜드를 통해 충성 고객을 확보", options: { color: C.dark, bold: true } },
      { text: "합니다.", options: { color: C.body } },
    ], { x: 1.2, y: 2.2, w: 11.4, h: 0.55, fontSize: 11, valign: "middle", margin: 0 });

    const colHeadY = 3.0;
    s.addShape(pres.shapes.RECTANGLE, { x: 3.1, y: colHeadY, w: 4.85, h: 0.55, fill: { color: C.blue } });
    s.addImage({ data: I.truck, x: 3.3, y: colHeadY + 0.1, w: 0.35, h: 0.35 });
    s.addText("B2B (유통망 및 레퍼런스 확보)", { x: 3.75, y: colHeadY + 0.05, w: 4.1, h: 0.45, fontSize: 13, bold: true, color: "FFFFFF", valign: "middle", margin: 0 });

    s.addShape(pres.shapes.RECTANGLE, { x: 7.95, y: colHeadY, w: 4.75, h: 0.55, fill: { color: C.green } });
    s.addImage({ data: I.cat, x: 8.15, y: colHeadY + 0.1, w: 0.35, h: 0.35 });
    s.addText("B2C (자체 브랜드 구축)", { x: 8.6, y: colHeadY + 0.05, w: 4.1, h: 0.45, fontSize: 13, bold: true, color: "FFFFFF", valign: "middle", margin: 0 });

    const rows2 = [
      {
        label: "핵심 타겟",
        b2b: [{t:"기존 고양이 모래 전문 유통사 및 벤토나이트 취급 유통사"}],
        b2c: [{t:"친환경 / 안전성에 민감한 밀레니얼 및 Z세대 반려인"}],
      },
      {
        label: "주요 채널\n및 파트너",
        b2b: [{t:"벤트닉스, 동해소재:",b:true},{t:" 수입 유통사 (구매의향서 체결 중)"},{t:"리본글로벌:",b:true},{t:" 도소매 유통 (업무협약(MOU) 체결 중)"}],
        b2c: [{t:"자체 브랜드 온라인 몰 구축"},{t:"네이버 스마트스토어, 쿠팡, 반려동물 전문 플랫폼 입점"}],
      },
      {
        label: "전략적\n방향성",
        b2b: [{t:"유통망 피기배킹(Piggybacking):",b:true},{t:" 확고한 시장 점유율을 가진 유통망에 자사의 친환경 제품을 결합하여 빠르고 안정적인 시장 침투"},{t:"시장 신뢰도 확보:",b:true},{t:" 주요 유통사와의 MOU/LOI를 레퍼런스로 활용하여 타 파트너사 확장 시 협상력(Bargaining Power) 강화"}],
        b2c: [{t:"에코-프리미엄(Eco-Premium) 스토리텔링:",b:true},{t:" 압도적인 커피박 탈취력과 '버려지는 자원의 가치 창출'이라는 ESG 스토리를 결합"},{t:"고객 락인(Lock-in) 전략:",b:true},{t:" 소모품 특성을 활용한 정기 구독 서비스 모델 도입으로 LTV(고객 생애 가치) 극대화"}],
      },
    ];
    const rowY2 = [3.7, 4.4, 5.4];
    const rowH2 = [0.65, 0.95, 1.8];
    rows2.forEach((r, i) => {
      const y = rowY2[i], h = rowH2[i];
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 2.45, h, fill: { color: "EFF2F7" }, line: { color: C.border, width: 0.5 } });
      s.addText(r.label, { x: 0.7, y, w: 2.3, h, fontSize: 12, bold: true, color: C.dark, align: "center", valign: "middle", margin: 0 });

      s.addShape(pres.shapes.RECTANGLE, { x: 3.1, y, w: 4.85, h, fill: { color: C.blueSoft }, line: { color: C.border, width: 0.5 } });
      const b2bText = [];
      for (let j = 0; j < r.b2b.length; j++) {
        const cur = r.b2b[j];
        if (cur.b && j + 1 < r.b2b.length && !r.b2b[j+1].b) {
          b2bText.push({ text: "• ", options: { color: C.blue, bold: true } });
          b2bText.push({ text: cur.t, options: { color: C.dark, bold: true } });
          b2bText.push({ text: r.b2b[j+1].t, options: { color: C.body, breakLine: j + 2 < r.b2b.length } });
          j++;
        } else {
          b2bText.push({ text: "• ", options: { color: C.blue, bold: true } });
          b2bText.push({ text: cur.t, options: { color: cur.b ? C.dark : C.body, bold: !!cur.b, breakLine: j < r.b2b.length - 1 } });
        }
      }
      s.addText(b2bText, { x: 3.25, y: y + 0.08, w: 4.6, h: h - 0.16, fontSize: 10, paraSpaceAfter: 4, margin: 0 });

      s.addShape(pres.shapes.RECTANGLE, { x: 7.95, y, w: 4.75, h, fill: { color: C.greenSoft }, line: { color: C.border, width: 0.5 } });
      const b2cText = [];
      for (let j = 0; j < r.b2c.length; j++) {
        const cur = r.b2c[j];
        if (cur.b && j + 1 < r.b2c.length && !r.b2c[j+1].b) {
          b2cText.push({ text: "• ", options: { color: C.green, bold: true } });
          b2cText.push({ text: cur.t, options: { color: C.dark, bold: true } });
          b2cText.push({ text: r.b2c[j+1].t, options: { color: C.body, breakLine: j + 2 < r.b2c.length } });
          j++;
        } else {
          b2cText.push({ text: "• ", options: { color: C.green, bold: true } });
          b2cText.push({ text: cur.t, options: { color: cur.b ? C.dark : C.body, bold: !!cur.b, breakLine: j < r.b2c.length - 1 } });
        }
      }
      s.addText(b2cText, { x: 8.1, y: y + 0.08, w: 4.5, h: h - 0.16, fontSize: 10, paraSpaceAfter: 4, margin: 0 });
    });
    footerPage(s, 17);
  }

  // ============================================================
  // SLIDE 18 - 국내 시장 규모 (was 16)
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.orange);
    pageHeader(s, 4, "시장 현황");
    pageTitle(s, "국내 시장 규모", "TAM 18조 → SAM 6.8조 → SOM 1,200억 원 — 명확한 진입 경로");

    // Left: nested ovals (TAM/SAM/SOM)
    const cx = 3.6, cy = 4.5;
    s.addShape(pres.shapes.OVAL, { x: cx - 3.0, y: cy - 2.0, w: 6.0, h: 4.0, fill: { color: C.bg }, line: { color: C.green, width: 1.5 } });
    s.addShape(pres.shapes.OVAL, { x: cx - 2.0, y: cy - 1.3, w: 4.0, h: 2.7, fill: { color: C.greenSoft }, line: { color: C.green, width: 1.5 } });
    s.addShape(pres.shapes.OVAL, { x: cx - 1.0, y: cy - 0.6, w: 2.0, h: 1.4, fill: { color: C.greenDark }, line: { color: C.greenDark, width: 0 } });

    s.addText("TAM", { x: cx - 1.0, y: cy - 1.85, w: 2.0, h: 0.35, fontSize: 11, bold: true, color: C.green, charSpacing: 1.5, align: "center", margin: 0 });
    s.addText("18조", { x: cx - 1.5, y: cy - 1.5, w: 3.0, h: 0.5, fontFace: FONT_T, fontSize: 22, bold: true, color: "94A3B8", align: "center", margin: 0 });

    s.addText("SAM", { x: cx - 1.0, y: cy - 1.0, w: 2.0, h: 0.3, fontSize: 9, bold: true, color: C.green, charSpacing: 1.5, align: "center", margin: 0 });
    s.addText("6.8조", { x: cx - 1.5, y: cy - 0.75, w: 3.0, h: 0.4, fontFace: FONT_T, fontSize: 16, bold: true, color: C.green, align: "center", margin: 0 });

    s.addText("SOM", { x: cx - 0.8, y: cy - 0.4, w: 1.6, h: 0.25, fontSize: 8, bold: true, color: "FFFFFF", charSpacing: 1.5, align: "center", margin: 0 });
    s.addText("1,200억 원", { x: cx - 1.0, y: cy - 0.15, w: 2.0, h: 0.45, fontFace: FONT_T, fontSize: 14, bold: true, color: "FFFFFF", align: "center", margin: 0 });

    // Right: 3 cards (TAM/SAM/SOM)
    const cards = [
      { y: 2.25, color: C.light, bg: C.bg,        ico: I.globe,    title: "전체 시장 (TAM)", num: "18조 원",  desc: "국내 커피 시장 (약 15.5조) + 바이오 에너지 시장 (약 2.4조)" },
      { y: 3.95, color: C.green, bg: C.greenSoft, ico: I.chartBar, title: "유효 시장 (SAM)", num: "6.8조 원", desc: "스마트오더 결제액 (약 6조) + 커피박 재자원화 가치 (약 8,000억)" },
      { y: 5.65, color: C.greenDark, bg: C.greenDark, ico: I.flag,  title: "수익 시장 (SOM)", num: "1,200억 원", desc: "수도권 저가 커피 프렌차이즈 중심 오더 수수료 + 원료 공급 매출", dark: true },
    ];
    cards.forEach(c => {
      const x = 7.5, w = 5.2, h = 1.55;
      s.addShape(pres.shapes.RECTANGLE, { x, y: c.y, w, h, fill: { color: c.bg }, line: { color: c.color, width: 0.75 } });
      s.addImage({ data: c.ico, x: x + 0.25, y: c.y + 0.25, w: 0.4, h: 0.4 });
      s.addText(c.title, { x: x + 0.75, y: c.y + 0.18, w: 3.0, h: 0.4, fontSize: 13, bold: true, color: c.dark ? "FFFFFF" : C.dark, margin: 0 });
      s.addText(c.num, { x: x + w - 1.55, y: c.y + 0.2, w: 1.4, h: 0.4, fontSize: 14, bold: true, color: c.dark ? C.green : c.color, align: "right", margin: 0 });
      s.addText(c.desc, { x: x + 0.25, y: c.y + 0.75, w: w - 0.5, h: 0.7, fontSize: 10, color: c.dark ? "CBD5E1" : C.body, margin: 0 });
    });
    footerPage(s, 18);
  }

  // ============================================================
  // SLIDE 19 - 국외 시장 규모
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.orange);
    pageHeader(s, 4, "시장 현황");
    pageTitle(s, "국외 시장 규모", "TAM 550조 → SAM 30조 → SOM 3,000억 원 — 글로벌 확장의 거대한 기회");

    const cx = 3.6, cy = 4.5;
    s.addShape(pres.shapes.OVAL, { x: cx - 3.0, y: cy - 2.0, w: 6.0, h: 4.0, fill: { color: C.bg }, line: { color: C.blue, width: 1.5 } });
    s.addShape(pres.shapes.OVAL, { x: cx - 2.0, y: cy - 1.3, w: 4.0, h: 2.7, fill: { color: C.blueSoft }, line: { color: C.blue, width: 1.5 } });
    s.addShape(pres.shapes.OVAL, { x: cx - 1.0, y: cy - 0.6, w: 2.0, h: 1.4, fill: { color: C.blueDark }, line: { color: C.blueDark, width: 0 } });

    s.addText("TAM", { x: cx - 1.0, y: cy - 1.85, w: 2.0, h: 0.35, fontSize: 11, bold: true, color: C.blue, charSpacing: 1.5, align: "center", margin: 0 });
    s.addText("550조", { x: cx - 1.5, y: cy - 1.5, w: 3.0, h: 0.5, fontFace: FONT_T, fontSize: 22, bold: true, color: "94A3B8", align: "center", margin: 0 });

    s.addText("SAM", { x: cx - 1.0, y: cy - 1.0, w: 2.0, h: 0.3, fontSize: 9, bold: true, color: C.blue, charSpacing: 1.5, align: "center", margin: 0 });
    s.addText("30조", { x: cx - 1.5, y: cy - 0.75, w: 3.0, h: 0.4, fontFace: FONT_T, fontSize: 16, bold: true, color: C.blue, align: "center", margin: 0 });

    s.addText("SOM", { x: cx - 0.8, y: cy - 0.4, w: 1.6, h: 0.25, fontSize: 8, bold: true, color: "FFFFFF", charSpacing: 1.5, align: "center", margin: 0 });
    s.addText("3,000억 원", { x: cx - 1.0, y: cy - 0.15, w: 2.0, h: 0.45, fontFace: FONT_T, fontSize: 14, bold: true, color: "FFFFFF", align: "center", margin: 0 });

    const cards = [
      { y: 2.25, color: C.light, bg: C.bg,       ico: I.globe,    title: "전체 시장 (TAM)", num: "550조 원",  desc: "국외 커피 시장 (약 300조) + 바이오 에너지 시장 (약 250조)" },
      { y: 3.95, color: C.blue, bg: C.blueSoft, ico: I.chartBar, title: "유효 시장 (SAM)", num: "30조 원", desc: "스마트오더 결제액 (약 13조) + 고형연료 시장 (약 17조 원)" },
      { y: 5.65, color: C.blueDark, bg: C.blueDark, ico: I.flag,  title: "수익 시장 (SOM)", num: "3,000억 원", desc: "해외 커피 프렌차이즈 중심 오더 수수료 + 원료 공급 매출", dark: true },
    ];
    cards.forEach(c => {
      const x = 7.5, w = 5.2, h = 1.55;
      s.addShape(pres.shapes.RECTANGLE, { x, y: c.y, w, h, fill: { color: c.bg }, line: { color: c.color, width: 0.75 } });
      s.addImage({ data: c.ico, x: x + 0.25, y: c.y + 0.25, w: 0.4, h: 0.4 });
      s.addText(c.title, { x: x + 0.75, y: c.y + 0.18, w: 3.0, h: 0.4, fontSize: 13, bold: true, color: c.dark ? "FFFFFF" : C.dark, margin: 0 });
      s.addText(c.num, { x: x + w - 1.55, y: c.y + 0.2, w: 1.4, h: 0.4, fontSize: 14, bold: true, color: c.dark ? C.green : c.color, align: "right", margin: 0 });
      s.addText(c.desc, { x: x + 0.25, y: c.y + 0.75, w: w - 0.5, h: 0.7, fontSize: 10, color: c.dark ? "CBD5E1" : C.body, margin: 0 });
    });
    footerPage(s, 19);
  }

  // ============================================================
  // SLIDE 20 - 5개년 카페 파트너 로드맵
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.navy);
    pageHeader(s, 5, "매출 계획");
    pageTitle(s, "5개년 카페 파트너 성장 로드맵", "2026년 500개 → 2030년 20,000개 매장 확보 (CAGR 152%)");

    // Big bar chart card
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.2, w: 12.1, h: 4.0, fill: { color: C.card }, line: { color: C.border, width: 0.5 } });
    s.addChart(pres.charts.BAR, [{
      name: "카페 수 (개)",
      labels: ["2026 (1차년)", "2027 (2차년)", "2028 (3차년)", "2029 (4차년)", "2030 (5차년)"],
      values: [500, 2000, 5000, 10000, 20000],
    }], {
      x: 0.8, y: 2.4, w: 11.7, h: 3.7,
      barDir: "col",
      chartColors: ["10B981"],
      chartArea: { fill: { color: "FFFFFF" } },
      catAxisLabelColor: "64748B", valAxisLabelColor: "64748B",
      catAxisLabelFontSize: 11, valAxisLabelFontSize: 10,
      valGridLine: { color: "E2E8F0", size: 0.5 },
      catGridLine: { style: "none" },
      showLegend: false,
      showValue: true, dataLabelPosition: "outEnd", dataLabelColor: "1F2937", dataLabelFontSize: 11, dataLabelFontBold: true,
      dataLabelFormatCode: "#,##0\"개\"",
    });

    // Bottom: ultimate goal banner
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 6.45, w: 12.1, h: 0.85, fill: { color: C.navy }, line: { color: C.navy, width: 0 } });
    s.addImage({ data: I.flag, x: 0.85, y: 6.65, w: 0.45, h: 0.45 });
    s.addText("Ultimate Goal (2030)", { x: 1.45, y: 6.55, w: 4, h: 0.35, fontSize: 11, bold: true, color: C.green, margin: 0 });
    s.addText([
      { text: "전국 카페 10만 개 중 ", options: { color: "FFFFFF" } },
      { text: "20% (2만 개)", options: { color: C.green, bold: true } },
      { text: " 파트너십 확보", options: { color: "FFFFFF" } },
    ], { x: 1.45, y: 6.88, w: 11.0, h: 0.35, fontSize: 14, bold: true, margin: 0 });
    footerPage(s, 20);
  }

  // ============================================================
  // SLIDE 21 - 1차년도 매출 계획
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.navy);
    pageHeader(s, 5, "매출 계획");
    pageTitle(s, "5개년 매출 계획 — 1차년도 (2026)", "단위: 원 (VAT 별도)");

    const data = [
      ["구분", "항목", "기준", "단가 (원)", "산출내역", "금액 (천원)", "비고"],
      ["수입", "발전소 연료", "30톤", "230,000", "30톤/일 * 230,000원/톤 * 300일/년 / 2", "1,035,000,000", "발전소 고형연료"],
      ["", "앱 사용료", "500 점포", "10,000", "500 * 12개월 / 2", "30,000,000", "자원과 순환"],
      ["", "주문 수수료", "500 점포", "10%", "500 * 500,000원 * 12개월 / 2", "150,000,000", "주문 수수료"],
      ["", "계", "", "", "", "1,215,000,000", ""],
      ["지출", "커피찌꺼기", "30톤", "50,000/톤", "(30톤/일 * 50,000원/톤 * 300일/년) / 2", "225,000,000", "자원과 순환"],
      ["", "외주비", "30톤", "100,000/톤", "(30톤 * 100,000원 * 300일) / 2", "450,000,000", "장기계약조건"],
      ["", "운반비", "30톤", "20,000/톤", "(30톤 * 20,000원 * 300일) / 2", "90,000,000", ""],
      ["", "인건비", "3인", "", "3명 * 4,000천원 * 10", "120,000,000", ""],
      ["", "복리후생비", "-", "-", "인건비 5%", "6,000,000", ""],
      ["", "영업비(개발비)", "-", "-", "매출액의 3%", "36,450,000", ""],
      ["", "마케팅비", "-", "-", "주문 수수료 9%", "135,000,000", ""],
      ["", "계", "", "", "", "1,062,450,000", ""],
      ["수익", "매출 (수입)", "", "", "1,215,000,000", "이익", "이익율"],
      ["", "매입 (지출)", "", "", "1,062,450,000", "152,550,000", "13%"],
    ];

    const tbl = data.map((row, i) => row.map((c, j) => {
      if (i === 0) return { text: c, options: { fill: { color: C.navy }, color: "FFFFFF", bold: true, align: "center", valign: "middle", fontSize: 10 } };
      let bg = i % 2 === 0 ? "F8FAFC" : "FFFFFF";
      let col = C.body, bold = false;
      if (j === 0) { col = C.dark; bold = true; bg = "EFF2F7"; }
      if (j === 5) { col = C.dark; bold = true; }
      if (i === 4 || i === 12) { bg = "FEF3C7"; bold = true; col = C.dark; }
      if (i >= 13) { bg = C.greenSoft; col = C.greenDark; bold = true; }
      return { text: c, options: { color: col, bold, align: j === 0 || j === 1 || j === 6 ? "left" : "right", valign: "middle", fontSize: 9, fill: { color: bg } } };
    }));

    s.addTable(tbl, {
      x: 0.6, y: 2.2, w: 12.1, colW: [0.9, 1.7, 1.0, 1.3, 3.4, 2.1, 1.7],
      border: { pt: 0.5, color: C.border }, fontFace: FONT_B, rowH: 0.32,
    });
    footerPage(s, 21);
  }

  // ============================================================
  // SLIDE 22 - 5개년 매출 계획
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.navy);
    pageHeader(s, 5, "매출 계획");
    pageTitle(s, "5개년 매출 계획", "단위: 원 (VAT 별도) — 폭발적 매출 성장 곡선");

    const data = [
      ["구분", "1차년 (2026)", "2차년 (2027)", "3차년 (2028)", "4차년 (2029)", "5차년 (2030)"],
      ["[운영 지표]", "", "", "", "", ""],
      ["일일 처리량", "30 톤", "100 톤", "600 톤", "1,200 톤", "2,300 톤"],
      ["연간 처리량", "4,500 톤", "30,000 톤", "180,000 톤", "360,000 톤", "690,000 톤"],
      ["[매출 (REVENUE)]", "", "", "", "", ""],
      ["연료탄 판매 (230,000원/톤)", "1,035,000,000 원", "6,900,000,000 원", "13,800,000,000 원", "34,500,000,000 원", "69,000,000,000"],
      ["건설 동계연료 (400,000원/톤)", "-", "-", "18,000,000,000 원", "30,000,000,000 원", "48,000,000,000"],
      ["애완동물 모래 (600,000원/톤)", "-", "-", "18,000,000,000원", "36,000,000,000 원", "90,000,000,000"],
      ["앱 사용료", "30,000,000 원", "240,000,000 원", "600,000,000 원", "1,200,000,000 원", "2,400,000,000"],
      ["주문 수수료", "150,000,000 원", "2,400,000,000 원", "9,000,000,000 원", "24,000,000,000 원", "60,000,000,000"],
      ["매출 합계", "1,215,000,000 원", "9,540,000,000 원", "59,400,000,000 원", "125,700,000,000 원", "269,400,000,000 원"],
    ];

    const tbl = data.map((row, i) => row.map((c, j) => {
      if (i === 0) return { text: c, options: { fill: { color: C.navy }, color: "FFFFFF", bold: true, align: "center", valign: "middle", fontSize: 11 } };
      if (i === 1 || i === 4) {
        return { text: c, options: { fill: { color: "EFF2F7" }, color: C.navy, bold: true, align: "left", valign: "middle", fontSize: 10 } };
      }
      let bg = i % 2 === 0 ? "F8FAFC" : "FFFFFF";
      let col = C.body, bold = false, sz = 10;
      if (j === 0) { col = C.dark; bold = true; }
      if (i === 10) { bg = C.greenSoft; col = C.greenDark; bold = true; sz = 11; }
      return { text: c, options: { color: col, bold, align: j === 0 ? "left" : "right", valign: "middle", fontSize: sz, fill: { color: bg } } };
    }));

    s.addTable(tbl, {
      x: 0.6, y: 2.2, w: 12.1, colW: [3.1, 1.8, 1.8, 1.8, 1.8, 1.8],
      border: { pt: 0.5, color: C.border }, fontFace: FONT_B, rowH: 0.42,
    });
    footerPage(s, 22);
  }

  // ============================================================
  // SLIDE 23 - 5개년 비용/영업이익
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.navy);
    pageHeader(s, 5, "매출 계획");
    pageTitle(s, "5개년 비용 구조 및 영업이익", "5차년 영업이익 약 559억 원, 영업이익률 21% 달성");

    const data = [
      ["구분", "1차년 (2026)", "2차년 (2027)", "3차년 (2028)", "4차년 (2029)", "5차년 (2030)"],
      ["[비용 (COST)]", "", "", "", "", ""],
      ["원재료비", "225,000,000 원", "1,500,000,000 원", "9,000,000,000 원", "18,000,000,000 원", "34,500,000,000 원"],
      ["외주비-연료탄", "450,000,000 원", "3,000,000,000 원", "6,000,000,000 원", "15,000,000,000 원", "30,000,000,000 원"],
      ["-동계연료 (200,000/톤)", "-", "-", "9,000,000,000 원", "15,000,000,000 원", "24,000,000,000 원"],
      ["-반려동물 모래 (300,000/톤)", "-", "-", "9,000,000,000 원", "18,000,000,000 원", "45,000,000,000 원"],
      ["운반비", "90,000,000 원", "600,000,000 원", "3,600,000,000 원", "7,200,000,000 원", "13,800,000,000 원"],
      ["제조비 합계", "765,000,000", "5,100,000,000 원", "36,600,000,000 원", "73,200,000,000 원", "147,300,000,000"],
      ["인건비", "120,000,000 원", "480,000,000 원", "1,440,000,000 원", "2,400,000,000 원", "3,840,000,000 원"],
      ["복리후생비", "6,000,000 원", "24,000,000 원", "72,000,000 원", "120,000,000 원", "192,000,000 원"],
      ["영업비(개발비)", "36,450,000", "286,200,000 원", "1,782,000,000 원", "3,771,000,000 원", "8,082,000,000 원"],
      ["마케팅비", "135,000,000", "2,160,000,000 원", "8,100,000,000 원", "21,600,000,000 원", "54,000,000,000 원"],
      ["판관비 합계", "297,450,000 원", "2,950,200,000 원", "11,394,000,000 원", "27,891,000,000 원", "66,114,000,000 원"],
      ["영업이익 (OP)", "152,550,000", "1,489,800,000 원", "11,406,000,000 원", "24,609,000,000 원", "55,986,000,000 원"],
      ["영업이익률 (%)", "13%", "16%", "19%", "20%", "21%"],
    ];

    const tbl = data.map((row, i) => row.map((c, j) => {
      if (i === 0) return { text: c, options: { fill: { color: C.navy }, color: "FFFFFF", bold: true, align: "center", valign: "middle", fontSize: 11 } };
      if (i === 1) return { text: c, options: { fill: { color: "EFF2F7" }, color: C.navy, bold: true, align: "left", valign: "middle", fontSize: 10 } };
      let bg = i % 2 === 0 ? "F8FAFC" : "FFFFFF";
      let col = C.body, bold = false, sz = 9;
      if (j === 0) { col = C.dark; bold = true; }
      if (i === 7 || i === 12) { bg = "EFF2F7"; col = C.navy; bold = true; sz = 9; }
      if (i === 13) { bg = C.greenSoft; col = C.greenDark; bold = true; sz = 10; }
      if (i === 14) { bg = C.greenSoft; col = C.green; bold = true; sz = 10; }
      return { text: c, options: { color: col, bold, align: j === 0 ? "left" : "right", valign: "middle", fontSize: sz, fill: { color: bg } } };
    }));

    s.addTable(tbl, {
      x: 0.6, y: 2.2, w: 12.1, colW: [2.9, 1.84, 1.84, 1.84, 1.84, 1.84],
      border: { pt: 0.5, color: C.border }, fontFace: FONT_B, rowH: 0.32,
    });
    footerPage(s, 23);
  }

  // ============================================================
  // SLIDE 24 - 투자 유치
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.greenDark);
    pageHeader(s, 6, "투자 제안");
    pageTitle(s, "투자 유치 — ₩5억 (Seed Round)", "초기 인프라 구축 및 핵심 인력 채용을 위한 시드 라운드");

    // Left: donut chart
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.2, w: 5.5, h: 5.0, fill: { color: C.card }, line: { color: C.border, width: 0.75 } });
    s.addText("자금 사용 비중", { x: 0.6, y: 2.35, w: 5.5, h: 0.4, fontSize: 12, bold: true, color: C.muted, align: "center", margin: 0 });

    s.addChart(pres.charts.DOUGHNUT, [{
      name: "자금사용",
      labels: ["건조 설비 (소형)", "인력 채용", "수거 차량", "앱 개발·서버", "영업·마케팅", "예비비"],
      values: [24, 24, 18, 16, 10, 8],
    }], {
      x: 0.8, y: 2.85, w: 5.1, h: 3.9,
      chartColors: ["047857", "10B981", "34D399", "6EE7B7", "A7F3D0", "94A3B8"],
      showLegend: false, holeSize: 60,
    });
    // Center label
    s.addText("Total Fund", { x: 2.4, y: 4.25, w: 2.0, h: 0.3, fontSize: 11, color: C.muted, align: "center", margin: 0 });
    s.addText([
      { text: "5.0", options: { fontSize: 32, bold: true, color: C.dark } },
      { text: " 억", options: { fontSize: 14, bold: true, color: C.dark } },
    ], { x: 2.0, y: 4.55, w: 2.8, h: 0.6, align: "center", margin: 0 });

    // Right: detail table card
    s.addShape(pres.shapes.RECTANGLE, { x: 6.4, y: 2.2, w: 6.3, h: 5.0, fill: { color: C.card }, line: { color: C.border, width: 0.75 } });

    const fund = [
      { color: "047857", title: "건조 설비 (소형)", desc: "1톤/일 처리 용량",        amt: "1억 2,000만원", pct: "24%" },
      { color: "10B981", title: "인력 채용",        desc: "핵심 인력 3명 (개발/운영)", amt: "1억 2,000만원", pct: "24%" },
      { color: "34D399", title: "수거 차량",        desc: "1톤 트럭 2대 구매/개조",   amt: "9,000만원",     pct: "18%" },
      { color: "6EE7B7", title: "앱 개발 · 서버",    desc: "외주 개발 및 인프라",     amt: "8,000만원",     pct: "16%" },
      { color: "A7F3D0", title: "영업 · 마케팅",     desc: "초기 카페 50곳 모집",     amt: "5,000만원",     pct: "10%" },
      { color: "94A3B8", title: "예비비",           desc: "운영 잡비 및 리스크 대응",  amt: "4,000만원",     pct: "8%" },
    ];
    fund.forEach((f, i) => {
      const y = 2.4 + i * 0.7;
      s.addShape(pres.shapes.RECTANGLE, { x: 6.55, y, w: 0.15, h: 0.55, fill: { color: f.color }, line: { color: f.color, width: 0 } });
      s.addText(f.title, { x: 6.8, y: y - 0.02, w: 3.0, h: 0.32, fontSize: 11, bold: true, color: C.dark, margin: 0 });
      s.addText(f.desc, { x: 6.8, y: y + 0.28, w: 3.0, h: 0.28, fontSize: 9, color: C.muted, margin: 0 });
      s.addText(f.amt, { x: 9.85, y: y + 0.05, w: 1.8, h: 0.4, fontSize: 12, bold: true, color: C.dark, align: "right", margin: 0 });
      s.addText(f.pct, { x: 11.7, y: y + 0.08, w: 0.85, h: 0.35, fontSize: 11, bold: true, color: C.greenDark, align: "right", margin: 0 });
      if (i < fund.length - 1) {
        s.addShape(pres.shapes.LINE, { x: 6.55, y: y + 0.66, w: 6.0, h: 0, line: { color: C.border, width: 0.5 } });
      }
    });
    // Total row
    s.addShape(pres.shapes.RECTANGLE, { x: 6.55, y: 6.7, w: 6.0, h: 0.4, fill: { color: C.greenSoft }, line: { color: C.greenSoft, width: 0 } });
    s.addText("합계 (Total)", { x: 6.8, y: 6.72, w: 3.0, h: 0.36, fontSize: 11, bold: true, color: C.dark, valign: "middle", margin: 0 });
    s.addText("5억 원", { x: 9.85, y: 6.72, w: 1.8, h: 0.36, fontSize: 13, bold: true, color: C.greenDark, align: "right", valign: "middle", margin: 0 });
    s.addText("100%", { x: 11.7, y: 6.72, w: 0.85, h: 0.36, fontSize: 11, bold: true, color: C.greenDark, align: "right", valign: "middle", margin: 0 });
    footerPage(s, 24);
  }

  // ============================================================
  // SLIDE 25 - 감사합니다
  // ============================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.navy };
    // Top accent bar
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.13, fill: { color: C.green }, line: { color: C.green, width: 0 } });

    // Center accent line
    s.addShape(pres.shapes.RECTANGLE, { x: W/2 - 0.4, y: 2.2, w: 0.8, h: 0.07, fill: { color: C.green }, line: { color: C.green, width: 0 } });

    s.addText("감사합니다", {
      x: 0, y: 2.6, w: W, h: 1.5,
      fontFace: FONT_T, fontSize: 64, bold: true, color: "FFFFFF", align: "center", margin: 0
    });

    s.addText("스마트에코시스의 여정에 함께해 주십시오.", {
      x: 0, y: 4.2, w: W, h: 0.5, fontSize: 18, color: "CBD5E1", align: "center", margin: 0
    });

    // Bottom brand
    s.addImage({ data: I.leaf, x: W/2 - 1.7, y: 5.6, w: 0.45, h: 0.45 });
    s.addText("Smart EcoSys Inc.", { x: W/2 - 1.2, y: 5.6, w: 3.0, h: 0.45, fontSize: 18, bold: true, color: "FFFFFF", valign: "middle", margin: 0 });

    s.addText("contact@smartecosis.com   |   02-XXX-XXXX", {
      x: 0, y: 6.3, w: W, h: 0.4, fontSize: 11, color: "94A3B8", align: "center", margin: 0
    });
  }

  // Save
  await pres.writeFile({ fileName: "C:/SMARTECOSYS/사업계획서_MGC톤앤매너.pptx" });
  console.log("DONE - 23 slides");
}

build().catch(e => { console.error(e); process.exit(1); });
