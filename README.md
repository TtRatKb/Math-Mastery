# Mathepfad · Division verstehen (v0.2)

Eine **kleine, absichtlich datensparsame Lernanwendung** für den Browser. Vier Einheiten zu Division, ohne Benutzerkonto, Backend, Werbung, externe Bibliotheken oder externe Schriftarten. In der Elternansicht kann der lokale Fortschritt angesehen und gesichert werden.

## Lokal starten

Direkt per Doppelklick auf `index.html` werden JavaScript-Module in manchen Browsern nicht geladen (Sicherheitsbeschränkungen für `file://`). **Bitte über einen kleinen lokalen Webserver öffnen:**

```bash
cd mathepfad
python3 -m http.server 8000
```

Dann `http://localhost:8000/` im Browser aufrufen. Alternativ eine statische Hosting-Umgebung nutzen, z. B. nach Prüfung GitHub Pages.

## GitHub-Repository

Der Quellcode wird unter https://github.com/TtRatKb/Math-Mastery gepflegt. Die Lernanwendung ist eine statische Website ohne Backend. GitHub Pages ist absichtlich noch nicht eingeschaltet. Für einen Schulbetrieb mit echten Kindern sind die Schul-IT und der schulische Datenschutzbeauftragte einzubeziehen.

## Inhalt bearbeiten

- `src/content.js`: Lektionstexte, Reihenfolge, Anzahl der Aufgaben und Fehlerrückmeldungen.
- `src/math.js`: Aufgabengeneratoren und mathematische Prüfung.
- `src/progress.js`: lokale Speicherung und Sicherung.
- `src/app.js`: Darstellung und Lernfluss.
- `src/styles.css`: Farben, Typografie und Layout.

## Tests

```bash
npm test
```

Benötigt Node.js 20+; die Lernanwendung selbst benötigt kein Node.js und keine Installation.

## Datenschutz und didaktische Grenzen

- Keine zentrale Übertragung von Aufgabenlösungen oder Lernständen durch den Anwendungscode.
- Lokal gespeicherte Lernstände sind auf demselben Browserprofil für alle Nutzer sichtbar, einschließlich Eltern. Keine Zugriffssperre/Identitätsprüfung.
- Beim Löschen der Browserdaten, Wechseln des Geräts oder im Privatmodus können Daten verschwinden. Deshalb JSON-Sicherungsfunktion.
- Heuristische Fehlererkennung erkennt **mögliche** Fehlermuster, nicht zuverlässig die kognitiven Ursachen. Erst nach zwei verschiedenen Aufgaben mit demselben Muster wird eine leichtere Folgeaufgabe aktiviert.
- Standalone-Prototyp, **nicht** für einen schulischen Einsatz datenschutzrechtlich oder fachlich freigegeben. Schul-IT und Datenschutzbeauftragte vor Einsatz mit realen Kindern einbeziehen.
- Eigene neue Aufgabenarten müssen bisher im Code ergänzt werden. Eine visuelle Lehrkräfte-Werkstatt folgt in einer späteren Version.

## Weiterentwicklung

1. Reale Browser-Tests (Firefox, Chrome, Safari) inkl. mobil; Darstellung und Barrierefreiheit.
2. Lernpfade didaktisch ausbauen: anschauliche Erklärungen, gestufte Aufgaben, tatsächliche adaptive Diagnose.
3. Inhaltspflege über eine lokale Lehrkräfte-Werkstatt statt Quellcode.
4. Bereitstellung und Sicherheits-/Datenschutzprüfung für schulische Nutzung.
5. Erst nach schulischer Freigabe über pseudonyme Schülerkonten, IServ-Integration und Lehrkräfte-Dashboard nachdenken.

## Änderungen in v0.3

- Tipps zeigen erste Rechenschritte, statt die Verteilung vollständig vorwegzunehmen.
- Nach typischen falschen Antworten erscheinen aufgabenspezifische Erklärungen und passende Proberechnungen. Eine Antwort allein beweist **keine** bestimmte Fehlvorstellung.
- Bei Restaufgaben wird ein vergessener Rest von einem falsch berechneten Rest unterschieden; bei ungültigem Rest fokussiert die Eingabe das richtige Feld.
- Die Familienansicht bietet vorsichtige, freiwillige Übungsideen zu häufigen Antwortmustern.
- In Umkehraufgaben stimmen die groß dargestellte Rechnung und die Aufgabenfrage überein.
- Gleiche XP und Münzen für jede gelöste Aufgabe, unabhängig von Tippnutzung oder Fehlversuchen.
