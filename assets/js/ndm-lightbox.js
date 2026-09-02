/* Podgląd zdjęcia po kliknięciu w treści wpisu.
   Zbiera wszystkie zdjęcia z .ndm-prose (shortcode foto, także te w galerii) i pozwala
   przechodzić między nimi strzałkami, klawiaturą i gestem na telefonie.
   Overlay to natywny <dialog> + showModal(), więc Esc, inertność tła i pułapka fokusa
   są za darmo. Gdy przeglądarka nie zna showModal, nie robimy nic — klik w zdjęcie
   zadziała wtedy jak zwykły link do dużego pliku. */
(function(){
  var links = [].slice.call(document.querySelectorAll('.ndm-prose .ndm-figure__link'));
  if(!links.length) return;
  if(typeof HTMLDialogElement === 'undefined' || !HTMLDialogElement.prototype.showModal) return;

  var dialog, img, cap, count, prevBtn, nextBtn;
  var idx = 0;

  function build(){
    dialog = document.createElement('dialog');
    dialog.className = 'ndm-lightbox';
    dialog.setAttribute('aria-label', 'Podgląd zdjęcia');
    dialog.innerHTML =
      '<button type="button" class="ndm-lightbox__close" aria-label="Zamknij podgląd">&times;</button>' +
      '<button type="button" class="ndm-lightbox__nav ndm-lightbox__nav--prev" aria-label="Poprzednie zdjęcie">&lsaquo;</button>' +
      '<button type="button" class="ndm-lightbox__nav ndm-lightbox__nav--next" aria-label="Następne zdjęcie">&rsaquo;</button>' +
      '<figure class="ndm-lightbox__fig">' +
        '<img class="ndm-lightbox__img" alt="">' +
        '<figcaption class="ndm-lightbox__cap"></figcaption>' +
      '</figure>' +
      '<div class="ndm-lightbox__count" aria-hidden="true"></div>';
    document.body.appendChild(dialog);

    img = dialog.querySelector('.ndm-lightbox__img');
    cap = dialog.querySelector('.ndm-lightbox__cap');
    count = dialog.querySelector('.ndm-lightbox__count');
    prevBtn = dialog.querySelector('.ndm-lightbox__nav--prev');
    nextBtn = dialog.querySelector('.ndm-lightbox__nav--next');

    dialog.querySelector('.ndm-lightbox__close').addEventListener('click', function(){ dialog.close(); });
    prevBtn.addEventListener('click', function(){ go(-1); });
    nextBtn.addEventListener('click', function(){ go(1); });

    // Klik obok zdjęcia zamyka; klik w samo zdjęcie, podpis lub przyciski — nie.
    dialog.addEventListener('click', function(e){
      if(!e.target.closest('.ndm-lightbox__img, .ndm-lightbox__cap, button')) dialog.close();
    });

    dialog.addEventListener('keydown', function(e){
      if(e.key === 'ArrowLeft'){ e.preventDefault(); go(-1); }
      else if(e.key === 'ArrowRight'){ e.preventDefault(); go(1); }
    });

    // Swipe na telefonie.
    var x0 = null, y0 = null;
    dialog.addEventListener('touchstart', function(e){
      x0 = e.changedTouches[0].clientX; y0 = e.changedTouches[0].clientY;
    }, {passive: true});
    dialog.addEventListener('touchend', function(e){
      if(x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      var dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      if(Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    }, {passive: true});

    // Esc i każde inne zamknięcie: oddaj stronie przewijanie.
    dialog.addEventListener('close', function(){
      document.documentElement.style.overflow = '';
    });
  }

  function show(i){
    idx = (i + links.length) % links.length;
    var link = links[idx];
    var thumb = link.querySelector('img');
    var figcap = link.parentElement ? link.parentElement.querySelector('.ndm-figure__cap') : null;

    img.src = link.getAttribute('href');
    img.alt = thumb ? thumb.getAttribute('alt') || '' : '';
    cap.textContent = figcap ? figcap.textContent.trim() : '';
    cap.hidden = !cap.textContent;
    count.textContent = links.length > 1 ? (idx + 1) + ' / ' + links.length : '';
  }

  function go(step){
    if(links.length < 2) return;
    show(idx + step);
  }

  function open(i){
    if(!dialog) build();
    var wiele = links.length > 1;
    prevBtn.hidden = !wiele;
    nextBtn.hidden = !wiele;
    show(i);
    document.documentElement.style.overflow = 'hidden';
    dialog.showModal();
  }

  links.forEach(function(link, i){
    link.addEventListener('click', function(e){
      // Ctrl/Cmd/środkowy przycisk zostawiamy przeglądarce — otwarcie w nowej karcie.
      if(e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      open(i);
    });
  });
})();
