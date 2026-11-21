import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../src/progress.js';
const memory = () => { const data = new Map(); return { getItem:k=>data.get(k)||null, setItem:(k,v)=>data.set(k,v) }; };

test('Lernfortschritt bleibt beim Neuladen im gleichen Browser erhalten', () => {
  const storage = memory();
  const a = createStore(storage);
  a.record({ lesson:'verteilen', solved:true, firstTry:true, hintsUsed:false, errorCodes:new Set(), bridge:false });
  const b = createStore(storage);
  assert.equal(b.data.xp, 12);
  assert.equal(b.lessonStats('verteilen').practiced, 1);
});
test('wiederkehrende Fehler zählen einmal pro Aufgabe', () => {
  const store = createStore(memory());
  store.record({ lesson:'verteilen', solved:true, firstTry:false, hintsUsed:true, errorCodes:new Set(['subtraction']), bridge:false });
  store.record({ lesson:'verteilen', solved:true, firstTry:false, hintsUsed:true, errorCodes:new Set(['subtraction']), bridge:false });
  assert.equal(store.data.errorCounts['verteilen:subtraction'], 2);
});
test('Sicherung ist lesbar und kann importiert werden', () => {
  const a = createStore(memory()); a.record({ lesson:'rest', solved:true, firstTry:true, hintsUsed:false, errorCodes:new Set(), bridge:false });
  const b = createStore(memory()); b.import(a.export());
  assert.equal(b.lessonStats('rest').practiced, 1);
});
