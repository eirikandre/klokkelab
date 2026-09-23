# ⏰ Klokkelab

Et lite læringsspill for å øve på å lese klokka på norsk — fra hele timer til
«tre minutter over sju» og 24-timersklokka.

**👉 Appen ligger på [https://klokkelab.eidså.no](https://klokkelab.eidså.no)**

## Om appen

Klokkelab er ren HTML, CSS og JavaScript uten byggesteg eller rammeverk.
All progresjon lagres lokalt i nettleseren (`localStorage`) — ingen data sendes
noe sted, og ingen innlogging trengs.

### Spillmoduser

| Modus | Beskrivelse |
|---|---|
| 🔢 ➜ 📝 Les klokka | Du ser et klokkeslett og velger riktig norsk tekst |
| 📝 ➜ 🔢 Sett klokka | Du får teksten og skal finne riktig klokkeslett |
| 🔀 Blandet | Tilfeldig blanding av begge |

### Nivåer

1. 🕐 **Hele timer** — klokka ett, to, tre …
2. 🕜 **Halve timer** — halv to, halv ni (husk at halv ni er 08:30!)
3. 🕒 **Kvarter** — kvart over og kvart på
4. 🕔 **Fem og fem** — ti på halv, fem over halv …
5. ⏱️ **Alle minutter** — også «tre minutter over sju»
6. 🌗 **24-timers hele timer** — morgen, kveld eller natt?
7. 🌍 **24-timers klokke** — 13:45 = kvart på to på ettermiddagen

Hver runde er 10 spørsmål. Underveis samler du poeng, bygger rekker og låser opp
merker som «Feilfritt», «10 på rad» og «Klokkemester».

## Kjøre lokalt

Åpne `index.html` rett i nettleseren, eller start en enkel webserver:

```bash
python3 -m http.server 8080
```

Appen ligger da på http://localhost:8080.

### Med Docker

Appen serveres av nginx i produksjon:

```bash
docker build -t klokkelab .
docker run -d -p 8080:80 klokkelab
```

## Filer

| Fil | Innhold |
|---|---|
| `index.html` | Markup og alle skjermbilder |
| `app.js` | Spillogikk, klokkeslett-til-tekst, progresjon |
| `style.css` | Styling |
| `Dockerfile` | nginx-image for servering |
| `nginx.conf` | Serverkonfig: gzip, caching |
