/* Przyciski „Udostępnij" i „Zapisz" na stronie wpisu. */
(function(){
  // --- Udostępnij: Web Share API, a na desktopie fallback do schowka ---
  var shareBtn = document.querySelector('[data-share]');
  if(shareBtn){
    shareBtn.addEventListener('click', function(){
      var url = shareBtn.getAttribute('data-url') || location.href;
      var title = shareBtn.getAttribute('data-title') || document.title;
      if(navigator.share){
        navigator.share({title: title, url: url}).catch(function(){});
        return;
      }
      var done = function(){
        var prev = shareBtn.textContent;
        shareBtn.textContent = 'Skopiowano link';
        setTimeout(function(){ shareBtn.textContent = prev; }, 1600);
      };
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(url).then(done).catch(function(){ window.prompt('Skopiuj link:', url); });
      } else {
        window.prompt('Skopiuj link:', url);
      }
    });
  }

  // --- Zapisz: zakładka w localStorage (lokalnie, bez konta) ---
  var saveBtn = document.querySelector('[data-save]');
  if(saveBtn){
    var key = saveBtn.getAttribute('data-key');
    var render = function(saved){
      saveBtn.classList.toggle('is-saved', saved);
      saveBtn.setAttribute('aria-pressed', saved ? 'true' : 'false');
      saveBtn.textContent = saved ? 'Zapisane ✓' : 'Zapisz';
    };
    var meta = function(){
      return {
        title: saveBtn.getAttribute('data-title') || '',
        cat: saveBtn.getAttribute('data-cat') || '',
        catLabel: saveBtn.getAttribute('data-catlabel') || '',
        postDate: saveBtn.getAttribute('data-date') || '',
        readTime: saveBtn.getAttribute('data-readtime') || '',
        img: saveBtn.getAttribute('data-img') || '',
        excerpt: saveBtn.getAttribute('data-excerpt') || ''
      };
    };

    var stored = NdmStore.read();
    var isSaved = !!stored[key];
    // Migracja starszych zapisów: uzupełnij brakujące pola (np. zdjęcie),
    // zachowując oryginalny czas zapisu.
    if(isSaved){
      var fresh = meta();
      fresh.saved = NdmStore.ts(stored[key]) || Date.now();
      stored[key] = fresh;
      NdmStore.write(stored);
    }
    render(isSaved);

    saveBtn.addEventListener('click', function(){
      var data = NdmStore.read();
      if(data[key]){
        delete data[key];
      } else {
        var item = meta();
        item.saved = Date.now();
        data[key] = item;
      }
      NdmStore.write(data);
      render(!!data[key]);
    });
  }
})();
