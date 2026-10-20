# wir – Musikplayer, Version 004.7

Progressive Web App für GitHub Pages mit eingebetteten MP3-Covern, Favoriten, Offline-Downloads und automatisch erstellter Playlist.

## Neu in 004.5

- Playlist-Kopfzeile zeigt automatisch den **Namen der aktiven Liste** und die **Anzahl ihrer Titel** an. Eigene Listennamen werden unverändert übernommen; es wird keine Liste namens „Vormittag“ vorgegeben. Rechts steht **Listen**.
- Weckersymbol in der vorhandenen Filter-/Werkzeugzeile öffnet eine Titelauswahl für den Download als **normale Audiodatei**. Danach zeigt die App eine kurze Anleitung zum Einrichten in der Android-Uhr-App. Der Download ist unabhängig von der Offline-Speicherung der App. Der Browser bzw. das Gerät bestimmt den Speicherort. MP3, M4A und M4B behalten ihre Original-Dateiendung; für Android-Weckertöne ist MP3 am zuverlässigsten.
- Der eigentliche Wecker wird nicht von dieser Web-App gestellt. Die Auswahl einer eigenen Audiodatei hängt von der Android-Uhr-App ab.

## Neu in 004.4

- Wiedergabemodus über das kompakte Menü **☷** in der vorhandenen Playlist-Kopfzeile: **Alle wiederholen** (Standard), **Titel wiederholen**, **Am Listenende stoppen** sowie **Zufallswiedergabe**.
- Eigene, lokal gespeicherte Listen erstellen, bearbeiten, sortieren und löschen. Die gewählte Liste wird sofort zur aktiven Wiedergabeliste; laufende Musik wird nicht unterbrochen.
- Im Listen-Menü lassen sich Titel mit Auf/Ab-Schaltflächen umordnen. Dies ist auch auf Touch-Geräten nutzbar.
- Über **⋯** neben einem Titel lässt er sich für die spontane Warteschlange vormerken. Im Menü kann die Warteschlange umsortiert oder geleert werden. Sie hat beim automatischen Titelwechsel Vorrang.
- Die ursprüngliche Musikbibliothek und die MP3-Dateien werden durch Listenänderungen nicht verändert.

## Bedienung

Vier Wiedergabetasten: vorheriger Titel, Play/Pause, Stop, nächster Titel. Die Playlist ist intern scrollbar. Download-Pfeil speichert einzelne Titel offline, Häkchen bestätigt die Speicherung. Antippen des Häkchens öffnet die Abfrage **Titel behalten / Titel löschen**. Der Sammeldownload in der Kopfzeile lädt nur fehlende Titel. Herzchen markieren Favoriten.

**Aktualisierung:** Oben links auf „wir.“ oder rechts auf „UNSERE MUSIK“ tippen oder auf dem Smartphone herunterziehen und loslassen. Damit werden App-Version und Online-Mediathek geprüft.

## GitHub

MP3s in `audio/` hochladen. `.github/workflows/update-playlist.yml` und `generate_playlist.py` erzeugen `playlist.json` automatisch. GitHub Pages veröffentlicht die Dateien. Das Projekt verwendet `manifest.webmanifest`, `sw.js` und `version.json`.

## Update 004.4 → 004.5

Im Repository-Hauptverzeichnis **ersetzen**: `index.html`, `app.js`, `style.css`, `sw.js`, `version.json`, **`README.md`**.

**Unverändert:** `audio/`, `icons/`, `playlist.json`, `manifest.webmanifest`, `generate_playlist.py`, `.github/workflows/update-playlist.yml`.

Favoriten, Offline-Musik und bereits gespeicherte Einstellungen bleiben erhalten. Eigene Listen und Warteschlange werden nur auf dem jeweiligen Gerät verwaltet; die Warteschlange ist vorübergehend und wird nach einem Neustart geleert. Bei einem App-Update während der Wiedergabe fragt die App vor dem Neuladen nach.


## Neu in 004.6 (Entwicklungsfassung für `wir-test`)

- Die Schaltfläche **Wiedergabelisten** befindet sich jetzt neben **Alle Titel** und **Favoriten** in der Filterzeile. Auf schmalen Displays heißt sie **Listen**.
- Ein Klick öffnet die vorhandenen Wiedergabelisten; die aktive Liste wird markiert.
- Der Eintrag **Wiedergabelisten bearbeiten …** öffnet die Verwaltung zum Erstellen, Auswählen, Umbenennen, Befüllen, Sortieren und Löschen eigener Listen.
- Die Playlist-Kopfzeile zeigt weiterhin dynamisch den Namen der aktiven Liste und ihre Titelanzahl. Die frühere separate Schaltfläche **Listen** rechts oben entfällt.
- **☷** bleibt für Wiedergabeoptionen und Warteschlange; Weckton-Download, Favoriten und Offline-Funktionen bleiben erhalten.

## Update 004.5 → 004.6

In **`wir-test`** im Repository-Hauptverzeichnis ersetzen: `index.html`, `app.js`, `style.css`, `sw.js`, `version.json` und **`README.md`**.

**Unverändert lassen:** `audio/`, `icons/`, `playlist.json`, `manifest.webmanifest`, `generate_playlist.py`, `.github/workflows/update-playlist.yml`.

Die Produktivversion `wir` bleibt unverändert, bis die Testfassung freigegeben wird.

## Neu in 004.7 (nur `wir-test`)

- Kopfzeile: **Wiedergabeliste: [eigener Name] (Anzahl)**; bei der Gesamtsammlung **Alle Titel (Anzahl)**.
- Der Dialog „Wiedergabelisten“ enthält nur selbst erstellte Listen; die Gesamtsammlung ist über die vorhandene Schaltfläche „Alle Titel“ erreichbar.
- Die missverständliche Menüschaltfläche ☷ entfällt. **Wiederholung** (alle / einen / aus) und **Zufall** (ein / aus) werden direkt über zwei kleine Schaltflächen gesteuert. Wiederholung bezieht sich auf die aktive Liste.
- Die Warteschlange wird nur bei vorhandenen Einträgen als Schaltfläche angezeigt. Dort lassen sich Titel umordnen, entfernen oder die Warteschlange leeren.
- **⋯** öffnet ein Titelaktionsmenü: jetzt abspielen, als Nächstes, an Warteschlange anhängen, zu eigener Liste hinzufügen oder (innerhalb einer eigenen Liste) aus dieser entfernen.
- Favoriten sind bereits titelbezogen unter `wir-favorites-v1` gespeichert und damit in allen Wiedergabelisten einheitlich. Ein Herzchen ändert den Status überall.

## Update 004.6 → 004.7

In `wir-test` ersetzen: **`index.html`, `app.js`, `style.css`, `sw.js`, `version.json`, `README.md`**.

Unverändert: `audio/`, `icons/`, `playlist.json`, `manifest.webmanifest`, `generate_playlist.py`, `.github/workflows/update-playlist.yml`.

Die Daten in `localStorage` (Favoriten, Listen, Einstellungen) und der separate Audio-Offline-Cache werden nicht zurückgesetzt. Die temporäre Warteschlange bleibt nicht über einen Neustart erhalten.
