/**
 * Control Architect - UI chrome strings and language resolution.
 *
 * Scenario/content bilingual text lives in game-core.js next to the data it labels. This
 * file only holds fixed interface chrome, shared by 305331 (Thai-first) and 316331
 * (English-only) through the same games-portal. Same technical pattern as
 * social-signal-desk/i18n.js.
 */

const SUPPORTED_LANGS = ["th", "en"];
const DEFAULT_LANG = "en";
const LANG_STORAGE_KEY = "ca_lang";

function resolveLanguage() {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("lang");
    if (fromQuery && SUPPORTED_LANGS.includes(fromQuery)) {
      window.localStorage.setItem(LANG_STORAGE_KEY, fromQuery);
      return fromQuery;
    }
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
  } catch (e) {
    // localStorage or URLSearchParams unavailable (e.g. under Node for tests) - fall through.
  }
  return DEFAULT_LANG;
}

function setLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return DEFAULT_LANG;
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch (e) {
    // Ignore storage failures; the toggle still works for the current page view.
  }
  return lang;
}

const UI_STRINGS = {
  gameTitle: { th: "สถาปนิกระบบควบคุม", en: "Control Architect" },
  gameSubtitle: {
    th: "เลือกหลักการ จัดประเภท control ประกอบ defense in depth และเขียน requirement สำหรับ Student Project Portal",
    en: "Choose principles, classify controls, build layered defenses, and write requirements for the Student Project Portal",
  },
  startPrompt: { th: "กรอกชื่อและรหัสนักศึกษาเพื่อเริ่ม", en: "Enter your name and student ID to begin" },
  nameLabel: { th: "ชื่อ-นามสกุล", en: "Full name" },
  idLabel: { th: "รหัสนักศึกษา", en: "Student ID" },
  startButton: { th: "เริ่มออกแบบ", en: "Start designing" },
  stageLabel: { th: "ด่านที่", en: "Stage" },
  submitButton: { th: "ส่งคำตอบ", en: "Submit" },
  nextButton: { th: "ถัดไป", en: "Next" },
  seeResultsButton: { th: "ดูผลลัพธ์", en: "See results" },
  playAgainButton: { th: "เล่นอีกครั้ง", en: "Play again" },
  generateCertificateButton: { th: "ดูสรุปการฝึกในเบราว์เซอร์", en: "View local practice summary" },
  printButton: { th: "พิมพ์ / บันทึกสรุปการฝึก", en: "Print / Save practice summary" },
  closeButton: { th: "ปิด", en: "Close" },
  resultsTitle: { th: "สรุปผลการออกแบบ", en: "Design review summary" },
  localSummaryTitle: { th: "สรุปการฝึกในเบราว์เซอร์", en: "Local practice summary" },
  overallAccuracy: { th: "ความแม่นยำโดยรวม", en: "Overall accuracy" },
  stage1Name: { th: "ด่าน 1: จับคู่หลักการออกแบบ", en: "Stage 1: Design Principles" },
  stage2Name: { th: "ด่าน 2: จำแนกประเภท Control", en: "Stage 2: Control Sort" },
  stage3Name: { th: "ด่าน 3: สร้าง Defense in Depth", en: "Stage 3: Layer Builder" },
  stage4Name: { th: "ด่าน 4: เลือก Access Model", en: "Stage 4: Access Model" },
  stage5Name: { th: "ด่าน 5: แปลง Risk เป็น Requirement", en: "Stage 5: Requirement Builder" },
  spofWarningTitle: { th: "คำเตือน: จุดเดียวที่ล้มเหลวได้", en: "Warning: single point of failure" },
  spofWarningBody: {
    th: "ชุด control ต้องมีอย่างน้อย 3 ชั้น และครอบคลุมอย่างน้อย 2 มิติ (ลดโอกาสสำเร็จ / จำกัดผลกระทบ / ช่วยฟื้นตัว) ไม่เช่นนั้นยังไม่ใช่ defense in depth จริง",
    en: "A control set needs at least 3 layers spanning at least 2 dimensions (reduce likelihood / limit impact / enable recovery) — otherwise it is not a real layered defense yet.",
  },
  certName: { th: "ชื่อ", en: "Name" },
  certId: { th: "รหัสนักศึกษา", en: "Student ID" },
  certDate: { th: "วันที่", en: "Date" },
  certSignature: { th: "ขอบเขตของสรุป", en: "Summary scope" },
  localSummaryBoundary: {
    th: "สร้างและกรอกข้อมูลในเบราว์เซอร์เท่านั้น ไม่ใช่หลักฐานยืนยันตัวตน การผ่านงาน ความสามารถ หรือการรับรองจากผู้สอน",
    en: "Browser-only and self-entered; not evidence of identity, completion, competency, or instructor verification.",
  },
  langToggleLabel: { th: "ภาษา", en: "Language" },
};

function t(key, lang) {
  const entry = UI_STRINGS[key];
  if (!entry) return key;
  return entry[lang] || entry[DEFAULT_LANG];
}

function bi(field, lang) {
  if (!field) return "";
  return field[lang] || field[DEFAULT_LANG] || "";
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SUPPORTED_LANGS,
    DEFAULT_LANG,
    LANG_STORAGE_KEY,
    resolveLanguage,
    setLanguage,
    UI_STRINGS,
    t,
    bi,
  };
}
