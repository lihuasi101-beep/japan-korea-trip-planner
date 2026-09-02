(function () {
  const SUPABASE_URL = 'https://pbosizrfcforeuzrgjbx.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_bF0jUyf6ZpRiSEDOESkdaw_PE3H1QDQ';
  const TRIP_ID = 'japan-korea-trip-2026-09';
  const TABLE = 'jk_trip_notes';
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'assets/css/supabase-sync.css';
  document.head.appendChild(style);

  let client = null;
  let user = null;
  let syncing = false;
  let syncTimer = null;

  const localNotes = () => TripStore.getState().personalNotes || [];
  const renderLocal = () => {
    if (typeof renderMemo === 'function') renderMemo();
  };
  const setCard = (state, title, detail) => {
    const card = document.querySelector('.cloud-sync-card');
    if (!card) return;
    card.dataset.state = state;
    const titleNode = card.querySelector('[data-cloud-title]');
    const detailNode = card.querySelector('[data-cloud-detail]');
    if (titleNode) titleNode.textContent = title;
    if (detailNode) detailNode.textContent = detail;
    const status = card.querySelector('.cloud-sync-status');
    if (status) status.textContent = detail;
  };

  function renderCard() {
    const memo = document.querySelector('#memo');
    if (!memo || memo.querySelector('.cloud-sync-card')) return;
    const layout = memo.querySelector('.memo-layout');
    if (!layout) return;
    const card = document.createElement('section');
    card.className = 'cloud-sync-card';
    card.innerHTML = `<div class="cloud-sync-copy"><b data-cloud-title>个人备忘云同步</b><p data-cloud-detail>登录后可在电脑和手机查看同一份备忘，本地内容会先保留。</p></div><div class="cloud-sync-actions"><input type="email" data-cloud-email placeholder="输入邮箱接收登录链接" autocomplete="email"><button type="button" class="cloud-primary" data-cloud-login>发送登录链接</button><button type="button" class="cloud-signout" data-cloud-logout hidden>退出登录</button></div><p class="cloud-sync-status" aria-live="polite">尚未登录 · 当前设备仍可离线使用</p>`;
    layout.before(card);
    card.addEventListener('click', event => {
      if (event.target.closest('[data-cloud-login]')) signIn(card);
      if (event.target.closest('[data-cloud-logout]')) client?.auth.signOut();
    });
  }

  function updateAuthUI() {
    const card = document.querySelector('.cloud-sync-card');
    if (!card) return;
    const email = card.querySelector('[data-cloud-email]');
    const login = card.querySelector('[data-cloud-login]');
    const logout = card.querySelector('[data-cloud-logout]');
    if (user) {
      email.value = user.email || '';
      email.disabled = true;
      login.hidden = true;
      logout.hidden = false;
      setCard('ok', '已连接云端备忘', `${user.email} · 会自动同步到登录此账号的设备`);
    } else {
      email.disabled = false;
      login.hidden = false;
      logout.hidden = true;
      setCard('', '个人备忘云同步', '登录后可在电脑和手机查看同一份备忘，本地内容会先保留。');
    }
  }

  async function signIn(card) {
    const email = card.querySelector('[data-cloud-email]').value.trim();
    if (!email) return setCard('error', '请输入邮箱', '需要邮箱才能发送一次性登录链接。');
    setCard('', '正在发送登录链接…', '请检查邮箱（包括垃圾邮件文件夹）。');
    const redirect = new URL(window.location.href);
    redirect.search = '';
    redirect.hash = '';
    const { error } = await client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirect.href }
    });
    if (error) setCard('error', '登录链接发送失败', error.message);
    else setCard('ok', '登录链接已发送', '请在邮箱中点击链接，返回此页面后会自动同步。');
  }

  function noteToRow(note) {
    return { user_id: user.id, trip_id: TRIP_ID, note_id: note.id, category: note.category, title: note.title, detail: note.detail || '', done: Boolean(note.done), created_at: note.createdAt, updated_at: note.updatedAt || new Date().toISOString() };
  }

  async function pushLocal() {
    if (!client || !user || syncing) return;
    const notes = localNotes();
    const { data: remote, error: readError } = await client.from(TABLE).select('note_id').eq('trip_id', TRIP_ID);
    if (readError) return setCard('error', '云端表尚未准备好', '请先在 Supabase SQL Editor 执行 supabase/personal-notes.sql。');
    const localIds = new Set(notes.map(note => note.id));
    const stale = (remote || []).map(row => row.note_id).filter(id => !localIds.has(id));
    if (stale.length) {
      const { error } = await client.from(TABLE).delete().eq('trip_id', TRIP_ID).in('note_id', stale);
      if (error) return setCard('error', '删除同步失败', error.message);
    }
    if (notes.length) {
      const { error } = await client.from(TABLE).upsert(notes.map(noteToRow), { onConflict: 'user_id,trip_id,note_id' });
      if (error) return setCard('error', '备忘同步失败', error.message);
    }
    setCard('ok', '已连接云端备忘', `${user.email} · 刚刚同步完成`);
  }

  async function pullAndMerge() {
    if (!client || !user || syncing) return;
    syncing = true;
    setCard('', '正在同步备忘…', '正在合并本机与云端内容。');
    const { data: remote, error } = await client.from(TABLE).select('*').eq('trip_id', TRIP_ID).order('updated_at', { ascending: true });
    if (error) {
      syncing = false;
      return setCard('error', '云端表尚未准备好', '请先在 Supabase SQL Editor 执行 supabase/personal-notes.sql。');
    }
    const merged = new Map(localNotes().map(note => [note.id, note]));
    (remote || []).forEach(row => {
      const existing = merged.get(row.note_id);
      if (!existing || new Date(row.updated_at) >= new Date(existing.updatedAt || existing.createdAt)) merged.set(row.note_id, { id: row.note_id, category: row.category, title: row.title, detail: row.detail || '', done: Boolean(row.done), createdAt: row.created_at, updatedAt: row.updated_at });
    });
    TripStore.savePersonalNotes([...merged.values()]);
    renderLocal();
    syncing = false;
    await pushLocal();
  }

  function schedulePush() {
    if (!user) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      const notes = localNotes().map(note => ({ ...note, updatedAt: new Date().toISOString() }));
      TripStore.savePersonalNotes(notes);
      pushLocal();
    }, 350);
  }

  async function init() {
    renderCard();
    if (!window.supabase?.createClient) return setCard('error', '云同步组件加载失败', '请检查网络后刷新页面；本地备忘仍可正常使用。');
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    client.auth.onAuthStateChange((_event, session) => {
      user = session?.user || null;
      updateAuthUI();
      if (user) pullAndMerge();
    });
    const { data } = await client.auth.getSession();
    user = data.session?.user || null;
    updateAuthUI();
    if (user) pullAndMerge();
    const memo = document.querySelector('#memo');
    memo?.addEventListener('submit', event => { if (!event.target.closest('.cloud-sync-card')) schedulePush(); });
    memo?.addEventListener('change', event => { if (!event.target.closest('.cloud-sync-card')) schedulePush(); });
    memo?.addEventListener('click', event => { if (event.target.closest('[data-memo-delete],[data-memo-undo]')) schedulePush(); });
    const observer = new MutationObserver(renderCard);
    observer.observe(memo, { childList: true, subtree: true });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
