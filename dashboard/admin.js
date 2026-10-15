/* ── Auth (demo) ── */
function doLogin(e) {
  e.preventDefault();
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
  startClock();
  showAlertBadge(4);
}
function doLogout() {
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-page').style.display = 'flex';
}

/* ── Clock ── */
function startClock() {
  function tick() {
    const now = new Date();
    const tw = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Taipei' }));
    document.getElementById('topbar-time').textContent =
      tw.toLocaleTimeString('zh-TW', { hour12: false });
  }
  tick();
  setInterval(tick, 1000);
}

/* ── Countdown ── */
(function() {
  const el = document.getElementById('a1-countdown');
  if (!el) return;
  const target = new Date();
  target.setHours(20, 20, 0, 0);
  if (target < new Date()) target.setDate(target.getDate() + 1);
  function tick() {
    const diff = Math.max(0, target - new Date());
    const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
    const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
    el.textContent = `${h}:${m}:${s}`;
  }
  tick();
  setInterval(tick, 1000);
})();

/* ── Navigation ── */
const PAGE_TITLES = {
  a1: '總覽', a2: '內容管理', a3: '期別管理', a4: '收單報表',
  a5: '入帳監控', a6: '無主款認領', a7: '玩家查詢', a8: '推廣夥伴',
  a9: '財務', a10: '合約參數', a11: 'Energy 監控', a12: '告警中心', a13: '操作紀錄'
};
function gotoPage(id) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('page-' + id);
  if (el) el.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.page === id);
  });
  document.getElementById('topbar-title').textContent = PAGE_TITLES[id] || id.toUpperCase();
  window.scrollTo(0, 0);
}

/* ── Alert badge + A1 banner ── */
function showAlertBadge(n) {
  const b = document.getElementById('sidebar-alert-badge');
  if (b) { b.textContent = n; b.style.display = n > 0 ? '' : 'none'; }
  const banner = document.getElementById('alert-banner');
  if (banner) {
    banner.style.display = n > 0 ? '' : 'none';
    const msg = banner.querySelector('strong');
    if (msg) msg.textContent = `${n} 個未處理告警`;
  }
}

/* ── Tabs ── */
function switchTab(btn, panelId) {
  const bar = btn.closest('.tab-bar');
  bar.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const parent = bar.nextElementSibling?.parentElement || bar.parentElement;
  parent.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById(panelId);
  if (panel) panel.classList.add('active');
}

/* ── Lang tabs (in modals) ── */
function switchLangTab(btn, prefix) {
  const modal  = btn.closest('.modal');
  const lang   = btn.dataset.lang;
  modal.querySelectorAll('.lang-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  modal.querySelectorAll('.lang-fields').forEach(f => {
    f.style.display = f.dataset.lang === lang ? '' : 'none';
  });
}

/* ── Modals ── */
function openModal(id) {
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}
function openMarqueeModal(mode) {
  document.getElementById('modal-marquee-title').textContent =
    mode === 'edit' ? '編輯跑馬燈' : '新增跑馬燈';
  openModal('modal-marquee');
}
function openAnnounceModal(mode) {
  document.getElementById('modal-announce-title').textContent =
    mode === 'edit' ? '編輯公告' : '新增公告';
  openModal('modal-announce');
}
function openFaqModal(mode) { openModal('modal-faq'); }

function saveMarquee()  { closeModal('modal-marquee');  alert('已儲存（Demo）'); }
function saveAnnounce() { closeModal('modal-announce'); alert('已儲存（Demo）'); }
function saveFaq()      { closeModal('modal-faq');      alert('已儲存（Demo）'); }

/* close modal on backdrop click */
document.querySelectorAll('.modal-backdrop').forEach(bd => {
  bd.addEventListener('click', e => { if (e.target === bd) bd.classList.remove('open'); });
});

/* ── A7 玩家查詢 ── */
let _a7IsBlacklisted = false;

function showPlayerResult() {
  const input = document.getElementById('player-search-input').value.trim();
  if (!input) { alert('請輸入錢包地址'); return; }
  document.getElementById('player-result').style.display = 'block';
  _a7IsBlacklisted = false;
  _a7UpdateBlacklistUI();
}

function _a7UpdateBlacklistUI() {
  const dot   = document.getElementById('a7-blacklist-dot');
  const label = document.getElementById('a7-blacklist-label');
  const addBtn = document.getElementById('a7-add-blacklist-btn');
  const rmBtn  = document.getElementById('a7-remove-blacklist-btn');
  if (_a7IsBlacklisted) {
    dot.className = 'dot dot-red';
    label.textContent = '黑名單中';
    label.style.color = 'var(--red)';
    addBtn.style.display = 'none';
    rmBtn.style.display  = '';
  } else {
    dot.className = 'dot dot-green';
    label.textContent = '正常';
    label.style.color = 'var(--green)';
    addBtn.style.display = '';
    rmBtn.style.display  = 'none';
  }
}

function a7AddBlacklist() {
  if (confirm('確認將此地址加入黑名單？僅禁止下新注，不凍結既有餘額。此操作產生待簽交易。')) {
    _a7IsBlacklisted = true;
    _a7UpdateBlacklistUI();
    confirmPendingTx(null, '加入黑名單');
  }
}

function a7RemoveBlacklist() {
  if (confirm('確認解除此地址的黑名單？此操作產生待簽交易。')) {
    _a7IsBlacklisted = false;
    _a7UpdateBlacklistUI();
    confirmPendingTx(null, '解除黑名單');
  }
}

function a7ChangePeriod(drawNo) {
  alert(`切換至第 ${drawNo} 期（Demo）\n/* 實際會 GET /admin/api/player/tickets?address=…&drawNo=${drawNo} */`);
}

/* ── A3 期別管理 ── */
const _a3OracleData = {
  '115000247': {
    numbers: [7, 15, 22, 24, 32],
    status: 'settled',
    oracles: [
      { id: '#1（主）', reportedAt: '2026-10-06 20:32:15', numbers: [7, 15, 22, 24, 32], match: true },
      { id: '#2（備）', reportedAt: '2026-10-06 20:32:18', numbers: [7, 15, 22, 24, 32], match: true },
      { id: '#3（備）', reportedAt: '2026-10-06 20:32:21', numbers: [7, 15, 22, 24, 32], match: true }
    ]
  },
  '115000246': {
    numbers: [3, 9, 16, 28, 39],
    status: 'settled',
    oracles: [
      { id: '#1（主）', reportedAt: '2026-10-05 20:31:44', numbers: [3, 9, 16, 28, 39], match: true },
      { id: '#2（備）', reportedAt: '2026-10-05 20:31:49', numbers: [3, 9, 16, 28, 39], match: true },
      { id: '#3（備）', reportedAt: '2026-10-05 20:31:52', numbers: [3, 9, 16, 28, 39], match: true }
    ]
  },
  '115000245': {
    numbers: [11, 20, 25, 31, 37],
    status: 'disputed',
    oracles: [
      { id: '#1（主）', reportedAt: '2026-10-04 20:30:55', numbers: [11, 20, 25, 31, 37], match: true },
      { id: '#2（備）', reportedAt: '2026-10-04 20:30:58', numbers: [11, 20, 25, 31, 37], match: true },
      { id: '#3（備）', reportedAt: '2026-10-04 20:31:03', numbers: [11, 20, 25, 31, 36], match: false }
    ]
  }
};

function openA3OracleModal(drawNo) {
  const data = _a3OracleData[drawNo];
  if (!data) return;
  const isDisputed = data.status === 'disputed';

  document.getElementById('modal-a3-oracle-title').textContent = isDisputed ? '爭議裁定' : '查看開獎結果';
  document.getElementById('a3-oracle-drawno').textContent = `539 第 ${drawNo} 期`;

  const numsEl = document.getElementById('a3-oracle-numbers');
  numsEl.innerHTML = data.numbers.map(n =>
    `<span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;background:var(--gold);color:#111;font-weight:700;font-size:14px;">${n}</span>`
  ).join('');

  const tbody = document.getElementById('a3-oracle-tbody');
  tbody.innerHTML = data.oracles.map(o => {
    const matchIcon = o.match === true
      ? '<span style="color:var(--green);">✓ 符合</span>'
      : o.match === false
        ? '<span style="color:var(--red);">✗ 不符</span>'
        : '<span style="color:var(--text-faint);">— 未回報</span>';
    const numsHtml = o.numbers.map((n, i) => {
      const ok = n === data.numbers[i];
      return `<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:${ok ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.20)'};color:${ok ? 'var(--green)' : 'var(--red)'};font-size:12px;font-weight:600;">${n}</span>`;
    }).join('');
    return `<tr style="border-bottom:1px solid var(--border);">
      <td style="padding:8px 6px;">${o.id}</td>
      <td style="padding:8px 6px; color:var(--text-muted); font-size:12px;">${o.reportedAt}</td>
      <td style="padding:8px 6px;"><div style="display:flex;gap:4px;flex-wrap:wrap;">${numsHtml}</div></td>
      <td style="padding:8px 6px; text-align:center;">${matchIcon}</td>
    </tr>`;
  }).join('');

  document.getElementById('a3-dispute-section').style.display = isDisputed ? 'block' : 'none';
  document.getElementById('a3-close-section').style.display   = isDisputed ? 'none'  : 'flex';

  if (isDisputed) {
    document.getElementById('a3-dispute-reason').innerHTML =
      '<i class="fa-solid fa-triangle-exclamation" style="color:var(--red);margin-right:6px;"></i>' +
      '預言機 #3 回報號碼與其他兩台不一致，期別目前處於爭議中。請裁定是否維持現有多數結果。';
  }

  openModal('modal-a3-oracle');
}

function a3DisputeAccept() {
  confirmPendingTx('modal-a3-oracle', '爭議裁定 — 維持現有結果（accept: true）');
}
function a3DisputeReject() {
  confirmPendingTx('modal-a3-oracle', '爭議裁定 — 否決，要求預言機重新提交（accept: false）');
}

let _a3PostponeDrawNo = '';
function openA3PostponeModal(drawNo) {
  _a3PostponeDrawNo = drawNo;
  document.getElementById('a3-postpone-drawno').textContent = `539 第 ${drawNo} 期`;
  document.getElementById('a3-postpone-time').value = '';
  openModal('modal-a3-postpone');
}
function submitA3Postpone() {
  const t = document.getElementById('a3-postpone-time').value;
  if (!t) { alert('請選擇新截止時間'); return; }
  confirmPendingTx('modal-a3-postpone', `延期 539 第 ${_a3PostponeDrawNo} 期 → ${t}`);
}

/* ── A5 入帳監控 ── */
function openA5PausedModal()  { openModal('modal-a5-pause'); }
function openA5ReplaceModal() { openModal('modal-a5-replace'); }
function openA5ManualRegisterModal() { openModal('modal-a5-manual-register'); }
function submitA5ManualRegister() {
  const txHash  = document.getElementById('a5-mr-txhash').value.trim();
  const drawNo  = document.getElementById('a5-mr-drawno').value.trim();
  const address = document.getElementById('a5-mr-address').value.trim();
  const numbers = document.getElementById('a5-mr-numbers').value.trim();
  if (!txHash || !drawNo || !address || !numbers) { alert('請填寫所有欄位'); return; }
  confirmPendingTx('modal-a5-manual-register', `代為入帳 第 ${drawNo} 期 — ${address.slice(0,8)}…`);
}

/* ── A10 合約參數 ── */
let _a10GlobalOn = true;
let _a10AddressType = 'scheduler';
let _a10ParamKey = '';

function toggleA10Global() {
  const title  = _a10GlobalOn ? '確認停收新注' : '確認恢復收單';
  const body   = _a10GlobalOn
    ? '<i class="fa-solid fa-triangle-exclamation" style="color:var(--red);margin-right:6px;"></i>停收後前台立即顯示「暫停下注」橫幅，所有新注單請求將被拒絕。此操作產生待簽交易。'
    : '<i class="fa-solid fa-circle-info" style="color:var(--green);margin-right:6px;"></i>恢復後前台立即移除暫停橫幅，恢復接受新注單。此操作產生待簽交易。';
  const btnCls = _a10GlobalOn ? 'btn btn-danger' : 'btn btn-gold';
  document.getElementById('modal-a10-global-title').textContent = title;
  document.getElementById('modal-a10-global-body').innerHTML   = body;
  const btn = document.getElementById('a10-global-confirm-btn');
  btn.className = btnCls;
  btn.innerHTML = '<i class="fa-solid fa-file-signature"></i> 產生待簽交易';
  openModal('modal-a10-global');
}
function cancelA10Global() {
  /* revert toggle visually */
  const tog = document.getElementById('a10-global-toggle');
  tog.classList.toggle('on', _a10GlobalOn);
  closeModal('modal-a10-global');
}
function confirmA10Global() {
  _a10GlobalOn = !_a10GlobalOn;
  const tog = document.getElementById('a10-global-toggle');
  tog.classList.toggle('on', _a10GlobalOn);
  document.getElementById('a10-global-status').textContent  = _a10GlobalOn ? '收單中' : '已停收';
  document.getElementById('a10-global-status').style.color  = _a10GlobalOn ? 'var(--green)' : 'var(--red)';
  confirmPendingTx('modal-a10-global', _a10GlobalOn ? '恢復收單' : '全局停收新注');
}

let _a10PoolAction = 'disable';
let _a10PoolName   = '';
function openA10PoolModal(pool, action) {
  _a10PoolAction = action;
  _a10PoolName   = pool;
  const isDisable = action === 'disable';
  document.getElementById('modal-a10-pool-title').textContent = isDisable ? `停用 ${pool} 彩金桶` : `啟用 ${pool} 彩金桶`;
  const btn  = document.getElementById('a10-pool-confirm-btn');
  btn.className = isDisable ? 'btn btn-danger' : 'btn btn-gold';
  const body = document.getElementById('modal-a10-pool-body');
  if (isDisable) {
    body.style.background = 'rgba(239,68,68,0.08)';
    body.style.border     = '1px solid rgba(239,68,68,0.20)';
    body.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color:var(--red);margin-right:6px;"></i>停用後前台該彩金桶將停止接受新注，現有期別不受影響。此操作產生待簽交易。';
  } else {
    body.style.background = 'rgba(34,197,94,0.08)';
    body.style.border     = '1px solid rgba(34,197,94,0.20)';
    body.innerHTML = '<i class="fa-solid fa-circle-info" style="color:var(--green);margin-right:6px;"></i>啟用後前台恢復接受該彩金桶下注。此操作產生待簽交易。';
  }
  openModal('modal-a10-pool');
}
function confirmA10Pool() {
  const label = _a10PoolAction === 'disable' ? `停用 ${_a10PoolName} 彩金桶` : `啟用 ${_a10PoolName} 彩金桶`;
  confirmPendingTx('modal-a10-pool', label);
}

function openA10ParamModal(name, key, current) {
  _a10ParamKey = key;
  document.getElementById('a10-param-name-display').value = name;
  document.getElementById('a10-param-current').value      = current;
  document.getElementById('a10-param-new').value          = '';
  openModal('modal-a10-param');
}
function submitA10Param() {
  const val = document.getElementById('a10-param-new').value.trim();
  if (!val) { alert('請輸入新值'); return; }
  const name = document.getElementById('a10-param-name-display').value;
  confirmPendingTx('modal-a10-param', `修改合約參數「${name}」→ ${val}`);
}

function openA10AddressModal(type) {
  _a10AddressType = type;
  const isOracle = type === 'oracle';
  document.getElementById('modal-a10-address-title').textContent = isOracle ? '更換預言機簽名者' : '更換排程服務錢包';
  document.getElementById('modal-a10-address-warning').style.display = isOracle ? 'block' : 'none';
  document.getElementById('modal-a10-oracle-select').style.display   = isOracle ? 'block' : 'none';
  document.getElementById('a10-new-address').value = '';
  openModal('modal-a10-address');
}
function submitA10Address() {
  const addr = document.getElementById('a10-new-address').value.trim();
  if (!addr) { alert('請輸入新地址'); return; }
  const label = _a10AddressType === 'oracle'
    ? `更換預言機 #${Number(document.getElementById('a10-oracle-index').value)+1} 簽名者（48小時後生效）`
    : '更換排程服務錢包';
  confirmPendingTx('modal-a10-address', label);
}

function openA10DepositLimitModal() {
  const val = document.getElementById('a10-deposit-limit').value.trim();
  if (!val || isNaN(val) || Number(val) < 1) { alert('請輸入有效數字'); return; }
  confirmPendingTx(null, `設定入帳上限 → ${Number(val).toLocaleString()} 筆/期`);
}

/* ── A12 告警中心 ── */
function filterA12(status) {
  ['all', 'open', 'closed'].forEach(s => {
    const btn = document.getElementById('a12-filter-' + s);
    btn.style.borderColor = s === status ? 'var(--border-gold)' : '';
    btn.style.color       = s === status ? 'var(--gold)' : '';
  });
  document.querySelectorAll('#a12-table tbody tr').forEach(row => {
    row.style.display = (status === 'all' || row.dataset.status === status) ? '' : 'none';
  });
}
function markA12Alert(btn) {
  const row = btn.closest('tr');
  row.dataset.status = 'closed';
  const badge = row.querySelector('.badge-status');
  badge.className = 'badge-status badge-live';
  badge.textContent = '已處理';
  btn.disabled = true;
  btn.style.opacity = '0.4';
  btn.textContent = '已處理';
}

/* ── A13 操作紀錄 ── */
function filterA13() {
  const operator = document.getElementById('a13-filter-operator').value;
  const action   = document.getElementById('a13-filter-action').value;
  const from     = document.getElementById('a13-filter-from').value;
  const to       = document.getElementById('a13-filter-to').value;
  document.querySelectorAll('#page-a13 tbody tr').forEach(row => {
    const cells = row.querySelectorAll('td');
    const rowDate     = cells[0] ? cells[0].textContent.slice(0, 10) : '';
    const rowOperator = cells[1] ? cells[1].textContent.trim() : '';
    const rowAction   = cells[2] ? cells[2].textContent.trim() : '';
    const matchOp  = !operator || rowOperator === operator;
    const matchAct = !action   || rowAction.includes(action);
    const matchFrom = !from || rowDate >= from;
    const matchTo   = !to   || rowDate <= to;
    row.style.display = (matchOp && matchAct && matchFrom && matchTo) ? '' : 'none';
  });
}

/* ── A11 Energy 監控 ── */
function saveA11Threshold() {
  const val = document.getElementById('a11-threshold').value.trim();
  if (!val || isNaN(val) || Number(val) < 0) { alert('請輸入有效數字'); return; }
  alert(`告警門檻已更新為 ${Number(val).toLocaleString()} Energy\n\n（Demo 模式，實際會 PUT /admin/api/energy/threshold）`);
}

/* ── A9 財務 ── */
let _a9TxAction = 'deposit';
function openA9TxModal(action) {
  _a9TxAction = action;
  const isDeposit = action === 'deposit';
  document.getElementById('modal-a9-tx-title').textContent   = isDeposit ? '平台注資' : '平台提款';
  document.getElementById('modal-a9-amount-label').textContent = isDeposit ? '注資金額（USDT）' : '提款金額（USDT）';
  document.getElementById('a9-tx-amount').value = '';
  document.getElementById('a9-tx-note').value   = '';
  const warn = document.getElementById('modal-a9-tx-warning');
  if (isDeposit) {
    warn.style.background = 'rgba(196,154,42,0.08)';
    warn.style.border     = '1px solid rgba(196,154,42,0.20)';
    warn.innerHTML = '<i class="fa-solid fa-circle-info" style="color:var(--gold);margin-right:6px;"></i>注資需由平台錢包轉入合約，此操作將產生待簽交易。';
  } else {
    warn.style.background = 'rgba(239,68,68,0.08)';
    warn.style.border     = '1px solid rgba(239,68,68,0.20)';
    warn.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color:var(--red);margin-right:6px;"></i>提款後平台戶餘額減少，請確認安全緩衝倍數仍在警戒線以上。';
  }
  openModal('modal-a9-tx');
}
function submitA9Tx() {
  const amt = document.getElementById('a9-tx-amount').value.trim();
  if (!amt || isNaN(amt) || Number(amt) <= 0) {
    alert('請輸入有效金額'); return;
  }
  const label = _a9TxAction === 'deposit' ? '平台注資' : '平台提款';
  confirmPendingTx('modal-a9-tx', `${label} ${Number(amt).toLocaleString()} USDT`);
}
function a9Query()          { alert('查詢完成（Demo）'); /* 實際會重新 GET /admin/api/finance/pnl */ }
function a9Export(format)   { alert(`匯出 ${format.toUpperCase()}（Demo）`); }

/* ── A8 推廣夥伴 ── */
function toggleA8Row(row) {
  const section = row.nextElementSibling;
  if (!section || !section.classList.contains('a8-downline-section')) return;
  const icon = row.querySelector('i.fa-solid');
  const isOpen = section.style.display !== 'none';
  section.style.display = isOpen ? 'none' : '';
  if (icon) icon.style.transform = isOpen ? '' : 'rotate(90deg)';
}
function a8Search() {
  const q = document.getElementById('a8-search-input').value.trim().toLowerCase();
  document.querySelectorAll('#a8-tbody .a8-partner-row').forEach(row => {
    const addr = row.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
    const isTopLevel = row.closest('table') === document.getElementById('a8-table');
    if (!isTopLevel) return;
    const section = row.nextElementSibling;
    row.style.display = (!q || addr.includes(q)) ? '' : 'none';
    if (section) section.style.display = 'none';
  });
}
function a8Reset() {
  document.getElementById('a8-search-input').value = '';
  document.querySelectorAll('#a8-tbody tr').forEach(r => r.style.display = '');
}

/* ── A6 無主款認領 ── */
function openA6ClaimModal(txHash, amount) {
  document.getElementById('a6-claim-txhash').value = txHash;
  document.getElementById('a6-claim-amount').value = amount + ' USDT';
  document.getElementById('a6-claim-address').value = '';
  document.getElementById('a6-claim-sig').value = '';
  document.getElementById('a6-verify-result').style.display = 'none';
  document.getElementById('a6-confirm-btn').disabled = true;
  document.getElementById('a6-confirm-btn').style.opacity = '0.4';
  openModal('modal-a6-claim');
}
function openA6ConfirmModal(txHash, amount, address) {
  document.getElementById('a6-confirm-txhash').textContent = txHash;
  document.getElementById('a6-confirm-amount').textContent = amount + ' USDT';
  document.getElementById('a6-confirm-address').textContent = address;
  openModal('modal-a6-confirm');
}
function openA6CleanupModal(txHash, amount) {
  document.getElementById('a6-cleanup-txhash').textContent = txHash;
  document.getElementById('a6-cleanup-amount').textContent = amount + ' USDT';
  openModal('modal-a6-cleanup');
}
function simulateVerifySig() {
  const addr = document.getElementById('a6-claim-address').value.trim();
  const sig  = document.getElementById('a6-claim-sig').value.trim();
  const el   = document.getElementById('a6-verify-result');
  const btn  = document.getElementById('a6-confirm-btn');
  if (!addr || !sig) {
    el.style.display = 'block';
    el.style.background = 'rgba(239,68,68,0.08)';
    el.style.border = '1px solid rgba(239,68,68,0.20)';
    el.innerHTML = '<i class="fa-solid fa-xmark" style="color:var(--red);margin-right:6px;"></i>請填入錢包地址與簽名';
    return;
  }
  /* Demo：模擬驗簽通過 */
  el.style.display = 'block';
  el.style.background = 'rgba(34,197,94,0.08)';
  el.style.border = '1px solid rgba(34,197,94,0.20)';
  el.innerHTML = '<i class="fa-solid fa-shield-halved" style="color:var(--green);margin-right:6px;"></i>簽名驗證通過，地址與簽名相符';
  btn.disabled = false;
  btn.style.opacity = '1';
}
function a6ClaimVerified() {
  closeModal('modal-a6-claim');
  alert('申請已送出（Demo）\n\n實際流程：後端驗簽通過後，由管理員在「確認認領」步驟產生待簽交易。');
}

/* ── 待簽交易通用確認 ── */
function confirmPendingTx(modalId, actionName) {
  if (modalId) closeModal(modalId);
  alert(`已產生待簽交易：「${actionName}」\n\n請通知管理多簽簽署人至錢包確認並送出。\n（Demo 模式，實際會寫入 A13 操作紀錄）`);
}

/* ── A2 FAQ 拖曳排序 ── */
(function initFaqDrag() {
  const tbody = document.getElementById('faq-list');
  if (!tbody) return;
  let dragging = null;
  tbody.addEventListener('dragstart', e => {
    dragging = e.target.closest('tr');
    if (dragging) dragging.style.opacity = '0.45';
  });
  tbody.addEventListener('dragend', () => {
    if (dragging) { dragging.style.opacity = ''; dragging = null; }
  });
  tbody.addEventListener('dragover', e => {
    e.preventDefault();
    const target = e.target.closest('tr');
    if (!target || target === dragging) return;
    const rect = target.getBoundingClientRect();
    if (e.clientY < rect.top + rect.height / 2) {
      tbody.insertBefore(dragging, target);
    } else {
      tbody.insertBefore(dragging, target.nextSibling);
    }
  });
})();
