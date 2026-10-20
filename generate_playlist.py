"""Generate playlist.json from audio files and their embedded metadata/cover art."""
import base64
import json
from pathlib import Path
from urllib.parse import quote

from mutagen import File
from mutagen.id3 import ID3, ID3NoHeaderError
from mutagen.mp4 import MP4

ROOT = Path(__file__).resolve().parent
FORMATS = {'.mp3', '.m4a', '.m4b'}


def webpath(path):
    return '/'.join(quote(part) for part in path.relative_to(ROOT).parts)


def first_text(value):
    if not value:
        return None
    if isinstance(value, list):
        value = value[0] if value else None
    return str(value).strip() if value else None


def metadata(path):
    title = artist = cover = None
    try:
        tags = File(path, easy=False)
        if isinstance(tags, MP4):
            title = first_text(tags.get('\xa9nam'))
            artist = first_text(tags.get('\xa9ART'))
            images = tags.get('covr', [])
            if images:
                raw = bytes(images[0])
                mime = 'image/png' if raw.startswith(b'\x89PNG') else 'image/jpeg'
                cover = f'data:{mime};base64,' + base64.b64encode(raw).decode('ascii')
        else:
            try:
                id3 = ID3(path)
            except ID3NoHeaderError:
                id3 = None
            if id3:
                t = id3.get('TIT2')
                a = id3.get('TPE1')
                title = first_text(t.text) if t else None
                artist = first_text(a.text) if a else None
                images = id3.getall('APIC')
                if images:
                    image = next((i for i in images if i.type == 3), images[0])
                    cover = 'data:' + (image.mime or 'image/jpeg') + ';base64,' + base64.b64encode(image.data).decode('ascii')
    except Exception as exc:
        print(f'Metadaten konnten nicht gelesen werden: {path.name}: {exc}')
    return title, artist, cover


previous={}
try:
    previous={t['file']:t for t in json.loads((ROOT/'playlist.json').read_text(encoding='utf-8')).get('tracks', [])}
except (OSError, ValueError, TypeError, KeyError):
    pass
tracks = []
(ROOT / 'audio').mkdir(exist_ok=True)
for audio in sorted((ROOT / 'audio').iterdir(), key=lambda p: p.name.casefold()):
    if not audio.is_file() or audio.suffix.lower() not in FORMATS:
        continue
    title, artist, cover = metadata(audio)
    track = {'title': title or audio.stem.replace('_', ' ').strip(), 'file': webpath(audio)}
    from datetime import datetime, timezone
    track['addedAt'] = previous.get(track['file'], {}).get('addedAt') or datetime.now(timezone.utc).isoformat()
    try:
        info = File(audio)
        if info and info.info and info.info.length:
            track['duration'] = round(float(info.info.length), 2)
    except Exception:
        pass
    if artist:
        track['artist'] = artist
    if cover:
        track['cover'] = cover
    tracks.append(track)

(ROOT / 'playlist.json').write_text(json.dumps({'tracks': tracks}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'{len(tracks)} Titel eingetragen')
