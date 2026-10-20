# wir · Musikplayer 004.3 – Sichere Offline-Löschung

Version 004.3 baut auf Version 004.2 auf. Das Layout der Playlist und alle bisherigen Funktionen bleiben erhalten.

## Änderung in 004.3

Beim Antippen des Häkchens ✓ neben einem offline gespeicherten Titel erscheint nun ein zur App passender Bestätigungsdialog statt der Safari-Systemabfrage.

- **Titel behalten**: Die Offline-Datei bleibt erhalten (auch beim Schließen mit Escape).
- **Titel löschen**: Nur die lokale Offline-Kopie dieses Titels wird entfernt. Der Titel bleibt in der Playlist und kann erneut heruntergeladen werden, solange er online verfügbar ist.
- Keine zweite Sicherheitsabfrage und kein überflüssiger Hinweis auf „Abbrechen“ oder „OK“.
- Herunterladen, Favoriten, Wiedergabe und Sammeldownload bleiben unverändert.

## Update von 004.2 auf 004.3: Diese sechs Dateien hochladen

Alle sechs Dateien liegen im **Hauptverzeichnis** des Update-ZIP und gehören ins **Hauptverzeichnis** des GitHub-Repositories:

1. `app.js` – Bestätigungslogik
2. `index.html` – Dialog und Versionsreferenzen
3. `style.css` – Darstellung des Dialogs
4. `sw.js` – aktualisierter App-Cache
5. `version.json` – Version 004.3
6. `README.md` – diese Dokumentation

**Nicht ersetzen:** `manifest.webmanifest`, `icons/`, `audio/`, `playlist.json`, `generate_playlist.py`, `.github/workflows/update-playlist.yml`.

## Hinweise

Nach dem Upload den erfolgreichen GitHub-Pages-Deploy abwarten. In Version 004.2 kann über die App-Aktualisierung eine neue Version erkannt werden. Bereits offline gespeicherte Audiodateien bleiben in ihrem separaten Cache `wir-audio-offline-v1` erhalten. Wie bei jeder PWA kann der Browser diesen Speicher unter bestimmten Umständen selbst bereinigen.
