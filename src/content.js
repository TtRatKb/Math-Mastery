/**
 * Lehrkraft-Konfiguration: Texte, Reihenfolge, Anzahl und Aufgabenarten.
 * Wer neue Generatoren benötigt, ergänzt sie in math.js. Kein Backend notwendig.
 */
export const COURSE = {
  id: 'division-basics-v1',
  title: 'Division verstehen',
  introduction: 'Wir entdecken, was Teilen bedeutet – Schritt für Schritt und ohne Zeitdruck.',
  lessons: [
    { id: 'verteilen', number: '01', name: 'Gerecht verteilen', kind: 'share', count: 5,
      kicker: 'Verstehen statt raten',
      intro: 'Wenn wir eine Menge gerecht aufteilen, erhält jede Gruppe gleich viel.',
      explanation: 'Stell dir 12 Steine und 3 Schalen vor. Du legst immer reihum einen Stein in jede Schale. Am Ende sind in jeder Schale 4 Steine. Also: 12 : 3 = 4.',
      hint: 'Verteile die Dinge in gleich große Gruppen. Zähle dann eine Gruppe.' },
    { id: 'umkehren', number: '02', name: 'Mal und geteilt', kind: 'inverse', count: 5,
      kicker: 'Zusammenhänge erkennen',
      intro: 'Malnehmen und Teilen gehören zusammen. Sie helfen sich gegenseitig.',
      explanation: 'Weil 3 · 4 = 12, gilt auch 12 : 3 = 4. Du kannst eine Geteiltaufgabe mit einer Malaufgabe überprüfen.',
      hint: 'Welche Zahl fehlt bei der Malaufgabe?' },
    { id: 'trainieren', number: '03', name: 'Geteilt-Training', kind: 'facts', count: 6,
      kicker: 'Schritt für Schritt sicherer',
      intro: 'Jetzt nutzen wir die Verbindung zum Einmaleins bei unterschiedlichen Geteiltaufgaben.',
      explanation: 'Beispiel: 42 : 7. Denke an 7 · ? = 42. Da 7 · 6 = 42, ist 42 : 7 = 6.',
      hint: 'Suche die passende Einmaleins-Aufgabe.' },
    { id: 'rest', number: '04', name: 'Teilen mit Rest', kind: 'remainder', count: 5,
      kicker: 'Ein bisschen bleibt übrig',
      intro: 'Nicht jede Menge lässt sich ohne Rest in gleich große Gruppen aufteilen.',
      explanation: '14 Steine auf 3 Schalen: Jede Schale bekommt 4 Steine. 2 Steine bleiben übrig. Deshalb: 14 : 3 = 4 Rest 2.',
      hint: 'Finde die größte passende Malaufgabe. Was bleibt dann übrig?' }
  ]
};

export const FEEDBACK = {
  subtraction: 'Du hast die Zahlen möglicherweise voneinander abgezogen. Teilen bedeutet nicht abziehen: Wir suchen gleich große Gruppen.',
  multiplication: 'Das sieht wie eine Malaufgabe aus. Verwende Malnehmen zum Überprüfen, aber gesucht ist die Zahl pro Gruppe.',
  off_by_one: 'Du bist nur eine Zahl entfernt. Überprüfe mit einer Malaufgabe, ob dein Ergebnis genau passt.',
  remainder_missing: 'Wie viele übrig bleiben, ist noch wichtig. Prüfe den Rest.',
  remainder_incorrect: 'Die Zahl pro Gruppe stimmt schon. Prüfe noch einmal den Rest.',
  round_up: 'Eine weitere ganze Gruppe würde zu viele Dinge benötigen. Bleib bei den vollständigen Gruppen und zähle den Rest.',
  other: 'Noch nicht ganz. Schau dir die Erklärung an oder probiere es mit einer kleineren Menge.'
};

export const ERROR_LABELS = {
  subtraction: 'Abziehen statt Teilen',
  multiplication: 'Multiplizieren statt Teilen',
  off_by_one: 'Ergebnis um eins daneben',
  remainder_missing: 'Rest vergessen',
  remainder_incorrect: 'Rest falsch berechnet',
  round_up: 'Eine Gruppe zu viel',
  other: 'Weitere Unsicherheit'
};

/** Hinweise für Familien – keine Diagnose und keine Verpflichtung zum Üben. */
export const PRACTICE_TIPS = {
  subtraction: 'Lege 12 Knöpfe in 3 Schalen. Verteile sie reihum, statt Zahlen abzuziehen.',
  multiplication: 'Übe den Unterschied: 3 · 4 bedeutet zusammenzählen, 12 : 3 bedeutet verteilen.',
  off_by_one: 'Lass das Ergebnis durch die passende Malaufgabe überprüfen, zum Beispiel 3 · ? = 12.',
  remainder_missing: 'Verteile 14 Gegenstände auf 3 Teller. Was passt auf die Teller, was bleibt liegen?',
  remainder_incorrect: 'Prüfe den Rest mit: Gesamtmenge minus vollständig verteilte Dinge.',
  round_up: 'Frage: Reichen die vorhandenen Dinge wirklich für noch eine ganze Runde?',
};
