(function () {
  /** @type {ReturnType<defaultCharacter>} */
  let ch = loadCharacter();

  const chatLog = $("#chatLog");
  const input = $("#chatInput");

  const STORY_KEY = "trpg.story.v1";
  const AI_CONF_KEY = "trpg.ai.config.v1";

  const GENRE_MOTIFS = {
    sf: {
      places: ["우주 정거장", "폐허가 된 돔 시티", "성간 화물선", "빙하 아래 연구기지", "궤도 엘리베이터"],
      hooks: ["불법 화물", "사라진 승무원", "이상한 생체 신호", "기억 삭제", "AI 반란의 잔재"],
      npcs: ["수리공", "보안 요원", "익명 의뢰인", "망명 과학자", "선장의 부관"],
      tones: ["하드 SF", "사이버펑크", "레트로 퓨처", "우주 스릴러"],
    },
    fantasy: {
      places: ["왕도", "폐허 사원", "떠다니는 섬", "용의 산맥", "검은 시장"],
      hooks: ["봉인된 이름", "저주받은 지도", "왕궁의 배신자", "사라진 성물", "깨어난 고대 계약"],
      npcs: ["수도승", "길드 마스터", "방랑 기사", "마녀", "왕실 사자"],
      tones: ["고전 판타지", "다크 판타지", "검과 마법", "동화풍 잔혹극"],
    },
    mystery: {
      places: ["비 내리는 골목", "낡은 호텔", "지하철 막차", "폐쇄된 학교", "호숫가 별장"],
      hooks: ["잠긴 방", "익명의 협박", "사라진 녹음 파일", "연쇄 실종", "기억의 틈"],
      npcs: ["관리인", "기자", "경찰", "목격자", "친구였던 사람"],
      tones: ["누아르", "미스터리", "심리 스릴러", "로우 호러"],
    },
  };

  const DEFAULT_AI_CONFIG = {
    endpoint: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o-mini",
    apiKey: "",
  };

  let story = loadStory();
  let aiConfig = loadAiConfig();
  let lastDiceSummary = "";
  let aiBusy = false;
  const CHECK_PREFIX = "CHECK_REQUEST:";
  const CHECK_RESULT_PREFIX = "CHECK_RESULT:";
  let aiTest = loadAiTestState();

  function renderCharacter() {
    ch = computeDerived(ch);
    $("#charNamePill").textContent = `캐릭터: ${ch.identity.characterName || "-"}`;
    $("#charSub").textContent = `플레이어: ${ch.identity.playerName || "-"} · 캠페인: ${ch.identity.campaign || "-"}`;

    $("#hpLine").textContent = `${ch.vitals.hpCurrent} / ${ch.vitals.hpMax}`;
    $("#mpLine").textContent = `${ch.vitals.mpCurrent} / ${ch.vitals.mpMax}`;
    $("#stressLine").textContent = String(ch.vitals.stress ?? 0);

    $("#aStr").textContent = String(ch.attributes.str);
    $("#aDex").textContent = String(ch.attributes.dex);
    $("#aCon").textContent = String(ch.attributes.con);
    $("#aInt").textContent = String(ch.attributes.int);
    $("#aWis").textContent = String(ch.attributes.wis);
    $("#aLuck").textContent = String(ch.attributes.luck);

    $("#dAtk").textContent = String(ch.derived.attack);
    $("#dDef").textContent = String(ch.derived.defense);
    $("#dInit").textContent = String(ch.derived.initiative);
    $("#dMov").textContent = String(ch.derived.move);
    $("#dCar").textContent = String(ch.derived.carry);

    const p = $("#portrait");
    p.innerHTML = "";
    if (ch.identity.portraitUrl) {
      const img = document.createElement("img");
      img.src = ch.identity.portraitUrl;
      img.alt = "초상";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      img.onerror = () => {
        p.innerHTML = "";
        p.appendChild(makePortraitFallback());
      };
      p.appendChild(img);
    } else {
      p.appendChild(makePortraitFallback());
    }
  }

  function makePortraitFallback() {
    const div = document.createElement("div");
    div.style.width = "100%";
    div.style.height = "100%";
    div.style.display = "grid";
    div.style.placeItems = "center";
    div.style.fontWeight = "900";
    div.style.letterSpacing = ".5px";
    div.style.color = "rgba(232,236,255,.9)";
    div.style.background =
      "radial-gradient(closest-side at 30% 20%, rgba(124,92,255,.55), transparent 70%), radial-gradient(closest-side at 70% 70%, rgba(34,211,238,.30), transparent 70%), rgba(255,255,255,.04)";
    const name = (ch.identity.characterName || "TRPG").trim();
    div.textContent = name.slice(0, 2);
    return div;
  }

  function appendMsg({ type = "user", who = "나", text = "", extra = "" }) {
    const el = document.createElement("div");
    el.className = "msg";
    if (type === "system") el.classList.add("system");
    if (type === "dice") el.classList.add("dice");
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.innerHTML = `<span>${escapeHtml(who)}</span><span>·</span><span>${nowTime()}</span>`;
    const body = document.createElement("div");
    const textHtml = escapeHtml(text).replaceAll("\n", "<br />");
    const extraHtml = extra ? escapeHtml(extra).replaceAll("\n", "<br />") : "";
    body.innerHTML = `<div>${textHtml}</div>${extra ? `<div class="mono" style="margin-top:6px; color: var(--muted)">${extraHtml}</div>` : ""}`;
    el.appendChild(meta);
    el.appendChild(body);
    chatLog.appendChild(el);
    chatLog.scrollTop = chatLog.scrollHeight;
    return el;
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function randInt(min, max) {
    // [min, max] inclusive
    const range = max - min + 1;
    if (range <= 0) return min;
    if (globalThis.crypto?.getRandomValues) {
      const arr = new Uint32Array(1);
      globalThis.crypto.getRandomValues(arr);
      return min + (arr[0] % range);
    }
    return min + Math.floor(Math.random() * range);
  }

  function parseDiceCommand(s) {
    const m = String(s).trim().match(/^(\d{1,3})\s*d\s*(\d{1,3})\s*([+-]\s*\d{1,4})?\s*$/i);
    if (!m) return null;
    const n = Number(m[1]);
    const sides = Number(m[2]);
    const modRaw = m[3] ? m[3].replaceAll(" ", "") : "";
    const mod = modRaw ? Number(modRaw) : 0;

    if (!Number.isFinite(n) || !Number.isFinite(sides) || !Number.isFinite(mod)) return null;
    // 안전장치
    const N = clamp(n, 1, 200);
    const S = clamp(sides, 2, 1000);
    const M = clamp(mod, -10000, 10000);

    return { n: N, sides: S, mod: M, raw: `${N}d${S}${M ? (M > 0 ? `+${M}` : `${M}`) : ""}` };
  }

  function rollDice(cmd) {
    const rolls = [];
    for (let i = 0; i < cmd.n; i++) rolls.push(randInt(1, cmd.sides));
    const sum = rolls.reduce((a, b) => a + b, 0);
    const total = sum + (cmd.mod || 0);
    return { rolls, sum, total };
  }

  function formatRolls(rolls) {
    const maxShow = 30;
    if (rolls.length <= maxShow) return `(${rolls.join(" + ")})`;
    const head = rolls.slice(0, maxShow).join(" + ");
    return `(${head} + … + ${rolls.length - maxShow}개 더)`;
  }

  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    input.value = "";

    const dice = parseDiceCommand(text);
    if (dice) {
      const result = rollDice(dice);
      const lhs = formatRolls(result.rolls);
      const base = `${lhs} = ${result.sum}`;
      const final = dice.mod ? `${base} ${dice.mod > 0 ? "+" : "-"} ${Math.abs(dice.mod)} = ${result.total}` : base;
      appendMsg({ type: "dice", who: ch.identity.characterName || "주사위", text: dice.raw, extra: final });
      lastDiceSummary = `${dice.raw}: ${final}`;

      if (story.enabled && story.started) {
        // 판정 대기 중이면 해당 판정으로 처리
        if (story.pendingCheck) {
          const resolved = resolvePendingCheckWithRoll(story.pendingCheck, dice, result);
          // 결과는 AI에게 전달하고, AI가 성공/실패 및 후속 전개를 설명하도록 한다.
          story.history.push({ role: "system", content: `${CHECK_RESULT_PREFIX} ${JSON.stringify(resolved)}` });
          story.pendingCheck = null;
          saveStory(story);
          appendMsg({ type: "system", who: "시스템", text: "주사위 결과를 마스터에게 전달했어요. 판정 처리중..." });
          respondAsGm();
          return;
        }

        story.history.push({ role: "system", content: `주사위 결과: ${lastDiceSummary}` });
        saveStory(story);
      }
      return;
    }

    appendMsg({ type: "user", who: ch.identity.characterName || "나", text });

    if (story.enabled && story.started) {
      if (story.pendingCheck) {
        if (/^(취소|cancel|그만|판정취소)$/i.test(text)) {
          const pending = story.pendingCheck;
          story.pendingCheck = null;
          story.history.push({ role: "system", content: `플레이어가 판정을 취소하고 행동을 변경했다. 취소된 판정: ${JSON.stringify(pending)}` });
          saveStory(story);
          appendMsg({ type: "system", who: "시스템", text: "판정을 취소했어요. 원하는 행동을 다시 말해줘요." });
          return;
        }
        appendMsg({ type: "system", who: "시스템", text: `현재 판정 대기중이에요. 먼저 주사위를 굴려줘요: ${formatRollPrompt(story.pendingCheck)}` });
        return;
      }

      story.history.push({ role: "user", content: text });
      saveStory(story);
      respondAsGm();
      return;
    }
  }

  function adjustHp(delta) {
    ch.vitals.hpCurrent = clamp(Number(ch.vitals.hpCurrent) + delta, 0, Math.max(1, Number(ch.vitals.hpMax) || 1));
    ch = saveCharacter(ch);
    renderCharacter();
  }
  function adjustMp(delta) {
    ch.vitals.mpCurrent = clamp(Number(ch.vitals.mpCurrent) + delta, 0, Math.max(1, Number(ch.vitals.mpMax) || 1));
    ch = saveCharacter(ch);
    renderCharacter();
  }

  function exportXlsxFromGame() {
    // 캐릭터 생성 페이지와 동일 포맷
    const rowsKV = [
      ["항목", "값", "키"],
      ["캐릭터 이름", ch.identity.characterName, "identity.characterName"],
      ["플레이어", ch.identity.playerName, "identity.playerName"],
      ["캠페인", ch.identity.campaign, "identity.campaign"],
      ["컨셉", ch.identity.concept, "identity.concept"],
      ["아키타입/직업", ch.identity.archetype, "identity.archetype"],
      ["레벨", ch.identity.level, "identity.level"],
      ["나이", ch.identity.age, "identity.age"],
      ["대명사", ch.identity.pronouns, "identity.pronouns"],
      ["초상 URL", ch.identity.portraitUrl, "identity.portraitUrl"],
      ["(메타)버전", ch.meta.version, "meta.version"],
      ["(메타)생성일", ch.meta.createdAt, "meta.createdAt"],
      ["(메타)수정일", ch.meta.updatedAt, "meta.updatedAt"],
    ];
    const rowsVitals = [
      ["항목", "값", "키"],
      ["체력(현재)", ch.vitals.hpCurrent, "vitals.hpCurrent"],
      ["체력(최대)", ch.vitals.hpMax, "vitals.hpMax"],
      ["정신력(현재)", ch.vitals.mpCurrent, "vitals.mpCurrent"],
      ["정신력(최대)", ch.vitals.mpMax, "vitals.mpMax"],
      ["스트레스", ch.vitals.stress, "vitals.stress"],
    ];
    const rowsAttr = [
      ["항목", "값", "키"],
      ["힘(STR)", ch.attributes.str, "attributes.str"],
      ["민첩(DEX)", ch.attributes.dex, "attributes.dex"],
      ["체질(CON)", ch.attributes.con, "attributes.con"],
      ["지능(INT)", ch.attributes.int, "attributes.int"],
      ["지혜(WIS)", ch.attributes.wis, "attributes.wis"],
      ["행운(LUCK)", ch.attributes.luck, "attributes.luck"],
    ];
    const rowsDerived = [
      ["항목", "값", "키"],
      ["공격", ch.derived.attack, "derived.attack"],
      ["방어", ch.derived.defense, "derived.defense"],
      ["선제", ch.derived.initiative, "derived.initiative"],
      ["이동", ch.derived.move, "derived.move"],
      ["소지", ch.derived.carry, "derived.carry"],
    ];
    const rowsSkills = [["이름", "수치", "메모"], ...ch.skills.map((s) => [s.name, Number(s.value) || 0, s.note || ""])];
    const rowsEquip = [
      ["이름", "수량", "메모"],
      ...ch.equipment.map((it) => [it.name, Number(it.qty) || 0, it.note || ""]),
    ];
    const rowsNotes = [
      ["항목", "값", "키"],
      ["특성", ch.notes.traits, "notes.traits"],
      ["유대", ch.notes.bonds, "notes.bonds"],
      ["결함", ch.notes.flaws, "notes.flaws"],
      ["배경", ch.notes.backstory, "notes.backstory"],
      ["GM 메모", ch.notes.gmNotes, "notes.gmNotes"],
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rowsKV), "Character");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rowsVitals), "Vitals");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rowsAttr), "Attributes");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rowsDerived), "Derived");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rowsSkills), "Skills");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rowsEquip), "Equipment");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rowsNotes), "Notes");

    const name = (ch.identity.characterName || "character").trim().replace(/[\\/:*?"<>|]/g, "_");
    XLSX.writeFile(wb, `${name}.xlsx`);
  }

  function importXlsxGame(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const next = defaultCharacter();

        const applyKV = (sheetName) => {
          const ws = wb.Sheets[sheetName];
          if (!ws) return;
          const rows = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i] || [];
            const value = row[1];
            const key = row[2];
            if (!key) continue;
            setByDotPath(next, key, value);
          }
        };
        applyKV("Character");
        applyKV("Vitals");
        applyKV("Attributes");
        applyKV("Notes");

        const wsSkills = wb.Sheets["Skills"];
        if (wsSkills) {
          const rows = XLSX.utils.sheet_to_json(wsSkills, { header: 1, blankrows: false });
          const parsed = [];
          for (let i = 1; i < rows.length; i++) {
            const [name, value, note] = rows[i] || [];
            if (!name) continue;
            parsed.push({ name: String(name), value: Number(value) || 0, note: note ? String(note) : "" });
          }
          if (parsed.length) next.skills = parsed;
        }

        const wsEq = wb.Sheets["Equipment"];
        if (wsEq) {
          const rows = XLSX.utils.sheet_to_json(wsEq, { header: 1, blankrows: false });
          const parsed = [];
          for (let i = 1; i < rows.length; i++) {
            const [name, qty, note] = rows[i] || [];
            if (!name) continue;
            parsed.push({ name: String(name), qty: Number(qty) || 0, note: note ? String(note) : "" });
          }
          if (parsed.length) next.equipment = parsed;
        }

        next.identity.level = Math.max(1, Number(next.identity.level) || 1);
        next.vitals.hpMax = Math.max(1, Number(next.vitals.hpMax) || 1);
        next.vitals.mpMax = Math.max(1, Number(next.vitals.mpMax) || 1);
        next.vitals.hpCurrent = clamp(Number(next.vitals.hpCurrent), 0, next.vitals.hpMax);
        next.vitals.mpCurrent = clamp(Number(next.vitals.mpCurrent), 0, next.vitals.mpMax);
        for (const k of ["str", "dex", "con", "int", "wis", "luck"]) next.attributes[k] = Number(next.attributes[k]) || 0;
        next.vitals.stress = Number(next.vitals.stress) || 0;

        ch = saveCharacter(next);
        renderCharacter();
        appendMsg({ type: "system", who: "시스템", text: "xlsx에서 캐릭터를 가져왔어요." });
        toast("캐릭터를 불러왔어요.");
      } catch (err) {
        console.error(err);
        toast("xlsx 가져오기에 실패했어요.");
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function setByDotPath(obj, dotPath, value) {
    const parts = String(dotPath).split(".").filter(Boolean);
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (!cur[p] || typeof cur[p] !== "object") cur[p] = {};
      cur = cur[p];
    }
    cur[parts[parts.length - 1]] = value;
  }

  // ===== 이벤트 =====
  $("#chatSend").addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  $("#hpMinus").addEventListener("click", () => adjustHp(-1));
  $("#hpPlus").addEventListener("click", () => adjustHp(1));
  $("#mpMinus").addEventListener("click", () => adjustMp(-1));
  $("#mpPlus").addEventListener("click", () => adjustMp(1));

  $("#btnClearChat").addEventListener("click", () => {
    chatLog.innerHTML = "";
    appendMsg({ type: "system", who: "시스템", text: "채팅 로그를 비웠어요." });
  });

  $("#btnLoadLocal").addEventListener("click", () => {
    ch = loadCharacter();
    renderCharacter();
    appendMsg({ type: "system", who: "시스템", text: "로컬 저장소에서 캐릭터를 불러왔어요." });
  });

  $("#btnExportGame").addEventListener("click", () => {
    ch = saveCharacter(ch);
    exportXlsxFromGame();
    toast("xlsx로 내보냈어요.");
  });

  $("#fileImportGame").addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importXlsxGame(file);
    e.target.value = "";
  });

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-quick]");
    if (!b) return;
    const cmd = b.dataset.quick;
    input.value = cmd;
    input.focus();
    sendMessage();
  });

  // ===== AI 스토리 UI =====
  const elGenre = $("#storyGenre");
  const elToggle = $("#btnStoryToggle");
  const elStart = $("#btnStoryStart");
  const elReset = $("#btnStoryReset");
  const elStatus = $("#aiStatus");
  const elEndpoint = $("#aiEndpoint");
  const elModel = $("#aiModel");
  const elKey = $("#aiKey");
  const elAiSave = $("#btnAiSave");
  const elAiTest = $("#btnAiTest");
  const elAiClear = $("#btnAiClear");

  function loadStory() {
    const raw = localStorage.getItem(STORY_KEY);
    const parsed = safeJsonParse(raw);
    if (!parsed || typeof parsed !== "object") {
      return { enabled: false, started: false, genre: "sf", history: [], seed: "", pendingCheck: null };
    }
    return {
      enabled: Boolean(parsed.enabled),
      started: Boolean(parsed.started),
      genre: typeof parsed.genre === "string" ? parsed.genre : "sf",
      history: Array.isArray(parsed.history) ? parsed.history : [],
      seed: typeof parsed.seed === "string" ? parsed.seed : "",
      pendingCheck: parsed.pendingCheck && typeof parsed.pendingCheck === "object" ? parsed.pendingCheck : null,
    };
  }

  function saveStory(s) {
    localStorage.setItem(STORY_KEY, JSON.stringify(s));
  }

  function loadAiConfig() {
    const raw = localStorage.getItem(AI_CONF_KEY);
    const parsed = safeJsonParse(raw);
    if (!parsed || typeof parsed !== "object") return { ...DEFAULT_AI_CONFIG };
    return {
      endpoint: typeof parsed.endpoint === "string" && parsed.endpoint ? parsed.endpoint : DEFAULT_AI_CONFIG.endpoint,
      model: typeof parsed.model === "string" && parsed.model ? parsed.model : DEFAULT_AI_CONFIG.model,
      apiKey: typeof parsed.apiKey === "string" ? parsed.apiKey : "",
    };
  }

  function saveAiConfig(c) {
    localStorage.setItem(AI_CONF_KEY, JSON.stringify(c));
  }

  function loadAiTestState() {
    const raw = localStorage.getItem("trpg.ai.test.v1");
    const parsed = safeJsonParse(raw);
    if (!parsed || typeof parsed !== "object") return { ok: null, at: "", error: "" };
    return {
      ok: typeof parsed.ok === "boolean" ? parsed.ok : null,
      at: typeof parsed.at === "string" ? parsed.at : "",
      error: typeof parsed.error === "string" ? parsed.error : "",
    };
  }

  function saveAiTestState(s) {
    localStorage.setItem("trpg.ai.test.v1", JSON.stringify(s));
  }

  function updateAiUi() {
    elGenre.value = story.genre || "sf";
    elToggle.textContent = `스토리: ${story.enabled ? "ON" : "OFF"}`;
    elEndpoint.value = aiConfig.endpoint;
    elModel.value = aiConfig.model;

    // 보안/혼란 방지: 저장된 키를 입력칸에 다시 쓰지 않는다(8글자처럼 보이는 문제 방지)
    if (document.activeElement !== elKey) {
      elKey.value = "";
      elKey.placeholder = aiConfig.apiKey ? "저장됨(보안상 표시 안 함). 새 키를 입력하면 교체" : "sk-...";
    }

    const keyState = aiConfig.apiKey ? "AI 키 저장됨" : "AI 키 없음(오프라인 GM)";
    const started = story.started ? "스토리 진행 중" : "스토리 미시작";
    const pending = story.pendingCheck ? ` · 판정 대기: ${formatCheckShort(story.pendingCheck)}` : "";
    const testState =
      aiTest.ok === true
        ? ` · 테스트: 성공(${aiTest.at || "-"})`
        : aiTest.ok === false
          ? ` · 테스트: 실패(${aiTest.at || "-"})`
          : " · 테스트: 미실행";
    elStatus.textContent = `${started} · ${keyState}${testState} · 장르: ${labelGenre(story.genre)}${pending}`;
  }

  function labelGenre(g) {
    if (g === "sf") return "SF";
    if (g === "fantasy") return "판타지";
    return "기타(미스터리/호러)";
  }

  function characterSummaryText() {
    const name = ch.identity.characterName || "이름 없음";
    const concept = ch.identity.concept || "-";
    const arch = ch.identity.archetype || "-";
    const lvl = ch.identity.level || 1;
    const a = ch.attributes;
    const v = ch.vitals;
    return [
      `캐릭터: ${name} (아키타입: ${arch}, 레벨: ${lvl})`,
      `컨셉: ${concept}`,
      `자원: 체력 ${v.hpCurrent}/${v.hpMax}, 정신력 ${v.mpCurrent}/${v.mpMax}, 스트레스 ${v.stress || 0}`,
      `능력치: STR ${a.str}, DEX ${a.dex}, CON ${a.con}, INT ${a.int}, WIS ${a.wis}, LUCK ${a.luck}`,
      `파생치: 공격 ${ch.derived.attack}, 방어 ${ch.derived.defense}, 선제 ${ch.derived.initiative}, 이동 ${ch.derived.move}`,
    ].join("\n");
  }

  function systemPromptForGenre(genre) {
    return [
      "너는 TRPG의 게임마스터(GM)다. 사용자(플레이어)의 선택에 반응하며 장면을 진행한다.",
      "톤은 한국어로, 몰입감 있게. 과도하게 길지 않게(대략 6~12문장).",
      "플레이어의 행동을 멋지게 해석하되, 플레이어의 의사결정을 대신하지 않는다.",
      "항상 마지막에 플레이어에게 '무엇을 할 것인지' 질문한다. 선택지를 강제로 나열하지 않는다.",
      "주사위 결과(system 메시지)가 있으면 그 결과를 존중해 판정/결과를 묘사한다.",
      "",
      "중요: 판정이 필요하다고 판단되면, 너는 '굴리기 요청'만 하고 결과는 기다려야 한다.",
      `- 판정 요청은 반드시 마지막 줄에 아래 형식 1줄로만 출력한다: ${CHECK_PREFIX} {\"stat\":\"DEX\",\"dc\":14,\"dice\":\"1d20\",\"reason\":\"짧은 이유\"}`,
      "- 위 JSON에는 stat(STR/DEX/CON/INT/WIS/LUCK), dc(정수), dice(예: 1d20), reason(짧게)를 포함한다.",
      "- 판정 요청을 출력한 턴에는 성공/실패 결과를 확정해서는 안 된다(플레이어의 주사위를 기다린다).",
      `- 판정 결과는 system 메시지로 ${CHECK_RESULT_PREFIX} {...} 형태로 들어온다. 그걸 보고 성공/실패를 설명하고 다음 장면을 진행한다.`,
      "- 코드블록/마크다운 펜스(```` ``` ` ````)는 사용하지 않는다.",
      "",
      `장르: ${labelGenre(genre)}`,
      "플레이어 캐릭터 요약:",
      characterSummaryText(),
    ].join("\n");
  }

  function makeSeed() {
    const n = randInt(100000, 999999);
    return `${Date.now()}-${n}`;
  }

  function buildOpeningRequest(genre) {
    const g = GENRE_MOTIFS[genre] || GENRE_MOTIFS.sf;
    const pick = (arr) => arr[randInt(0, arr.length - 1)];
    const place = pick(g.places);
    const hook = pick(g.hooks);
    const npc = pick(g.npcs);
    const tone = pick(g.tones);

    return [
      "지금부터 새 캠페인의 '첫 장면(오프닝)'을 만들어라. 매번 새롭게 생성한다.",
      "아래 조건을 반드시 지켜서 출력하라:",
      "- 프롤로그는 정확히 3줄(각 줄은 문장 1~2개)",
      "- 그 다음 줄에 '플레이어는 이렇게 시작한다:'로 시작하는 1문단(2~4문장)",
      "- 마지막에 플레이어에게 '무엇을 할 것인가?'라고 질문하고, 선택지는 나열하지 않는다(플레이어가 자유롭게 채팅으로 행동을 말한다)",
      "- 설정은 장르에 맞게, 그러나 과장된 고유명사 남발은 피한다",
      "",
      `장르 힌트: ${labelGenre(genre)} / 톤: ${tone}`,
      `장소 힌트: ${place}`,
      `사건(훅) 힌트: ${hook}`,
      `등장 NPC 힌트: ${npc}`,
      `랜덤 시드: ${story.seed || ""}`,
    ].join("\n");
  }

  function startStory() {
    story.genre = elGenre.value || "sf";
    story.started = true;
    story.enabled = true;
    story.history = [];
    story.seed = makeSeed();
    story.pendingCheck = null;
    lastDiceSummary = "";

    // 오프닝은 AI에게 요청해서 매번 새로 생성 (키 없으면 오프라인 GM이 랜덤 생성)
    story.history.push({ role: "system", content: buildOpeningRequest(story.genre) });
    saveStory(story);
    updateAiUi();
    respondAsGm();
  }

  function resetStory() {
    story = { enabled: false, started: false, genre: "sf", history: [], seed: "", pendingCheck: null };
    saveStory(story);
    updateAiUi();
    appendMsg({ type: "system", who: "시스템", text: "스토리 상태를 초기화했어요." });
  }

  async function respondAsGm() {
    if (aiBusy) return;
    aiBusy = true;
    const thinkingEl = appendMsg({ type: "system", who: "AI 마스터", text: "생각중..." });

    try {
      const reply = aiConfig.apiKey ? await callOpenAiGm() : offlineGmReply();
      const parsed = parseCheckRequest(reply);
      const visible = parsed.check ? (parsed.cleanText || "판정이 필요해.") : parsed.cleanText || reply;
      updateMsgElement(thinkingEl, visible);

      story.history.push({ role: "assistant", content: reply });

      if (parsed.check) {
        story.pendingCheck = normalizeCheck(parsed.check);
        story.history.push({ role: "system", content: `GM이 판정을 요청했다: ${JSON.stringify(story.pendingCheck)}` });
        appendMsg({ type: "system", who: "시스템", text: `판정 필요: ${formatRollPrompt(story.pendingCheck)}` });
      }

      saveStory(story);
      updateAiUi();
    } catch (err) {
      console.error(err);
      updateMsgElement(thinkingEl, "AI 응답에 실패했어요. (오프라인 GM으로 이어갈 수도 있어요)\n원인: 네트워크/키/모델/엔드포인트 설정");
    } finally {
      aiBusy = false;
    }
  }

  function updateMsgElement(el, text) {
    const body = el.querySelector("div:last-child");
    const textHtml = escapeHtml(text).replaceAll("\n", "<br />");
    body.innerHTML = `<div>${textHtml}</div>`;
  }

  async function callOpenAiGm() {
    const endpoint = (aiConfig.endpoint || DEFAULT_AI_CONFIG.endpoint).trim();
    const model = (aiConfig.model || DEFAULT_AI_CONFIG.model).trim();
    const system = systemPromptForGenre(story.genre);
    // story.history에 'system' 오프닝 요청이 포함될 수 있음
    const msgs = [{ role: "system", content: system }, ...story.history].slice(-40);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aiConfig.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: msgs,
        temperature: 0.9,
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`AI HTTP ${res.status}: ${t}`);
    }
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error("AI 응답 형식이 예상과 달라요.");
    return String(text).trim();
  }

  async function testAiConnection() {
    if (!aiConfig.apiKey) {
      toast("API 키가 없어요.");
      return;
    }
    const endpoint = (aiConfig.endpoint || DEFAULT_AI_CONFIG.endpoint).trim();
    const model = (aiConfig.model || DEFAULT_AI_CONFIG.model).trim();

    appendMsg({ type: "system", who: "시스템", text: "AI 연결 테스트를 시작합니다..." });

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${aiConfig.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: "ping" }],
          temperature: 0,
          max_tokens: 8,
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`HTTP ${res.status}: ${t}`);
      }
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (!text) throw new Error("응답 형식이 예상과 달라요.");

      aiTest = { ok: true, at: new Date().toLocaleString(), error: "" };
      saveAiTestState(aiTest);
      updateAiUi();
      appendMsg({ type: "system", who: "시스템", text: `테스트 성공. 응답: ${String(text).trim()}` });
      toast("연결 테스트 성공");
    } catch (err) {
      const msg = String(err?.message || err || "unknown error");
      aiTest = { ok: false, at: new Date().toLocaleString(), error: msg };
      saveAiTestState(aiTest);
      updateAiUi();
      appendMsg({ type: "system", who: "시스템", text: `테스트 실패: ${msg}` });
      toast("연결 테스트 실패");
    }
  }

  function offlineGmReply() {
    const last = story.history[story.history.length - 1];
    const g = story.genre || "sf";
    const motif = GENRE_MOTIFS[g] || GENRE_MOTIFS.sf;
    const pick = (arr) => arr[randInt(0, arr.length - 1)];
    const name = ch.identity.characterName || "당신";

    const renderOpening = () => {
      const place = pick(motif.places);
      const hook = pick(motif.hooks);
      const npc = pick(motif.npcs);
      const tone = pick(motif.tones);
      const prologue = [
        `${tone}의 공기가 감도는 ${place}. 평소와 다른 정적이 스민다.`,
        `${name}의 손에는 작은 단서 하나가 쥐어져 있다. 그리고 '${hook}'의 그림자가 다가온다.`,
        `멀지 않은 곳에서 ${npc}가 당신을 발견하고, 급하게 손짓한다.`,
      ].join("\n");
      const start = `플레이어는 이렇게 시작한다: ${name}는(은) 막 도착한 직후다. 누군가가 당신에게만 들리게 상황을 귀띔했고, 시간은 촉박하다. 당신의 첫 선택이 오늘의 흐름을 정한다.`;
      return [prologue, "", start, "", "무엇을 할 것인가?"].join("\n");
    };

    // 오프닝 요청(system)이 마지막이면 오프닝 생성
    if (last?.role === "system" && String(last.content || "").includes("첫 장면(오프닝)")) {
      return renderOpening();
    }

    // 체크 결과가 들어오면 후속 전개
    if (last?.role === "system" && String(last.content || "").startsWith(CHECK_RESULT_PREFIX)) {
      const payload = String(last.content).slice(CHECK_RESULT_PREFIX.length).trim();
      const data = safeJsonParse(payload);
      const ok = Boolean(data?.success);
      const statLabel = labelStat(data?.stat);
      const dc = data?.dc;
      const total = data?.total;
      const line = ok ? "성공" : "실패";
      return [
        `판정(${statLabel} DC ${dc}) 결과는 ${line}다. (총합 ${total})`,
        ok ? "당신의 행동은 예상보다 매끄럽게 이어지고, 상황이 유리하게 기울기 시작한다." : "당신의 행동은 삐끗했고, 작은 대가가 따라붙는다. 하지만 끝은 아니다.",
        "주변 상황이 한 번 더 변한다. 무엇을 할 것인가?",
      ].join("\n");
    }

    // 플레이어 행동에 대해 가끔 판정 요청
    if (last?.role === "user") {
      const act = String(last.content || "");
      const needCheck = /몰래|은신|잠입|훔치|슬쩍|피하|재빨리|달리|도망|점프|뛰|락픽|자물쇠|해킹|설득|협박|거짓말|조사|관찰|추적|공격|쏘|때리|부수/i.test(act);
      if (needCheck) {
        const { stat, dc, reason } = guessCheckFromAction(act);
        return [
          "좋아. 그 행동은 위험요소가 있어서 판정이 필요해.",
          `${CHECK_PREFIX} ${JSON.stringify({ stat, dc, dice: "1d20", reason })}`,
        ].join("\n");
      }
      return ["좋아. 네 행동이 장면을 앞으로 밀어붙인다.", "주변이 반응하기 시작한다. 무엇을 할 것인가?"].join("\n");
    }

    return "무엇을 할 것인가?";
  }

  function parseCheckRequest(text) {
    const raw = String(text || "");
    const idx = raw.lastIndexOf(CHECK_PREFIX);
    if (idx === -1) return { cleanText: raw.trim(), check: null };

    const before = raw.slice(0, idx).trim();
    const after = raw.slice(idx + CHECK_PREFIX.length).trim();

    // after는 JSON 객체 1개여야 함
    const jsonStart = after.indexOf("{");
    const jsonEnd = after.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) return { cleanText: raw.trim(), check: null };

    const jsonText = after.slice(jsonStart, jsonEnd + 1);
    const obj = safeJsonParse(jsonText);
    if (!obj || typeof obj !== "object") return { cleanText: raw.trim(), check: null };

    return { cleanText: before, check: obj };
  }

  function normalizeCheck(c) {
    const stat = String(c.stat || "").toUpperCase();
    const allowed = new Set(["STR", "DEX", "CON", "INT", "WIS", "LUCK"]);
    const safeStat = allowed.has(stat) ? stat : "LUCK";
    const dc = clamp(Number(c.dc), 1, 30);
    const dice = String(c.dice || "1d20").trim() || "1d20";
    const reason = typeof c.reason === "string" ? c.reason.trim() : "";
    return { stat: safeStat, dc, dice, reason };
  }

  function labelStat(stat) {
    const s = String(stat || "").toUpperCase();
    if (s === "STR") return "힘(STR)";
    if (s === "DEX") return "민첩(DEX)";
    if (s === "CON") return "체질(CON)";
    if (s === "INT") return "지능(INT)";
    if (s === "WIS") return "지혜(WIS)";
    return "행운(LUCK)";
  }

  function getStatValue(stat) {
    const s = String(stat || "").toUpperCase();
    if (s === "STR") return Number(ch.attributes.str) || 0;
    if (s === "DEX") return Number(ch.attributes.dex) || 0;
    if (s === "CON") return Number(ch.attributes.con) || 0;
    if (s === "INT") return Number(ch.attributes.int) || 0;
    if (s === "WIS") return Number(ch.attributes.wis) || 0;
    return Number(ch.attributes.luck) || 0;
  }

  function statModFromValue(v) {
    return Math.floor((Number(v) - 10) / 2);
  }

  function formatCheckShort(check) {
    const c = normalizeCheck(check);
    return `${c.stat} DC${c.dc}`;
  }

  function formatRollPrompt(check) {
    const c = normalizeCheck(check);
    const statV = getStatValue(c.stat);
    const mod = statModFromValue(statV);
    const base = `${labelStat(c.stat)} 판정 (DC ${c.dc})`;
    const why = c.reason ? ` · 이유: ${c.reason}` : "";
    const suggested = suggestDiceCommand(c.dice, mod);
    return `${base}${why}\n주사위: ${suggested}`;
  }

  function suggestDiceCommand(dice, mod) {
    const d = String(dice || "1d20").trim().replaceAll(" ", "");
    // 기본 d20이면 스탯 보정치를 붙여 추천
    if (/^1d20([+-]\d+)?$/i.test(d)) {
      const has = /[+-]\d+$/i.test(d);
      if (has) return d;
      if (mod === 0) return "1d20";
      return `1d20${mod > 0 ? `+${mod}` : `${mod}`}`;
    }
    return d || "1d20";
  }

  function resolvePendingCheckWithRoll(pending, diceCmd, rollResult) {
    const c = normalizeCheck(pending);
    const statV = getStatValue(c.stat);
    const statMod = statModFromValue(statV);

    const isD20 = diceCmd.n === 1 && diceCmd.sides === 20;
    let appliedStatMod = 0;
    let total = rollResult.total;

    // 플레이어가 1d20만 굴렸다면 스탯 보정을 자동 적용(편의)
    if (isD20 && diceCmd.mod === 0 && /^1d20$/i.test(String(diceCmd.raw || ""))) {
      appliedStatMod = statMod;
      total = rollResult.sum + statMod;
    }

    const success = total >= c.dc;
    return {
      stat: c.stat,
      statValue: statV,
      statMod,
      dc: c.dc,
      dice: diceCmd.raw,
      rolls: rollResult.rolls,
      sum: rollResult.sum,
      cmdMod: diceCmd.mod || 0,
      appliedStatMod,
      total,
      success,
      reason: c.reason || "",
    };
  }

  // 저장된 이전 버전 스토리에서 pendingCheck가 있을 수 있으므로, 시작 시 UI에 안내
  if (story?.pendingCheck) {
    appendMsg({ type: "system", who: "시스템", text: `판정이 대기중이에요. 주사위를 굴려줘요: ${formatRollPrompt(story.pendingCheck)}` });
  }

  function guessCheckFromAction(act) {
    const t = String(act || "");
    const lower = t.toLowerCase();
    const has = (re) => re.test(lower);
    let stat = "LUCK";
    if (has(/해킹|기계|분석|암호|코드|수수께끼|계산|조사/)) stat = "INT";
    else if (has(/관찰|눈치|감지|직감|추적|수색/)) stat = "WIS";
    else if (has(/몰래|은신|잠입|피하|재빨리|점프|달리|손재주|락픽|자물쇠/)) stat = "DEX";
    else if (has(/버티|견디|독|추위|상처|체력/)) stat = "CON";
    else if (has(/공격|때리|부수|힘|밀어|잡아/)) stat = "STR";

    let dc = 12;
    if (has(/아주|매우|극도로|정말|빡세|어렵/)) dc = 16;
    if (has(/불가능|목숨|치명|절대/)) dc = 18;
    if (has(/조심|살짝|가볍게|간단/)) dc = 10;

    return { stat, dc, reason: "행동의 위험/불확실성이 있어 판정이 필요함" };
  }

  elStart.addEventListener("click", startStory);
  elToggle.addEventListener("click", () => {
    story.enabled = !story.enabled;
    saveStory(story);
    updateAiUi();
    appendMsg({ type: "system", who: "시스템", text: `스토리 모드를 ${story.enabled ? "ON" : "OFF"}로 바꿨어요.` });
  });
  elReset.addEventListener("click", resetStory);
  elGenre.addEventListener("change", () => {
    story.genre = elGenre.value || "sf";
    saveStory(story);
    updateAiUi();
  });

  elAiSave.addEventListener("click", () => {
    const endpoint = elEndpoint.value.trim() || DEFAULT_AI_CONFIG.endpoint;
    const model = elModel.value.trim() || DEFAULT_AI_CONFIG.model;
    const key = elKey.value.trim();

    // 빈 값이면 기존 키 유지(입력칸을 마스킹 문자열로 덮어쓰지 않음)
    const nextKey = !key || key === "********" ? aiConfig.apiKey : key;
    aiConfig = { endpoint, model, apiKey: nextKey };
    saveAiConfig(aiConfig);
    // 설정이 바뀌면 테스트 상태는 다시 미실행으로 리셋
    aiTest = { ok: null, at: "", error: "" };
    saveAiTestState(aiTest);
    updateAiUi();
    toast("AI 설정을 저장했어요.");
  });
  elAiTest.addEventListener("click", testAiConnection);
  elAiClear.addEventListener("click", () => {
    aiConfig = { ...aiConfig, apiKey: "" };
    saveAiConfig(aiConfig);
    aiTest = { ok: null, at: "", error: "" };
    saveAiTestState(aiTest);
    elKey.value = "";
    updateAiUi();
    toast("API 키를 지웠어요.");
  });

  renderCharacter();
  appendMsg({
    type: "system",
    who: "시스템",
    text: "세션을 시작했어요. 채팅에 3d6 같은 주사위 명령을 입력해 보세요.",
  });

  updateAiUi();
})();

