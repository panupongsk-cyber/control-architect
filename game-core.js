/**
 * Control Architect - Core Logic & Scenario Bank
 * 305331 / 316331 Computer and Information Security, Naresuan University
 * Chapter 4: Security Design Principles, Controls, Access Control Models, and
 * Security Requirements (MLO4.1-4.5)
 *
 * Every scenario is synthetic and grounded in the Student Project Portal case used across
 * the 305331 textbook (see textbook/lecture-notes/chapter-04/00-chapter.md). Bilingual text
 * is stored as { th, en } pairs; UI chrome strings live separately in i18n.js.
 */

// ---------------------------------------------------------------------------
// Shared vocabularies
// ---------------------------------------------------------------------------

const PRINCIPLE = {
  LEAST_PRIVILEGE: { th: "Least privilege", en: "Least privilege" },
  DEFENSE_IN_DEPTH: { th: "Defense in depth", en: "Defense in depth" },
  FAIL_SAFE_DEFAULTS: { th: "Fail-safe defaults", en: "Fail-safe defaults" },
  SEPARATION_OF_DUTIES: { th: "Separation of duties", en: "Separation of duties" },
  ECONOMY_OF_MECHANISM: { th: "Economy of mechanism", en: "Economy of mechanism" },
};

const CONTROL_FUNCTION = {
  PREVENTIVE: { th: "Preventive", en: "Preventive" },
  DETECTIVE: { th: "Detective", en: "Detective" },
  CORRECTIVE: { th: "Corrective", en: "Corrective" },
  RECOVERY: { th: "Recovery", en: "Recovery" },
};

const CONTROL_NATURE = {
  TECHNICAL: { th: "Technical", en: "Technical" },
  ADMINISTRATIVE: { th: "Administrative", en: "Administrative" },
  PHYSICAL: { th: "Physical", en: "Physical" },
};

const LAYER_TAG = {
  REDUCE_LIKELIHOOD: { th: "ลดโอกาสสำเร็จ", en: "Reduces likelihood" },
  LIMIT_IMPACT: { th: "จำกัดผลกระทบ", en: "Limits impact" },
  ENABLE_RECOVERY: { th: "ช่วยฟื้นตัว", en: "Enables recovery" },
};

const DEFENSE_LAYER = {
  AUTHENTICATION: {
    id: "AUTHENTICATION",
    label: { th: "การพิสูจน์ตัวตน (MFA)", en: "Authentication (MFA)" },
    tag: "REDUCE_LIKELIHOOD",
  },
  RESOURCE_AUTHZ_POLICY: {
    id: "RESOURCE_AUTHZ_POLICY",
    label: { th: "นโยบาย authorization ระดับ resource", en: "Resource-level authorization policy" },
    tag: "LIMIT_IMPACT",
  },
  JOINT_APPROVAL: {
    id: "JOINT_APPROVAL",
    label: { th: "การอนุมัติร่วมสำหรับการเปลี่ยนสำคัญ", en: "Joint approval for high-impact changes" },
    tag: "LIMIT_IMPACT",
  },
  ACTIVITY_LOG: {
    id: "ACTIVITY_LOG",
    label: { th: "ข้อมูลเหตุการณ์ (activity log)", en: "Activity logging" },
    tag: "LIMIT_IMPACT",
  },
  DATA_RECOVERY_PLAN: {
    id: "DATA_RECOVERY_PLAN",
    label: { th: "แผนฟื้นข้อมูล", en: "Data recovery plan" },
    tag: "ENABLE_RECOVERY",
  },
};

const DEFENSE_LAYER_MIN_COUNT = 3;
const DEFENSE_LAYER_MIN_TAG_SPREAD = 2;

const CLAUSE_CONCEPT = {
  RBAC_ROLE_ASSIGNMENT: { th: "RBAC: กำหนดสิทธิ์ตามบทบาทงาน", en: "RBAC: permissions tied to a job role" },
  ABAC: {
    th: "ABAC: เงื่อนไขระดับ object เกินกว่า RBAC เฉย ๆ",
    en: "ABAC: an object-level condition beyond plain RBAC",
  },
  SEPARATION_OF_DUTIES: { th: "Separation of duties", en: "Separation of duties" },
  DAC: { th: "DAC: เจ้าของทรัพยากรให้สิทธิ์เอง", en: "DAC: the resource owner grants access" },
  MAC: { th: "MAC: นโยบายกลางบังคับตามชั้นข้อมูล", en: "MAC: a central policy enforces by data class" },
};

// ---------------------------------------------------------------------------
// Stage 1 (MLO4.1) - Match design principles to a risk
// ---------------------------------------------------------------------------

const STAGE1_PRINCIPLES = [
  {
    id: "S1-1",
    title: { th: "การแก้ผลประเมิน", en: "Editing grade records" },
    scenario: {
      th: "Portal อนุญาตให้ผู้สอนแก้คะแนน แต่ผู้ช่วยสอนที่ช่วยเตรียมข้อมูลก็แก้ค่าจริงได้โดยไม่จำเป็น และคนเดียวสามารถส่งกับอนุมัติการเปลี่ยนที่มีผลสูงได้โดยไม่มีการตรวจร่วม",
      en: "The Portal lets instructors edit grades, but a teaching assistant who only helps prepare data can also edit the real values without needing to, and one person alone can both submit and approve a high-impact change with no joint review.",
    },
    correctPair: ["LEAST_PRIVILEGE", "SEPARATION_OF_DUTIES"],
    tradeoffOptions: [
      {
        id: "TO_COORDINATION_TIME",
        th: "การเพิ่มผู้อนุมัติร่วมเพิ่มเวลาและภาระการประสานงาน",
        en: "Adding a joint approver increases turnaround time and coordination overhead.",
        correct: true,
      },
      {
        id: "TO_NO_COST",
        th: "การเพิ่มการตรวจร่วมไม่มีต้นทุนใด ๆ ต่อกระบวนการทำงาน",
        en: "Adding joint review has no cost to the workflow at all.",
        correct: false,
      },
      {
        id: "TO_FASTER",
        th: "การจำกัดสิทธิ์ผู้ช่วยสอนทำให้กระบวนการเร็วขึ้นเสมอ",
        en: "Restricting the TA's access always makes the process faster.",
        correct: false,
      },
    ],
    explanation: {
      th: "Least privilege ตัดสิทธิ์แก้คะแนนที่ผู้ช่วยสอนไม่จำเป็นต้องมี ส่วน separation of duties ตัดปัญหาคนเดียวควบคุมทั้งการเสนอและอนุมัติ ทั้งสองข้อลดความเสี่ยงคนละมิติ ไม่ทับซ้อนกัน",
      en: "Least privilege removes an edit right the TA never needed, while separation of duties removes the single-actor control over both proposing and approving the change — two different risk dimensions, not an overlapping fix.",
    },
  },
  {
    id: "S1-2",
    title: { th: "บทบาทใหม่ยังไม่ได้กำหนดสิทธิ์", en: "A new role with no permissions set yet" },
    scenario: {
      th: "Portal เพิ่มบทบาท “ผู้ประสานงานรายวิชา” และตั้งค่าเริ่มต้นให้เข้าถึงข้อมูลเกือบทุกอย่างไว้ก่อน “เผื่อจำเป็น” นอกจากนี้ระบบสิทธิ์ยังมี rule เฉพาะกิจสะสมมาจากบทบาทเก่าจำนวนมากจนไม่มีใครอธิบายได้ตรงกันว่าใครมีสิทธิ์อะไรจริง ๆ",
      en: "The Portal adds a “Course Coordinator” role and defaults it to near-full access “just in case,” while the permission system also carries many accumulated special-case rules from old roles that nobody can consistently explain anymore.",
    },
    correctPair: ["FAIL_SAFE_DEFAULTS", "ECONOMY_OF_MECHANISM"],
    tradeoffOptions: [
      {
        id: "TO_ONBOARDING_STEPS",
        th: "การตั้งค่าเริ่มต้นแบบปฏิเสธไว้ก่อนอาจต้องมีขั้นตอนเพิ่มก่อนบทบาทใหม่จะใช้งานได้จริง",
        en: "Defaulting to deny first may add setup steps before the new role can actually do useful work.",
        correct: true,
      },
      {
        id: "TO_SIMPLER_ALWAYS",
        th: "การลด rule เฉพาะกิจจะไม่กระทบผู้ใช้ปัจจุบันเลยแม้แต่คนเดียว",
        en: "Removing the special-case rules will not affect a single current user.",
        correct: false,
      },
      {
        id: "TO_NO_REVIEW_NEEDED",
        th: "เมื่อกำหนด fail-safe defaults แล้ว ไม่ต้องทบทวนสิทธิ์อีกต่อไป",
        en: "Once fail-safe defaults are set, permissions never need reviewing again.",
        correct: false,
      },
    ],
    explanation: {
      th: "Fail-safe defaults แก้ปัญหาการให้สิทธิ์กว้างไว้ก่อนโดยไม่มีเหตุผล ส่วน economy of mechanism แก้ปัญหาความซับซ้อนสะสมที่ทำให้ไม่มีใครอธิบายสิทธิ์จริงได้ ทั้งสองข้อคนละมิติ: มิติหนึ่งคือค่าเริ่มต้น อีกมิติคือความซับซ้อนของกลไกทั้งระบบ",
      en: "Fail-safe defaults fixes granting broad access with no justification; economy of mechanism fixes the accumulated complexity that makes real permissions unexplainable. Two different dimensions: the default itself, versus the overall mechanism's complexity.",
    },
  },
  {
    id: "S1-3",
    title: { th: "คอนโซลผู้ดูแลระบบใหม่", en: "The new admin console" },
    scenario: {
      th: "คอนโซลผู้ดูแลระบบตัวใหม่ตั้งค่าเริ่มต้นให้บัญชีที่สร้างใหม่เข้าถึงทุกโมดูล “เผื่อใช้งานภายหลัง” และพึ่งเพียงรหัสผ่านอย่างเดียวในการปกป้องคอนโซลนี้ ไม่มีชั้นป้องกันอื่นเพิ่มเติม",
      en: "The new admin console defaults every newly created account to access every module “in case it's needed later,” and protects the console with password authentication alone — no additional layer.",
    },
    correctPair: ["FAIL_SAFE_DEFAULTS", "DEFENSE_IN_DEPTH"],
    tradeoffOptions: [
      {
        id: "TO_EXTRA_FRICTION",
        th: "การเพิ่มชั้นป้องกันให้คอนโซลผู้ดูแลระบบเพิ่มขั้นตอนก่อนเข้าใช้งานทุกครั้ง",
        en: "Adding a layer to the admin console adds a step every time someone signs in.",
        correct: true,
      },
      {
        id: "TO_PASSWORD_ENOUGH",
        th: "รหัสผ่านที่คาดเดายากพอเพียงพอแล้วสำหรับคอนโซลผู้ดูแลระบบ",
        en: "A sufficiently hard-to-guess password is already enough for the admin console.",
        correct: false,
      },
      {
        id: "TO_DEFAULT_FINE",
        th: "การให้สิทธิ์เต็มไว้ก่อนไม่มีผลเสียตราบใดที่ยังไม่มีใครใช้สิทธิ์นั้น",
        en: "Granting full access by default is harmless as long as nobody has used that access yet.",
        correct: false,
      },
    ],
    explanation: {
      th: "Fail-safe defaults แก้การให้สิทธิ์เต็มไว้ก่อนโดยไม่มีเหตุผลใช้งานจริง ส่วน defense in depth แก้การพึ่งพาชั้นป้องกันเดียว (รหัสผ่าน) สำหรับทรัพยากรที่มีผลกระทบสูงอย่างคอนโซลผู้ดูแลระบบ",
      en: "Fail-safe defaults fixes granting full access with no real justification; defense in depth fixes relying on a single layer (a password) to protect a high-impact resource like the admin console.",
    },
  },
];

// ---------------------------------------------------------------------------
// Stage 2 (MLO4.2) - Sort controls by function and nature
// ---------------------------------------------------------------------------

const STAGE2_CONTROL_SORT = {
  scenario: {
    th: "ไฟล์ส่งงานหาย: หากไฟล์ถูกลบโดยผิดพลาด สิทธิ์ที่จำกัดการลบ ข้อมูลบันทึกการลบ สำเนาข้อมูล และขั้นตอนแจ้งเตือน ล้วนมีบทบาทคนละแบบ จัดประเภทมาตรการต่อไปนี้ตามหน้าที่และลักษณะ — มาตรการหนึ่งข้ออาจมีมากกว่าหนึ่งบทบาทได้",
    en: "A lost submission file: if a file is deleted by mistake, restricted delete permissions, a deletion log, data backups, and a notification step each play a different part. Classify each measure below by function and nature — one measure may legitimately have more than one role.",
  },
  items: [
    {
      id: "ITEM_A",
      label: { th: "(ก) MFA สำหรับบทบาทผู้สอน", en: "(a) MFA for the instructor role" },
      acceptedFunctions: ["PREVENTIVE"],
      acceptedNatures: ["TECHNICAL"],
    },
    {
      id: "ITEM_B",
      label: { th: "(ข) บันทึกการดาวน์โหลดไฟล์", en: "(b) A log of file downloads" },
      acceptedFunctions: ["DETECTIVE"],
      acceptedNatures: ["TECHNICAL"],
    },
    {
      id: "ITEM_C",
      label: { th: "(ค) ขั้นตอนอนุมัติการลบรายวิชา", en: "(c) An approval step for deleting a course" },
      acceptedFunctions: ["PREVENTIVE", "DETECTIVE"],
      acceptedNatures: ["ADMINISTRATIVE"],
    },
    {
      id: "ITEM_D",
      label: { th: "(ง) สำเนาข้อมูลผลประเมิน", en: "(d) A backup of grade records" },
      acceptedFunctions: ["RECOVERY"],
      acceptedNatures: ["TECHNICAL", "ADMINISTRATIVE"],
    },
  ],
};

// ---------------------------------------------------------------------------
// Stage 3 (MLO4.3) - Build a defense-in-depth stack
// ---------------------------------------------------------------------------

const STAGE3_DEFENSE_STACK = [
  {
    id: "S3-1",
    title: { th: "คำร้องแก้คะแนนถูกดำเนินการโดยผู้ไม่มีหน้าที่", en: "An unauthorized party processes a grade-change request" },
    scenario: {
      th: "ทีมเสนอใช้ MFA สำหรับผู้สอนเพียงอย่างเดียวเพื่อป้องกันความเสี่ยง “คำร้องแก้คะแนนถูกดำเนินการโดยผู้ไม่มีหน้าที่” MFA ลดผลจาก credential เพียงอย่างเดียวได้ แต่ไม่กำหนดว่าเข้าระบบแล้วมีสิทธิ์แก้อะไรได้บ้าง และไม่ช่วยฟื้นข้อมูลหากถูกลบผิดพลาด",
      en: "The team proposes MFA for instructors alone to address the risk “an unauthorized party processes a grade-change request.” MFA reduces the risk of a credential-only compromise, but it does not define what an authenticated session may actually edit, and it does not help recover data if something is deleted by mistake.",
    },
    residualRiskOptions: [
      {
        id: "RR_LEGITIMATE_MISUSE",
        th: "ผู้มีสิทธิ์ตามนโยบายยังอาจใช้สิทธิ์ผิดพลาดหรือโดยไม่สุจริตได้",
        en: "Someone with legitimate policy access can still misuse it, by mistake or in bad faith.",
        correct: true,
      },
      {
        id: "RR_ZERO_RISK",
        th: "จะไม่มีการเปลี่ยนคะแนนที่ผิดพลาดเกิดขึ้นอีกเลย",
        en: "No mistaken grade change can ever happen again.",
        correct: false,
      },
      {
        id: "RR_CREDENTIAL_SOLVED",
        th: "ปัญหาเรื่อง credential ถูกขโมยจะหมดไปอย่างสมบูรณ์",
        en: "The problem of stolen credentials is now completely solved.",
        correct: false,
      },
    ],
    tradeoffOptions: [
      {
        id: "TO_APPROVAL_OVERHEAD",
        th: "การอนุมัติร่วมและการบันทึกเพิ่มเวลาและภาระประสานงานให้ผู้เกี่ยวข้อง",
        en: "Joint approval and logging add turnaround time and coordination work for everyone involved.",
        correct: true,
      },
      {
        id: "TO_FREE_LAYERS",
        th: "มาตรการทุกชั้นในชุดนี้ไม่มีต้นทุนใด ๆ เลย",
        en: "None of these layers carry any cost at all.",
        correct: false,
      },
      {
        id: "TO_CHEAPER_MORE",
        th: "ยิ่งเพิ่มชั้นป้องกันมากเท่าไร ต้นทุนโดยรวมยิ่งลดลง",
        en: "The more layers added, the lower the overall cost becomes.",
        correct: false,
      },
    ],
  },
  {
    id: "S3-2",
    title: { th: "คำขอเปลี่ยนบัญชีธนาคารรับทุนวิจัยนักศึกษา", en: "Changing the bank account for a student research grant" },
    scenario: {
      th: "มีข้อเสนอให้ใช้เพียงรหัสผ่านที่คาดเดายากในการยืนยันคำขอเปลี่ยนบัญชีธนาคารสำหรับรับทุนวิจัยนักศึกษา ซึ่งเป็นงานที่มีผลกระทบสูงหากดำเนินการผิดคน",
      en: "There is a proposal to rely on just a hard-to-guess password to confirm a request to change the bank account for a student research grant payout — a high-impact action if it is carried out for the wrong person.",
    },
    residualRiskOptions: [
      {
        id: "RR_LEGITIMATE_MISUSE",
        th: "ผู้มีสิทธิ์ตามนโยบายยังอาจใช้สิทธิ์ผิดพลาดหรือโดยไม่สุจริตได้",
        en: "Someone with legitimate policy access can still misuse it, by mistake or in bad faith.",
        correct: true,
      },
      {
        id: "RR_ZERO_RISK",
        th: "การเปลี่ยนบัญชีผิดคนจะเป็นไปไม่ได้อีกต่อไป",
        en: "Changing the account for the wrong person becomes impossible from now on.",
        correct: false,
      },
      {
        id: "RR_NO_MORE_FRAUD",
        th: "การหลอกลวงทางการเงินทุกรูปแบบจะหมดไป",
        en: "Every form of financial fraud is now eliminated.",
        correct: false,
      },
    ],
    tradeoffOptions: [
      {
        id: "TO_APPROVAL_OVERHEAD",
        th: "การอนุมัติร่วมและการบันทึกเพิ่มเวลาและภาระประสานงานให้ผู้เกี่ยวข้อง",
        en: "Joint approval and logging add turnaround time and coordination work for everyone involved.",
        correct: true,
      },
      {
        id: "TO_FREE_LAYERS",
        th: "มาตรการทุกชั้นในชุดนี้ไม่มีต้นทุนใด ๆ เลย",
        en: "None of these layers carry any cost at all.",
        correct: false,
      },
      {
        id: "TO_CHEAPER_MORE",
        th: "ยิ่งเพิ่มชั้นป้องกันมากเท่าไร ต้นทุนโดยรวมยิ่งลดลง",
        en: "The more layers added, the lower the overall cost becomes.",
        correct: false,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Stage 4 (MLO4.4) - Tag a policy's clauses with the right access-control concept
// ---------------------------------------------------------------------------

const STAGE4_POLICY_CLAUSES = [
  {
    id: "S4-1",
    title: { th: "แผนผังสิทธิ์รายวิชา", en: "Course access policy" },
    scenario: {
      th: "Portal ใช้ RBAC แยกผู้เรียน ผู้ช่วยสอน และผู้สอน แต่ผู้สอนแต่ละคนควรจัดการเฉพาะรายวิชาของตน",
      en: "The Portal uses RBAC to separate students, teaching assistants, and instructors — but each instructor should only manage their own course.",
    },
    clauses: [
      {
        id: "C1",
        text: {
          th: "ผู้สอนแก้ผลได้เฉพาะรายวิชาที่ตนรับผิดชอบ",
          en: "An instructor may edit grades only for the course they are responsible for.",
        },
        correctConcept: "ABAC",
      },
      {
        id: "C2",
        text: {
          th: "ผู้ช่วยสอนส่งประกาศได้แต่แก้ผลไม่ได้",
          en: "A teaching assistant may send announcements but may not edit grades.",
        },
        correctConcept: "RBAC_ROLE_ASSIGNMENT",
      },
      {
        id: "C3",
        text: {
          th: "การเปลี่ยนผลขั้นสุดท้ายต้องมีผู้อนุมัติอีกคน",
          en: "A final grade change requires a second approver.",
        },
        correctConcept: "SEPARATION_OF_DUTIES",
      },
    ],
  },
  {
    id: "S4-2",
    title: { th: "นโยบายการยืมอุปกรณ์ห้องแล็บ", en: "Lab equipment loan policy" },
    scenario: {
      th: "รายวิชาปฏิบัติการใช้ระบบยืม-คืนอุปกรณ์ร่วมกันหลายรายวิชา",
      en: "Several lab courses share one equipment loan-and-return system.",
    },
    clauses: [
      {
        id: "C1",
        text: {
          th: "ผู้ช่วยสอนอนุมัติการยืมอุปกรณ์ได้เฉพาะของรายวิชาที่ตนดูแล",
          en: "A teaching assistant may approve equipment loans only for the course they oversee.",
        },
        correctConcept: "ABAC",
      },
      {
        id: "C2",
        text: {
          th: "นักศึกษาแจ้งขอยืมได้แต่อนุมัติเองไม่ได้",
          en: "A student may submit a loan request but may not approve it themselves.",
        },
        correctConcept: "RBAC_ROLE_ASSIGNMENT",
      },
      {
        id: "C3",
        text: {
          th: "การยืมอุปกรณ์มูลค่าสูงต้องมีผู้อนุมัติคนที่สองยืนยัน",
          en: "Borrowing high-value equipment requires a second approver to confirm.",
        },
        correctConcept: "SEPARATION_OF_DUTIES",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Stage 5 (MLO4.5) - Turn a vague requirement into a testable one
// ---------------------------------------------------------------------------

const STAGE5_REQUIREMENTS = [
  {
    id: "S5-1",
    vagueRequirement: {
      th: "ระบบต้องป้องกันข้อมูลนักศึกษาให้ดี",
      en: "The system must protect student data well.",
    },
    behaviorOptions: [
      {
        id: "B1",
        th: "ต้องตัดสินสิทธิ์ของคำขอเข้าถึงข้อมูลนักศึกษาตามบทบาทและรายวิชาที่รับผิดชอบก่อนอนุญาต",
        en: "It must decide access requests to student data based on role and course responsibility before granting them.",
        correct: true,
      },
      { id: "B2", th: "ต้องป้องกันข้อมูลนักศึกษาให้ปลอดภัยที่สุด", en: "It must protect student data as securely as possible.", correct: false },
      { id: "B3", th: "ต้องใช้เทคโนโลยีความปลอดภัยที่ทันสมัยที่สุด", en: "It must use the most modern security technology available.", correct: false },
    ],
    assetActionOptions: [
      {
        id: "A1",
        th: "เพื่อปกป้องข้อมูลส่วนตัวและผลการเรียนของนักศึกษาจากการเข้าถึงที่ไม่มีสิทธิ์",
        en: "to protect students' personal data and grade records from unauthorized access.",
        correct: true,
      },
      { id: "A2", th: "เพื่อความปลอดภัยของระบบโดยรวม", en: "for the overall security of the system.", correct: false },
      { id: "A3", th: "เพื่อให้ผู้ใช้พึงพอใจกับระบบ", en: "so that users are satisfied with the system.", correct: false },
    ],
    conditionOptions: [
      {
        id: "C1",
        th: "ภายใต้บทบาทและความรับผิดชอบต่อรายวิชาที่กำหนดไว้ พร้อมบันทึก actor, action, object, outcome และเวลาเมื่อมีการเข้าถึง",
        en: "under the defined role and course responsibility, logging the actor, action, object, outcome, and time of each access.",
        correct: true,
      },
      { id: "C2", th: "ตลอดเวลาโดยไม่มีข้อยกเว้นใด ๆ", en: "at all times, with no exceptions whatsoever.", correct: false },
      { id: "C3", th: "เมื่อผู้ดูแลระบบเห็นสมควร", en: "whenever the system administrator sees fit.", correct: false },
    ],
  },
  {
    id: "S5-2",
    vagueRequirement: {
      th: "ระบบต้องพร้อมใช้งานตลอดเวลา",
      en: "The system must always be available.",
    },
    behaviorOptions: [
      {
        id: "B1",
        th: "ต้องรักษาความพร้อมใช้งานของบริการส่งงานให้อยู่ในระดับที่กำหนดแม้มีการใช้งานพร้อมกันจำนวนมาก",
        en: "It must keep the assignment-submission service available at a defined level even under heavy concurrent load.",
        correct: true,
      },
      { id: "B2", th: "ต้องพร้อมใช้งานให้ดีที่สุดเท่าที่จะทำได้", en: "It must be as available as it can possibly be.", correct: false },
      { id: "B3", th: "ต้องตอบสนองเร็วที่สุดเท่าที่จะทำได้", en: "It must respond as fast as it possibly can.", correct: false },
    ],
    assetActionOptions: [
      {
        id: "A1",
        th: "เพื่อให้นักศึกษาส่งงานได้ทันกำหนดเวลาแม้ในช่วงใกล้ปิดรับ",
        en: "so that students can submit assignments on time, even near the submission deadline.",
        correct: true,
      },
      { id: "A2", th: "เพื่อความพึงพอใจของผู้ใช้โดยทั่วไป", en: "for general user satisfaction.", correct: false },
      { id: "A3", th: "เพื่อภาพลักษณ์ที่ดีของมหาวิทยาลัย", en: "for the university's public image.", correct: false },
    ],
    conditionOptions: [
      {
        id: "C1",
        th: "ภายใต้ปริมาณการใช้งานพร้อมกันสูงสุดที่กำหนดไว้ล่วงหน้า และมีแผนสำรอง/แจ้งเตือนเมื่อเกินขีดจำกัด",
        en: "under a predefined maximum concurrent load, with a fallback plan and alert when that limit is exceeded.",
        correct: true,
      },
      { id: "C2", th: "ในทุกสถานการณ์โดยไม่มีข้อยกเว้น", en: "in every situation, with no exceptions.", correct: false },
      { id: "C3", th: "เมื่อฝ่ายไอทีมีเวลาดูแล", en: "whenever the IT team has time to attend to it.", correct: false },
    ],
  },
];

const STANDARD_ROLE_OPTIONS = [
  {
    id: "SR_LANGUAGE_NOT_REPLACEMENT",
    th: "ให้ภาษาและรายการประเด็นเปรียบเทียบ แต่ไม่แทนการวิเคราะห์ asset และข้อจำกัดของระบบเอง",
    en: "It gives shared language and a checklist to compare against, but does not replace analyzing the system's own assets and constraints.",
    correct: true,
  },
  {
    id: "SR_FULL_REPLACEMENT",
    th: "ระบุขั้นตอนที่ทีมต้องทำตามทุกข้อโดยไม่ต้องตัดสินใจเพิ่มเติมเอง",
    en: "It specifies every step the team must follow, with no further judgment needed from them.",
    correct: false,
  },
  {
    id: "SR_USELESS",
    th: "ไม่มีประโยชน์ใด ๆ ต่อการเขียน security requirement",
    en: "It offers no benefit at all when writing a security requirement.",
    correct: false,
  },
];

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function scoreStage1(item, answer) {
  const selected = Array.isArray(answer.principles) ? answer.principles : [];
  const correctSet = item.correctPair;
  const correctSelected = selected.filter((p) => correctSet.includes(p));
  let pairRatio = 0;
  if (selected.length === 2 && correctSelected.length === 2) pairRatio = 0.6;
  else if (correctSelected.length === 1) pairRatio = 0.3;

  const chosenTradeoff = item.tradeoffOptions.find((t) => t.id === answer.tradeoffId);
  const tradeoffRatio = chosenTradeoff && chosenTradeoff.correct ? 0.4 : 0;

  return { ratio: Math.min(1, pairRatio + tradeoffRatio) };
}

function setScore(selected, accepted) {
  const sel = Array.isArray(selected) ? selected : [];
  if (sel.length === 0) return 0;
  const correctSelected = sel.filter((s) => accepted.includes(s));
  const wrongSelected = sel.filter((s) => !accepted.includes(s));
  if (wrongSelected.length > 0) return correctSelected.length > 0 ? 0.25 : 0;
  if (correctSelected.length === accepted.length) return 1;
  return correctSelected.length > 0 ? 0.5 : 0;
}

function scoreStage2Item(item, answer) {
  const functionRatio = setScore(answer.functions, item.acceptedFunctions);
  const natureRatio = setScore(answer.natures, item.acceptedNatures);
  return { ratio: 0.5 * functionRatio + 0.5 * natureRatio };
}

function evaluateStage3Layers(selectedLayerIds) {
  const ids = Array.isArray(selectedLayerIds) ? selectedLayerIds : [];
  const distinctTags = new Set(
    ids
      .map((id) => {
        const layer = Object.values(DEFENSE_LAYER).find((l) => l.id === id);
        return layer ? layer.tag : null;
      })
      .filter(Boolean)
  );
  const singlePointOfFailure =
    ids.length < DEFENSE_LAYER_MIN_COUNT || distinctTags.size < DEFENSE_LAYER_MIN_TAG_SPREAD;
  return { singlePointOfFailure, count: ids.length, dimensionCount: distinctTags.size };
}

function scoreStage3(item, answer) {
  const { singlePointOfFailure } = evaluateStage3Layers(answer.layerIds);
  if (singlePointOfFailure) {
    return { ratio: 0, singlePointOfFailure: true };
  }

  const ids = answer.layerIds;
  const tagAnswers = answer.tags || {};
  let taggedCorrectly = 0;
  ids.forEach((id) => {
    const layer = Object.values(DEFENSE_LAYER).find((l) => l.id === id);
    if (layer && tagAnswers[id] === layer.tag) taggedCorrectly += 1;
  });
  const tagRatio = ids.length > 0 ? taggedCorrectly / ids.length : 0;
  const layerCountRatio = Math.min(1, ids.length / Object.keys(DEFENSE_LAYER).length);

  const chosenRisk = item.residualRiskOptions.find((r) => r.id === answer.residualRiskId);
  const riskRatio = chosenRisk && chosenRisk.correct ? 1 : 0;
  const chosenTradeoff = item.tradeoffOptions.find((t) => t.id === answer.tradeoffId);
  const tradeoffRatio = chosenTradeoff && chosenTradeoff.correct ? 1 : 0;

  const ratio = 0.35 * layerCountRatio + 0.25 * tagRatio + 0.2 * riskRatio + 0.2 * tradeoffRatio;
  return { ratio: Math.min(1, ratio), singlePointOfFailure: false };
}

function scoreStage4(item, answer) {
  const tags = answer.clauseTags || {};
  let correctCount = 0;
  item.clauses.forEach((clause) => {
    if (tags[clause.id] === clause.correctConcept) correctCount += 1;
  });
  return { ratio: correctCount / item.clauses.length, correctCount, total: item.clauses.length };
}

function scoreStage5(item, answer) {
  const behavior = item.behaviorOptions.find((o) => o.id === answer.behaviorId);
  const assetAction = item.assetActionOptions.find((o) => o.id === answer.assetActionId);
  const condition = item.conditionOptions.find((o) => o.id === answer.conditionId);
  const standardRole = STANDARD_ROLE_OPTIONS.find((o) => o.id === answer.standardRoleId);

  let ratio = 0;
  if (behavior && behavior.correct) ratio += 0.3;
  if (assetAction && assetAction.correct) ratio += 0.25;
  if (condition && condition.correct) ratio += 0.25;
  if (standardRole && standardRole.correct) ratio += 0.2;
  return { ratio: Math.min(1, ratio) };
}

// ---------------------------------------------------------------------------
// Outcome evaluation
// ---------------------------------------------------------------------------

function evaluateLearningOutcome(stageAccuracies) {
  const values = Object.values(stageAccuracies);
  const overallAccuracy =
    values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;

  let rank = {
    badge: "📐",
    title: { th: "ช่วงผลการฝึก: ต่ำกว่า 50%", en: "Practice band: below 50%" },
    description: {
      th: "ผลนี้สะท้อนความถูกต้องในชุดสถานการณ์ฝึกนี้เท่านั้น ลองเล่นซ้ำเพื่อฝึกแยกหลักการ ประเภท control และ requirement ให้ชัดเจนขึ้น",
      en: "This result reflects accuracy in this local scenario set only; replay to practise distinguishing security principles, control types, and requirements.",
    },
  };

  if (overallAccuracy >= 90) {
    rank = {
      badge: "🏛️",
      title: { th: "ช่วงผลการฝึก: 90–100%", en: "Practice band: 90–100%" },
      description: {
        th: "ความถูกต้องสูงในชุดสถานการณ์ฝึกนี้ โดยยังไม่ใช่การรับรองความสามารถในการปฏิบัติงานจริง",
        en: "High accuracy in this local scenario set; it does not certify operational competence.",
      },
    };
  } else if (overallAccuracy >= 75) {
    rank = {
      badge: "🧱",
      title: { th: "ช่วงผลการฝึก: 75–89%", en: "Practice band: 75–89%" },
      description: {
        th: "ความถูกต้องดีในชุดสถานการณ์ฝึกนี้ ลองทบทวน trade-off และเงื่อนไขในข้อกำหนด",
        en: "Good accuracy in this local scenario set; review trade-offs and conditions in the requirements.",
      },
    };
  } else if (overallAccuracy >= 50) {
    rank = {
      badge: "🔧",
      title: { th: "ช่วงผลการฝึก: 50–74%", en: "Practice band: 50–74%" },
      description: {
        th: "มีความเข้าใจพื้นฐานในชุดสถานการณ์ฝึกนี้ ลองทบทวนความต่างระหว่างการจัดหมวด control กับการเลือก access model",
        en: "Some basic understanding in this local scenario set; review the difference between classifying controls and choosing an access model.",
      },
    };
  }

  return { accuracy: overallAccuracy, ...rank };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    PRINCIPLE,
    CONTROL_FUNCTION,
    CONTROL_NATURE,
    LAYER_TAG,
    DEFENSE_LAYER,
    DEFENSE_LAYER_MIN_COUNT,
    DEFENSE_LAYER_MIN_TAG_SPREAD,
    CLAUSE_CONCEPT,
    STAGE1_PRINCIPLES,
    STAGE2_CONTROL_SORT,
    STAGE3_DEFENSE_STACK,
    STAGE4_POLICY_CLAUSES,
    STAGE5_REQUIREMENTS,
    STANDARD_ROLE_OPTIONS,
    scoreStage1,
    setScore,
    scoreStage2Item,
    evaluateStage3Layers,
    scoreStage3,
    scoreStage4,
    scoreStage5,
    evaluateLearningOutcome,
  };
}
