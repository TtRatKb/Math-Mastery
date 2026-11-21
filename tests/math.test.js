import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createQuestion, gradeAnswer, parseWholeNumber, explainSolution } from '../src/math.js';

for (const kind of ['share', 'inverse', 'facts', 'remainder']) {
  test(`${kind}: Aufgaben bleiben mathematisch korrekt`, () => {
    for (let i = 0; i < 100; i++) {
      const q = createQuestion(kind);
      assert.equal(q.total, q.divisor * q.quotient + q.remainder);
      assert.equal(gradeAnswer(q, String(q.quotient), String(q.remainder)).status, 'correct');
      assert.ok(explainSolution(q).includes(String(q.total)));
    }
  });
}
test('leere Eingaben geben verständliche Meldungen', () => {
  const q = createQuestion('share');
  assert.equal(gradeAnswer(q, '').status, 'invalid');
  assert.match(gradeAnswer(q, '').message, /Zahl/);
});
test('negative Zahlen werden verarbeitet, nicht still ignoriert', () => {
  const q = createQuestion('facts');
  assert.equal(gradeAnswer(q, '-4').status, 'incorrect');
});
test('ungültige Dezimalzahlen werden erklärt', () => {
  assert.equal(parseWholeNumber('2,5').valid, false);
  assert.equal(parseWholeNumber('1.5').valid, false);
});
test('Rest muss ausdrücklich angegeben werden', () => {
  const q = { kind: 'remainder', total: 14, quotient: 4, divisor: 3, remainder: 2 };
  assert.equal(gradeAnswer(q, '4', '').status, 'invalid');
  assert.equal(gradeAnswer(q, '4', '0').error, 'remainder_missing');
  assert.equal(gradeAnswer(q, '4', '2').status, 'correct');
});
test('typische Verwechslung wird erkannt', () => {
  const q = { kind: 'share', total: 18, quotient: 6, divisor: 3, remainder: 0 };
  assert.equal(gradeAnswer(q, '15').error, 'subtraction');
  assert.equal(gradeAnswer(q, '54').error, 'multiplication');
});

import { guidedHint, guidedErrorHelp } from '../src/math.js';

test('Teilen-Tipp verrät die Lösung nicht als fertige Verteilung', () => {
  const q = { kind: 'share', total: 12, quotient: 4, divisor: 3, remainder: 0 };
  const hint = guidedHint(q);
  assert.deepEqual(hint.model, { groups: 3, perGroup: 1 });
  assert.match(hint.text, /9 Steine/);
});
test('Umkehraufgabe-Tipp verweist auf Malnehmen', () => {
  const hint = guidedHint({ kind: 'inverse', total: 42, divisor: 7, quotient: 6 });
  assert.match(hint.text, /7 · 2 = 14/);
});
test('falscher Rest wird von fehlendem Rest unterschieden', () => {
  const q = { kind: 'remainder', total: 14, quotient: 4, divisor: 3, remainder: 2 };
  assert.equal(gradeAnswer(q, '4', '0').error, 'remainder_missing');
  assert.equal(gradeAnswer(q, '4', '1').error, 'remainder_incorrect');
  assert.equal(gradeAnswer(q, '4', '').field, 'remainder');
  assert.match(guidedErrorHelp(q, 'remainder_incorrect', '4'), /14 − \(3 · 4\)/);
});
test('bei knapp falschen Antworten zeigt die Hilfe eine passende Probe', () => {
  const q = { kind: 'facts', total: 24, divisor: 6, quotient: 4, remainder: 0 };
  assert.match(guidedErrorHelp(q, 'off_by_one', '5'), /6 · 5 = 30/);
});
