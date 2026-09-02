/* Scrollspy spisu treści na stronie wpisu. */
(function(){
  var toc = document.querySelector('.ndm-toc');
  if(!toc) return;
  var links = Array.prototype.slice.call(toc.querySelectorAll('a'));
  // Każdy wpis: href z TOC + realny element nagłówka.
  // Uwaga: id siedzi na pustym <div class="anchor"> (position:relative; top:-150px),
  // więc bierzemy jego nagłówek (closest h1..h6), żeby mierzyć prawdziwą pozycję.
  var entries = links.map(function(a){
    var href = a.getAttribute('href');
    if(!href || href.charAt(0) !== '#') return null;
    var anchor = document.getElementById(decodeURIComponent(href.slice(1)));
    if(!anchor) return null;
    var heading = anchor.closest('h1,h2,h3,h4,h5,h6') || anchor;
    return { href: href, el: heading };
  }).filter(Boolean);

  function onScroll(){
    if(!entries.length) return;
    var docEl = document.documentElement;
    var maxScroll = Math.max(0, docEl.scrollHeight - window.innerHeight);
    var current = entries[0].href;
    if(maxScroll > 0){
      // pozycje nagłówków względem dokumentu
      var tops = entries.map(function(e){
        return e.el.getBoundingClientRect().top + window.scrollY;
      });
      // linia czytania ~30% wysokości okna; powiększona tak, by ostatni nagłówek
      // był osiągalny dokładnie przy dnie strony (gwarancja progresji bez przeskoków
      // nawet na krótkich wpisach)
      var line = Math.max(window.innerHeight * 0.3, tops[tops.length - 1] - maxScroll + 8);
      for(var i = 0; i < entries.length; i++){
        if(tops[i] - line <= window.scrollY) current = entries[i].href;
      }
    }
    links.forEach(function(a){
      a.classList.toggle('is-active', a.getAttribute('href') === current);
    });
  }

  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll, {passive:true});
  onScroll();
})();
