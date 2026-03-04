(function () {
  /** @type {ReturnType<defaultCharacter>} */
  let ch = loadCharacter();

  const ids = {
    characterName: ["identity", "characterName"],
    playerName: ["identity", "playerName"],
    campaign: ["identity", "campaign"],
    concept: ["identity", "concept"],
    archetype: ["identity", "archetype"],
    level: ["identity", "level"],
    age: ["identity", "age"],
    pronouns: ["identity", "pronouns"],
    portraitUrl: ["identity", "portraitUrl"],

    hpMax: ["vitals", "hpMax"],
    hpCurrent: ["vitals", "hpCurrent"],
    mpMax: ["vitals", "mpMax"],
    mpCurrent: ["vitals", "mpCurrent"],
    stress: ["vitals", "stress"],

    str: ["attributes", "str"],
    dex: ["attributes", "dex"],
    con: ["attributes", "con"],
    int: ["attributes", "int"],
    wis: ["attributes", "wis"],
    luck: ["attributes", "luck"],

    traits: ["notes", "traits"],
    bonds: ["notes", "bonds"],
    flaws: ["notes", "flaws"],
    backstory: ["notes", "backstory"],
    gmNotes: ["notes", "gmNotes"],
  };

  const numberIds = new Set([
    "level",
    "hpMax",
    "hpCurrent",
    "mpMax",
    "mpCurrent",
    "stress",
    "str",
    "dex",
    "con",
    "int",
    "wis",
    "luck",
  ]);

  function getByPath(obj, path) {
    return path.reduce((acc, key) => (acc ? acc[key] : undefined), obj);
  }
  function setByPath(obj, path, value) {
    let cur = obj;
    for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]];
    cur[path[path.length - 1]] = value;
  }

  function syncFormFromState() {
    for (const [id, path] of Object.entries(ids)) {
      const el = document.getElementById(id);
      if (!el) continue;
      const v = getByPath(ch, path);
      el.value = v ?? "";
    }
    renderDerived();
    renderSkills();
    renderItems();
  }

  function syncStateFromForm(id) {
    const el = document.getElementById(id);
    if (!el) return;
    let v = el.value;
    if (numberIds.has(id)) {
      const n = Number(v);
      v = Number.isFinite(n) ? n : 0;
    }
    setByPath(ch, ids[id], v);

    // 경계값 보정
    ch.vitals.hpMax = Math.max(1, Number(ch.vitals.hpMax) || 1);
    ch.vitals.mpMax = Math.max(1, Number(ch.vitals.mpMax) || 1);
    ch.vitals.hpCurrent = clamp(Number(ch.vitals.hpCurrent), 0, ch.vitals.hpMax);
    ch.vitals.mpCurrent = clamp(Number(ch.vitals.mpCurrent), 0, ch.vitals.mpMax);
    ch.identity.level = Math.max(1, Number(ch.identity.level) || 1);
  }

  function renderDerived() {
    ch = computeDerived(ch);
    $("#dAttack").textContent = String(ch.derived.attack);
    $("#dDefense").textContent = String(ch.derived.defense);
    $("#dInitiative").textContent = String(ch.derived.initiative);
    $("#dMove").textContent = String(ch.derived.move);
    $("#dCarry").textContent = String(ch.derived.carry);
    $("#dUpdated").textContent = nowTime();
  }

  function renderSkills() {
    const tbody = $("#skillsTable tbody");
    tbody.innerHTML = "";
    ch.skills.forEach((s, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input class="field" data-skill="name" data-idx="${idx}" value="${escapeHtml(s.name ?? "")}" /></td>
        <td><input class="field" type="number" step="1" data-skill="value" data-idx="${idx}" value="${Number(s.value) || 0}" /></td>
        <td><input class="field" data-skill="note" data-idx="${idx}" value="${escapeHtml(s.note ?? "")}" /></td>
        <td class="actions">
          <button class="btn danger" data-skill-remove="${idx}" type="button">삭제</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderItems() {
    const tbody = $("#itemsTable tbody");
    tbody.innerHTML = "";
    ch.equipment.forEach((it, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input class="field" data-item="name" data-idx="${idx}" value="${escapeHtml(it.name ?? "")}" /></td>
        <td><input class="field" type="number" min="0" step="1" data-item="qty" data-idx="${idx}" value="${Number(it.qty) || 0}" /></td>
        <td><input class="field" data-item="note" data-idx="${idx}" value="${escapeHtml(it.note ?? "")}" /></td>
        <td class="actions">
          <button class="btn danger" data-item-remove="${idx}" type="button">삭제</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function exportXlsx() {
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
    const rowsFormat = [
      ["TRPG 캐릭터 시트 포맷"],
      ["- 이 파일은 SheetJS로 생성된 xlsx 입니다."],
      ["- '키' 컬럼이 있으면 가져오기 시 그 값을 우선 사용합니다."],
      ["- 버전", 1],
      ["- 저장 키", STORAGE_KEY],
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rowsKV), "Character");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rowsVitals), "Vitals");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rowsAttr), "Attributes");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rowsDerived), "Derived");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rowsSkills), "Skills");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rowsEquip), "Equipment");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rowsNotes), "Notes");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rowsFormat), "Format");

    const name = (ch.identity.characterName || "character").trim().replace(/[\\/:*?"<>|]/g, "_");
    XLSX.writeFile(wb, `${name}.xlsx`);
  }

  function importXlsx(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const next = defaultCharacter();

        const applyKVSheet = (sheetName, fallbackMap) => {
          const ws = wb.Sheets[sheetName];
          if (!ws) return;
          const rows = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const label = row?.[0];
            const value = row?.[1];
            const key = row?.[2];
            const finalKey = key || (fallbackMap ? fallbackMap[String(label || "")] : null);
            if (!finalKey) continue;
            setByDotPath(next, finalKey, value);
          }
        };

        const fallbackCharacter = {
          "캐릭터 이름": "identity.characterName",
          플레이어: "identity.playerName",
          캠페인: "identity.campaign",
          컨셉: "identity.concept",
          "아키타입/직업": "identity.archetype",
          레벨: "identity.level",
          나이: "identity.age",
          대명사: "identity.pronouns",
          "초상 URL": "identity.portraitUrl",
        };
        const fallbackVitals = {
          "체력(현재)": "vitals.hpCurrent",
          "체력(최대)": "vitals.hpMax",
          "정신력(현재)": "vitals.mpCurrent",
          "정신력(최대)": "vitals.mpMax",
          스트레스: "vitals.stress",
        };
        const fallbackAttr = {
          "힘(STR)": "attributes.str",
          "민첩(DEX)": "attributes.dex",
          "체질(CON)": "attributes.con",
          "지능(INT)": "attributes.int",
          "지혜(WIS)": "attributes.wis",
          "행운(LUCK)": "attributes.luck",
        };
        const fallbackNotes = {
          특성: "notes.traits",
          유대: "notes.bonds",
          결함: "notes.flaws",
          배경: "notes.backstory",
          "GM 메모": "notes.gmNotes",
        };

        applyKVSheet("Character", fallbackCharacter);
        applyKVSheet("Vitals", fallbackVitals);
        applyKVSheet("Attributes", fallbackAttr);
        applyKVSheet("Notes", fallbackNotes);

        // Skills
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

        // Equipment
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

        // 숫자/경계값 정리
        next.identity.level = Math.max(1, Number(next.identity.level) || 1);
        next.vitals.hpMax = Math.max(1, Number(next.vitals.hpMax) || 1);
        next.vitals.mpMax = Math.max(1, Number(next.vitals.mpMax) || 1);
        next.vitals.hpCurrent = clamp(Number(next.vitals.hpCurrent), 0, next.vitals.hpMax);
        next.vitals.mpCurrent = clamp(Number(next.vitals.mpCurrent), 0, next.vitals.mpMax);
        for (const k of ["str", "dex", "con", "int", "wis", "luck"]) next.attributes[k] = Number(next.attributes[k]) || 0;
        next.vitals.stress = Number(next.vitals.stress) || 0;

        ch = saveCharacter(next);
        syncFormFromState();
        toast("xlsx에서 캐릭터를 가져왔어요.");
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
    const last = parts[parts.length - 1];
    cur[last] = value;
  }

  // ===== 이벤트 바인딩 =====
  for (const id of Object.keys(ids)) {
    const el = document.getElementById(id);
    if (!el) continue;
    const handler = () => {
      syncStateFromForm(id);
      renderDerived();
    };
    el.addEventListener("input", handler);
    el.addEventListener("change", handler);
  }

  $("#btnAddSkill").addEventListener("click", () => {
    ch.skills.push({ name: "새 스킬", value: 0, note: "" });
    renderSkills();
    toast("스킬을 추가했어요.");
  });
  $("#btnAddItem").addEventListener("click", () => {
    ch.equipment.push({ name: "새 아이템", qty: 1, note: "" });
    renderItems();
    toast("아이템을 추가했어요.");
  });

  document.addEventListener("click", (e) => {
    const btnSkill = e.target.closest("[data-skill-remove]");
    if (btnSkill) {
      const idx = Number(btnSkill.dataset.skillRemove);
      ch.skills.splice(idx, 1);
      renderSkills();
      toast("스킬을 삭제했어요.");
      return;
    }
    const btnItem = e.target.closest("[data-item-remove]");
    if (btnItem) {
      const idx = Number(btnItem.dataset.itemRemove);
      ch.equipment.splice(idx, 1);
      renderItems();
      toast("아이템을 삭제했어요.");
      return;
    }
  });

  document.addEventListener("input", (e) => {
    const el = e.target;
    if (el.matches("[data-skill]")) {
      const idx = Number(el.dataset.idx);
      const key = el.dataset.skill;
      if (!ch.skills[idx]) return;
      ch.skills[idx][key] = key === "value" ? Number(el.value) || 0 : el.value;
      return;
    }
    if (el.matches("[data-item]")) {
      const idx = Number(el.dataset.idx);
      const key = el.dataset.item;
      if (!ch.equipment[idx]) return;
      ch.equipment[idx][key] = key === "qty" ? Number(el.value) || 0 : el.value;
      return;
    }
  });

  $("#btnSave").addEventListener("click", () => {
    ch = saveCharacter(ch);
    renderDerived();
    toast("로컬에 저장했어요.");
  });
  $("#btnLoad").addEventListener("click", () => {
    ch = loadCharacter();
    syncFormFromState();
    toast("로컬에서 불러왔어요.");
  });
  $("#btnReset").addEventListener("click", () => {
    ch = computeDerived(defaultCharacter());
    localStorage.removeItem(STORAGE_KEY);
    syncFormFromState();
    toast("초기화했어요.");
  });
  $("#btnExport").addEventListener("click", () => {
    ch = saveCharacter(ch);
    exportXlsx();
    toast("xlsx로 내보냈어요.");
  });

  $("#fileImport").addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importXlsx(file);
    e.target.value = "";
  });

  syncFormFromState();
})();

