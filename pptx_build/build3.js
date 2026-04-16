// 이열 - 커피 슬러지 친환경 자원화 사업계획서 (MGC 톤앤매너)
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const Fa = require("react-icons/fa");

const C = {
  navy: "0F1E3D", dark: "1F2937", body: "4B5563", muted: "6B7280", light: "9CA3AF",
  border: "E5E7EB", bg: "F8FAFC", card: "FFFFFF",
  green: "10B981", greenDark: "047857", greenSoft: "ECFDF5",
  yellow: "F59E0B", yellowSoft: "FEF3C7",
  red: "DC2626", redSoft: "FEF2F2",
  blue: "2563EB", blueDark: "1E3A8A", blueSoft: "EFF6FF",
  orange: "F97316", orangeSoft: "FFF7ED", slate: "475569",
};
const FT = "맑은 고딕", FB = "맑은 고딕";
const W = 13.3, H = 7.5;
const IMG = "C:/SMARTECOSYS/pptx_build/s3_images";

async function icon(Ico, color, sz = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Ico, { color: "#" + color, size: String(sz) }));
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + png.toString("base64");
}

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "이열"; pres.title = "커피 슬러지 친환경 자원화 사업계획서";

function frame(s, accent = C.navy) {
  s.background = { color: C.bg };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.18, h: H, fill: { color: accent } });
}
function hdr(s, ch, txt) {
  s.addText("LEEYEOL  ·  이열", { x: 0.6, y: 0.3, w: 4, h: 0.35, fontFace: FT, fontSize: 12, bold: true, color: C.navy, charSpacing: 0.5, margin: 0 });
  s.addText(`${ch}. ${txt}`, { x: W - 4, y: 0.3, w: 3.6, h: 0.35, fontSize: 11, color: C.muted, align: "right", margin: 0 });
}
function title(s, t, sub) {
  s.addText(t, { x: 0.6, y: 0.85, w: 12, h: 0.75, fontFace: FT, fontSize: 28, bold: true, color: C.dark, margin: 0 });
  if (sub) s.addText(sub, { x: 0.6, y: 1.5, w: 12, h: 0.4, fontSize: 12, color: C.muted, margin: 0 });
  s.addShape(pres.shapes.LINE, { x: 0.6, y: 1.95, w: 12.1, h: 0, line: { color: C.border, width: 0.75 } });
}
function pgn(s, n) { s.addText(`${n} / 11`, { x: W - 1.0, y: H - 0.4, w: 0.8, h: 0.3, fontSize: 9, color: C.light, align: "right", margin: 0 }); }

async function build() {
  const I = {
    coffee: await icon(Fa.FaCoffee, C.slate),
    fire: await icon(Fa.FaFire, C.orange),
    leaf: await icon(Fa.FaLeaf, C.green),
    bolt: await icon(Fa.FaBolt, C.yellow),
    recycle: await icon(Fa.FaRecycle, C.green),
    building: await icon(Fa.FaBuilding, C.blue),
    handshake: await icon(Fa.FaHandshake, C.navy),
    industry: await icon(Fa.FaIndustry, C.navy),
    chart: await icon(Fa.FaChartLine, C.green),
    award: await icon(Fa.FaAward, C.yellow),
    check: await icon(Fa.FaCheckCircle, C.green),
    flag: await icon(Fa.FaFlag, C.green),
    rocket: await icon(Fa.FaRocket, C.navy),
    cat: await icon(Fa.FaCat, C.greenDark),
    cube: await icon(Fa.FaCube, C.orange),
    cogs: await icon(Fa.FaCogs, C.blue),
    store: await icon(Fa.FaStore, C.slate),
    truck: await icon(Fa.FaTruck, C.blue),
    flask: await icon(Fa.FaFlask, C.blue),
    coins: await icon(Fa.FaCoins, C.yellow),
    map: await icon(Fa.FaMapMarkedAlt, C.green),
    file: await icon(Fa.FaFileAlt, C.green),
    star: await icon(Fa.FaStar, "FFFFFF"),
    globe: await icon(Fa.FaGlobeAsia, C.blue),
    won: await icon(Fa.FaWonSign, C.yellow),
    calendar: await icon(Fa.FaCalendarAlt, C.blue),
    seedling: await icon(Fa.FaSeedling, C.green),
    lightbulb: await icon(Fa.FaLightbulb, C.yellow),
    shieldAlt: await icon(Fa.FaShieldAlt, C.blue),
    arrowR: await icon(Fa.FaArrowRight, C.light),
  };

  // ===== SLIDE 1: 표지 =====
  {
    const s = pres.addSlide();
    s.background = { color: C.card };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.13, fill: { color: C.green } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0.13, w: 0.18, h: H - 0.13, fill: { color: C.navy } });

    // Partner logos row
    s.addText("한전MCS(주)  ·  LEEYEOL 주·이열  ·  K water 한국수자원공사", {
      x: 0.6, y: 0.6, w: 12, h: 0.5, fontSize: 13, bold: true, color: C.muted, align: "center", margin: 0
    });

    // Decorative icons
    s.addShape(pres.shapes.OVAL, { x: 4.4, y: 1.8, w: 1.0, h: 1.0, fill: { color: C.bg }, line: { color: C.border, width: 0.75 } });
    s.addImage({ data: I.coffee, x: 4.65, y: 2.05, w: 0.5, h: 0.5 });
    s.addText("→", { x: 5.55, y: 2.05, w: 0.6, h: 0.5, fontSize: 22, color: C.light, align: "center", margin: 0 });
    s.addShape(pres.shapes.OVAL, { x: 6.15, y: 1.8, w: 1.0, h: 1.0, fill: { color: C.greenSoft }, line: { color: C.green, width: 0.75 } });
    s.addImage({ data: I.recycle, x: 6.4, y: 2.05, w: 0.5, h: 0.5 });
    s.addText("→", { x: 7.3, y: 2.05, w: 0.6, h: 0.5, fontSize: 22, color: C.light, align: "center", margin: 0 });
    s.addShape(pres.shapes.OVAL, { x: 7.9, y: 1.8, w: 1.0, h: 1.0, fill: { color: C.yellowSoft }, line: { color: C.yellow, width: 0.75 } });
    s.addImage({ data: I.bolt, x: 8.15, y: 2.05, w: 0.5, h: 0.5 });

    s.addText([
      { text: "커피 슬러지(찌꺼기)", options: { color: C.dark, bold: true } },
      { text: "를 활용한", options: { color: C.dark, bold: true } },
    ], { x: 0.6, y: 3.5, w: 12.1, h: 0.85, fontFace: FT, fontSize: 38, align: "center", margin: 0 });
    s.addText([
      { text: "친환경 자원화 사업 ", options: { color: C.green, bold: true } },
      { text: "계획서", options: { color: C.dark, bold: true } },
    ], { x: 0.6, y: 4.25, w: 12.1, h: 0.85, fontFace: FT, fontSize: 38, align: "center", margin: 0 });

    s.addShape(pres.shapes.RECTANGLE, { x: 6.15, y: 5.2, w: 0.6, h: 0.05, fill: { color: C.green } });
    s.addText("2025. 12.", { x: 0.6, y: 5.5, w: 12.1, h: 0.4, fontSize: 16, color: C.body, align: "center", margin: 0 });

    // Footer
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: H - 1.0, w: W, h: 1.0, fill: { color: C.navy } });
    s.addImage({ data: I.industry, x: 5.5, y: H - 0.82, w: 0.5, h: 0.5 });
    s.addText("주식회사 이열", { x: 6.05, y: H - 0.8, w: 4, h: 0.45, fontFace: FT, fontSize: 18, bold: true, color: "FFFFFF", margin: 0 });
    s.addText("LeEYEOL Co., Ltd.   |   leeyeol.com", { x: 6.05, y: H - 0.4, w: 4, h: 0.3, fontSize: 10, color: "94A3B8", margin: 0 });
  }

  // ===== SLIDE 2: 회사 소개 [회사개요] =====
  {
    const s = pres.addSlide(); frame(s, C.green); hdr(s, 1, "회사 소개"); title(s, "회사 소개 [회사개요]", "(주)이열 — 2008년 설립, 슬러지 연료화 전문기업");
    const rows = [
      { label: "법인명", value: "(주)이열" },
      { label: "대표이사", value: "이기열" },
      { label: "설립일", value: "2008. 4. 7." },
      { label: "자본금", value: "2,500,000,000원 (25억 원)" },
      { label: "본사", value: "서울시 서초구 논현로 7길 16 (양재동, 보연빌딩)" },
      { label: "연구소", value: "경기도 화성시 서신면 염전길 30-5" },
      { label: "홈페이지", value: "http://leeyeol.com/" },
    ];
    const tx = 0.6, ty = 2.25, rH = 0.65, lW = 2.6, vW = 9.5;
    s.addShape(pres.shapes.RECTANGLE, { x: tx, y: ty, w: lW + vW, h: rH * rows.length + 0.1, fill: { color: C.card }, line: { color: C.border, width: 0.5 } });
    rows.forEach((r, i) => {
      const y = ty + 0.05 + i * rH;
      s.addShape(pres.shapes.RECTANGLE, { x: tx, y, w: lW, h: rH, fill: { color: C.greenSoft } });
      s.addText(r.label, { x: tx + 0.3, y: y + 0.15, w: lW - 0.5, h: 0.35, fontFace: FT, fontSize: 12, bold: true, color: C.greenDark, valign: "middle", margin: 0 });
      s.addText(r.value, { x: tx + lW + 0.3, y: y + 0.15, w: vW - 0.5, h: 0.35, fontSize: 11, color: C.body, valign: "middle", margin: 0 });
      if (i < rows.length - 1) s.addShape(pres.shapes.LINE, { x: tx, y: y + rH, w: lW + vW, h: 0, line: { color: C.border, width: 0.5 } });
    });
    // 관계회사 box
    s.addShape(pres.shapes.RECTANGLE, { x: tx, y: ty + rH * rows.length + 0.3, w: lW + vW, h: 0.7, fill: { color: C.orangeSoft }, line: { color: C.orange, width: 0.75 } });
    s.addText("관계회사 :  ㈜ 이열알앤디   ·   ㈜ 중부에코너지", { x: tx + 0.3, y: ty + rH * rows.length + 0.3, w: lW + vW - 0.6, h: 0.7, fontSize: 12, bold: true, color: C.orange, valign: "middle", margin: 0 });
    pgn(s, 2);
  }

  // ===== SLIDE 3: 회사 소개 [주요사업] =====
  {
    const s = pres.addSlide(); frame(s, C.green); hdr(s, 1, "회사 소개"); title(s, "회사 소개 [주요사업]", "커피 슬러지 자원화 · 연료화 — 새로운 신성장 동력산업");

    // Top achievements
    const achvs = [
      { yr: "2023", txt: "한국중부발전 하수슬러지연료탄 구매 선호도 1위" },
      { yr: "2023", txt: "한전엠씨에스와 신재생에너지 분야 공동화 사업 협약 [MOA] — 이열알앤디" },
      { yr: "2025", txt: "사회적협동조합 자원과 순환 커피찌꺼기 공급 협약 (서울시 지자체 · 동서식품 등)" },
    ];
    achvs.forEach((a, i) => {
      const y = 2.2 + i * 0.7;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 12.1, h: 0.6, fill: { color: C.card }, line: { color: C.border, width: 0.5 } });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 0.08, h: 0.6, fill: { color: C.green } });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.85, y: y + 0.1, w: 0.75, h: 0.4, fill: { color: C.greenSoft } });
      s.addText(a.yr, { x: 0.85, y: y + 0.1, w: 0.75, h: 0.4, fontSize: 10, bold: true, color: C.greenDark, align: "center", valign: "middle", margin: 0 });
      s.addText(a.txt, { x: 1.8, y: y + 0.1, w: 10.7, h: 0.4, fontSize: 11, color: C.dark, valign: "middle", margin: 0 });
    });

    // Key highlight banner
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 4.4, w: 12.1, h: 0.55, fill: { color: C.navy } });
    s.addImage({ data: I.lightbulb, x: 0.85, y: 4.52, w: 0.32, h: 0.32 });
    s.addText([
      { text: "새로운 신성장 동력산업 : ", options: { color: C.yellow, bold: true } },
      { text: "한국전력 = 한전MCS · 이열 공동사업", options: { color: "FFFFFF", bold: true } },
    ], { x: 1.3, y: 4.45, w: 11.3, h: 0.45, fontSize: 13, valign: "middle", margin: 0 });

    // Business directions (4 cards)
    const dirs = [
      { ico: I.coffee, color: C.navy, title: "커피슬러지 (커피찌꺼기)", desc: "자원화 · 연료화 · 비료화 · 소재화" },
      { ico: I.cogs, color: C.blue, title: "하수슬러지 + 커피찌꺼기", desc: "발전소 고형연료 (바이오매스)" },
      { ico: I.seedling, color: C.green, title: "가축분뇨 + 커피찌꺼기", desc: "발전소 고형연료 · 연탄대체 (비닐하우스)" },
      { ico: I.recycle, color: C.greenDark, title: "생활폐기물 커피찌꺼기", desc: "소각·매립 → 고형연료화 1차사업" },
    ];
    dirs.forEach((d, i) => {
      const x = 0.6 + i * 3.1, y = 5.2, w = 2.9, h = 2.0;
      s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.card }, line: { color: C.border, width: 0.5 } });
      s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.08, fill: { color: d.color } });
      s.addImage({ data: d.ico, x: x + 0.25, y: y + 0.3, w: 0.4, h: 0.4 });
      s.addText(d.title, { x: x + 0.25, y: y + 0.8, w: w - 0.5, h: 0.4, fontSize: 11, bold: true, color: C.dark, margin: 0 });
      s.addText(d.desc, { x: x + 0.25, y: y + 1.2, w: w - 0.5, h: 0.6, fontSize: 10, color: C.body, margin: 0 });
    });
    pgn(s, 3);
  }

  // ===== SLIDE 4: 한전MCS 협약 =====
  {
    const s = pres.addSlide(); frame(s, C.green); hdr(s, 1, "회사 소개"); title(s, "회사 소개 [한전MCS 협약]", "한전엠씨에스 공공기관 — 한국전력 100% 주주 | 매출액 3,071억 | 직원 4,437명");

    // Left: partner info card
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.2, w: 6.0, h: 2.6, fill: { color: C.card }, line: { color: C.border, width: 0.75 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.2, w: 0.08, h: 2.6, fill: { color: C.blue } });
    s.addImage({ data: I.building, x: 0.85, y: 2.4, w: 0.45, h: 0.45 });
    s.addText("한전엠씨에스", { x: 1.45, y: 2.35, w: 4.5, h: 0.45, fontFace: FT, fontSize: 16, bold: true, color: C.dark, margin: 0 });
    s.addText("공공기관  |  주주: 한국전력 100%  |  매출액 3,071억('23)  |  직원 4,437명", { x: 1.45, y: 2.75, w: 5.0, h: 0.35, fontSize: 10, color: C.muted, margin: 0 });
    s.addShape(pres.shapes.LINE, { x: 0.85, y: 3.2, w: 5.5, h: 0, line: { color: C.border, width: 0.5 } });
    s.addText("[하수슬러지연료화 / 축분연료화 / 연탄 대체사업]", { x: 0.85, y: 3.3, w: 5.5, h: 0.35, fontSize: 11, bold: true, color: C.dark, margin: 0 });
    s.addText("이열알앤디의 이열SLT시스템으로\n하수슬러지 펠릿 · 축분슬러지 펠릿 제조\n→ 발전사 연료탄 기준치 적합 · 기술경쟁력 확보", { x: 0.85, y: 3.7, w: 5.5, h: 1.0, fontSize: 10.5, color: C.body, margin: 0 });

    // Right: timeline
    s.addShape(pres.shapes.RECTANGLE, { x: 6.9, y: 2.2, w: 5.8, h: 2.6, fill: { color: C.card }, line: { color: C.border, width: 0.75 } });
    s.addText("협약 타임라인", { x: 7.1, y: 2.3, w: 5.4, h: 0.35, fontFace: FT, fontSize: 13, bold: true, color: C.dark, margin: 0 });
    const tl = [
      { d: "2023.04", t: "슬러지활용 발전소연료공급사업 보고" },
      { d: "2023.05", t: "제품 시험 및 기술심사" },
      { d: "2023.06", t: "한전MCS 사업선정 (사업성·기술성)" },
      { d: "2023.07", t: "슬러지 연료탄 사업 양해각서 [MOU]" },
      { d: "2023.12", t: "슬러지 연료탄 판매 공동협약서 [MOA]" },
    ];
    tl.forEach((t, i) => {
      const y = 2.75 + i * 0.38;
      s.addShape(pres.shapes.OVAL, { x: 7.15, y: y + 0.05, w: 0.2, h: 0.2, fill: { color: i === tl.length - 1 ? C.green : C.blue } });
      s.addText(t.d, { x: 7.45, y: y, w: 1.1, h: 0.3, fontSize: 9, bold: true, color: C.blue, margin: 0 });
      s.addText(t.t, { x: 8.6, y: y, w: 4.0, h: 0.3, fontSize: 10, color: C.body, margin: 0 });
    });

    // Bottom highlight
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 5.05, w: 12.1, h: 0.6, fill: { color: C.greenSoft }, line: { color: C.green, width: 0.75 } });
    s.addImage({ data: I.check, x: 0.85, y: 5.17, w: 0.32, h: 0.32 });
    s.addText([
      { text: "핵심 기술경쟁력: ", options: { bold: true, color: C.greenDark } },
      { text: "하수 슬러지 최대 기피 사유인 ", options: { color: C.body } },
      { text: "악취 최소화", options: { bold: true, color: C.greenDark } },
      { text: " — 2023.12.5 신재생 에너지사업 목적사업 추가", options: { color: C.body } },
    ], { x: 1.3, y: 5.1, w: 11.3, h: 0.5, fontSize: 11, valign: "middle", margin: 0 });

    // MOA image if available
    const moaImg = path.join(IMG, "s4_p1.png");
    if (fs.existsSync(moaImg)) {
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 5.85, w: 12.1, h: 1.4, fill: { color: C.card }, line: { color: C.border, width: 0.5 } });
      s.addImage({ path: moaImg, x: 4.5, y: 5.95, w: 4.3, h: 1.2, sizing: { type: "contain", w: 4.3, h: 1.2 } });
    }
    pgn(s, 4);
  }

  // ===== SLIDE 5: 사업 소개 [사업개요] =====
  {
    const s = pres.addSlide(); frame(s, C.blue); hdr(s, 2, "사업 소개"); title(s, "사업 소개 [커피 슬러지(커피박) 연료화]", "커피를 추출한 후 남는 습한 찌꺼기(커피박)를 고형연료로 가공하여 화력발전소에 공급");

    // Key facts (3 stat cards)
    const stats = [
      { ico: I.coffee, color: C.blue, title: "커피 원료 수입", num: "20만 1,924톤", desc: "2024년 기준\n커피찌꺼기는 원료의 2배" },
      { ico: I.fire, color: C.red, title: "발전소 활용 시 발열량", num: "4,500~5,000", desc: "kcal/kg (건조기준)\n저위 발열량" },
      { ico: I.leaf, color: C.green, title: "온실가스 감축 효과", num: "1.38 tCO₂", desc: "커피박 펠릿 1톤 사용 시\n[한국동서발전 2024.9.6]" },
    ];
    stats.forEach((st, i) => {
      const x = 0.6 + i * 4.1, y = 2.2, w = 3.85, h = 2.3;
      s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.card }, line: { color: C.border, width: 0.5 } });
      s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.08, fill: { color: st.color } });
      s.addShape(pres.shapes.OVAL, { x: x + 0.25, y: y + 0.3, w: 0.55, h: 0.55, fill: { color: C.bg }, line: { color: C.border, width: 0.5 } });
      s.addImage({ data: st.ico, x: x + 0.32, y: y + 0.37, w: 0.4, h: 0.4 });
      s.addText(st.title, { x: x + 0.95, y: y + 0.3, w: w - 1.2, h: 0.35, fontSize: 11, color: C.muted, margin: 0 });
      s.addText(st.num, { x: x + 0.25, y: y + 1.0, w: w - 0.5, h: 0.55, fontFace: FT, fontSize: 24, bold: true, color: C.dark, margin: 0 });
      s.addText(st.desc, { x: x + 0.25, y: y + 1.6, w: w - 0.5, h: 0.6, fontSize: 10, color: C.muted, margin: 0 });
    });

    // Bottom products (non-발전소)
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 4.75, w: 12.1, h: 0.55, fill: { color: C.navy } });
    s.addText("발전소 외 활용처", { x: 0.85, y: 4.8, w: 12, h: 0.45, fontFace: FT, fontSize: 13, bold: true, color: "FFFFFF", valign: "middle", margin: 0 });

    const prods = [
      { ico: I.fire, t: "펠릿난로\n(친환경 연료)" },
      { ico: I.cube, t: "캠핑용품\n(숯)" },
      { ico: I.cat, t: "고양이 모래" },
      { ico: I.seedling, t: "천연 탈취제" },
      { ico: I.leaf, t: "천연비료" },
    ];
    prods.forEach((p, i) => {
      const x = 0.6 + i * 2.42, y = 5.5, w = 2.22, h = 1.6;
      s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.card }, line: { color: C.border, width: 0.5 } });
      s.addImage({ data: p.ico, x: x + w / 2 - 0.25, y: y + 0.2, w: 0.5, h: 0.5 });
      s.addText(p.t, { x: x + 0.15, y: y + 0.8, w: w - 0.3, h: 0.7, fontSize: 11, bold: true, color: C.dark, align: "center", margin: 0 });
    });
    pgn(s, 5);
  }

  // ===== SLIDE 6: 제조공정 =====
  {
    const s = pres.addSlide(); frame(s, C.blue); hdr(s, 2, "사업 소개"); title(s, "사업 소개 [커피 슬러지 연료화 제조공정]", "4단계 공정: 혼합 → 펠릿성형 → 저온열풍건조 → 연료탄 제조");

    // 4 steps
    const steps = [
      { num: "1", color: C.green, title: "커피 슬러지 혼합", items: ["커피찌꺼기 + 부재료", "함수율 70~80% → 50%"] },
      { num: "2", color: C.navy, title: "펠릿 성형", items: ["혼합 커피찌꺼기 압축", "함수율 약 50%"] },
      { num: "3", color: C.blue, title: "저온 열풍기류 건조", items: ["펠릿성형 커피찌꺼기", "함수율 50% → 15~10%"] },
      { num: "4", color: C.greenDark, title: "연료탄 제품 제조", items: ["건조 커피찌꺼기 연료탄", "함수율 10~8%"] },
    ];
    const sw = 3.0, sh = 3.0, gap = 0.05;
    steps.forEach((st, i) => {
      const x = 0.6 + i * (sw + gap), y = 2.2;
      s.addShape(pres.shapes.RECTANGLE, { x, y, w: sw, h: 0.55, fill: { color: st.color } });
      s.addText(`${st.num}단계 →`, { x, y: y + 0.02, w: sw * 0.4, h: 0.5, fontSize: 11, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
      s.addText(st.title, { x: x + sw * 0.38, y: y + 0.02, w: sw * 0.6, h: 0.5, fontSize: 12, bold: true, color: "FFFFFF", valign: "middle", margin: 0 });
      s.addShape(pres.shapes.RECTANGLE, { x, y: y + 0.55, w: sw, h: sh - 0.55, fill: { color: C.card }, line: { color: C.border, width: 0.5 } });
      st.items.forEach((it, j) => {
        s.addText("•  " + it, { x: x + 0.2, y: y + 0.75 + j * 0.35, w: sw - 0.4, h: 0.3, fontSize: 11, color: C.body, margin: 0 });
      });
      // Photo from source (if big enough)
      const imgs = fs.readdirSync(IMG).filter(f => f.startsWith(`s6_p`)).sort();
      if (imgs[i * 2]) {
        s.addImage({ path: path.join(IMG, imgs[i * 2]), x: x + 0.15, y: y + 1.6, w: sw - 0.3, h: 1.5, sizing: { type: "contain", w: sw - 0.3, h: 1.5 } });
      }
    });

    // Bottom flow
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 5.5, w: 12.1, h: 0.55, fill: { color: C.navy } });
    s.addText("함수율 70~80%  →  50%  →  15~10%  →  최종 10~8%", {
      x: 0.6, y: 5.52, w: 12.1, h: 0.5, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0
    });

    // Bottom product result cards
    const results = [
      { title: "혼합 커피 찌꺼기", note: "함수율 50%", color: C.green },
      { title: "펠릿성형 커피 찌꺼기", note: "함수율 50%", color: C.navy },
      { title: "건조 커피찌꺼기", note: "함수율 15~10%", color: C.blue },
      { title: "커피 찌꺼기 연료탄", note: "함수율 10~8%", color: C.greenDark },
    ];
    results.forEach((r, i) => {
      const x = 0.6 + i * 3.05, y = 6.25, w = 2.85, h = 1.0;
      s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.card }, line: { color: r.color, width: 0.75 } });
      s.addText(r.title, { x: x + 0.15, y: y + 0.08, w: w - 0.3, h: 0.4, fontSize: 11, bold: true, color: C.dark, align: "center", margin: 0 });
      s.addText(r.note, { x: x + 0.15, y: y + 0.5, w: w - 0.3, h: 0.35, fontSize: 10, color: r.color, bold: true, align: "center", margin: 0 });
    });
    pgn(s, 6);
  }

  // ===== SLIDE 7: 사업성 분석 [VALUATION] =====
  {
    const s = pres.addSlide(); frame(s, C.navy); hdr(s, 3, "사업성 분석"); title(s, "사업성 분석 [VALUATION]", "일 30톤 기준 연간 매출 42.9억 원, 이익 16.8억 원 (이익률 39%)");

    const data = [
      ["구분", "항목", "기준", "단가 (원)", "산출내역", "금액 (천원)", "비고"],
      ["수입", "난방용연탄", "15톤", "600,000", "15톤/일 × 600,000원/톤 × 330일/년", "2,970,000", "화력단가/캠핑장/폴리카"],
      ["", "가정용 연료", "10톤", "400,000", "10톤/일 × 400,000원/톤 × 330일/년", "1,320,000", "사회적 연탄(커피탄)"],
      ["", "건조물 (왕겨)", "", "", "", "", "바이오차 (블랙소재)"],
      ["", "", "", "", "계", "4,290,000", ""],
      ["지출", "커피찌꺼기", "30톤", "50,000/톤", "30톤/일 × 50,000원/톤 × 330일/년", "495,000", "자원과 순환 (장안가??)"],
      ["", "왕겨", "12톤", "180,000톤", "12톤 × 130,000원/톤 × 330일/년", "514,800", "장기계약조건"],
      ["", "연료 LPG\n(kg/12,000Kcal)", "", "", "28.5원 × 1,850L × 330일", "372,430", ""],
      ["", "전력비 KW", "110원", "", "350KW × 110원/kwh × 24HR × 330일", "304,920", "이열 SLT시스템"],
      ["", "인건비", "명(공장)", "2인 교대", "7명 × 130,000원/일 × 365일", "332,150", "현장 6명 관리 1명"],
      ["", "유지관리비", "", "", "매출액의 5%", "214,500", "공장정비/임차료"],
      ["", "운반비", "25톤", "30,000/톤", "25톤 × 30,000원/톤 × 330일/년", "247,500", "150Km기준?"],
      ["", "일반관리비", "", "", "사무실 관리비 3%", "128,700", ""],
      ["", "", "", "", "계", "2,610,000", ""],
      ["수익", "", "투자비용(설비)", "", "매출 (수입)", "매입 (지출)", "이 익  /  이익율"],
      ["", "", "1,500,000", "", "4,290,000", "2,610,000", "1,679,992  /  39%"],
    ];

    const tbl = data.map((row, i) => row.map((c, j) => {
      if (i === 0) return { text: c, options: { fill: { color: C.navy }, color: "FFFFFF", bold: true, align: "center", valign: "middle", fontSize: 9 } };
      if (i === 4 || i === 13) return { text: c, options: { fill: { color: C.yellowSoft }, color: C.dark, bold: true, align: j >= 4 ? "right" : "center", valign: "middle", fontSize: 9 } };
      if (i >= 14) return { text: c, options: { fill: { color: C.greenSoft }, color: C.greenDark, bold: true, align: j >= 4 ? "right" : "center", valign: "middle", fontSize: 9 } };
      let bg = i % 2 === 0 ? "F8FAFC" : "FFFFFF";
      let col = C.body, bold = false;
      if (j === 0) { col = C.dark; bold = true; bg = "EFF2F7"; }
      if (j === 5) { bold = true; col = C.dark; }
      return { text: c, options: { color: col, bold, align: (j === 0 || j === 1 || j === 6) ? "left" : "right", valign: "middle", fontSize: 8, fill: { color: bg } } };
    }));

    s.addTable(tbl, {
      x: 0.6, y: 2.1, w: 12.1, colW: [0.7, 1.5, 1.0, 1.2, 3.6, 1.6, 2.5],
      border: { pt: 0.5, color: C.border }, fontFace: FB, rowH: 0.3,
    });
    pgn(s, 7);
  }

  // ===== SLIDE 8: 커피찌꺼기 활용 관련제품 현황 =====
  {
    const s = pres.addSlide(); frame(s, C.orange); hdr(s, 4, "관련제품 현황"); title(s, "커피찌꺼기 활용 관련제품 현황", "펠릿연료 · 건조 커피박 제품 · 기능성/특수용 소재 제품 — 다양한 응용 가능");

    const data = [
      ["구분", "커피찌꺼기 펠릿연료 제품", "건조 커피박 제품", "기능성 및 특수용 소재 제품"],
      ["용도", "가정, 난방, 캠핑", "비료, 탈취제,\n벌레퇴치, 기름제거", "악취제거, 수처리 소재,\n활성탄 대체"],
      ["중량", "15kg / 5kg (2.5kg)", "1kg ~ 21kg", "200g/ea ~ "],
      ["금액", "18,900 / 11,000 /\n7,500", "10,000 ~ 8,500", "9,900 / 3,300 ~ 고가"],
    ];

    const tbl = data.map((row, i) => row.map((c, j) => {
      if (i === 0) return { text: c, options: { fill: { color: C.navy }, color: "FFFFFF", bold: true, align: "center", valign: "middle", fontSize: 12 } };
      let bg = i % 2 === 0 ? "F8FAFC" : "FFFFFF";
      if (j === 0) return { text: c, options: { color: C.dark, bold: true, align: "center", valign: "middle", fontSize: 11, fill: { color: "EFF2F7" } } };
      return { text: c, options: { color: C.body, align: "center", valign: "middle", fontSize: 11, fill: { color: bg } } };
    }));

    s.addTable(tbl, {
      x: 0.6, y: 2.2, w: 12.1, colW: [1.5, 3.5, 3.55, 3.55],
      border: { pt: 0.5, color: C.border }, fontFace: FB, rowH: 0.85,
    });

    // Product images from source
    const pImgs = fs.readdirSync(IMG).filter(f => f.startsWith("s8_p")).sort();
    pImgs.slice(0, 7).forEach((f, i) => {
      const x = 0.6 + i * 1.78, y = 5.9, w = 1.55, h = 1.3;
      s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.card }, line: { color: C.border, width: 0.5 } });
      s.addImage({ path: path.join(IMG, f), x: x + 0.05, y: y + 0.05, w: w - 0.1, h: h - 0.1, sizing: { type: "contain", w: w - 0.1, h: h - 0.1 } });
    });
    pgn(s, 8);
  }

  // ===== SLIDE 9: 사업추진 계획 =====
  {
    const s = pres.addSlide(); frame(s, C.green); hdr(s, 5, "사업추진 계획"); title(s, "사업추진 계획", "3단계 연도별 확장: 연료화 → 자원화 → 소재 사업화");

    const phases = [
      { yr: "2026", phase: "1차", title: "커피찌꺼기 연료화", color: C.green,
        items: ["수도권(커피1공장)", "난방용연료탄 · 캠핑용연료"], ico: I.fire },
      { yr: "2027", phase: "2차", title: "커피찌꺼기 자원화", color: C.blue,
        items: ["충청권(커피2공장) : 난방용연료탄", "경북권(커피3공장) : 탈취제 · 경축순환농업(깔개, 기능성퇴비)"], ico: I.recycle },
      { yr: "2028~", phase: "3차", title: "커피찌꺼기 소재 사업화", color: C.navy,
        items: ["강원권(커피4공장)", "바이오차(탄소크레딧) · 산업용소재화"], ico: I.rocket },
    ];

    // Timeline horizontal line
    s.addShape(pres.shapes.LINE, { x: 1.5, y: 2.65, w: 10.5, h: 0, line: { color: C.light, width: 1.5 } });

    phases.forEach((p, i) => {
      const x = 0.6 + i * 4.1, w = 3.85;
      // Year pill
      s.addShape(pres.shapes.RECTANGLE, { x: x + w / 2 - 0.75, y: 2.15, w: 1.5, h: 0.4, fill: { color: p.color } });
      s.addText(p.yr, { x: x + w / 2 - 0.75, y: 2.15, w: 1.5, h: 0.4, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
      // Circle on timeline
      s.addShape(pres.shapes.OVAL, { x: x + w / 2 - 0.2, y: 2.55, w: 0.4, h: 0.4, fill: { color: p.color } });
      s.addText(String(i + 1), { x: x + w / 2 - 0.2, y: 2.55, w: 0.4, h: 0.4, fontSize: 12, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
      // Card
      s.addShape(pres.shapes.RECTANGLE, { x, y: 3.15, w, h: 0.08, fill: { color: p.color } });
      s.addShape(pres.shapes.RECTANGLE, { x, y: 3.23, w, h: 3.8, fill: { color: C.card }, line: { color: C.border, width: 0.5 } });
      s.addImage({ data: p.ico, x: x + w / 2 - 0.3, y: 3.5, w: 0.6, h: 0.6 });
      s.addText(`${p.phase} ${p.title}`, { x, y: 4.2, w, h: 0.5, fontFace: FT, fontSize: 14, bold: true, color: C.dark, align: "center", margin: 0 });
      s.addText(`[${p.yr}]`, { x, y: 4.65, w, h: 0.35, fontSize: 11, color: p.color, bold: true, align: "center", margin: 0 });
      const runs = [];
      p.items.forEach((it, j) => {
        runs.push({ text: it, options: { color: C.body, bullet: { code: "25CF" }, breakLine: j < p.items.length - 1 } });
      });
      s.addText(runs, { x: x + 0.3, y: 5.1, w: w - 0.6, h: 1.7, fontSize: 10.5, paraSpaceAfter: 4, margin: 0 });
    });
    pgn(s, 9);
  }

  // ===== SLIDE 10: 보유기술 지적재산권 =====
  {
    const s = pres.addSlide(); frame(s, C.yellow); hdr(s, "", "보유기술"); title(s, "보유기술 : 지적재산권", "슬러지 연료화 처리 시스템 관련 다수 특허 보유");

    // 3 patent cards
    const patents = [
      { title: "슬러지 연료화 처리 시스템", no: "제 10-2069317호", desc: "슬러지를 고형연료로 전환하는 핵심 시스템 특허" },
      { title: "슬러지 연료화 처리 시스템의\n건조공기 공급장치", no: "제 10-2069308호", desc: "건조 공정의 열풍 공급 최적화 장치 특허" },
      { title: "이열 SLT 시스템 (추가 특허)", no: "관련 특허 다수", desc: "저온 열풍 기류 건조 관련 핵심 기술 포트폴리오" },
    ];
    patents.forEach((p, i) => {
      const x = 0.6 + i * 4.1, w = 3.85, y = 2.2, h = 4.5;
      s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.card }, line: { color: C.border, width: 0.75 } });
      s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.08, fill: { color: C.yellow } });
      // icon
      s.addShape(pres.shapes.OVAL, { x: x + w / 2 - 0.5, y: y + 0.5, w: 1.0, h: 1.0, fill: { color: C.yellowSoft }, line: { color: C.yellow, width: 1 } });
      s.addImage({ data: I.award, x: x + w / 2 - 0.25, y: y + 0.75, w: 0.5, h: 0.5 });
      // title
      s.addText(p.title, { x: x + 0.3, y: y + 1.8, w: w - 0.6, h: 0.85, fontFace: FT, fontSize: 14, bold: true, color: C.dark, align: "center", margin: 0 });
      // number badge
      s.addShape(pres.shapes.RECTANGLE, { x: x + 0.4, y: y + 2.8, w: w - 0.8, h: 0.45, fill: { color: C.greenSoft }, line: { color: C.green, width: 0.5 } });
      s.addText(p.no, { x: x + 0.4, y: y + 2.8, w: w - 0.8, h: 0.45, fontSize: 11, bold: true, color: C.greenDark, align: "center", valign: "middle", margin: 0 });
      s.addText(p.desc, { x: x + 0.3, y: y + 3.5, w: w - 0.6, h: 0.8, fontSize: 10.5, color: C.body, align: "center", margin: 0 });
    });

    // Bottom callout
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 6.9, w: 12.1, h: 0.45, fill: { color: C.greenSoft }, line: { color: C.green, width: 0.5 } });
    s.addImage({ data: I.shieldAlt, x: 0.8, y: 6.97, w: 0.28, h: 0.28 });
    s.addText("핵심 기술 IP 포트폴리오 기반 견고한 진입장벽 확보 — 경쟁사 대비 차별화된 기술 우위", {
      x: 1.15, y: 6.92, w: 11.4, h: 0.4, fontSize: 11, bold: true, color: C.greenDark, valign: "middle", margin: 0
    });
    pgn(s, 10);
  }

  // ===== SLIDE 11: Thanks =====
  {
    const s = pres.addSlide();
    s.background = { color: C.navy };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.13, fill: { color: C.green } });
    s.addShape(pres.shapes.RECTANGLE, { x: W / 2 - 0.4, y: 2.2, w: 0.8, h: 0.07, fill: { color: C.green } });
    s.addText("감사합니다", { x: 0, y: 2.6, w: W, h: 1.5, fontFace: FT, fontSize: 64, bold: true, color: "FFFFFF", align: "center", margin: 0 });
    s.addText("Thanks for Your Attention", { x: 0, y: 4.2, w: W, h: 0.5, fontSize: 18, color: "CBD5E1", align: "center", margin: 0 });
    s.addImage({ data: I.industry, x: W / 2 - 1.5, y: 5.6, w: 0.45, h: 0.45 });
    s.addText("주식회사 이열", { x: W / 2 - 1.0, y: 5.6, w: 3.0, h: 0.45, fontSize: 18, bold: true, color: "FFFFFF", valign: "middle", margin: 0 });
    s.addText("leeyeol.com", { x: 0, y: 6.3, w: W, h: 0.4, fontSize: 11, color: "94A3B8", align: "center", margin: 0 });
  }

  await pres.writeFile({ fileName: "C:/SMARTECOSYS/이열_커피슬러지_MGC톤앤매너.pptx" });
  console.log("DONE - 11 slides");
}

build().catch(e => { console.error(e); process.exit(1); });
