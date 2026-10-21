# ⏰ Klokkelab

Et lite læringsspill for å øve på å lese klokka på norsk — fra hele timer til
«tre minutter over sju» og 24-timersklokka.

**👉 Appen ligger på [https://klokkelab.eidsa.no](https://klokkelab.eidsa.no)**

## Om appen

Klokkelab er ren HTML, CSS og JavaScript uten byggesteg eller rammeverk.
All progresjon lagres lokalt i nettleseren (`localStorage`) — ingen data sendes
noe sted, og ingen innlogging trengs. Se [personvernerklæringen](personvern.html).

### Spillmoduser

| Modus | Beskrivelse |
|---|---|
| 🔢 ➜ 📝 Les klokka | Du ser et klokkeslett og velger riktig norsk tekst |
| 📝 ➜ 🔢 Sett klokka | Du får teksten og skal finne riktig klokkeslett |
| 🔀 Blandet | Tilfeldig blanding av begge |

Under modusvalget kan du velge om klokkeslettet skal sammenlignes med **📝 tekst**
eller en **🕰️ analog klokke**. Med analog klokke velger du riktig urskive for et
digitalt klokkeslett (Les klokka), eller riktig digitalt klokkeslett for en urskive
(Sett klokka). På 24-timersnivåene står tiden på døgnet under urskiva, siden en
analog klokke ikke skiller 05:00 fra 17:00.

### Nivåer

1. 🕐 **Hele timer** — klokka ett, to, tre …
2. 🕜 **Halve timer** — halv to, halv ni (husk at halv ni er 08:30!)
3. 🕒 **Kvarter** — kvart over og kvart på
4. 🕙 **Ti og ti** — ti over, ti på halv, ti over halv …
5. 🕔 **Fem og fem** — fem på halv, fem over halv …
6. ⏱️ **Alle minutter** — også «tre minutter over sju»
7. 🌗 **24-timers hele timer** — morgen, kveld eller natt?
8. 🌍 **24-timers klokke** — 13:45 = kvart på to på ettermiddagen

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
| `personvern.html` | Personvernerklæring |
| `app.js` | Spillogikk, klokkeslett-til-tekst, progresjon |
| `style.css` | Styling |
| `favicon.svg` | Ikon i fanen og i søkeresultater |
| `robots.txt`, `sitemap.xml` | Forteller søkemotorer hvilke sider som finnes |
| `Dockerfile` | nginx-image for servering |
| `nginx.conf` | Serverkonfig: gzip, caching |
