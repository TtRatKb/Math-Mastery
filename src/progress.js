const KEY = 'mathepfad-v1-division';
const blank = () => ({ version: 1, xp: 0, coins: 0, companion: 'fox', owned: ['fox'], records: [], errorCounts: {}, updated: null });

export function createStore(storage = null) {
  let data = blank();
  let persistent = true;
  try {
    storage ??= globalThis.localStorage;
    const raw = storage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 1 && Array.isArray(parsed.records)) data = { ...blank(), ...parsed };
    }
    storage.setItem(KEY, JSON.stringify(data));
  } catch { persistent = false; }
  return {
    get data() { return data; },
    get persistent() { return persistent; },
    save() { data.updated = new Date().toISOString(); try { storage.setItem(KEY, JSON.stringify(data)); persistent = true; } catch { persistent = false; } },
    reset() { data = blank(); this.save(); },
    export() { return JSON.stringify({ app: 'mathepfad', data }, null, 2); },
    import(json) {
      const value = JSON.parse(json);
      if (value?.app !== 'mathepfad' || value?.data?.version !== 1 || !Array.isArray(value.data.records)) throw new Error('Keine passende Mathepfad-Sicherung.');
      const d = value.data;
      if (!Number.isFinite(d.xp) || !Number.isFinite(d.coins) || typeof d.errorCounts !== 'object') throw new Error('Ungültige Lernstandsdaten.');
      data = { ...blank(), ...d, records: d.records.slice(-300) };
      this.save();
    },
    record({ lesson, solved, firstTry, hintsUsed, errorCodes, bridge }) {
      data.records.push({ lesson, solved, firstTry, hintsUsed, errorCodes: [...errorCodes], bridge, at: new Date().toISOString().slice(0, 10) });
      data.records = data.records.slice(-300);
      if (solved) { data.xp += firstTry ? 12 : 8; data.coins += firstTry ? 4 : 3; }
      for (const code of errorCodes) {
        if (code === 'other') continue;
        const key = `${lesson}:${code}`;
        data.errorCounts[key] = (data.errorCounts[key] || 0) + 1;
      }
      this.save();
    },
    lessonStats(id) {
      const records = data.records.filter(x => x.lesson === id);
      return { practiced: records.length, solved: records.filter(x => x.solved).length, firstTry: records.filter(x => x.firstTry).length };
    }
  };
}
