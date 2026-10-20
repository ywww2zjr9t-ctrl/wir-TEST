'use strict';
const $=id=>document.getElementById(id), audio=$('audio');
let tracks=[],current=-1,filter='all',sort='original',playing=false;
const OFFLINE_CACHE='wir-audio-offline-v1';let offlineFiles=new Set(),downloading=new Set(),downloadAllRunning=false,activeBlobUrl=null,loadToken=0;
const APP_VERSION='004.3';
const storageKey='wir-favorites-v1';const selectedKey='wir-selected-track-v2';let refreshing=false;let favorites=new Set(JSON.parse(localStorage.getItem(storageKey)||'[]'));
const remember=()=>localStorage.setItem(storageKey,JSON.stringify([...favorites]));
const fmt=s=>Number.isFinite(s)?`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`:'0:00';
const toast=msg=>{const e=$('toast');e.textContent=msg;e.style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>e.style.display='none',3200)};
const canPlay=track=>{const ext=track.file.split('.').pop().toLowerCase();return audio.canPlayType(ext==='mp3'?'audio/mpeg':'audio/mp4')!==''};
function updateControls(){const t=tracks[current];$('title').textContent=t?t.title:'Noch keine Musik';$('play').innerHTML=playing?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zm6 0h4v14h-4z" fill="currentColor"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';$('play').setAttribute('aria-label',playing?'Pause':'Abspielen');$('count').textContent=`(${tracks.length})`;const c=$('cover');c.replaceChildren();if(t&&t.cover){const img=new Image();img.src=t.cover;img.alt='Cover: '+t.title;img.onerror=()=>{c.innerHTML='<img src="icons/icon-512.png" alt="Musiknote aus Licht">'};c.append(img)}else c.innerHTML='<img src="icons/icon-512.png" alt="Musiknote aus Licht">';}
const trackURL=t=>new URL(t.file,location.href).href;
async function refreshOfflineStatus(){
 try{const cache=await caches.open(OFFLINE_CACHE);const keys=await cache.keys();offlineFiles=new Set(keys.map(k=>k.url));}catch(e){offlineFiles=new Set();toast('Offline-Speicher nicht verfügbar.');}
 updateDownloadAll();renderList();
}
function updateDownloadAll(){const button=$('download-all');if(!button)return;const missing=tracks.filter(t=>!offlineFiles.has(trackURL(t))).length;
 $('missing-count').textContent=downloadAllRunning?'…':missing?String(missing):'';
 button.firstChild.textContent=downloadAllRunning?'◌':missing?'↓':'✓';
 button.title=downloadAllRunning?'Offline-Download läuft':missing?`${missing} fehlende Titel offline speichern`:'Alle Titel offline verfügbar';
 button.setAttribute('aria-label',button.title);button.disabled=downloadAllRunning||missing===0;
}
async function downloadTrack(t,{silent=false}={}){
 const url=trackURL(t);if(offlineFiles.has(url)||downloading.has(url))return true;
 downloading.add(url);renderList();updateDownloadAll();
 try{
  const response=await fetch(url,{cache:'no-store'});
  if(!response.ok||response.type==='opaque')throw Error('HTTP '+response.status);
  // Cache erst nach vollständigem Empfang befüllen; keine Teil-Dateien als fertig markieren.
  const blob=await response.blob();if(!blob.size)throw Error('Leere Datei');
  const cache=await caches.open(OFFLINE_CACHE);
  await cache.put(url,new Response(blob,{headers:{'Content-Type':response.headers.get('Content-Type')||'audio/mpeg','Content-Length':String(blob.size)}}));
  offlineFiles.add(url);if(!silent)toast('Offline gespeichert: '+t.title);return true;
 }catch(e){if(!silent)toast('Download fehlgeschlagen: '+t.title);return false}
 finally{downloading.delete(url);renderList();updateDownloadAll()}
}
async function downloadMissing(){if(downloadAllRunning)return;downloadAllRunning=true;updateDownloadAll();
 const missing=tracks.filter(t=>!offlineFiles.has(trackURL(t)));let completed=0,failed=0;
 for(const t of missing){toast(`Offline speichern: ${completed+failed+1} von ${missing.length}`);if(await downloadTrack(t,{silent:true}))completed++;else failed++;}
 downloadAllRunning=false;updateDownloadAll();toast(`${completed} Titel gespeichert`+(failed?` · ${failed} fehlgeschlagen`:''));
}
$('download-all').onclick=downloadMissing;
async function loadAudioForTrack(t,token,autoplay){
 let source=t.file;
 if(offlineFiles.has(trackURL(t))){
  try{const cache=await caches.open(OFFLINE_CACHE);const response=await cache.match(trackURL(t));
   if(response){const blob=await response.blob();if(token!==loadToken)return;source=URL.createObjectURL(blob);}
   else{offlineFiles.delete(trackURL(t));updateDownloadAll();renderList();}
  }catch(e){source=t.file}
 }
 if(token!==loadToken){if(source.startsWith('blob:'))URL.revokeObjectURL(source);return}
 audio.src=source;audio.load();if(activeBlobUrl)URL.revokeObjectURL(activeBlobUrl);
 activeBlobUrl=source.startsWith('blob:')?source:null;
 if(autoplay)play();
}
function select(i,autoplay=true){if(i<0||i>=tracks.length)return;current=i;const t=tracks[i];localStorage.setItem(selectedKey,t.file);audio.pause();audio.removeAttribute('src');audio.load();playing=false;updateControls();renderList();loadAudioForTrack(t,++loadToken,autoplay);}
async function play(){if(!tracks.length){toast('Noch keine Musik vorhanden.');return}if(current<0){select(0,true);return}try{await audio.play();playing=true;updateControls()}catch(e){playing=false;updateControls();toast('Wiedergabe nicht möglich. Bitte Audioformat prüfen.')}}
function pause(){audio.pause();playing=false;updateControls()}
function stop(){audio.pause();try{audio.currentTime=0}catch(e){}playing=false;updateControls();updateProgress()}
function next(direction=1){if(!tracks.length)return;select((current+direction+tracks.length)%tracks.length)}
function updateProgress(){const dur=audio.duration||0;$('elapsed').textContent=fmt(audio.currentTime||0);$('duration').textContent=fmt(dur);$('seek').value=dur?Math.round((audio.currentTime/dur)*1000):0;}
function confirmOfflineRemoval(title){
 const dialog=$('offline-delete-dialog');
 const name=$('offline-delete-title');
 const keep=$('offline-keep');
 const remove=$('offline-remove');
 if(!dialog||typeof dialog.showModal!=='function'){
  // In alten Browsern im Zweifel nichts löschen.
  toast('Löschen auf diesem Gerät nicht verfügbar.');
  return Promise.resolve(false);
 }
 name.textContent='„'+title+'“';
 return new Promise(resolve=>{
  let finished=false;
  const finish=approved=>{
   if(finished)return;
   finished=true;
   dialog.removeEventListener('close',onClose);
   keep.removeEventListener('click',onKeep);
   remove.removeEventListener('click',onRemove);
   if(dialog.open)dialog.close();
   resolve(approved);
  };
  const onClose=()=>finish(false);
  const onKeep=()=>finish(false);
  const onRemove=()=>finish(true);
  dialog.addEventListener('close',onClose);
  keep.addEventListener('click',onKeep);
  remove.addEventListener('click',onRemove);
  try{dialog.showModal();keep.focus();}catch(e){finish(false)}
 });
}
function renderList(){const list=$('track-list');list.replaceChildren();let rows=tracks.map((t,i)=>({...t,i}));if(filter==='favorites')rows=rows.filter(t=>favorites.has(t.file));if(sort==='alpha')rows.sort((a,b)=>a.title.localeCompare(b.title,'de'));if(sort==='new')rows.reverse();if(!rows.length){const e=document.createElement('div');e.className='empty';e.textContent=tracks.length?'Hier sind noch keine Favoriten. Tippe bei einem Titel auf ♡.':'Noch keine Titel. Lade MP3-, M4A- oder M4B-Dateien in den Ordner audio hoch.';list.append(e);return}for(const t of rows){const row=document.createElement('div');row.className='track'+(t.i===current?' playing':'');const btn=document.createElement('button');btn.className='track-select';const mini=document.createElement('span');mini.className='mini-cover';if(t.cover){const img=new Image();img.src=t.cover;img.alt='';img.onerror=()=>mini.textContent='♫';mini.append(img)}else mini.textContent='♫';const text=document.createElement('span');text.style.minWidth='0';const name=document.createElement('div');name.className='track-name';name.textContent=t.title;text.append(name);btn.append(mini,text);btn.onclick=()=>select(t.i);const heart=document.createElement('button');heart.className='heart'+(favorites.has(t.file)?' on':'');heart.textContent=favorites.has(t.file)?'♥':'♡';heart.setAttribute('aria-label','Favorit umschalten: '+t.title);heart.onclick=()=>{favorites.has(t.file)?favorites.delete(t.file):favorites.add(t.file);remember();renderList();updateControls()};const download=document.createElement('button');download.className='download-track';const url=trackURL(t);const saved=offlineFiles.has(url),busy=downloading.has(url);download.textContent=busy?'◌':saved?'✓':'↓';download.classList.toggle('saved',saved);download.classList.toggle('busy',busy);download.title=busy?'Download läuft':saved?'Offline verfügbar – antippen zum Entfernen':'Offline speichern';download.setAttribute('aria-label',download.title+': '+t.title);download.onclick=async()=>{if(busy)return;if(saved){const approved=await confirmOfflineRemoval(t.title);if(!approved)return;try{const cache=await caches.open(OFFLINE_CACHE);await cache.delete(url);offlineFiles.delete(url);toast('Offline-Kopie entfernt: '+t.title);renderList();updateDownloadAll()}catch(e){toast('Offline-Kopie konnte nicht entfernt werden')}}else await downloadTrack(t)};row.append(btn,download,heart);list.append(row)}}
$('play').onclick=()=>playing?pause():play();$('previous').onclick=()=>next(-1);$('next').onclick=()=>next(1);$('stop').onclick=stop;$('seek').oninput=e=>{if(current>=0&&Number.isFinite(audio.duration))audio.currentTime=Number(e.target.value)/1000*audio.duration};$('toggle-list').onclick=()=>{const e=$('playlist-shell');e.classList.toggle('open');$('toggle-list').setAttribute('aria-expanded',String(e.classList.contains('open')))};$('all-filter').onclick=()=>{filter='all';$('all-filter').classList.add('selected');$('fav-filter').classList.remove('selected');renderList()};$('fav-filter').onclick=()=>{filter='favorites';$('fav-filter').classList.add('selected');$('all-filter').classList.remove('selected');renderList()};$('sort').onchange=e=>{sort=e.target.value;renderList()};audio.ontimeupdate=updateProgress;audio.onloadedmetadata=updateProgress;audio.onpause=()=>{playing=false;updateControls()};audio.onplay=()=>{playing=true;updateControls()};audio.onerror=()=>{if(current>=0){const codes={1:'Wiedergabe abgebrochen',2:'Datei konnte nicht geladen werden',3:'Audio konnte nicht decodiert werden',4:'Audioformat oder Dateipfad nicht unterstützt'};const code=audio.error?.code;toast((codes[code]||'Audiofehler')+' (Code '+(code||'?')+').')}};audio.onended=()=>{if(current<tracks.length-1)next();else stop()};
async function refreshPlaylist({quiet=false}={}){
 if(refreshing)return;refreshing=true;
 const oldFile=tracks[current]?.file;const wasPlaying=!audio.paused&&!audio.ended;
 if(!quiet)toast('Musik wird aktualisiert …');
 try{
  const r=await fetch('./playlist.json?refresh='+Date.now(),{cache:'no-store'});
  if(!r.ok)throw Error('HTTP '+r.status);
  const data=await r.json();const updated=(Array.isArray(data)?data:data.tracks||[]).filter(t=>t&&t.file&&t.title);
  tracks=updated;updateDownloadAll();
  const keep=oldFile&&tracks.findIndex(t=>t.file===oldFile);
  const saved=localStorage.getItem(selectedKey);
  const savedIndex=saved?tracks.findIndex(t=>t.file===saved):-1;
  const i=tracks.length?(keep>=0?keep:(savedIndex>=0?savedIndex:0)):-1;
  if(i>=0){
   if(keep>=0){current=i;updateControls();renderList()}
   else{if(wasPlaying)audio.pause();select(i,false)}
  }else{audio.pause();audio.removeAttribute('src');audio.load();current=-1;playing=false;updateControls();updateProgress();renderList()}
  if(!quiet)toast(tracks.length+' Titel · Playlist aktualisiert');
 }catch(e){if(!quiet)toast('Aktualisierung fehlgeschlagen · bestehende Playlist bleibt erhalten');}
 finally{refreshing=false}
}
let updateCheckRunning=false;
async function checkAppUpdate(){
 if(updateCheckRunning||!navigator.onLine)return false;
 updateCheckRunning=true;
 try{
  const response=await fetch('./version.json?check='+Date.now(),{cache:'no-store'});
  if(!response.ok)return false;
  const info=await response.json();
  if(info.version===APP_VERSION)return false;
  const activePlayback=!audio.paused&&!audio.ended;
  if(activePlayback&&!window.confirm('Neue App-Version '+info.version+' verfügbar.\n\nDie Wiedergabe wird beim Aktualisieren unterbrochen. Jetzt aktualisieren?')){
   toast('App-Update verschoben · Musik läuft weiter');return true;
  }
  toast('Neue App-Version wird geladen …');
  if('serviceWorker' in navigator){
   try{
    const reg=await navigator.serviceWorker.getRegistration();
    if(reg){
     // Ein neu installierter Worker übernimmt; Offline-Audio liegt in einem separaten Cache.
     await reg.update();
     if(reg.installing){await new Promise(resolve=>{
      const worker=reg.installing;
      if(worker.state==='activated'||worker.state==='redundant')return resolve();
      worker.addEventListener('statechange',()=>{if(worker.state==='activated'||worker.state==='redundant')resolve()});
      setTimeout(resolve,7000);
     })}
    }
   }catch(e){/* Ohne Service Worker weiterhin online aktualisieren. */}
  }
  // Navigation erzwingt ein neues HTML; versionierte CSS/JS-URLs vermeiden alte Assets.
  const url=new URL(location.href);url.searchParams.set('app_update',info.version);
  location.replace(url.href);
  return true;
 }catch(e){return false}
 finally{updateCheckRunning=false}
}
async function refreshEverything(){
 if(!$('playlist-shell').classList.contains('open')){$('playlist-shell').classList.add('open');$('toggle-list').setAttribute('aria-expanded','true')}
 $('track-list').scrollTop=0;
 // Erst die App-Version prüfen; nur wenn kein Wechsel erfolgt die Playlist auffrischen.
 if(await checkAppUpdate())return;
 await refreshPlaylist();await refreshOfflineStatus();
}
function homeRefresh(){void refreshEverything()}
$('home-brand').onclick=homeRefresh;$('home-tagline').onclick=homeRefresh;
let pullStart=null,pullDistance=0;const indicator=$('pull-indicator');
const isPlaylistScroll=(target)=>!!target.closest?.('.track-list');
document.addEventListener('touchstart',e=>{if(e.touches.length!==1||isPlaylistScroll(e.target))return;pullStart=e.touches[0].clientY;pullDistance=0},{passive:true});
document.addEventListener('touchmove',e=>{if(pullStart===null)return;pullDistance=Math.max(0,e.touches[0].clientY-pullStart);if(pullDistance>12){indicator.style.opacity='1';indicator.style.transform='translate(-50%,0)';indicator.textContent=pullDistance>75?'↑ Loslassen zum Aktualisieren':'↓ Zum Aktualisieren ziehen'}},{passive:true});
document.addEventListener('touchend',()=>{if(pullStart!==null&&pullDistance>75)void refreshEverything();pullStart=null;pullDistance=0;indicator.style.opacity='0';indicator.style.transform='translate(-50%,-15px)'},{passive:true});
(async()=>{await refreshOfflineStatus();await refreshPlaylist({quiet:true});await refreshOfflineStatus()})();
if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js?v=0042',{updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{})}
