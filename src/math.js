/** Pure functions: tested separately; never write to storage or DOM. */
const pick = (random, min, max) => Math.floor(random() * (max - min + 1)) + min;

export function createQuestion(kind, { bridge = false, random = Math.random } = {}) {
  const low = bridge;
  let quotient, divisor, remainder = 0;
  if (kind === 'share') { quotient = pick(random, 2, low ? 4 : 6); divisor = pick(random, 2, low ? 3 : 5); }
  else if (kind === 'inverse') { quotient = pick(random, 2, low ? 4 : 9); divisor = pick(random, 2, low ? 4 : 8); }
  else if (kind === 'facts') { quotient = pick(random, 2, low ? 5 : 10); divisor = pick(random, 2, low ? 5 : 10); }
  else if (kind === 'remainder') { divisor = pick(random, 3, low ? 4 : 8); quotient = pick(random, 2, low ? 3 : 7); remainder = pick(random, 1, divisor - 1); }
  else throw new Error(`Unbekannter Aufgabentyp: ${kind}`);
  const total = quotient * divisor + remainder;
  return { kind, total, quotient, divisor, remainder, bridge,
    signature: `${kind}:${total}:${divisor}` };
}

/** Parse ourselves instead of relying on browser-native form validation. */
export function parseWholeNumber(raw) {
  const value = String(raw ?? '').trim();
  if (!value) return { valid: false, message: 'Trage zuerst eine Zahl ein.' };
  if (!/^-?\d+$/.test(value)) return { valid: false, message: 'Bitte gib eine ganze Zahl ein, zum Beispiel 4.' };
  const number = Number(value);
  if (!Number.isSafeInteger(number)) return { valid: false, message: 'Diese Zahl ist zu groß. Versuche eine kleinere.' };
  return { valid: true, value: number };
}

export function gradeAnswer(question, rawQuotient, rawRemainder) {
  const result = parseWholeNumber(rawQuotient);
  if (!result.valid) return { status: 'invalid', message: result.message };
  let rest = null;
  if (question.kind === 'remainder') {
    const parsed = parseWholeNumber(rawRemainder);
    if (!parsed.valid) return { status: 'invalid', message: 'Trage auch beim Rest eine ganze Zahl ein.' };
    rest = parsed.value;
  }
  if (result.value === question.quotient && (question.kind !== 'remainder' || rest === question.remainder)) {
    return { status: 'correct' };
  }
  let error = 'other';
  if (question.kind === 'remainder') {
    if (result.value === question.quotient && rest !== question.remainder) error = 'remainder_missing';
    else if (result.value === question.quotient + 1) error = 'round_up';
  } else {
    if (result.value === question.total - question.divisor && result.value !== question.quotient) error = 'subtraction';
    else if (result.value === question.total * question.divisor && result.value !== question.quotient) error = 'multiplication';
    else if (Math.abs(result.value - question.quotient) === 1) error = 'off_by_one';
  }
  return { status: 'incorrect', error };
}

export function explainSolution(q) {
  const check = `${q.divisor} · ${q.quotient} = ${q.divisor * q.quotient}`;
  if (q.kind === 'remainder') return `${check}. Von ${q.total} bleiben ${q.remainder} übrig. Also ${q.total} : ${q.divisor} = ${q.quotient} Rest ${q.remainder}.`;
  return `${check}. Deshalb ist ${q.total} : ${q.divisor} = ${q.quotient}.`;
}
