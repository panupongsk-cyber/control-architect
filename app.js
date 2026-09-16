/**
 * Control Architect - App controller (DOM rendering and state machine).
 * Depends on i18n.js and game-core.js being loaded first.
 */

(function () {
  "use strict";

  const STAGES = [
    { key: "s1", nameKey: "stage1Name", items: STAGE1_PRINCIPLES, kind: "principles" },
    { key: "s2", nameKey: "stage2Name", items: [STAGE2_CONTROL_SORT], kind: "sort" },
    { key: "s3", nameKey: "stage3Name", items: STAGE3_DEFENSE_STACK, kind: "stack" },
    { key: "s4", nameKey: "stage4Name", items: STAGE4_POLICY_CLAUSES, kind: "clauses" },
    { key: "s5", nameKey: "stage5Name", items: STAGE5_REQUIREMENTS, kind: "requirement" },
  ];

  const state = {
    lang: resolveLanguage(),
    player: { name: "", id: "" },
    stageIndex: 0,
    itemIndex: 0,
    submitted: false,
    stageResults: { s1: [], s2: [], s3: [], s4: [], s5: [] },
  };

  const el = (id) => document.getElementById(id);

  // -------------------------------------------------------------------
  // i18n wiring
  // -------------------------------------------------------------------

  function applyStaticI18n() {
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.getAttribute("data-i18n"), state.lang);
    });
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === state.lang);
    });
    document.documentElement.setAttribute("lang", state.lang);
  }

  function shuffle(array) {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    el(id).classList.add("active");
  }

  // -------------------------------------------------------------------
  // Generic choice-group helpers
  // -------------------------------------------------------------------

  function makeChoiceGroup(groupName, options, opts) {
    const multi = !!(opts && opts.multi);
    const maxSelect = opts && opts.maxSelect;
    const selectionOrder = [];
    const wrap = document.createElement("div");
    wrap.className = "choice-group";
    wrap.dataset.group = groupName;
    wrap.dataset.multi = multi ? "1" : "0";
    options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-btn";
      btn.dataset.value = opt.value;
      btn.textContent = opt.label;
      btn.addEventListener("click", () => {
        if (state.submitted) return;
        if (multi) {
          if (btn.classList.contains("active")) {
            btn.classList.remove("active");
            const idx = selectionOrder.indexOf(opt.value);
            if (idx >= 0) selectionOrder.splice(idx, 1);
          } else {
            if (maxSelect && selectionOrder.length >= maxSelect) {
              const oldestValue = selectionOrder.shift();
              const oldestBtn = wrap.querySelector(`.choice-btn[data-value="${CSS.escape(oldestValue)}"]`);
              if (oldestBtn) oldestBtn.classList.remove("active");
            }
            btn.classList.add("active");
            selectionOrder.push(opt.value);
          }
        } else {
          wrap.querySelectorAll(".choice-btn").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
        }
        if (opts && opts.onChange) opts.onChange();
      });
      wrap.appendChild(btn);
    });
    return wrap;
  }

  function readSingle(groupEl) {
    if (!groupEl) return null;
    const active = groupEl.querySelector(".choice-btn.active");
    return active ? active.dataset.value : null;
  }

  function readMulti(groupEl) {
    if (!groupEl) return [];
    return Array.from(groupEl.querySelectorAll(".choice-btn.active")).map((b) => b.dataset.value);
  }

  function fieldBlock(labelText) {
    const block = document.createElement("div");
    block.className = "field-block";
    const label = document.createElement("p");
    label.className = "field-block-label";
    label.textContent = labelText;
    block.appendChild(label);
    return block;
  }

  // -------------------------------------------------------------------
  // Stage 1: Design Principles
  // -------------------------------------------------------------------

  function renderStage1(item) {
    const area = el("answerArea");
    area.innerHTML = "";

    const principleOptions = Object.keys(PRINCIPLE).map((k) => ({ value: k, label: bi(PRINCIPLE[k], state.lang) }));
    const principleBlock = fieldBlock(
      state.lang === "th" ? "เลือกหลักการออกแบบ 2 ข้อที่ลดความเสี่ยงคนละมิติ" : "Choose 2 principles that reduce the risk on different dimensions"
    );
    principleBlock.appendChild(makeChoiceGroup("principles", principleOptions, { multi: true, maxSelect: 2 }));
    area.appendChild(principleBlock);

    const tradeoffOptions = shuffle(item.tradeoffOptions).map((o) => ({ value: o.id, label: bi(o, state.lang) }));
    const tradeoffBlock = fieldBlock(state.lang === "th" ? "Trade-off ของหลักการที่เลือก" : "A trade-off of the principles chosen");
    tradeoffBlock.appendChild(makeChoiceGroup("tradeoff", tradeoffOptions));
    area.appendChild(tradeoffBlock);
  }

  function collectStage1() {
    const area = el("answerArea");
    const principles = readMulti(area.querySelector('[data-group="principles"]'));
    const tradeoffId = readSingle(area.querySelector('[data-group="tradeoff"]'));
    return { principles, tradeoffId, complete: principles.length === 2 && !!tradeoffId };
  }

  // -------------------------------------------------------------------
  // Stage 2: Control Sort (one combined screen, 4 sub-items)
  // -------------------------------------------------------------------

  function renderStage2(stageData) {
    const area = el("answerArea");
    area.innerHTML = "";

    const functionOptions = Object.keys(CONTROL_FUNCTION).map((k) => ({ value: k, label: bi(CONTROL_FUNCTION[k], state.lang) }));
    const natureOptions = Object.keys(CONTROL_NATURE).map((k) => ({ value: k, label: bi(CONTROL_NATURE[k], state.lang) }));

    stageData.items.forEach((sortItem) => {
      const itemWrap = document.createElement("div");
      itemWrap.className = "sort-item";

      const heading = document.createElement("p");
      heading.className = "sort-item-heading";
      heading.textContent = bi(sortItem.label, state.lang);
      itemWrap.appendChild(heading);

      const funcBlock = fieldBlock(state.lang === "th" ? "หน้าที่ (เลือกได้หลายข้อ)" : "Function (choose all that apply)");
      funcBlock.appendChild(makeChoiceGroup(`func-${sortItem.id}`, functionOptions, { multi: true }));
      itemWrap.appendChild(funcBlock);

      const natureBlock = fieldBlock(state.lang === "th" ? "ลักษณะ (เลือกได้หลายข้อ)" : "Nature (choose all that apply)");
      natureBlock.appendChild(makeChoiceGroup(`nature-${sortItem.id}`, natureOptions, { multi: true }));
      itemWrap.appendChild(natureBlock);

      area.appendChild(itemWrap);
    });
  }

  function collectStage2(stageData) {
    const area = el("answerArea");
    const perItem = {};
    let complete = true;
    stageData.items.forEach((sortItem) => {
      const functions = readMulti(area.querySelector(`[data-group="func-${sortItem.id}"]`));
      const natures = readMulti(area.querySelector(`[data-group="nature-${sortItem.id}"]`));
      perItem[sortItem.id] = { functions, natures };
      if (functions.length === 0 || natures.length === 0) complete = false;
    });
    return { perItem, complete };
  }

  function scoreStage2All(stageData, answer) {
    const ratios = stageData.items.map((sortItem) => scoreStage2Item(sortItem, answer.perItem[sortItem.id]).ratio);
    const ratio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
    return { ratio };
  }

  // -------------------------------------------------------------------
  // Stage 3: Defense-in-Depth Layer Builder
  // -------------------------------------------------------------------

  function renderStage3(item) {
    const area = el("answerArea");
    area.innerHTML = "";

    const layerBlock = fieldBlock(
      state.lang === "th" ? `เลือกชั้นป้องกันอย่างน้อย ${DEFENSE_LAYER_MIN_COUNT} ชั้น` : `Choose at least ${DEFENSE_LAYER_MIN_COUNT} layers`
    );
    const layerOptions = Object.values(DEFENSE_LAYER).map((l) => ({ value: l.id, label: bi(l.label, state.lang) }));
    layerBlock.appendChild(makeChoiceGroup("layers", layerOptions, { multi: true, onChange: renderTagPickers }));
    area.appendChild(layerBlock);

    const tagBlock = fieldBlock(
      state.lang === "th" ? "แท็กแต่ละชั้น: ลดโอกาสสำเร็จ / จำกัดผลกระทบ / ช่วยฟื้นตัว" : "Tag each layer: reduces likelihood / limits impact / enables recovery"
    );
    tagBlock.id = "tagBlock";
    area.appendChild(tagBlock);
    renderTagPickers();

    const riskOptions = shuffle(item.residualRiskOptions).map((o) => ({ value: o.id, label: bi(o, state.lang) }));
    const riskBlock = fieldBlock(state.lang === "th" ? "Residual risk ที่ยังเหลืออยู่" : "Residual risk that still remains");
    riskBlock.appendChild(makeChoiceGroup("residualRisk", riskOptions));
    area.appendChild(riskBlock);

    const tradeoffOptions = shuffle(item.tradeoffOptions).map((o) => ({ value: o.id, label: bi(o, state.lang) }));
    const tradeoffBlock = fieldBlock(state.lang === "th" ? "Trade-off ของชุด control นี้" : "A trade-off of this control set");
    tradeoffBlock.appendChild(makeChoiceGroup("tradeoff", tradeoffOptions));
    area.appendChild(tradeoffBlock);
  }

  function renderTagPickers() {
    const tagBlock = el("tagBlock");
    if (!tagBlock) return;
    const label = tagBlock.querySelector(".field-block-label");
    tagBlock.innerHTML = "";
    if (label) tagBlock.appendChild(label);

    const selectedLayerIds = readMulti(el("answerArea").querySelector('[data-group="layers"]'));
    selectedLayerIds.forEach((layerId) => {
      const layer = Object.values(DEFENSE_LAYER).find((l) => l.id === layerId);
      const row = document.createElement("div");
      row.className = "tag-row";
      row.dataset.layer = layerId;
      const name = document.createElement("span");
      name.className = "tag-row-name";
      name.textContent = bi(layer.label, state.lang);
      row.appendChild(name);
      const tagOptions = Object.keys(LAYER_TAG).map((k) => ({ value: k, label: bi(LAYER_TAG[k], state.lang) }));
      row.appendChild(makeChoiceGroup(`tag-${layerId}`, tagOptions));
      tagBlock.appendChild(row);
    });
  }

  function collectStage3() {
    const area = el("answerArea");
    const layerIds = readMulti(area.querySelector('[data-group="layers"]'));
    const tags = {};
    layerIds.forEach((id) => {
      const tagGroupEl = area.querySelector(`[data-group="tag-${id}"]`);
      tags[id] = tagGroupEl ? readSingle(tagGroupEl) : null;
    });
    const allTagged = layerIds.length > 0 && layerIds.every((id) => !!tags[id]);
    const residualRiskId = readSingle(area.querySelector('[data-group="residualRisk"]'));
    const tradeoffId = readSingle(area.querySelector('[data-group="tradeoff"]'));
    return {
      layerIds,
      tags,
      residualRiskId,
      tradeoffId,
      complete: layerIds.length > 0 && allTagged && !!residualRiskId && !!tradeoffId,
    };
  }

  // -------------------------------------------------------------------
  // Stage 4: Access Model clause-tagging
  // -------------------------------------------------------------------

  function renderStage4(item) {
    const area = el("answerArea");
    area.innerHTML = "";

    const conceptOptions = Object.keys(CLAUSE_CONCEPT).map((k) => ({ value: k, label: bi(CLAUSE_CONCEPT[k], state.lang) }));

    item.clauses.forEach((clause) => {
      const block = fieldBlock(bi(clause.text, state.lang));
      block.appendChild(makeChoiceGroup(`clause-${clause.id}`, shuffle(conceptOptions)));
      area.appendChild(block);
    });
  }

  function collectStage4(item) {
    const area = el("answerArea");
    const clauseTags = {};
    item.clauses.forEach((clause) => {
      clauseTags[clause.id] = readSingle(area.querySelector(`[data-group="clause-${clause.id}"]`));
    });
    const complete = item.clauses.every((clause) => !!clauseTags[clause.id]);
    return { clauseTags, complete };
  }

  // -------------------------------------------------------------------
  // Stage 5: Requirement Builder
  // -------------------------------------------------------------------

  function renderStage5(item) {
    const area = el("answerArea");
    area.innerHTML = "";

    const vagueBox = document.createElement("div");
    vagueBox.className = "vague-requirement";
    vagueBox.textContent = bi(item.vagueRequirement, state.lang);
    area.appendChild(vagueBox);

    const behaviorBlock = fieldBlock(state.lang === "th" ? "ระบบต้อง [พฤติกรรม/คุณสมบัติ]" : "The system must [behavior / property]");
    behaviorBlock.appendChild(
      makeChoiceGroup("behavior", shuffle(item.behaviorOptions).map((o) => ({ value: o.id, label: bi(o, state.lang) })))
    );
    area.appendChild(behaviorBlock);

    const assetActionBlock = fieldBlock(state.lang === "th" ? "เพื่อ [ปกป้อง asset/action]" : "to [protect asset / action]");
    assetActionBlock.appendChild(
      makeChoiceGroup("assetAction", shuffle(item.assetActionOptions).map((o) => ({ value: o.id, label: bi(o, state.lang) })))
    );
    area.appendChild(assetActionBlock);

    const conditionBlock = fieldBlock(state.lang === "th" ? "ภายใต้ [เงื่อนไข/ข้อจำกัด]" : "under [condition / constraint]");
    conditionBlock.appendChild(
      makeChoiceGroup("condition", shuffle(item.conditionOptions).map((o) => ({ value: o.id, label: bi(o, state.lang) })))
    );
    area.appendChild(conditionBlock);

    const standardBlock = fieldBlock(
      state.lang === "th" ? "มาตรฐาน (เช่น NIST SP 800-53) ช่วยทีมในระดับใด" : "How far does a standard (e.g. NIST SP 800-53) help the team"
    );
    standardBlock.appendChild(
      makeChoiceGroup("standardRole", shuffle(STANDARD_ROLE_OPTIONS).map((o) => ({ value: o.id, label: bi(o, state.lang) })))
    );
    area.appendChild(standardBlock);
  }

  function collectStage5() {
    const area = el("answerArea");
    const behaviorId = readSingle(area.querySelector('[data-group="behavior"]'));
    const assetActionId = readSingle(area.querySelector('[data-group="assetAction"]'));
    const conditionId = readSingle(area.querySelector('[data-group="condition"]'));
    const standardRoleId = readSingle(area.querySelector('[data-group="standardRole"]'));
    return {
      behaviorId,
      assetActionId,
      conditionId,
      standardRoleId,
      complete: !!behaviorId && !!assetActionId && !!conditionId && !!standardRoleId,
    };
  }

  const RENDERERS = { principles: renderStage1, sort: renderStage2, stack: renderStage3, clauses: renderStage4, requirement: renderStage5 };
  const COLLECTORS = { principles: collectStage1, sort: collectStage2, stack: collectStage3, clauses: collectStage4, requirement: collectStage5 };

  // -------------------------------------------------------------------
  // Stage flow
  // -------------------------------------------------------------------

  function currentStage() {
    return STAGES[state.stageIndex];
  }

  function currentItem() {
    return currentStage().items[state.itemIndex];
  }

  function renderItem() {
    state.submitted = false;
    const stage = currentStage();
    const item = currentItem();

    el("stageNumber").textContent = String(state.stageIndex + 1);
    el("stageName").textContent = t(stage.nameKey, state.lang);
    el("itemProgress").textContent =
      (state.lang === "th" ? "ข้อ " : "Item ") + (state.itemIndex + 1) + " / " + stage.items.length;

    const hasScenarioCard = stage.kind !== "requirement";
    el("scenarioCard").hidden = !hasScenarioCard;
    if (hasScenarioCard) {
      el("itemTitle").textContent = item.title ? bi(item.title, state.lang) : "";
      el("itemScenario").textContent = item.scenario ? bi(item.scenario, state.lang) : "";
    }

    RENDERERS[stage.kind](item);

    el("feedbackBox").hidden = true;
    el("submitBtn").hidden = false;
    el("nextBtn").hidden = true;

  }

  function isLastItemOfStage() {
    return state.itemIndex >= currentStage().items.length - 1;
  }

  function isLastStage() {
    return state.stageIndex >= STAGES.length - 1;
  }

  function handleSubmit() {
    if (state.submitted) return;
    state.submitted = true;

    const stage = currentStage();
    const item = currentItem();
    const answer = COLLECTORS[stage.kind](item);

    if (!answer.complete) {
      state.submitted = false;
      showIncompleteHint();
      return;
    }

    let result;
    if (stage.kind === "principles") result = scoreStage1(item, answer);
    else if (stage.kind === "sort") result = scoreStage2All(item, answer);
    else if (stage.kind === "stack") result = scoreStage3(item, answer);
    else if (stage.kind === "clauses") result = scoreStage4(item, answer);
    else result = scoreStage5(item, answer);

    state.stageResults[stage.key].push(result.ratio);

    showFeedback(item, result);

    el("submitBtn").hidden = true;
    const nextBtn = el("nextBtn");
    nextBtn.hidden = false;
    const isFinalItem = isLastItemOfStage() && isLastStage();
    nextBtn.textContent = t(isFinalItem ? "seeResultsButton" : "nextButton", state.lang);
  }

  function showIncompleteHint() {
    const box = el("feedbackBox");
    box.hidden = false;
    box.classList.add("hint");
    box.classList.remove("warning");
    el("feedbackHeadline").textContent =
      state.lang === "th" ? "กรอกคำตอบให้ครบทุกส่วนก่อนส่ง" : "Fill in every part of the answer before submitting.";
    el("feedbackExplanation").textContent = "";
    setTimeout(() => {
      box.hidden = true;
      box.classList.remove("hint");
    }, 1800);
  }

  function showFeedback(item, result) {
    const box = el("feedbackBox");
    box.hidden = false;
    box.classList.remove("hint", "warning");

    if (result.singlePointOfFailure) {
      box.classList.add("warning");
      el("feedbackHeadline").textContent = t("spofWarningTitle", state.lang);
      el("feedbackExplanation").textContent = t("spofWarningBody", state.lang);
      return;
    }

    const pct = Math.round(result.ratio * 100);
    el("feedbackHeadline").textContent =
      (state.lang === "th" ? "ความแม่นยำของข้อนี้: " : "Accuracy for this item: ") + pct + "%";
    el("feedbackExplanation").textContent = item.explanation ? bi(item.explanation, state.lang) : "";
  }

  function goToNext() {
    if (!isLastItemOfStage()) {
      state.itemIndex += 1;
      renderItem();
      return;
    }
    if (!isLastStage()) {
      state.stageIndex += 1;
      state.itemIndex = 0;
      renderItem();
      return;
    }
    showResults();
  }

  // -------------------------------------------------------------------
  // Results & certificate
  // -------------------------------------------------------------------

  function average(list) {
    if (!list.length) return 0;
    return (list.reduce((a, b) => a + b, 0) / list.length) * 100;
  }

  function showResults() {
    const stageAccuracies = {
      s1: average(state.stageResults.s1),
      s2: average(state.stageResults.s2),
      s3: average(state.stageResults.s3),
      s4: average(state.stageResults.s4),
      s5: average(state.stageResults.s5),
    };
    const outcome = evaluateLearningOutcome(stageAccuracies);
    state.lastOutcome = outcome;

    el("rankBadge").textContent = outcome.badge;
    el("rankTitle").textContent = bi(outcome.title, state.lang);
    el("rankDescription").textContent = bi(outcome.description, state.lang);
    el("overallAccuracyValue").textContent = Math.round(outcome.accuracy) + "%";

    const breakdown = el("stageBreakdown");
    breakdown.innerHTML = "";
    STAGES.forEach((stage) => {
      const row = document.createElement("div");
      row.className = "breakdown-row";
      const label = document.createElement("span");
      label.textContent = t(stage.nameKey, state.lang);
      const value = document.createElement("span");
      value.className = "mono";
      value.textContent = Math.round(stageAccuracies[stage.key]) + "%";
      row.appendChild(label);
      row.appendChild(value);
      breakdown.appendChild(row);
    });

    showScreen("screen-results");
  }

  function formatLocalDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function openCertificate() {
    const dateStr = formatLocalDate();
    el("certName").textContent = state.player.name;
    el("certId").textContent = state.player.id;
    el("certDate").textContent = dateStr;
    el("certRankLabel").textContent = state.lang === "th" ? "ช่วงผลการฝึก" : "Practice band";
    el("certRankValue").textContent = bi(state.lastOutcome.title, state.lang);
    el("certAccuracy").textContent = Math.round(state.lastOutcome.accuracy) + "%";
    el("certSignature").textContent = state.lang === "th"
      ? "สร้างในเบราว์เซอร์นี้เท่านั้น — ไม่ใช่ระเบียนทางการหรือระเบียนที่ตรวจสอบได้"
      : "Generated in this browser only — not an official or verifiable record.";
    el("certModal").hidden = false;
  }

  // -------------------------------------------------------------------
  // Wiring
  // -------------------------------------------------------------------

  function resetGame() {
    state.stageIndex = 0;
    state.itemIndex = 0;
    state.stageResults = { s1: [], s2: [], s3: [], s4: [], s5: [] };
    el("stageIndicator").hidden = true;
    showScreen("screen-start");
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyStaticI18n();

    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.lang = setLanguage(btn.getAttribute("data-lang"));
        applyStaticI18n();
        const activeScreen = document.querySelector(".screen.active");
        if (activeScreen && activeScreen.id === "screen-stage") {
          renderItem();
        } else if (activeScreen && activeScreen.id === "screen-results") {
          showResults();
        }
      });
    });

    el("startForm").addEventListener("submit", (e) => {
      e.preventDefault();
      state.player.name = el("playerName").value.trim();
      state.player.id = el("playerId").value.trim();
      if (!state.player.name || !state.player.id) return;
      el("stageIndicator").hidden = false;
      showScreen("screen-stage");
      renderItem();
    });

    el("submitBtn").addEventListener("click", handleSubmit);
    el("nextBtn").addEventListener("click", goToNext);
    el("playAgainBtn").addEventListener("click", resetGame);
    el("certBtn").addEventListener("click", openCertificate);
    el("certCloseBtn").addEventListener("click", () => {
      el("certModal").hidden = true;
    });
    el("certPrintBtn").addEventListener("click", () => window.print());
  });
})();
