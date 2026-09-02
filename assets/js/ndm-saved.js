/* Render strony „Zapisane". */
(function(){
  var grid = document.getElementById('ndm-saved-grid');
  var countEl = document.getElementById('ndm-saved-count');
  if(!grid) return;

  function showEmpty(){
    grid.className = 'ndm-saved-empty';
    grid.innerHTML = '';
    var p = document.createElement('p');
    p.className = 'ndm-saved__empty';
    p.textContent = grid.getAttribute('data-empty');
    grid.appendChild(p);
  }

  function el(tag, cls){ var n = document.createElement(tag); if(cls) n.className = cls; return n; }

  function card(key, item){
    var art = el('article', 'ndm-card' + (item.cat ? ' cat-' + item.cat : ''));

    var media = el('a', 'ndm-card__media');
    media.href = key;
    if(item.img){
      var img = el('img', 'ndm-card__img');
      // Zapisy sprzed poprawki data-img trzymają surową ścieżkę z front mattera
      // (np. "images/x.jpg"), która nigdzie nie istnieje. Takie wpisy leczą się
      // dopiero przy ponownej wizycie na stronie wpisu (migracja w ndm-article.js),
      // więc do tego czasu usuwamy zepsuty obrazek — karta pokazuje tło kategorii
      // zamiast ikony błędu.
      img.addEventListener('error', function(){ img.remove(); });
      img.src = item.img; img.alt = ''; img.loading = 'lazy';
      media.appendChild(img);
    }
    if(item.catLabel){
      var tag = el('span', 'ndm-tag');
      tag.appendChild(el('span', 'ndm-tag__dot'));
      var lbl = el('span', 'ndm-tag__label');
      lbl.textContent = item.catLabel;
      tag.appendChild(lbl);
      media.appendChild(tag);
    }
    var rm = el('button', 'ndm-card__remove');
    rm.type = 'button';
    rm.setAttribute('aria-label', 'Usuń z zapisanych');
    rm.title = 'Usuń z zapisanych';
    rm.innerHTML = '&times;';
    rm.addEventListener('click', function(ev){
      ev.preventDefault();
      var data = NdmStore.read();
      delete data[key];
      NdmStore.write(data);
      art.remove();
      refreshCount();
      if(!Object.keys(NdmStore.read()).length){ showEmpty(); }
    });
    art.appendChild(media);
    art.appendChild(rm);

    var body = el('div', 'ndm-card__body');
    var h = el('h4', 'ndm-card__title');
    var a = el('a'); a.href = key; a.textContent = item.title || key;
    h.appendChild(a); body.appendChild(h);

    if(item.excerpt){
      var p = el('p', 'ndm-card__excerpt');
      p.textContent = item.excerpt;
      body.appendChild(p);
    }
    if(item.postDate || item.readTime){
      var meta = el('div', 'ndm-card__meta');
      if(item.postDate){ var d = el('span'); d.textContent = item.postDate; meta.appendChild(d); }
      if(item.postDate && item.readTime){ var sep = el('span'); sep.textContent = '·'; meta.appendChild(sep); }
      if(item.readTime){ var r = el('span'); r.textContent = item.readTime + ' min'; meta.appendChild(r); }
      body.appendChild(meta);
    }
    art.appendChild(body);
    return art;
  }

  function refreshCount(){
    var n = Object.keys(NdmStore.read()).length;
    if(n){
      countEl.hidden = false;
      countEl.textContent = n + ' ' + NdmStore.odmiana(n, 'wpis', 'wpisy', 'wpisów');
    } else {
      countEl.hidden = true;
    }
  }

  var data = NdmStore.read();
  var keys = Object.keys(data);
  if(!keys.length){ showEmpty(); refreshCount(); return; }

  keys.sort(function(a, b){ return NdmStore.ts(data[b]) - NdmStore.ts(data[a]); });
  keys.forEach(function(key){ grid.appendChild(card(key, data[key])); });
  refreshCount();
})();
