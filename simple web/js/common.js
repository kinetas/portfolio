(function () {
  const page = document.body?.dataset?.page;
  const nav = document.querySelectorAll("[data-nav] a[data-page]");
  for (const a of nav) {
    if (a.dataset.page === page) a.classList.add("active");
  }
})();

function $(sel, root = document) {
  return root.querySelector(sel);
}

function $all(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

const STORAGE_KEY = "trpg.character.v1";

function safeJsonParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function nowTime() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function clamp(n, min, max) {
  const x = Number.isFinite(n) ? n : 0;
  return Math.max(min, Math.min(max, x));
}

function defaultCharacter() {
  return {
    meta: {
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    identity: {
      characterName: "",
      playerName: "",
      campaign: "",
      concept: "",
      archetype: "",
      level: 1,
      age: "",
      pronouns: "",
      portraitUrl: "",
    },
    vitals: {
      hpMax: 12,
      hpCurrent: 12,
      mpMax: 8,
      mpCurrent: 8,
      stress: 0,
    },
    attributes: {
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 10,
      luck: 10,
    },
    derived: {
      attack: 0,
      defense: 0,
      initiative: 0,
      move: 0,
      carry: 0,
    },
    skills: [
      { name: "관찰", value: 0, note: "" },
      { name: "협상", value: 0, note: "" },
      { name: "은신", value: 0, note: "" },
      { name: "의학", value: 0, note: "" },
      { name: "마력(또는 이성)", value: 0, note: "" },
    ],
    equipment: [
      { name: "기본 무기", qty: 1, note: "피해: 1d6 (예시)" },
      { name: "여행자 도구", qty: 1, note: "" },
    ],
    notes: {
      traits: "",
      bonds: "",
      flaws: "",
      backstory: "",
      gmNotes: "",
    },
  };
}

function computeDerived(ch) {
  // 의도: 룰이 확정되지 않았으니, 일반적인 TRPG 감각의 기본 파생치만 제공
  const a = ch.attributes;
  const d = ch.derived;
  const mod = (v) => Math.floor((Number(v) - 10) / 2);
  d.attack = mod(a.str) + mod(a.dex);
  d.defense = 10 + mod(a.dex) + mod(a.con);
  d.initiative = mod(a.dex) + mod(a.luck);
  d.move = 6 + Math.max(0, mod(a.dex));
  d.carry = Math.max(1, 10 + mod(a.str) * 5);
  return ch;
}

function loadCharacter() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return computeDerived(defaultCharacter());
  const parsed = safeJsonParse(raw);
  if (!parsed || typeof parsed !== "object") return computeDerived(defaultCharacter());
  // 최소한의 하위호환
  const merged = Object.assign(defaultCharacter(), parsed);
  merged.identity = Object.assign(defaultCharacter().identity, parsed.identity || {});
  merged.vitals = Object.assign(defaultCharacter().vitals, parsed.vitals || {});
  merged.attributes = Object.assign(defaultCharacter().attributes, parsed.attributes || {});
  merged.derived = Object.assign(defaultCharacter().derived, parsed.derived || {});
  merged.skills = Array.isArray(parsed.skills) ? parsed.skills : defaultCharacter().skills;
  merged.equipment = Array.isArray(parsed.equipment) ? parsed.equipment : defaultCharacter().equipment;
  merged.notes = Object.assign(defaultCharacter().notes, parsed.notes || {});
  merged.meta = Object.assign(defaultCharacter().meta, parsed.meta || {});
  return computeDerived(merged);
}

function saveCharacter(ch) {
  ch.meta = ch.meta || {};
  ch.meta.updatedAt = new Date().toISOString();
  const computed = computeDerived(ch);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(computed));
  return computed;
}

function toast(text) {
  // 간단 토스트 (페이지 공통)
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.style.position = "fixed";
    el.style.left = "50%";
    el.style.bottom = "18px";
    el.style.transform = "translateX(-50%)";
    el.style.padding = "10px 12px";
    el.style.borderRadius = "14px";
    el.style.border = "1px solid rgba(255,255,255,.14)";
    el.style.background = "rgba(8, 12, 26, .72)";
    el.style.backdropFilter = "blur(10px)";
    el.style.color = "var(--text)";
    el.style.boxShadow = "0 12px 40px rgba(0,0,0,.45)";
    el.style.zIndex = "9999";
    el.style.opacity = "0";
    el.style.transition = "opacity .15s ease, transform .15s ease";
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.style.opacity = "1";
  el.style.transform = "translateX(-50%) translateY(0)";
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateX(-50%) translateY(6px)";
  }, 1400);
}
