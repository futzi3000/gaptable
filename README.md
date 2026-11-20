# GapTable

Ein Tabellen-Widget, bei dem der **vertikale Abstand zwischen zwei Zeilen proportional zum Punkteabstand** ist. Teams mit gleicher Punktzahl stehen direkt untereinander, große Rückstände werden als Leerraum sichtbar.

**Live-Demo:** https://futzi3000.github.io/gaptable/

Es ist eine Web Component ohne Abhängigkeiten. Die Daten kommen live von [OpenLigaDB](https://www.openligadb.de).

## Einbinden

```html
<script src="gap-table.js"></script>

<gap-table league="bl1"></gap-table>
<gap-table league="bl2" gap="10" theme="light"></gap-table>
```

## Attribute

| Attribut  | Werte            | Default          | Bedeutung                                |
|-----------|------------------|------------------|------------------------------------------|
| `league`  | `bl1`, `bl2`     | `bl1`            | Liga                                     |
| `season`  | z. B. `2026`     | aktuelle Saison  | Startjahr der Saison                     |
| `gap`     | Zahl ≥ 0         | `6`              | Pixel je Punkt Abstand (`0` = klassisch) |
| `max-gap` | Zahl > 0         | `240`            | Obergrenze einer einzelnen Lücke in px   |
| `theme`   | `dark`, `light`  | `dark`           | Farbschema                               |
| `title`   | Text             | Liga + Saison    | Überschrift                              |

Alle Attribute lassen sich zur Laufzeit ändern, das Widget rendert dann neu.

## Anpassen

Farben lassen sich über CSS-Variablen überschreiben, z. B.:

```css
gap-table { --gt-accent: #e2001a; --gt-down: #900; }
```

Für tiefere Eingriffe gibt es `::part(wrap)`, `::part(title)` und `::part(card)`.

## Demo lokal starten

```bash
npx serve .
# oder
python3 -m http.server 8000
```

Dann `http://localhost:8000` öffnen.
