/* ============================================================
   IKL TICKET HUB — app.js (Admin Panel)
   Fitur: Tambah, Edit, Hapus tiket pertandingan IKL Season 2025
   ============================================================ */

'use strict';

// ─────────────────────────────────────────────
// HARGA DEFAULT per kategori
// ─────────────────────────────────────────────
const PRICES = { Mythic: 500000, Legend: 250000, Epic: 100000 };

// ─────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────
let tickets = [];
let editingId = null;
let toastTimer = null;

// ─────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const formatRupiah = (n) =>
  'Rp ' + Number(n).toLocaleString('id-ID');

const generateId = () =>
  'IKL-' + Date.now().toString(36).toUpperCase().slice(-6);

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ─────────────────────────────────────────────
// LOCAL STORAGE
// ─────────────────────────────────────────────
const LS_KEY = 'ikl_tickets_v2';

const saveToStorage = () => localStorage.setItem(LS_KEY, JSON.stringify(tickets));

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    tickets = raw ? JSON.parse(raw) : getDefaultTickets();
  } catch {
    tickets = getDefaultTickets();
  }
};

const getDefaultTickets = () => [
  { id: 'IKL-A1B2C3', name: 'LeBron James', match: 'Kagendra vs Bigetron by Vitality', category: 'Mythic', qty: 2, price: 500000, date: '2025-04-20' },
  { id: 'IKL-D4E5F6', name: 'Luka Dončić', match: 'RRQ vs ONIC Esports', category: 'Legend', qty: 3, price: 250000, date: '2025-04-21' },
  { id: 'IKL-G7H8I9', name: 'Giannis Antetokounmpo', match: 'Alter Ego vs Dominator Esports', category: 'Epic', qty: 4, price: 100000, date: '2025-04-21' },
  { id: 'IKL-J0K1L2', name: 'Stephen Curry', match: 'Bigetron by Vitality vs ONIC Esports', category: 'Mythic', qty: 1, price: 500000, date: '2025-04-22' },
  { id: 'IKL-M3N4O5', name: 'Anthony Edwards', match: 'Kagendra vs RRQ', category: 'Legend', qty: 2, price: 250000, date: '2025-04-22' },
  { id: 'IKL-P6Q7R8', name: 'Shai Gilgeous-Alexander', match: 'Talon ID vs Mahadewa', category: 'Epic', qty: 4, price: 100000, date: '2025-04-23' },
  { id: 'IKL-S9T0U1', name: 'Victor Wembanyama', match: 'Kagendra vs Bigetron by Vitality', category: 'Mythic', qty: 1, price: 500000, date: '2025-04-23' },
  { id: 'IKL-V2W3X4', name: 'Jayson Tatum', match: 'Vesakha vs Team Nemesis', category: 'Epic', qty: 3, price: 100000, date: '2025-04-24' },
  { id: 'IKL-Y5Z6A7', name: 'Nikola Jokić', match: 'Dominator Esports vs Mahadewa', category: 'Legend', qty: 2, price: 250000, date: '2025-04-24' },
  { id: 'IKL-B8C9D0', name: 'Devin Booker', match: 'RRQ vs ONIC Esports', category: 'Mythic', qty: 2, price: 500000, date: '2025-04-25' },
];

// ─────────────────────────────────────────────
// RENDER: STATISTIK
// ─────────────────────────────────────────────
const renderStats = () => {
  const totalQty = tickets.reduce((s, t) => s + Number(t.qty), 0);
  const totalRevenue = tickets.reduce((s, t) => s + Number(t.qty) * Number(t.price), 0);
  const lowStock = tickets.filter(t => Number(t.qty) < 5).length;

  animateCounter('total-tickets', totalQty);
  animateCounter('low-stock-count', lowStock);
  animateCounter('total-transactions', tickets.length);
  const revEl = $('#total-revenue');
  if (revEl) revEl.textContent = formatRupiah(totalRevenue);
};

const animateCounter = (id, target) => {
  const el = document.getElementById(id);
  if (!el) return;
  const start = parseInt(el.textContent) || 0;
  const step = Math.ceil(Math.abs(target - start) / 20) || 1;
  let val = start;
  const iv = setInterval(() => {
    val = val < target ? Math.min(val + step, target) : Math.max(val - step, target);
    el.textContent = val;
    if (val === target) clearInterval(iv);
  }, 30);
};

// ─────────────────────────────────────────────
// RENDER: TABEL DATA TIKET
// ─────────────────────────────────────────────
const getFiltered = () => {
  const q = ($('#search-input')?.value || '').toLowerCase().trim();
  const cats = [...$$('.filter-cb:checked')].map(cb => cb.value);
  return tickets.filter(t => {
    const matchQ = !q || t.name.toLowerCase().includes(q) || t.match.toLowerCase().includes(q);
    const matchC = cats.includes(t.category);
    return matchQ && matchC;
  });
};

const renderTable = () => {
  const filtered = getFiltered();
  const tbody = $('#ticket-tbody');
  const emptyState = $('#empty-state');
  const countLabel = $('#row-count-label');

  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    if (countLabel) countLabel.textContent = 'Tidak ada data yang cocok';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (countLabel) countLabel.textContent =
    `Menampilkan ${filtered.length} dari ${tickets.length} data`;

  const icoEdit = `<svg class="ico" viewBox="0 0 24 24" style="width:12px;height:12px"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
  const icoDel = `<svg class="ico" viewBox="0 0 24 24" style="width:12px;height:12px"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;
  const icoWarn = `<svg class="ico" viewBox="0 0 24 24" style="width:11px;height:11px;stroke:var(--ikl-red)"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

  tbody.innerHTML = filtered.map((t, idx) => {
    const total = Number(t.qty) * Number(t.price);
    const isLow = Number(t.qty) < 5;
    return `
      <tr class="${isLow ? 'low-stock-row' : ''}" data-id="${t.id}">
        <td class="col-num">${String(idx + 1).padStart(2, '0')}</td>
        <td>${t.name}</td>
        <td class="col-match">${t.match}</td>
        <td><span class="badge ${t.category.toLowerCase()}">${t.category}</span></td>
        <td class="col-center ${isLow ? 'low-stock' : ''}">${t.qty}${isLow ? ` ${icoWarn}` : ''}</td>
        <td class="col-mono">${formatRupiah(t.price)}</td>
        <td class="ticket-total">${formatRupiah(total)}</td>
        <td class="col-mono" style="white-space:nowrap">${formatDate(t.date)}</td>
        <td>
          <div class="action-btns">
            <button class="btn-edit" data-action="edit" data-id="${t.id}" aria-label="Edit tiket ${t.id}">${icoEdit} Edit</button>
            <button class="btn-delete" data-action="delete" data-id="${t.id}" aria-label="Hapus tiket ${t.id}">${icoDel} Hapus</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  renderStats();
};

// ─────────────────────────────────────────────
// VALIDASI FORM
// ─────────────────────────────────────────────
const clearErrors = () => {
  $$('.error-msg').forEach(el => { el.textContent = ''; });
  $$('.input-error').forEach(el => el.classList.remove('input-error'));
};

const setError = (inputId, errId, msg) => {
  const el = document.getElementById(inputId);
  const errEl = document.getElementById(errId);
  if (el) el.classList.add('input-error');
  if (errEl) errEl.textContent = msg;
};

const validateForm = () => {
  clearErrors();
  let ok = true;

  const name = $('#buyer-name').value.trim();
  const match = $('#match-select').value;
  const category = $('#category-select').value;
  const qty = parseInt($('#ticket-qty').value);
  const date = $('#ticket-date').value;

  if (!name || name.length < 3) {
    setError('buyer-name', 'err-name', 'Nama minimal 3 karakter.'); ok = false;
  }
  if (!match) {
    setError('match-select', 'err-match', 'Pilih pertandingan.'); ok = false;
  }
  if (!category) {
    setError('category-select', 'err-category', 'Pilih kategori.'); ok = false;
  }
  if (isNaN(qty) || qty < 1 || qty > 10) {
    setError('ticket-qty', 'err-qty', 'Jumlah tiket 1 – 10.'); ok = false;
  }
  if (!date) {
    setError('ticket-date', 'err-date', 'Tanggal wajib diisi.'); ok = false;
  }

  return ok;
};

// ─────────────────────────────────────────────
// FORM SUBMIT: ADD / UPDATE
// ─────────────────────────────────────────────
const handleSubmit = (e) => {
  e.preventDefault();
  if (!validateForm()) {
    showToast('Periksa kembali form sebelum menyimpan.', 'error');
    return;
  }

  const category = $('#category-select').value;
  const qty = parseInt($('#ticket-qty').value);
  const price = PRICES[category];

  const data = {
    id: editingId || generateId(),
    name: $('#buyer-name').value.trim(),
    match: $('#match-select').value,
    category,
    qty,
    price,
    date: $('#ticket-date').value,
  };

  if (editingId) {
    const idx = tickets.findIndex(t => t.id === editingId);
    if (idx !== -1) tickets[idx] = data;
    showToast('Tiket berhasil diperbarui.', 'success');
    cancelEdit();
  } else {
    tickets.unshift(data);
    showToast('Tiket berhasil ditambahkan.', 'success');
  }

  saveToStorage();
  resetForm();
  renderTable();
};

const resetForm = () => {
  $('#ticket-form').reset();
  clearErrors();
  editingId = null;
  updateTotalPreview();
};

// ─────────────────────────────────────────────
// TOTAL PREVIEW
// ─────────────────────────────────────────────
const updateTotalPreview = () => {
  const category = $('#category-select').value;
  const qty = parseInt($('#ticket-qty').value) || 0;
  const priceEl = $('#ticket-price');
  const previewEl = $('#total-preview');
  const previewVal = $('#total-preview-value');

  if (category && qty > 0) {
    const price = PRICES[category] || 0;
    if (priceEl) priceEl.value = price;
    if (previewEl) previewEl.style.display = 'flex';
    if (previewVal) previewVal.textContent = formatRupiah(price * qty);
  } else {
    if (priceEl) priceEl.value = '';
    if (previewEl) previewEl.style.display = 'none';
  }
};

// ─────────────────────────────────────────────
// EDIT
// ─────────────────────────────────────────────
const startEdit = (id) => {
  const t = tickets.find(x => x.id === id);
  if (!t) return;

  editingId = id;

  $('#buyer-name').value = t.name;
  $('#match-select').value = t.match;
  $('#category-select').value = t.category;
  $('#ticket-qty').value = t.qty;
  $('#ticket-price').value = t.price;
  $('#ticket-date').value = t.date;

  updateTotalPreview();

  const submitBtn = $('#submit-btn');
  if (submitBtn) submitBtn.innerHTML = `<svg class="ico" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Simpan Perubahan`;

  const cancelBtn = $('#cancel-edit-btn');
  if (cancelBtn) cancelBtn.style.display = 'inline-flex';

  const titleEl = $('#form-title');
  if (titleEl) titleEl.textContent = 'Edit Tiket';

  const subEl = $('#form-subtitle');
  if (subEl) subEl.textContent = `Mengedit data: ${t.name} — ${t.match}`;

  const section = $('#form-section');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    section.classList.add('edit-mode');
    setTimeout(() => section.classList.remove('edit-mode'), 800);
  }

  showToast(`Mode edit aktif — ${t.name}`, 'warning');
};

const cancelEdit = () => {
  editingId = null;
  resetForm();

  const submitBtn = $('#submit-btn');
  if (submitBtn) submitBtn.innerHTML = `<svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> Tambah Tiket`;

  const cancelBtn = $('#cancel-edit-btn');
  if (cancelBtn) cancelBtn.style.display = 'none';

  const titleEl = $('#form-title');
  if (titleEl) titleEl.textContent = 'Tambah Tiket';

  const subEl = $('#form-subtitle');
  if (subEl) subEl.textContent = 'Isi data tiket pertandingan yang akan ditambahkan';
};

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────
const deleteTicket = (id) => {
  const t = tickets.find(x => x.id === id);
  if (!t) return;

  if (!window.confirm(
    `Hapus Tiket\n\nNama   : ${t.name}\nMatch  : ${t.match}\nKateg. : ${t.category} × ${t.qty}\n\nData tidak dapat dikembalikan. Lanjutkan?`
  )) {
    showToast('Penghapusan dibatalkan.', 'warning');
    return;
  }

  tickets = tickets.filter(x => x.id !== id);
  saveToStorage();
  renderTable();
  showToast(`Tiket ${t.name} berhasil dihapus.`, 'success');
};

// ─────────────────────────────────────────────
// EVENT DELEGATION — TABLE
// ─────────────────────────────────────────────
const initTableDelegation = () => {
  const tbody = $('#ticket-tbody');
  if (!tbody) return;
  tbody.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (action === 'edit') startEdit(id);
    if (action === 'delete') deleteTicket(id);
  });
};

// ─────────────────────────────────────────────
// SEARCH & FILTER
// ─────────────────────────────────────────────
const initFilterSearch = () => {
  const searchEl = $('#search-input');
  if (searchEl) searchEl.addEventListener('input', renderTable);

  $$('.filter-cb').forEach(cb => cb.addEventListener('change', renderTable));

  const resetBtn = $('#reset-filter-btn');
  if (resetBtn) resetBtn.addEventListener('click', () => {
    $$('.filter-cb').forEach(cb => { cb.checked = true; });
    if (searchEl) searchEl.value = '';
    renderTable();
    showToast('Filter direset.', 'success');
  });
};

// ─────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────
const showToast = (message, type = 'success') => {
  const toast = $('#toast');
  const msgEl = $('#toast-msg');
  if (msgEl) msgEl.textContent = message;
  toast.className = `show ${type}`;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.className = ''; }, 3500);
};

// ─────────────────────────────────────────────
// NAV SCROLL
// ─────────────────────────────────────────────
const initNavScroll = () => {
  const header = $('header');
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);

    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 130) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }, { passive: true });
};

// ─────────────────────────────────────────────
// MOBILE MENU
// ─────────────────────────────────────────────
const initMobileMenu = () => {
  const toggle = $('#menu-toggle');
  const nav = $('nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
  });
  $$('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
    });
  });
};

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
const init = () => {
  loadFromStorage();
  renderTable();
  renderStats();

  // Set default date = today
  const today = new Date().toISOString().split('T')[0];
  const dateEl = $('#ticket-date');
  if (dateEl) { dateEl.value = today; dateEl.max = today; }

  // Form events
  const form = $('#ticket-form');
  if (form) form.addEventListener('submit', handleSubmit);

  const cancelBtn = $('#cancel-edit-btn');
  if (cancelBtn) cancelBtn.addEventListener('click', cancelEdit);

  // Auto-harga & preview
  const catSel = $('#category-select');
  const qtyEl = $('#ticket-qty');
  if (catSel) catSel.addEventListener('change', updateTotalPreview);
  if (qtyEl) qtyEl.addEventListener('input', updateTotalPreview);

  initTableDelegation();
  initFilterSearch();
  initNavScroll();
  initMobileMenu();

  console.log('%c⚙ IKL Ticket Hub Admin Loaded!', 'color:#C0281A;font-weight:bold;font-size:14px;');
};

document.addEventListener('DOMContentLoaded', init);
