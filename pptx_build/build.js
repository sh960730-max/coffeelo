// SMARTECOSYS x MGC Investment Proposal - Recreation of Genspark slides
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const Fa = require("react-icons/fa");
const Md = require("react-icons/md");

// ========== Palette ==========
const C = {
  navy: "0F1E3D",
  navyDark: "0A1530",
  dark: "1F2937",
  body: "4B5563",
  muted: "6B7280",
  light: "9CA3AF",
  border: "E5E7EB",
  bg: "F8FAFC",
  card: "FFFFFF",
  green: "10B981",
  greenDark: "047857",
  greenSoft: "ECFDF5",
  yellow: "F59E0B",
  yellowSoft: "FEF3C7",
  red: "DC2626",
  redSoft: "FEF2F2",
  blue: "2563EB",
  blueDark: "1E3A8A",
  blueSoft: "EFF6FF",
  orange: "F97316",
  orangeSoft: "FFF7ED",
  slate: "475569",
};

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
pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
pres.author = "SMARTECOSYS";
pres.title = "MGC X S.E 투자 제안서";

const W = 13.3, H = 7.5;
const FONT_T = "맑은 고딕";  // title
const FONT_B = "맑은 고딕";  // body

// Helper: card with left accent stripe
function card(slide, x, y, w, h, accentColor, fillColor = C.card) {
  // accent stripe
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w: 0.08, h, fill: { color: accentColor }, line: { color: accentColor, width: 0 }
  });
  // body
  slide.addShape(pres.shapes.RECTANGLE, {
    x: x + 0.08, y, w: w - 0.08, h,
    fill: { color: fillColor },
    line: { color: C.border, width: 0.5 },
  });
}

// Helper: page outline (left accent border like Genspark)
function pageFrame(slide, accent = C.navy) {
  slide.background = { color: C.bg };
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.18, h: H,
    fill: { color: accent }, line: { color: accent, width: 0 }
  });
}

// Helper: page title block
function pageTitle(slide, title, subtitle) {
  slide.addText(title, {
    x: 0.6, y: 0.35, w: 12, h: 0.75,
    fontFace: FONT_T, fontSize: 30, bold: true, color: C.dark, margin: 0,
  });
  slide.addText(subtitle, {
    x: 0.6, y: 1.05, w: 12, h: 0.4,
    fontFace: FONT_B, fontSize: 13, color: C.muted, margin: 0,
  });
  // separator
  slide.addShape(pres.shapes.LINE, {
    x: 0.6, y: 1.55, w: 12.1, h: 0,
    line: { color: C.border, width: 0.75 }
  });
}

async function build() {

  // Pre-render icons used multiple times
  const ICN = {
    warn:        await icon(Fa.FaExclamationTriangle, C.red),
    truck:       await icon(Fa.FaTruck, C.blue),
    chart:       await icon(Fa.FaChartLine, C.greenDark),
    handshake:   await icon(Fa.FaHandshake, C.orange),
    coffee:      await icon(Fa.FaCoffee, C.slate),
    trash:       await icon(Fa.FaTrashAlt, C.red),
    cloud:       await icon(Fa.FaCloud, C.slate),
    factory:     await icon(Fa.FaIndustry, C.navy),
    cat:         await icon(Fa.FaCat, C.greenDark),
    leaf:        await icon(Fa.FaLeaf, C.orange),
    balance:     await icon(Fa.FaBalanceScale, C.navy),
    bolt:        await icon(Fa.FaBolt, C.green),
    cloudUp:     await icon(Fa.FaCloudUploadAlt, C.blue),
    store:       await icon(Fa.FaStore, C.slate),
    truckFast:   await icon(Fa.FaTruckMoving, C.red),
    building:    await icon(Fa.FaBuilding, C.blue),
    cogs:        await icon(Fa.FaCogs, C.blue),
    box:         await icon(Fa.FaBoxOpen, C.green),
    check:       await icon(Fa.FaCheckCircle, C.green),
    catG:        await icon(Fa.FaCat, C.green),
    factoryB:    await icon(Fa.FaIndustry, C.blue),
    checkG:      await icon(Fa.FaCheck, C.green),
    cart:        await icon(Fa.FaShoppingCart, C.green),
    chartUp:     await icon(Fa.FaChartLine, C.green),
    fire:        await icon(Fa.FaFire, C.blue),
    hand2:       await icon(Fa.FaHandshake, C.blue),
    shield:      await icon(Fa.FaShieldAlt, C.blue),
    recycle:     await icon(Fa.FaRecycle, C.green),
    wallet:      await icon(Fa.FaWallet, C.blue),
    chip:        await icon(Fa.FaMicrochip, C.orange),
    balG:        await icon(Fa.FaBalanceScale, C.green),
    handG:       await icon(Fa.FaHandshake, C.green),
    bldgB:       await icon(Fa.FaBuilding, C.blue),
    storeG:      await icon(Fa.FaStore, C.green),
    globe:       await icon(Fa.FaGlobeAmericas, C.orange),
    star:        await icon(Fa.FaStar, "FFFFFF"),
    handshakeD:  await icon(Fa.FaHandshake, C.navy),
    coins:       await icon(Fa.FaCoins, C.blue),
    chartPie:    await icon(Fa.FaChartPie, C.green),
    users:       await icon(Fa.FaUsers, C.slate),
    truckPh:     await icon(Fa.FaTruck, C.blue),
    fileSig:     await icon(Fa.FaFileSignature, C.green),
    rocket:      await icon(Fa.FaRocket, C.navy),
    user:        await icon(Fa.FaUserTie, C.green),
    phone:       await icon(Fa.FaPhone, C.green),
    envelope:    await icon(Fa.FaEnvelope, C.green),
    calendar:    await icon(Fa.FaCalendarAlt, C.card),
  };

  // ============================================================
  // SLIDE 1 — Cover
  // ============================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.card };
    // Left dark sidebar (very thin)
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.18, h: H, fill: { color: C.navy }, line: { color: C.navy, width: 0 } });
    // Right gray panel (Genspark cover style)
    s.addShape(pres.shapes.RECTANGLE, { x: 7.0, y: 0, w: 6.3, h: H, fill: { color: "F1F3F5" }, line: { color: "F1F3F5", width: 0 } });

    // Logo
    s.addText("SMARTECOSYS", {
      x: 0.9, y: 0.7, w: 5, h: 0.5, fontFace: FONT_T, fontSize: 22, bold: true, color: C.navy, charSpacing: 1, margin: 0
    });

    // Date
    s.addText("April 2026", {
      x: 11, y: 0.7, w: 2, h: 0.4, fontFace: FONT_B, fontSize: 12, color: C.muted, align: "right", margin: 0
    });

    // Title (rich text - mixed colors)
    s.addText([
      { text: "커피를 마시면 ", options: { color: C.dark, bold: true } },
      { text: "돈", options: { color: C.yellow, bold: true } },
      { text: "이 됩니다", options: { color: C.dark, bold: true } },
    ], { x: 0.9, y: 2.4, w: 6.5, h: 0.95, fontFace: FONT_T, fontSize: 38, margin: 0 });

    s.addText([
      { text: "MGC", options: { color: C.yellow, bold: true } },
      { text: "  X  ", options: { color: C.dark, bold: true } },
      { text: "S.E", options: { color: C.green, bold: true } },
      { text: " 투자 제안서", options: { color: C.dark, bold: true } },
    ], { x: 0.9, y: 3.3, w: 6.5, h: 0.95, fontFace: FONT_T, fontSize: 38, margin: 0 });

    // Subtitle
    s.addText("프랜차이즈 역물류 기반 순환경제 및 ESG 상생 모델", {
      x: 0.9, y: 4.4, w: 6.5, h: 0.4, fontFace: FONT_B, fontSize: 14, color: C.body, margin: 0
    });
    // Green underline accent
    s.addShape(pres.shapes.RECTANGLE, { x: 0.9, y: 4.85, w: 0.6, h: 0.05, fill: { color: C.green }, line: { color: C.green, width: 0 } });

    // Footer info
    s.addText([
      { text: "제안 대상", options: { bold: true, color: C.dark } },
      { text: "    메가커피 대표이사 및 경영진", options: { color: C.body } },
    ], { x: 0.9, y: 6.3, w: 6, h: 0.35, fontFace: FONT_B, fontSize: 12, margin: 0 });
    s.addText([
      { text: "제출 일자", options: { bold: true, color: C.dark } },
      { text: "    2026년 4월 3일", options: { color: C.body } },
    ], { x: 0.9, y: 6.65, w: 6, h: 0.35, fontFace: FONT_B, fontSize: 12, margin: 0 });

    // Right side illustration card
    s.addShape(pres.shapes.RECTANGLE, {
      x: 7.5, y: 2.4, w: 5.4, h: 2.7, fill: { color: C.card },
      line: { color: C.border, width: 0.5 },
    });
    // Coffee icon
    s.addImage({ data: ICN.coffee, x: 7.85, y: 3.35, w: 0.8, h: 0.8 });
    s.addText("→", { x: 8.7, y: 3.4, w: 0.5, h: 0.7, fontSize: 22, color: C.slate, align: "center", margin: 0 });
    s.addImage({ data: ICN.box, x: 9.15, y: 3.35, w: 0.8, h: 0.8 });
    s.addText("→", { x: 10.0, y: 3.4, w: 0.5, h: 0.7, fontSize: 22, color: C.slate, align: "center", margin: 0 });
    // recycle
    s.addImage({ data: ICN.recycle, x: 10.45, y: 3.35, w: 0.8, h: 0.8 });
    // Branch arrows
    s.addText("→", { x: 11.25, y: 2.95, w: 0.5, h: 0.6, fontSize: 18, color: C.slate, align: "center", margin: 0 });
    s.addText("→", { x: 11.25, y: 3.85, w: 0.5, h: 0.6, fontSize: 18, color: C.slate, align: "center", margin: 0 });
    // cat litter
    s.addImage({ data: ICN.cat, x: 11.75, y: 2.85, w: 0.55, h: 0.55 });
    s.addText("고양이 모래", { x: 11.5, y: 3.4, w: 1.4, h: 0.3, fontSize: 9, color: C.body, align: "center", margin: 0 });
    // bio fuel
    s.addImage({ data: ICN.fire, x: 11.75, y: 4.1, w: 0.55, h: 0.55 });
    s.addText("바이오 연료", { x: 11.5, y: 4.65, w: 1.4, h: 0.3, fontSize: 9, color: C.body, align: "center", margin: 0 });

    // Caption under coffee
    s.addText("커피찌꺼기", { x: 8.85, y: 4.2, w: 1.5, h: 0.3, fontSize: 9, color: C.muted, align: "center", margin: 0 });
  }

  // ============================================================
  // SLIDE 2 — Executive Summary (4 quadrants)
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.navy);
    pageTitle(s, "Executive Summary", "스마트에코시스 투자 제안 핵심 요약");

    const cardW = 5.95, cardH = 2.55;
    const left = 0.6, right = 6.75;
    const top = 1.85, bot = 4.55;

    // Quadrant data
    const quads = [
      { x: left, y: top, color: C.red, fill: C.redSoft, ico: ICN.warn, title: "문제 (Problem)", items: [
        ["막대한 폐기 비용:", " 연 40만 톤 배출, 처리비 600억+ 및 메탄 배출"],
        ["물류비 병목:", " 기존 3PL 수거 시 물류비가 제조원가의 1/3 차지"],
        ["구조적 한계:", " 산발적 가맹점 배출로 개별 수거 경제성 결여"],
      ]},
      { x: right, y: top, color: C.blue, fill: C.blueSoft, ico: ICN.truck, title: "해법 (Solution)", items: [
        ["역물류 네트워크:", " 빈 회항 차량(Empty Backhaul) 활용 수거망 구축"],
        ["IoT 데이터 기반:", " 수거 어플로 중량 실시간 관리 및 노선 최적화"],
        ["비용 혁신:", " 원재료 수거 물류비 ~90% 절감으로 초격차 달성"],
      ]},
      { x: left, y: bot, color: C.green, fill: C.greenSoft, ico: ICN.chart, title: "수익 (Revenue & Product)", items: [
        ["B2C 고마진 캐시카우:", " 프리미엄 식물성 고양이 모래 (글로벌 시장 고속 성장)"],
        ["B2B 안정적 대량수요:", " 고효율 바이오 고형연료 (5,649 kcal/kg, 발전소 장기공급)"],
        ["원가 경쟁력:", " 0에 수렴하는 원재료비 기반 압도적 이익률"],
      ]},
      { x: right, y: bot, color: C.orange, fill: C.orangeSoft, ico: ICN.handshake, title: "제안 (Ask)", items: [
        ["전략적 파트너십:", " 스마트에코시스 지분 투자 및 순방향 물류망 역방향 개방"],
        ["본사 혜택:", " 선도적 ESG 공시(Scope 3 감축), 브랜드 가치 상승, 투자 수익"],
        ["가맹점 혜택:", " 폐기물 봉투 비용 절감 및 자원순환 매장 타이틀 확보"],
      ]},
    ];

    for (const q of quads) {
      // light fill background
      card(s, q.x, q.y, cardW, cardH, q.color, q.fill);
      // icon
      s.addImage({ data: q.ico, x: q.x + 0.28, y: q.y + 0.25, w: 0.42, h: 0.42 });
      // title
      s.addText(q.title, {
        x: q.x + 0.85, y: q.y + 0.2, w: cardW - 1, h: 0.5,
        fontFace: FONT_T, fontSize: 18, bold: true, color: C.dark, margin: 0
      });
      // bullets
      const runs = [];
      q.items.forEach((it, i) => {
        runs.push({ text: it[0], options: { bold: true, color: C.dark, bullet: { code: "25CF" } } });
        runs.push({ text: it[1], options: { color: C.body, breakLine: i < q.items.length - 1 } });
      });
      s.addText(runs, {
        x: q.x + 0.35, y: q.y + 0.85, w: cardW - 0.55, h: cardH - 1.0,
        fontFace: FONT_B, fontSize: 11, paraSpaceAfter: 6, margin: 0,
      });
    }
  }

  // ============================================================
  // SLIDE 3 — 문제 정의
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.red);
    pageTitle(s, "문제 정의: 커피박 폐기물의 구조적 병목", "폭발적 소비 이면의 환경적·재무적 외부효과 및 물류비 한계");

    // 3 stat cards
    const stats = [
      { x: 0.6,  ico: ICN.coffee, accent: C.blue, title: "압도적 커피 소비량", num: "405", unit: "잔/년", desc: "한국 1인당 연간 소비량\n(글로벌 평균 152잔 대비 2.6배)" },
      { x: 4.95, ico: ICN.trash, accent: C.red, title: "기하급수적 폐기량", num: "40", unit: "만 톤", desc: "2025년 기준 연간 커피박 배출량(잔당 약\n38~40g 즉시 폐기)" },
      { x: 9.3,  ico: ICN.cloud, accent: C.orange, title: "막대한 재무/환경 비용", num: "600", unit: "억 원+", desc: "순수 매립/소각 처리 비용\n(메탄 배출로 인한 Scope 3 리스크)" },
    ];
    for (const st of stats) {
      card(s, st.x, 1.85, 4.05, 2.2, st.accent, C.card);
      s.addImage({ data: st.ico, x: st.x + 0.25, y: 2.0, w: 0.4, h: 0.4 });
      s.addText(st.title, { x: st.x + 0.75, y: 1.95, w: 3.2, h: 0.4, fontFace: FONT_T, fontSize: 13, bold: true, color: C.dark, margin: 0 });
      s.addText([
        { text: st.num, options: { fontSize: 36, bold: true, color: C.dark } },
        { text: " " + st.unit, options: { fontSize: 14, bold: true, color: C.dark } },
      ], { x: st.x + 0.25, y: 2.5, w: 3.7, h: 0.7, fontFace: FONT_T, margin: 0 });
      s.addText(st.desc, { x: st.x + 0.25, y: 3.25, w: 3.7, h: 0.7, fontFace: FONT_B, fontSize: 10, color: C.muted, margin: 0 });
    }

    // Bottom: chart placeholder + donut
    // Left bar chart
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 4.25, w: 6.0, h: 2.95, fill: { color: C.card }, line: { color: C.border, width: 0.5 } });
    s.addText("국내 커피박 폐기물 발생 추이", { x: 0.8, y: 4.35, w: 5.6, h: 0.4, fontFace: FONT_T, fontSize: 13, bold: true, color: C.dark, margin: 0 });
    s.addChart(pres.charts.BAR, [{
      name: "발생량(만 톤)",
      labels: ["2016", "2017", "2018", "2019", "2023(E)"],
      values: [12, 13, 15, 17, 22],
    }], {
      x: 0.7, y: 4.8, w: 5.8, h: 2.35, barDir: "col",
      chartColors: ["475569"],
      chartArea: { fill: { color: "FFFFFF" } },
      catAxisLabelColor: "64748B", valAxisLabelColor: "64748B",
      catAxisLabelFontSize: 9, valAxisLabelFontSize: 9,
      valGridLine: { color: "E2E8F0", size: 0.5 },
      catGridLine: { style: "none" },
      showLegend: false,
    });

    // Right donut
    s.addShape(pres.shapes.RECTANGLE, { x: 6.85, y: 4.25, w: 6.05, h: 2.95, fill: { color: C.card }, line: { color: C.border, width: 0.5 } });
    s.addImage({ data: ICN.warn, x: 7.0, y: 4.36, w: 0.28, h: 0.28 });
    s.addText("치명적 병목: 기존 3PL 수거의 경제성 결여", { x: 7.35, y: 4.32, w: 5.5, h: 0.4, fontFace: FONT_T, fontSize: 13, bold: true, color: C.dark, margin: 0 });
    s.addText("수분 함량이 높은 커피박 특성상, 독립 물류망 가동 시 원가 압박 심화", { x: 7.0, y: 4.7, w: 5.85, h: 0.3, fontFace: FONT_B, fontSize: 9, color: C.muted, margin: 0 });

    s.addChart(pres.charts.DOUGHNUT, [{
      name: "비용구조",
      labels: ["수거 물류비 (33%)", "건조/가공 에너지 (45%)", "포장 및 기타 (22%)"],
      values: [33, 45, 22],
    }], {
      x: 7.0, y: 4.95, w: 3.2, h: 2.2,
      chartColors: ["DC2626", "0F1E3D", "94A3B8"],
      chartArea: { fill: { color: "FFFFFF" } },
      showLegend: false, holeSize: 60,
    });
    // Custom legend
    const lg = [
      { c: "DC2626", t: "수거 물류비 (33%)" },
      { c: "0F1E3D", t: "건조/가공 에너지 (45%)" },
      { c: "94A3B8", t: "포장 및 기타 (22%)" },
    ];
    lg.forEach((l, i) => {
      s.addShape(pres.shapes.RECTANGLE, { x: 10.3, y: 5.1 + i * 0.35, w: 0.18, h: 0.18, fill: { color: l.c }, line: { color: l.c, width: 0 } });
      s.addText(l.t, { x: 10.55, y: 5.05 + i * 0.35, w: 2.3, h: 0.3, fontFace: FONT_B, fontSize: 9, color: C.dark, bold: true, margin: 0 });
    });
    // Red callout
    s.addShape(pres.shapes.RECTANGLE, { x: 10.3, y: 6.25, w: 2.55, h: 0.85, fill: { color: "FEF2F2" }, line: { color: "FCA5A5", width: 0.5 } });
    s.addText("제조원가(COGS)의\n1/3이 물류비로 소멸되어\n채산성 확보 불가", { x: 10.35, y: 6.27, w: 2.45, h: 0.83, fontFace: FONT_B, fontSize: 8.5, color: C.red, bold: true, align: "center", margin: 0 });
  }

  // ============================================================
  // SLIDE 4 — 시장 기회
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.green);
    pageTitle(s, "시장 기회: 규제 순풍 × 수요 급증", "2022년 제도 개선과 고부가가치 소비재/산업재 시장 성장의 완벽한 교집합");

    // 2x2 matrix on left, side panel on right
    const matX = 0.6, matY = 1.85, cellW = 4.5, cellH = 2.55;
    const cells = [
      { x: matX, y: matY,            color: C.navy,   ico: ICN.factory, title: "B2B 산업재: 바이오 연료", items: [
        ["압도적 효율:", " 발열량 5,649 kcal/kg (목재 펠릿 대비 약 2배 고효율)"],
        ["안정적 수요:", " 발전소 RPS(신재생에너지 의무할당제) 및 바이오매스 혼소 장기 계약"],
        ["매출 하방 경직성:", " 대규모 물량 소화"],
      ]},
      { x: matX + cellW + 0.15, y: matY,            color: C.green,  ico: ICN.cat,     title: "B2C 소비재: 고양이 모래", items: [
        ["초고속 성장:", " 글로벌 76.6억 달러 규모 전망 ('31년, CAGR 4.14%)"],
        ["트렌드 부합:", " 식물성 혼합 소재 및 경량화(DTC 택배 최적화) 선호도 급증"],
        ["초고마진 창출:", " 0원 원물 기반 캐시카우"],
      ]},
      { x: matX, y: matY + cellH + 0.15, color: C.orange, ico: ICN.leaf,    title: "메가 트렌드: ESG 경영", items: [
        ["공급망 배출 규제:", " 프랜차이즈 간접배출(Scope 3) 감축 압박 심화"],
        ["브랜드 자산:", " 친환경 기업 이미지 선점 및 평판 지수 제고 필수"],
        ["투자자 요구:", " 글로벌 자본의 순환경제 전환 포트폴리오 비중 확대"],
      ]},
      { x: matX + cellW + 0.15, y: matY + cellH + 0.15, color: C.blue,   ico: ICN.balance, title: "2022 규제 혁신 & 합법화", items: [
        ["'순환자원' 인정:", " 환경부 심의 통과로 폐기물 분류에서 제외"],
        ["물류망 개방:", " 재활용 허가 없는 '일반 화물 차량' 수거 합법화 승인"],
        ["결정적 명분:", " 프랜차이즈 역물류 도입을 위한 완벽한 법적 기반 마련"],
      ]},
    ];
    for (const c of cells) {
      // top accent border
      s.addShape(pres.shapes.RECTANGLE, { x: c.x, y: c.y, w: cellW, h: 0.1, fill: { color: c.color }, line: { color: c.color, width: 0 } });
      s.addShape(pres.shapes.RECTANGLE, { x: c.x, y: c.y + 0.1, w: cellW, h: cellH - 0.1, fill: { color: C.card }, line: { color: C.border, width: 0.5 } });
      s.addImage({ data: c.ico, x: c.x + 0.25, y: c.y + 0.32, w: 0.34, h: 0.34 });
      s.addText(c.title, { x: c.x + 0.7, y: c.y + 0.27, w: cellW - 0.8, h: 0.45, fontFace: FONT_T, fontSize: 14, bold: true, color: C.dark, margin: 0 });
      const runs = [];
      c.items.forEach((it, i) => {
        runs.push({ text: it[0], options: { bold: true, color: C.dark, bullet: { code: "25CF" } } });
        runs.push({ text: it[1], options: { color: C.body, breakLine: i < c.items.length - 1 } });
      });
      s.addText(runs, { x: c.x + 0.3, y: c.y + 0.85, w: cellW - 0.5, h: cellH - 1.0, fontFace: FONT_B, fontSize: 10, paraSpaceAfter: 5, margin: 0 });
    }

    // Axis labels (subtle) — placed within the matrix gutter so they don't overlap cards
    s.addText("비즈니스 임팩트 ▲", { x: 5.0, y: 1.55, w: 2.4, h: 0.28, fontSize: 8, color: C.light, italic: true, align: "center", margin: 0 });
    s.addText("◀ 시장 성숙도 ▶", { x: 5.0, y: 4.42, w: 2.4, h: 0.28, fontSize: 8, color: C.light, italic: true, align: "center", margin: 0 });

    // Right side dark panel
    const px = 9.85, py = 1.85, pw = 3.05, ph = 5.25;
    s.addShape(pres.shapes.RECTANGLE, { x: px, y: py, w: pw, h: ph, fill: { color: C.navy }, line: { color: C.navy, width: 0 } });
    s.addImage({ data: ICN.bolt, x: px + 0.3, y: py + 0.3, w: 0.4, h: 0.4 });
    s.addText("시장 선점을 위한\n최적의 골든타임", {
      x: px + 0.3, y: py + 0.85, w: pw - 0.6, h: 1.0, fontFace: FONT_T, fontSize: 18, bold: true, color: "FFFFFF", margin: 0
    });
    s.addShape(pres.shapes.RECTANGLE, { x: px + 0.3, y: py + 1.95, w: 0.5, h: 0.04, fill: { color: C.green }, line: { color: C.green, width: 0 } });
    s.addText("규제 철폐(2022)로 합법화된 역물류망을 최초로 구축하고, 폭발하는 친환경 시장 수요를 흡수할 수 있는 완벽한 거시적 환경이 조성되었습니다.", {
      x: px + 0.3, y: py + 2.15, w: pw - 0.6, h: 1.4, fontFace: FONT_B, fontSize: 10.5, color: "CBD5E1", margin: 0,
    });
    s.addText([
      { text: "이는 프랜차이즈 본사에게 비용 없이 ESG 리더십을 확보할 수 있는 ", options: { color: "CBD5E1" } },
      { text: "유일무이한 전략적 기회", options: { color: C.green, bold: true } },
      { text: "입니다.", options: { color: "CBD5E1" } },
    ], { x: px + 0.3, y: py + 3.6, w: pw - 0.6, h: 1.5, fontFace: FONT_B, fontSize: 10.5, margin: 0 });
  }

  // ============================================================
  // SLIDE 5 — Solution
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.blue);
    pageTitle(s, "솔루션: 프랜차이즈 역물류 + IoT 최적화", "빈 회항 차량(Empty Backhaul)과 데이터 알고리즘을 결합한 한계비용 제로(0) 수거망");

    // Top dashed data loop banner
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.85, w: 12.3, h: 1.0, fill: { color: C.blueSoft }, line: { color: C.blue, width: 1, dashType: "dash" } });
    s.addImage({ data: ICN.cloudUp, x: 0.85, y: 2.05, w: 0.5, h: 0.5 });
    s.addText("[데이터 루프] 사물인터넷(IoT) 및 중앙 통제 알고리즘", { x: 1.5, y: 1.95, w: 11, h: 0.4, fontFace: FONT_T, fontSize: 14, bold: true, color: C.dark, margin: 0 });
    s.addText("매장 배출 데이터 실시간 수집 → 수분 함량 기반 '건조중량값' 자동 환산 → 프랜차이즈 배송 차량의 잔여 적재 공간 매칭 및 최적 수거 노선 도출", {
      x: 1.5, y: 2.4, w: 11.3, h: 0.4, fontFace: FONT_B, fontSize: 10.5, color: C.body, margin: 0
    });

    // Down arrows from banner
    s.addText("↓", { x: 1.7, y: 2.95, w: 0.4, h: 0.4, fontSize: 18, color: C.blue, align: "center", margin: 0 });
    s.addText("↓", { x: 4.25, y: 2.95, w: 0.4, h: 0.4, fontSize: 18, color: C.blue, align: "center", margin: 0 });

    // 5 step cards
    const sx = 0.6, sy = 3.45, sw = 2.42, sh = 3.0, gap = 0.05;
    const steps = [
      { num: "1", color: "94A3B8", ico: ICN.store, title: "매장 보관", items: [
        "스마트 보관 용기 비치",
        "중량 및 함수율 정밀 측정 센서 작동",
        "커피박 부패 임계 시간 사전 모니터링",
      ]},
      { num: "2", color: C.red, ico: ICN.truckFast, title: "역물류 수거", items: [
        ["빈 회항차량 적재", true],
        "운행거리/기사배차 추가 없음",
        ["한계 운송비 0 수렴", true],
      ], highlight: true },
      { num: "3", color: C.blueDark, ico: ICN.building, title: "허브 집하", items: [
        "지역 물류 거점(Terminal) 집하",
        "대량 화물화 처리",
        "공장 단거리 일괄 이송 (크로스 도킹)",
      ]},
      { num: "4", color: C.blue, ico: ICN.cogs, title: "자원화 공정", items: [
        "스마트에코시스 플랜트 반입",
        "원료 함수율 균일화",
        "가열/건조 비용 선제적 통제",
      ]},
      { num: "5", color: C.green, ico: ICN.box, title: "제품 출하", items: [
        "펠릿화 압출 성형",
        ["B2C:", " 식물성 모래"],
        ["B2B:", " 바이오 연료"],
      ]},
    ];

    steps.forEach((st, i) => {
      const x = sx + i * (sw + gap);
      // card bg (highlight step 2 in red soft)
      const bg = st.highlight ? C.redSoft : C.card;
      s.addShape(pres.shapes.RECTANGLE, { x, y: sy, w: sw, h: sh, fill: { color: bg }, line: { color: st.highlight ? "FCA5A5" : C.border, width: 0.75 } });
      // number circle
      s.addShape(pres.shapes.OVAL, { x: x + 0.15, y: sy + 0.15, w: 0.42, h: 0.42, fill: { color: st.color }, line: { color: st.color, width: 0 } });
      s.addText(st.num, { x: x + 0.15, y: sy + 0.16, w: 0.42, h: 0.42, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
      // icon
      s.addImage({ data: st.ico, x: x + sw / 2 - 0.3, y: sy + 0.7, w: 0.6, h: 0.6 });
      // title
      s.addText(st.title, { x, y: sy + 1.4, w: sw, h: 0.4, fontFace: FONT_T, fontSize: 13, bold: true, color: C.dark, align: "center", margin: 0 });
      // items
      const runs = [];
      st.items.forEach((it, j) => {
        if (Array.isArray(it)) {
          if (it.length === 2 && it[1] === true) {
            // highlighted single
            runs.push({ text: it[0], options: { bold: true, color: C.red, bullet: { code: "25CF" }, breakLine: j < st.items.length - 1 } });
          } else {
            runs.push({ text: it[0], options: { bold: true, color: C.dark, bullet: { code: "25CF" } } });
            runs.push({ text: it[1], options: { color: C.body, breakLine: j < st.items.length - 1 } });
          }
        } else {
          runs.push({ text: it, options: { color: C.body, bullet: { code: "25CF" }, breakLine: j < st.items.length - 1 } });
        }
      });
      s.addText(runs, { x: x + 0.18, y: sy + 1.85, w: sw - 0.3, h: sh - 2.0, fontFace: FONT_B, fontSize: 9.5, paraSpaceAfter: 4, margin: 0 });
    });

    // Connecting arrows between steps
    for (let i = 0; i < 4; i++) {
      const ax = sx + (i + 1) * (sw + gap) - 0.05;
      s.addText("›", { x: ax - 0.2, y: sy + 1.35, w: 0.4, h: 0.4, fontSize: 22, color: C.light, align: "center", bold: true, margin: 0 });
    }

    // Bottom dark banner
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 6.65, w: 12.3, h: 0.65, fill: { color: C.navy }, line: { color: C.navy, width: 0 } });
    s.addImage({ data: ICN.check, x: 0.85, y: 6.78, w: 0.4, h: 0.4 });
    s.addText([
      { text: "강력한 기술적 해자(Moat): ", options: { bold: true, color: C.green } },
      { text: "물류비 90% 이상 획기적 절감 및 공정 내 건조 에너지 낭비 사전 차단 → ", options: { color: "CBD5E1" } },
      { text: "완벽한 제조 원가(COGS) 통제", options: { bold: true, color: C.green } },
    ], { x: 1.35, y: 6.75, w: 11.5, h: 0.5, fontFace: FONT_B, fontSize: 11, margin: 0 });
  }

  // ============================================================
  // SLIDE 6 — Business Model: Dual Portfolio
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.navy);
    pageTitle(s, "비즈니스 모델: 듀얼 포트폴리오 가치 창출", "초저원가 원물을 활용한 B2C 고수익 소비재와 B2B 안정적 산업재의 상호 보완적 성장 엔진");

    // Two big cards
    const cards = [
      { x: 0.6, color: C.green, ico: ICN.catG, badge: "Profit Engine", badgeColor: C.greenSoft, badgeText: C.greenDark,
        title: "B2C | 식물성 고양이 모래", subtitle: "Premium Plant-based Cat Litter",
        items: [
          { icoColor: C.green, ico: ICN.checkG, title: "핵심 가치 (USP)", desc: "커피 원두의 다공성 구조를 활용한 강력한 암모니아 탈취력 및 식물성 천연 응집력 확보 (화학 향료 무첨가)" },
          { icoColor: C.green, ico: ICN.cart, title: "유통 채널 전략", desc: "비중이 낮은 경량화 특성을 기반으로 물류비를 절감하여 온라인 소비자 직접 판매(DTC) 및 정기 구독 모델에 최적화" },
          { icoColor: C.green, ico: ICN.chartUp, title: "재무적 기여도", desc: "초고속 성장 시장(CAGR 4.14%) 내 진입하여 0원 원가 기반의 전사 최고 수준 영업이익률(마진) 견인", boldTail: "영업이익률(마진)" },
        ]
      },
      { x: 6.95, color: C.blue, ico: ICN.factoryB, badge: "Scale Engine", badgeColor: C.blueSoft, badgeText: C.blueDark,
        title: "B2B | 바이오 고형연료", subtitle: "Solid Bio-Fuel for Industry",
        items: [
          { icoColor: C.blue, ico: ICN.fire, title: "압도적 에너지 효율", desc: "1kg당 5,649kcal의 고효율 발열량 입증 (일반 목재 가공 부산물 펠릿 대비 약 2배 우수한 초고효율 바이오매스)" },
          { icoColor: C.blue, ico: ICN.hand2, title: "타겟 고객 & 계약 구조", desc: "탄소 규제 및 RPS(신재생에너지) 의무화 대응이 시급한 화력 발전 공기업 및 대규모 열병합 시설 대상 혼소 연료 공급" },
          { icoColor: C.blue, ico: ICN.shield, title: "재무적 기여도", desc: "장기 공급 계약(Long-term Contract)을 통해 대규모 물량을 지속 소화하며 전사 수익의 하방 경직성(캐시카우) 확보" },
        ]
      },
    ];

    const cw = 5.7, ch = 5.0;
    cards.forEach(card => {
      const x = card.x, y = 1.95;
      // top accent
      s.addShape(pres.shapes.RECTANGLE, { x, y, w: cw, h: 0.1, fill: { color: card.color }, line: { color: card.color, width: 0 } });
      s.addShape(pres.shapes.RECTANGLE, { x, y: y + 0.1, w: cw, h: ch - 0.1, fill: { color: C.card }, line: { color: C.border, width: 0.5 } });

      // Header row
      s.addImage({ data: card.ico, x: x + 0.3, y: y + 0.4, w: 0.55, h: 0.55 });
      s.addText(card.title, { x: x + 1.0, y: y + 0.35, w: 3.5, h: 0.45, fontFace: FONT_T, fontSize: 17, bold: true, color: C.dark, margin: 0 });
      s.addText(card.subtitle, { x: x + 1.0, y: y + 0.78, w: 3.5, h: 0.35, fontFace: FONT_B, fontSize: 11, color: C.muted, margin: 0 });
      // badge
      s.addShape(pres.shapes.RECTANGLE, { x: x + cw - 1.4, y: y + 0.45, w: 1.2, h: 0.38, fill: { color: card.badgeColor }, line: { color: card.badgeColor, width: 0 } });
      s.addText(card.badge, { x: x + cw - 1.4, y: y + 0.45, w: 1.2, h: 0.38, fontSize: 10, bold: true, color: card.badgeText, align: "center", valign: "middle", margin: 0 });

      // separator
      s.addShape(pres.shapes.LINE, { x: x + 0.3, y: y + 1.3, w: cw - 0.6, h: 0, line: { color: C.border, width: 0.5 } });

      // 3 items
      card.items.forEach((it, i) => {
        const iy = y + 1.5 + i * 1.13;
        s.addImage({ data: it.ico, x: x + 0.3, y: iy + 0.05, w: 0.3, h: 0.3 });
        s.addText(it.title, { x: x + 0.7, y: iy, w: cw - 0.9, h: 0.35, fontFace: FONT_T, fontSize: 12, bold: true, color: C.dark, margin: 0 });
        s.addText(it.desc, { x: x + 0.7, y: iy + 0.35, w: cw - 0.9, h: 0.7, fontFace: FONT_B, fontSize: 10, color: C.body, margin: 0 });
      });
    });

    // Bottom dark banner
    s.addShape(pres.shapes.RECTANGLE, { x: 2.4, y: 6.95, w: 8.5, h: 0.55, fill: { color: C.navy }, line: { color: C.navy, width: 0 } });
    s.addImage({ data: ICN.recycle, x: 2.7, y: 7.05, w: 0.32, h: 0.32 });
    s.addText([
      { text: "프랜차이즈 역물류망 연계 ", options: { color: "FFFFFF" } },
      { text: "한계운송비 제로(0) 수렴 ", options: { color: C.green, bold: true } },
      { text: "원재료 조달", options: { color: "FFFFFF" } },
    ], { x: 3.1, y: 7.0, w: 7.7, h: 0.5, fontFace: FONT_B, fontSize: 12, bold: true, align: "center", margin: 0 });
  }

  // ============================================================
  // SLIDE 7 — Competitive Advantage
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.green);
    pageTitle(s, "경쟁 우위: 3가지 초격차 요소", "역물류 혁신과 독보적 기술력, 그리고 규제 선점으로 완성한 견고한 진입장벽");

    // Top dark header
    s.addShape(pres.shapes.RECTANGLE, { x: 1.6, y: 1.95, w: 10.1, h: 0.6, fill: { color: C.navy }, line: { color: C.navy, width: 0 } });
    s.addText("스마트에코시스 핵심 경쟁력 (Moat)", { x: 1.6, y: 1.97, w: 10.1, h: 0.55, fontFace: FONT_T, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });

    // 3 columns
    const cols = [
      { x: 1.6, ico: ICN.wallet, color: C.blue, title: "초저원가 구조", items: [
        { h: "역물류 네트워크 통합", d: "수거 물류비 90% 이상 절감" },
        { h: "한계 운송비 제로(0)", d: "압도적인 제조 원가 우위 선점" },
      ]},
      { x: 4.95, ico: ICN.balG, color: C.green, title: "규제 컴플라이언스", items: [
        { h: "환경부 제도 개선 (2022)", d: "커피박 '순환자원' 공식 인정 획득" },
        { h: "수거망 합법화 완료", d: "일반 화물 차량 운반/적재 완벽 대응" },
      ]},
      { x: 8.3, ico: ICN.chip, color: C.orange, title: "데이터 및 특허 기술", items: [
        { h: "IoT 스마트 센서 연동", d: "실시간 중량 및 함수율 정밀 제어" },
        { h: "특허 기반 알고리즘", d: "건조중량 환산 및 최적 노선 도출" },
      ]},
    ];

    cols.forEach(c => {
      // card
      s.addShape(pres.shapes.RECTANGLE, { x: c.x, y: 2.65, w: 3.4, h: 3.6, fill: { color: C.card }, line: { color: C.border, width: 0.5 } });
      // icon circle
      s.addShape(pres.shapes.OVAL, { x: c.x + 1.4, y: 2.95, w: 0.6, h: 0.6, fill: { color: c.color + "20" === c.color + "20" ? "F1F5F9" : "F1F5F9" }, line: { color: C.border, width: 0.5 } });
      s.addImage({ data: c.ico, x: c.x + 1.5, y: 3.05, w: 0.4, h: 0.4 });
      // title
      s.addText(c.title, { x: c.x, y: 3.7, w: 3.4, h: 0.45, fontFace: FONT_T, fontSize: 16, bold: true, color: c.color, align: "center", margin: 0 });
      // separator
      s.addShape(pres.shapes.LINE, { x: c.x + 0.5, y: 4.2, w: 2.4, h: 0, line: { color: C.border, width: 0.75 } });
      // items
      c.items.forEach((it, i) => {
        const iy = 4.4 + i * 0.85;
        s.addText(it.h, { x: c.x + 0.2, y: iy, w: 3.0, h: 0.3, fontFace: FONT_B, fontSize: 11, bold: true, color: C.dark, align: "center", margin: 0 });
        s.addText(it.d, { x: c.x + 0.2, y: iy + 0.3, w: 3.0, h: 0.4, fontFace: FONT_B, fontSize: 10, color: C.muted, align: "center", margin: 0 });
      });
    });

    // Bottom dark banner
    s.addShape(pres.shapes.RECTANGLE, { x: 1.6, y: 6.55, w: 10.1, h: 0.7, fill: { color: C.navy }, line: { color: C.navy, width: 0 } });
    s.addImage({ data: ICN.handG, x: 1.85, y: 6.7, w: 0.4, h: 0.4 });
    s.addText([
      { text: "본사·가맹점·사회가 함께 성장하는 ", options: { color: "FFFFFF" } },
      { text: "상생 파트너십 및 공동 ESG 브랜딩 자산 확보", options: { color: C.green, bold: true } },
    ], { x: 2.4, y: 6.65, w: 9.2, h: 0.55, fontFace: FONT_B, fontSize: 13, bold: true, align: "center", valign: "middle", margin: 0 });
  }

  // ============================================================
  // SLIDE 8 — Financial Outlook
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.navy);
    pageTitle(s, "재무 전망: 스케일에 따른 수익성 개선", "파일럿 검증을 거쳐 전국망 확장 시 물류비 제로(0) 효과에 따른 폭발적인 EBITDA 성장");

    // Left chart card
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.85, w: 7.7, h: 3.95, fill: { color: C.card }, line: { color: C.border, width: 0.5 } });
    s.addText("매출 및 EBITDA 성장 추이 (추정)", { x: 0.8, y: 1.95, w: 7.4, h: 0.4, fontFace: FONT_T, fontSize: 13, bold: true, color: C.dark, margin: 0 });

    // Combo chart: bars (Revenue) + line (EBITDA Margin)
    const yrLabels = ["Year 1 (Pilot)", "Year 2 (Regional)", "Year 3 (National)", "Year 4", "Year 5"];
    s.addChart(
      [
        { type: pres.charts.BAR,
          data: [{ name: "Revenue (M KRW)", labels: yrLabels, values: [1500, 4500, 12000, 21000, 34000] }],
          options: { barDir: "col", chartColors: ["1E3A8A"], barGrouping: "standard" } },
        { type: pres.charts.LINE,
          data: [{ name: "EBITDA Margin (%)", labels: yrLabels, values: [5, 18, 32, 38, 42] }],
          options: { chartColors: ["10B981"], lineSize: 3, lineSmooth: true,
            lineDataSymbol: "circle", lineDataSymbolSize: 8,
            secondaryValAxis: true, secondaryCatAxis: true } },
      ],
      {
        x: 0.7, y: 2.4, w: 7.5, h: 3.0,
        chartArea: { fill: { color: "FFFFFF" } },
        catAxisLabelColor: "64748B", valAxisLabelColor: "64748B",
        catAxisLabelFontSize: 9, valAxisLabelFontSize: 9,
        valAxes: [
          { showValAxisTitle: false, valGridLine: { color: "E2E8F0", size: 0.5 }, valAxisLabelColor: "64748B", valAxisLabelFontSize: 9 },
          { showValAxisTitle: false, valGridLine: { style: "none" }, valAxisLabelColor: "64748B", valAxisLabelFontSize: 9 },
        ],
        catAxes: [
          { catAxisLabelColor: "64748B", catAxisLabelFontSize: 9 },
          { catAxisHidden: true },
        ],
        catGridLine: { style: "none" },
        showLegend: false,
      }
    );
    // Custom legend dots
    s.addShape(pres.shapes.OVAL, { x: 2.7, y: 5.5, w: 0.18, h: 0.18, fill: { color: "10B981" }, line: { color: "10B981", width: 1.5 } });
    s.addText("EBITDA Margin (%)", { x: 2.95, y: 5.45, w: 1.9, h: 0.3, fontSize: 9, color: C.dark, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 4.95, y: 5.52, w: 0.18, h: 0.14, fill: { color: "1E3A8A" }, line: { color: "1E3A8A", width: 0 } });
    s.addText("Revenue (M KRW)", { x: 5.2, y: 5.45, w: 2.0, h: 0.3, fontSize: 9, color: C.dark, margin: 0 });

    // Right donut card
    s.addShape(pres.shapes.RECTANGLE, { x: 8.55, y: 1.85, w: 4.35, h: 3.95, fill: { color: C.card }, line: { color: C.border, width: 0.5 } });
    s.addText("제조원가(COGS) 구조 혁신", { x: 8.75, y: 1.95, w: 4.0, h: 0.4, fontFace: FONT_T, fontSize: 13, bold: true, color: C.dark, margin: 0 });

    // Donut: improved structure showing red old logistics + green new
    s.addChart(pres.charts.DOUGHNUT, [{
      name: "outer",
      labels: ["원재료", "수거 물류비 (기존 33%)", "건조/가공 에너지", "포장/기타", "수거 물류비 (개선)"],
      values: [20, 28, 25, 17, 10],
    }], {
      x: 8.7, y: 2.4, w: 4.05, h: 2.85,
      chartColors: ["94A3B8", "DC2626", "0F1E3D", "CBD5E1", "10B981"],
      showLegend: false, holeSize: 55,
    });

    // Custom legend grid
    const lgItems = [
      { c: "94A3B8", t: "원재료" },
      { c: "DC2626", t: "수거 물류비 (기존 33%)" },
      { c: "0F1E3D", t: "건조/가공 에너지" },
      { c: "CBD5E1", t: "포장/기타" },
    ];
    lgItems.forEach((l, i) => {
      const cx = i % 2 === 0 ? 8.75 : 10.85;
      const cy = 5.0 + Math.floor(i / 2) * 0.3;
      s.addShape(pres.shapes.RECTANGLE, { x: cx, y: cy + 0.05, w: 0.16, h: 0.16, fill: { color: l.c }, line: { color: l.c, width: 0 } });
      s.addText(l.t, { x: cx + 0.22, y: cy, w: 1.95, h: 0.3, fontSize: 8, color: C.dark, margin: 0 });
    });
    s.addText("안쪽 링: 기존 물류망 / 바깥 링: 스마트에코시스 역물류", { x: 8.7, y: 5.5, w: 4.1, h: 0.3, fontSize: 8, italic: true, bold: true, color: C.red, align: "center", margin: 0 });

    // Bottom 2 boxes
    const bx = [0.6, 6.95];
    const bData = [
      { x: 0.6, color: C.green, fill: C.greenSoft, ico: ICN.catG, title: "B2C 유닛 이코노믹스 (고양이 모래)",
        runs: [
          { text: "LTV/CAC 비율 압도적 우위. 0원 원물 및 경량 배송으로 ", options: { color: C.body } },
          { text: "그로스 마진(Gross Margin) 최대화", options: { color: C.body, bold: true } },
          { text: " 및 DTC 구독 경제 락인(Lock-in)", options: { color: C.body } },
        ]},
      { x: 6.95, color: C.blue, fill: C.blueSoft, ico: ICN.factoryB, title: "B2B 유닛 이코노믹스 (바이오 고형연료)",
        runs: [
          { text: "스케일업에 따른 규모의 경제 달성. 플랜트 가동률 상승에 비례하여 ", options: { color: C.body } },
          { text: "톤당 생산 원가 기하급수적 하락", options: { color: C.body, bold: true } },
          { text: " (장기 계약 기반)", options: { color: C.body } },
        ]},
    ];
    bData.forEach(b => {
      s.addShape(pres.shapes.RECTANGLE, { x: b.x, y: 6.0, w: 5.95, h: 1.25, fill: { color: b.fill }, line: { color: b.color, width: 0.75 } });
      s.addImage({ data: b.ico, x: b.x + 0.25, y: 6.18, w: 0.4, h: 0.4 });
      s.addText(b.title, { x: b.x + 0.75, y: 6.13, w: 5.1, h: 0.4, fontFace: FONT_T, fontSize: 12, bold: true, color: C.dark, margin: 0 });
      s.addText(b.runs, { x: b.x + 0.25, y: 6.55, w: 5.6, h: 0.65, fontFace: FONT_B, fontSize: 10, margin: 0 });
    });
  }

  // ============================================================
  // SLIDE 9 — Investment Proposal (Win-Win-Win)
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.navy);
    pageTitle(s, "투자 제안: Win-Win-Win 상생 구조", "프랜차이즈 본사, 가맹점, 사회가 모두 승리하는 다면적 가치 창출과 전략적 파트너 제안");

    // Left: Venn diagram (3 overlapping circles)
    const cx1 = 2.5, cy1 = 2.6, r = 1.55;
    const cx2 = 4.0, cy2 = 2.6;
    const cx3 = 3.25, cy3 = 4.0;

    // Three circles with transparency
    s.addShape(pres.shapes.OVAL, { x: cx1 - r, y: cy1, w: r * 2, h: r * 2, fill: { color: C.blue, transparency: 80 }, line: { color: C.blue, width: 1.5 } });
    s.addShape(pres.shapes.OVAL, { x: cx2, y: cy2, w: r * 2, h: r * 2, fill: { color: C.green, transparency: 80 }, line: { color: C.green, width: 1.5 } });
    s.addShape(pres.shapes.OVAL, { x: cx3 - r + 0.5, y: cy3, w: r * 2, h: r * 2, fill: { color: C.orange, transparency: 80 }, line: { color: C.orange, width: 1.5 } });

    // Labels for circles
    s.addImage({ data: ICN.bldgB, x: 1.55, y: 2.85, w: 0.35, h: 0.35 });
    s.addText("프랜차이즈 본사", { x: 0.8, y: 3.25, w: 1.85, h: 0.35, fontFace: FONT_T, fontSize: 12, bold: true, color: C.blueDark, align: "center", margin: 0 });
    s.addText("Scope 3 온실가스 감축", { x: 0.7, y: 3.6, w: 2.05, h: 0.3, fontSize: 9, color: C.body, align: "center", margin: 0 });
    s.addText("ESG 평판 1위 달성", { x: 0.7, y: 3.85, w: 2.05, h: 0.3, fontSize: 9, color: C.body, align: "center", margin: 0 });

    s.addImage({ data: ICN.storeG, x: 5.55, y: 2.85, w: 0.35, h: 0.35 });
    s.addText("가맹점주", { x: 4.85, y: 3.25, w: 1.85, h: 0.35, fontFace: FONT_T, fontSize: 12, bold: true, color: C.greenDark, align: "center", margin: 0 });
    s.addText("종량제 폐기 비용 절감", { x: 4.7, y: 3.6, w: 2.15, h: 0.3, fontSize: 9, color: C.body, align: "center", margin: 0 });
    s.addText("친환경 매장 마케팅", { x: 4.7, y: 3.85, w: 2.15, h: 0.3, fontSize: 9, color: C.body, align: "center", margin: 0 });

    s.addImage({ data: ICN.globe, x: 3.55, y: 5.6, w: 0.35, h: 0.35 });
    s.addText("지역 사회", { x: 2.8, y: 6.0, w: 1.85, h: 0.35, fontFace: FONT_T, fontSize: 12, bold: true, color: C.orange, align: "center", margin: 0 });
    s.addText("메테인 가스 발생 차단", { x: 2.65, y: 6.35, w: 2.15, h: 0.3, fontSize: 9, color: C.body, align: "center", margin: 0 });
    s.addText("자원순환 일자리 창출", { x: 2.65, y: 6.6, w: 2.15, h: 0.3, fontSize: 9, color: C.body, align: "center", margin: 0 });

    // Center star
    s.addShape(pres.shapes.OVAL, { x: 3.0, y: 3.55, w: 0.55, h: 0.55, fill: { color: C.dark }, line: { color: C.dark, width: 0 } });
    s.addImage({ data: ICN.star, x: 3.13, y: 3.68, w: 0.3, h: 0.3 });
    s.addText("Win-Win-Win\n가치 창출", { x: 2.45, y: 4.2, w: 1.65, h: 0.5, fontFace: FONT_T, fontSize: 9, bold: true, color: C.dark, align: "center", margin: 0 });

    // Arrow
    s.addText("→", { x: 6.4, y: 4.0, w: 0.5, h: 0.5, fontSize: 22, color: C.light, align: "center", margin: 0 });

    // Right side: 3 cards. Each item is an array of {text, bold} segments.
    const rcards = [
      { y: 1.95, color: C.navy, ico: ICN.handshakeD, title: "전략적 파트너십 및 지분 투자", titleColor: C.dark, items: [
        [{t:"역물류망 개방 및 스마트에코시스 전략적 지분 투자"}],
        [{t:"본사 인프라와 당사 자원화 기술의 결합으로 산업 내 독보적 "},{t:"순환경제 브랜딩 선점",b:true}],
      ]},
      { y: 3.65, color: C.blue, ico: ICN.coins, title: "투자금 활용: 인프라 고도화", titleColor: C.blueDark, items: [
        [{t:"IoT 스마트 보관 용기",b:true},{t:" 전국 가맹점 양산 배치"}],
        [{t:"자원화 플랜트 자동화 설비 증설 (CAPA 확대)"}],
        [{t:"역물류 노선 최적화 데이터 플랫폼 고도화"}],
      ]},
      { y: 5.35, color: C.green, ico: ICN.chartPie, title: "공동 거버넌스 및 성과 연동", titleColor: C.greenDark, items: [
        [{t:"프랜차이즈 본사 - 스마트에코시스 간 "},{t:"ESG 공동 운영위",b:true},{t:" 신설"}],
        [{t:"Scope 3 온실가스(tCO2e)",b:true},{t:" 감축량 및 커피박 회수량 등 공시 가능한 정량적 KPI 데이터 실시간 제공"}],
      ]},
    ];

    rcards.forEach(rc => {
      const x = 6.95, w = 5.95, h = 1.6;
      s.addShape(pres.shapes.RECTANGLE, { x, y: rc.y, w, h, fill: { color: C.card }, line: { color: C.border, width: 0.5 } });
      s.addShape(pres.shapes.RECTANGLE, { x, y: rc.y, w: 0.08, h, fill: { color: rc.color }, line: { color: rc.color, width: 0 } });
      s.addImage({ data: rc.ico, x: x + 0.25, y: rc.y + 0.2, w: 0.4, h: 0.4 });
      s.addText(rc.title, { x: x + 0.75, y: rc.y + 0.15, w: w - 0.85, h: 0.4, fontFace: FONT_T, fontSize: 13, bold: true, color: rc.titleColor, margin: 0 });

      const runs = [];
      rc.items.forEach((segs, i) => {
        segs.forEach((seg, j) => {
          const isFirst = j === 0;
          const isLast = j === segs.length - 1;
          runs.push({
            text: seg.t,
            options: {
              bold: !!seg.b,
              color: seg.b ? C.dark : C.body,
              bullet: isFirst ? { code: "25CF" } : false,
              breakLine: isLast && i < rc.items.length - 1,
            }
          });
        });
      });
      s.addText(runs, { x: x + 0.3, y: rc.y + 0.6, w: w - 0.5, h: h - 0.7, fontFace: FONT_B, fontSize: 9.5, paraSpaceAfter: 3, margin: 0 });
    });
  }

  // ============================================================
  // SLIDE 10 — CTA: 90 day roadmap
  // ============================================================
  {
    const s = pres.addSlide();
    pageFrame(s, C.navy);
    pageTitle(s, "Call to Action: 90일 실행 로드맵", "성공적인 파트너십 구축과 비즈니스 스케일업을 위한 단계별 액션 플랜");

    // Phase pills + timeline
    const phases = [
      { x: 1.2,  pill: "Phase 1 | 0~2주",   pillColor: "94A3B8", num: "1", numColor: "94A3B8", ico: ICN.users,    title: "TF 구성 및 기획", items: [
        "양사 실무진 TF 발족", "가맹점 배출 데이터 공유", "역물류 파일럿(PoC) 설계 및 KPI 합의"
      ]},
      { x: 4.05, pill: "Phase 2 | 4~8주",   pillColor: C.blue,    num: "2", numColor: C.blue,    ico: ICN.truckPh,  title: "파일럿 검증 (PoC)", items: [
        "수도권 50개 점포 대상 IoT 용기 시범 설치", "역물류 수거 및 노선 테스트", "물류비 절감 및 데이터 검증"
      ]},
      { x: 6.9,  pill: "Phase 3 | 9~12주",  pillColor: C.green,   num: "3", numColor: C.green,   ico: ICN.fileSig,  title: "본계약 및 투자 체결", items: [
        "전략적 지분 투자 집행", "전국망 확대를 위한 파트너십 본계약", "공동 친환경 ESG 브랜딩 론칭"
      ]},
      { x: 9.75, pill: "Phase 4 | 12~24M",  pillColor: C.navy,    num: "4", numColor: C.navy,    ico: ICN.rocket,   title: "전국망 스케일업", items: [
        "수거 인프라 전국 500개+ 매장 확대", "플랜트 자동화 설비 증설", "B2B 고형연료 대량 장기계약 체결"
      ]},
    ];

    // Timeline horizontal line
    s.addShape(pres.shapes.LINE, { x: 1.4, y: 2.7, w: 11.4, h: 0, line: { color: C.light, width: 1 } });
    s.addText("›", { x: 12.7, y: 2.55, w: 0.4, h: 0.35, fontSize: 18, color: C.light, bold: true, margin: 0 });

    phases.forEach(p => {
      // pill (rounded rect)
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: p.x, y: 1.85, w: 2.4, h: 0.45, fill: { color: "FFFFFF" }, line: { color: p.pillColor, width: 1 }, rectRadius: 0.22 });
      s.addText(p.pill, { x: p.x, y: 1.85, w: 2.4, h: 0.45, fontSize: 11, bold: true, color: p.pillColor, align: "center", valign: "middle", margin: 0 });
      // timeline number circle
      s.addShape(pres.shapes.OVAL, { x: p.x + 1.05, y: 2.5, w: 0.4, h: 0.4, fill: { color: p.numColor }, line: { color: p.numColor, width: 0 } });
      s.addText(p.num, { x: p.x + 1.05, y: 2.5, w: 0.4, h: 0.4, fontSize: 12, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
      // card with top accent
      s.addShape(pres.shapes.RECTANGLE, { x: p.x - 0.05, y: 3.15, w: 2.5, h: 0.08, fill: { color: p.numColor }, line: { color: p.numColor, width: 0 } });
      s.addShape(pres.shapes.RECTANGLE, { x: p.x - 0.05, y: 3.23, w: 2.5, h: 2.95, fill: { color: C.card }, line: { color: C.border, width: 0.5 } });
      // icon
      s.addImage({ data: p.ico, x: p.x + 1.0, y: 3.45, w: 0.5, h: 0.5 });
      // title
      s.addText(p.title, { x: p.x - 0.05, y: 4.05, w: 2.5, h: 0.4, fontFace: FONT_T, fontSize: 13, bold: true, color: C.dark, align: "center", margin: 0 });
      // bullets
      const runs = [];
      p.items.forEach((it, i) => {
        runs.push({ text: it, options: { color: C.body, bullet: { code: "25CF" }, breakLine: i < p.items.length - 1 } });
      });
      s.addText(runs, { x: p.x + 0.1, y: 4.5, w: 2.3, h: 1.6, fontFace: FONT_B, fontSize: 9.5, paraSpaceAfter: 4, margin: 0 });
    });

    // Bottom CTA banner
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 6.45, w: 12.3, h: 0.85, fill: { color: C.navy }, line: { color: C.navy, width: 0 } });
    s.addText([
      { text: "프랜차이즈 순환경제의 완성을 위해 ", options: { color: "FFFFFF" } },
      { text: "스마트에코시스", options: { color: C.green, bold: true } },
      { text: "와 함께 하십시오.", options: { color: "FFFFFF" } },
    ], { x: 0.85, y: 6.5, w: 8.5, h: 0.45, fontFace: FONT_T, fontSize: 14, bold: true, margin: 0 });

    // contact line
    s.addImage({ data: ICN.user,     x: 0.85, y: 7.0, w: 0.22, h: 0.22 });
    s.addText("전략기획팀장 OOO", { x: 1.1, y: 6.97, w: 2.2, h: 0.3, fontSize: 10, color: "CBD5E1", margin: 0 });
    s.addImage({ data: ICN.phone,    x: 3.4,  y: 7.0, w: 0.22, h: 0.22 });
    s.addText("02-XXX-XXXX", { x: 3.65, y: 6.97, w: 1.8, h: 0.3, fontSize: 10, color: "CBD5E1", margin: 0 });
    s.addImage({ data: ICN.envelope, x: 5.5,  y: 7.0, w: 0.22, h: 0.22 });
    s.addText("contact@smartecosis.com", { x: 5.75, y: 6.97, w: 3.2, h: 0.3, fontSize: 10, color: "CBD5E1", margin: 0 });

    // CTA button
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 10.3, y: 6.6, w: 2.5, h: 0.6, fill: { color: C.green }, line: { color: C.green, width: 0 }, rectRadius: 0.3 });
    s.addImage({ data: ICN.calendar, x: 10.55, y: 6.78, w: 0.24, h: 0.24 });
    s.addText("제안 논의 미팅 예약", { x: 10.85, y: 6.62, w: 1.95, h: 0.55, fontSize: 11, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
  }

  // ========== Save ==========
  await pres.writeFile({ fileName: "C:/SMARTECOSYS/MGC_x_SE_투자제안서.pptx" });
  console.log("DONE");
}

build().catch(e => { console.error(e); process.exit(1); });
