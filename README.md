# wir – Musikplayer, Version 004.4

Progressive Web App für GitHub Pages mit eingebetteten MP3-Covern, Favoriten, Offline-Downloads und automatisch erstellter Playlist.

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

## Update 004.3 → 004.4

Im Repository-Hauptverzeichnis **ersetzen**: `index.html`, `app.js`, `style.css`, `sw.js`, `version.json`, **`README.md`**.

**Unverändert:** `audio/`, `icons/`, `playlist.json`, `manifest.webmanifest`, `generate_playlist.py`, `.github/workflows/update-playlist.yml`.

Favoriten, Offline-Musik und bereits gespeicherte Einstellungen bleiben erhalten. Eigene Listen und Warteschlange werden nur auf dem jeweiligen Gerät verwaltet; die Warteschlange ist vorübergehend und wird nach einem Neustart geleert. Bei einem App-Update während der Wiedergabe fragt die App vor dem Neuladen nach.
