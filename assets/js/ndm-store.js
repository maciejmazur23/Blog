/* Jedyne miejsce, które wie o kształcie danych w localStorage.
   Format danych NIE MOŻE się zmienić — użytkownicy mają już zapisane wpisy. */
window.NdmStore = (function(){
  var KEY = 'ndm-saved-posts';

  function read(){
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch(e){ return {}; }
  }

  function write(data){
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch(e){}
  }

  // Starsze zapisy trzymały czas pod kluczem `date`; nowsze pod `saved`.
  function ts(item){ return item.saved || item.date || 0; }

  // Odmiana polskich liczebników: 1 → f1; 2-4 → f2 (poza 12-14); reszta → f3.
  function odmiana(n, f1, f2, f3){
    if(n === 1) return f1;
    var r10 = n % 10, r100 = n % 100;
    if(r10 >= 2 && r10 <= 4 && (r100 < 12 || r100 > 14)) return f2;
    return f3;
  }

  return { KEY: KEY, read: read, write: write, ts: ts, odmiana: odmiana };
})();
