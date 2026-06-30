/* ============================================================
   storage.js — shared localStorage layer for the invitation.
   Both index.html (guest RSVP form) and admin.html (dashboard)
   read/write the same key so responses sync within one browser.
   ============================================================ */
const Storage = (() => {
  const KEY = 'wedding_isuru_tharushi_rsvps';

  function getAll(){
    try{
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){
      console.error('Storage read failed', e);
      return [];
    }
  }

  function saveAll(list){
    try{
      localStorage.setItem(KEY, JSON.stringify(list));
      return true;
    }catch(e){
      console.error('Storage write failed', e);
      return false;
    }
  }

  function addResponse(entry){
    const list = getAll();
    list.push({
      id: 'g_' + Date.now() + '_' + Math.random().toString(36).slice(2,7),
      ...entry,
      updatedAt: new Date().toISOString()
    });
    saveAll(list);
    return list;
  }

  function removeResponse(id){
    const list = getAll().filter(r => r.id !== id);
    saveAll(list);
    return list;
  }

  function clearAll(){
    saveAll([]);
  }

  return { getAll, saveAll, addResponse, removeResponse, clearAll };
})();
